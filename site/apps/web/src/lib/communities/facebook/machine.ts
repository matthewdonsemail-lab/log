import { and, assign, setup } from 'xstate'
import { refuse, writeBlockedVerdict } from '../transition'
import type { AccountIssue } from '../../account-issues'
import type { CommunityJoinState, StoredCommunityJoin } from '../types'
import { answersCompleteness, canSubmitAnswers } from './assertions'
import type { FacebookContext, FacebookEvent, FacebookInput, FacebookStateValue, FacebookWallType } from './types'
export type { FacebookContext, FacebookEvent, FacebookInput, FacebookStateValue, FacebookWallType }

/**
 * Facebook group membership machine (xstate v5). Models the actual physics
 * of joining through a browser session: the entry gate must be inspected
 * (questions are scraped from the modal, never assumed), the modal can sit
 * open/incomplete/abandoned, and only the submit reaches the group — which
 * then approves, limits, declines, or removes through platform events.
 *
 * User-source events (`INITIATE_JOIN`, `SUBMIT`, `WITHDRAW`, `LEAVE`,
 * `RESUME_FORM`) are guarded by the account write gate; platform-source
 * events (approvals, observations, walls) always land — the poller reports
 * what the group did regardless of session health. The store sends events
 * and persists the snapshot; it 409s user intents the machine refuses via
 * {@link facebookUserVerdict} so the menu and the store agree.
 */
