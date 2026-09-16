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

/**
 * A joinable group the dashboard tracks: a Facebook group (joined through a
 * connected account) or a subreddit (workspace-scoped). X has no community
 * primitive — X listening is a keyword phrase (see the keywords domain), so
 * no `x` rows ever materialize here even though `platform` keeps the shared
 * `ConnectionPlatform` union.
 */
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
   * The entry questions as the dashboard currently knows them. Facebook
   * renders these dynamically into the join dialog — there is no official
   * API for them, so the client scrapes the dialog and reports back; this
   * field is the scraped set when `questionsHash` is set, else the catalog
   * fallback the mock seeds for the form's read-ahead.
   */
  entryQuestions: string[]
  /**
   * Opaque hash of the question set `entryQuestions` was taken from. Answers
   * are only prefillable when the hash matches — a changed set means the
   * group edited its gate and the form re-asks from blanks.
   */
  questionsHash: string | null
  /**
   * ISO timestamp of the scrape (client report) or resolve (mock
   * read-ahead) that produced `entryQuestions`. Null when neither has run
   * and the field is still the catalog fallback.
   */
  questionsScrapedAt: string | null
  /**
   * Answers sent with the join request — kept for `pending`, `accepted`
   * (for the record) and `declined` (the admin saw THESE; editing them is
   * the re-ask path).
   */
  answers: string[]
  /**
   * Whether `answers` covers every question in `entryQuestions` with
   * non-blank text. Facebook lets requests through unanswered, so a join
   * can land `pending` with this false — the row says how many were
   * answered and admins may decline it.
   */
  answersComplete: boolean
  /**
   * Latest unsent drafts for the current question set (client modal or
   * dashboard form). Survives abandon so resume never starts from blanks.
   */
  draftAnswers: string[]
  /** Where the join request / membership for this community stands. */
  joinState: CommunityJoinState
  /**
   * Client-modal mirror for facebook pre-submit phases (`idle` when no
   * modal is or was open). Drives the Resume menu item and the
   * "answering paused" notice; `idle` for reddit rows.
   */
  formPhase: StoredFormPhase
  /**
   * Reddit detail for exact menu gating (workspace-scoped rows carry no
   * account, so the row itself holds what the poller last observed).
   * Defaults for facebook rows.
   */
  subredditType: string | null
  userIsContributor: boolean
  quarantineOptIn: boolean
  karmaGated: boolean
  accessRequested: boolean
  /**
   * Per-row platform truth that doesn't fit the shared vocabulary — the
   * dashboard renders it as a note under the state badge (e.g. "read-only
   * until approved", "opt-in required", "request via modmail"). Derived at
   * materialize time from the platform detail, never written by hand.
   */
  notice: string | null
  /**
   * Set when `joinState === 'removed'` — who took the membership away
   * (see {@link CommunityRemovalProvenance}).
   */
  removedBy?: CommunityRemovalProvenance
  /**
   * The account the request was sent / joined with. Facebook groups are
   * joined through a connected account, so this is set for any facebook
   * community that has ever been joined (pending, limited, accepted,
   * declined, removed); null for workspace-scoped rows (subreddits) and
   * for accounts that were deleted from the roster.
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

/**
 * The durable flat projection of the platform actor snapshots — the only
 * thing the store persists per row. Actors are ephemeral (rebuilt per
 * request by replaying {@link StoredCommunityJoin} through the platform
 * bootstrap events), so this stays human-readable in localStorage and the
 * roster renders without ever starting an actor.
 *
 * Versioned by the store key (`communities.joins.v2`): a key bump resets
 * rows to seeds instead of running lossy migrations.
 */
export type StoredFormPhase = 'idle' | 'rendered' | 'incomplete' | 'submitting' | 'abandoned'

export interface StoredCommunityJoin {
  state: CommunityJoinState
  accountId: string | null
  answers: string[]
  answersComplete: boolean
  questionsHash: string | null
  questionsScrapedAt: string | null
  /** Last scraped question set — overrides the catalog fallback when set. */
  scrapedQuestions: string[] | null
  draftAnswers: string[]
  submittedAt: string | null
  removedBy?: CommunityRemovalProvenance
  /** Client-modal mirror (facebook pre-submit phases); `idle` otherwise. */
  formPhase: StoredFormPhase
  /**
   * Flat state overwritten when a wall landed — `cleared` replays from
   * this instead of guessing. Null whenever the row is not walled.
   */
  priorJoinState: CommunityJoinState | null
  /** Reddit detail (nulls until the poller observes). */
  subredditType: string | null
  userIsContributor: boolean
  quarantineOptIn: boolean
  karmaGated: boolean
  karmaEvidence: string | null
  accessRequested: boolean
}