/**
 * The plans. Free is the only plan anyone can be on today, and it is enforced on the server: one phrase and one
 * connected account per platform at a time. Pro is shown on the pricing page but does not exist yet (nothing charges).
 * The operator can raise the limits for a whole deployment with PLAN_PHRASES_PER_PLATFORM and PLAN_ACCOUNTS_PER_PLATFORM;
 * people cannot.
 */

export type PlanPlatform = 'facebook' | 'x' | 'reddit'

export const FREE_PLAN = { id: 'free', name: 'Free', phrasesPerPlatform: 1, accountsPerPlatform: 1 } as const

export type PlanLimits = { phrasesPerPlatform: number; accountsPerPlatform: number }

const NAMES: Record<PlanPlatform, string> = { reddit: 'Reddit', x: 'X', facebook: 'Facebook' }

export function platformName(platform: PlanPlatform): string {
  return NAMES[platform]
}

function whole(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : fallback
}

/** What this deployment allows: the Free numbers unless the operator has set others. */
export function planLimits(env: { PLAN_PHRASES_PER_PLATFORM?: string; PLAN_ACCOUNTS_PER_PLATFORM?: string } = process.env): PlanLimits {
  return {
    phrasesPerPlatform: whole(env.PLAN_PHRASES_PER_PLATFORM, FREE_PLAN.phrasesPerPlatform),
    accountsPerPlatform: whole(env.PLAN_ACCOUNTS_PER_PLATFORM, FREE_PLAN.accountsPerPlatform),
  }
}

/** The plain-words refusal when someone is at their limit. Existing phrases and accounts are never touched. */
export function phraseLimitMessage(platform: PlanPlatform, limit: number): string {
  return `The Free plan has ${limit} ${NAMES[platform]} phrase${limit === 1 ? '' : 's'} at a time. Remove ${limit === 1 ? 'the one' : 'one'} you have to add another (Pro, with more, is coming).`
}

export function accountLimitMessage(platform: PlanPlatform, limit: number): string {
  return `The Free plan has ${limit} ${NAMES[platform]} account${limit === 1 ? '' : 's'} at a time. Disconnect or remove ${limit === 1 ? 'the one' : 'one'} you have to add another (Pro, with more, is coming).`
}

export function atLimit(count: number, limit: number): boolean {
  return count >= limit
}
