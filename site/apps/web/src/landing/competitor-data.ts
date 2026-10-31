export type Competitor = {
  id: string
  name: string
  tagline: string
  badge?: string
  isHero?: boolean
  ctaLabel: string
  ctaHref: string
  logoType: 'listeningkit' | 'octolens' | 'brand24' | 'syften'
  summary: string
}

export type CompareRow = {
  feature: string
  values: readonly string[]
}

export type CompareGroup = {
  id: string
  title: string
  defaultOpen?: boolean
  rows: readonly CompareRow[]
}

export const COMPETITORS: Competitor[] = [
  {
    id: 'listeningkit',
    name: 'ListeningKit',
    tagline: 'Omnichannel Marketing & Intent at Scale',
    badge: 'Full Stack Engine',
    isHero: true,
    ctaLabel: 'Get started free',
    ctaHref: '/onboarding',
    logoType: 'listeningkit',
    summary: 'Social listening + CRM pipeline + landers + automated text-back & ad intent'
  },
  {
    id: 'octolens',
    name: 'Octolens',
    tagline: 'Developer & B2B Social Listening',
    badge: 'Social listening only',
    ctaLabel: 'Alerts only ($49+/mo)',
    ctaHref: '/onboarding',
    logoType: 'octolens',
    summary: 'Tracks keyword mentions on Reddit, X, and GitHub. No conversion or CRM.'
  },
  {
    id: 'brand24',
    name: 'Brand24',
    tagline: 'Traditional Brand & Sentiment Monitoring',
    badge: 'Monitoring only',
    ctaLabel: 'Alerts only ($99+/mo)',
    ctaHref: '/onboarding',
    logoType: 'brand24',
    summary: 'Broad web & forum monitoring with sentiment scores. No marketing execution.'
  },
  {
    id: 'syften',
    name: 'Syften',
    tagline: 'Niche Community & Forum Keyword Alerts',
    badge: 'Alerts only',
    ctaLabel: 'Alerts only ($29+/mo)',
    ctaHref: '/onboarding',
    logoType: 'syften',
    summary: 'Sends RSS / email notifications on keyword matches. No outreach or funnel.'
  }
]

export const COMPETITOR_COMPARE_GROUPS: CompareGroup[] = [
  {
    id: 'omnichannel',
    title: 'Omnichannel Marketing at Scale',
    defaultOpen: true,
    rows: [
      {
        feature: 'Omnichannel marketing execution',
        values: ['check', 'dash', 'dash', 'dash']
      },
      {
        feature: 'Multi-platform intent listening (Reddit, X, Facebook)',
        values: ['check', 'Reddit & X only (No FB)', 'Web & Social', 'Reddit & Hacker News']
      },
      {
        feature: 'Built-in CRM & lead pipeline',
        values: ['check', 'dash', 'dash', 'dash']
      },
      {
        feature: 'Conversion landing pages matched to query',
        values: ['check', 'dash', 'dash', 'dash']
      },
      {
        feature: 'Instant missed-call & lead text-back',
        values: ['check', 'dash', 'dash', 'dash']
      },
      {
        feature: 'Paid search / PPC intent capture',
        values: ['check', 'dash', 'dash', 'dash']
      }
    ]
  },
  {
    id: 'ai-automation',
    title: 'AI Intelligence & Agentic Workflows',
    defaultOpen: true,
    rows: [
      {
        feature: 'Custom business prompt AI scoring',
        values: ['check', 'Generic relevance', 'Basic sentiment', 'dash']
      },
      {
        feature: 'MCP Server (Claude, Cursor, Hermes AI agents)',
        values: ['check', 'dash', 'dash', 'dash']
      },
      {
        feature: 'Local headless browser reader (zero account bans)',
        values: ['check', 'dash', 'dash', 'dash']
      },
      {
        feature: 'Automated buyer intent qualification',
        values: ['check', 'Keyword density only', 'dash', 'dash']
      }
    ]
  },
  {
    id: 'control-pricing',
    title: 'Scale, Pricing & Ownership',
    defaultOpen: true,
    rows: [
      {
        feature: 'Free tier available forever',
        values: ['check', '$49 / month min', '$99 / month min', '$29 / month min']
      },
      {
        feature: 'Full REST API + Ingest tokens',
        values: ['check', 'Webhooks only', 'Enterprise only', 'Limited webhook']
      },
      {
        feature: 'End-to-end customer acquisition vs alerts',
        values: ['Full Acquisition Stack', 'Alert inbox only', 'Dashboard only', 'Notification feed']
      }
    ]
  }
]
