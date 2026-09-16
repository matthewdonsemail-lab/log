import type { ConnectionRecord } from '../connections'
import { deriveFacebookValue, facebookMenu } from './facebook/machine'
import { deriveRedditValue, redditMenu, redditUserVerdict } from './reddit/machine'
import { deriveXValue, xMenu } from './x/machine'
import type { Community, StoredCommunityJoin } from './types'

/**
 * Unified row-menu availability across the platform machines. The dashboard
 * never branches on platform for lifecycle questions — it asks this helper,
 * which dispatches to the platform machine's menu function with the exact
 * snapshot the store would drive. Refused moves are omitted (the Dropdown
 * has no disabled items), so the menu and the store 409s agree by
 * construction.
 */
export interface CommunityMenuAvailability {
  join: boolean
  withdraw: boolean
  leave: boolean
  /** Facebook: reopen an abandoned entry form with preserved drafts. */
  resume: boolean
  /** Reddit: dispatch a modmail access request (private-gated). */
  requestAccess: boolean
  /** Reddit: record the quarantine opt-in intent. */
  optIn: boolean
}

/** Rebuild the durable row shape from a materialized community (menus only). */
function storedFromCommunity(community: Community): StoredCommunityJoin {
  return {
    state: community.joinState,
    accountId: community.accountId,
    answers: community.answers,
    answersComplete: community.answersComplete,
    questionsHash: community.questionsHash,
    questionsScrapedAt: community.questionsScrapedAt,
    scrapedQuestions: null,
    draftAnswers: community.draftAnswers,
    submittedAt: null,
    removedBy: community.removedBy,
    formPhase: community.formPhase,
    priorJoinState: null,
    subredditType: community.subredditType,
    userIsContributor: community.userIsContributor,
    quarantineOptIn: community.quarantineOptIn,
    karmaGated: community.karmaGated,
    karmaEvidence: null,
    accessRequested: community.accessRequested
  }
}

export function communityMenuAvailability(
  community: Community,
  accounts: readonly ConnectionRecord[]
): CommunityMenuAvailability {
  const accountIssue = community.accountId
    ? (accounts.find((row) => row.id === community.accountId)?.lastIssue ?? undefined)
    : undefined
  const row = storedFromCommunity(community)
  if (community.platform === 'facebook') {
    const menu = facebookMenu(deriveFacebookValue(row), {
      accountIssue,
      removedBy: community.removedBy
    })
    return { ...menu, requestAccess: false, optIn: false }
  }
  if (community.platform === 'reddit') {
    const value = deriveRedditValue(row)
    const menu = redditMenu(value, { accountIssue })
    return {
      join: menu.join,
      withdraw: menu.withdraw,
      leave: menu.leave,
      resume: false,
      requestAccess: redditUserVerdict(value, {}, 'requestAccess').allowed,
      optIn: redditUserVerdict(value, {}, 'optIn').allowed
    }
  }
  const menu = xMenu(deriveXValue(row), { accountIssue })
  return { ...menu, resume: false, requestAccess: false, optIn: false }
}