export const facebookMachine = setup({
  types: {
    context: {} as FacebookContext,
    events: {} as FacebookEvent,
    input: {} as FacebookInput
  },
  guards: {
    writeAllowed: ({ context }) => !writeBlockedVerdict(context.accountIssue),
    rejoinAllowed: ({ context }) => context.removedBy !== 'platform',
    notAlreadyWalled: ({ context }) => !context.walled,
    // Phase legality comes from the source states (SUBMIT is only handled
    // in form nodes); the guard covers the event shape + account gate.
    canSubmit: ({ context, event }) =>
      event.type === 'SUBMIT' && canSubmitAnswers('formIncomplete', context).allowed,
  },
  actions: {
    trackJoin: assign({
      accountId: ({ event }) => (event.type === 'INITIATE_JOIN' ? event.accountId : null),
      accountIssue: ({ event }) => (event.type === 'INITIATE_JOIN' ? event.accountIssue : undefined),
      lastError: null
    }),
    trackGate: assign({
      questions: ({ event }) => (event.type === 'GATE_INSPECTED' ? (event.questions ?? []) : []),
      questionsHash: ({ event }) =>
        event.type === 'GATE_INSPECTED' ? (event.questionsHash ?? null) : null,
      questionsScrapedAt: ({ event }) =>
        event.type === 'GATE_INSPECTED' ? (event.scrapedAt ?? null) : null,
      lastActivityAt: ({ event }) =>
        event.type === 'GATE_INSPECTED' ? (event.scrapedAt ?? null) : null,
      draftAnswers: [],
      answers: [],
      answersComplete: false,
      submittedAt: null,
      removedBy: undefined
    }),
    trackRendered: assign({
      questions: ({ event }) => (event.type === 'FORM_RENDERED' ? event.questions : []),
      questionsHash: ({ event }) => (event.type === 'FORM_RENDERED' ? event.questionsHash : null),
      questionsScrapedAt: ({ event }) => (event.type === 'FORM_RENDERED' ? event.scrapedAt : null),
      lastActivityAt: ({ event }) => (event.type === 'FORM_RENDERED' ? event.scrapedAt : null),
      draftAnswers: []
    }),
    trackDrafts: assign({
      draftAnswers: ({ event }) => (event.type === 'ANSWERS_UPDATED' ? event.draftAnswers : []),
      lastActivityAt: ({ event }) =>
        event.type === 'ANSWERS_UPDATED'
          ? (event.at ?? new Date().toISOString())
          : null
    }),
    trackResume: assign({
      lastActivityAt: ({ event }) =>
        event.type === 'RESUME_FORM' ? event.at : null
    }),
    trackSubmit: assign({
      answers: ({ event }) => (event.type === 'SUBMIT' ? event.answers : []),
      answersComplete: ({ context, event }) =>
        event.type === 'SUBMIT' ? answersCompleteness(context.questions, event.answers) : false,
      draftAnswers: [],
      lastActivityAt: ({ event }) => (event.type === 'SUBMIT' ? event.at : null)
    }),
    trackConfirmed: assign({
      submittedAt: ({ event }) => (event.type === 'SUBMIT_CONFIRMED' ? event.at : null)
    }),
    trackDirectApproval: assign({
      answers: [],
      answersComplete: true,
      draftAnswers: [],
      submittedAt: ({ event }) => (event.type === 'GATE_INSPECTED' ? (event.scrapedAt ?? null) : null)
    }),
    trackFailed: assign({
      lastError: ({ event }) => (event.type === 'SUBMIT_FAILED' ? event.error : null)
    }),
    trackDeclined: assign({ submittedAt: null }),
    trackRemoved: assign({
      removedBy: ({ event }) => {
        if (event.type === 'LEAVE') return 'user'
        if (event.type === 'ADMIN_REMOVED') return 'platform'
        return undefined
      }
    }),
    trackReask: assign({
      draftAnswers: ({ context }) => context.answers,
      submittedAt: null,
      removedBy: undefined
    }),
    trackWall: assign({
      wallType: ({ event }) => (event.type === 'OBSERVE_WALL' ? event.wallType : undefined),
      walled: true,
      priorValue: ({ self }) => self.getSnapshot().value as FacebookStateValue
    })
  }
}).createMachine({
  id: 'facebookCommunity',
  initial: 'notMember',
  context: ({ input }) => ({
    accountId: input.accountId ?? null,
    accountIssue: input.accountIssue,
    lastActivityAt: null,
    questions: input.questions ?? [],
    questionsHash: input.questionsHash ?? null,
    questionsScrapedAt: input.questionsScrapedAt ?? null,
    draftAnswers: input.draftAnswers ?? [],
    answers: input.answers ?? [],
    answersComplete: input.answersComplete ?? false,
    submittedAt: input.submittedAt ?? null,
    removedBy: input.removedBy,
    wallType: undefined,
    walled: false,
    priorValue: null,
    lastError: null
  }),
  on: {
    OBSERVE_WALL: { guard: 'notAlreadyWalled', target: '.observationWall', actions: 'trackWall' }
  },
  states: {
    notMember: {
      on: {
        INITIATE_JOIN: { guard: 'writeAllowed', target: 'inspectingGate', actions: 'trackJoin' }
      }
    },
    inspectingGate: {
      on: {
        GATE_INSPECTED: [
          {
            guard: ({ event }) => event.type === 'GATE_INSPECTED' && event.limited === true,
            target: 'limitedMember',
            actions: 'trackGate'
          },
          {
            guard: ({ event }) => event.type === 'GATE_INSPECTED' && !event.requiresQuestions,
            target: 'pendingApproval',
            actions: ['trackGate', 'trackDirectApproval']
          },
          { target: 'formRendered', actions: 'trackGate' }
        ]
      }
    },
    formRendered: {
      on: {
        FORM_RENDERED: { target: 'formRendered', actions: 'trackRendered' },
        ANSWERS_UPDATED: { target: 'formIncomplete', actions: 'trackDrafts' },
        FORM_IDLE_TIMEOUT: 'formAbandoned',
        SUBMIT: { guard: 'canSubmit', target: 'formSubmitting', actions: 'trackSubmit' }
      }
    },
    formIncomplete: {
      on: {
        ANSWERS_UPDATED: { target: 'formIncomplete', actions: 'trackDrafts' },
        FORM_IDLE_TIMEOUT: 'formAbandoned',
        SUBMIT: { guard: 'canSubmit', target: 'formSubmitting', actions: 'trackSubmit' }
      }
    },
    formAbandoned: {
      on: {
        RESUME_FORM: { guard: 'writeAllowed', target: 'formIncomplete', actions: 'trackResume' },
        SUBMIT: { guard: 'canSubmit', target: 'formSubmitting', actions: 'trackSubmit' }
      }
    },
    formSubmitting: {
      on: {
        SUBMIT_CONFIRMED: { target: 'pendingApproval', actions: 'trackConfirmed' },
        SUBMIT_FAILED: { target: 'formIncomplete', actions: 'trackFailed' }
      }
    },
    pendingApproval: {
      on: {
        APPROVED: 'fullMember',
        OBSERVE_LIMITED: 'limitedMember',
        DECLINED: { target: 'declined', actions: 'trackDeclined' },
        WITHDRAW: { guard: 'writeAllowed', target: 'notMember' }
      }
    },
    limitedMember: {
      on: {
        PROMOTED: 'fullMember',
        LEAVE: { guard: 'writeAllowed', target: 'removed', actions: 'trackRemoved' },
        ADMIN_REMOVED: { target: 'removed', actions: 'trackRemoved' }
      }
    },
    fullMember: {
      on: {
        OBSERVE_LIMITED: 'limitedMember',
        LEAVE: { guard: 'writeAllowed', target: 'removed', actions: 'trackRemoved' },
        ADMIN_REMOVED: { target: 'removed', actions: 'trackRemoved' }
      }
    },
    declined: {
      on: {
        INITIATE_JOIN: { guard: 'writeAllowed', target: 'inspectingGate', actions: ['trackJoin', 'trackReask'] }
      }
    },
    removed: {
      on: {
        INITIATE_JOIN: {
          guard: and(['writeAllowed', 'rejoinAllowed']),
          target: 'inspectingGate',
          actions: ['trackJoin', 'trackReask']
        }
      }
    },
    observationWall: {
      // Restore is a rehydrate, not a transition: the server reads
      // `priorValue` from the snapshot and rebuilds the actor there (see
      // `resolveFacebookObservation`). Walls overwrite any state, so no
      // static target could name where to return to.
    }
  }
})

