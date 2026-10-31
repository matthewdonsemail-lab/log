import { AdsPowerError, DEFAULT_LOCAL_API_URL } from './types'
import type { AdsPowerClient, AdsPowerProfile, CreateProfileBody, LocalApiConfig, LocalApiReply, StartedBrowser } from './types'
import { listBrowserAccounts, saveAdsPowerProfileId } from '../../marketplace/socialAccount/index'
import { PLATFORM_SITES, PLATFORMS } from '../../cli/runner/helpers/platforms'
import type { FacebookAccount } from '../../marketplace/socialAccount/index'
import type { TwentyClient } from '../../twenty/graphql/index'
import type { BrowserDriver, BrowserEndpoint, GateResult } from '../driver/index'
import { planSync, profileRequest } from './helpers/index'
import { ADS_POWER_GROUP, ADS_POWER_HOMES_ENV } from './types'
import type { ProfileSyncEntry, ProfileSyncResult } from './types'

export const RATE_LIMIT_WAIT_MS = [2000, 4000]
const PAGE_SIZE = 100

export function localApiConfig(env: Record<string, string | undefined> = process.env): LocalApiConfig {
  return { baseUrl: (env.ADSPOWER_HOST?.trim() || DEFAULT_LOCAL_API_URL).replace(/\/+$/, ''), apiKey: env.ADSPOWER_API_KEY?.trim() || null }
}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>

export function createAdsPowerClient(
  config: LocalApiConfig = localApiConfig(),
  fetchImpl: Fetch = fetch,
  waitMs: number[] = RATE_LIMIT_WAIT_MS
): AdsPowerClient {
  const headers = (): Record<string, string> => ({ 'Content-Type': 'application/json', ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}) })

  async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      let reply: LocalApiReply<T>
      try {
        const res = await fetchImpl(`${config.baseUrl}${path}`, { method, headers: headers(), body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30_000) })
        reply = (await res.json()) as LocalApiReply<T>
      } catch (error) {
        throw new AdsPowerError('adsPowerUnavailable', `${method} ${path}: ${error instanceof Error ? error.message : String(error)} (is the AdsPower app running?)`)
      }
      if (reply.code === 0) return reply.data as T
      if (/too many request/i.test(reply.msg ?? '')) {
        if (attempt < waitMs.length) {
          await new Promise((r) => setTimeout(r, waitMs[attempt]))
          continue
        }
        throw new AdsPowerError('adsPowerRateLimited', `${path}: ${reply.msg}`)
      }
      throw new AdsPowerError('adsPowerRequestFailed', `${path}: ${reply.msg || `code ${reply.code}`}`)
    }
  }

  const toStarted = (profileId: string, data: { ws?: { puppeteer?: string }; debug_port?: string | number } | undefined): StartedBrowser => {
    const cdpUrl = data?.ws?.puppeteer
    if (!cdpUrl) throw new AdsPowerError('adsPowerRequestFailed', `profile ${profileId} started without a CDP websocket`)
    return { profileId, cdpUrl, debugPort: data?.debug_port == null ? null : String(data.debug_port) }
  }

  return {
    async status() {
      try {
        await call('GET', '/status')
        return true
      } catch {
        return false
      }
    },
    async listProfiles() {
      const out: AdsPowerProfile[] = []
      for (let page = 1; ; page++) {
        const data = await call<{ list?: Record<string, unknown>[] }>('POST', '/api/v2/browser-profile/list', { page, limit: PAGE_SIZE })
        const list = data?.list ?? []
        for (const row of list) {
          out.push({
            profileId: String(row.profile_id),
            profileNo: row.profile_no == null ? null : String(row.profile_no),
            name: String(row.name ?? ''),
            groupId: row.group_id == null ? null : String(row.group_id),
            remark: row.remark ? String(row.remark) : null,
            lastOpenTime: row.last_open_time ? String(row.last_open_time) : null
          })
        }
        if (list.length < PAGE_SIZE) return out
      }
    },
    async ensureGroup(name) {
      const found = await call<{ list?: { group_id: string | number; group_name: string }[] }>('GET', `/api/v1/group/list?group_name=${encodeURIComponent(name)}&page_size=100`)
      const match = found?.list?.find((g) => g.group_name === name)
      if (match) return String(match.group_id)
      const made = await call<{ group_id: string | number }>('POST', '/api/v1/group/create', { group_name: name, remark: 'log-cli: one profile per Facebook account in Twenty' })
      return String(made.group_id)
    },
    async createProfile(body: CreateProfileBody) {
      const data = await call<{ profile_id: string; profile_no?: string | number }>('POST', '/api/v2/browser-profile/create', body)
      return { profileId: String(data.profile_id), profileNo: data.profile_no == null ? null : String(data.profile_no) }
    },
    async updateProfile(profileId, fields) {
      await call('POST', '/api/v2/browser-profile/update', { profile_id: profileId, ...fields })
    },
    async deleteProfiles(profileIds) {
      await call('POST', '/api/v2/browser-profile/delete', { profile_id: profileIds })
    },
    async startBrowser(profileId, options = {}) {
      const data = await call<{ ws?: { puppeteer?: string }; debug_port?: string }>('POST', '/api/v2/browser-profile/start', {
        profile_id: profileId,
        headless: '0',
        last_opened_tabs: '0',
        proxy_detection: '0',
        cdp_mask: '1',
        ...(options.launchArgs ? { launch_args: options.launchArgs } : {})
      })
      return toStarted(profileId, data)
    },
    async activeBrowser(profileId) {
      const data = await call<{ status?: string; ws?: { puppeteer?: string }; debug_port?: string }>('GET', `/api/v2/browser-profile/active?profile_id=${encodeURIComponent(profileId)}`)
      return data?.status === 'Active' ? toStarted(profileId, data) : null
    },
    async stopBrowser(profileId) {
      await call('POST', '/api/v2/browser-profile/stop', { profile_id: profileId })
    },
    async kernels() {
      const data = await call<{ list?: { kernel: string; is_downloaded: boolean }[] }>('GET', '/api/v2/browser-profile/kernels?kernel_type=Chrome')
      return (data?.list ?? []).map((k) => ({ version: String(k.kernel), downloaded: Boolean(k.is_downloaded) })).sort((a, b) => Number(a.version) - Number(b.version))
    },
    async profileUserAgents(profileIds) {
      const data = await call<{ list?: { profile_id: string; ua?: string }[] }>('POST', '/api/v2/browser-profile/ua', { profile_id: profileIds })
      return Object.fromEntries((data?.list ?? []).map((row) => [String(row.profile_id), String(row.ua ?? '')]))
    },
    async downloadKernel(version) {
      const data = await call<{ status?: string; progress?: number }>('POST', '/api/v2/browser-profile/download-kernel', { kernel_type: 'Chrome', kernel_version: version })
      return { status: String(data?.status ?? ''), progress: data?.progress == null ? null : Number(data.progress) }
    }
  }
}

