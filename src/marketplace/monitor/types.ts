/**
 * The listing monitor: one account's Marketplace > Selling, checked on a loop.
 *
 * Retry and relist rules come from two places:
 *  - facebook-camofox-client `domain_marketplace/relist.py` (itself "mirrored
 *    from the Listaro production spec"): distinct removal reasons, fatal
 *    stops, a repost budget, growing cooldowns, RETRY_EXHAUSTED.
 *  - Listaro's running code (Listaro_backup): the 3-same-error circuit
 *    breaker, one quick retry for transient errors, 24h recovery from a
 *    limit, the empty-scan safety guard, and the repost dedup guard.
 * The monitor only decides. It never posts, edits or deletes.
 */
import type { AccountIssue } from '../account/types'
import type { ListingStatus } from '../listing/types'

/** What a dashboard check sees (camofox `ListingHealthStatus`). */
export type ListingHealth =
  | 'ACTIVE'
  | 'UNDER_REVIEW'
  | 'DUPLICATE_TAKEDOWN'
  | 'DELETED_BY_FB'
  | 'POLICY_VIOLATION'
  | 'COMMERCE_BAN'
  | 'CHECKPOINT_REQUIRED'
  | 'SOLD'
  | 'RETRY_EXHAUSTED'
  | 'UNKNOWN'

export interface RelistPolicy {
  /** camofox: 2. Listaro's server path used 3, its agent path had no cap. */
  maxRepostAttempts: number
  /** Cooldown before the 1st repost (camofox 1h) and every later one (3h). */
  cooldownFirstMs: number
  cooldownLaterMs: number
}

export interface MonitorTiming {
  /** Between routine checks (camofox 4h). */
  pollIntervalMs: number
  /** Before retrying a transient failure (Listaro agent: 5s, once). */
  retryDelayMs: number
  /** How long a rate-limited account rests (Listaro: 24h). */
  limitedRestMs: number
}

export const DEFAULT_RELIST_POLICY: RelistPolicy = {
  maxRepostAttempts: 2,
  cooldownFirstMs: 60 * 60 * 1000,
  cooldownLaterMs: 3 * 60 * 60 * 1000
}

export const DEFAULT_MONITOR_TIMING: MonitorTiming = {
  pollIntervalMs: 4 * 60 * 60 * 1000,
  retryDelayMs: 5_000,
  limitedRestMs: 24 * 60 * 60 * 1000
}

/** Listaro's circuit breaker: 3 consecutive failures with the same code stop the account. */
export const CIRCUIT_BREAKER_THRESHOLD = 3
/** Listaro's agent: retryable errors get one more try. */
export const MAX_TRANSIENT_RETRIES = 1

/** One listing as the monitor tracks it across checks. */
export interface WatchedListing {
  listingId: string
  title: string
  /** Status log has on record for it. */
  knownStatus: ListingStatus
  /** Reposts already made for this listing (camofox `generation`). */
  generation: number
  /** True while a repost for it is already queued (Listaro's dedup guard). */
  repostPending?: boolean
}

export interface RelistDecision {
  listingId: string
  health: ListingHealth
  shouldRepost: boolean
  reason: string
  /** Wait this long before reposting. */
  cooldownMs: number
  nextGeneration: number
  /** Policy, ban or checkpoint: never repost, operator must look. */
  fatal: boolean
}

/** What one check returned, already classified. The scan actor never throws. */
export type CheckOutcome =
  | { kind: 'ok'; seen: { listingId: string; title: string | null; health: ListingHealth }[]; needsAttention: string[]; issue: AccountIssue | null }
  | { kind: 'issue'; issue: AccountIssue; detail: string }
  | { kind: 'error'; code: string; detail: string; retryable: boolean }

export interface MonitorInput {
  accountId: string
  listings: WatchedListing[]
  policy?: RelistPolicy
  timing?: MonitorTiming
  /** Checks to run before stopping; 0 = until stopped. */
  maxChecks?: number
}

export interface MonitorContext {
  accountId: string
  listings: WatchedListing[]
  policy: RelistPolicy
  timing: MonitorTiming
  maxChecks: number
  checks: number
  /** Consecutive failures with the same code (circuit breaker). */
  failure: { code: string; count: number } | null
  /** Quick retries spent on the current check. */
  retries: number
  issue: AccountIssue | null
  lastOutcome: CheckOutcome | null
  decisions: RelistDecision[]
  stopReason: string | null
}
