import type { PassTick } from '../../indexPass/types'

export const OWNER_PLATFORM = 'relate'

export const OWNER_ACCOUNT = 'graph'

export const OWNER_BATCH_MS = 200

export const OWNER_BATCH_EVENTS = 2000

export const OWNER_HEARTBEAT_MS = 2000

export const OWNER_STALE_MS = 15_000

export const OWNER_STALE_CONFIRM_MS = 10_000

export const OWNER_START_BACKOFF_MS = 20_000

export const OWNER_READ_MS = 3000

export const OWNER_REBUILD_MS = 600_000

export const OWNER_STOP_WAIT_MS = 10_000

export const OWNER_START_WAIT_MS = 90_000

export const OWNER_FAILURES_BEFORE_REBUILD = 5

export const OWNER_LIVE_STATUSES: readonly string[] = ['starting', 'building', 'streaming']

export interface OwnerRow {
  pid: number
  generation: number
  heartbeat: string
  status: string
  port: number
  token: string
  startedAt: string
  pidStartedAt: string | null
  staleSeenAt: string | null
}

export type OwnerClaim = { ok: true; generation: number } | { ok: false; holder: number; reason: string }

export type OwnerReply<T> = { ok: true; value: T } | { ok: false; code: string; error: string }

export interface OwnerStatus {
  pid: number
  generation: number
  file: string
  throughSeq: number
  head: number
  behind: number
  batches: number
  appliedEvents: number
  lastBatch: { events: number; ms: number; at: string } | null
  startedAt: string
  rebuilding: boolean
  reads: number
  failures: number
  pass: PassTick | null
}

export interface OwnerOptions {
  dbPath: string
  pid?: number
  log?: (line: string) => void
  batchMs?: number
  batchEvents?: number
  heartbeatMs?: number
  staleMs?: number
  staleConfirmMs?: number
  serve?: boolean
  stopped?: () => boolean
  beforeCommit?: () => Promise<void>
  alive?: (pid: number) => boolean
  startedOf?: (pid: number) => string | null
  kill?: (pid: number) => void
  sleep?: (ms: number) => Promise<void>
  facts?: { tick: () => Promise<unknown>; stop: () => void } | null
  pass?: { tick: () => Promise<unknown>; stop: () => void; last: () => unknown } | null
  bots?: { tick: () => Promise<unknown>; stop: () => void } | null
}

export type OwnerOutcome = { ok: true; batches: number; reason: string } | { ok: false; code: string; reason: string }

export type EnsureOutcome = 'alive' | 'started' | 'starting' | 'off'
