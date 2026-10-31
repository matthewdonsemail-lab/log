/**
 * Content behind the dashboard header's "How Does {Route} Work?" button.
 * Each dashboard route resolves to one HowItWorks entry: a brief overview
 * of what the route does, and a short video that shows it in action.
 */

export interface HowItWorks {
  /** Route label as it appears in the sidebar ("Feed", "Keywords", …). */
  route: string
  /** One-paragraph answer to "what does this page do". */
  overview: string
  /** Short video showing this route in action. */
  videoSrc: string
}

export const HOW_IT_WORKS: Record<string, HowItWorks> = {
  Feed: {
    route: 'Feed',
    overview:
      'The feed is your live wire: every post that matched one of your phrases, newest first, shown as it would look on the platform it came from — Facebook, X, or Reddit. Open one and you can read the post, why it matched, and what to do next about it.',
    videoSrc: '/video/Facebook1.webm'
  },
  Groups: {
    route: 'Groups',
    overview:
      'Groups are the places on Facebook and Reddit where your customers gather. ListeningKit tracks which groups and communities you are in, how your phrases reach into them, and whether you still need to wait for an admin to accept you.',
    videoSrc: '/video/Facebook2.webm'
  },
  Listings: {
    route: 'Listings',
    overview:
      'Listings are the Facebook marketplace-style posts that show up when someone searches for exactly what you sell. ListeningKit drafts them in your voice and keeps an eye on how they perform next to the demand it is hearing.',
    videoSrc: '/video/Facebook3.webm'
  },
  Keywords: {
    route: 'Keywords',
    overview:
      'Keywords are the core of the whole system: the exact words, phrases, and questions your customers use when they are about to buy. Add one, and ListeningKit starts watching every connected platform for it.',
    videoSrc: '/video/Facebook4.webm'
  },
  Analytics: {
    route: 'Analytics',
    overview:
      'Analytics turns the firehose into a picture: how many mentions each of your keywords is earning, what they say, and how they feel — so you can see which of your words of work are actually pulling in demand.',
    videoSrc: '/video/usecase/2.webm'
  },
  Accounts: {
    route: 'Accounts',
    overview:
      'Accounts are your connected Facebook, X, and Reddit logins — the eyes ListeningKit uses to read the platforms you care about. Everything else in the system runs through them.',
    videoSrc: '/video/usecase/1.webm'
  },
  Brand: {
    route: 'Brand',
    overview:
      'The brand record is how ListeningKit writes like you: your voice, your offerings, your website. Every suggested reply and every listing draft is grounded in it.',
    videoSrc: '/video/usecase/3.webm'
  },
  Messages: {
    route: 'Messages',
    overview:
      'Messages is the conversation side of listening: the threads where a match turned into a reply, and the follow-ups that keep it warm until the job is booked.',
    videoSrc: '/video/usecase/4.webm'
  },
  Docs: {
    route: 'Docs',
    overview:
      'Docs is the full reference: what works today, how each piece is wired, and where to go when something looks odd — the map for the whole system, not just one page.',
    videoSrc: '/video/usecase/1.webm'
  },
  API: {
    route: 'API',
    overview:
      'The API hands ListeningKit to your tools: a key, a base address, and the same data the dashboard reads — matches, keywords, events — over HTTP and over MCP for agents.',
    videoSrc: '/video/usecase/2.webm'
  },
  Settings: {
    route: 'Settings',
    overview:
      'Settings is where the system is tuned: the connections that power it, the email alerts that surface it, the ingest keys that feed it, and the plan limits that shape it.',
    videoSrc: '/video/usecase/3.webm'
  }
}

/** Resolve the current dashboard pathname to its HowItWorks entry. */
export function howItWorksForPathname(pathname: string): HowItWorks | null {
  // Multi-segment routes first: /dashboard/facebook/listings[/…] → Listings.
  if (pathname.startsWith('/dashboard/facebook/listings')) return HOW_IT_WORKS['Listings'] ?? null
  const parts = pathname.split('/').filter(Boolean)
  // /dashboard → Feed; /dashboard/<section> → section; nested routes fall
  // back to the section (e.g. /dashboard/analytics/:id → Analytics).
  const segment = parts.length >= 2 ? parts[1] : 'Feed'
  // Route segments are lowercase in the URL, map keys are Title Case.
  const key = segment.charAt(0).toUpperCase() + segment.slice(1)
  return HOW_IT_WORKS[key] ?? null
}

/** The sidebar label for a dashboard path — the "{Route}" in the button. */
export function routeLabelForPathname(pathname: string): string {
  return howItWorksForPathname(pathname)?.route ?? ''
}
