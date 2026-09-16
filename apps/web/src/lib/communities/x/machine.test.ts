import { describe, expect, it } from 'vitest'
import { createActor } from 'xstate'
import { driveMachine } from '../actors'
import {
  bootstrapXEvents,
  deriveXValue,
  resolveXObservation,
  xInputFromRow,
  xMachine,
  xMenu,
  xToJoinState,
  xUserVerdict,
  type XContext,
  type XEvent,
  type XStateValue
} from './machine'
import type { StoredCommunityJoin } from '../types'

/** Standing actor across sends — mirrors how the store and clients drive the machine. */
function session() {
  const actor = createActor(xMachine, { input: { accountId: null } })
  actor.start()
  return {
    send(event: XEvent) {
      actor.send(event)
      const snapshot = actor.getSnapshot()
      return { value: snapshot.value as XStateValue, context: snapshot.context }
    },
    stop() {
      actor.stop()
    }
  }
}

function storedRow(overrides: Partial<StoredCommunityJoin> = {}): StoredCommunityJoin {
  return {
    state: 'none',
    accountId: null,
    answers: [],
    answersComplete: false,
    questionsHash: null,
    questionsScrapedAt: null,
    scrapedQuestions: null,
    draftAnswers: [],
    submittedAt: null,
    formPhase: 'idle',
    priorJoinState: null,
    subredditType: null,
    userIsContributor: false,
    quarantineOptIn: false,
    karmaGated: false,
    karmaEvidence: null,
    accessRequested: false,
    ...overrides
  }
}

describe('x subscribe flow', () => {
  it('subscribes and unsubscribes with no gates', () => {
    const s = session()
    let snap = s.send({ type: 'SUBSCRIBE' })
    expect(snap.value).toBe('subscribed')
    expect(xToJoinState(snap.value)).toBe('accepted')
    expect(xUserVerdict(snap.value, {}, 'subscribe').allowed).toBe(false)
    snap = s.send({ type: 'UNSUBSCRIBE' })
    expect(snap.value).toBe('unsubscribed')
    expect(xToJoinState(snap.value)).toBe('none')
    s.stop()
  })

  it('refuses writes under a gated account and restores walls', () => {
    expect(xUserVerdict('unsubscribed', { accountIssue: 'suspended' }, 'subscribe').allowed).toBe(false)
    const s = session()
    s.send({ type: 'SUBSCRIBE' })
    const snap = s.send({ type: 'OBSERVE_WALL', wallType: 'login' })
    expect(snap.value).toBe('observationWall')
    expect(xToJoinState(snap.value, snap.context.wallType)).toBe('login-wall')
    expect(xMenu('observationWall', {}).join).toBe(false)
    const restored = resolveXObservation(snap.context)
    expect(restored.value).toBe('subscribed')
    s.stop()
  })

  it('menus and bootstrap stay trivial', () => {
    expect(xMenu('unsubscribed', {})).toEqual({ join: true, withdraw: false, leave: false })
    expect(xMenu('subscribed', {})).toEqual({ join: false, withdraw: false, leave: true })
    expect(deriveXValue(storedRow({ state: 'accepted' }))).toBe('subscribed')
    expect(deriveXValue(storedRow({ state: 'login-wall' }))).toBe('observationWall')
    const replayed = driveMachine<XStateValue, XContext>(
      xMachine,
      xInputFromRow(storedRow({ state: 'accepted' })),
      bootstrapXEvents(storedRow({ state: 'accepted' }))
    )
    expect(replayed.value).toBe('subscribed')
  })
})
