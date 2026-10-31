import { z } from 'zod'
import {
  convexClient, convexErrorMessage, convexUrl,
  keywordsCreateRef, keywordsListRef, keywordsRemoveRef, keywordsSetStatusRef,
} from './convex'
import type { Keyword } from './keywords/types'
import type { Platform } from './platform'
import { apiMode } from './transport'

const platformSchema = z.enum(['facebook', 'x', 'reddit'])

export const liveKeywordSchema = z.object({
  id: z.string(),
  phrase: z.string(),
  platform: platformSchema,
  status: z.enum(['listening', 'paused']),
  subreddit: z.string().nullable(),
  signalsCount: z.number().finite(),
  addedAt: z.number().finite(),
  lastCheckedAt: z.number().finite().nullable(),
  lastSource: z.enum(['reddit', 'mirror', 'helper']).nullable(),
})
export const liveKeywordsSchema = z.object({ keywords: z.array(liveKeywordSchema) })

export const liveHitsSchema = z.object({
  hits: z.array(z.object({
    id: z.string(),
    phrase: z.string(),
    platform: platformSchema,
    matchedAt: z.number().finite(),
    score: z.number().finite().nullable(),
    intent: z.string().nullable(),
    reason: z.string().nullable(),
    post: z.object({
      id: z.string(),
      title: z.string().nullable(),
      authorName: z.string(),
      url: z.string(),
      snippet: z.string().nullable(),
      timestamp: z.string().nullable(),
    }),
  })),
})

export type LiveKeyword = z.infer<typeof liveKeywordSchema>
export type LiveHit = z.infer<typeof liveHitsSchema>['hits'][number]

/** Keywords live in Convex only in live mode with a deployment configured. */
export function keywordsOnConvex(): boolean {
  return apiMode() === 'live' && convexUrl() !== undefined
}

/** The dashboard's Keyword shape; a Reddit phrase's subreddit rides in `groupId`. */
export function toKeyword(row: LiveKeyword): Keyword {
  return {
    id: row.id, phrase: row.phrase, platform: row.platform, status: row.status,
    signalsCount: row.signalsCount, addedAt: new Date(row.addedAt).toISOString(), groupId: row.subreddit,
  }
}

export function parseKeywords(data: unknown): LiveKeyword[] {
  const parsed = liveKeywordsSchema.safeParse(data)
  if (!parsed.success) throw new Error('Keywords returned an invalid response')
  return parsed.data.keywords
}

export async function listLiveKeywords(): Promise<LiveKeyword[]> {
  const client = await convexClient()
  let data: unknown
  try { data = await client.query(keywordsListRef, {}) } catch (error) {
    throw convexErrorMessage(error, 'Could not load your phrases')
  }
  return parseKeywords(data)
}

export async function createLiveKeyword(input: { phrase: string; platform: Platform; subreddit?: string }): Promise<LiveKeyword> {
  const client = await convexClient()
  let data: unknown
  try { data = await client.mutation(keywordsCreateRef, input) } catch (error) {
    throw convexErrorMessage(error, 'Could not add the phrase')
  }
  const parsed = z.object({ keyword: liveKeywordSchema }).safeParse(data)
  if (!parsed.success) throw new Error('Adding the phrase returned an invalid response')
  return parsed.data.keyword
}

export async function setLiveKeywordStatus(id: string, status: 'listening' | 'paused'): Promise<void> {
  const client = await convexClient()
  try { await client.mutation(keywordsSetStatusRef, { id, status }) } catch (error) {
    throw convexErrorMessage(error, 'Could not update the phrase')
  }
}

export async function removeLiveKeyword(id: string): Promise<void> {
  const client = await convexClient()
  try { await client.mutation(keywordsRemoveRef, { id }) } catch (error) {
    throw convexErrorMessage(error, 'Could not remove the phrase')
  }
}

const INTENT_WORDS: Record<string, string> = {
  looking_for_help: 'Wants help',
  buying: 'Ready to buy',
  complaint: 'Complaint',
  promotion: 'Promotion',
  discussion: 'Discussion',
  other: 'Other',
}

/** Plain words for what the AI thinks the author wants. */
export function intentLabel(intent: string | null): string {
  return (intent && INTENT_WORDS[intent]) || 'Other'
}

/** Strong 70+, maybe 40-69, weak below. Mirrors `band` in convex/lib/scoring.ts. */
export function scoreBand(score: number): 'strong' | 'maybe' | 'weak' {
  return score >= 70 ? 'strong' : score >= 40 ? 'maybe' : 'weak'
}

/** "Best first" puts scored matches on top, highest score first; unscored ones keep their newest-first order after. */
export function sortHits(hits: LiveHit[], order: 'newest' | 'best'): LiveHit[] {
  if (order === 'newest') return hits
  return [...hits].sort((a, b) => {
    if (a.score === null && b.score === null) return b.matchedAt - a.matchedAt
    if (a.score === null) return 1
    if (b.score === null) return -1
    return b.score - a.score || b.matchedAt - a.matchedAt
  })
}
