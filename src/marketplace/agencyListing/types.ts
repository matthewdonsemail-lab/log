import type { AgencyListing as AgencyListingRecord } from '../../twenty/graphql/generated/index'
import type { AGENCY_LISTING_FIELDS } from '../../twenty/graphql/client'

export const LISTING_STATUSES = [
  'draft',
  'ready',
  'publishing',
  'unconfirmed',
  'failed',
  'blocked',
  'removed',
  'accountLost',
  'replaced',
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

export const PUBLISHABLE_STATUSES: readonly AgencyListingStatus[] = ['draft', 'ready', 'failed', 'blocked']

export const LOSABLE_STATUSES: readonly AgencyListingStatus[] = ['draft', 'ready', 'active', 'underReview', 'blocked', 'failed']

export const SLOT_STATUSES: readonly AgencyListingStatus[] = ['draft', 'ready', 'publishing', 'active', 'underReview', 'unconfirmed', 'blocked', 'failed']

export type ListingCondition = 'new' | 'usedLikeNew' | 'usedGood' | 'usedFair'

export type RunResult = 'dryRun' | 'published' | 'unconfirmed' | 'blocked' | 'needsPerson' | 'failed'

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
  locationPostalCode: string | null
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
