import { describe, expect, it, vi } from 'vitest'
import { createApp } from './app'
import type { Backend } from './backend'

function setup() {
  const stores = new Map<string, Array<{ id: string; platform: 'reddit'; label: string; connectedAt: null }>>()
  const backend = vi.fn((token: string): Backend => ({
    listAccounts: async () => ({ accounts: stores.get(token) ?? [] }),
    createAccount: async input => {
      const account = { id: `${token}-1`, platform: 'reddit' as const, label: input.label, connectedAt: null }
      stores.set(token, [...(stores.get(token) ?? []), account])
      return { account, accounts: stores.get(token)! }
    },
    feed: async () => ({ items: [] }),
    syncReddit: async input => ({ accountId: `${token}-reddit`, fetched: 3, ingested: 2, skipped: 1, subreddit: input.subreddit }),
  }))
  const verifyToken = vi.fn(async (token: string) => { if (!['alice', 'bob'].includes(token)) throw new Error('invalid') })
  return { backend, verifyToken, app: createApp({ verifyToken, backend }) }
}
const auth = { Authorization: 'Bearer alice' }

describe('authenticated API boundary', () => {
  it('only health is public and rejects missing/invalid tokens before backend access', async () => {
    const { app, backend } = setup()
    expect((await app.request('/healthz')).status).toBe(200)
    for (const path of ['/api/accounts', '/api/feed', '/api/accounts/a/resolve']) {
      expect((await app.request(path)).status).toBe(401)
      expect((await app.request(path, { headers: { Authorization: 'Bearer expired' } })).status).toBe(401)
    }
    expect(backend).not.toHaveBeenCalled()
  })

  it('passes each verified token to a separate backend and matches account response contract', async () => {
    const { app, backend } = setup()
    const res = await app.request('/api/accounts', { method: 'POST', headers: auth, body: JSON.stringify({ platform: 'reddit' }) })
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ account: { label: 'Reddit', connectedAt: null }, accounts: [{ label: 'Reddit' }] })
    const bob = await app.request('/api/accounts', { headers: { Authorization: 'Bearer bob' } })
    expect(await bob.json()).toEqual({ accounts: [] })
    expect(backend).toHaveBeenCalledWith('alice')
    expect(backend).toHaveBeenCalledWith('bob')
    expect(bob.headers.get('cache-control')).toBe('no-store')
  })

  it('rejects ownership injection, server-owned fields, malformed bodies and invalid filters', async () => {
    const { app } = setup()
    for (const body of ['{', JSON.stringify({ platform: 'other' }), JSON.stringify({ platform: 'x', owner: 'bob' }), JSON.stringify({ platform: 'x', connectedAt: 'now' })]) {
      expect((await app.request('/api/accounts', { method: 'POST', headers: auth, body })).status).toBe(400)
    }
    expect((await app.request('/api/feed?platform=other', { headers: auth })).status).toBe(400)
    expect((await app.request('/api/feed?owner=bob', { headers: auth })).status).toBe(400)
    expect((await app.request('/api/accounts', { method: 'POST', headers: auth, body: 'x'.repeat(17000) })).status).toBe(413)
  })

  it('keeps empty feed results empty and rejects unsupported live operations', async () => {
    const { app } = setup()
    expect(await (await app.request('/api/feed/reddit?search=hello', { headers: auth })).json()).toEqual({ items: [] })
    expect((await app.request('/api/accounts/a/resolve', { method: 'POST', headers: auth })).status).toBe(501)
  })

  it('syncs one public subreddit per caller and rejects bad scopes', async () => {
    const { app } = setup()
    const res = await app.request('/api/feed/sync', { method: 'POST', headers: auth, body: JSON.stringify({ subreddit: 'marketing' }) })
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ fetched: 3, ingested: 2, skipped: 1 })
    for (const body of ['{', JSON.stringify({}), JSON.stringify({ subreddit: 'bad name!' }), JSON.stringify({ subreddit: 'marketing', limit: 99 }), JSON.stringify({ subreddit: 'marketing', owner: 'bob' })]) {
      expect((await app.request('/api/feed/sync', { method: 'POST', headers: auth, body })).status).toBe(400)
    }
    expect((await app.request('/api/feed/sync', { method: 'POST' })).status).toBe(401)
  })

  it('redacts backend errors instead of returning secrets or demo data', async () => {
    const app = createApp({ verifyToken: async () => {}, backend: () => ({
      listAccounts: async () => { throw new Error('sensitive upstream detail') },
      createAccount: vi.fn(), feed: vi.fn(), syncReddit: vi.fn(),
    }) })
    const res = await app.request('/api/accounts', { headers: auth })
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: 'Backend request failed' })
  })
})
