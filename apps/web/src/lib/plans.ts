import { z } from 'zod'

/** The plans as the pricing page and the Billing tab show them. Free is real and enforced; Pro is announced and nothing charges yet. */
export type PlanCard = {
  id: 'free' | 'pro'
  name: string
  price: string
  period: string
  blurb: string
  features: string[]
  cta: string
  /** Where the button leads. Null when the plan cannot be chosen yet. */
  href: string | null
  badge?: string
}

export const PLAN_CARDS: PlanCard[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'no card needed',
    blurb: 'Everything you need to start listening.',
    features: [
      '1 phrase per platform (Reddit, X and Facebook)',
      '1 connected account per platform',
      'Website reading builds your brand profile',
      'Email alerts for strong matches',
      'AI scoring of every match',
    ],
    cta: 'Get started',
    href: '/onboarding',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: 'per month, planned',
    blurb: 'For when one of each is not enough.',
    features: [
      'Everything in Free',
      'More phrases on every platform',
      'More connected accounts on every platform',
    ],
    cta: 'Coming soon',
    href: null,
    badge: 'Coming soon',
  },
]

export const livePlanSchema = z.object({
  plan: z.string(),
  name: z.string(),
  limits: z.object({ phrasesPerPlatform: z.number(), accountsPerPlatform: z.number() }),
  usage: z.object({ phrases: z.record(z.string(), z.number()), accounts: z.record(z.string(), z.number()) }),
})

export type LivePlan = z.infer<typeof livePlanSchema>

const PLATFORM_LABELS: Record<string, string> = { reddit: 'Reddit', x: 'X', facebook: 'Facebook' }

export function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform] ?? platform
}

/** "1 of 1" for a usage line. */
export function usageText(used: number, limit: number): string {
  return `${used} of ${limit}`
}

/** True when a person cannot add another phrase on this platform. Existing phrases above the limit stay; only new ones are blocked. */
export function phraseLimitReached(plan: LivePlan | null, platform: string): boolean {
  if (!plan) return false
  return (plan.usage.phrases[platform] ?? 0) >= plan.limits.phrasesPerPlatform
}
