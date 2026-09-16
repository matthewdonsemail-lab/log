import { describe, expect, it } from 'vitest'
import { createActor } from 'xstate'
import { driveMachine } from '../actors'
import { answersCompleteness, canSubmitAnswers, isFormStale } from './assertions'
import {
  bootstrapFacebookEvents,
  deriveFacebookValue,
  facebookInputFromRow,
  facebookMachine,
  facebookMenu,
  facebookNotice,
  facebookToJoinState,
  facebookUserVerdict,
  resolveFacebookObservation,
  type FacebookContext,
  type FacebookEvent,
  type FacebookStateValue
} from './machine'
import type { StoredCommunityJoin } from '../types'

const QUESTIONS = ['Where in DFW are you based?', 'Are you asking for help or offering a trade?']
const AT = '2026-09-16T12:00:00.000Z'

/** Standing actor across sends — mirrors how the store and clients drive the machine. */
function session(context: Partial<FacebookContext> = {}) {
  const actor = createActor(facebookMachine, {
    input: {
      accountId: 'fb-galway-rubbish',
      questions: QUESTIONS,
      questionsHash: 'hash-1',
      questionsScrapedAt: AT,
      ...context
    }
  })
  actor.start()
  return {
    send(event: FacebookEvent) {
      actor.send(event)
      const snapshot = actor.getSnapshot()
      return { value: snapshot.value as FacebookStateValue, context: snapshot.context }
    },
    stop() {
      actor.stop()
    }
  }
}

function joinEvents(answers: string[] = ['Dallas', 'help']): FacebookEvent[] {
  return [
    { type: 'INITIATE_JOIN', accountId: 'fb-galway-rubbish' },
    { type: 'GATE_INSPECTED', requiresQuestions: true, questions: QUESTIONS, questionsHash: 'hash-1', scrapedAt: AT },
    { type: 'FORM_RENDERED', questions: QUESTIONS, questionsHash: 'hash-1', scrapedAt: AT },
    { type: 'SUBMIT', answers, at: AT },
    { type: 'SUBMIT_CONFIRMED', at: AT }
  ]
}

