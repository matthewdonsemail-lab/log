import { SLOT_STATUSES } from '../../agencyListing/types'
import type { AgencyListing } from '../../agencyListing/types'
import { checkRunnable, toFacebookCookies } from '../../socialAccount/helpers/index'
import type { FacebookAccount } from '../../socialAccount/types'

export interface PickContext {
  /** Every FACEBOOK account. */
  accounts: FacebookAccount[]
  /** The campaign's listings (to keep one account per slot). Empty without a campaign. */
  campaignListings: AgencyListing[]
  /** Listings each account published today, by account id. */
  postedToday: Map<string, number>
  /** Accounts never to pick (the lost one, ones already picked this run). */
  exclude: Set<string>
}

/** Why one account can't take the listing, or null when it can. Pure. */
export function ineligibleReason(account: FacebookAccount, ad: AgencyListing, context: PickContext): string | null {
  if (context.exclude.has(account.id)) return 'excluded'
  const runnable = checkRunnable(account, 'run')
  if (!runnable.ok) return runnable.code
  // No saved session: it couldn't open the form without a person signing it in first.
  if (toFacebookCookies(account.cookies).length === 0) return 'neverConnected'
  if (account.homeCountry !== ad.locationCountry) return `in ${account.homeCountry}, the listing is ${ad.locationCountry}`
  const inCampaign = context.campaignListings.some(
    (l) => l.socialAccountId === account.id && l.status !== null && SLOT_STATUSES.includes(l.status)
  )
  if (inCampaign) return 'already in this campaign'
  if ((context.postedToday.get(account.id) ?? 0) >= account.dailyListingCap) return 'dailyCapReached'
  return null
}

/**
 * The account that takes a listing (a new campaign slot or a replacement), or
 * null. It must be FACEBOOK, ACTIVE or WARMING, proxied, signed in (cookies),
 * in the listing's country, not already in the campaign and under its daily cap. Order: same
 * city first, then the least recently posted (never posted first), then name.
 * Pure.
 */
export function pickAccount(ad: AgencyListing, context: PickContext): FacebookAccount | null {
  const city = (ad.locationCity ?? '').toLowerCase()
  const eligible = context.accounts.filter((account) => ineligibleReason(account, ad, context) === null)
  eligible.sort((a, b) => {
    const cityA = (a.homeCity ?? '').toLowerCase() === city ? 0 : 1
    const cityB = (b.homeCity ?? '').toLowerCase() === city ? 0 : 1
    if (cityA !== cityB) return cityA - cityB
    const postedA = a.lastPostedAt ? Date.parse(a.lastPostedAt) : 0
    const postedB = b.lastPostedAt ? Date.parse(b.lastPostedAt) : 0
    if (postedA !== postedB) return postedA - postedB
    return a.accountName.localeCompare(b.accountName)
  })
  return eligible[0] ?? null
}

/** Listings published today (UTC) per account. Pure. */
export function countPostedToday(listings: AgencyListing[], now: Date = new Date()): Map<string, number> {
  const day = now.toISOString().slice(0, 10)
  const counts = new Map<string, number>()
  for (const l of listings) {
    if (l.socialAccountId && l.publishedAt?.slice(0, 10) === day) counts.set(l.socialAccountId, (counts.get(l.socialAccountId) ?? 0) + 1)
  }
  return counts
}
