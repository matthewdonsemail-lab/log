import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { MOCK_FEED_ITEMS, type FeedItem } from './mock'
import { isPlatform } from '../platform'
import { FeedResponseJson, errorResponse } from '../openapi'

/** Case-insensitive substring match across the searchable text of an item. */
function matchesSearch(item: FeedItem, search: string): boolean {
  const needle = search.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    item.authorName,
    item.handle ?? '',
    item.community ?? '',
    item.title ?? '',
    ...item.body,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

function filterFeed(platform?: string, search?: string): FeedItem[] {
  let items = [...MOCK_FEED_ITEMS]
  if (platform !== undefined && platform !== '') {
    if (!isPlatform(platform)) return []
    items = items.filter((item) => item.platform === platform)
  }
  if (search !== undefined && search.trim() !== '') {
    items = items.filter((item) => matchesSearch(item, search))
  }
  return items
}

/**
 * Hono-shaped feed API. Backed by mock rows for now — when the real backend
 * lands, point the client at it; routes and response shapes stay the same.
 * `GET /feed` supports `?platform=` and `?search=` so the tab bar and the
 * search box filter server-side; `GET /feed/:platform` stays as the
 * per-platform shortcut (also with optional `?search=`).
 */
export const feedApp = new Hono()
  .get('/feed', describeRoute({ operationId: 'listFeed', tags: ['Feed'], summary: 'List feed', description: 'Optional ?platform ?search. Code: apps/web/src/lib/feed/server.ts:41', parameters: [{ name: 'platform', in: 'query', required: false, schema: { type: 'string', enum: ['facebook','x','reddit'] } }, { name: 'search', in: 'query', required: false, schema: { type: 'string' } }], responses: { 200: { description: 'Feed items.', content: { 'application/json': { schema: FeedResponseJson } } }, 400: errorResponse('platform must be facebook, x, or reddit') } }), (c) => {
    const platform = c.req.query('platform')
    const search = c.req.query('search')
    if (platform !== undefined && platform !== '' && !isPlatform(platform)) {
      return c.json({ error: 'platform must be facebook, x, or reddit' }, 400)
    }
    return c.json({ items: filterFeed(platform, search) })
  })
  .get('/feed/:platform', describeRoute({ operationId: 'listFeedByPlatform', tags: ['Feed'], summary: 'List feed by platform', description: 'Code: apps/web/src/lib/feed/server.ts:49', parameters: [{ name: 'platform', in: 'path', required: true, schema: { type: 'string', enum: ['facebook','x','reddit'] } }, { name: 'search', in: 'query', required: false, schema: { type: 'string' } }], responses: { 200: { description: 'Feed items.', content: { 'application/json': { schema: FeedResponseJson } } }, 400: errorResponse('platform must be facebook, x, or reddit') } }), (c) => {
    const platform = c.req.param('platform')
    const search = c.req.query('search')
    if (!isPlatform(platform)) {
      return c.json({ error: 'platform must be facebook, x, or reddit' }, 400)
    }
    return c.json({ items: filterFeed(platform, search) })
  })

export type FeedApp = typeof feedApp
