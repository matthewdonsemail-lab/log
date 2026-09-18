import { httpActionGeneric, httpRouter } from 'convex/server'
import { ConvexError } from 'convex/values'
import { internal } from './_generated/api'
import { MAX_POSTS_PER_BATCH } from './feed'
import { decryptText } from './lib/crypto'
import { sha256Hex } from './lib/hash'
import { normalizePushedPost, type NormalizedPost } from './lib/posts'

const PLATFORMS = ['facebook', 'x', 'reddit'] as const
type Platform = typeof PLATFORMS[number]

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

const http = httpRouter()

// Server-to-server push for the platform clients: Authorization: Bearer lk_ingest_…
http.route({
  path: '/ingest',
  method: 'POST',
  handler: httpActionGeneric(async (ctx, req) => {
    const secret = req.headers.get('Authorization')?.match(/^Bearer (lk_ingest_[A-Za-z0-9]{20,100})$/)?.[1]
    if (!secret) return json({ error: 'Authentication required' }, 401)
    const input: unknown = await req.json().catch(() => null)
    if (typeof input !== 'object' || input === null) return json({ error: 'Expected a JSON object' }, 400)
    const { platform, posts } = input as { platform?: unknown; posts?: unknown }
    if (!PLATFORMS.includes(platform as Platform)) return json({ error: 'platform must be facebook, x, or reddit' }, 400)
    if (!Array.isArray(posts) || posts.length < 1 || posts.length > MAX_POSTS_PER_BATCH) {
      return json({ error: `posts must be an array of 1-${MAX_POSTS_PER_BATCH} items` }, 400)
    }
    const valid = posts.map(normalizePushedPost).filter((post): post is NormalizedPost => post !== null)
    const skipped = posts.length - valid.length
    if (valid.length === 0) return json({ error: 'No valid posts in the batch', skipped }, 422)
    try {
      const result = await ctx.runMutation(internal.ingest.commit, {
        keyHash: await sha256Hex(secret), platform: platform as Platform, posts: valid,
      })
      return json({ accountId: result.accountId, ingested: result.processed, skipped }, 200)
    } catch (error) {
      if (error instanceof ConvexError && error.data === 'Invalid ingest key') return json({ error: 'Invalid ingest key' }, 401)
      return json({ error: 'Ingest failed' }, 500)
    }
  }),
})

// Local platform clients fetch the login you connected in the dashboard, instead of a cookies file.
http.route({
  path: '/session',
  method: 'GET',
  handler: httpActionGeneric(async (ctx, req) => {
    const secret = req.headers.get('Authorization')?.match(/^Bearer (lk_ingest_[A-Za-z0-9]{20,100})$/)?.[1]
    if (!secret) return json({ error: 'Authentication required' }, 401)
    const platform = new URL(req.url).searchParams.get('platform')
    if (!PLATFORMS.includes(platform as Platform)) return json({ error: 'platform must be facebook, x, or reddit' }, 400)
    try {
      const sealed = await ctx.runQuery(internal.sessions.sealedForKey, { keyHash: await sha256Hex(secret), platform: platform as Platform })
      if (!sealed) return json({ error: `No ${platform} account is connected` }, 404)
      const cookies = JSON.parse(await decryptText(sealed)) as unknown
      return json({ platform, cookies, expiresAt: sealed.expiresAt }, 200)
    } catch (error) {
      if (error instanceof ConvexError && error.data === 'Invalid ingest key') return json({ error: 'Invalid ingest key' }, 401)
      return json({ error: 'Could not read the saved login' }, 500)
    }
  }),
})

export default http
