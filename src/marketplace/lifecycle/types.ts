/**
 * One Facebook account's whole life in log-cli, as one XState machine (rule 35,
 * top of AGENTS.md): the browser is opened once per local day and stays open;
 * every action is a step inside it.
 *
 * Two lanes:
 *   - onboarding: import → proxy → open the browser (gate, device, self-check)
 *     → sign in → account check → profile (photo, cover) → name → Marketplace
 *     location → a day's warm-up → attached;
 *   - host: open ⇄ watching ⇄ acting, resting at night, reopened in the morning.
 * Interruptions (needs a person, needs a sign-in, rate limited, paused) leave
 * either lane and come back to the exact step they left (XState history).
 * Restricted, banned and dead are final: the record stays in Twenty (rule 13).
 *
 * Every side effect is an actor the caller provides (`machine.provide`), as in
 * the monitor machine: tests script them and never open a browser.
 */
import type { AccountIssue } from '../account/types'

/** What any step that touches Facebook reports. */
export type StepOutcome =
  | { kind: 'ok'; detail?: string; endOfDay?: boolean }
  /** The page showed an account problem (catalog `account` layer): its status follows from `statusForIssue`. */
  | { kind: 'issue'; issue: AccountIssue; detail?: string }
  /** Something broke (proxy down, page changed, crash). Retryable ones are tried once more. */
  | { kind: 'error'; code: string; detail?: string; retryable: boolean }

/**
 * Listaro's warm-up actions (`Listaro_backup/src/lib/account-warmup.ts`), in its
 * stage order, run through one day in the browser that stays open instead of one
 * stage per two days with a browser per session. Each is read-only on Facebook
 * except the likes in `feedBrowse`, which only happen with `liveActions` (rule 8).
 */
export const WARMUP_ACTIVITIES = [
  /** Stage 1 (`runStage1`, :92-130): the home feed, 4-7 scrolls, 2-3 likes (live only), then a look at Marketplace. */
  'feedBrowse',
  /** Stage 2 (`runStage2`, :135-174): Marketplace, 3-5 scrolls, open 2-4 listings and read each. */
  'marketplaceBrowse',
  /** Stage 3 (`runStage3`, :181-209): open /marketplace/create/item and check it stays there (posting allowed). */
  'createAccessCheck',
  /** Stage 4 (`runStage4or5`, :214-246): Marketplace, 4-7 scrolls, then Marketplace > Selling. */
  'sellingVisit',
  /** Stage 5 (`runStage4or5`): stage 4 and then Messages. */
  'messagesVisit'
] as const
export type WarmupActivity = (typeof WARMUP_ACTIVITIES)[number]

/** Why the browser closed. Every close carries one (rule 35); there is no silent close. */
export type CloseReason = 'endOfActiveHours' | 'shutdown' | 'rateLimited' | 'restricted' | 'accountLost' | 'crash'

export interface BrowserLog {
  open: boolean
  /** Opens on the account's current local day (one, plus one crash reopen). */
  opensToday: number
  closes: { reason: CloseReason; at: string }[]
}

/** What the host is asked to do inside the open browser. */
export type HostAction = { kind: 'publish'; agencyListingId: string; live: boolean } | { kind: 'reply'; conversationId: string; text: string }

export interface LifecycleTiming {
  /** How long the warm-up lasts once the name is set (matt: a day). */
  warmupMs: number
  /** Pause between warm-up activities, spread through the day. */
  activityGapMs: number
  /** Between host checks of Selling, the inbox and notifications. */
  watchIntervalMs: number
  /** Before the one retry of a retryable error. */
  retryMs: number
  /** A rate limit: how long the account rests. */
  limitedRestMs: number
}

export const DEFAULT_LIFECYCLE_TIMING: LifecycleTiming = {
  warmupMs: 24 * 60 * 60 * 1000,
  // Five activities across the account's waking day (14 h): one every ~2.5 h.
  activityGapMs: 150 * 60 * 1000,
  watchIntervalMs: 12 * 60 * 1000,
  retryMs: 60 * 1000,
  limitedRestMs: 24 * 60 * 60 * 1000
}

/** One open per local day, and one reopen after a crash (rule 35). */
export const OPENS_PER_DAY = 2

/** Where an account stands, from Twenty, so the machine starts at the right step. */
export interface AccountStanding {
  accountId: string
  status: string | null
  hasProxy: boolean
  /** Cookies saved: it has signed in through us before. */
  hasSession: boolean
  profileSet: boolean
  /** socialAccounts.profileName is set, and the profile already carries it. */
  wantsName: boolean
  named: boolean
  /** The create form lists in the account's home city. */
  locationSet: boolean
  /** When its warm-up began, or null. */
  warmupStartedAt: string | null
  /** When its warm-up finished (it was attached to its host), or null. */
  warmedAt: string | null
}

export interface LifecycleInput {
  standing: AccountStanding
  /** Likes in the warm-up, publishing and replies act on Facebook: only with matt's go (rule 8). */
  liveActions: boolean
  timing?: Partial<LifecycleTiming>
  now?: () => number
}

export interface LifecycleContext {
  accountId: string
  liveActions: boolean
  timing: LifecycleTiming
  standing: AccountStanding
  browser: BrowserLog
  warmup: { startedAt: number | null; done: WarmupActivity[] }
  /** The last account problem, and the status it put the account in. */
  issue: { code: AccountIssue; detail?: string } | null
  lastError: { code: string; detail?: string } | null
  retried: boolean
  actions: { action: HostAction; outcome: StepOutcome['kind'] }[]
  checks: number
  /** The order the steps ran in, for the run log and the tests. */
  trail: string[]
  /** The account check ran in this browser since the last sign-in or person. */
  checked: boolean
  /** The action `acting` is doing. */
  pending: HostAction | null
  /** The clock (tests pass their own). */
  now: () => number
}

export type LifecycleEvent =
  | { type: 'PERSON_DONE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SHUTDOWN' }
  | { type: 'ACT'; action: HostAction }
  | { type: 'LOST' }

/** The inputs each actor gets. */
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
  /** Resolves when the account's active hours begin (rule 18). */
  waitForActiveHours: { accountId: string }
  saveState: { accountId: string; state: string; context: Pick<LifecycleContext, 'warmup' | 'browser' | 'issue'> }
}
