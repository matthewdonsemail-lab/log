import { feedApp } from './server'
import type { FeedResponse } from './mock'
import { isPlatform, type Platform } from '../platform'
import { fetchConvexFeed, fetchRemoteFeed, syncConvexFeed, syncRemoteFeed, type FeedSyncResult } from './remote'
import { apiMode } from '../transport'
import { convexUrl } from '../convex'

export * from './mock'
export { feedApp, type FeedApp } from './server'
export type { FeedSyncResult }

export interface FeedFilters {
  platform?: Platform
  search?: string
}

/** Preserve legacy arguments and upstream filters. Live mode never falls back to seeds. */
export async function getFeed(
  platformOrFilters?: Platform | string | FeedFilters,
  search?: string
): Promise<FeedResponse> {
  const platform = typeof platformOrFilters === 'string' ? platformOrFilters : platformOrFilters?.platform
  const query = typeof platformOrFilters === 'object' ? platformOrFilters.search ?? search : search
  if (platform && !isPlatform(platform)) throw new Error('platform must be facebook, x, or reddit')
  const params = new URLSearchParams()
  if (platform) params.set('platform', platform)
  if (query?.trim()) params.set('search', query.trim())
  const suffix = params.size ? `?${params}` : ''
  if (apiMode() === 'live') {
    if (convexUrl()) return fetchConvexFeed({ ...(platform && isPlatform(platform) ? { platform } : {}), ...(query?.trim() ? { search: query.trim() } : {}) })
    return fetchRemoteFeed(suffix)
  }
  const res = await feedApp.request(`/feed${suffix}`)
  if (!res.ok) throw new Error(`Feed request failed (${res.status})`)
  return await res.json() as FeedResponse
}

/** Live-only Reddit sync; mock mode has no server to sync through. */
export async function syncFeed(subreddit: string, limit = 25): Promise<FeedSyncResult> {
  const sub = subreddit.trim()
  if (!/^[A-Za-z0-9_]{1,21}$/.test(sub)) throw new Error('Subreddit must be 1-21 letters, numbers or underscores')
  if (apiMode() !== 'live') throw new Error('Live sync needs VITE_API_MODE=live')
  return convexUrl() ? syncConvexFeed(sub, limit) : syncRemoteFeed(sub, limit)
}
