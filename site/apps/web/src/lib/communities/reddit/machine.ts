import { assign, setup } from 'xstate'
import { refuse, writeBlockedVerdict } from '../transition'
import type { CommunityJoinState } from '../types'
import type {
  RedditContext,
  RedditEvent,
  RedditInput,
  RedditStateValue,
  RedditSubredditType,
  RedditWallType
} from './types'
export type {
  RedditContext,
  RedditEvent,
  RedditInput,
  RedditStateValue,
  RedditSubredditType,
  RedditWallType
}

/**
 * Reddit community machine (xstate v5). No entry questionnaires, no admin
 * approval queue — membership is subscription plus access gates the poller
 * observes from `about.json` (`subreddit_type`, `user_is_subscriber`) and
 * contributor flags. Restricted-but-unapproved reads as read-only
 * listening; private reads as gated (modmail is the only move);
 * quarantined reads as locked until the opt-in is observed.
 *
 * User-source events (`SUBSCRIBE`, `UNSUBSCRIBE`, `REQUEST_ACCESS`,
 * `OPT_IN_QUARANTINE`) are guarded by the account write gate; platform
 * observations (`METADATA_OBSERVED`, walls, approvals) always land.
 */
export const redditMachine = setup({
  types: {
    context: {} as RedditContext,
    events: {} as RedditEvent,
    input: {} as RedditInput
  },
  guards: {
    writeAllowed: ({ context }) => !writeBlockedVerdict(context.accountIssue),
    notAlreadyWalled: ({ context }) => !context.walled,
    isPrivate: ({ event }: { event: RedditEvent }) =>
      event.type === 'METADATA_OBSERVED' && event.subredditType === 'private',
    isQuarantineUnlocked: ({ event }: { event: RedditEvent }) =>
      event.type === 'METADATA_OBSERVED' &&
      event.subredditType === 'quarantined' &&
      event.subscribed &&
      (event.quarantineOptIn ?? false),
    isQuarantined: ({ event }: { event: RedditEvent }) =>
      event.type === 'METADATA_OBSERVED' && event.subredditType === 'quarantined',
    isGone: ({ event }: { event: RedditEvent }) =>
      event.type === 'METADATA_OBSERVED' &&
      (event.subredditType === 'banned' || event.subredditType === 'archived'),
    isRestrictedUnapproved: ({ event }: { event: RedditEvent }) =>
      event.type === 'METADATA_OBSERVED' &&
      event.subredditType === 'restricted' &&
      event.subscribed &&
      !(event.contributor ?? false),
    isKicked: ({ event }: { event: RedditEvent }) =>
      event.type === 'METADATA_OBSERVED' &&
      !event.subscribed &&
      (event.subredditType === 'public' || event.subredditType === 'restricted')
  },
  actions: {
    trackSubscribe: assign({
      accountId: ({ event }) => (event.type === 'SUBSCRIBE' ? (event.accountId ?? null) : null),
      accountIssue: ({ event }) => (event.type === 'SUBSCRIBE' ? event.accountIssue : undefined),
      subscribed: true,
      lastError: null
    }),
    trackUnsubscribe: assign({ subscribed: false }),
    trackObserved: assign({
      subredditType: ({ event }) => (event.type === 'METADATA_OBSERVED' ? event.subredditType : 'public'),
      subscribed: ({ event }) => (event.type === 'METADATA_OBSERVED' ? event.subscribed : false),
      userIsContributor: ({ event }) =>
        event.type === 'METADATA_OBSERVED' ? (event.contributor ?? false) : false,
      canPost: ({ event }) =>
        event.type === 'METADATA_OBSERVED'
          ? event.subredditType === 'public' || (event.contributor ?? false)
          : true,
      canComment: ({ event }) =>
        event.type === 'METADATA_OBSERVED'
          ? event.subredditType === 'public' || (event.contributor ?? false)
          : true,
      quarantineOptIn: ({ event }) =>
        event.type === 'METADATA_OBSERVED' ? (event.quarantineOptIn ?? false) : false,
      wallType: undefined,
      walled: false,
      priorValue: null,
      lastError: null
    }),
    trackApproved: assign({ userIsContributor: true, canPost: true, canComment: true }),
    trackAccessRequested: assign({ accessRequested: true }),
    trackOptIn: assign({ quarantineOptIn: true }),
    trackKarmaGated: assign({
      karmaGated: true,
      karmaEvidence: ({ event }) => (event.type === 'MARK_KARMA_GATED' ? event.evidence : null)
    }),
    trackKarmaCleared: assign({ karmaGated: false, karmaEvidence: null }),
    trackWall: assign({
      wallType: ({ event }) => (event.type === 'OBSERVE_WALL' ? event.wallType : undefined),
      walled: true,
      priorValue: ({ self }) => self.getSnapshot().value as RedditStateValue
    })
  }
}).createMachine({
  id: 'redditCommunity',
  initial: 'unsubscribed',
  context: ({ input }) => ({
    accountId: input.accountId ?? null,
    accountIssue: input.accountIssue,
    subredditType: input.subredditType ?? 'public',
    subscribed: input.subscribed ?? false,
    userIsContributor: input.contributor ?? false,
    canPost: true,
    canComment: true,
    quarantineOptIn: input.quarantineOptIn ?? false,
    karmaGated: false,
    karmaEvidence: null,
    accessRequested: false,
    wallType: undefined,
    walled: false,
    priorValue: null,
    lastError: null
  }),
  on: {
    OBSERVE_WALL: { guard: 'notAlreadyWalled', target: '.observationWall', actions: 'trackWall' },
    // One dispatch table for every poller observation, valid from any
    // state — a clean metadata fetch supersedes whatever was there
    // (including a wall, which trackObserved clears). Order matters:
    // terminal and gated types first, kick detection before the catch-all.
    METADATA_OBSERVED: [
      { guard: 'isGone', target: '.gone', actions: 'trackObserved' },
      { guard: 'isPrivate', target: '.privateGated', actions: 'trackObserved' },
      { guard: 'isQuarantineUnlocked', target: '.subscribed', actions: 'trackObserved' },
      { guard: 'isQuarantined', target: '.quarantineGate', actions: 'trackObserved' },
      { guard: 'isRestrictedUnapproved', target: '.restrictedReadOnly', actions: 'trackObserved' },
      { guard: 'isKicked', target: '.unsubscribed', actions: 'trackObserved' },
      { target: '.subscribed', actions: 'trackObserved' }
    ]
  },
  states: {
    unsubscribed: {
      on: {
        SUBSCRIBE: { guard: 'writeAllowed', target: 'subscribed', actions: 'trackSubscribe' }
      }
    },
    subscribed: {
      on: {
        UNSUBSCRIBE: { guard: 'writeAllowed', target: 'unsubscribed', actions: 'trackUnsubscribe' },
        MARK_KARMA_GATED: { actions: 'trackKarmaGated' },
        KARMA_CLEARED: { actions: 'trackKarmaCleared' }
      }
    },
    restrictedReadOnly: {
      on: {
        CONTRIBUTOR_APPROVED: { target: 'subscribed', actions: 'trackApproved' },
        UNSUBSCRIBE: { guard: 'writeAllowed', target: 'unsubscribed', actions: 'trackUnsubscribe' },
        MARK_KARMA_GATED: { actions: 'trackKarmaGated' },
        KARMA_CLEARED: { actions: 'trackKarmaCleared' }
      }
    },
    privateGated: {
      on: {
        REQUEST_ACCESS: { guard: 'writeAllowed', actions: 'trackAccessRequested' }
      }
    },
    quarantineGate: {
      on: {
        OPT_IN_QUARANTINE: { guard: 'writeAllowed', actions: 'trackOptIn' },
        QUARANTINE_CLEARED: 'subscribed',
        UNSUBSCRIBE: { guard: 'writeAllowed', target: 'unsubscribed', actions: 'trackUnsubscribe' }
      }
    },
    gone: {},
    observationWall: {
      // Restore is a rehydrate via `resolveRedditObservation` (same rationale
      // as the Facebook wall — walls overwrite any state).
    }
  }
})

