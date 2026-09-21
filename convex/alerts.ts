import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { isEmail, renderDigest, sendEmail, type DigestHit } from './lib/agentmail'
import { action, internalAction, internalMutation, internalQuery, mutation, query, requireOwner } from './lib/server'

const MIN_GAP_MS = 10 * 60_000     // at most one alert email per person every 10 minutes
const TEST_GAP_MS = 60_000         // and one test email a minute
const FRESH_MS = 24 * 3_600_000    // a match older than a day is not news
const MAX_PER_EMAIL = 5
const SCAN = 200
const MAX_PEOPLE = 100

type Batch = { owner: string; email: string; hitIds: Id<'hits'>[]; hits: DigestHit[] }
type Summary = { emails: number; failed: number; skipped?: string }

/** Both values come from the deployment's environment; neither is ever returned or logged. */
function credentials(): { apiKey: string; inboxId: string } | null {
  const apiKey = process.env.AGENTMAIL_API_KEY
  const inboxId = process.env.AGENTMAIL_INBOX_ID
  return apiKey && inboxId ? { apiKey, inboxId } : null
}

function siteUrl(): string {
  return (process.env.CONVEX_SITE_URL ?? '').replace(/\/$/, '')
}

/** The person's own alert settings, and whether the deployment can send email at all. */
export const mine = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.query('emailAlerts').withIndex('by_owner', q => q.eq('owner', owner)).first()
    return {
      available: credentials() !== null,
      email: row?.email ?? null, enabled: row?.enabled ?? false, minScore: row?.minScore ?? 70,
      lastSentAt: row?.lastSentAt ?? null,
    }
  },
})

export const save = mutation({
  args: { email: v.string(), enabled: v.boolean(), minScore: v.number() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const email = args.email.trim()
    if (!isEmail(email)) throw new ConvexError('Enter one email address, like you@example.com.')
    const minScore = Math.min(100, Math.max(1, Math.round(args.minScore)))
    const row = await ctx.db.query('emailAlerts').withIndex('by_owner', q => q.eq('owner', owner)).first()
    if (row) await ctx.db.patch(row._id, { email, enabled: args.enabled, minScore })
    else await ctx.db.insert('emailAlerts', { owner, email, enabled: args.enabled, minScore })
    return { email, enabled: args.enabled, minScore }
  },
})

/** For the test action only: the settings plus a check that a test is not being sent too fast. */
export const startTest = internalMutation({
  args: { owner: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const row = await ctx.db.query('emailAlerts').withIndex('by_owner', q => q.eq('owner', args.owner)).first()
    if (!row) throw new ConvexError('Save your email address first.')
    const now = Date.now()
    if (row.lastTestAt !== undefined && now - row.lastTestAt < TEST_GAP_MS) throw new ConvexError('Wait a minute before sending another test.')
    await ctx.db.patch(row._id, { lastTestAt: now })
    return row.email
  },
})

/** Send one test email to the saved address, so a person knows alerts will arrive before a real match does. */
export const sendTest = action({
  args: {},
  handler: async (ctx): Promise<{ sent: true }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError('Authentication required')
    const creds = credentials()
    if (!creds) throw new ConvexError('Email alerts are not switched on yet.')
    const to: string = await ctx.runMutation(internal.alerts.startTest, { owner: identity.tokenIdentifier })
    try {
      await sendEmail(fetch, creds.apiKey, creds.inboxId, {
        to, subject: 'ListeningKit test email',
        text: `This is a test from ListeningKit. When a match scores high enough you will get an email like this one.\n\nOpen ListeningKit: ${siteUrl()}/dashboard/keywords`,
      })
    } catch (error) {
      console.error('alerts: test email failed', error instanceof Error ? error.message : error)
      throw new ConvexError(error instanceof Error ? error.message : 'The test email could not be sent.')
    }
    return { sent: true }
  },
})

/** Everyone who is due an email right now, with the strong, fresh, not-yet-sent matches to put in it. */
export const dueBatches = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, args): Promise<Batch[]> => {
    const people = await ctx.db.query('emailAlerts').withIndex('by_enabled', q => q.eq('enabled', true)).take(MAX_PEOPLE)
    const batches: Batch[] = []
    for (const person of people) {
      if (person.lastSentAt !== undefined && args.now - person.lastSentAt < MIN_GAP_MS) continue
      const recent = await ctx.db.query('hits').withIndex('by_owner', q => q.eq('owner', person.owner)).order('desc').take(SCAN)
      const strong = recent
        .filter(hit => hit.alertedAt === undefined && hit.score !== undefined && hit.score >= person.minScore
          && hit.scoredAt !== undefined && args.now - hit.scoredAt < FRESH_MS)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, MAX_PER_EMAIL)
      if (strong.length === 0) continue
      const hits: DigestHit[] = []
      const hitIds: Id<'hits'>[] = []
      for (const hit of strong) {
        const post = await ctx.db.get(hit.postId)
        if (!post) continue
        hitIds.push(hit._id)
        hits.push({
          score: hit.score ?? 0, intent: hit.intent ?? null, reason: hit.reason ?? null, phrase: hit.phrase, platform: hit.platform,
          author: post.authorName, excerpt: [post.title, post.body.join(' ')].filter(Boolean).join(' — '), url: post.url,
        })
      }
      if (hits.length > 0) batches.push({ owner: person.owner, email: person.email, hitIds, hits })
    }
    return batches
  },
})

export const markSent = internalMutation({
  args: { owner: v.string(), hitIds: v.array(v.id('hits')), at: v.number() },
  handler: async (ctx, args) => {
    for (const id of args.hitIds) {
      const hit = await ctx.db.get(id)
      if (hit && hit.owner === args.owner) await ctx.db.patch(id, { alertedAt: args.at })
    }
    const row = await ctx.db.query('emailAlerts').withIndex('by_owner', q => q.eq('owner', args.owner)).first()
    if (row) await ctx.db.patch(row._id, { lastSentAt: args.at })
    return null
  },
})

/** Every 5 minutes: email each person their new strong matches. A failed send is logged and retried next time, never marked as sent. */
export const sweep = internalAction({
  args: {},
  handler: async (ctx): Promise<Summary> => {
    const creds = credentials()
    if (!creds) return { emails: 0, failed: 0, skipped: 'AGENTMAIL_API_KEY and AGENTMAIL_INBOX_ID are not set' }
    const batches: Batch[] = await ctx.runQuery(internal.alerts.dueBatches, { now: Date.now() })
    let emails = 0
    let failed = 0
    for (const batch of batches) {
      const { subject, text } = renderDigest(batch.hits, siteUrl())
      try {
        await sendEmail(fetch, creds.apiKey, creds.inboxId, { to: batch.email, subject, text })
        await ctx.runMutation(internal.alerts.markSent, { owner: batch.owner, hitIds: batch.hitIds, at: Date.now() })
        emails += 1
      } catch (error) {
        failed += 1
        console.error('alerts: one email failed', error instanceof Error ? error.message : error)
      }
    }
    return { emails, failed }
  },
})
