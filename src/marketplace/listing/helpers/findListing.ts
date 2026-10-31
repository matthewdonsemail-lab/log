import type { ListingRecord } from '../types'

export function findListing(listings: ListingRecord[], key: string): ListingRecord | undefined {
  return listings.find((row) => row.listingId === key || row.id === key)
}