function joined(answers?: string[]) {
  const s = session()
  let snap = { value: 'notMember' as FacebookStateValue, context: null as unknown as FacebookContext }
  for (const event of joinEvents(answers)) snap = s.send(event)
  s.stop()
  return snap
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

describe('facebook membership chain', () => {
  it('walks notMember to pendingApproval with complete answers', () => {
    const snap = joined()
    expect(snap.value).toBe('pendingApproval')
    expect(snap.context.answersComplete).toBe(true)
    expect(snap.context.answers).toEqual(['Dallas', 'help'])
    expect(snap.context.draftAnswers).toEqual([])
    expect(facebookToJoinState(snap.value)).toBe('pending')
  })

  it('accepts partial submits and flags them', () => {
    const snap = joined(['Dallas', ''])
    expect(snap.value).toBe('pendingApproval')
    expect(snap.context.answersComplete).toBe(false)
    expect(facebookNotice(snap.value, { ...snap.context, questions: QUESTIONS })).toMatch(/1 of 2 answers/)
  })

  it('approves, limits, promotes, and removes', () => {
    const s = session()
    for (const event of joinEvents()) s.send(event)
    let snap = s.send({ type: 'APPROVED' })
    expect(snap.value).toBe('fullMember')
    snap = s.send({ type: 'OBSERVE_LIMITED' })
    expect(snap.value).toBe('limitedMember')
    expect(facebookToJoinState(snap.value)).toBe('limited')
    snap = s.send({ type: 'PROMOTED' })
    expect(snap.value).toBe('fullMember')
    snap = s.send({ type: 'ADMIN_REMOVED' })
    expect(snap.value).toBe('removed')
    expect(snap.context.removedBy).toBe('platform')
    s.stop()
  })

  it('declines with answers kept, withdraws with prefill kept', () => {
    const s = session()
    for (const event of joinEvents()) s.send(event)
    let snap = s.send({ type: 'DECLINED' })
    expect(snap.value).toBe('declined')
    expect(snap.context.answers).toEqual(['Dallas', 'help'])
    // re-ask restores the admin-seen answers as drafts
    snap = s.send({ type: 'INITIATE_JOIN', accountId: 'fb-galway-rubbish' })
    expect(snap.context.draftAnswers).toEqual(['Dallas', 'help'])
    s.stop()

    const w = session()
    for (const event of joinEvents()) w.send(event)
    snap = w.send({ type: 'WITHDRAW' })
    expect(snap.value).toBe('notMember')
    expect(facebookToJoinState(snap.value)).toBe('none')
    w.stop()
  })
})

describe('facebook form lifecycle', () => {
  it('renders, drafts, abandons, and resumes with drafts intact', () => {
    const s = session()
    s.send({ type: 'INITIATE_JOIN', accountId: 'fb-galway-rubbish' })
    s.send({ type: 'GATE_INSPECTED', requiresQuestions: true, questions: QUESTIONS, questionsHash: 'hash-1', scrapedAt: AT })
    let snap = s.send({ type: 'FORM_RENDERED', questions: QUESTIONS, questionsHash: 'hash-1', scrapedAt: AT })
    expect(snap.value).toBe('formRendered')
    snap = s.send({ type: 'ANSWERS_UPDATED', draftAnswers: ['Dallas', ''], at: AT })
    expect(snap.value).toBe('formIncomplete')
    snap = s.send({ type: 'FORM_IDLE_TIMEOUT' })
    expect(snap.value).toBe('formAbandoned')
    expect(facebookNotice(snap.value, snap.context)).toMatch(/paused/)
    expect(facebookToJoinState(snap.value)).toBe('none')
    snap = s.send({ type: 'RESUME_FORM', at: AT })
    expect(snap.value).toBe('formIncomplete')
    expect(snap.context.draftAnswers).toEqual(['Dallas', ''])
    // submit from the resumed form with fresh answers
    s.send({ type: 'SUBMIT', answers: ['Dallas', 'offering a trade'], at: AT })
    snap = s.send({ type: 'SUBMIT_CONFIRMED', at: AT })
    expect(snap.value).toBe('pendingApproval')
    expect(snap.context.answersComplete).toBe(true)
    s.stop()
  })

  it('failed submits return to the form with the error', () => {
    const s = session()
    s.send({ type: 'INITIATE_JOIN', accountId: 'fb-galway-rubbish' })
    s.send({ type: 'GATE_INSPECTED', requiresQuestions: true, questions: QUESTIONS, questionsHash: 'hash-1', scrapedAt: AT })
    s.send({ type: 'FORM_RENDERED', questions: QUESTIONS, questionsHash: 'hash-1', scrapedAt: AT })
    let snap = s.send({ type: 'SUBMIT', answers: ['Dallas', 'help'], at: AT })
    expect(snap.value).toBe('formSubmitting')
    snap = s.send({ type: 'SUBMIT_FAILED', error: 'modal closed' })
    expect(snap.value).toBe('formIncomplete')
    expect(snap.context.lastError).toBe('modal closed')
    s.stop()
  })
})

describe('facebook guards and verdicts', () => {
  it('refuses user moves under a write-blocked account', () => {
    const verdict = facebookUserVerdict('notMember', { accountIssue: 'suspended' }, 'join')
    expect(verdict.allowed).toBe(false)
    expect(verdict.reason).toMatch(/suspended/)
    // …but platform observations still land regardless of session health
    const s = session({ accountIssue: 'suspended' })
    const snap = s.send({ type: 'OBSERVE_WALL', wallType: 'login' })
    expect(snap.value).toBe('observationWall')
    s.stop()
  })

  it('ignores guarded user events in the actor (verdicts 409 first)', () => {
    const s = session({ accountIssue: 'suspended' })
    const snap = s.send({ type: 'INITIATE_JOIN', accountId: 'x', accountIssue: 'suspended' })
    expect(snap.value).toBe('notMember')
    s.stop()
  })

  it('gates platform-removed rejoins on the group', () => {
    const verdict = facebookUserVerdict('removed', { removedBy: 'platform' }, 'join')
    expect(verdict.allowed).toBe(false)
    expect(verdict.reason).toMatch(/discretion/)
    expect(facebookUserVerdict('removed', { removedBy: 'user' }, 'join').allowed).toBe(true)
  })

  it('refuses joins already in flight and leaves with no membership', () => {
    expect(facebookUserVerdict('pendingApproval', {}, 'join').allowed).toBe(false)
    expect(facebookUserVerdict('notMember', {}, 'leave').allowed).toBe(false)
    expect(facebookUserVerdict('notMember', {}, 'withdraw').allowed).toBe(false)
    expect(facebookUserVerdict('fullMember', {}, 'withdraw').allowed).toBe(false)
  })

  it('asserts submittability and staleness purely', () => {
    expect(canSubmitAnswers('formIncomplete', {}).allowed).toBe(true)
    expect(canSubmitAnswers('notMember', {}).allowed).toBe(false)
    expect(canSubmitAnswers('formIncomplete', { accountIssue: 'suspended' }).allowed).toBe(false)
    expect(answersCompleteness([], [])).toBe(true)
    expect(answersCompleteness(QUESTIONS, ['a', ''])).toBe(false)
    const active = '2026-09-16T12:00:00.000Z'
    expect(isFormStale('formIncomplete', { lastActivityAt: active }, Date.parse(active) + 1)).toBe(false)
    expect(isFormStale('formIncomplete', { lastActivityAt: active }, Date.parse(active) + 10 * 60 * 1000)).toBe(true)
    expect(isFormStale('formAbandoned', { lastActivityAt: active }, Date.parse(active) + 10 * 60 * 1000)).toBe(false)
    expect(isFormStale('notMember', { lastActivityAt: active }, Date.parse(active) + 10 * 60 * 1000)).toBe(false)
  })

  it('menus mirror the machine', () => {
    expect(facebookMenu('notMember', {})).toMatchObject({ join: true, withdraw: false, leave: false, resume: false })
    expect(facebookMenu('pendingApproval', {})).toMatchObject({ join: false, withdraw: true, leave: false })
    expect(facebookMenu('fullMember', {})).toMatchObject({ leave: true })
    expect(facebookMenu('formAbandoned', {})).toMatchObject({ resume: true, join: false })
    expect(facebookMenu('removed', { removedBy: 'platform' }).join).toBe(false)
    expect(facebookMenu('removed', { removedBy: 'user' }).join).toBe(true)
    expect(facebookMenu('fullMember', { accountIssue: 'suspended' })).toMatchObject({
      join: false,
      withdraw: false,
      leave: false,
      resume: false
    })
  })
})

describe('facebook observation walls', () => {
  it('overwrites any state and restores the prior node', () => {
    const s = session()
    for (const event of joinEvents()) s.send(event)
    s.send({ type: 'APPROVED' })
    let snap = s.send({ type: 'OBSERVE_WALL', wallType: 'login' })
    expect(snap.value).toBe('observationWall')
    expect(snap.context.priorValue).toBe('fullMember')
    expect(facebookToJoinState(snap.value, snap.context.wallType)).toBe('login-wall')
    // a second wall cannot clobber the restore point
    snap = s.send({ type: 'OBSERVE_WALL', wallType: 'checkpoint' })
    expect(snap.context.priorValue).toBe('fullMember')
    const restored = resolveFacebookObservation(snap.context)
    expect(restored.value).toBe('fullMember')
    expect(restored.context.wallType).toBeUndefined()
    s.stop()
  })
})

describe('facebook bootstrap determinism', () => {
  it('replays flat rows to the same node as the live chain', () => {
    const live = joined()
    const row = storedRow({
      state: 'pending',
      accountId: 'fb-galway-rubbish',
      answers: ['Dallas', 'help'],
      answersComplete: true,
      questionsHash: 'hash-1',
      questionsScrapedAt: AT,
      scrapedQuestions: QUESTIONS,
      submittedAt: AT
    })
    const replayed = driveMachine<FacebookStateValue, FacebookContext>(
      facebookMachine,
      facebookInputFromRow(row, QUESTIONS),
      bootstrapFacebookEvents(row, QUESTIONS, row.accountId, undefined, AT)
    )
    expect(replayed.value).toBe(live.value)
    expect(replayed.context.answers).toEqual(live.context.answers)
    expect(replayed.context.answersComplete).toBe(true)
    expect(deriveFacebookValue(row)).toBe('pendingApproval')
  })

  it('rebuilds an abandoned modal from its mirror fields', () => {
    const row = storedRow({
      accountId: 'fb-galway-rubbish',
      questionsHash: 'hash-1',
      questionsScrapedAt: AT,
      scrapedQuestions: QUESTIONS,
      draftAnswers: ['Dallas', ''],
      formPhase: 'abandoned'
    })
    expect(deriveFacebookValue(row)).toBe('formAbandoned')
    const replayed = driveMachine<FacebookStateValue, FacebookContext>(
      facebookMachine,
      facebookInputFromRow(row, QUESTIONS),
      bootstrapFacebookEvents(row, QUESTIONS, row.accountId, undefined, AT)
    )
    expect(replayed.value).toBe('formAbandoned')
    expect(replayed.context.draftAnswers).toEqual(['Dallas', ''])
  })
})
