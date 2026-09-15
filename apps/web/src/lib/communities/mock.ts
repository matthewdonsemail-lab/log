import { uuid } from '../ids'
import type { ConnectionPlatform } from '../connections'
import { MOCK_CONNECTIONS } from '../connections/mock'
import type { Community, CommunityJoinState } from './types'

/**
 * Base community catalog — the same roster the old flat lib/communities.ts
 * exposed. Membership state (joinState / accountId) lives in the server, not
 * here, so the catalog stays pure and the API owns the relation.
 */
export const COMMUNITIES_BASE: Array<Omit<Community, 'joinState' | 'accountId' | 'accountLabel' | 'answers'>> = [
  {
    id: 'facebook-dallas-homeowners',
    platform: 'facebook' satisfies ConnectionPlatform,
    name: 'Dallas Homeowners',
    handle: '@dallas-homeowners',
    members: '48k members',
    description: 'Leaks, repairs and contractor referrals across Dallas–Fort Worth.',
    url: 'https://facebook.com/groups/dallas-homeowners',
    entryQuestions: [
      'What Dallas–Fort Worth street do you live on?',
      'Are you a homeowner or a contractor?',
      'Will you post photos when asking for repair help?',
    ],
  },
  {
    id: 'facebook-texas-trades',
    platform: 'facebook' satisfies ConnectionPlatform,
    name: 'Texas Trades Network',
    handle: '@texastrades',
    members: '12k members',
    description: 'Licensed tradespeople swapping jobs and advice across Texas.',
    url: 'https://facebook.com/groups/texastrades',
    entryQuestions: [
      'What trade are you licensed in?',
      'How many years have you been working in Texas?',
      'Do you agree to no self-promotion outside the weekly thread?',
    ],
  },
  {
    id: 'facebook-diy-plumbing',
    platform: 'facebook' satisfies ConnectionPlatform,
    name: 'DIY Plumbing Help',
    handle: '@diyplumbing',
    members: '89k members',
    description: 'Homeowners posting photos of whatever just started leaking.',
    url: 'https://facebook.com/groups/diyplumbing',
    entryQuestions: [
      'What are you trying to fix right now?',
      'Have you turned off the water supply before starting work?',
      'Do you agree to post a photo with every help request?',
    ],
  },
  {
    id: 'x-dallas-tx',
    platform: 'x' satisfies ConnectionPlatform,
    name: 'Dallas, TX',
    handle: '@dallas-tx',
    members: '210k members',
    description: 'Real-time local chatter — outages, storms and service calls.',
    url: 'https://x.com/search?q=dallas%20tx&f=live',
    entryQuestions: [],
  },
  {
    id: 'x-home-improvement',
    platform: 'x' satisfies ConnectionPlatform,
    name: 'Home Improvement',
    handle: '@home-improvement',
    members: '1.2m members',
    description: 'Renovations, repairs and before-and-after threads.',
    url: 'https://x.com/search?q=home%20improvement&f=live',
    entryQuestions: [],
  },
  {
    id: 'x-plumbing-talk',
    platform: 'x' satisfies ConnectionPlatform,
    name: 'Plumbing Talk',
    handle: '@plumbing-talk',
    members: '8k members',
    description: 'Plumbers talking shop and homeowners asking for rescue.',
    url: 'https://x.com/search?q=plumbing&f=live',
    entryQuestions: [],
  },
  {
    id: 'reddit-plumbing',
    platform: 'reddit' satisfies ConnectionPlatform,
    name: 'r/Plumbing',
    handle: 'r/Plumbing',
    members: '890k members',
    description: '“Is this supposed to drip?” — asked daily, answered hourly.',
    url: 'https://reddit.com/r/Plumbing',
    entryQuestions: [],
  },
  {
    id: 'reddit-homeimprovement',
    platform: 'reddit' satisfies ConnectionPlatform,
    name: 'r/HomeImprovement',
    handle: 'r/HomeImprovement',
    members: '4.1m members',
    description: 'The biggest room-by-room repair crowd on the internet.',
    url: 'https://reddit.com/r/HomeImprovement',
    entryQuestions: [],
  },
  {
    id: 'reddit-dallas',
    platform: 'reddit' satisfies ConnectionPlatform,
    name: 'r/Dallas',
    handle: 'r/Dallas',
    members: '620k members',
    description: 'City-wide asks, including the weekly plumber thread.',
    url: 'https://reddit.com/r/Dallas',
    entryQuestions: [],
  },
  {
    id: 'facebook-dfw-repairs',
    platform: 'facebook' satisfies ConnectionPlatform,
    name: 'DFW Home Repairs',
    handle: '@dfw-home-repairs',
    members: '31k members',
    description: 'DFW homeowners trading repair wins and contractor warnings.',
    url: 'https://facebook.com/groups/dfw-home-repairs',
    entryQuestions: [
      'Where in DFW are you based?',
      'Are you asking for help or offering a trade?',
      'Will you share photos of the job?',
    ],
  },
  {
    id: 'facebook-texas-plumbing-pros',
    platform: 'facebook' satisfies ConnectionPlatform,
    name: 'Texas Plumbing Pros',
    handle: '@texasplumbingpros',
    members: '18k members',
    description: 'Plumbers across Texas on call-outs, pricing and nightmare jobs.',
    url: 'https://facebook.com/groups/texas-plumbing-pros',
    entryQuestions: [
      'Are you a licensed plumber or shopping for one?',
      'What part of Texas do you cover?',
      'Do you agree to no price-shaming?',
    ],
  },
  {
    id: 'facebook-dallas-renovations',
    platform: 'facebook' satisfies ConnectionPlatform,
    name: 'Dallas Renovations',
    handle: '@dallas-renovations',
    members: '26k members',
    description: 'Room-by-room renovations across Dallas, budgets included.',
    url: 'https://facebook.com/groups/dallas-renovations',
    entryQuestions: [
      'What room are you renovating?',
      'What is your rough budget?',
      'Are you DIY or hiring out?',
    ],
  },
  {
    id: 'facebook-emergency-plumbers-tx',
    platform: 'facebook' satisfies ConnectionPlatform,
    name: 'Emergency Plumbers Texas',
    handle: '@emergency-plumbers-tx',
    members: '9k members',
    description: 'Burst pipes and midnight floods — who to call right now.',
    url: 'https://facebook.com/groups/emergency-plumbers-tx',
    entryQuestions: [
      'Is this an active emergency?',
      'Where in Texas is the property?',
      'Have you shut the water off?',
    ],
  },
  {
    id: 'reddit-homerepair',
    platform: 'reddit' satisfies ConnectionPlatform,
    name: 'r/HomeRepair',
    handle: 'r/HomeRepair',
    members: '2.3m members',
    description: 'Small fixes, big wins — ask before you call someone out.',
    url: 'https://reddit.com/r/HomeRepair',
    entryQuestions: [],
  },
  {
    id: 'reddit-askaplumber',
    platform: 'reddit' satisfies ConnectionPlatform,
    name: 'r/askaplumber',
    handle: 'r/askaplumber',
    members: '410k members',
    description: 'Licensed eyes on your leak — photos help.',
    url: 'https://reddit.com/r/askaplumber',
    entryQuestions: [],
  },
  {
    id: 'reddit-diy',
    platform: 'reddit' satisfies ConnectionPlatform,
    name: 'r/DIY',
    handle: 'r/DIY',
    members: '24m members',
    description: 'Do it yourself, then show it off.',
    url: 'https://reddit.com/r/DIY',
    entryQuestions: [],
  },
  {
    id: 'reddit-fixit',
    platform: 'reddit' satisfies ConnectionPlatform,
    name: 'r/fixit',
    handle: 'r/fixit',
    members: '1.1m members',
    description: 'Broken? Post it here first.',
    url: 'https://reddit.com/r/fixit',
    entryQuestions: [],
  },
  {
    id: 'x-plumbing-tips',
    platform: 'x' satisfies ConnectionPlatform,
    name: 'Plumbing Tips',
    handle: '@plumbing-tips',
    members: '45k members',
    description: 'Quick plumbing saves and product shout-outs.',
    url: 'https://x.com/search?q=plumbing%20tips&f=live',
    entryQuestions: [],
  },
  {
    id: 'x-diy-network',
    platform: 'x' satisfies ConnectionPlatform,
    name: 'DIY Network',
    handle: '@diy-network',
    members: '890k members',
    description: 'Weekend projects and before-and-afters.',
    url: 'https://x.com/search?q=diy%20network&f=live',
    entryQuestions: [],
  },
  {
    id: 'x-texas-homeowners',
    platform: 'x' satisfies ConnectionPlatform,
    name: 'Texas Homeowners',
    handle: '@texas-homeowners',
    members: '120k members',
    description: 'Texas home talk — storms, slabs and service calls.',
    url: 'https://x.com/search?q=texas%20homeowners&f=live',
    entryQuestions: [],
  },
]

