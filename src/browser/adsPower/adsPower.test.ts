import { describe, expect, test } from 'bun:test'
import { createActor, waitFor } from 'xstate'
import { createBrowserSession } from '../driver/index'
import { listFacebookAccounts, setAccountStatus } from '../../marketplace/socialAccount/index'
import { marketplaceFixture } from '../../twenty/graphql/index'
import { adsPowerDriver } from './index'
import { AdsPowerError, createAdsPowerClient } from './index'
import type { AdsPowerClient, AdsPowerProfile } from './index'
import { adsPowerHomes, homesOf, planSync, profileRequest, remarkAccountId, syncProfiles, twentyRemark } from './index'

function fakeFetch(answers: Record<string, unknown[]>) {
  const calls: { path: string; body: unknown; auth: string | null }[] = []
  const impl = async (url: string, init?: RequestInit) => {
    const path = new URL(url).pathname
    calls.push({ path, body: init?.body ? JSON.parse(String(init.body)) : null, auth: new Headers(init?.headers).get('Authorization') })
    const queue = answers[path] ?? [{ code: 0, msg: 'success' }]
    const reply = queue.length > 1 ? queue.shift() : queue[0]
    return new Response(JSON.stringify(reply))
  }
  return { impl, calls }
}

function memoryAdsPower(profiles: AdsPowerProfile[] = []) {
  const log: string[] = []
  const client: AdsPowerClient = {
    status: async () => true,
    listProfiles: async () => profiles,
    ensureGroup: async () => '7',
    createProfile: async (body) => {
      const profileId = `p${profiles.length + 1}`
      profiles.push({ profileId, profileNo: String(profiles.length + 1), name: body.name, groupId: body.group_id, remark: body.remark ?? null, lastOpenTime: null })
      log.push(`create ${body.name}`)
      return { profileId, profileNo: null }
    },
    updateProfile: async (id, fields) => void log.push(`update ${id} ${JSON.stringify(fields)}`),
    deleteProfiles: async (ids) => {
      for (const id of ids) profiles.splice(profiles.findIndex((p) => p.profileId === id), 1)
      log.push(`delete ${ids.join(',')}`)
    },
    startBrowser: async (id) => (log.push(`start ${id}`), { profileId: id, cdpUrl: 'ws://127.0.0.1:9/devtools/browser/x', debugPort: '9' }),
    activeBrowser: async () => null,
    stopBrowser: async (id) => void log.push(`stop ${id}`)
  }
  return { client, profiles, log }
}

describe('adsPower Local API client', () => {
  test('sends the key as a Bearer token and reads a started profile\'s CDP websocket', async () => {
    const net = fakeFetch({ '/api/v2/browser-profile/start': [{ code: 0, msg: 'success', data: { ws: { puppeteer: 'ws://127.0.0.1:1/devtools/browser/a' }, debug_port: '1' } }] })
    const client = createAdsPowerClient({ baseUrl: 'http://local.adspower.net:50325', apiKey: 'k' }, net.impl)
    const started = await client.startBrowser('abc')
    expect(started).toEqual({ profileId: 'abc', cdpUrl: 'ws://127.0.0.1:1/devtools/browser/a', debugPort: '1' })
    expect(net.calls[0]).toMatchObject({ path: '/api/v2/browser-profile/start', auth: 'Bearer k', body: { profile_id: 'abc', headless: '0', last_opened_tabs: '0', proxy_detection: '0' } })
  })

  test('"Too many request" is retried, then refused as adsPowerRateLimited', async () => {
    const busy = { code: -1, msg: 'Too many request per second, please check' }
    const ok = fakeFetch({ '/api/v2/browser-profile/stop': [busy, { code: 0, msg: 'success' }] })
    await createAdsPowerClient({ baseUrl: 'http://x', apiKey: null }, ok.impl, [1]).stopBrowser('a')
    expect(ok.calls).toHaveLength(2)
    const spent = fakeFetch({ '/api/v2/browser-profile/stop': [busy] })
    const error = await createAdsPowerClient({ baseUrl: 'http://x', apiKey: null }, spent.impl, [1, 1]).stopBrowser('a').catch((e) => e)
    expect(error).toBeInstanceOf(AdsPowerError)
    expect(error.code).toBe('adsPowerRateLimited')
  })

  test('the app not running is adsPowerUnavailable, and lists page through 100 at a time', async () => {
    const down = createAdsPowerClient({ baseUrl: 'http://x', apiKey: null }, async () => { throw new Error('ECONNREFUSED') })
    expect(await down.status()).toBe(false)
    expect((await down.listProfiles().catch((e) => e)).code).toBe('adsPowerUnavailable')
    const page = (n: number, from: number) => ({ code: 0, msg: 'ok', data: { list: Array.from({ length: n }, (_, i) => ({ profile_id: `p${from + i}`, name: `n${from + i}`, remark: null })) } })
    const net = fakeFetch({ '/api/v2/browser-profile/list': [page(100, 0), page(3, 100)] })
    expect(await createAdsPowerClient({ baseUrl: 'http://x', apiKey: null }, net.impl).listProfiles()).toHaveLength(103)
  })
})

