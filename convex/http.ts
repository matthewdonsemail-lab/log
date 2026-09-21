import { registerStaticRoutes } from '@convex-dev/static-hosting'
import { httpActionGeneric, httpRouter, type GenericActionCtx, type GenericDataModel } from 'convex/server'
import { ConvexError } from 'convex/values'
import { components, internal } from './_generated/api'
import { RATE_LIMIT_PER_MINUTE } from './apiKeys'
import { MAX_POSTS_PER_BATCH } from './feed'
import { decryptText } from './lib/crypto'
import { sha256Hex } from './lib/hash'
import { normalizePushedPost, type NormalizedPost } from './lib/posts'
import { mayRead, proxyState } from './lib/proxy'
import { DEFAULT_MATCHES_PER_PAGE, MAX_MATCHES_PER_PAGE } from './publicApi'

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

// The phrases the local helper should search for, so it needs no login of its own beyond the ingest key.
http.route({
  path: '/phrases',
  method: 'GET',
  handler: httpActionGeneric(async (ctx, req) => {
    const secret = req.headers.get('Authorization')?.match(/^Bearer (lk_ingest_[A-Za-z0-9]{20,100})$/)?.[1]
    if (!secret) return json({ error: 'Authentication required' }, 401)
    const platform = new URL(req.url).searchParams.get('platform')
    if (!PLATFORMS.includes(platform as Platform)) return json({ error: 'platform must be facebook, x, or reddit' }, 400)
    try {
      const phrases = await ctx.runQuery(internal.keywords.forKey, { keyHash: await sha256Hex(secret), platform: platform as Platform })
      return json({ platform, phrases }, 200)
    } catch (error) {
      if (error instanceof ConvexError && error.data === 'Invalid ingest key') return json({ error: 'Invalid ingest key' }, 401)
      return json({ error: 'Could not load phrases' }, 500)
    }
  }),
})

// The proxy the helper must browse through. Only a valid ingest key gets it, and it is never logged or returned elsewhere.
http.route({
  path: '/proxy',
  method: 'GET',
  handler: httpActionGeneric(async (ctx, req) => {
    const secret = req.headers.get('Authorization')?.match(/^Bearer (lk_ingest_[A-Za-z0-9]{20,100})$/)?.[1]
    if (!secret) return json({ error: 'Authentication required' }, 401)
    try {
      await ctx.runQuery(internal.ingest.verifyKey, { keyHash: await sha256Hex(secret) })
    } catch (error) {
      if (error instanceof ConvexError && error.data === 'Invalid ingest key') return json({ error: 'Invalid ingest key' }, 401)
      return json({ error: 'Could not check the key' }, 500)
    }
    const state = proxyState({ PROXY_URL: process.env.PROXY_URL, PROXY_REQUIRED: process.env.PROXY_REQUIRED })
    if (!mayRead(state)) return json({ error: 'Reading is paused until the operator sets up the proxy' }, 503)
    return json({ required: state.required, proxy: state.proxy }, 200)
  }),
})

// ---- The public read API: /api/v1, authenticated with a key made in the dashboard (Authorization: Bearer lk_api_...). ----

class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message) }
}

function apiJson(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  })
}

function apiFailure(error: ApiError, extra: Record<string, string> = {}): Response {
  return apiJson({ error: { code: error.code, message: error.message } }, error.status, extra)
}

/** A whole number within a range, or a plain-words 400. */
function wholeParam(url: URL, name: string, min: number, max: number): number | undefined {
  const raw = url.searchParams.get(name)
  if (raw === null || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isInteger(n) || n < min || n > max) throw new ApiError(400, 'invalid_parameter', `${name} must be a whole number from ${min} to ${max}`)
  return n
}

/** A non-negative number (the cursor: a creation time, which has fractions of a millisecond), or a plain-words 400. */
function cursorParam(url: URL): number | undefined {
  const raw = url.searchParams.get('before')
  if (raw === null || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) throw new ApiError(400, 'invalid_parameter', 'before must be the nextCursor from the previous page')
  return n
}

/** Checks the key, counts the request against its allowance, runs the handler, and shapes every failure the same way. */
async function apiRoute(ctx: GenericActionCtx<GenericDataModel>, req: Request, handler: (owner: string, url: URL) => Promise<unknown>): Promise<Response> {
  try {
    const secret = req.headers.get('Authorization')?.match(/^Bearer (lk_api_[A-Za-z0-9]{20,100})$/)?.[1]
    if (!secret) throw new ApiError(401, 'unauthorized', 'Send your API key as: Authorization: Bearer lk_api_...')
    const now = Date.now()
    let owner: string
    let remaining: number
    try {
      ;({ owner, remaining } = await ctx.runMutation(internal.apiKeys.authenticate, { keyHash: await sha256Hex(secret), now }))
    } catch (error) {
      if (error instanceof ConvexError && error.data === 'Rate limited') {
        const retry = String(60 - Math.floor((now % 60_000) / 1000))
        throw Object.assign(new ApiError(429, 'rate_limited', `Too many requests: ${RATE_LIMIT_PER_MINUTE} per minute per key`), { retry })
      }
      if (error instanceof ConvexError && error.data === 'Invalid API key') throw new ApiError(401, 'unauthorized', 'That API key is not valid, or it was revoked')
      throw new ApiError(500, 'server_error', 'Could not check the key')
    }
    const data = await handler(owner, new URL(req.url))
    return apiJson(data, 200, { 'X-RateLimit-Limit': String(RATE_LIMIT_PER_MINUTE), 'X-RateLimit-Remaining': String(remaining) })
  } catch (error) {
    if (error instanceof ApiError) {
      const retry = (error as ApiError & { retry?: string }).retry
      return apiFailure(error, retry ? { 'Retry-After': retry } : {})
    }
    console.error('api: request failed', error instanceof Error ? error.message : error)
    return apiFailure(new ApiError(500, 'server_error', 'Something went wrong on our side'))
  }
}

http.route({
  path: '/api/v1/me',
  method: 'GET',
  handler: httpActionGeneric(async (ctx, req) => apiRoute(ctx, req, async owner => ({ data: await ctx.runQuery(internal.publicApi.meFor, { owner }) }))),
})

http.route({
  path: '/api/v1/keywords',
  method: 'GET',
  handler: httpActionGeneric(async (ctx, req) => apiRoute(ctx, req, async owner => ({ data: await ctx.runQuery(internal.publicApi.keywordsFor, { owner }) }))),
})

http.route({
  path: '/api/v1/matches',
  method: 'GET',
  handler: httpActionGeneric(async (ctx, req) => apiRoute(ctx, req, async (owner, url) => {
    const platform = url.searchParams.get('platform')
    if (platform !== null && !PLATFORMS.includes(platform as Platform)) throw new ApiError(400, 'invalid_parameter', 'platform must be reddit, x or facebook')
    return await ctx.runQuery(internal.publicApi.matchesFor, {
      owner,
      ...(platform === null ? {} : { platform: platform as Platform }),
      ...(wholeParam(url, 'min_score', 0, 100) === undefined ? {} : { minScore: wholeParam(url, 'min_score', 0, 100) as number }),
      ...(cursorParam(url) === undefined ? {} : { before: cursorParam(url) as number }),
      limit: wholeParam(url, 'limit', 1, MAX_MATCHES_PER_PAGE) ?? DEFAULT_MATCHES_PER_PAGE,
    })
  })),
})

// The website itself. Exact routes above win over this catch-all.
registerStaticRoutes(http, components.staticHosting)

export default http