/**
 * Seed for the join relation. `accepted` rows are current members; the one
 * `pending` row demonstrates the "waiting on the group to accept you" path
 * out of the box. The facebook joins are attributed to a connected mock
 * account so the community ↔ account relation has a value to show; reddit
 * joins carry no account.
 */
export const SEED_JOINED: Array<{ id: string; state: CommunityJoinState; accountId: string | null }> = [
  { id: 'facebook-dallas-homeowners', state: 'accepted', accountId: 'fb-galway-rubbish' },
  { id: 'facebook-texas-trades', state: 'pending', accountId: 'fb-galway-rubbish' },
  { id: 'reddit-plumbing', state: 'accepted', accountId: null },
]

export function resolveAccountLabel(accountId: string | null): string | null {
  if (!accountId) return null
  return MOCK_CONNECTIONS.find((account) => account.id === accountId)?.label ?? null
}

const FACEBOOK_HOSTS = new Set([
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'web.facebook.com',
  'fb.com',
  'www.fb.com',
  'm.fb.com',
])

export interface ParsedGroupUrl {
  /** Group slug or numeric id from the `/groups/<slug>` path segment. */
  slug: string
  /** Canonical `https://facebook.com/groups/<slug>` form for matching. */
  url: string
}

/**
 * Parse a pasted Facebook group link into its slug. Accepts scheme-less
 * input, mobile/web subdomains, fb.com short hosts, and trailing
 * path/query — anything that isn't `/groups/<slug>` on a facebook host
 * returns null so the form can flag it.
 */
