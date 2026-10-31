import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setApiTokenProvider } from '../transport'
import {
  createWebhook, deliveriesSchema, describeDelivery, describeWebhook, MIN_SCORE_CHOICES, removeWebhook, setWebhookActive, testWebhook,
  webhookListSchema, webhooksAllowed, type Delivery, type Webhook,
} from '../webhooks-live'

const calls: { ref: string; args: unknown }[] = []
let reply: (ref: string) => unknown = () => null

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    constructor(readonly url: string) {}
    setAuth() {}
    async query(ref: unknown, args: unknown) { return this.call(ref, args) }
    async mutation(ref: unknown, args: unknown) { return this.call(ref, args) }
    async action(ref: unknown, args: unknown) { return this.call(ref, args) }
    private async call(ref: unknown, args: unknown) {
      const name = String((ref as Record<symbol, unknown>)[Symbol.for('functionName')])
      calls.push({ ref: name, args })
      const out = reply(name)
      if (out instanceof Error) throw out
      return out
    }
  },
}))

const hook: Webhook = { id: 'w1', url: 'https://hooks.acme.dev/x', minScore: 70, platforms: [], active: true, failureStreak: 0, disabledReason: null, lastDeliveryAt: null, createdAt: 1 }

beforeEach(() => {
  calls.length = 0
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
  setApiTokenProvider(async () => 'token')
})
afterEach(() => { vi.unstubAllEnvs(); setApiTokenProvider(async () => null) })

describe('what the server says about webhooks', () => {
  it('is checked before it is shown', () => {
    expect(webhookListSchema.parse({ limit: 0, webhooks: [] })).toEqual({ limit: 0, webhooks: [] })
    expect(webhookListSchema.safeParse({ limit: 1, webhooks: [hook] }).success).toBe(true)
    expect(webhookListSchema.safeParse({ limit: 1, webhooks: [{ ...hook, platforms: ['myspace'] }] }).success).toBe(false)
    expect(webhookListSchema.safeParse({ webhooks: [] }).success).toBe(false)
    expect(deliveriesSchema.safeParse([{ id: 'd', event: 'ping', status: 'delivered', attempts: 1, statusCode: 200, error: null, at: 1 }]).success).toBe(true)
    expect(deliveriesSchema.safeParse([{ id: 'd', event: 'other', status: 'delivered', attempts: 1, statusCode: 200, error: null, at: 1 }]).success).toBe(false)
  })

  it('shows the Pro notice unless the plan allows any', () => {
    expect(webhooksAllowed(0)).toBe(false)
    expect(webhooksAllowed(1)).toBe(true)
  })
})

describe('describing them in plain words', () => {
  it('says what a webhook sends, or why it is off', () => {
    expect(describeWebhook(hook)).toBe('Sends matches scored 70 and up from every platform')
    expect(describeWebhook({ ...hook, minScore: 90, platforms: ['x', 'reddit'] })).toBe('Sends matches scored 90 and up from x, reddit')
    expect(describeWebhook({ ...hook, active: false, disabledReason: 'Switched off after 5 failed deliveries in a row. Fix the receiver, then switch it back on.' })).toContain('Switched off after 5')
    expect(describeWebhook({ ...hook, active: false })).toBe('Switched off')
  })

  it('says what happened to a delivery', () => {
    const entry = (over: Partial<Delivery>): Delivery => ({ id: 'd', event: 'match.created', status: 'delivered', attempts: 1, statusCode: 200, error: null, at: 1, ...over })
    expect(describeDelivery(entry({}))).toBe('Match delivered (HTTP 200)')
    expect(describeDelivery(entry({ event: 'ping' }))).toBe('Test delivered (HTTP 200)')
    expect(describeDelivery(entry({ status: 'pending', attempts: 2 }))).toBe('Match waiting to retry (try 2)')
    expect(describeDelivery(entry({ status: 'failed', attempts: 4, error: 'the receiver answered HTTP 500' }))).toBe('Match failed after 4 tries: the receiver answered HTTP 500')
    expect(describeDelivery(entry({ status: 'failed', attempts: 1, statusCode: null, error: null, event: 'ping' }))).toBe('Test failed after 1 try')
  })

  it('offers score bars that the server accepts', () => {
    expect(MIN_SCORE_CHOICES.every((choice) => choice.value >= 0 && choice.value <= 100)).toBe(true)
  })
})

describe('managing them', () => {
  it('creates one, returning the secret for the one time it is shown', async () => {
    reply = () => ({ webhook: hook, secret: 'whsec_' + 'a'.repeat(64) })
    const made = await createWebhook({ url: '  https://hooks.acme.dev/x ', minScore: 80, platforms: [] })
    expect(made.secret).toMatch(/^whsec_/)
    expect(calls[0]).toEqual({ ref: 'webhooks:create', args: { url: 'https://hooks.acme.dev/x', minScore: 80 } })
    await createWebhook({ url: 'https://hooks.acme.dev/x', minScore: 80, platforms: ['x'] })
    expect(calls[1].args).toEqual({ url: 'https://hooks.acme.dev/x', minScore: 80, platforms: ['x'] })
  })

  it("shows the server's plain reason, and hides anything else behind a fallback", async () => {
    reply = () => new ConvexError('Webhooks are part of the Pro plan, which is coming soon.')
    await expect(createWebhook({ url: 'https://hooks.acme.dev/x', minScore: 70, platforms: [] })).rejects.toThrow('part of the Pro plan')
    reply = () => new Error('socket closed')
    await expect(createWebhook({ url: 'https://hooks.acme.dev/x', minScore: 70, platforms: [] })).rejects.toThrow('Could not create the webhook')
    reply = () => ({ webhook: { id: 'w' } })
    await expect(createWebhook({ url: 'https://hooks.acme.dev/x', minScore: 70, platforms: [] })).rejects.toThrow('invalid response')
  })

  it('switches on and off, removes, and tests', async () => {
    reply = () => ({ ...hook, active: false })
    expect((await setWebhookActive('w1', false)).active).toBe(false)
    expect(calls[0]).toEqual({ ref: 'webhooks:update', args: { id: 'w1', active: false } })
    reply = () => ({ id: 'w1', deleted: true })
    await removeWebhook('w1')
    expect(calls[1]).toEqual({ ref: 'webhooks:remove', args: { id: 'w1' } })
    reply = () => ({ delivered: true, statusCode: 200 })
    expect(await testWebhook('w1')).toEqual({ delivered: true, statusCode: 200 })
    reply = () => ({ delivered: false, statusCode: 404, error: 'the receiver answered HTTP 404' })
    expect((await testWebhook('w1')).error).toBe('the receiver answered HTTP 404')
    reply = () => new ConvexError('Webhook not found')
    await expect(removeWebhook('gone')).rejects.toThrow('Webhook not found')
  })
})
