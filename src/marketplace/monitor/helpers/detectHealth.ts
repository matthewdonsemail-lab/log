import type { ListingHealth, WatchedListing } from '../types'

/**
 * What each watched listing's health is after one dashboard check.
 * Seen on the dashboard: its badge. Missing: DELETED_BY_FB, but only when the
 * check is trustworthy. Listaro's guard: if the page showed no listings, or
 * fewer than 3 while more than 3 are watched, treat missing as UNKNOWN (the
 * page probably did not load), never as removed. Pure.
 */
export function detectHealth(
  watched: WatchedListing[],
  seen: { listingId: string; health: ListingHealth }[]
): { listingId: string; health: ListingHealth }[] {
  const byId = new Map(seen.map((row) => [row.listingId, row.health]))
  const trustMissing = seen.length > 0 && !(seen.length < 3 && watched.length > 3)
  return watched.map((listing) => ({
    listingId: listing.listingId,
    health: byId.get(listing.listingId) ?? (trustMissing ? 'DELETED_BY_FB' : 'UNKNOWN')
  }))
}
