import type { ConnectionRecord } from '../../account/index'
import { listingActions } from '../machine'
import type { ListingRecord } from '../types'

/** The seller actions the dashboard offers for this row, given its owning account. */
export function getSellerActions(listing: ListingRecord, accounts: ConnectionRecord[]) {
  const owner = accounts.find((account) => account.id === listing.accountId)
  return listingActions(listing.status, {
    removedBy: listing.removedBy,
    accountIssue: owner?.lastIssue ?? undefined
  })
}
