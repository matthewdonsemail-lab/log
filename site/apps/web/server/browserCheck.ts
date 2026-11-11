import { randomUUID } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { launchOutcome } from './browserLaunch'
import { browserProviderConfig } from './browserProvider'
import { readLocalAccountRows } from '../../../../src/twenty/graphql/helpers/localAccountRows'
import { browserFor } from '../../../../src/browser/driver/client'
import { pageStateOf, resolveCallOf } from '../../../../src/browser/flow/helpers/pageState'
import type { BrowserCheckView, BrowserOperation } from '../shared/browserCheck'

type Account = { id: string; name: string; platform: string; status: string; statusReason?: string | null; state: string; lastCheck?: { state: string; checkedAt: string; launchOutcome?: ReturnType<typeof launchOutcome> } | null; checkedAt: string | null }
type RpcResult = { isError?: boolean; structuredContent?: Record<string, unknown> }
type Runtime = { catalogCall: (id: string, inputs: Record<string, unknown>, live?: boolean) => Promise<RpcResult>; toolCall: (name: string, inputs: Record<string, unknown>) => Promise<RpcResult> }
type Owner = { account: string; runDir: string; pid: number; startedAt: string; messengerPin?: boolean; repliesPath: string }
type Descriptor = { port: number; token: string; generation: string; pid: number }
type LiveState = { url?: string; historyLength?: number; generation: string; revision: string; state: string; blocked: boolean; inputAllowed: boolean; busy: boolean }
type Lease = { id: string; accountId: string; owner: Owner; descriptor: Descriptor; expiresAt: number; proof: { revision: string; step: string; at: number } | null; stopped: boolean; pending: boolean }

function readJson<T>(path: string): T | null { try { return JSON.parse(readFileSync(path, 'utf8')) as T } catch { return null } }
function alive(pid: number) { if (!Number.isSafeInteger(pid) || pid <= 0) return false; try { process.kill(pid, 0); return true } catch (error) { return (error as { code?: string }).code === 'EPERM' } }
function ownerOf(account: Account): Owner | null {
  const path = process.env.LOG_INSPECT_CURRENT || join(homedir(), '.logCli', 'runs', 'inspect', 'current.json')
  const session = readJson<Owner>(join(dirname(path), 'sessions', `${account.name.replace(/[^A-Za-z0-9_.-]/g, '_')}.json`)) ?? readJson<Owner>(path)
  return session?.account === account.name && typeof session.runDir === 'string' && typeof session.repliesPath === 'string' && alive(session.pid) ? session : null
}
function recorded(owner: Owner) {
  const lines = existsSync(owner.repliesPath) ? readFileSync(owner.repliesPath, 'utf8').trim().split('\n') : []
  let reply: { step?: string; url?: string; ok?: boolean } | null = null
  for (const line of lines.reverse()) { try { const result = JSON.parse(line).result; if (typeof result?.step === 'string') { reply = result; break } } catch {} }
  const step = reply?.step && /^\d+_[A-Za-z0-9]+$/.test(reply.step) ? reply.step : null
  const folder = step ? join(owner.runDir, 'steps', step) : null
  let text = ''
  try { if (folder) text = readFileSync(join(folder, 'snapshot.yml'), 'utf8') } catch {}
  const exchanges = folder ? readJson<import('../../../../src/subq/stepReading/types').StepExchange[]>(join(folder, 'exchanges.json')) ?? [] : []
  const state = pageStateOf(reply?.url ?? '', text, { messengerPin: owner.messengerPin, exchanges })
  const next = state ? resolveCallOf(state, { account: owner.account, text, messengerPin: owner.messengerPin, exchanges }) : null
  return { url: reply?.url ?? null, step, state, next, failed: reply?.ok === false, exchanges, folder }
}

