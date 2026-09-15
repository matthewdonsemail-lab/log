import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { MOCK_CONNECTIONS } from '../connections/mock'
import type { ConnectionPlatform } from '../connections'
import {
  COMMUNITIES_BASE,
  communityFromGroupUrl,
  communityFromSubreddit,
  parseFacebookGroupUrl,
  parseSubredditName,
  resolveAccountLabel,
  SEED_JOINED,
} from './mock'
import type { Community, CommunityJoinState } from './types'
import { isArray, isRecord, loadPersistedState, savePersistedState } from '../persist'
import { CommunitiesResponseJson, CommunityResponseJson, CommunitySingleResponseJson, errorResponse } from '../openapi'
import { requestLogger } from '../request-log'

/**
 * In-memory join relation for the communities API. Membership is the only
 * mutable state; the seed catalog never changes, but pasted group links can
 * register new rows (the stand-in for the facebook client resolving an
 * unknown group URL).
 *
 * A join request moves `none → pending → accepted`. `pending` is the
 * "waiting on the group to accept you" path; `accepted` is a real member.
 * Leaving (DELETE) returns the row to `none`.
 */
type BaseCommunity = (typeof COMMUNITIES_BASE)[number]

type JoinState = { state: CommunityJoinState; accountId: string | null; answers: string[] }

const CATALOG_KEY = 'communities.catalog'
const JOINS_KEY = 'communities.joins'

function isBaseCommunityArray(value: unknown): value is BaseCommunity[] {
  return (
    isArray(value) &&
    value.every(
      (row) =>
        isRecord(row) &&
        typeof row.id === 'string' &&
        typeof row.platform === 'string' &&
        typeof row.name === 'string'
    )
  )
}

function isJoinStateRecord(value: unknown): value is Record<string, JoinState> {
  if (!isRecord(value)) return false
  return Object.values(value).every(
    (row) =>
      isRecord(row) &&
      (row.state === 'none' || row.state === 'pending' || row.state === 'accepted') &&
      (row.accountId === null || typeof row.accountId === 'string') &&
      isArray(row.answers) &&
      row.answers.every((answer) => typeof answer === 'string')
  )
}

/**
 * The catalog starts with the seeds plus any client-resolved rows from a
 * previous session; the joins map likewise rehydrates. Both persist on
 * every mutation below, so joins, answers and resolved groups survive a
 * refresh instead of resetting to seeds.
 */
const catalog: BaseCommunity[] =
  loadPersistedState(CATALOG_KEY, isBaseCommunityArray) ?? [...COMMUNITIES_BASE]

function createJoinState(): Record<string, JoinState> {
  const state: Record<string, JoinState> = {}
  for (const community of catalog)
    state[community.id] = { state: 'none', accountId: null, answers: [] }
  for (const seed of SEED_JOINED) {
    if (state[seed.id]) state[seed.id] = { state: seed.state, accountId: seed.accountId, answers: [] }
  }
  return state
}

const joins: Record<string, JoinState> =
  loadPersistedState(JOINS_KEY, isJoinStateRecord) ?? createJoinState()

function persistCommunities(): void {
  savePersistedState(CATALOG_KEY, catalog)
  savePersistedState(JOINS_KEY, joins)
}

function findBaseById(id: string): BaseCommunity | undefined {
  return catalog.find((row) => row.id === id)
}

function findBaseByUrl(url: string): BaseCommunity | undefined {
  return catalog.find((row) => row.url === url)
}

/** Register a client-resolved row (pasted link, typed subreddit, …). */
function registerRow(row: BaseCommunity): BaseCommunity {
  let id = row.id
  let suffix = 2
  while (catalog.some((existing) => existing.id === id)) {
    id = `${row.id}-${suffix}`
    suffix += 1
  }
  const registered: BaseCommunity = { ...row, id }
  catalog.push(registered)
  joins[registered.id] = { state: 'none', accountId: null, answers: [] }
  return registered
}