export type RedditUserIntent = 'subscribe' | 'unsubscribe' | 'requestAccess' | 'optIn'

/** Pre-check for user intents — the store 409s with this reason. */
export function redditUserVerdict(
  value: RedditStateValue,
  context: Pick<RedditContext, 'accountIssue'>,
  intent: RedditUserIntent
): { allowed: boolean; reason?: string } {
  const blocked = writeBlockedVerdict(context.accountIssue)
  if (blocked) return blocked
  if (value === 'observationWall') {
    return refuse('The poller cannot see through the current wall — wait for the next observation before acting.')
  }
  if (value === 'gone') {
    return refuse('The community is gone — there is nothing to act on. Untrack it to clear the row.')
  }
  if (intent === 'subscribe') {
    if (value === 'unsubscribed') return { allowed: true }
    if (value === 'privateGated') {
      return refuse('This community is private — request access via modmail instead of subscribing.')
    }
    if (value === 'quarantineGate') {
      return refuse('This community is quarantined — opt in before subscribing.')
    }
    return refuse('Already tracking this community.')
  }
  if (intent === 'unsubscribe') {
    return value === 'subscribed' || value === 'restrictedReadOnly' || value === 'quarantineGate'
      ? { allowed: true }
      : refuse('There is no subscription to end.')
  }
  if (intent === 'requestAccess') {
    return value === 'privateGated'
      ? { allowed: true }
      : refuse('Access requests only apply to private communities.')
  }
  // optIn
  return value === 'quarantineGate'
    ? { allowed: true }
    : refuse('There is no quarantine gate to opt in to.')
}

