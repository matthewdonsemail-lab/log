import type { ClientDomain } from '../types'

export const DOMAIN_PATTERNS: [ClientDomain, RegExp][] = [
  ['checkpoint', /checkpoint|ufac|integrity|captcha|challenge|selfie|appeal|pseudoBlocked|scrapingWarning|aiSupport|IXTNext/i],
  ['groups', /^(CometGroup|GroupComet|GroupsComet|useGroup)|MembershipQuestion|MembershipAnswers|RequestToParticipate/],
  ['reels', /^FBUnifiedVideo|Reels?(Query|Mutation)$|SavedReels/],
  ['login', /^login|login$|logout|twoFactor|twoStep|^auth|deviceBased|loginDevice|recover|cookieConsent|webstorageProcessKeys|timezoneUpdate|WebLogin/i],
  ['profile', /^ProfileComet|ProfilePicture|CoverPhoto|^useFXIM|^FXIM|^FXAccountsCenter|ProfilePrompt|accountsCenter/i],
  ['location', /location|geo|sellLocation|cityTypeahead|marketplaceCity/i],
  ['photos', /photo|upload|attachment|mediaUpload/i],
  ['publishing', /publish|commerceListingCreate|marketplaceListingCreate|createListing|listingCreate/i],
  ['listingForm', /marketplaceComposer|marketplaceCreate|commerceComposer|listingShippable|pricePrediction|bisNumber|marketplaceAIListing|marketplaceSelling|marketplaceListing/i]
]

export function domainOf(name: string): ClientDomain {
  for (const [domain, pattern] of DOMAIN_PATTERNS) if (pattern.test(name)) return domain
  return 'background'
}
