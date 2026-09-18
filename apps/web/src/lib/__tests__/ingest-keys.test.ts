import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { convexSiteUrl } from '../convex'
import { createIngestKey, ingestAvailable, ingestEndpoint, listIngestKeys, revokeIngestKey } from '../ingest-keys'
import { setApiTokenProvider } from '../transport'

const calls: { method: string; ref: string; args: unknown }[] = []
let reply: (method: string, ref: string) => unknown = () => ({})

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    constructor(readonly url: string) {}
    setAuth() {}
    async query(ref: unknown, args: unknown) { return this.call('query', ref, args) }
    async mutation(ref: unknown, args: unknown) { return this.call('mutation', ref, args) }
    private async call(method: string, ref: unknown, args: unknown) {
      const name = String((ref as Record<symbol, unknown>)[Symbol.for('functionName')])
      calls.push({ method, ref: name, args })
      const out = reply(method, name)
      if (out instanceof Error) throw out
      return out
    }
  },
}))

beforeEach(() => {
  calls.length = 0
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_CONVEX_URL', 'https://example-name-123.convex.cloud')
  setApiTokenProvider(async () => 'clerk-convex-token')
})
afterEach(() => { vi.unstubAllEnvs(); setApiTokenProvider(async () => null) })

const key = { id: 'k1', label: 'x client', prefix: 'lk_ingest_ab12cd', createdAt: 1789753123308, lastUsedAt: null }

describe('ingest keys client', () => {
  it('derives the public endpoint from the deployment url', () => {
    expect(convexSiteUrl()).toBe('https://example-name-123.convex.site')
    expect(ingestEndpoint()).toBe('https://example-name-123.convex.site/ingest')
    expect(ingestAvailable()).toBe(true)
  })

  it('is unavailable in mock mode or without a deployment', () => {
    vi.stubEnv('VITE_API_MODE', 'mock')
    expect(ingestAvailable()).toBe(false)
    vi.stubEnv('VITE_API_MODE', 'live')
    vi.stubEnv('VITE_CONVEX_URL', '')
    expect(ingestAvailable()).toBe(false)
    expect(ingestEndpoint()).toBeUndefined()
  })

  it('lists keys and validates the wire shape', async () => {
    reply = () => [key]
    expect(await listIngestKeys()).toEqual([key])
    expect(calls[0]).toEqual({ method: 'query', ref: 'ingest:listKeys', args: {} })
    reply = () => [{ ...key, createdAt: 'yesterday' }]
    await expect(listIngestKeys()).rejects.toThrow('invalid response')
  })

  it('creates a key with a trimmed name and returns the one-time secret', async () => {
    reply = () => ({ id: 'k1', secret: `lk_ingest_${'a'.repeat(64)}`, prefix: 'lk_ingest_aaaaaa' })
    const created = await createIngestKey('  x client  ')
    expect(created.secret).toMatch(/^lk_ingest_a{64}$/)
    expect(calls[0]).toEqual({ method: 'mutation', ref: 'ingest:createKey', args: { label: 'x client' } })
    await expect(createIngestKey('   ')).rejects.toThrow('1-80')
    await expect(createIngestKey('x'.repeat(81))).rejects.toThrow('1-80')
    expect(calls).toHaveLength(1)
  })

  it('surfaces server messages and never hides failures', async () => {
    reply = () => new ConvexError('Ingest key limit reached; revoke one first')
    await expect(createIngestKey('another')).rejects.toThrow('limit reached')
    reply = () => new Error('socket closed')
    await expect(revokeIngestKey('k1')).rejects.toThrow('Could not revoke')
    reply = () => null
    await revokeIngestKey('k1')
    expect(calls.at(-1)).toEqual({ method: 'mutation', ref: 'ingest:revokeKey', args: { id: 'k1' } })
  })

  it('requires a signed-in token', async () => {
    setApiTokenProvider(async () => null)
    await expect(listIngestKeys()).rejects.toThrow('Sign in')
  })
})
