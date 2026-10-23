import type { AgencyListingStatus } from '../../../marketplace/agencyListing/index.ts'

export interface MarketplaceAccess {
  title: string | null
  body: string | null
  banned: boolean
  profileStatus: string | null
  enforcementId: string | null
  sell: string | null
}

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
  notice: string | null
  clicks: number | null
  status: AgencyListingStatus
}

export interface SellerInbox {
  threads: number
  hasNextPage: boolean
  raw: unknown[]
}

export interface MarketplaceCheck {
  access: MarketplaceAccess | null
  listings: SellingListing[] | null
  inbox: SellerInbox | null
}

export interface CheckReport {
  lines: string[]
  issue: { code: 'suspended'; detail: string } | null
  threads: number
}