export function kernelOfUserAgent(userAgent: string | null | undefined): string | null {
  return /Chrome\/(\d+)\./.exec(userAgent ?? '')?.[1] ?? null
}

export async function profileKernels(client: AdsPowerClient, profileIds: string[]): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {}
  for (let i = 0; i < profileIds.length; i += 10) {
    const agents = await client.profileUserAgents(profileIds.slice(i, i + 10))
    for (const id of profileIds.slice(i, i + 10)) out[id] = kernelOfUserAgent(agents[id])
  }
  return out
}

export async function kernelReady(client: AdsPowerClient, version: string): Promise<boolean> {
  return (await client.kernels()).some((k) => k.version === version && k.downloaded)
}

export async function ensureKernel(
  client: AdsPowerClient,
  log: (line: string) => void,
  options: { version: string; pollMs?: number; maxMs?: number }
): Promise<{ ok: true; version: string } | { ok: false; detail: string }> {
  const version = options.version
  if (await kernelReady(client, version)) return { ok: true, version }
  const started = Date.now()
  let last = ''
  while (Date.now() - started < (options.maxMs ?? 900_000)) {
    const state = await client.downloadKernel(version)
    const line = `AdsPower SunBrowser ${version}: ${state.status}${state.progress == null ? '' : ` ${state.progress}%`}`
    if (line !== last) log(line)
    last = line
    if (state.status === 'completed') return { ok: true, version }
    if (state.status !== 'downloading' && state.status !== 'installing') return { ok: false, detail: line }
    await new Promise((r) => setTimeout(r, options.pollMs ?? 5000))
  }
  return { ok: false, detail: `SunBrowser ${version} still downloading after ${Math.round((options.maxMs ?? 900_000) / 60_000)} min` }
}

export async function ensureProfileKernel(
  client: AdsPowerClient,
  profileId: string,
  log: (line: string) => void,
  options: { pollMs?: number; maxMs?: number } = {}
): Promise<{ ok: true; version: string } | { ok: false; detail: string }> {
  const version = (await profileKernels(client, [profileId]))[profileId]
  if (!version) return { ok: false, detail: `profile ${profileId}: its user agent names no Chrome version, so its kernel is unknown` }
  return ensureKernel(client, log, { ...options, version })
}

