import { SLOT_STATUSES } from '../../agencyListing/types'
import { homeOf, localClock } from '../../home/index'
import type { AgencyListing } from '../../agencyListing/types'
import { checkRunnable, toFacebookCookies } from '../../socialAccount/helpers/index'
import type { FacebookAccount } from '../../socialAccount/types'

export interface PickContext {
  accounts: FacebookAccount[]
  campaignListings: AgencyListing[]
  postedToday: Map<string, number>
  exclude: Set<string>
}

export function ineligibleReason(account: FacebookAccount, ad: AgencyListing, context: PickContext): string | null {
  if (context.exclude.has(account.id)) return 'excluded'
  const runnable = checkRunnable(account, 'run')
  if (!runnable.ok) return runnable.code
  if (toFacebookCookies(account.cookies).length === 0) return 'neverConnected'
  if (account.homeCountry !== ad.locationCountry) return `in ${account.homeCountry}, the listing is ${ad.locationCountry}`
  const inCampaign = context.campaignListings.some(
    (l) => l.socialAccountId === account.id && l.status !== null && SLOT_STATUSES.includes(l.status)
  )
  if (inCampaign) return 'already in this campaign'
  if ((context.postedToday.get(account.id) ?? 0) >= account.dailyListingCap) return 'dailyCapReached'
  return null
}

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

export function countPostedToday(listings: AgencyListing[], now: Date = new Date(), zones: ReadonlyMap<string, string> = new Map()): Map<string, number> {
  const counts = new Map<string, number>()
  for (const l of listings) {
    if (!l.socialAccountId || !l.publishedAt) continue
    const zone = zones.get(l.socialAccountId)
    const day = zone ? localClock(now, zone).date : now.toISOString().slice(0, 10)
    const posted = zone ? localClock(new Date(l.publishedAt), zone).date : l.publishedAt.slice(0, 10)
    if (posted === day) counts.set(l.socialAccountId, (counts.get(l.socialAccountId) ?? 0) + 1)
  }
  return counts
}

export function homeZones(accounts: FacebookAccount[]): Map<string, string> {
  const zones = new Map<string, string>()
  for (const account of accounts) {
    const home = homeOf(account)
    if (home.ok) zones.set(account.id, home.home.timezone)
  }
  return zones
}
