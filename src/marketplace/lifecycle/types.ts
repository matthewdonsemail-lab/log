import type { AccountIssue } from '../account/types'

export type StepOutcome =
  | { kind: 'ok'; detail?: string; endOfDay?: boolean }
  | { kind: 'issue'; issue: AccountIssue; detail?: string }
  | { kind: 'error'; code: string; detail?: string; retryable: boolean }

export const WARMUP_ACTIVITIES = [
  'feedBrowse',
  'marketplaceBrowse',
  'createAccessCheck',
  'sellingVisit',
  'messagesVisit'
] as const
export type WarmupActivity = (typeof WARMUP_ACTIVITIES)[number]

export type CloseReason = 'endOfActiveHours' | 'shutdown' | 'rateLimited' | 'restricted' | 'accountLost' | 'crash'

export interface BrowserLog {
  open: boolean
  opensToday: number
  closes: { reason: CloseReason; at: string }[]
}

export type HostAction = { kind: 'publish'; agencyListingId: string; live: boolean } | { kind: 'reply'; conversationId: string; text: string }

export interface LifecycleTiming {
  warmupMs: number
  activityGapMs: number
  watchIntervalMs: number
  retryMs: number
  limitedRestMs: number
}

export const DEFAULT_LIFECYCLE_TIMING: LifecycleTiming = {
  warmupMs: 24 * 60 * 60 * 1000,
  activityGapMs: 150 * 60 * 1000,
  watchIntervalMs: 12 * 60 * 1000,
  retryMs: 60 * 1000,
  limitedRestMs: 24 * 60 * 60 * 1000
}

export const OPENS_PER_DAY = 2

export interface AccountStanding {
  accountId: string
  status: string | null
  hasProxy: boolean
  hasSession: boolean
  profileSet: boolean
  wantsName: boolean
  named: boolean
  locationSet: boolean
  warmupStartedAt: string | null
  warmedAt: string | null
}

export interface LifecycleInput {
  standing: AccountStanding
  liveActions: boolean
  timing?: Partial<LifecycleTiming>
  resume?: { warmupDone?: WarmupActivity[]; warmupStartedAt?: number | null; opensToday?: number }
}

export interface LifecycleContext {
  accountId: string
  liveActions: boolean
  timing: LifecycleTiming
  standing: AccountStanding
  browser: BrowserLog
  warmup: { startedAt: number | null; done: WarmupActivity[] }
  issue: { code: AccountIssue; detail?: string } | null
  lastError: { code: string; detail?: string } | null
  retried: boolean
  actions: { action: HostAction; outcome: StepOutcome['kind'] }[]
  checks: number
  trail: string[]
  checked: boolean
  pending: HostAction | null
  signInTries: number
}

export type LifecycleEvent =
  | { type: 'PERSON_DONE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SHUTDOWN' }
  | { type: 'ACT'; action: HostAction }
  | { type: 'LOST' }

export interface LifecycleActorInputs {
  checkProxy: { accountId: string }
  openBrowser: { accountId: string; opensToday: number }
  closeBrowser: { accountId: string; reason: CloseReason }
  signIn: { accountId: string }
  checkAccount: { accountId: string }
  setProfile: { accountId: string; live: boolean }
  setName: { accountId: string; live: boolean }
  setLocation: { accountId: string; live: boolean }
  warmupActivity: { accountId: string; activity: WarmupActivity; live: boolean }
  watchCheck: { accountId: string }
  act: { accountId: string; action: HostAction }
  waitForActiveHours: { accountId: string }
  saveState: { accountId: string; state: string; context: Pick<LifecycleContext, 'warmup' | 'browser' | 'issue'> }
}
