/**
 * The plans. Free is the only plan anyone can be on today, and it is enforced on the server: one phrase and one
 * connected account per platform at a time. Pro is shown on the pricing page but does not exist yet (nothing charges).
 * The operator can raise the limits for a whole deployment with PLAN_PHRASES_PER_PLATFORM, PLAN_ACCOUNTS_PER_PLATFORM and PLAN_WEBHOOKS_PER_PERSON;
 * people cannot.
 */

export type PlanPlatform = 'facebook' | 'x' | 'reddit'

export const FREE_PLAN = { id: 'free', name: 'Free', phrasesPerPlatform: 1, accountsPerPlatform: 1, webhooksPerPerson: 0 } as const

export type PlanLimits = { phrasesPerPlatform: number; accountsPerPlatform: number; webhooksPerPerson: number }

const NAMES: Record<PlanPlatform, string> = { reddit: 'Reddit', x: 'X', facebook: 'Facebook' }

export function platformName(platform: PlanPlatform): string {
  return NAMES[platform]
}

function whole(value: string | undefined, fallback: number, min = 1): number {
  const n = value === undefined || value.trim() === '' ? Number.NaN : Number(value)
  return Number.isInteger(n) && n >= min && n <= 1000 ? n : fallback
}

/** What this deployment allows: the Free numbers unless the operator has set others. */
export function planLimits(
  env: { PLAN_PHRASES_PER_PLATFORM?: string; PLAN_ACCOUNTS_PER_PLATFORM?: string; PLAN_WEBHOOKS_PER_PERSON?: string } = process.env,
): PlanLimits {
  return {
    phrasesPerPlatform: whole(env.PLAN_PHRASES_PER_PLATFORM, FREE_PLAN.phrasesPerPlatform),
    accountsPerPlatform: whole(env.PLAN_ACCOUNTS_PER_PLATFORM, FREE_PLAN.accountsPerPlatform),
    webhooksPerPerson: whole(env.PLAN_WEBHOOKS_PER_PERSON, FREE_PLAN.webhooksPerPerson, 0),
  }
}

/** The plain-words refusal when someone is at their limit. Existing phrases and accounts are never touched. */
export function phraseLimitMessage(platform: PlanPlatform, limit: number): string {
  return `The Free plan has ${limit} ${NAMES[platform]} phrase${limit === 1 ? '' : 's'} at a time. Remove ${limit === 1 ? 'the one' : 'one'} you have to add another (Pro, with more, is coming).`
}

export function accountLimitMessage(platform: PlanPlatform, limit: number): string {
  return `The Free plan has ${limit} ${NAMES[platform]} account${limit === 1 ? '' : 's'} at a time. Disconnect or remove ${limit === 1 ? 'the one' : 'one'} you have to add another (Pro, with more, is coming).`
}

/** The refusal for webhooks: none on Free (a Pro feature, and Pro is not available yet), or the limit when the operator has raised it. */
export function webhookLimitMessage(limit: number): string {
  if (limit === 0) return 'Webhooks are part of the Pro plan, which is coming soon.'
  return `The Free plan has ${limit} webhook${limit === 1 ? '' : 's'} at a time. Remove ${limit === 1 ? 'the one' : 'one'} you have to add another.`
}

export function atLimit(count: number, limit: number): boolean {
  return count >= limit
}
