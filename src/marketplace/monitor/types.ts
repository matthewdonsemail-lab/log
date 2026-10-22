import type { ErrorCode } from '../../errors/catalog/index'
import type { AccountIssue } from '../account/types'
import type { ListingStatus } from '../listing/types'

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
  maxRepostAttempts: number
  cooldownFirstMs: number
  cooldownLaterMs: number
}

export interface MonitorTiming {
  pollIntervalMs: number
  retryDelayMs: number
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

export const CIRCUIT_BREAKER_THRESHOLD = 3
export const MAX_TRANSIENT_RETRIES = 1

export interface WatchedListing {
  listingId: string
  title: string
  knownStatus: ListingStatus
  generation: number
  repostPending?: boolean
}

export interface RelistDecision {
  listingId: string
  health: ListingHealth
  shouldRepost: boolean
  reason: string
  cooldownMs: number
  nextGeneration: number
  fatal: boolean
}

export type CheckOutcome =
  | { kind: 'ok'; seen: { listingId: string; title: string | null; health: ListingHealth }[]; needsAttention: string[]; issue: AccountIssue | null }
  | { kind: 'issue'; issue: AccountIssue; detail: string }
  | { kind: 'error'; code: ErrorCode; detail: string; retryable: boolean }

export interface MonitorInput {
  accountId: string
  listings: WatchedListing[]
  policy?: RelistPolicy
  timing?: MonitorTiming
  maxChecks?: number
}

export interface MonitorContext {
  accountId: string
  listings: WatchedListing[]
  policy: RelistPolicy
  timing: MonitorTiming
  maxChecks: number
  checks: number
  failure: { code: ErrorCode; count: number } | null
  retries: number
  issue: AccountIssue | null
  lastOutcome: CheckOutcome | null
  decisions: RelistDecision[]
  stopReason: string | null
}
