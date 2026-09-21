import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import { businessSummary, normalizeWebsite, scrapeBrand, type BrandFacts } from './lib/firecrawl'
import { action, internalMutation, query, requireOwner } from './lib/server'

const COOLDOWN_MS = 30_000

const factsValidator = v.object({
  name: v.string(), tagline: v.string(),
  offerings: v.array(v.object({ name: v.string(), detail: v.string() })),
  tone: v.optional(v.string()),
  formality: v.optional(v.union(v.literal('casual'), v.literal('professional'), v.literal('formal'))),
  locationLabel: v.optional(v.string()), logoUrl: v.optional(v.string()),
})

/** Words a person can act on. Only our own library's messages reach here, and none of them contain a key or a response body. */
function plainReason(error: unknown): string {
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) return 'That website took too long to read. Try again.'
  return error instanceof Error && error.message ? error.message : 'Could not read that website.'
}

/**
 * Read the person's own website with Firecrawl and remember what it says about the business. The
 * result is real or it is an error: nothing is invented when the page says little.
 */
export const extractFromWebsite = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<BrandFacts & { sourceUrl: string }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError('Authentication required')
    const owner = identity.tokenIdentifier
    const target = normalizeWebsite(args.url)
    if (!target.ok) throw new ConvexError(target.reason)
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) throw new ConvexError('Reading your website is not switched on yet.')
    await ctx.runMutation(internal.brand.claim, { owner })
    let facts: BrandFacts
    try { facts = await scrapeBrand(fetch, apiKey, target.url) } catch (error) {
      console.error('brand: Firecrawl failed', error instanceof Error ? error.message : error)
      throw new ConvexError(plainReason(error))
    }
    await ctx.runMutation(internal.brand.store, { owner, sourceUrl: target.url, facts })
    return { ...facts, sourceUrl: target.url }
  },
})

/** Starts a read: refuses a second one inside the cooldown, so pressing the button repeatedly cannot spend credits. */
export const claim = internalMutation({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now()
    const row = await ctx.db.query('brands').withIndex('by_owner', q => q.eq('owner', args.owner)).first()
    if (row && now - row.lastAttemptAt < COOLDOWN_MS) throw new ConvexError('Please wait a few seconds before reading again.')
    if (row) await ctx.db.patch(row._id, { lastAttemptAt: now })
    else await ctx.db.insert('brands', { owner: args.owner, sourceUrl: '', name: '', tagline: '', offerings: [], fetchedAt: 0, lastAttemptAt: now })
    return null
  },
})

export const store = internalMutation({
  args: { owner: v.string(), sourceUrl: v.string(), facts: factsValidator },
  handler: async (ctx, args) => {
    const row = await ctx.db.query('brands').withIndex('by_owner', q => q.eq('owner', args.owner)).first()
    const fields = {
      owner: args.owner, sourceUrl: args.sourceUrl, ...args.facts, fetchedAt: Date.now(), lastAttemptAt: row?.lastAttemptAt ?? Date.now(),
    }
    if (row) await ctx.db.replace(row._id, fields)
    else await ctx.db.insert('brands', fields)
    return null
  },
})

/** What was last read from this person's website, or null if they have not done that. */
export const mine = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.query('brands').withIndex('by_owner', q => q.eq('owner', owner)).first()
    if (!row || row.fetchedAt === 0) return null
    return {
      sourceUrl: row.sourceUrl, name: row.name, tagline: row.tagline, offerings: row.offerings,
      tone: row.tone ?? null, formality: row.formality ?? null, locationLabel: row.locationLabel ?? null,
      logoUrl: row.logoUrl ?? null, fetchedAt: row.fetchedAt, summary: businessSummary(row),
    }
  },
})
