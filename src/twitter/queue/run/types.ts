import type { TwitterSessionAnswer } from '../../account/session/index'
import type { EventKind, PlanEvent, QueueItem, Rng } from '../plan/index'

export const LATE_SECONDS = 10 * 60
export const POLL_SECONDS = 5
export const COOL_BASE_SECONDS = 15 * 60
export const COOL_CAP_SECONDS = 4 * 3600
export const MAX_COOLS = 5
export const DAY_SECONDS = 24 * 3600
export const DAILY_AFTER = 3

export type RunEvent =
  | { type: 'BEGIN' }
  | { type: 'LIKE_DUE' }
  | { type: 'REPLY_DUE' }
  | { type: 'ACTED' }
  | { type: 'COOL' }
  | { type: 'RESUME' }
  | { type: 'COMPLETE' }
  | { type: 'FAIL' }

export interface RunDeps {
  send: (item: QueueItem, kind: EventKind) => Promise<TwitterSessionAnswer>
  nowMs: () => number
  sleep: (ms: number) => Promise<void>
  rng: Rng
  log: (line: string) => void
  alert: (message: string, mention: boolean) => void
  takeNudge: () => number
  takeAdded?: () => PlanEvent[]
  contextChanged?: (item: QueueItem) => Promise<string[]>
  keepOpen?: boolean
  save: () => void
  cancelled?: () => boolean
}

export type FailureKind = 'auth' | 'gone' | 'throttle' | 'broken'

export interface RunResult {
  state: 'finished' | 'halted'
  reason: string | null
  sent: number
  skipped: number
}
