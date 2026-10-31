import { describe, expect, it } from 'vitest'
import { createActor } from 'xstate'
import { driveMachine } from '../actors'
import {
  canComment,
  canPost,
  canReadStream,
  isAutomodGated,
  isQuarantineGated
} from './assertions'
import {
  bootstrapRedditEvents,
  deriveRedditValue,
  normalizeSubredditType,
  redditInputFromRow,
  redditMachine,
  redditMenu,
  redditNotice,
  redditToJoinState,
  redditUserVerdict,
  resolveRedditObservation,
  type RedditContext,
  type RedditEvent,
  type RedditStateValue
} from './machine'
import type { StoredCommunityJoin } from '../types'

/** Standing actor across sends — mirrors how the store and clients drive the machine. */
function session(context: Partial<RedditContext> = {}) {
  const actor = createActor(redditMachine, {
    input: {
      accountId: null,
      subredditType: 'public',
      subscribed: false,
      contributor: false,
      quarantineOptIn: false,
      ...context
    }
  })
  actor.start()
  return {
    send(event: RedditEvent) {
      actor.send(event)
      const snapshot = actor.getSnapshot()
      return { value: snapshot.value as RedditStateValue, context: snapshot.context }
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

const RESTRICTED: RedditEvent = {
  type: 'METADATA_OBSERVED',
  subredditType: 'restricted',
  subscribed: true,
  contributor: false,
  quarantineOptIn: false
}

describe('reddit subscribe flow', () => {
  it('subscribes to public subs and unsubscribes back', () => {
    const s = session()
    let snap = s.send({ type: 'SUBSCRIBE' })
    expect(snap.value).toBe('subscribed')
    expect(redditToJoinState(snap.value)).toBe('accepted')
    snap = s.send({ type: 'UNSUBSCRIBE' })
    expect(snap.value).toBe('unsubscribed')
    expect(redditToJoinState(snap.value)).toBe('none')
    s.stop()
  })

  it('reads restricted subs as read-only until approved', () => {
    const s = session()
    let snap = s.send(RESTRICTED)
    expect(snap.value).toBe('restrictedReadOnly')
    expect(redditToJoinState(snap.value)).toBe('limited')
    expect(redditNotice(snap.value, snap.context)).toMatch(/read-only/)
    expect(snap.context.canPost).toBe(false)
    snap = s.send({ type: 'CONTRIBUTOR_APPROVED' })
    expect(snap.value).toBe('subscribed')
    expect(snap.context.canPost).toBe(true)
    s.stop()
  })

  it('gates private subs behind modmail and quarantine behind opt-in', () => {
    const s = session()
    let snap = s.send({
      type: 'METADATA_OBSERVED',
      subredditType: 'private',
      subscribed: false,
      contributor: false,
      quarantineOptIn: false
    })
    expect(snap.value).toBe('privateGated')
    expect(redditNotice(snap.value, snap.context)).toMatch(/modmail/)
    expect(redditUserVerdict(snap.value, {}, 'subscribe').allowed).toBe(false)
    snap = s.send({ type: 'REQUEST_ACCESS' })
    expect(snap.context.accessRequested).toBe(true)
    // approval arrives as an observation
    snap = s.send({
      type: 'METADATA_OBSERVED',
      subredditType: 'public',
      subscribed: true,
      contributor: false,
      quarantineOptIn: false
    })
    expect(snap.value).toBe('subscribed')

    snap = s.send({
      type: 'METADATA_OBSERVED',
      subredditType: 'quarantined',
      subscribed: false,
      contributor: false,
      quarantineOptIn: false
    })
    expect(snap.value).toBe('quarantineGate')
    expect(redditNotice(snap.value, snap.context)).toMatch(/opt in/)
    snap = s.send({ type: 'OPT_IN_QUARANTINE' })
    expect(snap.context.quarantineOptIn).toBe(true)
    snap = s.send({ type: 'QUARANTINE_CLEARED' })
    expect(snap.value).toBe('subscribed')
    s.stop()
  })

  it('marks banned and archived subs gone with an untrack note', () => {
    const s = session()
    const banned = s.send({
      type: 'METADATA_OBSERVED',
      subredditType: 'banned',
      subscribed: false,
      contributor: false,
      quarantineOptIn: false
    })
    expect(banned.value).toBe('gone')
    expect(redditNotice(banned.value, { ...banned.context, subredditType: 'banned' })).toMatch(/untrack/)
    expect(redditUserVerdict('gone', {}, 'subscribe').allowed).toBe(false)
    s.stop()

    const archived = driveMachine<RedditStateValue, RedditContext>(
      redditMachine,
      { accountId: null },
      [
        {
          type: 'METADATA_OBSERVED',
          subredditType: 'archived',
          subscribed: false,
          contributor: false,
          quarantineOptIn: false
        }
      ]
    )
    expect(
      redditNotice(archived.value, { ...archived.context, subredditType: 'archived' })
    ).toMatch(/Archived/)
  })

  it('observes a platform kick back to unsubscribed', () => {
    const s = session()
    s.send({ type: 'SUBSCRIBE' })
    const snap = s.send({
      type: 'METADATA_OBSERVED',
      subredditType: 'public',
      subscribed: false,
      contributor: false,
      quarantineOptIn: false
    })
    expect(snap.value).toBe('unsubscribed')
    s.stop()
  })
})

describe('reddit assertions', () => {
  it('gates posting, commenting, and reading per snapshot', () => {
    expect(canPost('subscribed', { canPost: true, karmaGated: false }).allowed).toBe(true)
    expect(canPost('restrictedReadOnly', { canPost: false, karmaGated: false }).allowed).toBe(false)
    expect(canPost('subscribed', { canPost: true, karmaGated: true }).allowed).toBe(false)
    expect(canPost('privateGated', { canPost: true, karmaGated: false }).allowed).toBe(false)
    expect(canPost('subscribed', { canPost: true, karmaGated: false, accountIssue: 'suspended' }).allowed).toBe(false)
    expect(canComment('restrictedReadOnly', { canComment: true, karmaGated: false }).allowed).toBe(true)
    expect(canComment('restrictedReadOnly', { canComment: false, karmaGated: false }).allowed).toBe(false)
    expect(canReadStream('subscribed').allowed).toBe(true)
    expect(canReadStream('restrictedReadOnly').allowed).toBe(true)
    expect(canReadStream('privateGated').allowed).toBe(false)
    expect(canReadStream('quarantineGate').allowed).toBe(false)
    expect(canReadStream('gone').allowed).toBe(false)
    expect(isQuarantineGated('quarantineGate')).toBe(true)
    expect(isQuarantineGated('subscribed')).toBe(false)
    // automod evidence needs an authenticated-alt-observer comparison —
    // never an unauthenticated probe
    expect(isAutomodGated(true, false)).toBe(true)
    expect(isAutomodGated(true, true)).toBe(false)
    expect(isAutomodGated(false, false)).toBe(false)
  })

  it('normalizes tail subreddit types to unclassified', () => {
    expect(normalizeSubredditType('public')).toBe('public')
    expect(normalizeSubredditType('gold_restricted')).toBe('gold_restricted')
    expect(normalizeSubredditType('something-new')).toBe('unclassified')
  })

  it('tags karma gates with evidence and clears them', () => {
    const s = session()
    s.send({ type: 'SUBSCRIBE' })
    let snap = s.send({ type: 'MARK_KARMA_GATED', evidence: 'comment t1_abc invisible to alt observer' })
    expect(snap.context.karmaGated).toBe(true)
    expect(redditNotice(snap.value, { ...snap.context, subredditType: 'public' })).toMatch(/Karma-gated/)
    snap = s.send({ type: 'KARMA_CLEARED' })
    expect(snap.context.karmaGated).toBe(false)
    s.stop()
  })

  it('menus mirror the machine', () => {
    expect(redditMenu('unsubscribed', {})).toMatchObject({ join: true, leave: false })
    expect(redditMenu('subscribed', {})).toMatchObject({ join: false, leave: true })
    expect(redditMenu('restrictedReadOnly', {})).toMatchObject({ join: false, leave: true })
    expect(redditMenu('quarantineGate', {})).toMatchObject({ join: true, leave: true })
    expect(redditMenu('privateGated', {})).toMatchObject({ join: false, leave: false })
    expect(redditUserVerdict('privateGated', {}, 'requestAccess').allowed).toBe(true)
    expect(redditUserVerdict('quarantineGate', {}, 'optIn').allowed).toBe(true)
    expect(redditUserVerdict('subscribed', {}, 'optIn').allowed).toBe(false)
  })
})

describe('reddit walls and bootstrap', () => {
  it('overwrites any state, refuses double walls, and restores', () => {
    const s = session()
    s.send({ type: 'SUBSCRIBE' })
    let snap = s.send({ type: 'OBSERVE_WALL', wallType: 'login' })
    expect(snap.value).toBe('observationWall')
    expect(redditToJoinState(snap.value, snap.context.wallType)).toBe('login-wall')
    expect(redditUserVerdict(snap.value, {}, 'unsubscribe').allowed).toBe(false)
    snap = s.send({ type: 'OBSERVE_WALL', wallType: 'challenge' })
    expect(snap.context.priorValue).toBe('subscribed')
    const restored = resolveRedditObservation(snap.context)
    expect(restored.value).toBe('subscribed')
    s.stop()
  })

  it('replays flat rows to the same node as live observations', () => {
    const row = storedRow({ state: 'accepted', subredditType: 'restricted', userIsContributor: false })
    expect(deriveRedditValue(row)).toBe('restrictedReadOnly')
    const replayed = driveMachine<RedditStateValue, RedditContext>(
      redditMachine,
      redditInputFromRow(row),
      bootstrapRedditEvents(row)
    )
    expect(replayed.value).toBe('restrictedReadOnly')
    expect(replayed.context.canPost).toBe(false)
  })
})
