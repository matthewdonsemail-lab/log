import type { TwentyClient, TwentyObjects } from '../../twenty/graphql/index'
import type { PublishOutput } from '../publish/types'
import { fromTwentyEnum, toTwentyEnum } from '../socialAccount/helpers/index'
import { copyVersionsOf, LIVE_COPY_STATUSES, lintVersions, pickVersion, requiredVersions, skipWordsOf } from '../../facebook/marketplace/copy/index'
import type { CopyVersion, LiveCopy } from '../../facebook/marketplace/copy/index'
import type { AgencyListing, AgencyListingRow, AgencyListingStatus, ListingCondition, RunResult } from './types'
import { LISTING_STATUSES } from './types'

export const AGENCY_LISTINGS = 'agencyListings' as const

export type ListingFilter = TwentyObjects['agencyListings']['filter']
type ListingCreate = TwentyObjects['agencyListings']['create']
type ListingUpdate = TwentyObjects['agencyListings']['update']

function photosOf(raw: unknown): string[] {
  let value: unknown = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch {
      value = raw.split(/[\n,]/)
    }
  }
  return Array.isArray(value) ? value.map((p) => String(p).trim()).filter(Boolean) : []
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function toAgencyListing(row: AgencyListingRow): AgencyListing {
  const status = row.status ? fromTwentyEnum(row.status) : null
  const condition = row.condition ? (fromTwentyEnum(row.condition) as ListingCondition) : null
  return {
    id: row.id,
    title: (row.title ?? row.name ?? '').trim(),
    description: row.description ?? null,
    price: typeof row.price === 'number' ? row.price : null,
    priceCurrency: row.priceCurrency ?? null,
    category: row.category ?? null,
    condition,
    photos: photosOf(row.photos),
    locationQuery: row.locationQuery?.trim() || null,
    locationCity: row.locationCity?.trim() || null,
    locationCountry: row.locationCountry?.trim().toUpperCase() || null,
    locationPostalCode: row.locationPostalCode?.trim() || null,
    status: status && (LISTING_STATUSES as readonly string[]).includes(status) ? (status as AgencyListingStatus) : null,
    socialAccountId: row.socialAccountId ?? null,
    campaignId: row.campaignId ?? null,
    replacesId: row.replacesId ?? null,
    generation: typeof row.generation === 'number' ? row.generation : 0,
    listingId: row.listingId ?? null,
    listingUrl: row.listingUrl ?? null,
    publishedAt: row.publishedAt ?? null,
    lastRunAt: row.lastRunAt ?? null,
    lastRunResult: row.lastRunResult ? fromTwentyEnum(row.lastRunResult) : null,
    lastErrorCode: row.lastErrorCode ?? null,
    lastError: row.lastError ?? null,
    clicksCount: typeof row.clicksCount === 'number' ? row.clicksCount : null,
    lastCheckedAt: row.lastCheckedAt ?? null,
    copyVersions: copyVersionsOf(typeof row.copyVersions === 'string' ? safeJson(row.copyVersions) : row.copyVersions),
    copyVersionId: row.copyVersionId?.trim() || null
  }
}

export async function getListing(twenty: TwentyClient, id: string): Promise<AgencyListing | null> {
  const row = await twenty.get(AGENCY_LISTINGS, id)
  return row ? toAgencyListing(row) : null
}

export async function listListingsWhere(twenty: TwentyClient, filter?: ListingFilter): Promise<AgencyListing[]> {
  return (await twenty.list(AGENCY_LISTINGS, filter)).map(toAgencyListing)
}

export async function setListingStatus(
  twenty: TwentyClient,
  id: string,
  status: AgencyListingStatus,
  extra: ListingUpdate = {}
): Promise<void> {
  await twenty.update(AGENCY_LISTINGS, id, { status: toTwentyEnum(status) as ListingUpdate['status'], ...extra })
}

export function copySkipWords(ad: Pick<AgencyListing, 'locationCity' | 'locationQuery'>): Set<string> {
  return skipWordsOf(ad.locationCity, ad.locationQuery)
}

export async function liveCopiesIn(twenty: TwentyClient, ad: Pick<AgencyListing, 'locationCity' | 'locationCountry'>): Promise<LiveCopy[]> {
  if (!ad.locationCity || !ad.locationCountry) return []
  const rows = await listListingsWhere(twenty, { locationCity: { eq: ad.locationCity }, locationCountry: { eq: ad.locationCountry } })
  return rows
    .filter((l) => l.status && (LIVE_COPY_STATUSES as readonly string[]).includes(l.status))
    .map((l) => ({ title: l.title, description: l.description ?? '', copyVersionId: l.copyVersionId }))
}

