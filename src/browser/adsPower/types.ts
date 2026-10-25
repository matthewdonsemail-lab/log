import type { BrowserCapabilities } from '../driver/types'

export interface LocalApiConfig {
  baseUrl: string
  apiKey: string | null
}

export const DEFAULT_LOCAL_API_URL = 'http://local.adspower.net:50325'

export interface AdsPowerProfile {
  profileId: string
  profileNo: string | null
  name: string
  groupId: string | null
  remark: string | null
  lastOpenTime: string | null
}

export interface StartedBrowser {
  profileId: string
  cdpUrl: string
  debugPort: string | null
}

export interface CreateProfileBody {
  name: string
  group_id: string
  remark?: string
  platform?: string
  user_proxy_config: Record<string, string>
  fingerprint_config: Record<string, unknown>
}

export interface LocalApiReply<T = unknown> {
  code: number
  msg: string
  data?: T
}

export interface AdsPowerClient {
  status(): Promise<boolean>
  listProfiles(): Promise<AdsPowerProfile[]>
  ensureGroup(name: string): Promise<string>
  createProfile(body: CreateProfileBody): Promise<{ profileId: string; profileNo: string | null }>
  updateProfile(profileId: string, fields: Record<string, unknown>): Promise<void>
  deleteProfiles(profileIds: string[]): Promise<void>
  startBrowser(profileId: string, options?: { launchArgs?: string[] }): Promise<StartedBrowser>
  activeBrowser(profileId: string): Promise<StartedBrowser | null>
  stopBrowser(profileId: string): Promise<void>
  kernels(): Promise<AdsPowerKernel[]>
  downloadKernel(version: string): Promise<KernelDownload>
  profileUserAgents(profileIds: string[]): Promise<Record<string, string>>
}

export interface AdsPowerKernel {
  version: string
  downloaded: boolean
}

export interface KernelDownload {
  status: string
  progress: number | null
}

export class AdsPowerError extends Error {
  constructor(
    readonly code: 'adsPowerUnavailable' | 'adsPowerRequestFailed' | 'adsPowerRateLimited',
    readonly detail: string
  ) {
    super(`${code}: ${detail}`)
    this.name = 'AdsPowerError'
  }
}

export const ADS_POWER_GROUP = 'logCli'

export const NO_PROFILE_STATUSES = ['banned', 'dead'] as const

export const RELEASE_STATUSES = ['deactivated'] as const

export const ADS_POWER_HOMES_ENV = 'LOG_ADSPOWER_HOMES'

export type ProfileSyncAction =
  | 'linked'
  | 'relink'
  | 'create'
  | 'release'
  | 'skip'

export interface ProfileSyncEntry {
  accountId: string
  accountName: string
  action: ProfileSyncAction
  profileId: string | null
  note: string | null
}

export interface ProfileSyncResult {
  applied: boolean
  entries: ProfileSyncEntry[]
}

export const adsPowerCapabilities = {
  headedWindow: { status: 'built', how: 'Local API start with headless "0" (python/browser/adsPowerBrowser.py); on a server the window renders on Xvfb' },
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
  inspectSession: { status: 'built', how: 'python/browser/browserDriver.py open_ads_power' },
  syncSessions: { status: 'notBuilt', how: 'publishSession, connectSession and profileSession still launch Camoufox (sync API)' },
  oneMachineAtATime: { status: 'notBuilt', how: 'cloud-active before open (docs/deployment.md)' }
} as const satisfies BrowserCapabilities
