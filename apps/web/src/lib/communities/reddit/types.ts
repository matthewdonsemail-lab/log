import type { AccountIssue } from '../../account-issues'

/**
 * Reddit community detail. `subreddit_type` values come from the official
 * surface (`r/{sub}/about.json`, see PRAW's documented set): `public`,
 * `restricted`, `private` plus `archived`, `employees_only`, `gold_only`,
 * `gold_restricted`, `premium_only` — the tail maps to `unclassified` with
 * a note, never to a silent wrong state.
 */
export type RedditSubredditType =
  | 'public'
  | 'restricted'
  | 'private'
  | 'quarantined'
  | 'banned'
  | 'archived'
  | 'employees_only'
  | 'gold_only'
  | 'gold_restricted'
  | 'premium_only'
  | 'unclassified'

export type RedditStateValue =
  | 'unsubscribed'
  | 'subscribed'
  | 'restrictedReadOnly'
  | 'privateGated'
  | 'quarantineGate'
  | 'gone'
  | 'observationWall'

export type RedditWallType = 'login' | 'challenge' | 'unclassified'

export interface RedditContext {
  accountId: string | null
  accountIssue?: AccountIssue
  subredditType: RedditSubredditType
  subscribed: boolean
  /** Approved contributor — posting/commenting unlocked in restricted subs. */
  userIsContributor: boolean
  /** Restricted subs lock posting, commenting, or both depending on settings. */
  canPost: boolean
  canComment: boolean
  quarantineOptIn: boolean
  /**
   * Automod karma/age gate evidence — a TAG, not a state: set when a 200-OK
   * submit disappears under an authenticated-alt-observer fetch. Never
   * asserted from an unauthenticated probe (those 403 since May 2026).
   */
  karmaGated: boolean
  karmaEvidence?: string | null
  /** Private subs: an access request has been dispatched (modmail). */
  accessRequested: boolean
  wallType?: RedditWallType
  /** True while the wall overwrites the membership (guards double-walls). */
  walled: boolean
  priorValue?: RedditStateValue | null
  lastError: string | null
}

export type RedditEvent =
  | { type: 'SUBSCRIBE'; accountId?: string | null; accountIssue?: AccountIssue }
  | { type: 'UNSUBSCRIBE' }
  | {
      type: 'METADATA_OBSERVED'
      subredditType: RedditSubredditType
      subscribed: boolean
      contributor?: boolean
      quarantineOptIn?: boolean
    }
  | { type: 'CONTRIBUTOR_APPROVED' }
  | { type: 'REQUEST_ACCESS' }
  | { type: 'OPT_IN_QUARANTINE' }
  | { type: 'QUARANTINE_CLEARED' }
  | { type: 'MARK_KARMA_GATED'; evidence: string }
  | { type: 'KARMA_CLEARED' }
  | { type: 'OBSERVE_WALL'; wallType: RedditWallType }

export interface RedditInput {
  accountId?: string | null
  accountIssue?: AccountIssue
  subredditType?: RedditSubredditType
  subscribed?: boolean
  contributor?: boolean
  quarantineOptIn?: boolean
}
