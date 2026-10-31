import { createMemoryTwenty } from './memoryTwenty'

export const FIXTURE_COOKIES = [
  { name: 'c_user', value: '1000', domain: '.facebook.com', path: '/' },
  { name: 'xs', value: 'fixture', domain: '.facebook.com', path: '/' }
]

export const FIXTURE_CAMPAIGN = 'campaignGalway'

export function marketplaceFixture(photo = '/photos/van.png') {
  const ad = {
    title: 'Rubbish Removal Galway',
    description: 'Same-day collection.',
    price: 50,
    priceCurrency: 'EUR',
    category: 'Miscellaneous',
    condition: 'USED_GOOD',
    photos: [photo],
    locationQuery: 'Galway, Ireland',
    locationCity: 'Galway',
    locationCountry: 'IE'
  }
  const facebook = (id: string, extra: Record<string, unknown>) => ({
    id,
    accountName: id,
    name: id,
    platform: 'FACEBOOK',
    accountStatus: 'ACTIVE',
    proxy: 'http://user:secretPass@203.0.113.7:8080',
    homeCity: 'Galway',
    homeCountry: 'IE',
    cookies: FIXTURE_COOKIES,
    activeHoursStart: 0,
    activeHoursEnd: 24,
    ...extra
  })
  return createMemoryTwenty({
    socialAccounts: [
      facebook('galwayOne', { lastPostedAt: '2026-10-01T10:00:00.000Z' }),
      facebook('galwayTwo', { lastPostedAt: '2026-09-01T10:00:00.000Z' }),
      facebook('galwayThree', { lastPostedAt: null }),
      facebook('dublinOne', { homeCity: 'Dublin', lastPostedAt: null }),
      facebook('noProxy', { proxy: null }),
      facebook('noCountry', { homeCountry: null }),
      facebook('noCookies', { cookies: null }),
      facebook('vietnam', { homeCity: 'Hanoi', homeCountry: 'VN' }),
      facebook('needsLogin', { accountStatus: 'NEEDS_LOGIN', cookies: null }),
      facebook('banned', { accountStatus: 'BANNED' }),
      facebook('unset', { accountStatus: null }),
      { id: 'twitterOne', accountName: 'twitterOne', platform: 'TWITTER', cookies: { auth_token: 'x' }, proxy: null }
    ],
    agencyListings: [
      { id: 'adTemplate', ...ad, name: ad.title, status: 'DRAFT', socialAccountId: null, campaignId: null, generation: 0 },
      { id: 'readyOne', ...ad, name: ad.title, status: 'READY', socialAccountId: 'galwayOne', campaignId: FIXTURE_CAMPAIGN, generation: 0 },
      { id: 'liveOne', ...ad, name: ad.title, status: 'ACTIVE', socialAccountId: 'galwayOne', campaignId: FIXTURE_CAMPAIGN, listingId: '111', generation: 0 },
      { id: 'liveTwo', ...ad, name: ad.title, status: 'ACTIVE', socialAccountId: 'galwayTwo', campaignId: FIXTURE_CAMPAIGN, listingId: '222', generation: 0 },
      { id: 'abroad', ...ad, name: 'Abroad', locationQuery: 'Manchester, United Kingdom', locationCity: 'Manchester', locationCountry: 'GB', status: 'READY', socialAccountId: 'galwayOne', generation: 0 },
      { id: 'onNoProxy', ...ad, name: ad.title, status: 'READY', socialAccountId: 'noProxy', generation: 0 },
      { id: 'onVietnam', ...ad, name: ad.title, status: 'READY', socialAccountId: 'vietnam', generation: 0 },
      { id: 'soldOne', ...ad, name: ad.title, status: 'SOLD', socialAccountId: 'galwayOne', campaignId: FIXTURE_CAMPAIGN, generation: 0 }
    ]
  })
}