/** Register a pasted group link as a tracked community (mock resolution). */
function registerBase(parsed: { slug: string; url: string }): BaseCommunity {
  return registerRow(communityFromGroupUrl(parsed))
}

function findRedditBase(key: string, url: string): BaseCommunity | undefined {
  const lowerUrl = url.toLowerCase()
  return catalog.find(
    (row) =>
      row.platform === 'reddit' &&
      (row.url?.toLowerCase() === lowerUrl || row.handle.toLowerCase() === `r/${key}`)
  )
}

function materialize(id?: string): Community | Community[] {
  const all: Community[] = catalog.map((base) => {
    const state = joins[base.id]
    // The account relation only exists for facebook — subreddits and X
    // communities are joined without an account.
    const accountId =
      base.platform === 'facebook' && state?.state !== 'none' ? (state.accountId ?? null) : null
    return {
      ...base,
      joinState: state?.state ?? 'none',
      accountId,
      accountLabel: resolveAccountLabel(accountId),
      answers: state?.answers ?? [],
    }
  })
  return id ? (all.find((community) => community.id === id) ?? []) : all
}

/**
 * Shared join transition for both routes below: facebook entry gates on a
 * connected account (→ pending), other platforms accept immediately.
 * Returns the error payload or the id to materialize.
 */
async function transitionToJoined(
  base: BaseCommunity,
  body: { accountId?: string; answers?: string[] } | null
): Promise<{ error: string; status: 400 } | { ok: true }> {
  if (base.platform === 'facebook') {
    const account =
      (body?.accountId ? MOCK_CONNECTIONS.find((a) => a.id === body.accountId) : undefined) ?? null
    if (!account || account.platform !== 'facebook') {
      return { error: 'Facebook groups must be joined with a connected Facebook account', status: 400 }
    }
    // Entry questions gate the request — every one needs an answer.
    const answers = Array.isArray(body?.answers) ? body.answers.map(String) : []
    if (
      base.entryQuestions.length > 0 &&
      (answers.length !== base.entryQuestions.length || answers.some((answer) => answer.trim() === ''))
    ) {
      return { error: 'Answer all entry questions to request to join', status: 400 }
    }
    joins[base.id].accountId = account.id
    joins[base.id].answers = answers.map((answer) => answer.trim())
    // Facebook gates entry — the request waits for the group to accept.
    joins[base.id].state = 'pending'
  } else {
    // Subreddits and X don't gate entry — the request is accepted immediately.
    joins[base.id].state = 'accepted'
  }
  persistCommunities()
  return { ok: true }
}

/**
 * Hono-shaped communities API. Mock-backed for now — the real endpoints come
 * from the platform clients (facebook group joins via connected accounts).
 * Routes and response shapes stay the same when the backend lands.
 */