export type FacebookUserIntent = 'join' | 'submit' | 'withdraw' | 'leave' | 'resume'

/**
 * Pre-check for user intents — the store 409s with this reason instead of
 * sending an event the machine would ignore. Mirrors the machine's guards
 * (account gate, platform-removed rejoin, observation wall, form phases).
 */
export function facebookUserVerdict(
  value: FacebookStateValue,
  context: Pick<FacebookContext, 'accountIssue' | 'removedBy' | 'wallType'>,
  intent: FacebookUserIntent
): { allowed: boolean; reason?: string } {
  const blocked = writeBlockedVerdict(context.accountIssue)
  if (blocked) return blocked
  if (value === 'observationWall') {
    return refuse(
      `The poller last saw ${context.wallType === 'unclassified' ? 'an unclassified page' : 'a login wall'} — wait for the next observation before acting.`
    )
  }
  if (intent === 'join') {
    if (value === 'removed' && context.removedBy === 'platform') {
      return refuse(
        'The group removed this account \u2014 rejoining is at the group\u2019s discretion; wait for the group to allow it (the poller will report a change).'
      )
    }
    if (value === 'notMember' || value === 'declined' || value === 'removed') return { allowed: true }
    return refuse('A join is already in flight for this group.')
  }
  if (intent === 'submit') {
    if (value === 'formRendered' || value === 'formIncomplete' || value === 'formAbandoned') {
      return { allowed: true }
    }
    return refuse('There is no open entry-question form to submit — initiate the join first.')
  }
  if (intent === 'withdraw') {
    return value === 'pendingApproval'
      ? { allowed: true }
      : refuse('There is no pending request to withdraw.')
  }
  if (intent === 'leave') {
    return value === 'limitedMember' || value === 'fullMember'
      ? { allowed: true }
      : refuse('Only a member can leave — there is no membership to end.')
  }
  // resume
  return value === 'formAbandoned'
    ? { allowed: true }
    : refuse('There is no abandoned form to resume.')
}

