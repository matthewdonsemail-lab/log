import type { ConnectionPlatform } from '../connections'

/**
 * A client-task is the dashboard-side half of a long-lived platform job:
 * the manager (dashboard/mock store) holds intent + drafts + lease, the
 * browser client (Camoufox) holds the live modal/session. The two meet at
 * `communityId` + `questionsHash`. Tasks never silently complete — a dead
 * client (no heartbeat past the lease) marks its tasks `abandoned` or
 * `expired`, preserving drafts for resume.
 */
export type ClientTaskState =
  | 'queued'
  | 'running'
  | 'awaiting_input'
  | 'submitting'
  | 'done'
  | 'failed'
  | 'abandoned'
  | 'expired'

export interface ClientTask {
  id: string
  communityId: string
  platform: ConnectionPlatform
  accountId: string | null
  state: ClientTaskState
  questions: string[]
  questionsHash: string | null
  draftAnswers: string[]
  /** ISO; renewed by heartbeat, checked by CHECK_LEASE. */
  leaseExpiresAt: string | null
  attempts: number
  lastError: string | null
  createdAt: string
  updatedAt: string
}

export type ClientTaskEvent =
  | { type: 'START' }
  | { type: 'DISPATCHED'; at: string; leaseMs?: number }
  | { type: 'QUESTIONS_RECEIVED'; questions: string[]; questionsHash: string; at: string; leaseMs?: number }
  | { type: 'ANSWERS_UPDATED'; draftAnswers: string[]; at: string }
  | { type: 'HEARTBEAT'; at: string; leaseMs?: number }
  | { type: 'SUBMIT'; at: string }
  | { type: 'SUBMIT_OK'; at: string }
  | { type: 'SUBMIT_FAIL'; error: string; at: string }
  | { type: 'CHECK_LEASE'; now: string }
  | { type: 'CANCEL'; at: string }
  | { type: 'RESUME'; at: string; leaseMs?: number }

export interface ClientTaskInput {
  communityId: string
  platform: ConnectionPlatform
  accountId?: string | null
  at?: string
}

/** Default lease for an open client job before it reads as expired. */
export const CLIENT_TASK_LEASE_MS = 5 * 60 * 1000
