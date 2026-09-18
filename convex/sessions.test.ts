import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decryptText, encryptText } from './lib/crypto'
import { parseToken } from './lib/token'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './feed.ts': () => import('./feed'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './sessions.ts': () => import('./sessions'),
}

const KEY = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 1)))
const NOW = Date.UTC(2026, 8, 18)
const FUTURE = Math.floor(NOW / 1000) + 86_400 * 30

const b64url = (value: unknown) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const jwt = (sub: string) => `h.${b64url({ sub })}.s`
const cookie = (name: string, value: string, domain: string, expires = FUTURE) =>
  ({ name, value, domain, path: '/', expires, httpOnly: true, secure: true, sameSite: 'None' })
const token = (platform: string, cookies: unknown[]) => `lk1.${b64url({ v: 1, platform, cookies })}`

const redditToken = (sub = 'user', extra: unknown[] = []) =>
  token('reddit', [cookie('token_v2', jwt(sub), '.reddit.com'), cookie('loid', 'anon-value', '.reddit.com'), ...extra])
const xToken = () => token('x', [cookie('auth_token', 'auth-secret', '.x.com'), cookie('ct0', 'csrf-secret', '.x.com')])
const fbToken = () => token('facebook', [cookie('c_user', '100', '.facebook.com'), cookie('xs', 'fb-secret', '.facebook.com')])

beforeEach(() => {
  vi.stubEnv('SESSION_ENCRYPTION_KEY', KEY)
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers() })

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}

describe('token validation', () => {
  it('accepts a real-looking token for each platform', () => {
    expect(parseToken(redditToken(), NOW)).toMatchObject({ platform: 'reddit', expiresAt: FUTURE * 1000 })
    expect(parseToken(xToken(), NOW).platform).toBe('x')
    expect(parseToken(fbToken(), NOW).platform).toBe('facebook')
  })

  it('explains each mistake in plain words', () => {
    const fail = (input: string) => {
      try { parseToken(input, NOW) } catch (e) { return String((e as { data?: string }).data) }
      return 'accepted'
    }
    expect(fail('eyJhbGciOi')).toContain('not a ListeningKit token')
    expect(fail('lk1.@@@')).toContain('looks damaged')
    expect(fail(token('myspace', []))).toContain('looks damaged')
    expect(fail(token('reddit', [cookie('loid', 'x', '.reddit.com')]))).toContain('could not find your Reddit login')
    expect(fail(token('x', [cookie('auth_token', 'a', '.x.com')]))).toContain('could not find your X login')
    expect(fail(redditToken('loid'))).toContain('not logged in to Reddit')
    expect(fail(token('reddit', [cookie('token_v2', jwt('user'), '.reddit.com', Math.floor(NOW / 1000) - 60)]))).toContain('has expired')
    expect(fail('lk1.' + 'a'.repeat(130_000))).toContain('too large')
  })

  it("keeps only cookies on the platform's own domains", () => {
    const parsed = parseToken(redditToken('user', [cookie('stolen', 'v', '.evil.com'), cookie('ok', 'v', 'old.reddit.com')]), NOW)
    expect(parsed.cookies.map(c => c.name).sort()).toEqual(['loid', 'ok', 'token_v2'])
  })

  it('never puts a cookie value in an error', () => {
    try { parseToken(token('reddit', [cookie('loid', 'TOPSECRETVALUE', '.reddit.com')]), NOW) } catch (e) {
      expect(JSON.stringify(e)).not.toContain('TOPSECRETVALUE')
    }
  })
})

describe('sealing', () => {
  it('round-trips, uses a fresh IV, and refuses a wrong key or tampering', async () => {
    const a = await encryptText('hello cookies')
    const b = await encryptText('hello cookies')
    expect(a.iv).not.toBe(b.iv)
    expect(a.data).not.toContain('hello')
    expect(await decryptText(a)).toBe('hello cookies')
    vi.stubEnv('SESSION_ENCRYPTION_KEY', btoa(String.fromCharCode(...new Uint8Array(32).fill(9))))
    await expect(decryptText(a)).rejects.toThrow('Connect the account again')
    vi.stubEnv('SESSION_ENCRYPTION_KEY', KEY)
    await expect(decryptText({ ...a, data: a.data.slice(0, -4) + 'AAAA' })).rejects.toThrow('Connect the account again')
  })

  it('fails clearly when the deployment has no key', async () => {
    vi.stubEnv('SESSION_ENCRYPTION_KEY', '')
    await expect(encryptText('x')).rejects.toThrow('not set up')
  })
})

