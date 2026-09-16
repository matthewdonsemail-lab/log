import type { AccountIssue } from '../account-issues'
import { WRITE_BLOCKING_ISSUES } from '../account-state'
import { LISTING_STATUS_LABELS } from './types'
import type { ListingStatus, RemovalProvenance } from './types'

/**
 * The listing state machine — one contract shared by the dashboard actions
 * and the facebook-camofox-client poller so both sides of the
 * `PATCH /listings/:id/status` route agree on which moves are legal.
 *
 * Who-set-it matters as much as the state itself:
 *  - `active`, `under-review`, `under-review-duplicate` are set by the
 *    PLATFORM only (publish → review → approve; the client observes and
 *    reports, the seller can never hand a listing a live status).
 *  - `sold` is set by the SELLER only ("Mark as sold" — buyers get
 *    notified, the listing leaves the feed; "Mark as available" brings it
 *    back).
 *  - `removed` is set by EITHER, and `removedBy` (on the record) records
 *    which: a seller delist (hidden — relistable) vs a platform takedown
 *    (policy violation / rejection / inactivity expiry — the only way back
 *    is the request-review appeal, not a relist).
 *  - `login-wall`, `unknown` are CLIENT OBSERVATIONS, not listing states —
 *    the poller couldn't see through a session wall or classify the page.
 *    They overwrite any state and can be resolved back to any real state.
 *
 * Account composition: a listing under an account gated by
 * `WRITE_BLOCKING_ISSUES` (suspended / read-only-limited) cannot be
 * advanced by the seller — the platform would refuse the write, so the
 * store refuses it first (409) and the UI hides the actions.
 */

export type TransitionSource = 'seller' | 'platform'

export interface ListingTransitionContext {
  /** Provenance of the current `removed` state — gates the seller relist. */
  removedBy?: RemovalProvenance
  /** Normalized issue on the owning account — see WRITE_BLOCKING_ISSUES. */
  accountIssue?: AccountIssue
}

const OBSERVATION_STATES: readonly ListingStatus[] = ['login-wall', 'unknown']

/**
 * SELLER edges — the only status writes the dashboard offers. Everything
 * the UI can do must be an edge here; the 409 below keeps the store honest
 * if the UI is bypassed.
 *  - active → sold | removed ("Mark as sold" / "Remove listing")
 *  - sold   → active | removed ("Mark as available" / archive after sale)
 *  - removed(seller) → active (relist the seller's own delist)
 *  - under-review* → removed (pull a held listing while review runs)
 */
const SELLER_EDGES: Record<ListingStatus, ListingStatus[]> = {
  'under-review': ['removed'],
  'under-review-duplicate': ['removed'],
  active: ['sold', 'removed'],
  sold: ['active', 'removed'],
  removed: ['active'],
  'login-wall': [],
  unknown: []
}

/**
 * PLATFORM edges — what the camofox poller can legitimately report.
 *  - under-review → active (approved) | under-review-duplicate (dup flag)
 *    | removed (rejected)
 *  - under-review-duplicate → active (cleared) | removed (still dup → pulled)
 *  - active → removed (policy takedown during a live listing)
 *  - sold → removed (post-sale archive)
 *  - removed → active (request-review restore — the platform undoing its
 *    own removal; the seller's undo is the SELLER `removed → active` edge)
 *  - login-wall/unknown → any resolved state (observation cleared)
 */
const PLATFORM_EDGES: Record<ListingStatus, ListingStatus[]> = {
  'under-review': ['active', 'under-review-duplicate', 'removed'],
  'under-review-duplicate': ['active', 'removed'],
  active: ['removed'],
  sold: ['removed'],
  removed: ['active'],
  'login-wall': ['under-review', 'under-review-duplicate', 'active', 'sold', 'removed'],
  unknown: ['under-review', 'under-review-duplicate', 'active', 'sold', 'removed']
}

/**
 * Decide one transition. Pure — the store (409 on refusal) and the UI
 * (hiding the button) both call this, so they can never disagree.
 *
 * Returns `{ allowed: false, reason }` with a human reason the UI can show
 * verbatim in a disabled tooltip.
 */
export function allowedTransition(
  from: ListingStatus,
  to: ListingStatus,
  source: TransitionSource,
  context: ListingTransitionContext = {}
): { allowed: boolean; reason?: string } {
  if (from === to) {
    return { allowed: false, reason: `Already ${LISTING_STATUS_LABELS[from].toLowerCase()}.` }
  }
  // Observation states belong to the poller: only a `platform` report can
  // write one (the client saw a session wall / unclassified page), and only
  // the next `platform` observation resolves out of one. A seller never
  // writes or un-writes an observation — acting on a listing the poller
  // can't see is how stale writes end up silently reverted.
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
        reason: `The poller last saw ${from === 'login-wall' ? 'a login wall' : 'an unclassified page'} — wait for the next observation before acting.`
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
    // The seller's only way out of `removed` is relisting a listing THEY
    // took down. A platform takedown (violation / rejection / expiry)
    // comes back through the request-review appeal only.
    if (to === 'active' && context.removedBy === 'platform') {
      return {
        allowed: false,
        reason: 'Facebook removed this listing — relist is blocked; request a review instead.'
      }
    }
  }
  return { allowed: true }
}

/**
 * Which actions the dashboard may offer for one listing. Composes the
 * per-status edges with the owning account's issue, so the UI and the
 * store 409 the same set of refused moves.
 */
export function listingActions(
  status: ListingStatus,
  context: ListingTransitionContext = {}
): {
  /** `PATCH /listings/:id` — the edit form. Editing never changes status;
   *  it's refused for takedowns and unobserved rows because the listing may
   *  not be editable on the platform at all. */
  edit: boolean
  /** `PATCH .../status` → `sold`. Only a live listing can be sold. */
  markSold: boolean
  /** `PATCH .../status` → `removed`. Pull a live listing or archive a sale. */
  remove: boolean
  /** `PATCH .../status` → `active`. Un-archive a sale. */
  markAvailable: boolean
  /** `PATCH .../status` → `active`. Relist a seller delist (never a takedown). */
  relist: boolean
  /** `DELETE /listings/:id` — always offered; the row leaves the store. */
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