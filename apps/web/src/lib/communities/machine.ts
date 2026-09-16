import type { AccountIssue } from '../account-issues'
import { WRITE_BLOCKING_ISSUES } from '../account-state'
import { COMMUNITY_JOIN_STATE_LABELS } from './types'
import type { Community, CommunityJoinState } from './types'

/**
 * The community state machine — the same contract the listings machine is,
 * for group membership: the dashboard actions and the facebook-camofox-client
 * poller agree on which membership moves are legal, per source.
 *
 * Sources mirror the listings domain (`seller`/`platform`); here they're
 * read as **the user** (the dashboard acting on the group through a
 * connected account) and **the platform** (the poller observing whatever
 * the group actually did).
 *
 * Observations (`login-wall`, `unknown`) are the poller's alone, exactly as
 * in the listings machine: only a `platform` run can write one (it saw a
 * session wall / unclassified page) and only the next `platform` run can
 * resolve out of one. The user has no action on a group the poller can't
 * see.
 *
 * Account composition shares the listings gate: a group whose joining
 * account is gated (`suspended` / `read_only_limited` — see
 * {@link WRITE_BLOCKING_ISSUES}) refuses every user move — the platform
 * would reject the request, so the store 409s first and the UI hides the
 * actions. Terminal (banned-account) rows additionally surface as stale via
 * the account gate (see `lib/account-state.ts`): they keep last-known state
 * and the poller declines to spend a request on a session that no longer
 * exists.
 */

export type CommunityTransitionSource = 'user' | 'platform'

export interface CommunityTransitionContext {
  /** Normalized issue on the joining account — see WRITE_BLOCKING_ISSUES. */
  accountIssue?: AccountIssue
  /** The row itself — present for `removed` so the machine reports
   *  provenance in its reasons (self-leave vs admin removal). */
  removedBy?: Community['removedBy']
}

/**
 * USER edges — the moves the dashboard offers:
 *  - none → pending | accepted (join; public groups skip the request and
 *    land in accepted)
 *  - pending → none (withdraw the request)
 *  - declined → pending | accepted (edit the answers and re-ask)
 *  - removed → pending | accepted (rejoin — FB normally allows re-requesting
 *    a group after a self-leave or an admin removal; the row's entry
 *    questions may have to be answered again)
 *  - accepted / limited → removed (leave; the machine records `removedBy:
 *    'user'` on the store side)
 */
const USER_EDGES: Record<CommunityJoinState, CommunityJoinState[]> = {
  none: ['pending', 'accepted'],
  pending: ['none'],
  limited: ['removed'],
  accepted: ['removed'],
  declined: ['pending', 'accepted'],
  removed: ['pending', 'accepted'],
  'login-wall': [],
  unknown: []
}

/**
 * PLATFORM edges — what the camofox poller can legitimately observe (or the
 * API confirming a dashboard-initiated move):
 *  - none → pending | accepted (a join happened out-of-band; the poller saw
 *    a request or a membership)
 *  - pending → accepted (admin approved) | declined (admin declined)
 *  - limited → accepted (the group opened full membership — limited members
 *    are promoted) | pending (the group re-gated entry — demoted) |
 *    removed (the group purged limited members)
 *  - accepted → removed (admin removal; or the group re-gated and the
 *    member was kicked)
 *  - declined / removed → pending | accepted (re-ask observed: the out-of-
 *    band rejoin landed, or a re-request is waiting)
 *  - login-wall / unknown → any (the wall lifted / the page classified; the
 *    observation is replaced by whatever the clean run saw)
 */
const PLATFORM_EDGES: Record<CommunityJoinState, CommunityJoinState[]> = {
  none: ['pending', 'accepted'],
  pending: ['accepted', 'declined'],
  limited: ['accepted', 'pending', 'removed'],
  accepted: ['removed'],
  declined: ['pending', 'accepted'],
  removed: ['pending', 'accepted'],
  'login-wall': ['none', 'pending', 'limited', 'accepted', 'declined', 'removed'],
  unknown: ['none', 'pending', 'limited', 'accepted', 'declined', 'removed']
}

/**
 * Decide one membership transition. Pure — the store (409 on refusal) and
 * the UI (hiding the action) both call this, so they can never disagree.
 *
 * Returns `{ allowed: false, reason }` with a human reason the UI can show
 * verbatim in a disabled tooltip.
 */
