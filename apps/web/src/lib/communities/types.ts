import type { ConnectionPlatform } from '../connections'

/**
 * Where a community membership stands. The full FB group lifecycle, not the
 * "joined / not joined" boolean:
 *  - `none` — not a member (fresh, or a request the user withdrew).
 *  - `pending` — join request sent, admin approval outstanding (private
 *    groups; public groups skip this and land in `accepted`).
 *  - `limited` — limited membership: can see and react but not post. Entered
 *    automatically when a group restricts who may join; the ONE state the
 *    group can demote a member from.
 *  - `accepted` — full member (can post).
 *  - `declined` — the admin rejected the request.
 *  - `removed` — no longer a member: left by the user, or removed by the
 *    admin (see `removedBy` — both look identical to the poller, which only
 *    ever sees "member" → "not a member").
 *  - `login-wall` / `unknown` — client OBSERVATIONS, not membership states:
 *    the poller couldn't see through a session wall or classify the page.
 *    They overwrite any state and resolve to any other state when the next
 *    clean run sees the group.
 */
export type CommunityJoinState =
  | 'none'
  | 'pending'
  | 'limited'
  | 'accepted'
  | 'declined'
  | 'removed'
  | 'login-wall'
  | 'unknown'

/** Every join state the mock store can hold — drives the form's filter. */
export const COMMUNITY_JOIN_STATES: readonly CommunityJoinState[] = [
  'none',
  'pending',
  'limited',
  'accepted',
  'declined',
  'removed',
  'login-wall',
  'unknown'
]

export const COMMUNITY_JOIN_STATE_LABELS: Record<CommunityJoinState, string> = {
  none: 'Not joined',
  pending: 'Pending',
  limited: 'Limited member',
  accepted: 'Member',
  declined: 'Declined',
  removed: 'Removed',
  'login-wall': 'Login wall',
  unknown: 'Unclassified'
}

/**
 * Provenance of a `removed` state —mirrors the listings domain's
 * `removedBy`. A poller cannot tell a self-leave from an admin removal
 * (both surface as "no longer a member"), so the dashboard records which it
 * was when it caused the removal. Gates the rejoin path: a self-leave
 * rejoins exactly as the original join went; a removal was imposed by the
 * group, so the rejoin may have to clear entry questions / admin approval
 * again.
 */
export type CommunityRemovalProvenance = 'user' | 'platform'

export interface Community {
  id: string
  platform: ConnectionPlatform
  name: string
  handle: string
  /** Display-only size, e.g. "48k members". */
  members: string
  description: string
  /**
   * Canonical link for the community. Facebook rows carry their group URL —
   * the group step on the facebook path joins by this URL (the form takes a
   * pasted link, passes it through the API, and the mock registers it from
   * the slug when it isn't tracked yet).
   */
  url: string | null
  /**
   * Hardcoded entry questions the group asks before accepting (facebook
   * groups gate entry). The form resolves the pasted URL into these and
   * sends the typed answers along with the join request.
   */
  entryQuestions: string[]
  /**
   * Answers sent with the join request — kept for `pending`, `accepted`
   * (for the record) and `declined` (the admin saw THESE; editing them is
   * the re-ask path).
   */
  answers: string[]
  /** Where the join request / membership for this community stands. */
  joinState: CommunityJoinState
  /**
   * Set when `joinState === 'removed'` — who took the membership away
   * (see {@link CommunityRemovalProvenance}).
   */
  removedBy?: CommunityRemovalProvenance
  /**
   * The account the request was sent / joined with. Facebook groups are
   * joined through a connected account, so this is set for any facebook
   * community that has ever been joined (pending, limited, accepted,
   * declined, removed); null for workspace-scoped rows (subreddits, X
   * communities) and for accounts that were deleted from the roster.
   */
  accountId: string | null
  /**
   * Label of the joining account, resolved from the connections domain at
   * render time (keeps the row honest when the account is re-labelled or
   * removed from the roster).
   */
  accountLabel: string | null
}

export interface CommunitiesResponse {
  communities: Community[]
}

export interface CommunityResponse {
  community: Community
  communities: Community[]
}