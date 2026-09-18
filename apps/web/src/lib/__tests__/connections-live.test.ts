import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectAccount, disconnectAccount, testConnection } from '../connections'
import { setApiTokenProvider } from '../transport'

const calls: string[] = []
let sessions: { platform: string; expiresAt: number | null }[] = []
let account = { id: 'acc1', platform: 'reddit', label: 'Reddit', viaProxy: false, connectedAt: null as string | null }

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    constructor(readonly url: string) {}
    setAuth() {}
    async query(ref: unknown) { return this.call(ref) }
    async mutation(ref: unknown) { return this.call(ref) }
    private async call(ref: unknown) {
      const name = String((ref as Record<symbol, unknown>)[Symbol.for('functionName')])
      calls.push(name)
      if (name === 'accounts:list') return { accounts: [account] }
      if (name === 'sessions:list') return { sessions: sessions.map((s) => ({ ...s, cookieCount: 2, savedAt: 1 })) }
      if (name === 'sessions:save') { account = { ...account, connectedAt: '2026-09-18T00:00:00Z' }; return { platform: 'reddit', cookieCount: 2, expiresAt: null } }
      return null
    }
  },
}))

const b64url = (value: unknown) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const redditToken = `lk1.${b64url({ v: 1, platform: 'reddit', cookies: [] })}`

beforeEach(() => {
  calls.length = 0
  sessions = []
  account = { id: 'acc1', platform: 'reddit', label: 'Reddit', viaProxy: false, connectedAt: null }
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
  setApiTokenProvider(async () => 'token')
})
afterEach(() => { vi.unstubAllEnvs(); setApiTokenProvider(async () => null) })

describe('Settings connections on the live backend', () => {
  it('connects with a real token and returns the connected account', async () => {
    const record = await connectAccount({ id: 'acc1', platform: 'reddit', cookie: redditToken, proxy: '' })
    expect(calls).toContain('sessions:save')
    expect(record.connectedAt).toBe('2026-09-18T00:00:00Z')
  })

  it('catches a token pasted on the wrong account before sending it', async () => {
    await expect(connectAccount({ id: 'acc1', platform: 'x', cookie: redditToken, proxy: '' })).rejects.toThrow('That is a Reddit token')
    expect(calls).not.toContain('sessions:save')
  })

  it('tests a connection against what is saved', async () => {
    await expect(testConnection({ id: 'acc1', platform: 'reddit', cookie: '', proxy: '' })).rejects.toThrow('Not connected yet')
    sessions = [{ platform: 'reddit', expiresAt: Date.now() - 1000 }]
    await expect(testConnection({ id: 'acc1', platform: 'reddit', cookie: '', proxy: '' })).rejects.toThrow('expired')
    sessions = [{ platform: 'reddit', expiresAt: Date.now() + 86_400_000 }]
    expect(await testConnection({ id: 'acc1', platform: 'reddit', cookie: '', proxy: '' })).toEqual({ ok: true, viaProxy: false })
  })

  it('disconnects only accounts that are connected', async () => {
    await disconnectAccount('acc1')
    expect(calls).not.toContain('sessions:remove')
    account = { ...account, connectedAt: '2026-09-18T00:00:00Z' }
    await disconnectAccount('acc1')
    expect(calls).toContain('sessions:remove')
  })
})