export function parseFacebookGroupUrl(input: string): ParsedGroupUrl | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let parsed: URL
  try {
    parsed = new URL(withScheme)
  } catch {
    return null
  }
  if (!FACEBOOK_HOSTS.has(parsed.hostname.toLowerCase())) return null
  const segments = parsed.pathname.split('/').filter((part) => part.length > 0)
  if (segments[0]?.toLowerCase() !== 'groups' || !segments[1]) return null
  const slug = segments[1]
  if (!/^[A-Za-z0-9._-]+$/.test(slug)) return null
  return { slug, url: `https://facebook.com/groups/${slug}` }
}

function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_.]+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export interface ParsedSubreddit {  /** Canonical `r/Name` handle (original casing kept for display). */
  name: string
  /** Lowercase key for catalog matching. */
  key: string
  /** Canonical `https://reddit.com/r/Name` link. */
  url: string
}

/**
 * Parse a typed subreddit into its canonical form. Accepts `r/Name`,
 * bare `Name`, and full `reddit.com/r/Name` links — anything else returns
 * null so the form can flag it.
 */
export function parseSubredditName(input: string): ParsedSubreddit | null {
  let trimmed = input.trim()
  if (!trimmed) return null
  const link = trimmed.match(/^(?:https?:\/\/)?(?:www\.|m\.|old\.)?reddit\.com\/r\/([A-Za-z0-9_]+)\/?(?:[?#].*)?$/)
  if (link?.[1]) trimmed = link[1]
  const bare = trimmed.match(/^(?:r\/)?([A-Za-z0-9_]+)$/)
  if (!bare?.[1]) return null
  const name = bare[1]
  return { name, key: name.toLowerCase(), url: `https://reddit.com/r/${name}` }
}

/**
 * Build a catalog row for a subreddit the mock hasn't seen before — the
 * stand-in for the client resolving an unknown community. Subreddits don't
 * gate entry, so resolved rows join immediately (accepted).
 */
export function communityFromSubreddit(parsed: ParsedSubreddit): {
  id: string
  platform: ConnectionPlatform
  name: string
  handle: string
  members: string
  description: string
  url: string
  entryQuestions: string[]
} {
  return {
    id: uuid(),
    platform: 'reddit',
    name: `r/${parsed.name}`,
    handle: `r/${parsed.name}`,
    members: '—',
    description: 'Shared via subreddit name — resolved by the client.',
    url: parsed.url,
    entryQuestions: [],
  }
}

/**
 * Build a catalog row for a group link the mock hasn't seen before — the
 * stand-in for the facebook client resolving an unknown group URL. Details
 * stay sparse until the group accepts the request; entry questions fall
 * back to the generic gate every group asks.
 */
export function communityFromGroupUrl(parsed: ParsedGroupUrl): {
  id: string
  platform: ConnectionPlatform
  name: string
  handle: string
  members: string
  description: string
  url: string
  entryQuestions: string[]
} {
  const name = titleFromSlug(parsed.slug)
  return {
    id: uuid(),
    platform: 'facebook',
    name,
    handle: `@${parsed.slug.toLowerCase()}`,
    members: '—',
    description: 'Shared via group link — details load after the group accepts.',
    url: parsed.url,
    entryQuestions: [
      `Why do you want to join ${name}?`,
      'Do you agree to follow the group rules?',
    ],
  }
}

/**
 * Keyword affinity per community — what each place actually talks about.
 * The related-communities chain matches the picked keyword phrases against
 * these topics (token-substring both ways), so the same keywords used
 * together surface similar communities, and "try again" rounds can rank the
 * remainder. Covers the same home-services phrase universe as the analytics
 * mock (RELATED_PHRASES / RETRY_PHRASES) plus generic trade tokens, so
 * whatever the post suggests has something to hit.
 */
export const COMMUNITY_TOPICS: Record<string, string[]> = {
  'facebook-dallas-homeowners': ['homeowner', 'repair', 'leak repair', 'contractor', 'dallas', 'renovation'],
  'facebook-texas-trades': ['contractor', 'trades', 'texas', 'plumbing', 'job'],
  'facebook-diy-plumbing': ['diy', 'plumbing', 'leak repair', 'drain cleaning', 'water heater'],
  'facebook-dfw-repairs': ['repair', 'leak repair', 'contractor', 'renovation', 'drain cleaning', 'plumbing'],
  'facebook-texas-plumbing-pros': ['plumbing', 'plumber', 'leak repair', 'water heater', 'drain cleaning', 'emergency'],
  'facebook-dallas-renovations': ['renovation', 'contractor', 'home improvement', 'radiator valves', 'gutter cleaning'],
  'facebook-emergency-plumbers-tx': ['emergency', 'plumbing', 'plumber', 'leak repair', 'boiler service', 'flooded'],
  'x-dallas-tx': ['dallas', 'local', 'texas', 'emergency'],
  'x-home-improvement': ['home improvement', 'renovation', 'repair', 'diy'],
  'x-plumbing-talk': ['plumbing', 'plumber', 'leak repair'],
  'x-plumbing-tips': ['plumbing', 'plumber', 'leak repair', 'shower pressure'],
  'x-diy-network': ['diy', 'renovation', 'home improvement', 'repair'],
  'x-texas-homeowners': ['homeowner', 'texas', 'repair', 'contractor', 'mould removal', 'tank insulation'],
  'reddit-plumbing': ['plumbing', 'plumber', 'leak repair', 'drain cleaning', 'boiler service'],
  'reddit-homeimprovement': ['home improvement', 'renovation', 'repair', 'contractor', 'radiator valves'],
  'reddit-dallas': ['dallas', 'local', 'contractor', 'plumber'],
  'reddit-homerepair': ['repair', 'diy', 'plumbing', 'renovation', 'contractor'],
  'reddit-askaplumber': ['plumber', 'plumbing', 'leak repair', 'drain cleaning', 'water heater'],
  'reddit-diy': ['diy', 'renovation', 'repair', 'home improvement', 'gutter cleaning', 'pipe insulation'],
  'reddit-fixit': ['repair', 'fix', 'plumbing', 'furnace service', 'valve replacement', 'trap cleaning'],
}