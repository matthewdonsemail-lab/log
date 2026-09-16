export type ListingStatus =
  | 'active'
  | 'under-review'
  | 'under-review-duplicate'
  | 'sold'
  | 'removed'
  | 'login-wall'
  | 'unknown'

/** Which side took a `removed` listing down. */
export type RemovalProvenance = 'seller' | 'platform'

export const LISTING_STATUSES: ListingStatus[] = [
  'active',
  'under-review',
  'under-review-duplicate',
  'sold',
  'removed',
  'login-wall',
  'unknown'
]

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  active: 'Active',
  'under-review': 'Under review',
  'under-review-duplicate': 'Duplicate hold',
  sold: 'Sold',
  removed: 'Removed',
  'login-wall': 'Login wall',
  unknown: 'Unknown'
}

/**
 * Marketplace targeting point. Coordinates pinpoint the listing the way
 * Facebook Marketplace does when a location is dropped — the text
 * `location` stays the human label, this carries the machine target plus
 * the delivery radius in km (rendered as a Leaflet `Circle`, metres).
 */
export interface ListingLocation {
  lat: number
  lng: number
  radiusKm: number
}

/** Galway city centre — the mock geography every seed lives in. */
export const DEFAULT_LISTING_LOCATION: ListingLocation = { lat: 53.2707, lng: -9.0568, radiusKm: 10 }

/**
 * A Facebook Marketplace listing row. Mirrors the `MarketplaceCreateInput`
 * and `MarketplaceStatusOutput` pydantic schemas from
 * facebook-camofox-client (github.com/PRACE1/facebook-camofox-client):
 * create carries title/price/category/condition/location, status polling
 * classifies into `status` and resolves the `listingUrl`.
 * `accountId` is the foreign key into lib/connections (stable account id,
 * so multiple accounts per platform work) — `account` is the denormalized
 * display label resolved from that id, the same label space as
 * lib/connections, so the dashboard can match it against the user's
 * connected accounts without an extra lookup.
 * Unknown stays unknown — statuses are never fabricated.
 */
export interface ListingRecord {
  /** Opaque primary key (UUID) — the route + store key; rendered in the inspect form and deep-link URL. */
  id: string

  /** Marketplace-native id — display / open-link only, never the key. */
  listingId: string
  title: string
  price: string
  category: string
  condition: string | null
  location: string
  /** FK into lib/connections — the account that published the listing. */
  accountId: string
  /** Denormalized display label for `accountId` (resolved at write time). */
  account: string
  /** Pinpoint + delivery radius for marketplace targeting; older persisted rows may lack it. */
  locationPoint?: ListingLocation
  /** 1–4 marketplace photos, cycled in the row's 9:16 photo frame. */
  images: string[]
  status: ListingStatus
  /**
   * Who set `status` to `removed` — the seller's own delist (relistable via
   * the dashboard) or a platform takedown (violation / rejection / inactivity
   * expiry — only the request-review appeal brings it back). Only meaningful
   * while `status === 'removed'`; cleared on the move out.
   */
  removedBy?: RemovalProvenance
  listingUrl: string
  publishedAt: string
}

export interface ListingsResponse {
  listings: ListingRecord[]
}

/**
 * A new-listing draft submitted by the dashboard form. `accountId` is the
 * connected facebook account id that will publish it — the same id space as
 * lib/connections, so the form is shown only for connected facebook accounts.
 * `images` are data URLs from the form's file picker (up to four; the first
 * is the cover) — the mock store keeps them in memory, and the live client
 * will upload the same bytes to marketplace. No status or listingUrl on
 * drafts: the client assigns both on create.
 */
export interface ListingDraft {
  title: string
  price: string
  category: string
  condition: string | null
  location: string
  /** FK into lib/connections (legacy `account` labels still accepted by the route). */
  accountId: string
  /** Always sent by the form (defaults to Galway centre); the map picker adjusts it. */
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