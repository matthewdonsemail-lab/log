import * as Flags from 'country-flag-icons/react/3x2'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import type { BadgeColor } from '@listeningkit/ui'
import type { ListingStatus } from '../lib/listings'

export const STATUS_COLOR: Record<ListingStatus, BadgeColor> = {
  active: 'success',
  'under-review': 'warning',
  'under-review-duplicate': 'warning',
  sold: 'info',
  removed: 'danger',
  'login-wall': 'danger',
  unknown: 'muted'
}

export function formatPublished(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const COUNTRY_CODES: Record<string, string> = {
  ireland: 'IE',
  'united states': 'US',
  'united kingdom': 'GB',
  canada: 'CA',
  germany: 'DE',
  france: 'FR',
  italy: 'IT',
  spain: 'ES',
  portugal: 'PT',
  netherlands: 'NL',
  belgium: 'BE',
  austria: 'AT',
  switzerland: 'CH',
  denmark: 'DK',
  sweden: 'SE',
  norway: 'NO',
  finland: 'FI',
  poland: 'PL',
  japan: 'JP',
  australia: 'AU',
  'new zealand': 'NZ',
  mexico: 'MX',
  brazil: 'BR',
  india: 'IN',
  china: 'CN'
}

// The country sits after the last comma in a "City, Country" location string.
// Rendered as an inlined SVG from country-flag-icons so it looks identical
// on every OS (Unicode flag emoji don't render on Windows).
export function flagForLocation(location: string): ReactNode {
  const country = location.split(',').pop()?.trim().toLowerCase() ?? ''
  const code = COUNTRY_CODES[country]
  if (!code) return null
  const Flag = (Flags as Record<string, ComponentType<SVGProps<SVGSVGElement>>>)[code]
  if (!Flag) return null
  return <Flag className="h-3.5 w-auto rounded-[3px]" aria-hidden="true" />
}
