import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
import type { ActionCtx, QueryCtx } from './_generated/server'
import { decryptText, encryptText } from './lib/crypto'
import { planLimits, webhookLimitMessage } from './lib/plan'
import { internalAction, internalMutation, internalQuery, mutation, query, requireOwner, action, type MutationCtx } from './lib/server'
import { checkWebhookUrl } from './lib/webhookUrl'
import { newWebhookSecret, signPayload } from './lib/webhookSign'
import { apiMatch } from './publicApi'
import { platform } from './schema'

type Platform = 'facebook' | 'x' | 'reddit'

const MAX_ATTEMPTS = 4                                     // the first try and three retries
const RETRY_DELAYS_MS = [60_000, 300_000, 1_800_000]       // after attempt 1, 2 and 3
const DISABLE_AFTER = 5                                    // failed deliveries in a row before a webhook is switched off
const TIMEOUT_MS = 5_000
const LOG_SIZE = 20
const DEFAULT_MIN_SCORE = 70

function publicWebhook(row: Doc<'webhooks'>) {
  return {
    id: row._id, url: row.url, minScore: row.minScore, platforms: row.platforms ?? [], active: row.active,
    failureStreak: row.failureStreak, disabledReason: row.disabledReason ?? null, lastDeliveryAt: row.lastDeliveryAt ?? null,
    createdAt: row._creationTime,
  }
}

function checkMinScore(value: number | undefined): number {
  if (value === undefined) return DEFAULT_MIN_SCORE
  if (!Number.isInteger(value) || value < 0 || value > 100) throw new ConvexError('min_score must be a whole number from 0 to 100')
  return value
}

function checkPlatforms(value: Platform[] | undefined): Platform[] | undefined {
  if (value === undefined || value.length === 0) return undefined
  return [...new Set(value)]
}

async function ownedWebhook(ctx: Pick<QueryCtx, 'db'>, owner: string, rawId: string): Promise<Doc<'webhooks'>> {
  const id = ctx.db.normalizeId('webhooks', rawId)
  const row = id === null ? null : await ctx.db.get(id)
  if (!row || row.owner !== owner) throw new ConvexError('Webhook not found')
  return row
}

// ---------------------------------------------------------------- managing them (shared by the dashboard and the API)

async function createCore(ctx: MutationCtx, owner: string, args: { url: string; minScore?: number; platforms?: Platform[] }) {
  const { webhooksPerPerson } = planLimits()
  if (webhooksPerPerson === 0) throw new ConvexError(webhookLimitMessage(0))
  const existing = await ctx.db.query('webhooks').withIndex('by_owner', q => q.eq('owner', owner)).take(webhooksPerPerson + 1)
  if (existing.length >= webhooksPerPerson) throw new ConvexError(webhookLimitMessage(webhooksPerPerson))
  const checked = checkWebhookUrl(args.url)
  if (!checked.ok) throw new ConvexError(checked.reason)
  if (existing.some(row => row.url === checked.url)) throw new ConvexError('You already have a webhook for that address')
  const minScore = checkMinScore(args.minScore)
  const platforms = checkPlatforms(args.platforms)
  const secret = newWebhookSecret()
  const sealed = await encryptText(secret)
  const id = await ctx.db.insert('webhooks', {
    owner, url: checked.url, secretIv: sealed.iv, secretData: sealed.data, minScore, active: true, failureStreak: 0,
    ...(platforms === undefined ? {} : { platforms }),
  })
  const row = await ctx.db.get(id)
  if (!row) throw new ConvexError('Could not save the webhook')
  return { webhook: publicWebhook(row), secret }   // the secret is returned this once and never again
}

async function listCore(ctx: Pick<QueryCtx, 'db'>, owner: string) {
  const rows = await ctx.db.query('webhooks').withIndex('by_owner', q => q.eq('owner', owner)).take(50)
  return rows.map(publicWebhook)
}

async function updateCore(ctx: MutationCtx, owner: string, rawId: string, args: { active?: boolean; minScore?: number; platforms?: Platform[] }) {
  const row = await ownedWebhook(ctx, owner, rawId)
  const patch: Partial<Doc<'webhooks'>> = {}
  if (args.minScore !== undefined) patch.minScore = checkMinScore(args.minScore)
  if (args.platforms !== undefined) patch.platforms = checkPlatforms(args.platforms)
  if (args.active !== undefined) {
    patch.active = args.active
    if (args.active) { patch.failureStreak = 0; patch.disabledReason = undefined }
  }
  await ctx.db.patch(row._id, patch)
  return publicWebhook((await ctx.db.get(row._id)) as Doc<'webhooks'>)
}

async function removeCore(ctx: MutationCtx, owner: string, rawId: string) {
  const row = await ownedWebhook(ctx, owner, rawId)
  const log = await ctx.db.query('webhookDeliveries').withIndex('by_webhook', q => q.eq('webhookId', row._id)).take(500)
  for (const entry of log) await ctx.db.delete(entry._id)
  await ctx.db.delete(row._id)
  return { id: row._id, deleted: true }
}

