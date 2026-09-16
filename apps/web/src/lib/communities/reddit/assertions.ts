import { writeBlockedVerdict, type TransitionVerdict } from '../transition'
import type { RedditContext, RedditStateValue } from './types'

/**
 * Pure guards for the Reddit membership machine. Single source for edge
 * legality — the xstate machine references these, the store 409s with their
 * reasons, and the dashboard menu calls them directly.
 */

/** Outbound post submission is legal from this snapshot. */
export function canPost(
  value: RedditStateValue,
  context: Pick<RedditContext, 'accountIssue' | 'karmaGated' | 'canPost'>
): TransitionVerdict {
  const blocked = writeBlockedVerdict(context.accountIssue)
  if (blocked) return blocked
  if (value !== 'subscribed' && value !== 'restrictedReadOnly') {
    return refuseReason(`Nothing can be posted from a ${value} community.`)
  }
  if (!context.canPost) {
    return refuseReason('Posting is locked for this account — contributor approval is outstanding.')
  }
  if (context.karmaGated) {
    return refuseReason('Submits are being swallowed by the automod karma gate — build standing first.')
  }
  return { allowed: true }
}

function refuseReason(reason: string): TransitionVerdict {
  return { allowed: false, reason }
}

/** Commenting is legal from this snapshot (restricted may lock it separately). */
export function canComment(
  value: RedditStateValue,
  context: Pick<RedditContext, 'accountIssue' | 'karmaGated' | 'canComment'>
): TransitionVerdict {
  const blocked = writeBlockedVerdict(context.accountIssue)
  if (blocked) return blocked
  if (value !== 'subscribed' && value !== 'restrictedReadOnly') {
    return refuseReason(`Nothing can be commented from a ${value} community.`)
  }
  if (!context.canComment) {
    return refuseReason('Commenting is locked for this account in this community.')
  }
  if (context.karmaGated) {
    return refuseReason('Replies are being swallowed by the automod karma gate — build standing first.')
  }
  return { allowed: true }
}

/** The read stream (feed, search, keyword listening) is reachable. */
export function canReadStream(value: RedditStateValue): TransitionVerdict {
  switch (value) {
    case 'privateGated':
      return refuseReason('The read stream is locked — access must be requested first.')
    case 'quarantineGate':
      return refuseReason('The read stream is locked behind the quarantine opt-in.')
    case 'gone':
      return refuseReason('The community is gone — there is nothing to read.')
    case 'observationWall':
      return refuseReason('The poller cannot see through the current wall — wait for the next observation.')
    default:
      return { allowed: true }
  }
}

/** This snapshot sits behind the quarantine opt-in wall. */
export function isQuarantineGated(value: RedditStateValue): boolean {
  return value === 'quarantineGate'
}

/**
 * Automod gate evidence check. `submitOk` is the platform's 200; `visible`
 * is whether an authenticated-alt-observer fetch sees the content. A 200
 * that nobody else can see is the gate — never inferred from an
 * unauthenticated probe (those 403 outright since May 2026).
 */
export function isAutomodGated(submitOk: boolean, visibleToOthers: boolean): boolean {
  return submitOk && !visibleToOthers
}
