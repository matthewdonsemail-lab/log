import type { ListingRecord, ListingStatus } from '../types'

export interface ListingFilter {
  status?: ListingStatus
  accountId?: string
}

export function filterListings(listings: ListingRecord[], filter: ListingFilter): ListingRecord[] {
  return listings.filter(
    (row) =>
      (filter.status === undefined || row.status === filter.status) &&
      (filter.accountId === undefined || row.accountId === filter.accountId)
  )
}