async function deliveriesCore(ctx: Pick<QueryCtx, 'db'>, owner: string, rawId: string) {
  const row = await ownedWebhook(ctx, owner, rawId)
  const log = await ctx.db.query('webhookDeliveries').withIndex('by_webhook', q => q.eq('webhookId', row._id)).order('desc').take(LOG_SIZE)
  return log.map(entry => ({
    id: entry._id, event: entry.event, status: entry.status, attempts: entry.attempts,
    statusCode: entry.statusCode ?? null, error: entry.error ?? null, at: entry.updatedAt,
  }))
}

const createArgs = { url: v.string(), minScore: v.optional(v.number()), platforms: v.optional(v.array(platform)) }

// The dashboard.
export const list = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    return { limit: planLimits().webhooksPerPerson, webhooks: await listCore(ctx, owner) }
  },
})
export const create = mutation({ args: createArgs, handler: async (ctx, args) => await createCore(ctx, await requireOwner(ctx), args) })
export const update = mutation({
  args: { id: v.string(), active: v.optional(v.boolean()), minScore: v.optional(v.number()), platforms: v.optional(v.array(platform)) },
  handler: async (ctx, args) => await updateCore(ctx, await requireOwner(ctx), args.id, args),
})
export const remove = mutation({ args: { id: v.string() }, handler: async (ctx, args) => await removeCore(ctx, await requireOwner(ctx), args.id) })
export const deliveries = query({
  args: { id: v.string() },
  handler: async (ctx, args) => await deliveriesCore(ctx, await requireOwner(ctx), args.id),
})
/** Send one test event now, so a person sees whether their receiver answers. */
export const test = action({
  args: { id: v.string() },
  handler: async (ctx, args): Promise<Outcome> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError('Authentication required')
    return await runTest(ctx, identity.tokenIdentifier, args.id)
  },
})

// The public API (called by the HTTP layer after it has checked the key and its scope).
export const createFor = internalMutation({ args: { owner: v.string(), ...createArgs }, handler: async (ctx, args) => await createCore(ctx, args.owner, args) })
export const listFor = internalQuery({ args: { owner: v.string() }, handler: async (ctx, args) => await listCore(ctx, args.owner) })
export const updateFor = internalMutation({
  args: { owner: v.string(), id: v.string(), active: v.optional(v.boolean()), minScore: v.optional(v.number()), platforms: v.optional(v.array(platform)) },
  handler: async (ctx, args) => await updateCore(ctx, args.owner, args.id, args),
})
export const removeFor = internalMutation({ args: { owner: v.string(), id: v.string() }, handler: async (ctx, args) => await removeCore(ctx, args.owner, args.id) })
export const deliveriesFor = internalQuery({ args: { owner: v.string(), id: v.string() }, handler: async (ctx, args) => await deliveriesCore(ctx, args.owner, args.id) })
export const testFor = internalAction({
  args: { owner: v.string(), id: v.string() },
  handler: async (ctx, args): Promise<Outcome> => await runTest(ctx, args.owner, args.id),
})

// ---------------------------------------------------------------- sending

/** A match was just scored: queue a delivery for every active webhook of its owner that wants it. Cheap when there are none. */
export const fanOut = internalMutation({
  args: { hitId: v.id('hits') },
  handler: async (ctx, args) => {
    const hit = await ctx.db.get(args.hitId)
    if (!hit || hit.score === undefined) return null
    const hooks = await ctx.db.query('webhooks').withIndex('by_owner', q => q.eq('owner', hit.owner)).take(5)
    for (const hook of hooks) {
      if (!hook.active || hit.score < hook.minScore) continue
      if (hook.platforms !== undefined && !hook.platforms.includes(hit.platform)) continue
      const already = await ctx.db.query('webhookDeliveries').withIndex('by_webhook_and_hit', q => q.eq('webhookId', hook._id).eq('hitId', hit._id)).first()
      if (already) continue
      const deliveryId = await ctx.db.insert('webhookDeliveries', {
        owner: hit.owner, webhookId: hook._id, hitId: hit._id, event: 'match.created', status: 'pending', attempts: 0, updatedAt: Date.now(),
      })
      await ctx.scheduler.runAfter(0, internal.webhooks.deliver, { deliveryId })
    }
    return null
  },
})

export const startTest = internalMutation({
  args: { owner: v.string(), id: v.string() },
  handler: async (ctx, args): Promise<Id<'webhookDeliveries'>> => {
    const hook = await ownedWebhook(ctx, args.owner, args.id)
    return await ctx.db.insert('webhookDeliveries', { owner: args.owner, webhookId: hook._id, event: 'ping', status: 'pending', attempts: 0, updatedAt: Date.now() })
  },
})

/** What an attempt needs: where to send, the sealed secret, and the event's data. Reads only; the action does the sending. */
export const loadDelivery = internalQuery({
  args: { deliveryId: v.id('webhookDeliveries') },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId)
    if (!delivery) return null
    const hook = await ctx.db.get(delivery.webhookId)
    if (!hook) return null
    let data: unknown = { message: 'This is a test event from ListeningKit. Your receiver is working.' }
    if (delivery.event === 'match.created') {
      const hit = delivery.hitId ? await ctx.db.get(delivery.hitId) : null
      data = hit ? await apiMatch(ctx, hit) : null
    }
    return { event: delivery.event, url: hook.url, active: hook.active, sealed: { iv: hook.secretIv, data: hook.secretData }, data }
  },
})

