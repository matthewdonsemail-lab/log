import type { AgencyListingStatus } from '../../../marketplace/agencyListing/index.ts'

/** The account's Marketplace status page (`CometMarketplaceStatusContentContainerQuery`). */
export interface MarketplaceAccess {
  /** "You have full access to Marketplace". */
  title: string | null
  body: string | null
  /** Facebook's own flag: the account may not buy or sell. */
  banned: boolean
  /** The profile's health on the same page (`GOOD` when fine). */
  profileStatus: string | null
  /** Set when an enforcement is on the account. */
  enforcementId: string | null
  /** `sell_on_marketplace` from the page's feature access (`ELIGIBLE`), or null when the page didn't carry it. */
  sell: string | null
}

/** One listing as the Selling page's data gives it (preloaded into the page). */
export interface SellingListing {
  listingId: string
  title: string
  price: string | null
  onMarketplace: boolean
  sold: boolean
  pending: boolean
  draft: boolean
  rejected: boolean
  duplicate: boolean
  /** "This listing is being reviewed." while Facebook reviews it; null once it is through. */
  notice: string | null
  /** The status Twenty keeps for it. */
  status: AgencyListingStatus
}

/** The seller tab of the Marketplace inbox (`CometMarketplaceInboxSellerTabThreadViewContainerQuery`). */
export interface SellerInbox {
  /** How many threads the first page holds. */
  threads: number
  hasNextPage: boolean
  /** The threads as Facebook sent them: their fields are mapped once a recording holds one (rule 29). */
  raw: unknown[]
}

/** One check of an account: what each read found, or null when its response wasn't in the recording. */
export interface MarketplaceCheck {
  access: MarketplaceAccess | null
  listings: SellingListing[] | null
  inbox: SellerInbox | null
}

/** What a check changed or found, line by line, and the account issue it raised, if any. */
export interface CheckReport {
  lines: string[]
  /** `suspended` when Marketplace access is gone. */
  issue: { code: 'suspended'; detail: string } | null
  /** Seller threads the inbox holds now. */
  threads: number
}