export const communitiesApp = new Hono()
  .use('*', requestLogger())
  .get('/communities', describeRoute({ operationId: 'listCommunities', tags: ['Communities'], summary: 'List communities', description: 'Lists the full catalog plus any client-resolved rows (from pasted Facebook links or typed subreddits) materialized with current `joinState` (none/pending/accepted), `accountId` for Facebook joins, and `accountLabel`. Optional `?platform=facebook|x|reddit` filters server-side. This is the source for the Groups page and every keyword/listings scope picker. Code: apps/web/src/lib/communities/server.ts:180', parameters: [{ name: 'platform', in: 'query', required: false, schema: { type: 'string', enum: ['facebook','x','reddit'], description: 'Platform filter.' } }], responses: { 200: { description: 'Community list.', content: { 'application/json': { schema: CommunitiesResponseJson } } } } }), (c) => {
    const platform = c.req.query('platform') as ConnectionPlatform | undefined
    const all = materialize() as Community[]
    const communities = platform ? all.filter((community) => community.platform === platform) : all
    return c.json({ communities })
  })
  .post('/communities/:id/join', describeRoute({ operationId: 'joinCommunity', tags: ['Communities'], summary: 'Join community', description: 'Attempts to join `:id`. Facebook requires `accountId` of a connected Facebook account and `answers` matching every `entryQuestions` — missing/blank answers or wrong platform account returns 400. Facebook transitions to `pending` (awaits admin accept), other platforms (reddit/x) auto-set `accepted`. Already pending/accepted is a no-op 200. Persists to localStorage. Code: apps/web/src/lib/communities/server.ts:186', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', properties: { accountId: { type: 'string', description: 'Facebook account id (facebook only).' }, answers: { type: 'array', items: { type: 'string' }, description: 'Answers to entryQuestions, one per question.' } } } } } }, responses: { 201: { description: 'Joined (now pending/accepted).', content: { 'application/json': { schema: CommunityResponseJson } } }, 200: { description: 'Already joined.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('Facebook groups must be joined with a connected Facebook account / Answer all entry questions'), 404: errorResponse('Community not found') } }), async (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    const existing = joins[id]
    if (existing?.state !== 'none') {
      // Already pending or accepted — joining again is a no-op.
      return c.json({ community: materialize(id) as Community, communities: materialize() as Community[] })
    }
    const body = await c.req.json<{ accountId?: string }>().catch(() => null)
    const transition = await transitionToJoined(base, body)
    if ('error' in transition) return c.json({ error: transition.error }, transition.status)
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities }, 201)
  })
  .post('/communities/join-by-url', describeRoute({ operationId: 'joinCommunityByUrl', tags: ['Communities'], summary: 'Join community by URL', description: 'Parses a `facebook.com/groups/…` URL via `parseFacebookGroupUrl`, registers it as a new catalog row if unseen (`registerBase`), then runs the same Facebook join transition (account + answers). Dedupes by URL — already tracked rows return 200. Registers unknown URLs before joining so pasted links become first-class communities. Code: apps/web/src/lib/communities/server.ts:201', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', description: 'Facebook group URL.' }, accountId: { type: 'string' }, answers: { type: 'array', items: { type: 'string' } } }, required: ['url'] } } } }, responses: { 201: { description: 'Joined.', content: { 'application/json': { schema: CommunityResponseJson } } }, 200: { description: 'Already tracked.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('That does not look like a Facebook group link') } }), async (c) => {
    const body = await c.req.json<{ url?: string; accountId?: string; answers?: string[] }>().catch(() => null)
    const parsed = body?.url ? parseFacebookGroupUrl(body.url) : null
    if (!parsed) {
      return c.json({ error: 'That does not look like a Facebook group link (facebook.com/groups/…)' }, 400)
    }
    const base = findBaseByUrl(parsed.url) ?? registerBase(parsed)
    const existing = joins[base.id]
    if (existing?.state !== 'none') {
      // Already tracked and requested — surface it instead of duplicating.
      return c.json({ community: materialize(base.id) as Community, communities: materialize() as Community[] })
    }
    const transition = await transitionToJoined(base, body)
    if ('error' in transition) return c.json({ error: transition.error }, transition.status)
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === base.id)!, communities }, 201)
  })
  .post('/communities/resolve', describeRoute({ operationId: 'resolveCommunity', tags: ['Communities'], summary: 'Resolve community URL', description: 'Resolves a pasted Facebook group URL into its `Community` without changing `joinState`. Registers unknown URLs as new rows so the form can read `entryQuestions` before the user answers. Persists the catalog even though no join occurs — it\'s a read-ahead for the join form. Code: apps/web/src/lib/communities/server.ts:218', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', description: 'Facebook group URL.' } }, required: ['url'] } } } }, responses: { 200: { description: 'Resolved.', content: { 'application/json': { schema: CommunitySingleResponseJson } } }, 400: errorResponse('That does not look like a Facebook group link') } }), async (c) => {
    // Resolve a pasted group link into its catalog row (registering it when
    // unseen) WITHOUT changing join state — the form reads the entry
    // questions off this before the user answers and joins.
    const body = await c.req.json<{ url?: string }>().catch(() => null)
    const parsed = body?.url ? parseFacebookGroupUrl(body.url) : null
    if (!parsed) {
      return c.json({ error: 'That does not look like a Facebook group link (facebook.com/groups/…)' }, 400)
    }
    const base = findBaseByUrl(parsed.url) ?? registerBase(parsed)
    // Resolve can register a row without joining — persist the catalog too.
    persistCommunities()
    return c.json({ community: materialize(base.id) as Community })
  })
  .post('/communities/resolve-reddit', describeRoute({ operationId: 'resolveRedditCommunity', tags: ['Communities'], summary: 'Resolve Reddit community', description: 'Resolves a typed `r/name` (via `parseSubredditName`) into its `Community` and immediately marks it `accepted` — subreddits have no entry gate, so a resolved row is instantly usable as a keyword scope. Creates a new row via `communityFromSubreddit` if unseen. Code: apps/web/src/lib/communities/server.ts:232', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string', description: 'Subreddit name, e.g. r/test or test.' } }, required: ['name'] } } } }, responses: { 200: { description: 'Resolved + joined (accepted).', content: { 'application/json': { schema: CommunitySingleResponseJson } } }, 400: errorResponse('That does not look like a subreddit') } }), async (c) => {
    // Resolve a typed subreddit into its community and join it on the spot:
    // subreddits don't gate entry, so a resolved row is immediately accepted
    // and usable as a keyword scope. Already-tracked rows are a no-op.
    const body = await c.req.json<{ name?: string }>().catch(() => null)
    const parsed = body?.name ? parseSubredditName(body.name) : null
    if (!parsed) {
      return c.json({ error: 'That does not look like a subreddit (r/name)' }, 400)
    }
    const base =
      findRedditBase(parsed.key, parsed.url) ?? registerRow(communityFromSubreddit(parsed))
    const state = joins[base.id]
    if (state && state.state === 'none') state.state = 'accepted'
    persistCommunities()
    return c.json({ community: materialize(base.id) as Community })
  })
  .post('/communities/:id/accept', describeRoute({ operationId: 'acceptCommunityJoin', tags: ['Communities'], summary: 'Accept pending join', description: 'Mock admin accept — transitions `:id` from `pending` → `accepted`. Simulates the group admin approving the join request in the Groups page \'Approve\' action and tests. Returns `400 No join request to accept` if state is `none`, `404` if unknown id. Code: apps/web/src/lib/communities/server.ts:248', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Accepted.', content: { 'application/json': { schema: CommunityResponseJson } } }, 400: errorResponse('No join request to accept'), 404: errorResponse('Community not found') } }), (c) => {
    const id = c.req.param('id')
    const base = findBaseById(id)
    if (!base) return c.json({ error: 'Community not found' }, 404)
    const existing = joins[id]
    if (!existing || existing.state === 'none') {
      return c.json({ error: 'No join request to accept' }, 400)
    }
    if (existing.state === 'pending') existing.state = 'accepted'
    persistCommunities()
    const communities = materialize() as Community[]
    return c.json({ community: communities.find((community) => community.id === id)!, communities })
  })
  .delete('/communities/:id', describeRoute({ operationId: 'leaveCommunity', tags: ['Communities'], summary: 'Leave community', description: 'Leaves `:id` — resets its `joinState` to `none`, clears `accountId` and `answers`. The catalog row stays (so pasted links remain) but is no longer a member and cannot scope keywords/listings. Persists. Code: apps/web/src/lib/communities/server.ts:261', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', description: 'Community id.' } }], responses: { 200: { description: 'Remaining communities.', content: { 'application/json': { schema: CommunitiesResponseJson } } }, 404: errorResponse('Community not found') } }), (c) => {
    const id = c.req.param('id')
    if (!findBaseById(id)) return c.json({ error: 'Community not found' }, 404)
    joins[id] = { state: 'none', accountId: null, answers: [] }
    persistCommunities()
    return c.json({ communities: materialize() as Community[] })
  })

export type CommunitiesApp = typeof communitiesApp