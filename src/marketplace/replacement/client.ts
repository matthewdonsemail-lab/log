import { AGENCY_LISTINGS, createSlot, listListingsWhere, setListingStatus } from '../agencyListing/client'
import { LOSABLE_STATUSES } from '../agencyListing/types'
import type { AgencyListing } from '../agencyListing/types'
import type { ErrorCode } from '../../errors/catalog/index'
import { listFacebookAccounts, setAccountStatus } from '../socialAccount/client'
import { statusForIssue } from '../socialAccount/helpers/index'
import { accountBlocked, TERMINAL_STATUSES } from '../socialAccount/types'
import type { AccountStatus, FacebookAccount } from '../socialAccount/types'
import type { TwentyClient } from '../../twenty/graphql/index'
import { countPostedToday, homeZones, pickAccount } from './helpers/index'
import type { PickContext } from './helpers/index'
import type { BlockedListing, FillReport, LossReport, Replacement, SweepReport } from './types'

async function pickContext(twenty: TwentyClient, campaignId: string | null, exclude: string[], now: Date): Promise<PickContext> {
  const [accounts, published, campaignListings] = await Promise.all([
    listFacebookAccounts(twenty),
    listListingsWhere(twenty, { publishedAt: { is: 'NOT_NULL' } }),
    campaignId ? listListingsWhere(twenty, { campaignId: { eq: campaignId } }) : Promise.resolve([] as AgencyListing[])
  ])
  return { accounts, campaignListings, postedToday: countPostedToday(published, now, homeZones(accounts)), exclude: new Set(exclude) }
}

async function replaceOne(twenty: TwentyClient, old: AgencyListing, context: PickContext, reason: string): Promise<Replacement> {
  const account = pickAccount(old, context)
  if (!account) {
    const detail = `no usable FACEBOOK account in ${old.locationCity ?? '?'}, ${old.locationCountry ?? '?'}`
    await twenty.update(AGENCY_LISTINGS, old.id, { lastErrorCode: 'noReplacementAccount', lastError: detail })
    return { old, next: null, account: null, detail }
  }
  const next = await createSlot(twenty, old, account.id, { campaignId: old.campaignId, replaces: old, reason })
  await setListingStatus(twenty, old.id, 'replaced', { lastErrorCode: null, lastError: null })
  context.exclude.add(account.id)
  context.campaignListings = [...context.campaignListings.filter((l) => l.id !== old.id), next]
  return { old, next, account }
}

export async function setStatusAndReplace(
  twenty: TwentyClient,
  account: FacebookAccount,
  status: AccountStatus,
  reason: string | null,
  detail: string | null = null,
  now: Date = new Date()
): Promise<LossReport> {
  await setAccountStatus(twenty, account.id, status, reason, detail, now)
  const report: LossReport = { account, status, lost: [], replacements: [] }
  if (!accountBlocked(status, reason)) return report

  const listings = await listListingsWhere(twenty, { socialAccountId: { eq: account.id } })
  report.lost = listings.filter((l) => l.status !== null && LOSABLE_STATUSES.includes(l.status))
  for (const listing of report.lost) {
    await setListingStatus(twenty, listing.id, 'accountLost', { lastErrorCode: reason, lastError: `account ${status}: ${account.accountName}` })
  }
  const byCampaign = new Map<string, AgencyListing[]>()
  for (const listing of report.lost) {
    if (listing.campaignId) byCampaign.set(listing.campaignId, [...(byCampaign.get(listing.campaignId) ?? []), listing])
  }
  for (const [campaignId, lost] of byCampaign) {
    const context = await pickContext(twenty, campaignId, [account.id], now)
    for (const old of lost) {
      report.replacements.push(await replaceOne(twenty, { ...old, status: 'accountLost' }, context, `account${status[0].toUpperCase()}${status.slice(1)}: ${account.accountName}`))
    }
  }
  return report
}

export async function blockedListings(twenty: TwentyClient): Promise<BlockedListing[]> {
  const [accounts, listings] = await Promise.all([listFacebookAccounts(twenty), listListingsWhere(twenty)])
  const byId = new Map(accounts.map((a) => [a.id, a]))
  return listings.flatMap((listing) => {
    const account = listing.socialAccountId ? byId.get(listing.socialAccountId) : undefined
    if (!account || listing.status === null || !LOSABLE_STATUSES.includes(listing.status)) return []
    return accountBlocked(account.status, account.statusReason) ? [{ listing, account }] : []
  })
}

export async function sweepBlockedListings(twenty: TwentyClient, now: Date = new Date()): Promise<SweepReport> {
  const blocked = await blockedListings(twenty)
  const report: SweepReport = { lost: blocked, replacements: [] }
  for (const { listing, account } of blocked) {
    await setListingStatus(twenty, listing.id, 'accountLost', { lastErrorCode: account.statusReason, lastError: `account ${account.status}${account.statusReason ? ` (${account.statusReason})` : ''}: ${account.accountName}` })
  }
  const byCampaign = new Map<string, BlockedListing[]>()
  for (const row of blocked) {
    if (row.listing.campaignId) byCampaign.set(row.listing.campaignId, [...(byCampaign.get(row.listing.campaignId) ?? []), row])
  }
  for (const [campaignId, rows] of byCampaign) {
    const context = await pickContext(twenty, campaignId, rows.map((r) => r.account.id), now)
    for (const { listing } of rows) report.replacements.push(await replaceOne(twenty, { ...listing, status: 'accountLost' }, context, 'accountBlocked'))
  }
  return report
}

export async function healCampaign(twenty: TwentyClient, campaignId: string, now: Date = new Date()): Promise<Replacement[]> {
  const context = await pickContext(twenty, campaignId, [], now)
  const lost = context.campaignListings.filter((l) => l.status === 'accountLost')
  const lostAccounts = new Set(lost.map((l) => l.socialAccountId).filter((id): id is string => !!id))
  for (const id of lostAccounts) context.exclude.add(id)
  const out: Replacement[] = []
  for (const old of lost) out.push(await replaceOne(twenty, old, context, 'campaignHeal'))
  return out
}

export async function fillCampaign(twenty: TwentyClient, campaignId: string, ad: AgencyListing, count: number, now: Date = new Date()): Promise<FillReport> {
  const context = await pickContext(twenty, campaignId, [], now)
  const report: FillReport = { created: [], short: 0 }
  for (let i = 0; i < count; i++) {
    const account = pickAccount(ad, context)
    if (!account) {
      report.short = count - i
      break
    }
    const listing = await createSlot(twenty, ad, account.id, { campaignId })
    report.created.push({ listing, account })
    context.exclude.add(account.id)
    context.campaignListings = [...context.campaignListings, listing]
  }
  return report
}

export async function recordAccountIssue(
  twenty: TwentyClient,
  account: FacebookAccount,
  code: ErrorCode,
  detail: string | null,
  now: Date = new Date()
): Promise<LossReport | null> {
  const status = statusForIssue(code)
  if (!status || (account.status && TERMINAL_STATUSES.includes(account.status))) return null
  if (account.status === status && account.statusReason === code) return null
  return setStatusAndReplace(twenty, account, status, code, detail, now)
}
