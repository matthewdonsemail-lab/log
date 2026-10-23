export type ListingStatus =
  | 'active'
  | 'underReview'
  | 'underReviewDuplicate'
  | 'sold'
  | 'removed'
  | 'loginWall'
  | 'unknown'

export type RemovalProvenance = 'seller' | 'platform'

export const LISTING_STATUSES: ListingStatus[] = [
  'active',
  'underReview',
  'underReviewDuplicate',
  'sold',
  'removed',
  'loginWall',
  'unknown'
]

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  active: 'Active',
  'underReview': 'Under review',
  'underReviewDuplicate': 'Duplicate hold',
  sold: 'Sold',
  removed: 'Removed',
  'loginWall': 'Login wall',
  unknown: 'Unknown'
}

export interface ListingLocation {
  lat: number
  lng: number
  radiusKm: number
}

export const DEFAULT_LISTING_LOCATION: ListingLocation = { lat: 53.2707, lng: -9.0568, radiusKm: 10 }

export interface ListingRecord {
  id: string

  listingId: string
  title: string
  price: string
  category: string
  condition: string | null
  location: string
  accountId: string
  account: string
  locationPoint?: ListingLocation
  images: string[]
  status: ListingStatus
  removedBy?: RemovalProvenance
  listingUrl: string
  publishedAt: string
}

export interface ListingsResponse {
  listings: ListingRecord[]
}

export interface ListingDraft {
  title: string
  price: string
  category: string
  condition: string | null
  location: string
  accountId: string
  locationPoint: ListingLocation
  images: string[]
}

export interface ListingCreatedResponse {
  listing: ListingRecord
  listings: ListingRecord[]
}

export interface ListingStatusResponse {
  id: string
  status: ListingStatus
  title: string | null
}