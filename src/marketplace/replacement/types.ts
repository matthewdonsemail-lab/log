/**
 * Losing an account and replacing it in its campaigns (matt, 2026-10-18): the
 * account and its listings are kept; each campaign listing it held gets a new
 * row on another account in the same country. Listaro had no replacement at
 * all (its reposts always went back to the same account), so these rules are
 * log-cli's own: `docs/accountsAndListings.md`.
 */
import type { AgencyListing } from '../agencyListing/types'
import type { AccountStatus, FacebookAccount } from '../socialAccount/types'

export interface Replacement {
  old: AgencyListing
  /** The new READY row, or null when no account qualified (the old row stays accountLost). */
  next: AgencyListing | null
  account: FacebookAccount | null
  /** Why nothing was placed, when `next` is null. */
  detail?: string
}

export interface LossReport {
  account: FacebookAccount
  status: AccountStatus
  /** Listings moved to accountLost. */
  lost: AgencyListing[]
  replacements: Replacement[]
}

export interface FillReport {
  created: { listing: AgencyListing; account: FacebookAccount }[]
  /** Slots that couldn't be filled (no more eligible accounts). */
  short: number
}
