/**
 * AdsPower's Local API (the AdsPower app on this machine, default
 * `http://local.adspower.net:50325`), the browser Listaro ran on and the one
 * SubQ ranked first on our recorded issues (matt, 2026-10-19). Endpoints and
 * fields: RESEARCH/MARKETPLACE_PROVIDERS/antidetectBrowsers/adsPower/DOCS.md.
 * AdsPower's own snake_case is kept only in the wire types below; everything
 * log-cli reads is camelCase (rule 1, converted at this boundary).
 */
import type { BrowserCapabilities } from '../driver/types'

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

/**
 * One AdsPower profile per Facebook account in Twenty (`socialAccounts`). Twenty stays the
 * only place accounts live (rule 13): the profile is the browser for that account, linked
 * by `socialAccounts.adsPowerProfileId`, and named by its accountName. The profile is made
 * with no proxy, password, cookies or 2FA key: those stay in Twenty only, and the proxy is
 * put on the profile by the gate right before it opens (rule 12, `browser/driver`).
 */

/** The AdsPower group every log-cli profile goes in. */
export const ADS_POWER_GROUP = 'logCli'

/** Accounts with these statuses get no profile: their records stay in Twenty, unused (rule 13). */
export const NO_PROFILE_STATUSES = ['banned', 'dead'] as const

/** What `log adsPower sync` does for one account. */
export type ProfileSyncAction =
  /** Already linked to a profile that exists. */
  | 'linked'
  /** A profile with this account's Twenty id in its remark exists but Twenty lost the link: relink it. */
  | 'relink'
  /** No profile yet: make one. */
  | 'create'
  /** Banned or dead, or no home country we can pin a locale for: no profile. */
  | 'skip'

export interface ProfileSyncEntry {
  accountId: string
  accountName: string
  action: ProfileSyncAction
  profileId: string | null
  /** Why it is skipped, or what went wrong applying it. */
  note: string | null
}

export interface ProfileSyncResult {
  applied: boolean
  entries: ProfileSyncEntry[]
}

/** AdsPower's row of the parity table (rule 44, docs/browsers.md). */
export const adsPowerCapabilities = {
  headedWindow: { status: 'built', how: 'Local API start with headless "0" (python/adsPowerBrowser.py); on a server the window renders on Xvfb' },
  proxyGate: { status: 'built', how: 'proxyGate.gate_attached() before the profile starts; the proxy is put on the profile only then' },
  selfCheck: { status: 'built', how: 'proxyGate.check_attached() on the CDP context, the same verdict as Camoufox' },
  sessionHar: { status: 'built', how: 'harRecorder.SessionHar from the context events, written as session.har at close' },
  stepHar: { status: 'built', how: "harRecorder.Recorder, the inspect session's per-step HAR" },
  humanMouse: { status: 'built', how: 'HumanMouse on the Playwright page (no cursor is drawn: nothing is injected)' },
  scrollMotion: { status: 'built', how: 'scrollMotion wheel trajectories on the Playwright page' },
  devicePinned: { status: 'built', how: "the account's one AdsPower profile (fingerprint kept by AdsPower), linked in socialAccounts.adsPowerProfileId" },
  localePinned: { status: 'built', how: "the profile's language from HOME_COUNTRIES; the self-check checks it" },
  sessionCarried: { status: 'built', how: "the profile keeps its own cookies; Twenty's session is carried in once when it has none" },
  sessionSaved: { status: 'built', how: 'saveState writes the context storage state, saved to Twenty' },
  inspectSession: { status: 'built', how: 'python/browserDriver.py open_ads_power' },
  syncSessions: { status: 'notBuilt', how: 'publishSession, connectSession and profileSession still launch Camoufox (sync API)' },
  oneMachineAtATime: { status: 'notBuilt', how: 'cloud-active before open (docs/deployment.md)' }
} as const satisfies BrowserCapabilities
