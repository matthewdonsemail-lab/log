import type { AgencyListingStatus } from '../../../../marketplace/agencyListing/index.ts'
import type { SellingListing } from '../types.ts'
import { responseTexts } from './graphqlResponses.ts'

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

export function statusOfListing(l: Omit<SellingListing, 'status'>): AgencyListingStatus {
  if (l.sold) return 'sold'
  if (l.rejected) return 'policyViolation'
  if (l.duplicate) return 'duplicateTakedown'
  if (l.notice && /review/i.test(l.notice)) return 'underReview'
  if (l.onMarketplace && !l.draft && !l.pending) return 'active'
  return 'unknown'
}

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
