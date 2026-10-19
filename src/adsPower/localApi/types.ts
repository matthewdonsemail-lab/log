/**
 * AdsPower's Local API (the AdsPower app on this machine, default
 * `http://local.adspower.net:50325`), the browser Listaro ran on and the one
 * SubQ ranked first on our recorded issues (matt, 2026-10-19). Endpoints and
 * fields: RESEARCH/MARKETPLACE_PROVIDERS/antidetectBrowsers/adsPower/DOCS.md.
 * AdsPower's own snake_case is kept only in the wire types below; everything
 * log-cli reads is camelCase (rule 1, converted at this boundary).
 */

/** Where the Local API is and its key (`ADSPOWER_HOST`, `ADSPOWER_API_KEY` in .env.local). Never printed. */
export interface LocalApiConfig {
  baseUrl: string
  apiKey: string | null
}

export const DEFAULT_LOCAL_API_URL = 'http://local.adspower.net:50325'

/** One AdsPower profile, as log-cli reads it. */
export interface AdsPowerProfile {
  profileId: string
  profileNo: string | null
  name: string
  groupId: string | null
  remark: string | null
  lastOpenTime: string | null
}

/** A started profile: where Playwright attaches over CDP. */
export interface StartedBrowser {
  profileId: string
  /** `ws.puppeteer`: the CDP websocket `connect_over_cdp` takes. */
  cdpUrl: string
  debugPort: string | null
}

/** The body of `POST /api/v2/browser-profile/create` (AdsPower's field names). */
export interface CreateProfileBody {
  name: string
  group_id: string
  remark?: string
  platform?: string
  user_proxy_config: Record<string, string>
  fingerprint_config: Record<string, unknown>
}

/** What every Local API answer looks like. */
export interface LocalApiReply<T = unknown> {
  code: number
  msg: string
  data?: T
}

export interface AdsPowerClient {
  /** `GET /status`: is the AdsPower app up and answering. */
  status(): Promise<boolean>
  /** Every profile (paged through, 100 at a time). */
  listProfiles(): Promise<AdsPowerProfile[]>
  /** The id of the group named `name`, made if missing. */
  ensureGroup(name: string): Promise<string>
  createProfile(body: CreateProfileBody): Promise<{ profileId: string; profileNo: string | null }>
  updateProfile(profileId: string, fields: Record<string, unknown>): Promise<void>
  startBrowser(profileId: string, options?: { launchArgs?: string[] }): Promise<StartedBrowser>
  /** The open browser of this profile, or null when it isn't open. */
  activeBrowser(profileId: string): Promise<StartedBrowser | null>
  stopBrowser(profileId: string): Promise<void>
}

/** Raised for any Local API failure, with a catalog code (`log errors --layer adsPower`). */
export class AdsPowerError extends Error {
  constructor(
    readonly code: 'adsPowerUnavailable' | 'adsPowerRequestFailed' | 'adsPowerRateLimited',
    readonly detail: string
  ) {
    super(`${code}: ${detail}`)
    this.name = 'AdsPowerError'
  }
}
