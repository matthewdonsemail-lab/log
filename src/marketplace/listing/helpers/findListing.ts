import type { ListingRecord } from '../types'

/**
 * Find by the Marketplace-native `listingId` or the opaque `id`. The `id` is
 * minted per load, so `listingId` is the one to type.
 */
export function findListing(listings: ListingRecord[], key: string): ListingRecord | undefined {
  return listings.find((row) => row.listingId === key || row.id === key)
}
