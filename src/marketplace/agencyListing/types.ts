/**
 * A Marketplace listing, as Twenty's `agencyListings` object holds it: one row
 * is one listing on one account. facebook-camofox-client syncs the health
 * fields; log-cli adds the ad, the location, the run results and the
 * relations (`scripts/twentySetup.mjs`). SELECT values are UPPER_SNAKE in
 * Twenty and camelCase here (rule 1).
 */
import type { AgencyListing as AgencyListingRecord } from '../../twenty/graphql/generated/index'
import type { AGENCY_LISTING_FIELDS } from '../../twenty/graphql/client'

export const LISTING_STATUSES = [
  // lifecycle (log-cli)
  'draft',
  'ready',
  'publishing',
  'unconfirmed',
  'failed',
  'blocked',
  'removed',
  'accountLost',
  'replaced',
  // dashboard health (facebook-camofox-client sync and log scan)
  'active',
  'underReview',
  'duplicateTakedown',
  'deletedByFb',
  'policyViolation',
  'commerceBan',
  'checkpointRequired',
  'sold',
  'retryExhausted',
  'unknown'
] as const

export type AgencyListingStatus = (typeof LISTING_STATUSES)[number]

/** May be published. Anything live, in flight or unconfirmed would make a duplicate. */
export const PUBLISHABLE_STATUSES: readonly AgencyListingStatus[] = ['draft', 'ready', 'failed', 'blocked']

/** Become `accountLost` when their account is lost. Sold, removed and taken-down rows keep their status. */
export const LOSABLE_STATUSES: readonly AgencyListingStatus[] = ['draft', 'ready', 'active', 'underReview', 'blocked', 'failed']

/** Hold an account's place in a campaign (one account, one slot). */
export const SLOT_STATUSES: readonly AgencyListingStatus[] = ['draft', 'ready', 'publishing', 'active', 'underReview', 'unconfirmed', 'blocked', 'failed']

export type ListingCondition = 'new' | 'usedLikeNew' | 'usedGood' | 'usedFair'

export type RunResult = 'dryRun' | 'published' | 'unconfirmed' | 'blocked' | 'needsPerson' | 'failed'

/** The row as the generated Twenty client returns it (only the fields log-cli selects). */
export type AgencyListingRow = Pick<AgencyListingRecord, keyof typeof AGENCY_LISTING_FIELDS>

export interface AgencyListing {
  id: string
  title: string
  description: string | null
  price: number | null
  priceCurrency: string | null
  category: string | null
  condition: ListingCondition | null
  photos: string[]
  locationQuery: string | null
  locationCity: string | null
  locationCountry: string | null
  status: AgencyListingStatus | null
  socialAccountId: string | null
  campaignId: string | null
  replacesId: string | null
  generation: number
  listingId: string | null
  listingUrl: string | null
  publishedAt: string | null
  lastRunAt: string | null
  lastRunResult: string | null
  lastErrorCode: string | null
  lastError: string | null
  clicksCount: number | null
  lastCheckedAt: string | null
}