describe('connecting accounts', () => {
  it('stores only sealed data, marks the account connected, and returns metadata', async () => {
    const { t, alice } = setup()
    const saved = await alice.mutation(anyApi.sessions.save, { token: redditToken() })
    expect(saved).toEqual({ platform: 'reddit', cookieCount: 2, expiresAt: FUTURE * 1000 })
    const raw = await t.run(async ctx => JSON.stringify(await ctx.db.query('sessions').collect()))
    expect(raw).not.toContain('anon-value')
    expect(raw).not.toContain('token_v2')
    const listed = await alice.query(anyApi.sessions.list, {})
    expect(listed.sessions).toEqual([expect.objectContaining({ platform: 'reddit', cookieCount: 2 })])
    expect(JSON.stringify(listed)).not.toContain('anon-value')
    const accounts = (await alice.query(anyApi.accounts.list, {})).accounts
    expect(accounts).toEqual([expect.objectContaining({ platform: 'reddit', connectedAt: expect.any(String) })])
  })

  it('replaces the login on reconnect, and disconnects cleanly', async () => {
    const { t, alice } = setup()
    await alice.mutation(anyApi.sessions.save, { token: redditToken() })
    await alice.mutation(anyApi.sessions.save, { token: redditToken('user', [cookie('extra', 'v', '.reddit.com')]) })
    expect(await t.run(async ctx => (await ctx.db.query('sessions').collect()).length)).toBe(1)
    expect((await alice.query(anyApi.sessions.list, {})).sessions[0].cookieCount).toBe(3)
    await alice.mutation(anyApi.sessions.remove, { platform: 'reddit' })
    expect((await alice.query(anyApi.sessions.list, {})).sessions).toEqual([])
    expect((await alice.query(anyApi.accounts.list, {})).accounts[0].connectedAt).toBeNull()
    await expect(alice.mutation(anyApi.sessions.remove, { platform: 'reddit' })).rejects.toThrow('not connected')
  })

  it("keeps each person's login private and needs a sign-in", async () => {
    const { t, alice, bob } = setup()
    await alice.mutation(anyApi.sessions.save, { token: xToken() })
    expect((await bob.query(anyApi.sessions.list, {})).sessions).toEqual([])
    await expect(bob.mutation(anyApi.sessions.remove, { platform: 'x' })).rejects.toThrow('not connected')
    await expect(t.mutation(anyApi.sessions.save, { token: xToken() })).rejects.toThrow('Authentication required')
  })

  it('rejects a bad token without saving anything', async () => {
    const { t, alice } = setup()
    await expect(alice.mutation(anyApi.sessions.save, { token: 'nonsense' })).rejects.toThrow('not a ListeningKit token')
    expect(await t.run(async ctx => (await ctx.db.query('sessions').collect()).length)).toBe(0)
  })
})

describe('the /session endpoint for local clients', () => {
  const get = (t: ReturnType<typeof setup>['t'], secret: string, platform = 'reddit') =>
    t.fetch(`/session?platform=${platform}`, { headers: { Authorization: `Bearer ${secret}` } })

  it("hands the owner's own login to their ingest key, and nobody else", async () => {
    const { t, alice, bob } = setup()
    const a = await alice.mutation(anyApi.ingest.createKey, { label: 'laptop' })
    const b = await bob.mutation(anyApi.ingest.createKey, { label: 'bob laptop' })
    await alice.mutation(anyApi.sessions.save, { token: redditToken() })
    const ok = await get(t, a.secret)
    expect(ok.status).toBe(200)
    expect(ok.headers.get('Cache-Control')).toBe('no-store')
    const body = await ok.json()
    expect(body.platform).toBe('reddit')
    expect(body.cookies.map((c: { name: string }) => c.name).sort()).toEqual(['loid', 'token_v2'])
    expect((await get(t, b.secret)).status).toBe(404)
  })

  it('rejects missing, wrong and revoked keys and unknown platforms', async () => {
    const { t, alice } = setup()
    const key = await alice.mutation(anyApi.ingest.createKey, { label: 'k' })
    await alice.mutation(anyApi.sessions.save, { token: fbToken() })
    expect((await t.fetch('/session?platform=facebook')).status).toBe(401)
    expect((await get(t, `lk_ingest_${'a'.repeat(64)}`, 'facebook')).status).toBe(401)
    expect((await get(t, key.secret, 'myspace')).status).toBe(400)
    expect((await get(t, key.secret, 'facebook')).status).toBe(200)
    await alice.mutation(anyApi.ingest.revokeKey, { id: key.id })
    expect((await get(t, key.secret, 'facebook')).status).toBe(401)
  })
})
