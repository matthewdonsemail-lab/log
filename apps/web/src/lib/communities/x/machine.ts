import { assign, setup } from 'xstate'
import { refuse, writeBlockedVerdict } from '../transition'
import type { CommunityJoinState } from '../types'
import type { XContext, XEvent, XInput, XStateValue, XWallType } from './types'
export type { XContext, XEvent, XInput, XStateValue, XWallType }

/**
 * X community machine (xstate v5). Deliberately trivial: X communities
 * have no entry gate, no approval queue, no contributor tiers — subscribe
 * and unsubscribe are the whole lifecycle, plus the shared observation
 * wall. It exists so every platform dispatches through the same seam and
 * the dashboard never branches on platform for lifecycle questions.
 */
export const xMachine = setup({
  types: {
    context: {} as XContext,
    events: {} as XEvent,
    input: {} as XInput
  },
  guards: {
    writeAllowed: ({ context }) => !writeBlockedVerdict(context.accountIssue),
    notAlreadyWalled: ({ context }) => !context.walled
  },
  actions: {
    trackSubscribe: assign({
      accountId: ({ event }) => (event.type === 'SUBSCRIBE' ? (event.accountId ?? null) : null),
      accountIssue: ({ event }) => (event.type === 'SUBSCRIBE' ? event.accountIssue : undefined)
    }),
    trackWall: assign({
      wallType: ({ event }) => (event.type === 'OBSERVE_WALL' ? event.wallType : undefined),
      walled: true,
      priorValue: ({ self }) => self.getSnapshot().value as XStateValue
    })
  }
}).createMachine({
  id: 'xCommunity',
  initial: 'unsubscribed',
  context: ({ input }) => ({
    accountId: input.accountId ?? null,
    accountIssue: input.accountIssue,
    wallType: undefined,
    walled: false,
    priorValue: null
  }),
  on: {
    OBSERVE_WALL: { guard: 'notAlreadyWalled', target: '.observationWall', actions: 'trackWall' }
  },
  states: {
    unsubscribed: {
      on: {
        SUBSCRIBE: { guard: 'writeAllowed', target: 'subscribed', actions: 'trackSubscribe' }
      }
    },
    subscribed: {
      on: {
        UNSUBSCRIBE: { guard: 'writeAllowed', target: 'unsubscribed' }
      }
    },
    observationWall: {}
  }
})

export type XUserIntent = 'subscribe' | 'unsubscribe'

/** Pre-check for user intents — the store 409s with this reason. */
export function xUserVerdict(
  value: XStateValue,
  context: Pick<XContext, 'accountIssue'>,
  intent: XUserIntent
): { allowed: boolean; reason?: string } {
  const blocked = writeBlockedVerdict(context.accountIssue)
  if (blocked) return blocked
  if (value === 'observationWall') {
    return refuse('The poller cannot see through the current wall — wait for the next observation before acting.')
  }
  if (intent === 'subscribe') {
    return value === 'unsubscribed'
      ? { allowed: true }
      : refuse('Already tracking this community.')
  }
  return value === 'subscribed'
    ? { allowed: true }
    : refuse('There is no subscription to end.')
}

/** Shared dashboard vocabulary for an X snapshot. */
export function xToJoinState(value: XStateValue, wallType?: XWallType): CommunityJoinState {
  if (value === 'subscribed') return 'accepted'
  if (value === 'observationWall') return wallType === 'unclassified' ? 'unknown' : 'login-wall'
  return 'none'
}

/** X rows carry no extra truth beyond the badge. */
export function xNotice(): null {
  return null
}

/** Menu availability for one X snapshot (mirrors the machine). */
export function xMenu(
  value: XStateValue,
  context: Pick<XContext, 'accountIssue'>
): { join: boolean; withdraw: boolean; leave: boolean } {
  const blocked = !!writeBlockedVerdict(context.accountIssue)
  return {
    join: !blocked && value === 'unsubscribed',
    withdraw: false,
    leave: !blocked && value === 'subscribed'
  }
}

/** Observation restore is a rehydrate (see the Facebook/Reddit equivalents). */
export function resolveXObservation(context: XContext): { value: XStateValue; context: XContext } {
  const { wallType: _wall, priorValue: _prior, ...rest } = context
  return { value: context.priorValue ?? 'unsubscribed', context: { ...rest, wallType: undefined, walled: false, priorValue: null } }
}

/** Actor input rebuilt from the durable flat row. */
export function xInputFromRow(row: import('../types').StoredCommunityJoin): import('./types').XInput {
  return { accountId: row.accountId }
}

/** Replay a durable flat row (accepted ↔ subscribed; walls as observed). */
export function bootstrapXEvents(row: import('../types').StoredCommunityJoin): import('./types').XEvent[] {
  if (row.state === 'login-wall') return [{ type: 'OBSERVE_WALL', wallType: 'login' }]
  if (row.state === 'unknown') return [{ type: 'OBSERVE_WALL', wallType: 'unclassified' }]
  if (row.state === 'accepted' || row.state === 'pending' || row.state === 'limited') {
    return [{ type: 'SUBSCRIBE' }]
  }
  return []
}

/** Actor node for a flat row without starting an actor. */
export function deriveXValue(row: import('../types').StoredCommunityJoin): import('./types').XStateValue {
  if (row.state === 'login-wall' || row.state === 'unknown') return 'observationWall'
  if (row.state === 'accepted' || row.state === 'pending' || row.state === 'limited') return 'subscribed'
  return 'unsubscribed'
}
