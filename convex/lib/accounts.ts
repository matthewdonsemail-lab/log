import type { Doc } from '../_generated/dataModel'
import type { MutationCtx } from './server'

type Platform = Doc<'accounts'>['platform']
const LABELS: Record<Platform, string> = { facebook: 'Facebook', x: 'X', reddit: 'Reddit' }

/** The owner's first account on a platform, created as "<Platform> ingest" when none exists. */
export async function ensureAccount(ctx: MutationCtx, owner: string, platform: Platform): Promise<Doc<'accounts'>> {
  const existing = await ctx.db.query('accounts')
    .withIndex('by_owner_and_platform', q => q.eq('owner', owner).eq('platform', platform)).first()
  if (existing) return existing
  const id = await ctx.db.insert('accounts', { owner, platform, label: `${LABELS[platform]} ingest`, connectedAt: null })
  const created = await ctx.db.get(id)
  if (!created) throw new Error('Account creation failed')
  return created
}