export function adsPowerHomes(env: Record<string, string | undefined> = process.env): string[] | null {
  return homesOf(env[ADS_POWER_HOMES_ENV])
}

export function homesOf(value: string | undefined | null): string[] | null {
  const homes = (value ?? '').split(',').map((h) => h.trim().toUpperCase()).filter(Boolean)
  return homes.length ? homes : null
}

export async function syncProfiles(
  twenty: TwentyClient,
  adsPower: AdsPowerClient,
  options: { apply: boolean; account?: string; homes?: string[] | null; log?: (line: string) => void }
): Promise<ProfileSyncResult> {
  const log = options.log ?? (() => {})
  const browserPlatforms = PLATFORMS.filter((p) => PLATFORM_SITES[p].browser).map((p) => PLATFORM_SITES[p].twenty)
  const all = await listBrowserAccounts(twenty, browserPlatforms)
  const accounts = options.account ? all.filter((a) => a.accountName === options.account || a.id === options.account) : all
  const homes = options.homes === undefined ? adsPowerHomes() : options.homes
  log(`adsPower: ${accounts.length} account(s) from Twenty${homes ? ` (homes ${homes.join(', ')})` : ''}; reading AdsPower's profiles`)
  const profiles = await adsPower.listProfiles()
  const planned = planSync(accounts, profiles, homes)
  if (!options.apply) return { applied: false, entries: planned }
  const entries = [...planned.filter((e) => e.action === 'release'), ...planned.filter((e) => e.action !== 'release')]
  const live = new Set(profiles.map((p) => p.profileId))
  const groupId = entries.some((e) => e.action === 'create') ? await adsPower.ensureGroup(ADS_POWER_GROUP) : ''
  const done: ProfileSyncEntry[] = []
  for (const [i, entry] of entries.entries()) {
    const account = accounts.find((a) => a.id === entry.accountId)!
    try {
      if (entry.action === 'release') {
        if (entry.profileId && live.has(entry.profileId)) await adsPower.deleteProfiles([entry.profileId])
        await saveAdsPowerProfileId(twenty, account.id, null)
        done.push(entry)
        log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: released profile ${entry.profileId ?? '-'} (${entry.note}), unlinked in Twenty`)
      } else if (entry.action === 'create') {
        const body = profileRequest(account, groupId)!
        const made = await adsPower.createProfile(body)
        await saveAdsPowerProfileId(twenty, account.id, made.profileId)
        done.push({ ...entry, profileId: made.profileId })
        log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: made profile ${made.profileId}, linked in Twenty`)
      } else if (entry.action === 'relink') {
        await saveAdsPowerProfileId(twenty, account.id, entry.profileId!)
        done.push(entry)
        log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: relinked profile ${entry.profileId}`)
      } else {
        done.push(entry)
        log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: ${entry.action}${entry.note ? ` (${entry.note})` : ''}`)
      }
    } catch (error) {
      const note = error instanceof Error ? error.message : String(error)
      done.push({ ...entry, note })
      log(`adsPower ${i + 1}/${entries.length} ${account.accountName}: ${entry.action} failed: ${note}`)
    }
  }
  return { applied: true, entries: done }
}

export interface AdsPowerDriverDeps {
  account: (accountId: string) => Promise<FacebookAccount>
  gate?: (account: FacebookAccount) => Promise<GateResult>
  open?: (account: FacebookAccount) => Promise<BrowserEndpoint>
  close?: (endpoint: BrowserEndpoint) => Promise<void>
}

const fail = (code: string, detail: string) => ({ code, detail })
const missing = (step: string) => fail('browserDriverFailed', `the adsPower driver was given no "${step}" step`)

export function adsPowerDriver(deps: AdsPowerDriverDeps): BrowserDriver {
  return {
    name: 'adsPower',
    async prepare(input) {
      const account = await deps.account(input.accountId)
      if (!account.adsPowerProfileId) throw fail('adsPowerProfileMissing', `${account.accountName} has no AdsPower profile: run log adsPower sync --apply`)
      return account.adsPowerProfileId
    },
    async gate(input) {
      if (!deps.gate) throw missing('gate')
      return deps.gate(await deps.account(input.accountId))
    },
    async start(input) {
      if (!deps.open) throw missing('open')
      return deps.open(await deps.account(input.accountId))
    },
    async selfCheck() {
      return { ok: true, failure: null }
    },
    async stop(_input, endpoint) {
      if (deps.close) await deps.close(endpoint)
    }
  }
}