describe('adsPower profiles from Twenty (rule 42)', () => {
  test('the profile is Windows Chrome with the home locale, IP timezone and noise, and holds no proxy or secret', async () => {
    const [account] = (await listFacebookAccounts(marketplaceFixture())).filter((a) => a.accountName === 'galwayOne')
    const body = profileRequest(account, '7')!
    expect(body).toMatchObject({ name: 'galwayOne', group_id: '7', remark: twentyRemark(account.id), user_proxy_config: { proxy_soft: 'no_proxy' } })
    expect(body.fingerprint_config).toMatchObject({ browser_kernel_config: { type: 'chrome' }, language: ['en-IE', 'en'], automatic_timezone: '1', canvas: '1', webgl_image: '1', audio: '1' })
    expect(JSON.stringify(body)).not.toMatch(/password|cookie|fakey|username/)
    expect(remarkAccountId(body.remark!)).toBe(account.id)
  })

  test('the plan makes a profile per account, skips banned and unlocalisable ones, and relinks one found by its remark', async () => {
    const accounts = await listFacebookAccounts(marketplaceFixture())
    const galwayTwo = accounts.find((a) => a.accountName === 'galwayTwo')!
    const plan = planSync(accounts, [{ profileId: 'old', profileNo: '1', name: 'galwayTwo', groupId: '7', remark: twentyRemark(galwayTwo.id), lastOpenTime: null }])
    const action = (name: string) => plan.find((e) => e.accountName === name)!.action
    expect(action('banned')).toBe('skip')
    expect(action('noCountry')).toBe('skip')
    expect(action('vietnam')).toBe('skip')
    expect(action('galwayTwo')).toBe('relink')
    expect(action('galwayOne')).toBe('create')
    expect(plan.filter((e) => e.action === 'create')).toHaveLength(7)
  })

  test('sync is a dry run unless applied; applied, it makes the profiles and links each in Twenty, and a rerun only finds them linked', async () => {
    const twenty = marketplaceFixture()
    const ads = memoryAdsPower()
    const dry = await syncProfiles(twenty, ads.client, { apply: false, homes: null })
    expect(dry.applied).toBe(false)
    expect(ads.log).toEqual([])
    const lines: string[] = []
    const applied = await syncProfiles(twenty, ads.client, { apply: true, homes: null, log: (l) => lines.push(l) })
    expect(ads.log.filter((l) => l.startsWith('create'))).toHaveLength(8)
    expect(lines.some((l) => /^adsPower \d+\/11 galwayOne: made profile p\d+, linked in Twenty$/.test(l))).toBe(true)
    const linked = (await listFacebookAccounts(twenty)).find((a) => a.accountName === 'galwayOne')!
    expect(linked.adsPowerProfileId).toBe(applied.entries.find((e) => e.accountName === 'galwayOne')!.profileId)
    const again = await syncProfiles(twenty, ads.client, { apply: true, homes: null })
    expect(again.entries.filter((e) => e.action === 'create')).toHaveLength(0)
    expect(again.entries.filter((e) => e.action === 'linked')).toHaveLength(8)
  })
})