export function createBrowserCheck(runtime: Runtime, keepOutcome: (id: string, state: string, outcome?: ReturnType<typeof launchOutcome>) => void) {
  const leases = new Map<string, Lease>()
  const closing = new Map<string, Promise<BrowserCheckView>>()
  const provisioning = new Map<string, Promise<BrowserCheckView>>()
  const proxyMs = 5000
  const goal = 'Confirm from the recorded platform requests and answers that this account browser session is authenticated and its blocking check is resolved. An unresolved check, checkpoint, restriction or unconfirmed session is not success.'
  const setupFailures = new Map<string, { country: string; allowed: string } | null>()
  function previousSetupFailure(account: Account) {
    if (account.lastCheck?.state !== 'stopped') return null
    const key = `${account.id}:${account.lastCheck.checkedAt}`
    if (setupFailures.has(key)) return setupFailures.get(key) ?? null
    let found: { country: string; allowed: string } | null = null
    try {
      const at = Date.parse(account.lastCheck.checkedAt)
      const path = join(process.env.LOG_MCP_DIR || join(homedir(), '.logCli', 'mcp'), `${account.lastCheck.checkedAt.slice(0, 10)}.log`)
      const lines = readFileSync(path, 'utf8').split('\n').filter((line) => {
        const time = Date.parse(line.slice(0, 24))
        return time <= at && at - time < 2000
      })
      const exact = lines.find((line) => line.includes(`adsPower err    | adsPower 1/1 ${account.name}: skip (`))
      const match = exact?.match(/: skip \(home ([A-Z]{2}) is not in ([A-Z, ]+)\)/)
      const completed = lines.some((line) => line.includes('adsPower out    | ■ exit 0'))
      if (match && completed) found = { country: match[1], allowed: match[2] }
    } catch {}
    setupFailures.set(key, found)
    return found
  }
  function previousLaunchFailure(account: Account): ReturnType<typeof launchOutcome> | null {
    if (account.lastCheck?.launchOutcome) {
      const outcome = account.lastCheck.launchOutcome
      return outcome.reason.code === 'outsideActiveHours' ? { ...outcome, phase: 'launchBlocked', reason: { ...outcome.reason, code: 'retiredActiveHours' } } : outcome
    }
    if (!account.lastCheck || !['stopped', 'unknown'].includes(account.lastCheck.state)) return null
    try {
      const at = Date.parse(account.lastCheck.checkedAt)
      const path = join(process.env.LOG_MCP_DIR || join(homedir(), '.logCli', 'mcp'), `${account.lastCheck.checkedAt.slice(0, 10)}.log`)
      const exact = readFileSync(path, 'utf8').split('\n').find((line) => {
        const time = Date.parse(line.slice(0, 24))
        return time <= at && at - time < 2000 && line.includes('cli:inspect err    | log inspect: outsideActiveHours:') && line.includes(`${account.name} runs `)
      })
      if (exact) return { ...launchOutcome({ stderr: exact }), reason: { ...launchOutcome({ stderr: exact }).reason, recordedAt: account.lastCheck.checkedAt } }
    } catch {}
    return null
  }
  function stopReason(account: Account) {
    if (['deactivated', 'banned', 'dead', 'restricted', 'checkpoint'].includes(account.status)) return { code: account.status === 'deactivated' ? 'accountDeactivated' : 'accountSessionBlocked', message: `The account status is ${account.status}.${account.statusReason ? ` Recorded reason: ${account.statusReason}.` : ''} Browser execution remains stopped.`, recordedAt: account.checkedAt }
    if (['checkpoint', 'restricted', 'shadowSuspect', 'accountWarning'].includes(account.state)) return { code: 'accountSessionBlocked', message: `The saved account session reports ${account.state}. Browser execution remains stopped.`, recordedAt: account.checkedAt }
    const setupFailure = previousSetupFailure(account)
    if (setupFailure) return { code: 'previousProfileSetupFailed', message: `Profile provisioning was skipped because home ${setupFailure.country} was excluded by allowed countries ${setupFailure.allowed}. The old console incorrectly recorded this setup failure as stopped. The next launch must pass the current configuration and browser gates.`, recordedAt: account.lastCheck?.checkedAt ?? null }
    return { code: 'previousCheckStopped', message: `The previous console check was recorded as ${account.lastCheck?.state ?? 'unknown'}. That saved result is blocking launch; it does not establish that the proxy failed or that the platform refused this request.`, recordedAt: account.lastCheck?.checkedAt ?? null }
  }
  function stopped(account: Account) { return ['deactivated', 'banned', 'dead', 'restricted', 'checkpoint'].includes(account.status) || ['checkpoint', 'restricted', 'shadowSuspect', 'accountWarning'].includes(account.state) || Boolean(account.lastCheck && ['stopped', 'unknown'].includes(account.lastCheck.state) && (!account.checkedAt || Date.parse(account.checkedAt) <= Date.parse(account.lastCheck.checkedAt)) && !previousSetupFailure(account) && !previousLaunchFailure(account)) }
  function attach(account: Account): Lease | null {
    for (const [id, lease] of leases) if (lease.expiresAt < Date.now()) leases.delete(id)
    const owner = ownerOf(account)
    if (!owner) return null
    const descriptor = readJson<Descriptor>(join(owner.runDir, 'browserViewer.json'))
    if (!descriptor || !Number.isInteger(descriptor.port) || descriptor.port < 1 || descriptor.port > 65535 || !/^[a-f0-9]{32}$/.test(descriptor.generation) || typeof descriptor.token !== 'string' || !alive(descriptor.pid)) return null
    const existing = [...leases.values()].find((lease) => lease.accountId === account.id && lease.owner.runDir === owner.runDir && lease.owner.startedAt === owner.startedAt && lease.descriptor.generation === descriptor.generation)
    if (existing) return existing
    const lease: Lease = { id: randomUUID(), accountId: account.id, owner, descriptor, expiresAt: Date.now() + 30 * 60000, proof: null, stopped: false, pending: false }
    leases.set(lease.id, lease)
    return lease
  }
  function current(account: Account, viewerId: unknown): Lease {
    const lease = typeof viewerId === 'string' ? leases.get(viewerId) : null
    const now = attach(account)
    if (!lease || !now || lease.id !== now.id || lease.accountId !== account.id || !alive(lease.owner.pid) || lease.expiresAt < Date.now()) throw new Error('browserGenerationChanged')
    return lease
  }
  async function ownerRequest(lease: Lease, path: string, body?: unknown) {
    return fetch(`http://127.0.0.1:${lease.descriptor.port}${path}`, { method: body ? 'POST' : 'GET', headers: { authorization: `Bearer ${lease.descriptor.token}`, ...(body ? { 'content-type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), redirect: 'error', signal: AbortSignal.timeout(body ? 120000 : 8000) })
  }
  async function live(lease: Lease): Promise<LiveState> {
    const response = await ownerRequest(lease, '/state')
    if (!response.ok) throw new Error('browserViewerUnavailable')
    const state = await response.json() as LiveState
    if (state.generation !== lease.descriptor.generation || !/^[a-f0-9]{64}$/.test(state.revision) || typeof state.state !== 'string' || typeof state.blocked !== 'boolean' || typeof state.inputAllowed !== 'boolean') throw new Error('browserGenerationChanged')
    return state
  }
  function accountBrowser(account: Account) {
    const row = readLocalAccountRows(process.env.LOG_LOCAL_ACCOUNTS || join(homedir(), '.logCli', 'localAccounts.json')).find((item) => (item.accountName ?? item.name) === account.name && String(item.platform).toLowerCase() === account.platform)
    return browserFor({ browserDriver: typeof row?.browserDriver === 'string' ? row.browserDriver : null, adsPowerProfileId: typeof row?.adsPowerProfileId === 'string' ? row.adsPowerProfileId : null })
  }
  async function status(account: Account): Promise<BrowserCheckView> {
    const lease = attach(account)
    if (previousSetupFailure(account)) console.info('[browserCheck] recovered setup classification', stopReason(account))
    const base = { viewerId: lease?.id ?? null, generation: lease?.descriptor.generation ?? null, revision: null, pageState: null, canInteract: false, canResolve: false, canComplete: false }
    const previousLaunch = previousLaunchFailure(account)
    if (!stopped(account) && previousLaunch && previousLaunch.reason.code !== 'retiredActiveHours' && !(previousLaunch.phase === 'launchCooldown' && previousLaunch.retryAt && Date.now() >= Date.parse(previousLaunch.retryAt)) && !(previousLaunch.reason.code === 'proxyTooSlow' && typeof previousLaunch.proxyMs === 'number' && typeof previousLaunch.limitMs === 'number' && previousLaunch.proxyMs <= proxyMs && previousLaunch.limitMs < proxyMs)) {
      console.warn(`[browserCheck] launch ${previousLaunch.phase}: ${previousLaunch.reason.code}: ${previousLaunch.reason.message}`)
      return { ...base, ...previousLaunch }
    }
    if (stopped(account)) {
      const reason = stopReason(account)
      console.warn('[browserCheck] status stopped', { phase: 'stopped', ...reason })
      return { ...base, phase: 'stopped', reason }
    }
    if (!lease) {
      if (ownerOf(account)) { console.warn('[browserCheck] viewer unavailable', { stage: 'ownerDescriptor', reason: 'Running owner has no valid live viewer descriptor' }); return { ...base, phase: 'viewerUnavailable', reason: { code: 'viewerDescriptorMissing', message: 'The account browser owner is running, but it has no valid live viewer endpoint.', recordedAt: null } } }
      const selected = accountBrowser(account)
      if (selected.driver === 'adsPower' && !browserProviderConfig().configured) return { ...base, phase: 'providerSetupRequired', reason: { code: 'providerNotConfigured', message: 'Configure AdsPower in Extensions before opening this account browser.', recordedAt: null } }
      if (selected.driver === 'adsPower' && !selected.profileId) return { ...base, phase: 'profileRequired', reason: { code: 'accountProfileMissing', message: 'This account has no linked AdsPower profile. Preparing its profile is the next step.', recordedAt: null } }
      return { ...base, phase: 'browserMissing' }
    }
    const state = await live(lease)
    const at = recorded(lease.owner)
    let address: string | null = null
    try {
      const currentUrl = new URL(state.url ?? at.url ?? '')
      if (currentUrl.protocol === 'https:' && (currentUrl.hostname === 'facebook.com' || currentUrl.hostname.endsWith('.facebook.com'))) address = `${currentUrl.origin}${currentUrl.pathname}`
    } catch {}
    const value = { ...base, address, canGoBack: (state.historyLength ?? 0) > 1, canNavigate: true, revision: state.revision, pageState: at.state?.id ?? state.state }
    if (lease.stopped || state.blocked || at.state?.person) return { ...value, phase: state.state === 'disabled' || at.state?.id === 'checkpoint' ? 'stopped' : 'needsAttention', canNavigate: false, canGoBack: false }
    if (lease.pending || state.busy) return { ...value, phase: 'busy', canNavigate: false }
    if (at.failed) return { ...value, phase: 'unknown' }
    if (state.inputAllowed) return { ...value, phase: 'signInRequired', canInteract: true, canResolve: Boolean(at.next && at.state && !at.state.person) }
    if (at.state && !at.state.needsNothing) return { ...value, phase: 'needsResolution', canResolve: Boolean(at.next) }
    if (lease.proof && lease.proof.revision === state.revision && lease.proof.step === at.step && Date.now() - lease.proof.at < 30000) return { ...value, phase: 'verified', canComplete: true }
    return { ...value, phase: 'unknown' }
  }
  async function operate(account: Account, operation: BrowserOperation, input: Record<string, unknown>): Promise<BrowserCheckView> {
    if (operation === 'status') return status(account)
    if (operation === 'close') {
      const previous = closing.get(account.id)
      if (previous) return previous
      const work = (async (): Promise<BrowserCheckView> => {
        const owner = ownerOf(account)
        const empty: BrowserCheckView = { phase: 'browserMissing', viewerId: null, generation: null, revision: null, pageState: null, canInteract: false, canResolve: false, canComplete: false }
        if (!owner) return empty
        const lease = typeof input.viewerId === 'string' ? leases.get(input.viewerId) : null
        if (lease && (lease.owner.runDir !== owner.runDir || lease.owner.startedAt !== owner.startedAt)) throw new Error('browserGenerationChanged')
        console.info('[browserCheck] closing account browser through its owner')
        const result = await runtime.catalogCall('inspect.do', { account: account.name, action: 'stop', sessionStartedAt: owner.startedAt, timeout: 210, json: true })
        if (result.isError || result.structuredContent?.ok !== true || result.structuredContent?.job) {
          if (ownerOf(account)?.startedAt === owner.startedAt) throw new Error('browserCloseUnconfirmed')
        }
        const until = Date.now() + 210000
        while (Date.now() < until) {
          const active = ownerOf(account)
          if (!active || active.startedAt !== owner.startedAt || active.runDir !== owner.runDir) {
            for (const [id, held] of leases) if (held.accountId === account.id && held.owner.runDir === owner.runDir) leases.delete(id)
            console.info('[browserCheck] account browser closure confirmed')
            return empty
          }
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
        throw new Error('browserCloseUnconfirmed')
      })()
      closing.set(account.id, work)
      try { return await work } finally { closing.delete(account.id) }
    }

    if (stopped(account)) return status(account)
    if (operation === 'linkProfile') {
      const before = await status(account)
      if (before.phase !== 'profileRequired') return before
      const existing = provisioning.get(account.id)
      if (existing) return existing
      const work = (async () => {
        console.info('[browserCheck] provisioning started', { stage: 'profileProvision' })
        const result = await runtime.toolCall('adsPower', { args: ['sync', '--apply', '--account', account.name, '--json'] })
        const payload = result.structuredContent?.json as { entries?: { accountName?: string; action?: string; profileId?: string | null; note?: string }[] } | undefined
        const entry = payload?.entries?.find((entry) => entry.accountName === account.name)
        const refusedStatus = /^(?:status) (deactivated|banned|dead)$/.exec(entry?.note ?? '')?.[1]
        const homeExcluded = /^home .+ is not in /.test(entry?.note ?? '')
        const homeMissing = /^no home locale for country /.test(entry?.note ?? '')
        let outcome: ReturnType<typeof launchOutcome> | null = null
        if (refusedStatus) outcome = { phase: 'stopped', retryAt: null, reason: { code: refusedStatus === 'deactivated' ? 'accountDeactivated' : refusedStatus === 'banned' ? 'accountBanned' : 'accountDead', message: `The native account status is ${refusedStatus}. Profile provisioning was refused; no browser was opened.`, recordedAt: new Date().toISOString() } }
        else if (homeExcluded || homeMissing) outcome = { phase: 'profileSetupBlocked', retryAt: null, reason: { code: homeExcluded ? 'browserProfileHomeExcluded' : 'browserProfileHomeMissing', message: homeExcluded ? 'The account country is excluded by Allowed countries in AdsPower settings.' : 'The account has no supported home country and locale for its browser profile.', recordedAt: new Date().toISOString() } }
        else if (result.isError || result.structuredContent?.ok !== true || result.structuredContent?.job || !entry || !['create', 'relink', 'linked'].includes(entry.action ?? '') || !entry.profileId || !accountBrowser(account).profileId) {
          const provider = launchOutcome(result.structuredContent)
          outcome = provider.phase === 'providerSetupRequired' ? provider : { phase: 'operationUncertain', retryAt: null, reason: { code: result.structuredContent?.job ? 'browserProfileProvisionPending' : 'browserProfileBindingUnconfirmed', message: 'The profile operation did not confirm a saved account binding. Its private request and response are retained. No repeat provisioning was dispatched.', recordedAt: new Date().toISOString() } }
        }
        if (outcome) {
          console.warn(`[browserCheck] profileProvision ${outcome.phase}: ${outcome.reason.code}: ${outcome.reason.message}`)
          keepOutcome(account.id, outcome.phase === 'stopped' ? 'stopped' : outcome.phase === 'operationUncertain' ? 'unknown' : 'unavailable', outcome)
          return { ...before, ...outcome }
        }
        const next = await status(account)
        console.info('[browserCheck] provisioning completed', { stage: 'profileProvision', phase: next.phase })
        return next
      })()
      provisioning.set(account.id, work)
      try { return await work } finally { provisioning.delete(account.id) }
    }
    if (operation === 'open') {
      if (ownerOf(account)) return status(account)
      const before = await status(account)
      if (before.phase !== 'browserMissing') return before
      if (accountBrowser(account).driver === 'adsPower') {
        const available = await runtime.toolCall('adsPower', { args: ['status'] })
        if (available.isError || available.structuredContent?.ok !== true) return { ...before, phase: 'providerSetupRequired' }
      }
      const result = await runtime.catalogCall('inspect.start', { account: account.name, detach: true, proxyMs, url: 'https://www.facebook.com/', goal })
      const data = result.structuredContent
      if (result.isError || data?.ok !== true || data?.job) {
        const outcome = launchOutcome(data)
        console.warn(`[browserCheck] launch ${outcome.phase}: ${outcome.reason.code}: ${outcome.reason.message}`)
        keepOutcome(account.id, outcome.phase === 'launchUncertain' ? 'unknown' : 'unavailable', outcome)
        return { ...before, ...outcome }
      }
      return status(account)
    }
    const lease = current(account, input.viewerId)
    if (lease.pending) throw new Error('browserBusy')
    const before = await status(account)
    if (before.generation !== input.generation || (!['verify', 'back', 'reload'].includes(operation) && before.revision !== input.revision)) throw new Error('browserStateChanged')
    if (['stopped', 'needsAttention'].includes(before.phase)) throw new Error('browserCheckStopped')
    if (operation === 'back' || operation === 'reload') {
      if (!before.canNavigate || (operation === 'back' && !before.canGoBack)) throw new Error('browserInputStopped')
      lease.proof = null
      lease.pending = true
      try {
        const url = (await live(lease)).url ?? recorded(lease.owner).url
        if (operation === 'reload' && !url) throw new Error('browserStateChanged')
        const result = await runtime.catalogCall('inspect.do', { account: account.name, action: operation === 'back' ? 'back' : 'goto', ...(operation === 'reload' ? { values: [url] } : {}), goal, json: true })
        if (result.isError || result.structuredContent?.ok !== true || result.structuredContent?.job) {
          lease.stopped = true; keepOutcome(account.id, 'unknown'); throw new Error('browserCheckStopped')
        }
      } finally { lease.pending = false }
      return status(account)
    }
    if (operation === 'input') {
      if (!before.canInteract || !input.event || typeof input.event !== 'object' || Array.isArray(input.event)) throw new Error('browserInputStopped')
      lease.proof = null
      lease.pending = true
      try {
        const response = await ownerRequest(lease, '/input', { ...input.event as Record<string, unknown>, generation: before.generation, revision: before.revision })
        if (!response.ok) { const body = await response.json().catch(() => null); if (body?.error === 'browserStateChanged' || body?.error === 'browserBusy') throw new Error(body.error); lease.stopped = true; throw new Error('browserInputStopped') }
      } finally { lease.pending = false }
      return status(account)
    }
    if (operation === 'complete') {
      if (!before.canComplete) throw new Error('browserCheckUnresolved')
      lease.pending = true
      try {
        const saved = await runtime.catalogCall('inspect.do', { account: account.name, action: 'saveState', goal, json: true })
        if (saved.isError || saved.structuredContent?.ok !== true || saved.structuredContent?.job) throw new Error('browserCheckUnresolved')
        current(account, lease.id)
        const after = await live(lease)
        const recordedAfter = recorded(lease.owner)
        if (after.blocked || after.inputAllowed || recordedAfter.failed || (recordedAfter.state && !recordedAfter.state.needsNothing) || !alive(lease.owner.pid)) throw new Error('browserCheckUnresolved')
        keepOutcome(account.id, 'succeeded')
        return { ...before, phase: 'verified', canComplete: true }
      } catch (error) { lease.proof = null; throw error }
      finally { lease.pending = false }
    }
    if (operation !== 'verify' && operation !== 'resolve') throw new Error('browserInputInvalid')
    if (operation === 'resolve' && !before.canResolve) throw new Error('browserCheckUnresolved')
    lease.proof = null
    lease.pending = true
    try {
      if (operation === 'resolve') {
        const next = recorded(lease.owner).next
        if (!next || !['inspectDoLive', 'inspectDo', 'flowMessengerPinCreateLive'].includes(next.tool)) throw new Error('browserCheckUnresolved')
        const result = await runtime.toolCall(next.tool, { ...next.input, waitMs: 300000 })
        if (result.isError || result.structuredContent?.ok !== true || result.structuredContent?.job) { lease.stopped = true; keepOutcome(account.id, 'stopped'); throw new Error('browserCheckStopped') }
      } else {
        const result = await runtime.catalogCall('inspect.do', { account: account.name, action: 'snapshot', goal, json: true })
        if (result.isError || result.structuredContent?.ok !== true || result.structuredContent?.job) { lease.stopped = true; keepOutcome(account.id, 'unknown'); throw new Error('browserCheckStopped') }
        const json = result.structuredContent.json as { reading?: { step?: string; at?: string; error?: unknown; answers?: { question: string; answer: { type: string; noul?: number } }[] } } | undefined
        const reading = json?.reading
        const at = recorded(lease.owner)
        const after = await live(lease)
        const answers = reading?.answers ?? []
        const met = answers.find((answer) => answer.question === 'goalMet')?.answer
        const person = answers.find((answer) => answer.question === 'personNeeded')?.answer
        const evidence = at.exchanges.some((exchange) => exchange.status >= 200 && exchange.status < 300 && exchange.known && !!exchange.answer)
        if (!reading?.error && reading?.step === at.step && met?.type === 'noul' && typeof met.noul === 'number' && met.noul >= 0.5 && !(person?.type === 'noul' && (person.noul ?? 0) >= 0.5) && evidence && !after.blocked && !after.inputAllowed && !at.failed && (!at.state || at.state.needsNothing)) lease.proof = { revision: after.revision, step: at.step!, at: Date.now() }
      }
    } finally { lease.pending = false }
    return status(account)
  }
  async function frame(account: Account, viewerId: string) {
    const lease = current(account, viewerId)
    const response = await ownerRequest(lease, '/frame')
    if (!response.ok || response.headers.get('x-log-browser-generation') !== lease.descriptor.generation) throw new Error('browserViewerUnavailable')
    const data = await response.arrayBuffer()
    if (data.byteLength > 10000000) throw new Error('browserViewerUnavailable')
    return data
  }
  async function rejected(account: Account, operation: BrowserOperation, error: unknown): Promise<BrowserCheckView> {
    const code = error instanceof Error ? error.message : 'browserOperationUnknown'
    const base: BrowserCheckView = { phase: 'operationUncertain', viewerId: null, generation: null, revision: null, pageState: null, canInteract: false, canResolve: false, canComplete: false }
    const known: Record<string, { phase: BrowserCheckView['phase']; message: string }> = {
      browserCheckStopped: { phase: 'stopped', message: 'The account or recorded browser operation is stopped. No continuation was dispatched.' },
      browserProfileHomeExcluded: { phase: 'profileSetupBlocked', message: 'The account country is excluded by Allowed countries in AdsPower settings.' },
      browserGenerationChanged: { phase: 'waitingForOwner', message: 'The account browser owner changed. The stale operation was refused.' },
      browserStateChanged: { phase: 'needsAttention', message: 'The page changed before the operation. The stale action was refused.' },
      browserBusy: { phase: 'waitingForOwner', message: 'The account browser is handling another operation.' },
      browserInputStopped: { phase: 'needsAttention', message: 'The current browser state does not allow this input. No continuation was dispatched.' },
      browserCheckUnresolved: { phase: 'needsAttention', message: 'The browser check is unresolved. Session completion was refused.' },
      browserViewerUnavailable: { phase: 'viewerUnavailable', message: 'The account browser viewer could not be reached.' },
      browserProviderUnavailable: { phase: 'providerSetupRequired', message: 'The configured browser provider could not be reached.' },
      browserProviderKeyRequired: { phase: 'providerSetupRequired', message: 'The configured browser provider requires its saved key.' },
      browserProviderInvalid: { phase: 'providerSetupRequired', message: 'The saved browser provider configuration is invalid.' },
      browserCloseUnconfirmed: { phase: 'operationUncertain', message: 'Browser closure was not confirmed by its account owner.' },
      browserOperationUnsupported: { phase: 'serviceUnavailable', message: 'The connected runtime does not support this browser operation.' },
      browserInputInvalid: { phase: 'needsAttention', message: 'The browser input was rejected as invalid.' },
    }
    let next = known[code]
    if (code === 'browserCheckStopped') {
      try { const view = await status(account); if (['stopped', 'needsAttention', 'launchBlocked', 'launchCooldown', 'profileSetupBlocked', 'operationUncertain'].includes(view.phase)) return view } catch {}
    }
    next ??= { phase: operation === 'status' ? 'serviceUnavailable' : 'operationUncertain', message: operation === 'status' ? 'The runtime status could not be read.' : 'The runtime did not confirm this operation. Its outcome is unknown; no action retry was dispatched.' }
    const reason = { code: next === known[code] ? code : 'browserOperationUnconfirmed', message: next.message, recordedAt: new Date().toISOString() }
    console.warn(`[browserCheck] ${operation} rejected: ${reason.code}: ${reason.message}`)
    return { ...base, phase: next.phase, reason }
  }
  return { status, operate, frame, rejected }
}
