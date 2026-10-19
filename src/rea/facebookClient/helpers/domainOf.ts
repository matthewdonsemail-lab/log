import type { ClientDomain } from '../types'

/**
 * Which part of Facebook's client a request belongs to, by its name. The
 * first match wins, so the narrow domains come first: a checkpoint request
 * also mentions login, a location request also mentions the composer.
 * Anything unmatched is `background`: chat, notifications, search and
 * telemetry the page loads around the flow, which our machines ignore. A
 * request that matters but lands there is a gap in this table: move it.
 */
export const DOMAIN_PATTERNS: [ClientDomain, RegExp][] = [
  // FBScrapingWarningMutation clears the "We suspect automated behaviour" flag when it is dismissed (rule 23).
  ['checkpoint', /checkpoint|ufac|integrity|captcha|challenge|selfie|appeal|pseudoBlocked|scrapingWarning|aiSupport|IXTNext/i],
  ['login', /^login|login$|logout|twoFactor|twoStep|^auth|deviceBased|loginDevice|recover|cookieConsent|webstorageProcessKeys|timezoneUpdate|WebLogin/i],
  // The account's own profile and Accounts Center (`log flow run profileSetup`, rule 28): picture, cover, name.
  ['profile', /^ProfileComet|ProfilePicture|CoverPhoto|^useFXIM|^FXIM|^FXAccountsCenter|ProfilePrompt|accountsCenter/i],
  ['location', /location|geo|sellLocation|cityTypeahead|marketplaceCity/i],
  ['photos', /photo|upload|attachment|mediaUpload/i],
  ['publishing', /publish|commerceListingCreate|marketplaceListingCreate|createListing|listingCreate/i],
  ['listingForm', /marketplaceComposer|marketplaceCreate|commerceComposer|listingShippable|pricePrediction|bisNumber|marketplaceAIListing|marketplaceSelling|marketplaceListing/i]
]

/** Pure. */
export function domainOf(name: string): ClientDomain {
  for (const [domain, pattern] of DOMAIN_PATTERNS) if (pattern.test(name)) return domain
  return 'background'
}
