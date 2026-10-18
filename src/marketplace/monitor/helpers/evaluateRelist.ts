import type { ListingHealth, RelistDecision, RelistPolicy, WatchedListing } from '../types'

const FATAL: ListingHealth[] = ['POLICY_VIOLATION', 'COMMERCE_BAN', 'CHECKPOINT_REQUIRED']

/**
 * Port of facebook-camofox-client `evaluate_relist_trigger`, plus Listaro's
 * dedup guard (never queue a second repost for the same listing). Pure.
 */
export function evaluateRelist(listing: WatchedListing, health: ListingHealth, policy: RelistPolicy): RelistDecision {
  const base = { listingId: listing.listingId, health, shouldRepost: false, cooldownMs: 0, nextGeneration: listing.generation, fatal: false }
  if (FATAL.includes(health)) return { ...base, fatal: true, reason: `fatal safety stop: ${health}` }
  if (health === 'SOLD') return { ...base, reason: 'sold, nothing to do' }
  if (health === 'ACTIVE' || health === 'UNDER_REVIEW') return { ...base, reason: `healthy (${health})` }
  if (health === 'RETRY_EXHAUSTED') return { ...base, reason: 'repost budget used up, operator must review' }
  if (health === 'DUPLICATE_TAKEDOWN' || health === 'DELETED_BY_FB') {
    if (listing.repostPending) return { ...base, reason: 'repost already queued' }
    if (listing.generation >= policy.maxRepostAttempts) {
      return { ...base, health: 'RETRY_EXHAUSTED', reason: `max reposts (${policy.maxRepostAttempts}) reached` }
    }
    return {
      ...base,
      shouldRepost: true,
      reason: 'takedown confirmed, repost approved',
      cooldownMs: listing.generation === 0 ? policy.cooldownFirstMs : policy.cooldownLaterMs,
      nextGeneration: listing.generation + 1
    }
  }
  return { ...base, reason: `unrecognised status ${health}, holding for operator` }
}