/** Shared dashboard vocabulary for a Reddit snapshot. */
export function redditToJoinState(value: RedditStateValue, wallType?: RedditWallType): CommunityJoinState {
  switch (value) {
    case 'subscribed':
      return 'accepted'
    case 'restrictedReadOnly':
    case 'quarantineGate':
      return 'limited'
    case 'observationWall':
      return wallType === 'unclassified' ? 'unknown' : 'login-wall'
    default:
      return 'none'
  }
}

/** Row-level truth the shared badge copy doesn't cover. */
export function redditNotice(
  value: RedditStateValue,
  context: Pick<RedditContext, 'userIsContributor' | 'karmaGated' | 'accessRequested' | 'subredditType'>
): string | null {
  switch (value) {
    case 'restrictedReadOnly':
      return context.karmaGated
        ? 'Restricted and karma-gated — replies are being swallowed'
        : 'Restricted — read-only until a contributor approves'
    case 'privateGated':
      return context.accessRequested
        ? 'Private — access requested, waiting on the mods'
        : 'Private — request access via modmail'
    case 'quarantineGate':
      return 'Quarantined — opt in to unlock the read stream'
    case 'gone':
      return context.subredditType === 'archived'
        ? 'Archived by Reddit — untrack to clear the row'
        : 'Removed by Reddit — untrack to clear the row'
    case 'subscribed':
      return context.karmaGated ? 'Karma-gated — replies are being swallowed' : null
    default:
      return null
  }
}

/** Menu availability for one Reddit snapshot (mirrors the machine). */
export function redditMenu(
  value: RedditStateValue,
  context: Pick<RedditContext, 'accountIssue'>
): { join: boolean; withdraw: boolean; leave: boolean } {
  const blocked = !!writeBlockedVerdict(context.accountIssue)
  return {
    join: !blocked && (value === 'unsubscribed' || value === 'quarantineGate'),
    withdraw: false,
    leave: !blocked && (value === 'subscribed' || value === 'restrictedReadOnly' || value === 'quarantineGate')
  }
}

/**
 * Observation restore is a rehydrate (walls overwrite any state): the
 * server reads `priorValue` and rebuilds the actor there.
 */