export function communityAllowedTransition(
  from: CommunityJoinState,
  to: CommunityJoinState,
  source: CommunityTransitionSource,
  context: CommunityTransitionContext = {}
): { allowed: boolean; reason?: string } {
  if (from === to) {
    return { allowed: false, reason: `Already ${COMMUNITY_JOIN_STATE_LABELS[from].toLowerCase()}.` }
  }
  // Observation states belong to the poller: only a `platform` run can
  // write one (the client saw a session wall / unclassified page) and only
  // the next `platform` run resolves out of one. A user move aimed at a
  // group the poller can't see is how a stale "joined!" gets asserted over
  // a wall.
  const OBSERVATION_STATES: readonly CommunityJoinState[] = ['login-wall', 'unknown']
  if (OBSERVATION_STATES.includes(to)) {
    if (source !== 'platform') {
      return {
        allowed: false,
        reason: `A login wall / unknown state can only be written by the platform's observation (${COMMUNITY_JOIN_STATE_LABELS[from]} → ${COMMUNITY_JOIN_STATE_LABELS[to]}).`
      }
    }
    return { allowed: true }
  }
  if (OBSERVATION_STATES.includes(from)) {
    if (source !== 'platform') {
      return {
        allowed: false,
        reason: `The poller last saw ${from === 'login-wall' ? 'a login wall' : 'an unclassified page'} — wait for the next observation before acting.`
      }
    }
    return { allowed: true }
  }

  if (source === 'user') {
    const issue = context.accountIssue
    if (issue && WRITE_BLOCKING_ISSUES.includes(issue)) {
      return {
        allowed: false,
        reason:
          issue === 'suspended'
            ? 'The joining account is suspended — Facebook will refuse the group request.'
            : 'The joining account has limited access — group joins are refused.'
      }
    }
    // A group the ADMIN removed the user from is not free to rejoin: the
    // group may block rejoining entirely or gate it behind a fresh admin
    // approval. A self-leave (removedBy: 'user') rejoins exactly as the
    // original join went. Mirrors the listings "platform takedown vs seller
    // delist" relist split.
    if (from === 'removed' && context.removedBy === 'platform' && (to === 'pending' || to === 'accepted')) {
      return {
        allowed: false,
        reason: 'The group removed this account \u2014 rejoining is at the group\u2019s discretion; wait for the group to allow it (the poller will report a change).'
      }
    }
  }

  const edges = source === 'user' ? USER_EDGES : PLATFORM_EDGES
  if (!edges[from].includes(to)) {
    return {
      allowed: false,
      reason:
        source === 'user'
          ? `The dashboard can't move a ${COMMUNITY_JOIN_STATE_LABELS[from].toLowerCase()} group to ${COMMUNITY_JOIN_STATE_LABELS[to].toLowerCase()}.`
          : `The platform never moves a ${COMMUNITY_JOIN_STATE_LABELS[from].toLowerCase()} group to ${COMMUNITY_JOIN_STATE_LABELS[to].toLowerCase()}.`
    }
  }
  return { allowed: true }
}

/**
 * Which actions the dashboard may offer for one community. Composes the
 * per-state edges with the joining account issue, so the UI and the store
 * 409 the same set of refused moves.
 */
export function communityActions(
  joinState: CommunityJoinState,
  context: CommunityTransitionContext = {}
): {
  /** `POST /communities/:id/join` — join or send a join request. */
  join: boolean
  /** `DELETE /communities/:id` on a pending row — withdraw the request. */
  withdraw: boolean
  /** `DELETE /communities/:id` on an accepted/limited row — leave the group
   *  (user-caused → `removedBy: 'user'`). */
  leave: boolean
  /** Whether a row reads as a poller observation (no user action possible
   *  until the next clean run). */
  observedOnly: boolean
} {
  const allowed = (to: CommunityJoinState) =>
    communityAllowedTransition(joinState, to, 'user', context).allowed
  const observedOnly = joinState === 'login-wall' || joinState === 'unknown'
  return {
    join: allowed('pending') || allowed('accepted'),
    withdraw: !observedOnly && allowed('none'),
    leave: !observedOnly && allowed('removed'),
    observedOnly
  }
}