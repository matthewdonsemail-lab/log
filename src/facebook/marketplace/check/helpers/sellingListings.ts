import type { AgencyListingStatus } from '../../../../marketplace/agencyListing/index.ts'
import type { SellingListing } from '../types.ts'
import { responseTexts } from './graphqlResponses.ts'

/** A listing in the Selling data: its id, then its title (`"id":"…","marketplace_listing_title":"…"`). */
const LISTING = /"id":"(\d{10,})","marketplace_listing_title":"((?:[^"\\]|\\.)*)"/g

/** One field's raw JSON value in `window`: an object, a string, null or a boolean. Pure. */
function field(window: string, name: string): string | null {
  const match = new RegExp(`"${name}":((?:\\{[^{}]*\\})|"(?:[^"\\\\]|\\\\.)*"|null|true|false)`).exec(window)
  return match ? match[1] : null
}

/** The same field nearest the end of `window`: the one just before a listing's id, never an earlier listing's. Pure. */
function lastField(window: string, name: string): string | null {
  const at = window.lastIndexOf(`"${name}":`)
  return at < 0 ? null : field(window.slice(at), name)
}

/** The notice Selling shows on a listing ("This listing is being reviewed."), or null. Pure. */
function noticeOf(window: string): string | null {
  for (const name of ['integrity_status_indicator', 'listing_status_indicator']) {
    const content = /"content":"((?:[^"\\]|\\.)*)"/.exec(lastField(window, name) ?? '')?.[1]
    if (content) return JSON.parse(`"${content}"`) as string
  }
  return null
}

/** What Twenty keeps for a listing as Selling shows it. Pure. */
export function statusOfListing(l: Omit<SellingListing, 'status'>): AgencyListingStatus {
  if (l.sold) return 'sold'
  if (l.rejected) return 'policyViolation'
  if (l.duplicate) return 'duplicateTakedown'
  if (l.notice && /review/i.test(l.notice)) return 'underReview'
  if (l.onMarketplace && !l.draft && !l.pending) return 'active'
  return 'unknown'
}

/**
 * The account's listings from the Selling page's data, which arrives inside the page itself
 * (preloaded by the page, not a request of its own: `capture --docs` documents requests). Recorded on Bethlehem 2026-10-22: listing
 * 1425935622848350 carried `integrity_status_indicator` "This listing is being reviewed." at 11:19 (inspect
 * 20261022T110738 step 26), and null with `is_on_marketplace` true at 11:37 (20261022T113536 step 4). A
 * listing's fields sit just before its id (the review flags) and after its title (the rest). Each listing
 * once, by its id. Pure.
 */
export function sellingListingsOf(har: unknown): SellingListing[] {
  const found = new Map<string, SellingListing>()
  for (const text of responseTexts(har)) {
    if (!text.includes('marketplace_listing_title')) continue
    for (const match of text.matchAll(LISTING)) {
      const listingId = match[1]
      if (found.has(listingId)) continue
      const at = match.index ?? 0
      const before = text.slice(Math.max(0, at - 2000), at)
      const after = text.slice(at, at + 3000)
      const flag = (name: string) => field(after, name) === 'true'
      const base = {
        listingId,
        title: JSON.parse(`"${match[2]}"`) as string,
        price: /"formatted_price":\{"text":"((?:[^"\\]|\\.)*)"/.exec(after)?.[1] ?? null,
        onMarketplace: flag('is_on_marketplace'),
        sold: flag('is_sold'),
        pending: flag('is_pending'),
        draft: flag('is_draft'),
        rejected: lastField(before, 'listing_is_rejected') === 'true',
        duplicate: lastField(before, 'is_duplicate') === 'true',
        notice: noticeOf(before)
      }
      found.set(listingId, { ...base, status: statusOfListing(base) })
    }
  }
  return [...found.values()]
}