export function resolveRedditObservation(context: RedditContext): {
  value: RedditStateValue
  context: RedditContext
} {
  const { wallType: _wall, priorValue: _prior, ...rest } = context
  return { value: context.priorValue ?? 'unsubscribed', context: { ...rest, wallType: undefined, walled: false, priorValue: null } }
}

/** Tail `subreddit_type` values map to unclassified observation, never a wrong state. */
export function normalizeSubredditType(raw: string): RedditSubredditType {  switch (raw) {
    case 'public':
    case 'restricted':
    case 'private':
    case 'quarantined':
    case 'banned':
    case 'archived':
    case 'employees_only':
    case 'gold_only':
    case 'gold_restricted':
    case 'premium_only':
      return raw
    default:
      return 'unclassified'
  }
}

/** Actor input rebuilt from the durable flat row. */
export function redditInputFromRow(row: import('../types').StoredCommunityJoin): import('./types').RedditInput {
  return {
    accountId: row.accountId,
    subredditType: normalizeSubredditType(row.subredditType ?? 'public'),
    subscribed: row.state === 'accepted' || row.state === 'pending' || row.state === 'limited',
    contributor: row.userIsContributor,
    quarantineOptIn: row.quarantineOptIn
  }
}

/**
 * Replay a durable flat row into the events that produce its actor node
 * (same ephemeral-actor contract as Facebook). One metadata observation
 * rebuilds any node — the root dispatch table routes it — except legacy
 * `declined`/`removed` rows (reddit never had those relations) and fresh
 * public rows, which start unsubscribed with no events.
 */
export function bootstrapRedditEvents(row: import('../types').StoredCommunityJoin): import('./types').RedditEvent[] {
  if (row.state === 'login-wall') return [{ type: 'OBSERVE_WALL', wallType: 'login' }]
  if (row.state === 'unknown') return [{ type: 'OBSERVE_WALL', wallType: 'unclassified' }]
  if (row.state === 'declined' || row.state === 'removed') return []
  const subredditType = normalizeSubredditType(row.subredditType ?? 'public')
  if (
    row.state === 'limited' &&
    (row.subredditType === null || subredditType === 'public' || subredditType === 'unclassified')
  ) {
    // Legacy limited rows predate observed detail — they read as
    // restricted-unapproved, matching `deriveRedditValue`.
    return [
      {
        type: 'METADATA_OBSERVED',
        subredditType: 'restricted',
        subscribed: true,
        contributor: false,
        quarantineOptIn: false
      }
    ]
  }
  if (row.state === 'none' && subredditType !== 'private' && subredditType !== 'quarantined' && subredditType !== 'banned' && subredditType !== 'archived') {
    return []
  }
  return [
    {
      type: 'METADATA_OBSERVED',
      subredditType,
      subscribed: row.state === 'accepted' || row.state === 'pending' || row.state === 'limited',
      contributor: row.userIsContributor,
      quarantineOptIn: row.quarantineOptIn
    }
  ]
}

/** Actor node for a flat row without starting an actor (UI menus, verdicts). */
export function deriveRedditValue(row: import('../types').StoredCommunityJoin): import('./types').RedditStateValue {
  if (row.state === 'login-wall' || row.state === 'unknown') return 'observationWall'
  const subredditType = normalizeSubredditType(row.subredditType ?? 'public')
  if (subredditType === 'private') return 'privateGated'
  if (subredditType === 'quarantined' && !row.quarantineOptIn) return 'quarantineGate'
  if (subredditType === 'banned' || subredditType === 'archived') return 'gone'
  if (row.state === 'accepted' || row.state === 'pending') {
    if (subredditType === 'restricted' && !row.userIsContributor) return 'restrictedReadOnly'
    if (subredditType === 'quarantined') return 'subscribed'
    return 'subscribed'
  }
  if (row.state === 'limited') return 'restrictedReadOnly'
  return 'unsubscribed'
}
