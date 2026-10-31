import type { AccountIssue } from '../account/index'
import { WRITE_BLOCKING_ISSUES } from '../account/index'
import { LISTING_STATUS_LABELS } from './types'
import type { ListingStatus, RemovalProvenance } from './types'

export type TransitionSource = 'seller' | 'platform'

export interface ListingTransitionContext {
  removedBy?: RemovalProvenance
  accountIssue?: AccountIssue
}

const OBSERVATION_STATES: readonly ListingStatus[] = ['loginWall', 'unknown']

const SELLER_EDGES: Record<ListingStatus, ListingStatus[]> = {
  'underReview': ['removed'],
  'underReviewDuplicate': ['removed'],
  active: ['sold', 'removed'],
  sold: ['active', 'removed'],
  removed: ['active'],
  'loginWall': [],
  unknown: []
}

const PLATFORM_EDGES: Record<ListingStatus, ListingStatus[]> = {
  'underReview': ['active', 'underReviewDuplicate', 'removed'],
  'underReviewDuplicate': ['active', 'removed'],
  active: ['removed'],
  sold: ['removed'],
  removed: ['active'],
  'loginWall': ['underReview', 'underReviewDuplicate', 'active', 'sold', 'removed'],
  unknown: ['underReview', 'underReviewDuplicate', 'active', 'sold', 'removed']
}

export function allowedTransition(
  from: ListingStatus,
  to: ListingStatus,
  source: TransitionSource,
  context: ListingTransitionContext = {}
): { allowed: boolean; reason?: string } {
  if (from === to) {
    return { allowed: false, reason: `Already ${LISTING_STATUS_LABELS[from].toLowerCase()}.` }
  }
  if (OBSERVATION_STATES.includes(to)) {
    if (source !== 'platform') {
      return {
        allowed: false,
        reason: `A login wall / unknown state can only be written by the client's observation (${LISTING_STATUS_LABELS[from]} → ${LISTING_STATUS_LABELS[to]}).`
      }
    }
    return { allowed: true }
  }
  if (OBSERVATION_STATES.includes(from)) {
    if (source !== 'platform') {
      return {
        allowed: false,
        reason: `The poller last saw ${from === 'loginWall' ? 'a login wall' : 'an unclassified page'} — wait for the next observation before acting.`
      }
    }
    return { allowed: true }
  }

  const edges = source === 'seller' ? SELLER_EDGES : PLATFORM_EDGES
  if (!edges[from].includes(to)) {
    return {
      allowed: false,
      reason:
        source === 'seller'
          ? `A seller can't move a ${LISTING_STATUS_LABELS[from].toLowerCase()} listing to ${LISTING_STATUS_LABELS[to].toLowerCase()}.`
          : `The platform never moves a ${LISTING_STATUS_LABELS[from].toLowerCase()} listing to ${LISTING_STATUS_LABELS[to].toLowerCase()}.`
    }
  }
  return validateContext(source, to, context)
}

function validateContext(
  source: TransitionSource,
  to: ListingStatus,
  context: ListingTransitionContext
): { allowed: boolean; reason?: string } {
  if (source === 'seller') {
const issue = context.accountIssue
      if (issue && WRITE_BLOCKING_ISSUES.includes(issue)) {
      return {
        allowed: false,
        reason:
          issue === 'suspended'
            ? 'The owning account is suspended — the platform will refuse the change.'
            : 'The owning account has limited access — marketplace writes are refused.'
      }
    }
    if (to === 'active' && context.removedBy === 'platform') {
      return {
        allowed: false,
        reason: 'Facebook removed this listing — relist is blocked; request a review instead.'
      }
    }
  }
  return { allowed: true }
}

export function listingActions(
  status: ListingStatus,
  context: ListingTransitionContext = {}
): {
  edit: boolean
  markSold: boolean
  remove: boolean
  markAvailable: boolean
  relist: boolean
  delete: true
} {
  const allowed = (to: ListingStatus) =>
    allowedTransition(status, to, 'seller', context).allowed
  return {
    edit: !OBSERVATION_STATES.includes(status) && status !== 'removed',
    markSold: allowed('sold'),
    remove: allowed('removed'),
    markAvailable: status === 'sold' && allowed('active'),
    relist: status === 'removed' && allowed('active'),
    delete: true
  }
}