export const recordAttempt = internalMutation({
  args: { deliveryId: v.id('webhookDeliveries'), ok: v.boolean(), statusCode: v.optional(v.number()), error: v.optional(v.string()), retry: v.boolean(), now: v.number() },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId)
    if (!delivery) return null
    const hook = await ctx.db.get(delivery.webhookId)
    const attempts = delivery.attempts + 1
    const base = { attempts, updatedAt: args.now, ...(args.statusCode === undefined ? {} : { statusCode: args.statusCode }) }
    if (args.ok) {
      await ctx.db.patch(delivery._id, { ...base, status: 'delivered', error: undefined })
      if (hook) await ctx.db.patch(hook._id, { failureStreak: 0, lastDeliveryAt: args.now })
      return null
    }
    if (args.retry && attempts < MAX_ATTEMPTS) {
      await ctx.db.patch(delivery._id, { ...base, status: 'pending', ...(args.error === undefined ? {} : { error: args.error }) })
      await ctx.scheduler.runAfter(RETRY_DELAYS_MS[attempts - 1], internal.webhooks.deliver, { deliveryId: args.deliveryId })
      return null
    }
    await ctx.db.patch(delivery._id, { ...base, status: 'failed', ...(args.error === undefined ? {} : { error: args.error }) })
    // A test that fails does not count against the webhook; only real deliveries do.
    if (hook && delivery.event === 'match.created') {
      const failureStreak = hook.failureStreak + 1
      await ctx.db.patch(hook._id, failureStreak >= DISABLE_AFTER && hook.active
        ? { failureStreak, active: false, disabledReason: `Switched off after ${failureStreak} failed deliveries in a row. Fix the receiver, then switch it back on.` }
        : { failureStreak })
    }
    return null
  },
})

export type Outcome = { delivered: boolean; statusCode?: number; error?: string }

/** One attempt: sign the event, POST it, never follow a redirect, never read what comes back. Errors are plain words with no bodies or secrets. */
async function attempt(ctx: ActionCtx, deliveryId: Id<'webhookDeliveries'>, retry: boolean): Promise<Outcome> {
  const loaded = await ctx.runQuery(internal.webhooks.loadDelivery, { deliveryId })
  const now = Date.now()
  const record = async (outcome: Outcome) => {
    await ctx.runMutation(internal.webhooks.recordAttempt, {
      deliveryId, ok: outcome.delivered, retry, now,
      ...(outcome.statusCode === undefined ? {} : { statusCode: outcome.statusCode }), ...(outcome.error === undefined ? {} : { error: outcome.error }),
    })
    return outcome
  }
  if (!loaded) return { delivered: false, error: 'the webhook no longer exists' }
  if (!loaded.active && loaded.event !== 'ping') return await record({ delivered: false, error: 'the webhook is switched off' })
  const checked = checkWebhookUrl(loaded.url)   // checked again at send time, not only when it was saved
  if (!checked.ok) return await record({ delivered: false, error: 'the address is not allowed' })
  if (loaded.event === 'match.created' && loaded.data === null) return await record({ delivered: false, error: 'the match no longer exists' })
  let secret: string
  try { secret = await decryptText(loaded.sealed) } catch { return await record({ delivered: false, error: 'the signing secret could not be read' }) }
  const body = JSON.stringify({ id: deliveryId, type: loaded.event, createdAt: new Date(now).toISOString(), data: loaded.data })
  const seconds = Math.floor(now / 1000)
  try {
    const res = await fetch(checked.url, {
      method: 'POST', redirect: 'manual', body, signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json', 'User-Agent': 'ListeningKit-Webhooks/1',
        'X-ListeningKit-Event': loaded.event, 'X-ListeningKit-Delivery': deliveryId, 'X-ListeningKit-Timestamp': String(seconds),
        'X-ListeningKit-Signature': await signPayload(secret, seconds, body),
      },
    })
    if (res.status >= 200 && res.status < 300) return await record({ delivered: true, statusCode: res.status })
    if (res.status >= 300 && res.status < 400) return await record({ delivered: false, statusCode: res.status, error: 'the address redirected, and redirects are not followed' })
    return await record({ delivered: false, statusCode: res.status, error: `the receiver answered HTTP ${res.status}` })
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
    return await record({ delivered: false, error: timedOut ? 'the receiver did not answer in 5 seconds' : 'could not connect to the receiver' })
  }
}

async function runTest(ctx: ActionCtx, owner: string, id: string): Promise<Outcome> {
  const deliveryId: Id<'webhookDeliveries'> = await ctx.runMutation(internal.webhooks.startTest, { owner, id })
  return await attempt(ctx, deliveryId, false)
}

/** Scheduled by fanOut and by its own retries. */
export const deliver = internalAction({
  args: { deliveryId: v.id('webhookDeliveries') },
  handler: async (ctx, args): Promise<Outcome> => await attempt(ctx, args.deliveryId, true),
})
