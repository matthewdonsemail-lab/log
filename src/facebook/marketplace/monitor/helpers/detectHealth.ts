import type { ListingHealth, WatchedListing } from '../types'

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