/** Shared dashboard vocabulary for a Facebook snapshot (pre-submit modal phases read as `none`). */
export function facebookToJoinState(value: FacebookStateValue, wallType?: FacebookWallType): CommunityJoinState {
  switch (value) {
    case 'pendingApproval':
      return 'pending'
    case 'limitedMember':
      return 'limited'
    case 'fullMember':
      return 'accepted'
    case 'declined':
      return 'declined'
    case 'removed':
      return 'removed'
    case 'observationWall':
      return wallType === 'unclassified' ? 'unknown' : 'login-wall'
    default:
      return 'none'
  }
}

/**
 * Row-level truth the shared badge copy doesn't cover: partial submits and
 * paused forms. Declined/removed copy stays in the dashboard subtitle.
 */
export function facebookNotice(
  value: FacebookStateValue,
  context: Pick<FacebookContext, 'answers' | 'answersComplete' | 'questions'>
): string | null {
  if (value === 'pendingApproval' && !context.answersComplete) {
    const total = context.questions.length
    const done = context.answers.filter((answer) => answer.trim() !== '').length
    return total > 0
      ? `Request sent with ${done} of ${total} answers — admins may decline it`
      : null
  }
  if (value === 'formAbandoned') return 'Answering paused — resume to finish the request'
  return null
}

/** Menu availability for one Facebook snapshot (mirrors the machine). */export function facebookMenu(
  value: FacebookStateValue,
  context: Pick<FacebookContext, 'accountIssue' | 'removedBy'>
): { join: boolean; withdraw: boolean; leave: boolean; resume: boolean } {
  const blocked = !!writeBlockedVerdict(context.accountIssue)
  const joinable =
    !blocked &&
    (value === 'notMember' ||
      value === 'declined' ||
      (value === 'removed' && context.removedBy !== 'platform'))
  return {
    join: joinable,
    withdraw: !blocked && value === 'pendingApproval',
    leave: !blocked && (value === 'limitedMember' || value === 'fullMember'),
    resume: !blocked && value === 'formAbandoned'
  }
}

/**
 * Observation restore is a rehydrate, not a machine transition: the server
 * (or a test) reads `priorValue` off a wall snapshot and rebuilds the actor
 * there with the intact context. Returns the value + context to rehydrate.
 */
export function resolveFacebookObservation(context: FacebookContext): {
  value: FacebookStateValue
  context: FacebookContext
} {
  const { wallType: _wall, priorValue: _prior, ...rest } = context
  return { value: context.priorValue ?? 'notMember', context: { ...rest, wallType: undefined, walled: false, priorValue: null } }
}

/** Actor input rebuilt from the durable flat row (no account gate — replay is history). */
export function facebookInputFromRow(
  row: StoredCommunityJoin,
  questions: string[]
): import('./types').FacebookInput {
  return {
    accountId: row.accountId,
    questions,
    questionsHash: row.questionsHash,
    questionsScrapedAt: row.questionsScrapedAt,
    draftAnswers: row.draftAnswers,
    answers: row.answers,
    answersComplete: row.answersComplete,
    submittedAt: row.submittedAt,
    removedBy: row.removedBy
  }
}

/**
 * Replay a durable flat row into the events that produce its actor node.
 * Deterministic history reconstruction — the store replays this before
 * every new event, so actors stay ephemeral per request and the flat row
 * remains the only persisted truth. Guard-stalled replays (a since-gated
 * account) simply stop early; user routes verdict-first so they never write
 * from a stalled replay, and platform routes replay un-gated history.
 */
