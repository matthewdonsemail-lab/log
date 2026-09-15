import type { Platform } from '../platform'

export type FeedPlatform = Platform

export type FeedVariant = 'post-text' | 'post-image' | 'comment'

export interface FeedMetrics {
  likes: number
  comments: number
  shares?: number
  views?: number
  replies?: number
  reposts?: number
}

export interface FeedItem extends FeedMetrics {
  id: string
  platform: FeedPlatform
  variant: FeedVariant
  authorName: string
  handle?: string
  community?: string
  timeAgo: string
  timestamp?: string
  title?: string
  body: string[]
  imageSrc?: string
  avatarUrl?: string
}

export interface FeedResponse {
  items: FeedItem[]
}

/**
 * Compact display for a raw count: 950 → "950", 1900 → "1.9k",
 * 1_100_000 → "1.1M". Cards never parse strings — they format numbers.
 */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const rounded = Math.round(value)
  if (rounded >= 1_000_000) {
    const text = (rounded / 1_000_000).toFixed(1).replace(/\.0$/, '')
    return `${text}M`
  }
  if (rounded >= 1_000) {
    const text = (rounded / 1_000).toFixed(1).replace(/\.0$/, '')
    return `${text}k`
  }
  return `${rounded}`
}

/** "48" + "comments" → "48 comments" (singular-aware). */
export function formatCountWithUnit(value: number, unit: string): string {
  return `${formatCount(value)} ${unit}`
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

/** Stand-in rows until the real Hono backend lands. Same shape, same routes. */
export const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    id: 'fb-img-1',
    platform: 'facebook',
    variant: 'post-image',
    authorName: 'Piyatida Kamolmas',
    timeAgo: '15h',
    body: [
      'Before/after from today’s water heater swap in Dallas.',
      'If your unit is over 10 years old, get it checked!'
    ],
    imageSrc: img('photo-1522708323590-d24dbb6b0267'),
    likes: 650,
    comments: 48,
    shares: 135
  },
  {
    id: 'fb-txt-1',
    platform: 'facebook',
    variant: 'post-text',
    authorName: 'Marcus Webb',
    timeAgo: '3h',
    body: [
      'PSA: turn off your main water valve before vacation.',
      'Came home to a flooded kitchen last night. Learn from me.'
    ],
    likes: 128,
    comments: 32,
    shares: 12
  },
  {
    id: 'x-img-1',
    platform: 'x',
    variant: 'post-image',
    authorName: 'Dallas Homeowner',
    handle: '@dallasplumb911',
    timeAgo: '2h',
    timestamp: '9:41AM · Sep 12 2026 · Twitter for iPhone',
    body: ['Shoutout to the crew that fixed our slab leak today. Floor is dry for the first time in a week!'],
    imageSrc: img('photo-1506905925346-21bda4d32df4'),
    likes: 1903,
    comments: 214,
    views: 8200,
    replies: 214,
    reposts: 96
  },
  {
    id: 'x-txt-1',
    platform: 'x',
    variant: 'post-text',
    authorName: 'Simon Fairhurst',
    handle: '@siimonfairhurst',
    timeAgo: '1d',
    timestamp: '1:27PM · Oct 4 2022 · Twitter for iPhone',
    body: ['Figma, Webflow, or Framer. Which one will take the lead in 2023 and be the go-to for digital design?'],
    likes: 3987,
    comments: 1240,
    views: 1100000,
    replies: 1240,
    reposts: 5579
  },
  {
    id: 'r-post-1',
    platform: 'reddit',
    variant: 'post-text',
    authorName: 'u/dallasplumb911',
    community: 'r/Plumbing',
    timeAgo: '15h',
    title: 'Need a plumber in Dallas ASAP',
    body: ['Toilet broke and it’s leaking all over the bathroom floor!'],
    likes: 342,
    comments: 86,
    shares: 18
  },
  {
    id: 'r-cmt-1',
    platform: 'reddit',
    variant: 'comment',
    authorName: 'u/plumber_finder',
    timeAgo: '12h',
    body: ['I can swing by tomorrow morning — DM me your cross streets.'],
    likes: 156,
    comments: 4,
    shares: 4
  },
  {
    id: 'fb-img-2',
    platform: 'facebook',
    variant: 'post-image',
    authorName: 'Dana Whitfield',
    timeAgo: '6h',
    body: [
      'Kitchen reno is finally done — new faucet, no more drips.',
      'Highly recommend getting the ceramic valves.'
    ],
    imageSrc: img('photo-1517842645767-c639042777db'),
    likes: 89,
    comments: 14,
    shares: 3
  },
  {
    id: 'fb-txt-2',
    platform: 'facebook',
    variant: 'post-text',
    authorName: 'Priya Nair',
    timeAgo: '1d',
    body: [
      'Anyone know a 24/7 emergency plumber near Deep Ellum?',
      'Water heater burst an hour ago, need help fast.'
    ],
    likes: 45,
    comments: 21,
    shares: 2
  },
  {
    id: 'x-txt-2',
    platform: 'x',
    variant: 'post-text',
    authorName: 'Mike Torres',
    handle: '@mike_torres',
    timeAgo: '5h',
    timestamp: '4:02PM · Sep 12 2026 · Twitter for Android',
    body: ['PSA: if your water bill doubled and you hear running water, check your slab. Learned the hard way.'],
    likes: 512,
    comments: 87,
    views: 3400,
    replies: 87,
    reposts: 41
  },
  {
    id: 'r-cmt-2',
    platform: 'reddit',
    variant: 'comment',
    authorName: 'u/diy_dan',
    timeAgo: '8h',
    body: ['Shut the main off first, then drain the lowest faucet in the house before you touch anything.'],
    likes: 98,
    comments: 2,
    shares: 1
  }
]
