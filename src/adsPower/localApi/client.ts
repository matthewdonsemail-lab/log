/**
 * The AdsPower Local API client, ported from Listaro_backup/src/lib/adspower-client.ts
 * (list, create, start, stop over the Local API, then Playwright over CDP) onto the v2
 * endpoints the docs mark latest. Every call sends the key as `Authorization: Bearer`,
 * retries "Too many request" twice (Listaro's 2 s, 4 s), and throws `AdsPowerError`.
 */
import { AdsPowerError, DEFAULT_LOCAL_API_URL } from './types'
import type { AdsPowerClient, AdsPowerProfile, CreateProfileBody, LocalApiConfig, LocalApiReply, StartedBrowser } from './types'

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
    async startBrowser(profileId, options = {}) {
      // Headed always (rule 11's intent for every browser), no IP-check tab, no restored tabs: the host opens its own.
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
    }
  }
}
