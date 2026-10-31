import { beforeEach, describe, expect, it } from 'vitest'
import { createActor } from 'xstate'
import { clientTaskMachine } from './machine'
import { createTask, getTask, listTasks, sendTaskEvent, taskForCommunity } from './store'
import type { ClientTaskEvent, ClientTaskState } from './types'
import { CLIENT_TASK_LEASE_MS } from './types'
import type { ClientTaskContext } from './machine'

const T0 = '2026-09-16T12:00:00.000Z'
const plus = (iso: string, ms: number) => new Date(Date.parse(iso) + ms).toISOString()

/** Standing actor across sends — time passes only through event timestamps. */
function session(communityId = 'task-test-session') {
  const actor = createActor(clientTaskMachine, {
    input: { communityId, platform: 'facebook', accountId: 'fb-galway-rubbish', at: T0 }
  })
  actor.start()
  return {
    send(event: ClientTaskEvent) {
      actor.send(event)
      const snapshot = actor.getSnapshot()
      return { value: snapshot.value as ClientTaskState, context: snapshot.context as ClientTaskContext }
    },
    stop() {
      actor.stop()
    }
  }
}

describe('client task lifecycle', () => {
  it('walks queued to done through questions, drafts, and submit', () => {
    const s = session()
    expect(s.send({ type: 'START' }).value).toBe('running')
    s.send({ type: 'DISPATCHED', at: T0 })
    const snap = s.send({ type: 'QUESTIONS_RECEIVED', questions: ['q1', 'q2'], questionsHash: 'h1', at: T0 })
    expect(snap.value).toBe('awaiting_input')
    expect(snap.context.questions).toEqual(['q1', 'q2'])
    expect(snap.context.leaseExpiresAt).toBe(plus(T0, CLIENT_TASK_LEASE_MS))
    s.stop()
  })

  it('expires a silent task and resumes it with a fresh lease', () => {
    const s = session()
    s.send({ type: 'START' })
    s.send({ type: 'DISPATCHED', at: T0 })
    s.send({ type: 'QUESTIONS_RECEIVED', questions: ['q1'], questionsHash: 'h1', at: T0 })
    // a live lease holds
    expect(s.send({ type: 'CHECK_LEASE', now: plus(T0, 1000) }).value).toBe('awaiting_input')
    // the lease lapses without a heartbeat
    expect(s.send({ type: 'CHECK_LEASE', now: plus(T0, CLIENT_TASK_LEASE_MS + 1000) }).value).toBe('expired')
    s.stop()

    const r = session()
    r.send({ type: 'START' })
    r.send({ type: 'DISPATCHED', at: T0 })
    r.send({ type: 'QUESTIONS_RECEIVED', questions: ['q1'], questionsHash: 'h1', at: T0 })
    // heartbeat renews from its own timestamp
    r.send({ type: 'HEARTBEAT', at: plus(T0, 60_000) })
    expect(r.send({ type: 'CHECK_LEASE', now: plus(T0, CLIENT_TASK_LEASE_MS + 30_000) }).value).toBe(
      'awaiting_input'
    )
    r.stop()

    const late = session()
    late.send({ type: 'START' })
    late.send({ type: 'DISPATCHED', at: T0 })
    late.send({ type: 'QUESTIONS_RECEIVED', questions: ['q1'], questionsHash: 'h1', at: T0 })
    // …but a heartbeat past the lease cannot resurrect — resume must
    expect(late.send({ type: 'HEARTBEAT', at: plus(T0, CLIENT_TASK_LEASE_MS + 1000) }).value).toBe('expired')
    expect(late.send({ type: 'RESUME', at: plus(T0, CLIENT_TASK_LEASE_MS + 2000) }).value).toBe('awaiting_input')
    expect(
      late.send({ type: 'CHECK_LEASE', now: plus(T0, 2 * CLIENT_TASK_LEASE_MS) }).value
    ).toBe('awaiting_input')
    late.stop()
  })

  it('keeps drafts across submit failure and abandons on cancel', () => {
    const s = session()
    s.send({ type: 'START' })
    s.send({ type: 'DISPATCHED', at: T0 })
    s.send({ type: 'QUESTIONS_RECEIVED', questions: ['q1', 'q2'], questionsHash: 'h1', at: T0 })
    s.send({ type: 'ANSWERS_UPDATED', draftAnswers: ['a1', ''], at: T0 })
    s.send({ type: 'SUBMIT', at: T0 })
    const snap = s.send({ type: 'SUBMIT_FAIL', error: 'modal closed', at: T0 })
    expect(snap.value).toBe('awaiting_input')
    expect(snap.context.draftAnswers).toEqual(['a1', ''])
    expect(snap.context.lastError).toBe('modal closed')
    expect(s.send({ type: 'CANCEL', at: T0 }).value).toBe('abandoned')
    s.stop()
  })
})

describe('client task store', () => {
  beforeEach(() => {
    for (const task of listTasks()) {
      if (task.communityId.startsWith('task-test-')) {
        sendTaskEvent(task.id, [{ type: 'CANCEL', at: T0 }])
      }
    }
  })

  it('creates, advances, and reads leases on access', () => {
    const created = createTask({
      communityId: 'task-test-group',
      platform: 'facebook',
      accountId: 'fb-galway-rubbish',
      start: true,
      at: T0
    })
    expect(created.state).toBe('running')
    const advanced = sendTaskEvent(created.id, [
      { type: 'DISPATCHED', at: T0 },
      { type: 'QUESTIONS_RECEIVED', questions: ['q1'], questionsHash: 'h1', at: T0 },
      { type: 'ANSWERS_UPDATED', draftAnswers: ['kept'], at: T0 }
    ])
    expect(advanced?.state).toBe('awaiting_input')
    expect(advanced?.draftAnswers).toEqual(['kept'])
    expect(getTask(created.id)?.id).toBe(created.id)
    // fresh lease reads back the task untouched
    const live = taskForCommunity('task-test-group', plus(T0, 1000))
    expect(live?.state).toBe('awaiting_input')
    // a read past the lease flips it to expired (drafts preserved)
    const stale = taskForCommunity('task-test-group', plus(T0, CLIENT_TASK_LEASE_MS + 1000))
    expect(stale?.state).toBe('expired')
    expect(stale?.draftAnswers).toEqual(['kept'])
    // done tasks are not resume candidates
    const done = sendTaskEvent(created.id, [
      { type: 'RESUME', at: plus(T0, CLIENT_TASK_LEASE_MS + 2000) },
      { type: 'SUBMIT', at: plus(T0, CLIENT_TASK_LEASE_MS + 2000) },
      { type: 'SUBMIT_OK', at: plus(T0, CLIENT_TASK_LEASE_MS + 2000) }
    ])
    expect(done?.state).toBe('done')
    expect(taskForCommunity('task-test-group')).toBeNull()
  })

  it('returns null for unknown tasks and events', () => {
    expect(getTask('00000000-0000-4000-8000-000000000000')).toBeNull()
    expect(sendTaskEvent('00000000-0000-4000-8000-000000000000', [{ type: 'START' }])).toBeNull()
  })
})
