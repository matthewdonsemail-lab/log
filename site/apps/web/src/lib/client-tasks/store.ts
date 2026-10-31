import { createActor } from 'xstate'
import { uuid } from '../ids'
import { isArray, isRecord, loadPersistedState, savePersistedState } from '../persist'
import { clientTaskMachine, type ClientTaskContext } from './machine'
import type { ClientTask, ClientTaskEvent, ClientTaskInput, ClientTaskState } from './types'

/**
 * In-memory client-task registry (mock side of the manager ↔ client
 * contract). Tasks persist across refresh like the community joins do, so
 * an abandoned modal is still resumable after the dashboard reloads. The
 * live backend (Convex) will own this table; the machine stays identical.
 */

const TASKS_KEY = 'client-tasks.v1'

function isTaskRecord(value: unknown): value is Record<string, ClientTask> {
  if (!isRecord(value)) return false
  return Object.values(value).every(
    (row) =>
      isRecord(row) &&
      typeof row.id === 'string' &&
      typeof row.communityId === 'string' &&
      typeof row.platform === 'string' &&
      typeof row.state === 'string' &&
      isArray(row.questions) &&
      isArray(row.draftAnswers)
  )
}

const tasks: Record<string, ClientTask> = loadPersistedState(TASKS_KEY, isTaskRecord) ?? {}

function persistTasks(): void {
  savePersistedState(TASKS_KEY, tasks)
}

/** Drive one task through events and persist the snapshot. */
export function sendTaskEvent(id: string, events: ClientTaskEvent | ClientTaskEvent[]): ClientTask | null {
  const existing = tasks[id]
  if (!existing) return null
  const actor = actorFor(existing)
  for (const event of Array.isArray(events) ? events : [events]) actor.send(event)
  const snapshot = actor.getSnapshot()
  const next: ClientTask = {
    ...existing,
    state: snapshot.value as ClientTaskState,
    questions: snapshot.context.questions,
    questionsHash: snapshot.context.questionsHash,
    draftAnswers: snapshot.context.draftAnswers,
    leaseExpiresAt: snapshot.context.leaseExpiresAt,
    attempts: snapshot.context.attempts,
    lastError: snapshot.context.lastError,
    updatedAt: snapshot.context.updatedAt
  }
  tasks[id] = next
  persistTasks()
  return next
}

/**
 * Standing actor per task — the machine is stateful across requests within
 * a session, while the flat record stays the persisted truth across
 * reloads. A task with no standing actor replays its record to rebuild it.
 */
const actors = new Map<
  string,
  {
    send: (event: ClientTaskEvent) => void
    getSnapshot: () => { value: unknown; context: ClientTaskContext }
  }
>()

function actorFor(task: ClientTask) {
  const live = actors.get(task.id)
  if (live) return live
  const actor = createActor(clientTaskMachine, {
    input: {
      communityId: task.communityId,
      platform: task.platform,
      accountId: task.accountId,
      at: task.createdAt
    } satisfies ClientTaskInput
  })
  actor.start()
  for (const event of bootstrapTaskEvents(task)) actor.send(event)
  actors.set(task.id, actor)
  return actor
}

/**
 * Replay a persisted record into the events that rebuild its actor node —
 * the same ephemeral-actor contract as the community machines. Attempts
 * replay informationally (order preserved, timestamps from the record).
 */
function bootstrapTaskEvents(task: ClientTask): ClientTaskEvent[] {
  if (task.state === 'queued') return []
  const events: ClientTaskEvent[] = [{ type: 'START' }]
  if (task.state === 'running') return events
  events.push({ type: 'DISPATCHED', at: task.createdAt })
  events.push({
    type: 'QUESTIONS_RECEIVED',
    questions: task.questions,
    questionsHash: task.questionsHash ?? '',
    at: task.createdAt
  })
  if (task.draftAnswers.length > 0) {
    events.push({ type: 'ANSWERS_UPDATED', draftAnswers: task.draftAnswers, at: task.createdAt })
  }
  if (task.state === 'awaiting_input') return events
  events.push({ type: 'SUBMIT', at: task.createdAt })
  if (task.state === 'submitting') return events
  if (task.state === 'done') return [...events, { type: 'SUBMIT_OK', at: task.createdAt }]
  if (task.state === 'failed') {
    return [...events, { type: 'SUBMIT_FAIL', error: task.lastError ?? 'failed', at: task.createdAt }]
  }
  if (task.state === 'abandoned') return [...events, { type: 'CANCEL', at: task.createdAt }]
  const leaseNow = task.leaseExpiresAt
    ? new Date(Date.parse(task.leaseExpiresAt) + 1000).toISOString()
    : task.createdAt
  return [...events, { type: 'CHECK_LEASE', now: leaseNow }]
}

/** Create a task in `queued` (already STARTed when `start` is true). */
export function createTask(
  input: ClientTaskInput & { start?: boolean; at?: string }
): ClientTask {
  const now = input.at ?? new Date().toISOString()
  const id = uuid()
  const base: Omit<ClientTask, 'state'> = {
    id,
    communityId: input.communityId,
    platform: input.platform,
    accountId: input.accountId ?? null,
    questions: [],
    questionsHash: null,
    draftAnswers: [],
    leaseExpiresAt: null,
    attempts: 0,
    lastError: null,
    createdAt: now,
    updatedAt: now
  }
  tasks[id] = { ...base, state: 'queued' }
  persistTasks()
  if (input.start) return sendTaskEvent(id, [{ type: 'START' }]) ?? tasks[id]
  return tasks[id]
}

/** Latest non-terminal task for a community (resume candidate), if any. */
export function taskForCommunity(communityId: string, nowIso?: string): ClientTask | null {
  const rows = Object.values(tasks)
    .filter((row) => row.communityId === communityId && row.state !== 'done')
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  const top = rows[0] ?? null
  if (!top || !nowIso || top.state !== 'awaiting_input') return top
  // Lease check on read: a stale awaiting task reads as expired without
  // waiting for the next event to say so.
  if (top.leaseExpiresAt && Date.parse(nowIso) > Date.parse(top.leaseExpiresAt)) {
    return sendTaskEvent(top.id, [{ type: 'CHECK_LEASE', now: nowIso }])
  }
  return top
}

export function getTask(id: string): ClientTask | null {
  return tasks[id] ?? null
}

export function listTasks(): ClientTask[] {
  return Object.values(tasks).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}
