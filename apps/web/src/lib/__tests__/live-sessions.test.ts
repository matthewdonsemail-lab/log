import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { describeExpiry, listSessions, removeSession, saveSession, tokenPlatform } from '../live-sessions'
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

const b64url = (value: unknown) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

beforeEach(() => {
  calls.length = 0
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
  setApiTokenProvider(async () => 'token')
})
afterEach(() => { vi.unstubAllEnvs(); setApiTokenProvider(async () => null) })

describe('connected accounts client', () => {
  it('sends the trimmed token and returns only the summary', async () => {
    reply = () => ({ platform: 'reddit', cookieCount: 2, expiresAt: 1800000000000 })
    const saved = await saveSession('  lk1.abc  ')
    expect(saved).toEqual({ platform: 'reddit', cookieCount: 2, expiresAt: 1800000000000 })
    expect(calls[0]).toEqual({ ref: 'sessions:save', args: { token: 'lk1.abc' } })
  })

  it("shows the server's plain-words reason and rejects odd replies", async () => {
    reply = () => new ConvexError('We could not find your Reddit login. Log in at reddit.com, then copy the token again.')
    await expect(saveSession('lk1.x')).rejects.toThrow('Log in at reddit.com')
    reply = () => new Error('socket closed')
    await expect(saveSession('lk1.x')).rejects.toThrow('Could not connect the account')
    reply = () => ({ platform: 'reddit' })
    await expect(saveSession('lk1.x')).rejects.toThrow('invalid response')
  })

  it('lists and disconnects', async () => {
    reply = () => ({ sessions: [{ platform: 'x', cookieCount: 4, expiresAt: null, savedAt: 1 }] })
    expect(await listSessions()).toHaveLength(1)
    reply = () => null
    await removeSession('x')
    expect(calls.at(-1)).toEqual({ ref: 'sessions:remove', args: { platform: 'x' } })
  })

  it('reads the platform out of a token so a mix-up is caught before sending', () => {
    expect(tokenPlatform(`lk1.${b64url({ v: 1, platform: 'x', cookies: [] })}`)).toBe('x')
    expect(tokenPlatform('nonsense')).toBeNull()
    expect(tokenPlatform('lk1.@@@')).toBeNull()
    expect(tokenPlatform(`lk1.${b64url({ platform: 'myspace' })}`)).toBeNull()
  })

  it('describes expiry in plain words', () => {
    const now = Date.UTC(2026, 8, 18)
    expect(describeExpiry(null, now)).toBe('stays connected until you log out')
    expect(describeExpiry(now + 3600_000, now)).toBe('expires today')
    expect(describeExpiry(now + 86_400_000, now)).toBe('expires tomorrow')
    expect(describeExpiry(now + 30 * 86_400_000, now)).toBe('expires in 30 days')
  })
})
