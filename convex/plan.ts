import { FREE_PLAN, planLimits, type PlanPlatform } from './lib/plan'
import { query, requireOwner } from './lib/server'

const PLATFORMS: PlanPlatform[] = ['reddit', 'x', 'facebook']

/** The person's plan and how much of it they are using, for the Billing view. Nothing here charges anything. */
export const mine = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const keywords = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', owner)).take(200)
    const accounts = await ctx.db.query('accounts').withIndex('by_owner', q => q.eq('owner', owner)).take(200)
    const count = (rows: { platform: PlanPlatform }[]) => Object.fromEntries(PLATFORMS.map(p => [p, rows.filter(r => r.platform === p).length]))
    return {
      plan: FREE_PLAN.id, name: FREE_PLAN.name,
      limits: planLimits(),
      usage: { phrases: count(keywords) as Record<PlanPlatform, number>, accounts: count(accounts) as Record<PlanPlatform, number> },
    }
  },
})
