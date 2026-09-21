import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mayRead, parseProxyUrl, proxyState } from './lib/proxy'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './reddit.ts': () => import('./reddit'),
  './watch.ts': () => import('./watch'),
}

const SECRET_PASSWORD = 'p@ss w0rd/secret'
const PROXY_URL = `http://proxy-user:${encodeURIComponent(SECRET_PASSWORD)}@gw.proxy.example:8080`

afterEach(() => { vi.unstubAllEnvs() })

describe('the proxy address', () => {
  it('splits an address into what a browser needs', () => {
    expect(parseProxyUrl(PROXY_URL)).toEqual({ server: 'http://gw.proxy.example:8080', username: 'proxy-user', password: SECRET_PASSWORD })
    expect(parseProxyUrl('socks5://gw.proxy.example:1080')).toEqual({ server: 'socks5://gw.proxy.example:1080' })
    expect(parseProxyUrl('  https://user@gw.example:443  ')).toEqual({ server: 'https://gw.example', username: 'user' })  // the default port is implied
  })

  it('refuses anything that is not a proxy address', () => {
    for (const bad of [undefined, '', '   ', 'gw.proxy.example:8080', 'ftp://gw.example:21', 'javascript:alert(1)', 'http://', 'not a url']) {
      expect(parseProxyUrl(bad as string | undefined), String(bad)).toBeNull()
    }
  })
})

describe('the rule: a proxy is mandatory', () => {
  it('needs a proxy unless the operator has waived it', () => {
    expect(mayRead(proxyState({ PROXY_URL }))).toBe(true)
    expect(mayRead(proxyState({}))).toBe(false)                                   // no proxy: refused
    expect(mayRead(proxyState({ PROXY_URL: 'garbage' }))).toBe(false)              // an unusable proxy counts as none
    expect(mayRead(proxyState({ PROXY_REQUIRED: 'false' }))).toBe(true)           // operator-only escape hatch
    expect(mayRead(proxyState({ PROXY_REQUIRED: ' FALSE ' }))).toBe(true)
    expect(mayRead(proxyState({ PROXY_REQUIRED: 'no' }))).toBe(false)              // only the exact word waives it
    expect(proxyState({ PROXY_URL, PROXY_REQUIRED: 'false' }).proxy).not.toBeNull() // a proxy that is set is still used
  })
})

describe('the /proxy endpoint', () => {
  async function started() {
    const t = convexTest(schema, modules)
    const alice = t.withIdentity({ subject: 'alice', issuer: 'https://test.example' })
    const { secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'helper' })
    return { t, secret: secret as string }
  }
  const get = (t: ReturnType<typeof convexTest>, secret?: string) =>
    t.fetch('/proxy', { headers: secret ? { Authorization: `Bearer ${secret}` } : {} })

  it('hands the proxy only to a valid ingest key', async () => {
    const { t, secret } = await started()
    vi.stubEnv('PROXY_URL', PROXY_URL)
    const res = await get(t, secret)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ required: true, proxy: { server: 'http://gw.proxy.example:8080', username: 'proxy-user', password: SECRET_PASSWORD } })
    expect((await get(t)).status).toBe(401)
    expect((await get(t, 'lk_ingest_' + 'x'.repeat(30))).status).toBe(401)
    expect((await t.fetch('/proxy', { headers: { Authorization: 'Bearer not-a-key' } })).status).toBe(401)
  })

  it('refuses to hand out anything, and says why in plain words, when no proxy is set', async () => {
    const { t, secret } = await started()
    const res = await get(t, secret)
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'Reading is paused until the operator sets up the proxy' })
  })

  it('lets the operator waive the rule for a deployment that has no proxy yet', async () => {
    const { t, secret } = await started()
    vi.stubEnv('PROXY_REQUIRED', 'false')
    const res = await get(t, secret)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ required: false, proxy: null })
  })

  it('never puts the proxy in an error, or in any other endpoint a user can reach', async () => {
    const { t, secret } = await started()
    vi.stubEnv('PROXY_URL', PROXY_URL)
    for (const res of [await get(t), await get(t, 'lk_ingest_' + 'y'.repeat(30))]) {
      const text = await res.text()
      expect(text).not.toContain(SECRET_PASSWORD)
      expect(text).not.toContain('gw.proxy.example')
    }
    for (const path of [`/phrases?platform=x`, `/session?platform=x`]) {
      const text = await (await t.fetch(path, { headers: { Authorization: `Bearer ${secret}` } })).text()
      expect(text).not.toContain('gw.proxy.example')
    }
  })
})
