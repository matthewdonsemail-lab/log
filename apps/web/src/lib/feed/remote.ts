import { z } from 'zod'
import type { FeedResponse } from './mock'
import { apiRequest } from '../transport'

/** Only the unified API is browser-facing. Platform credentials belong on the server. */
export const remoteFeedSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    platform: z.enum(['facebook', 'x', 'reddit']),
    variant: z.enum(['post-text', 'post-image', 'comment']),
    authorName: z.string(),
    handle: z.string().optional(),
    community: z.string().optional(),
    timeAgo: z.string(),
    timestamp: z.string().optional(),
    title: z.string().optional(),
    body: z.array(z.string()),
    imageSrc: z.string().optional(),
    avatarUrl: z.string().optional(),
    likes: z.number().finite(),
    comments: z.number().finite(),
    shares: z.number().finite().optional(),
    views: z.number().finite().optional(),
    replies: z.number().finite().optional(),
    reposts: z.number().finite().optional(),
  }))
})

export async function fetchRemoteFeed(suffix: string): Promise<FeedResponse> {
  const res = await apiRequest(`/feed${suffix}`)
  if (!res.ok) throw new Error(`Live feed request failed (${res.status})`)
  const parsed = remoteFeedSchema.safeParse(await res.json())
  if (!parsed.success) throw new Error('Live feed returned an invalid response')
  return parsed.data
}

export const remoteSyncSchema = z.object({
  accountId: z.string(),
  fetched: z.number().int(),
  ingested: z.number().int(),
  skipped: z.number().int(),
})

export type FeedSyncResult = z.infer<typeof remoteSyncSchema>

/** Pull the newest posts from one public subreddit into the caller's live feed. */
export async function syncRemoteFeed(subreddit: string, limit = 25): Promise<FeedSyncResult> {
  const res = await apiRequest('/feed/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subreddit, limit }),
  })
  if (!res.ok) throw new Error(`Live sync failed (${res.status})`)
  const parsed = remoteSyncSchema.safeParse(await res.json())
  if (!parsed.success) throw new Error('Live sync returned an invalid response')
  return parsed.data
}
