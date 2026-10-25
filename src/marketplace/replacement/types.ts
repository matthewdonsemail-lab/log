import type { AgencyListing } from '../agencyListing/types'
import type { AccountStatus, FacebookAccount } from '../socialAccount/types'

export interface Replacement {
  old: AgencyListing
  next: AgencyListing | null
  account: FacebookAccount | null
  detail?: string
}

export interface LossReport {
  account: FacebookAccount
  status: AccountStatus
  lost: AgencyListing[]
  replacements: Replacement[]
}

export interface BlockedListing {
  listing: AgencyListing
  account: FacebookAccount
}

export interface SweepReport {
  lost: BlockedListing[]
  replacements: Replacement[]
}

export interface FillReport {
  created: { listing: AgencyListing; account: FacebookAccount }[]
  short: number
}
