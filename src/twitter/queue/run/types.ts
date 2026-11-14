import type { TwitterSessionAnswer } from '../../account/session/index'
import type { EventKind, PlanEvent, Queue, QueueItem, RandomPlan, Rng } from '../plan/index'

export const LATE_SECONDS = 10 * 60
export const POLL_SECONDS = 5
export const DROP_WAIT_MIN_SECONDS = 60
export const DROP_WAIT_MAX_SECONDS = 180
export const MAX_DROPS = 3

export type RunEvent = { type: 'BEGIN' }

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

export type FailureKind = 'auth' | 'gone' | 'tooBig' | 'refused' | 'network' | 'broken'

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

export type RunStop =
  | { kind: 'halt'; message: string }
  | { kind: 'refused'; what: string; n: number; failure: FailureKind; refusal: XRefusal }
  | { kind: 'cancelled'; where: string }

export interface RunInput {
  queue: Queue
  deps: RunDeps
}

export interface RunContext {
  queue: Queue
  plan: RandomPlan
  deps: RunDeps
  todo: PlanEvent[]
  nudged: number
  drops: number
  lastActed: number
  event: PlanEvent | null
  item: QueueItem | null
  pauseMs: number
  answer: TwitterSessionAnswer | null
  answeredAt: string
  stop: RunStop | null
  result: RunResult | null
  crashed: boolean
  error?: unknown
}

export interface RunOutput {
  result: RunResult | null
  crashed: boolean
  error?: unknown
}
