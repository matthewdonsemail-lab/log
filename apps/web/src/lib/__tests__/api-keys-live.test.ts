import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_ENDPOINTS, apiBaseUrl, apiKeysAvailable, createApiKey, exampleCurl, listApiKeys, RATE_LIMIT_TEXT, revokeApiKey } from '../api-keys-live'
import { setApiTokenProvider } from '../transport'

const calls: { ref: string; args: unknown }[] = []
let reply: (ref: string) => unknown = () => null

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    constructor(readonly url: string) {}
    setAuth() {}
    async query(ref: unknown, args: unknown) { return this.call(ref, args) }
    async mutation(ref: unknown, args: unknown) { return this.call(ref, args) }
    private async call(ref: unknown, args: unknown) {
      const name = String((ref as Record<symbol, unknown>)[Symbol.for('functionName')])
      calls.push({ ref: name, args })
      const out = reply(name)
      if (out instanceof Error) throw out
      return out
    }
  },
}))

beforeEach(() => {
  calls.length = 0
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
  setApiTokenProvider(async () => 'token')
})
afterEach(() => { vi.unstubAllEnvs(); setApiTokenProvider(async () => null) })

describe('where the API lives', () => {
  it('is on the live backend only, at /api/v1 on the deployment\'s site address', () => {
    expect(apiKeysAvailable()).toBe(true)
    expect(apiBaseUrl()).toBe('https://example.convex.site/api/v1')
    vi.stubEnv('VITE_API_MODE', 'mock')
    vi.stubEnv('VITE_CONVEX_URL', '')
    expect(apiKeysAvailable()).toBe(false)
    expect(apiBaseUrl()).toBeUndefined()
  })
})

describe('managing keys', () => {
  it('lists validated keys', async () => {
    reply = () => [{ id: 'k1', label: 'script', prefix: 'lk_api_0123456', createdAt: 1, lastUsedAt: null }]
    expect(await listApiKeys()).toEqual([{ id: 'k1', label: 'script', prefix: 'lk_api_0123456', createdAt: 1, lastUsedAt: null }])
    expect(calls[0].ref).toBe('apiKeys:listKeys')
    reply = () => [{ id: 'k1' }]
    await expect(listApiKeys()).rejects.toThrow('invalid response')
  })

  it('sends the trimmed name and returns the secret for the one time it is shown', async () => {
    reply = () => ({ id: 'k1', secret: 'lk_api_' + 'a'.repeat(64), prefix: 'lk_api_aaaaaaa' })
    const created = await createApiKey('  my script  ')
    expect(created.secret).toMatch(/^lk_api_/)
    expect(calls[0]).toEqual({ ref: 'apiKeys:createKey', args: { label: 'my script' } })
  })

  it('checks the name before sending, and shows the server\'s plain reason otherwise', async () => {
    await expect(createApiKey('   ')).rejects.toThrow('1-80 characters')
    await expect(createApiKey('x'.repeat(81))).rejects.toThrow('1-80 characters')
    expect(calls).toHaveLength(0)
    reply = () => new ConvexError('You can have 5 API keys; revoke one first')
    await expect(createApiKey('sixth')).rejects.toThrow('5 API keys')
    reply = () => new Error('socket closed')
    await expect(createApiKey('x')).rejects.toThrow('Could not create the API key')
    reply = () => ({ id: 'k' })
    await expect(createApiKey('x')).rejects.toThrow('invalid response')
  })

  it('revokes by id', async () => {
    reply = () => null
    await revokeApiKey('k1')
    expect(calls[0]).toEqual({ ref: 'apiKeys:revokeKey', args: { id: 'k1' } })
    reply = () => new ConvexError('Key not found')
    await expect(revokeApiKey('gone')).rejects.toThrow('Key not found')
  })
})

describe('what the page tells a developer', () => {
  it('gives a copy-paste example that uses the key and the real base address', () => {
    const text = exampleCurl('https://example.convex.site/api/v1', 'lk_api_SECRET')
    expect(text).toContain('curl "https://example.convex.site/api/v1/matches?limit=5&min_score=70"')
    expect(text).toContain('Authorization: Bearer lk_api_SECRET')
  })

  it('lists exactly the endpoints that exist, all read-only, and states the rate limit', () => {
    expect(API_ENDPOINTS.map((endpoint) => endpoint.path)).toEqual(['GET /me', 'GET /keywords', 'GET /matches'])
    expect(API_ENDPOINTS.every((endpoint) => endpoint.path.startsWith('GET '))).toBe(true)
    expect(API_ENDPOINTS[2].params).toContain('limit (1-100, default 25)')
    expect(RATE_LIMIT_TEXT).toContain('60 requests per minute')
  })
})
