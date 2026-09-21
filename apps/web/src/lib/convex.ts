import { ConvexHttpClient } from 'convex/browser'
import { ConvexReactClient } from 'convex/react'
import { makeFunctionReference } from 'convex/server'
import { ConvexError } from 'convex/values'
import type { Platform } from './platform'
import { requireApiToken } from './transport'

/** Public deployment URL. Set with VITE_API_MODE=live to skip the Hono bridge. */
export function convexUrl(): string | undefined {
  const url: unknown = import.meta.env.VITE_CONVEX_URL
  return typeof url === 'string' && url.trim() ? url.trim() : undefined
}

/** One websocket client for live queries; null when the app runs on the bridge or mocks. */
const url = convexUrl()
export const convexReactClient = url ? new ConvexReactClient(url) : null

// Results are unknown on purpose: each caller validates the wire shape with zod.
export const feedListRef = makeFunctionReference<'query', { platform?: Platform; search?: string }, unknown>('feed:list')
export const syncSubredditRef = makeFunctionReference<'action', { subreddit: string; limit?: number }, unknown>('reddit:syncSubreddit')
export const accountsListRef = makeFunctionReference<'query', Record<string, never>, unknown>('accounts:list')
export const accountsCreateRef = makeFunctionReference<'mutation', { platform: Platform; label: string }, unknown>('accounts:createWithResponse')

export const keywordsListRef = makeFunctionReference<'query', Record<string, never>, unknown>('keywords:list')
export const keywordsCreateRef = makeFunctionReference<'mutation', { phrase: string; platform: Platform; subreddit?: string }, unknown>('keywords:create')
export const keywordsSetStatusRef = makeFunctionReference<'mutation', { id: string; status: 'listening' | 'paused' }, unknown>('keywords:setStatus')
export const keywordsRemoveRef = makeFunctionReference<'mutation', { id: string }, unknown>('keywords:remove')
export const hitsListRef = makeFunctionReference<'query', Record<string, never>, unknown>('hits:list')
export const sessionsSaveRef = makeFunctionReference<'mutation', { token: string }, unknown>('sessions:save')
export const sessionsListRef = makeFunctionReference<'query', Record<string, never>, unknown>('sessions:list')
export const sessionsRemoveRef = makeFunctionReference<'mutation', { platform: Platform }, unknown>('sessions:remove')
export const brandExtractRef = makeFunctionReference<'action', { url: string }, unknown>('brand:extractFromWebsite')
export const alertsMineRef = makeFunctionReference<'query', Record<string, never>, unknown>('alerts:mine')
export const alertsSaveRef = makeFunctionReference<'mutation', { email: string; enabled: boolean; minScore: number }, unknown>('alerts:save')
export const alertsSendTestRef = makeFunctionReference<'action', Record<string, never>, unknown>('alerts:sendTest')
export const planMineRef = makeFunctionReference<'query', Record<string, never>, unknown>('plan:mine')
export const ingestListRef = makeFunctionReference<'query', Record<string, never>, unknown>('ingest:listKeys')
export const ingestCreateRef = makeFunctionReference<'mutation', { label: string }, unknown>('ingest:createKey')
export const ingestRevokeRef = makeFunctionReference<'mutation', { id: string }, unknown>('ingest:revokeKey')

/** Public HTTP endpoint host for the deployment: `<name>.convex.cloud` serves `<name>.convex.site`. */
export function convexSiteUrl(): string | undefined {
  const deployment = convexUrl()
  return deployment?.replace(/\.convex\.cloud\/?$/, '.convex.site')
}

/** One-shot authenticated client; the Clerk token is fetched per call so it never goes stale. */
export async function convexClient(): Promise<ConvexHttpClient> {
  const deployment = convexUrl()
  if (!deployment) throw new Error('VITE_CONVEX_URL is not set')
  const client = new ConvexHttpClient(deployment)
  client.setAuth(await requireApiToken())
  return client
}

/** Surfaces a ConvexError's own message; anything else stays generic. */
export function convexErrorMessage(error: unknown, fallback: string): Error {
  if (error instanceof ConvexError && typeof error.data === 'string') return new Error(error.data)
  return new Error(fallback)
}
