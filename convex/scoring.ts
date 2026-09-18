import { getServiceToken } from 'convex/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import type { ActionCtx } from './_generated/server'
import { subredditOf } from './lib/match'
import { buildMessages, parseScore, resolveProvider, scoringEnabled, type Provider, type Score } from './lib/scoring'
import { internalAction, internalMutation, internalQuery } from './lib/server'

const MAX_ATTEMPTS = 3
const BACKFILL_BATCH = 20
const PARALLEL = 4

type Row = { hitId: Id<'hits'>; phrase: string; title: string | null; body: string | null; subreddit: string | null }
type Outcome = { hitId: Id<'hits'>; score?: Score }
type Summary = { scored: number; failed: number; skipped?: string }

/** One model call, to OpenAI directly or through the Convex AI Gateway (both speak the same chat format). */
export async function askModel(fetcher: typeof fetch, provider: Provider, token: string, row: Omit<Row, 'hitId'>): Promise<Score> {
  const res = await fetcher(provider.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: provider.model,
      messages: buildMessages(row.phrase, { title: row.title, body: row.body, subreddit: row.subreddit }),
      ...(provider.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(25_000),
  })
  // Never include the response body or headers in an error: they can echo credentials.
  if (!res.ok) throw new Error(`${provider.label} answered HTTP ${res.status}`)
  const data = (await res.json()) as { choices?: { message?: { content?: unknown } }[] }
  const content = data.choices?.[0]?.message?.content
  const score = typeof content === 'string' ? parseScore(content) : null
  if (!score) throw new Error('The model did not return a usable score')
  return score
}

/** Score rows a few at a time. A failed row is reported, never thrown, so one bad reply cannot stop the rest. */
export async function scoreRows(fetcher: typeof fetch, provider: Provider, token: string, rows: Row[]): Promise<Outcome[]> {
  const outcomes: Outcome[] = []
  for (let i = 0; i < rows.length; i += PARALLEL) {
    const settled = await Promise.all(rows.slice(i, i + PARALLEL).map(async (row): Promise<Outcome> => {
      try { return { hitId: row.hitId, score: await askModel(fetcher, provider, token, row) } } catch (error) {
        console.error('scoring: one match failed', error instanceof Error ? error.message : error)
        return { hitId: row.hitId }
      }
    }))
    outcomes.push(...settled)
  }
  return outcomes
}

/** Matches still waiting for a score, with the post text the model needs. */
export const forScoring = internalQuery({
  args: { hitIds: v.array(v.id('hits')) },
  handler: async (ctx, args): Promise<Row[]> => {
    const rows: Row[] = []
    for (const hitId of args.hitIds) {
      const hit = await ctx.db.get(hitId)
      if (!hit || hit.scoredAt !== undefined || (hit.scoreAttempts ?? 0) >= MAX_ATTEMPTS) continue
      const post = await ctx.db.get(hit.postId)
      if (!post) continue
      rows.push({
        hitId, phrase: hit.phrase, title: post.title ?? null, body: post.body.join('\n') || null,
        subreddit: post.platform === 'reddit' ? subredditOf(post.url) : null,
      })
    }
    return rows
  },
})

export const unscored = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, args): Promise<Id<'hits'>[]> => {
    const rows = await ctx.db.query('hits').withIndex('by_scoredAt', q => q.eq('scoredAt', undefined)).order('desc').take(args.limit * 2)
    return rows.filter(row => (row.scoreAttempts ?? 0) < MAX_ATTEMPTS).slice(0, args.limit).map(row => row._id)
  },
})

export const save = internalMutation({
  args: {
    model: v.string(),
    results: v.array(v.object({
      hitId: v.id('hits'), score: v.optional(v.number()), intent: v.optional(v.string()), reason: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    for (const result of args.results) {
      const hit = await ctx.db.get(result.hitId)
      if (!hit) continue
      if (result.score === undefined) {
        await ctx.db.patch(hit._id, { scoreAttempts: (hit.scoreAttempts ?? 0) + 1 })
      } else {
        await ctx.db.patch(hit._id, {
          score: result.score, intent: result.intent, reason: result.reason, scoredAt: Date.now(), scoreModel: args.model,
        })
      }
    }
    return null
  },
})

/** The credential for this provider, or null when it is unavailable. The token is never logged or returned. */
async function tokenFor(provider: Provider): Promise<string | null> {
  if (provider.label === 'openai') return process.env.OPENAI_API_KEY ?? null
  try { return await getServiceToken('ai-gateway') } catch (error) {
    console.error('scoring: AI gateway unavailable', error instanceof Error ? error.message : error)
    return null
  }
}

/** Score the given matches and store the results. An unavailable gateway is reported, not thrown, and retried by the backfill. */
async function scoreAndStore(ctx: ActionCtx, hitIds: Id<'hits'>[]): Promise<Summary> {
  if (!scoringEnabled()) return { scored: 0, failed: 0, skipped: 'scoring is switched off' }
  const rows: Row[] = await ctx.runQuery(internal.scoring.forScoring, { hitIds })
  if (rows.length === 0) return { scored: 0, failed: 0 }
  const provider = resolveProvider()
  const token = await tokenFor(provider)
  if (token === null) return { scored: 0, failed: 0, skipped: 'no AI provider is available (set OPENAI_API_KEY)' }
  const outcomes = await scoreRows(fetch, provider, token, rows)
  await ctx.runMutation(internal.scoring.save, {
    model: `${provider.label}:${provider.model}`,
    results: outcomes.map(o => o.score
      ? { hitId: o.hitId, score: o.score.score, intent: o.score.intent, reason: o.score.reason }
      : { hitId: o.hitId }),
  })
  return { scored: outcomes.filter(o => o.score).length, failed: outcomes.filter(o => !o.score).length }
}

/** Scheduled right after new matches are recorded. */
export const scoreHits = internalAction({
  args: { hitIds: v.array(v.id('hits')) },
  handler: async (ctx, args): Promise<Summary> => await scoreAndStore(ctx, args.hitIds),
})

/** Safety net every 10 minutes: score any match the scheduled run missed (gateway blip, large batch). */
export const backfill = internalAction({
  args: {},
  handler: async (ctx): Promise<Summary> => {
    if (!scoringEnabled()) return { scored: 0, failed: 0, skipped: 'scoring is switched off' }
    return await scoreAndStore(ctx, await ctx.runQuery(internal.scoring.unscored, { limit: BACKFILL_BATCH }))
  },
})

/** Operator check that touches no data: `convex run scoring:tryScore '{"phrase":"...","title":"..."}'`. */
export const tryScore = internalAction({
  args: { phrase: v.string(), title: v.optional(v.string()), body: v.optional(v.string()) },
  handler: async (_ctx, args): Promise<{ provider: string; model: string; score: Score }> => {
    const provider = resolveProvider()
    const token = await tokenFor(provider)
    if (token === null) throw new Error('No AI provider is available: set OPENAI_API_KEY, or enable the Convex AI Gateway')
    const score = await askModel(fetch, provider, token, { phrase: args.phrase, title: args.title ?? null, body: args.body ?? null, subreddit: null })
    return { provider: provider.label, model: provider.model, score }
  },
})
