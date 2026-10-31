import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setApiTokenProvider } from '../transport'
import { liveDmMessagesSchema, liveThreadsSchema, sendLiveDm } from '../live-messages'

const calls: { ref: string; args: unknown }[] = []
let reply: (ref: string) => unknown = () => null

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    constructor(readonly url: string) {}
    setAuth() {}
    async mutation(ref: unknown, args: unknown) {
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

describe('what the server says about DMs', () => {
  it('a thread needs a platform, a peer handle and a valid timestamp', () => {
    const thread = { id: 't1', platform: 'x', peerHandle: 'needhelp99', peerName: 'Need Help', lastMessageAt: 1, lastMessagePreview: 'hi' }
    expect(liveThreadsSchema.safeParse([thread]).success).toBe(true)
    expect(liveThreadsSchema.safeParse([{ ...thread, platform: 'myspace' }]).success).toBe(false)
    expect(liveThreadsSchema.safeParse([{ ...thread, peerHandle: undefined }]).success).toBe(false)
  })

  it('a message needs a known direction and status', () => {
    const message = { id: 'm1', direction: 'in', text: 'hi', sentAt: 1, status: 'sent' }
    expect(liveDmMessagesSchema.safeParse([message]).success).toBe(true)
    expect(liveDmMessagesSchema.safeParse([{ ...message, direction: 'sideways' }]).success).toBe(false)
    expect(liveDmMessagesSchema.safeParse([{ ...message, status: 'delivered' }]).success).toBe(false)
  })
})

describe('sendLiveDm', () => {
  it('sends the trimmed text to messages:sendMessage for the given thread', async () => {
    reply = () => ({ id: 'm2', direction: 'out', text: 'sure, what do you need?', sentAt: 2, status: 'pending' })
    const sent = await sendLiveDm('t1', 'sure, what do you need?')
    expect(sent.status).toBe('pending')
    expect(calls).toEqual([{ ref: 'messages:sendMessage', args: { threadId: 't1', text: 'sure, what do you need?' } }])
  })

  it('surfaces the server\'s own plain-words message, like the Free plan and length limits', async () => {
    reply = () => { throw new ConvexError('Message must be at most 2000 characters') }
    await expect(sendLiveDm('t1', 'x'.repeat(2001))).rejects.toThrow('Message must be at most 2000 characters')
  })
})
