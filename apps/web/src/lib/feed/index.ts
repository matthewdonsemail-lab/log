import { feedApp } from './server'
import type { FeedResponse } from './mock'
import type { Platform } from '../platform'

export * from './mock'
export { feedApp, type FeedApp } from './server'

export interface FeedFilters {
  platform?: Platform
  search?: string
}

/**
 * Fetch the feed through the Hono app (in-memory mock for now).
 * Accepts a legacy platform string, or `{ platform, search }` for
 * server-side filtering — `GET /feed?platform=x&search=leak`.
 */
export async function getFeed(
  platformOrFilters?: Platform | string | FeedFilters,
  search?: string
): Promise<FeedResponse> {
  let platform: string | undefined
  let query: string | undefined
  if (typeof platformOrFilters === 'string') {
    platform = platformOrFilters
    query = search
  } else if (platformOrFilters) {
    platform = platformOrFilters.platform
    query = platformOrFilters.search ?? search
  }
  const params = new URLSearchParams()
  if (platform) params.set('platform', platform)
  if (query?.trim()) params.set('search', query.trim())
  const suffix = params.size > 0 ? `?${params.toString()}` : ''
  const res = await feedApp.request(`/feed${suffix}`)
  if (!res.ok) throw new Error(`Feed request failed (${res.status})`)
  return (await res.json()) as FeedResponse
}
