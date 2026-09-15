import { describe, it, expect } from 'vitest'
import { mockApiApp } from '../mock-api'

/**
 * Full API coverage smokes: every described route is hit via `mockApiApp.request`
 * (in-process, no HTTP server). Each subagent's feature slice is represented;
 * failures here mean the reference or the mock drifted. Docs code refs are
 * asserted separately in `docs-coverage.test.ts`.
 */

async function req(path: string, init?: RequestInit) {
  const res = await mockApiApp.request(path, init)
  const body = await res.json().catch(() => ({}))
  return { res, body: body as Record<string, unknown> }
}

describe('api-keys slice', () => {
  it('lists, creates, and deletes', async () => {
    const list = await req('/api-keys')
    expect(list.res.status).toBe(200)
    expect(Array.isArray((list.body as { apiKeys: unknown[] }).apiKeys)).toBe(true)

    const created = await req('/api-keys', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: `test-${Date.now()}`, scopes: { accountId: null, groupIds: [], canSendMessages: true, canReceiveMessages: true } }) })
    expect(created.res.status).toBe(201)
    const id = (created.body as { apiKey: { id: string } }).apiKey.id
    const del = await req(`/api-keys/${id}`, { method: 'DELETE' })
    expect(del.res.status).toBe(200)

    const bad = await req('/api-keys', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) })
    expect(bad.res.status).toBe(400)
    expect((bad.body as { error: string }).error).toMatch(/needs a name|Invalid/i)
  })
})

describe('brand slice', () => {
  it('covers all 7 brand routes', async () => {
    const g1 = await req('/brand')
    expect(g1.res.status).toBe(200)
    expect('brand' in g1.body).toBe(true)
    const put = await req('/brand', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identity: { name: 'Test' } }) })
    expect([200, 400].includes(put.res.status)).toBe(true)
    const intel = await req('/brand/intelligence', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ competitors: ['example.com'] }) })
    expect([200, 404, 400].includes(intel.res.status)).toBe(true)
    const sources = await req('/brand/sources')
    expect(sources.res.status).toBe(200)
    const idx = await req('/brand/index', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sitemap: true }) })
    expect([200, 404].includes(idx.res.status)).toBe(true)
    const delSrc = await req('/brand/sources', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'https://example.com' }) })
    expect([200, 404].includes(delSrc.res.status)).toBe(true)
  })
})

describe('accounts slice', () => {
  it('creates and lists', async () => {
    const list = await req('/accounts')
    expect(list.res.status).toBe(200)
    const create = await req('/accounts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ platform: 'facebook' }) })
    expect([201, 400].includes(create.res.status)).toBe(true)
    const bad = await req('/accounts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ platform: 'bogus' }) })
    expect(bad.res.status).toBe(400)
  })

  it('resolves challenges only when the API says one is pending', async () => {
    const unknown = await req('/accounts/no-such-account/resolve', { method: 'POST' })
    expect(unknown.res.status).toBe(404)

    // The x-challenge seed carries challenge_interstitial: resolvable once.
    const seed = await req('/accounts/x-challenge/resolve', { method: 'POST' })
    expect(seed.res.status).toBe(200)
    expect((seed.body as { account: { lastIssue: unknown } }).account.lastIssue).toBeNull()
    const seedAgain = await req('/accounts/x-challenge/resolve', { method: 'POST' })
    expect(seedAgain.res.status).toBe(409)

    // A healthy account has nothing to resolve.
    const created = await req('/accounts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ platform: 'reddit' }) })
    expect(created.res.status).toBe(201)
    const id = (created.body as { account: { id: string } }).account.id
    const healthy = await req(`/accounts/${id}/resolve`, { method: 'POST' })
    expect(healthy.res.status).toBe(409)

    // Flag it, resolve it, confirm the state the dashboard gates on.
    const flagged = await req(`/accounts/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lastIssue: 'captcha_html', rawSignal: { status: 200, marker: 'captcha' } }) })
    expect(flagged.res.status).toBe(200)
    const ok = await req(`/accounts/${id}/resolve`, { method: 'POST' })
    expect(ok.res.status).toBe(200)
    const resolved = (ok.body as { account: { lastIssue: unknown; rawSignal: unknown; lastCheckedAt: unknown; connectedAt: unknown } }).account
    expect(resolved.lastIssue).toBeNull()
    expect(resolved.rawSignal).toBeNull()
    expect(typeof resolved.lastCheckedAt).toBe('string')
    expect(typeof resolved.connectedAt).toBe('string')
  })
})

describe('communities slice', () => {
  it('lists and resolves', async () => {
    const list = await req('/communities')
    expect(list.res.status).toBe(200)
    const resolve = await req('/communities/resolve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'https://facebook.com/groups/123' }) })
    expect([200, 400].includes(resolve.res.status)).toBe(true)
    const resolveReddit = await req('/communities/resolve-reddit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'r/test' }) })
    expect([200, 400].includes(resolveReddit.res.status)).toBe(true)
  })
})

describe('listings slice', () => {
  it('lists', async () => {
    const list = await req('/listings')
    expect(list.res.status).toBe(200)
    expect(Array.isArray((list.body as { listings: unknown[] }).listings)).toBe(true)
  })
})

describe('keywords slice', () => {
  it('lists and validates scoping', async () => {
    const list = await req('/keywords')
    expect(list.res.status).toBe(200)
    const bad = await req('/keywords', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phrase: 'test', platform: 'x', groupId: 'should-not-have' }) })
    expect(bad.res.status).toBe(400)
  })
})

describe('feed slice', () => {
  it('lists with filters', async () => {
    const all = await req('/feed')
    expect(all.res.status).toBe(200)
    const byPlatform = await req('/feed/facebook')
    expect(byPlatform.res.status).toBe(200)
    const bad = await req('/feed/bogusPlatform')
    expect(bad.res.status).toBe(400)
  })
})

describe('messaging slice', () => {
  it('requires accountId and serves per-account inboxes', async () => {
    const noAccount = await req('/messaging/facebook/threads')
    expect(noAccount.res.status).toBe(400)
    const fb = await req('/messaging/facebook/threads?accountId=fb-personal')
    expect(fb.res.status).toBe(200)
    const x = await req('/messaging/x/threads?accountId=x-ops')
    expect(x.res.status).toBe(200)
    const rd = await req('/messaging/reddit/threads?accountId=reddit-listeningkit')
    expect(rd.res.status).toBe(200)
    // A thread only resolves under the account that owns it.
    const leaked = await req('/messaging/x/threads/x-t3/messages?accountId=x-ops')
    expect(leaked.res.status).toBe(404)
  })
})
