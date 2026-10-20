import { countryOfLocation } from '../../../browser/proxy/index'
import { validateListing } from '../../publish/helpers/index'
import type { PublishListing } from '../../publish/types'
import type { AgencyListing } from '../types'

const CONDITION_LABEL: Record<NonNullable<AgencyListing['condition']>, string> = {
  new: 'new',
  usedLikeNew: 'likeNew',
  usedGood: 'good',
  usedFair: 'fair'
}

/** An agencyListing row → what the publish machine posts, or why it can't. Pure. */
export function toPublishListing(listing: AgencyListing): { ok: true; listing: PublishListing } | { ok: false; problems: string[] } {
  const publish: PublishListing = {
    title: listing.title,
    price: listing.price ?? Number.NaN,
    category: listing.category ?? '',
    condition: listing.condition ? CONDITION_LABEL[listing.condition] : undefined,
    description: listing.description ?? undefined,
    location: listing.locationQuery ?? undefined,
    postalCode: listing.locationPostalCode ?? undefined,
    photos: listing.photos
  }
  const problems = validateListing(publish)
  if (!listing.locationQuery) problems.push('locationQuery is empty (e.g. "Galway, Ireland")')
  if (!listing.locationCountry) problems.push('locationCountry is empty (ISO, e.g. IE)')
  return problems.length ? { ok: false, problems } : { ok: true, listing: publish }
}

/**
 * The listing is in the account's country: `locationCountry` and the country
 * at the end of `locationQuery` both equal `homeCountry` (AGENTS.md rule 12).
 * null = fine, otherwise why not. Pure.
 */
export function countryMismatch(listing: AgencyListing, homeCountry: string): string | null {
  const queryCountry = listing.locationQuery ? countryOfLocation(listing.locationQuery) : null
  if ((listing.locationCountry ?? '').toUpperCase() !== homeCountry) {
    return `listing locationCountry is ${listing.locationCountry ?? 'empty'}, the account is ${homeCountry}`
  }
  if (queryCountry !== homeCountry) {
    return queryCountry
      ? `"${listing.locationQuery}" is in ${queryCountry}, the account is ${homeCountry}`
      : `"${listing.locationQuery ?? ''}" has no country to check: write it as "City, Country"`
  }
  return null
}
