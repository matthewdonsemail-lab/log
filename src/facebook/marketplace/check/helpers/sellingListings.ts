import type { AgencyListingStatus } from '../../../../marketplace/agencyListing/index.ts'
import type { SellingListing } from '../types.ts'
import { responseTexts } from './graphqlResponses.ts'

export const IDENTITY_HOLD = /confirm your identity|verify your identity|confirm it.?s you/i

const CLICKS = /"listing_insights":\{"insights":\[\{"count":(\d+)\}/

const LISTING = /"id":"(\d{10,})","marketplace_listing_title":"((?:[^"\\]|\\.)*)"/g

function field(window: string, name: string): string | null {
  const match = new RegExp(`"${name}":((?:\\{[^{}]*\\})|"(?:[^"\\\\]|\\\\.)*"|null|true|false)`).exec(window)
  return match ? match[1] : null
}

function lastField(window: string, name: string): string | null {
  const at = window.lastIndexOf(`"${name}":`)
  return at < 0 ? null : field(window.slice(at), name)
}

function noticeOf(window: string): string | null {
  for (const name of ['integrity_status_indicator', 'listing_status_indicator']) {
    const content = /"content":"((?:[^"\\]|\\.)*)"/.exec(lastField(window, name) ?? '')?.[1]
    if (content) return JSON.parse(`"${content}"`) as string
  }
  return null
}

export function clicksOf(window: string): number | null {
  const count = CLICKS.exec(window)?.[1]
  return count === undefined ? null : Number(count)
}

export function statusOfListing(l: Omit<SellingListing, 'status'>): AgencyListingStatus {
  if (l.sold) return 'sold'
  if (l.rejected) return 'policyViolation'
  if (l.duplicate) return 'duplicateTakedown'
  if (l.notice && /review/i.test(l.notice)) return 'underReview'
  if (l.notice && IDENTITY_HOLD.test(l.notice)) return 'blocked'
  if (l.onMarketplace && !l.draft && !l.pending) return 'active'
  return 'unknown'
}

export function sellingListingsOf(har: unknown): SellingListing[] {
  const found = new Map<string, SellingListing>()
  for (const text of responseTexts(har)) {
    if (!text.includes('marketplace_listing_title')) continue
    const matches = [...text.matchAll(LISTING)]
    for (const [n, match] of matches.entries()) {
      const listingId = match[1]
      if (found.has(listingId)) continue
      const at = match.index ?? 0
      const next = matches.slice(n + 1).find((m) => m[1] !== listingId)?.index ?? text.length
      const before = text.slice(Math.max(0, at - 2000), at)
      const after = text.slice(at, at + 3000)
      const own = text.slice(at, Math.min(next, at + 12000))
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
        notice: noticeOf(before),
        clicks: clicksOf(own)
      }
      found.set(listingId, { ...base, status: statusOfListing(base) })
    }
  }
  return [...found.values()]
}
