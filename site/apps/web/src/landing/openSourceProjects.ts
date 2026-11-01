/**
 * ListeningKit's open-source projects: the list behind the header's GitHub button, whose star
 * count is the total across all of them. Mirrors ui-kit's packages/ui/src/lib/open-source-projects.ts.
 * `stars` is the count at the time of writing and only shows until the live count arrives from the GitHub API.
 */
export const OPEN_SOURCE_OWNER = 'matthewdonsemail-lab'

export type OpenSourceProject = {
  /** GitHub repository name under OPEN_SOURCE_OWNER. */
  repo: string
  name: string
  blurb: string
  stars: number
}

export const OPEN_SOURCE_PROJECTS: OpenSourceProject[] = [
  { repo: 'log', name: 'Log', blurb: 'Social listening and outreach across Reddit, X and Facebook.', stars: 22 },
  { repo: 'dialer', name: 'Dialer', blurb: 'Power-dialing softphone with every call kept in Twenty CRM.', stars: 5 },
  { repo: 'convex-treg', name: 'Treg', blurb: 'Call 2,600+ data APIs from Convex with spend limits.', stars: 3 },
  { repo: 'blaster', name: 'Blaster', blurb: 'Reads your Twenty pipeline and sends SMS sequences.', stars: 1 },
  { repo: 'convex-telnyx', name: 'Telnyx', blurb: 'Send SMS from Convex without duplicate sends.', stars: 1 },
  { repo: 'ListeningKit-Treg-Skills', name: 'Treg Skills', blurb: 'Free skill bundle for live external data in your agent.', stars: 1 },
  { repo: 'offer', name: 'Offer', blurb: 'Write an offer once and the whole funnel renders from it.', stars: 0 },
  { repo: 'rank', name: 'Rank', blurb: 'AI backlink-prospect ranking.', stars: 0 },
]