export function bootstrapFacebookEvents(
  row: StoredCommunityJoin,
  questions: string[],
  accountId: string | null,
  accountIssue: AccountIssue | undefined,
  nowIso: string
): import('./types').FacebookEvent[] {
  const at = (value: string | null) => value ?? nowIso
  if (row.state === 'login-wall') return [{ type: 'OBSERVE_WALL', wallType: 'login' }]
  if (row.state === 'unknown') return [{ type: 'OBSERVE_WALL', wallType: 'unclassified' }]
  const membership = ['pending', 'accepted', 'limited', 'declined', 'removed'].includes(row.state)
  if (!membership) {
    // Pre-submit modal mirror (or nothing at all).
    if (row.formPhase === 'idle') return []
    const events: import('./types').FacebookEvent[] = [
      { type: 'INITIATE_JOIN', accountId: accountId ?? '', accountIssue },
      {
        type: 'GATE_INSPECTED',
        requiresQuestions: questions.length > 0,
        questions,
        questionsHash: row.questionsHash ?? undefined,
        scrapedAt: row.questionsScrapedAt ?? undefined
      }
    ]
    if (questions.length === 0) return events
    events.push({
      type: 'FORM_RENDERED',
      questions,
      questionsHash: row.questionsHash ?? 'unknown',
      scrapedAt: at(row.questionsScrapedAt)
    })
    if (row.draftAnswers.length > 0 || row.formPhase !== 'rendered') {
      events.push({ type: 'ANSWERS_UPDATED', draftAnswers: row.draftAnswers, at: at(row.questionsScrapedAt) })
    }
    if (row.formPhase === 'abandoned') events.push({ type: 'FORM_IDLE_TIMEOUT' })
    if (row.formPhase === 'submitting') {
      events.push({ type: 'SUBMIT', answers: row.draftAnswers, at: at(row.questionsScrapedAt) })
    }
    return events
  }
  const events: import('./types').FacebookEvent[] = [
    { type: 'INITIATE_JOIN', accountId: accountId ?? '', accountIssue },
    {
      type: 'GATE_INSPECTED',
      requiresQuestions: questions.length > 0,
      questions,
      questionsHash: row.questionsHash ?? undefined,
      scrapedAt: row.questionsScrapedAt ?? undefined
    }
  ]
  if (questions.length > 0) {
    events.push({
      type: 'FORM_RENDERED',
      questions,
      questionsHash: row.questionsHash ?? 'unknown',
      scrapedAt: at(row.questionsScrapedAt)
    })
    events.push({ type: 'SUBMIT', answers: row.answers, at: at(row.submittedAt) })
    events.push({ type: 'SUBMIT_CONFIRMED', at: at(row.submittedAt) })
  }
  if (row.state === 'accepted') events.push({ type: 'APPROVED' })
  if (row.state === 'limited') events.push({ type: 'APPROVED' }, { type: 'OBSERVE_LIMITED' })
  if (row.state === 'declined') events.push({ type: 'DECLINED' })
  if (row.state === 'removed') {
    events.push({ type: 'APPROVED' })
    events.push(row.removedBy === 'platform' ? { type: 'ADMIN_REMOVED' } : { type: 'LEAVE' })
  }
  return events
}

/**
 * Actor node for a flat row without starting an actor — feeds `facebookMenu`
 * and verdicts in UI code. Pre-submit modal phases mirror `formPhase`;
 * submitted states map 1:1.
 */
export function deriveFacebookValue(row: StoredCommunityJoin): FacebookStateValue {
  switch (row.state) {
    case 'pending':
      return 'pendingApproval'
    case 'accepted':
      return 'fullMember'
    case 'limited':
      return 'limitedMember'
    case 'declined':
      return 'declined'
    case 'removed':
      return 'removed'
    case 'login-wall':
    case 'unknown':
      return 'observationWall'
    default:
      switch (row.formPhase) {
        case 'rendered':
          return 'formRendered'
        case 'incomplete':
          return 'formIncomplete'
        case 'submitting':
          return 'formSubmitting'
        case 'abandoned':
          return 'formAbandoned'
        default:
          return 'notMember'
      }
  }
}