export async function copyVersionsShortfall(twenty: TwentyClient, ad: AgencyListing, count: number): Promise<string | null> {
  const liveAfter = (await liveCopiesIn(twenty, ad)).length + count
  const problems = lintVersions(ad.copyVersions, ad.locationCity, copySkipWords(ad))
  if (problems.length) return problems.map((p) => `${p.versionId}: ${p.detail}`).join('; ')
  if (liveAfter < 2) return null
  const needed = requiredVersions(liveAfter)
  if (ad.copyVersions.length >= needed) return null
  return `${ad.copyVersions.length} copy version(s) for ${liveAfter} listing(s) live in ${ad.locationCity ?? '?'}: write at least ${needed} by skills/listingCopy (copyVersions in listing.json)`
}

export type { CopyVersion }

export async function createSlot(
  twenty: TwentyClient,
  ad: AgencyListing,
  accountId: string,
  options: { campaignId: string | null; replaces?: AgencyListing; reason?: string }
): Promise<AgencyListing> {
  const chosen = ad.copyVersions.length ? pickVersion(ad.copyVersions, await liveCopiesIn(twenty, ad), { skip: copySkipWords(ad), avoidId: options.replaces?.copyVersionId ?? null }) : null
  const row = await twenty.create(AGENCY_LISTINGS, {
    name: chosen?.title ?? ad.title,
    title: chosen?.title ?? ad.title,
    description: chosen?.description ?? ad.description,
    copyVersions: (ad.copyVersions.length ? ad.copyVersions : null) as unknown as ListingCreate['copyVersions'],
    copyVersionId: chosen?.id ?? null,
    price: ad.price,
    priceCurrency: ad.priceCurrency,
    category: ad.category,
    condition: (ad.condition ? toTwentyEnum(ad.condition) : null) as ListingCreate['condition'],
    photos: ad.photos as unknown as ListingCreate['photos'],
    locationQuery: ad.locationQuery,
    locationCity: ad.locationCity,
    locationCountry: ad.locationCountry,
    locationPostalCode: ad.locationPostalCode,
    status: toTwentyEnum('ready') as ListingCreate['status'],
    socialAccountId: accountId,
    campaignId: options.campaignId,
    replacesId: options.replaces?.id ?? null,
    generation: options.replaces ? options.replaces.generation + 1 : 0,
    replacementReason: options.reason ?? null
  })
  return toAgencyListing(row)
}

const RESULT_STATUS: Record<RunResult, AgencyListingStatus | null> = {
  dryRun: null,
  published: 'active',
  unconfirmed: 'unconfirmed',
  blocked: 'blocked',
  needsPerson: 'blocked',
  failed: 'failed'
}

export async function recordRun(
  twenty: TwentyClient,
  listing: AgencyListing,
  output: PublishOutput,
  dryRun: boolean,
  receipt: string | null,
  now: Date = new Date()
): Promise<RunResult> {
  const result: RunResult = output.result === 'unconfirmedId' ? 'unconfirmed' : output.result
  const update: ListingUpdate = {
    lastRunAt: now.toISOString(),
    lastRunResult: toTwentyEnum(result) as ListingUpdate['lastRunResult'],
    lastErrorCode: output.failure?.code ?? null,
    lastError: output.failure ? `${output.failure.state}: ${output.failure.detail ?? output.failure.code}`.slice(0, 500) : null
  }
  if (output.photoHashes.length) update.photoHashes = output.photoHashes as unknown as ListingUpdate['photoHashes']
  if (receipt) update.screenshotUrl = receipt
  const status = dryRun
    ? result === 'blocked' || result === 'needsPerson' ? 'blocked' : null
    : result === 'published' && output.review ? 'underReview' : RESULT_STATUS[result]
  if (status) update.status = toTwentyEnum(status) as ListingUpdate['status']
  if (!dryRun && result === 'published') {
    update.listingId = output.listingId
    update.listingUrl = output.listingUrl
    update.publishedAt = now.toISOString()
    update.lastCheckedAt = now.toISOString()
  }
  await twenty.update(AGENCY_LISTINGS, listing.id, update)
  return result
}

export const SYNCABLE: readonly AgencyListingStatus[] = ['publishing', 'unconfirmed', 'active', 'underReview', 'duplicateTakedown', 'unknown']

export async function syncDashboard(
  twenty: TwentyClient,
  accountId: string,
  scanned: { listingId: string; title: string | null; health: string; clicks: number; href: string }[],
  now: Date = new Date()
): Promise<number> {
  const rows = await listListingsWhere(twenty, { socialAccountId: { eq: accountId } })
  let changed = 0
  for (const card of scanned) {
    const row =
      rows.find((r) => r.listingId === card.listingId) ??
      rows.find((r) => r.status === 'unconfirmed' && !r.listingId && card.title && r.title.trim() === card.title.trim())
    if (!row || (row.status && !SYNCABLE.includes(row.status))) continue
    const update: ListingUpdate = { clicksCount: card.clicks, lastCheckedAt: now.toISOString() }
    if (card.health !== 'UNKNOWN') update.status = card.health as ListingUpdate['status']
    if (!row.listingId) {
      update.listingId = card.listingId
      update.listingUrl = `https://www.facebook.com/marketplace/item/${card.listingId}/`
    }
    await twenty.update(AGENCY_LISTINGS, row.id, update)
    changed++
  }
  return changed
}
