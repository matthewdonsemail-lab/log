import type { TwitterSessionAnswer } from '../../account/session/index'
import type { EventKind, PlanEvent, QueueItem, Rng } from '../plan/index'

export const LATE_SECONDS = 10 * 60
export const POLL_SECONDS = 5
export const DROP_WAIT_MIN_SECONDS = 60
export const DROP_WAIT_MAX_SECONDS = 180
export const MAX_DROPS = 3

export type RunEvent =
  | { type: 'BEGIN' }
  | { type: 'LIKE_DUE' }
  | { type: 'REPLY_DUE' }
  | { type: 'ACTED' }
  | { type: 'DROPPED' }
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
  contextChanged: (item: QueueItem) => Promise<string[]>
  keepOpen?: boolean
  save: () => void
  cancelled?: () => boolean
}

export type FailureKind = 'auth' | 'gone' | 'refused' | 'network' | 'broken'

export interface XRefusal {
  code: string
  detail: string
  at: string
}

export interface RunResult {
  state: 'finished' | 'halted'
  reason: string | null
  sent: number
  skipped: number
  refusal?: XRefusal
}