describe('a deactivated or out-of-home account gives its AdsPower profile back (rule 78)', () => {
  test('the plan releases the profile of a deactivated account, and one whose home is outside the chosen homes', async () => {
    const accounts = await listFacebookAccounts(marketplaceFixture())
    const galwayOne = { ...accounts.find((a) => a.accountName === 'galwayOne')!, status: 'deactivated' as const, adsPowerProfileId: 'g1' }
    const profiles = [{ profileId: 'g1', profileNo: '1', name: 'galwayOne', groupId: '7', remark: twentyRemark(galwayOne.id), lastOpenTime: null }]
    const plan = planSync([galwayOne, ...accounts.filter((a) => a.accountName !== 'galwayOne')], profiles, ['US'])
    expect(plan.find((e) => e.accountName === 'galwayOne')).toMatchObject({ action: 'release', profileId: 'g1', note: 'status deactivated' })
    expect(plan.find((e) => e.accountName === 'galwayTwo')).toMatchObject({ action: 'skip', note: 'home IE is not in US' })
    expect(plan.filter((e) => e.action === 'create').every((e) => accounts.find((a) => a.id === e.accountId)!.homeCountry === 'US')).toBe(true)
  })

  test('applied, a release deletes the profile and unlinks it in Twenty before the freed slot goes to an account waiting for one', async () => {
    const twenty = marketplaceFixture()
    const ads = memoryAdsPower()
    await syncProfiles(twenty, ads.client, { apply: true, homes: null })
    const galwayOne = (await listFacebookAccounts(twenty)).find((a) => a.accountName === 'galwayOne')!
    const held = galwayOne.adsPowerProfileId!
    await setAccountStatus(twenty, galwayOne.id, 'deactivated', 'setByHand')
    const lines: string[] = []
    const result = await syncProfiles(twenty, ads.client, { apply: true, homes: null, log: (l) => lines.push(l) })
    expect(result.entries[0]).toMatchObject({ accountName: 'galwayOne', action: 'release', profileId: held })
    expect(ads.log).toContain(`delete ${held}`)
    expect(ads.profiles.some((p) => p.profileId === held)).toBe(false)
    expect((await listFacebookAccounts(twenty)).find((a) => a.accountName === 'galwayOne')!.adsPowerProfileId).toBeNull()
    expect(lines[1]).toMatch(/galwayOne: released profile .+ \(status deactivated\), unlinked in Twenty$/)
    const again = await syncProfiles(twenty, ads.client, { apply: true, homes: null })
    expect(again.entries.find((e) => e.accountName === 'galwayOne')).toMatchObject({ action: 'skip', note: 'status deactivated' })
  })

  test('the homes come from LOG_ADSPOWER_HOMES, comma separated, any case', () => {
    expect(adsPowerHomes({ LOG_ADSPOWER_HOMES: 'us, ie' })).toEqual(['US', 'IE'])
    expect(adsPowerHomes({})).toBeNull()
    expect(homesOf(' ')).toBeNull()
  })
})

describe('the AdsPower driver in the browser session machine (rule 44)', () => {
  const gateOk = async () => ({ ok: true, exitIp: '1.2.3.4', exitCountry: 'IE', failure: null })

  async function linkedAccount() {
    const twenty = marketplaceFixture()
    await syncProfiles(twenty, memoryAdsPower().client, { apply: true, homes: null })
    return (await listFacebookAccounts(twenty)).find((a) => a.accountName === 'galwayOne')!
  }

  test('a session with no gate step is refused before anything opens (rule 12)', async () => {
    const account = await linkedAccount()
    const opened: string[] = []
    const driver = adsPowerDriver({ account: async () => account, open: async (a) => (opened.push(a.accountName), { cdpUrl: 'ws://x', handle: a.adsPowerProfileId! }) })
    const actor = createBrowserSession(driver, { driver: 'adsPower', accountId: account.id, accountName: account.accountName }).start()
    expect((await waitFor(actor, (s) => s.status === 'done')).output).toMatchObject({ state: 'refused', failure: { code: 'browserDriverFailed' } })
    expect(opened).toEqual([])
  })

  test('a refused gate never opens; a passed one opens the profile, and CLOSE closes it with its reason (rule 35)', async () => {
    const account = await linkedAccount()
    const refusedOpen: string[] = []
    const refused = adsPowerDriver({ account: async () => account, gate: async () => ({ ok: false, exitIp: null, exitCountry: null, failure: { code: 'proxyCountryMismatch', detail: 'exit in US' } }), open: async () => (refusedOpen.push('x'), { cdpUrl: null, handle: 'x' }) })
    const r = createBrowserSession(refused, { driver: 'adsPower', accountId: account.id, accountName: account.accountName }).start()
    expect((await waitFor(r, (s) => s.status === 'done')).output).toMatchObject({ state: 'refused', failure: { code: 'proxyCountryMismatch' } })
    expect(refusedOpen).toEqual([])
    const closed: string[] = []
    const driver = adsPowerDriver({ account: async () => account, gate: gateOk, open: async (a) => ({ cdpUrl: 'ws://127.0.0.1:9/devtools/browser/x', handle: a.adsPowerProfileId! }), close: async (e) => void closed.push(e.handle) })
    const actor = createBrowserSession(driver, { driver: 'adsPower', accountId: account.id, accountName: account.accountName }).start()
    await waitFor(actor, (s) => s.matches('open'))
    actor.send({ type: 'CLOSE', reason: 'endOfHours' })
    expect((await waitFor(actor, (s) => s.status === 'done')).output).toMatchObject({ state: 'closed', closeReason: 'endOfHours', failure: null })
    expect(closed).toEqual([account.adsPowerProfileId!])
  })

  test('an account with no linked profile fails in preparing', async () => {
    const [account] = (await listFacebookAccounts(marketplaceFixture())).filter((a) => a.accountName === 'galwayOne')
    const driver = adsPowerDriver({ account: async () => account, gate: gateOk })
    const actor = createActor((await import('../driver/index')).sessionMachineFor(driver), { input: { driver: 'adsPower', accountId: account.id, accountName: account.accountName } }).start()
    expect((await waitFor(actor, (s) => s.status === 'done')).output).toMatchObject({ state: 'failed', failure: { code: 'adsPowerProfileMissing' } })
  })
})
