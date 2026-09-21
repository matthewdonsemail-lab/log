import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { internal } from './_generated/api'
import { checkWebhookUrl } from './lib/webhookUrl'
import { hmacHex, newWebhookSecret, REPLAY_WINDOW_SECONDS, signPayload, verifySignature } from './lib/webhookSign'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './apiKeys.ts': () => import('./apiKeys'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './plan.ts': () => import('./plan'),
  './publicApi.ts': () => import('./publicApi'),
  './reddit.ts': () => import('./reddit'),
  './scoring.ts': () => import('./scoring'),
  './watch.ts': () => import('./watch'),
  './webhooks.ts': () => import('./webhooks'),
}

const ENCRYPTION_KEY = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 1)))
const NOW = Date.UTC(2026, 8, 21, 12, 0, 0)
const ALICE = 'https://test.example|alice'
const BOB = 'https://test.example|bob'
const HOOK = 'https://hooks.acme.dev/listeningkit'

beforeEach(() => {
  vi.stubEnv('SESSION_ENCRYPTION_KEY', ENCRYPTION_KEY)
  vi.stubEnv('PLAN_WEBHOOKS_PER_PERSON', '2')
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals() })

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}
type T = ReturnType<typeof setup>['t']
type Client = ReturnType<T['withIdentity']>

const settle = async (t: T) => { await t.finishAllScheduledFunctions(vi.runAllTimers) }

async function makeKey(client: Client, scopes: string[] = ['webhooks']) {
  return (await client.mutation(anyApi.apiKeys.createKey, { label: 'k', scopes })) as { secret: string }
}
const call = (t: T, method: string, path: string, secret: string, body?: unknown) =>
  t.fetch(path, { method, headers: { Authorization: `Bearer ${secret}` }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })

let n = 0
/** A scored match for `owner` (or an unscored one), ready to be sent. */
async function match(t: T, owner: string, over: { platform?: 'reddit' | 'x' | 'facebook'; score?: number | null } = {}) {
  n += 1
  return await t.run(async ctx => {
    const platform = over.platform ?? 'x'
    const accountId = await ctx.db.insert('accounts', { owner, platform, label: `a${n}`, connectedAt: null })
    const keywordId = await ctx.db.insert('keywords', { owner, accountId, platform, phrase: 'need a helper', status: 'listening' })
    const postId = await ctx.db.insert('posts', { owner, accountId, platform, externalId: `p${n}`, authorName: 'someone', body: ['we need a helper today'], url: `https://x.com/a/status/${n}`, likes: 3, comments: 1 })
    return await ctx.db.insert('hits', {
      owner, keywordId, postId, phrase: 'need a helper', platform,
      ...(over.score === null ? {} : { score: over.score ?? 85, intent: 'looking_for_help', reason: 'Asks for a helper', scoredAt: Date.now() }),
    })
  })
}

async function newHook(client: Client, over: { url?: string; minScore?: number; platforms?: string[] } = {}) {
  return (await client.mutation(anyApi.webhooks.create, { url: over.url ?? HOOK, ...(over.minScore === undefined ? {} : { minScore: over.minScore }), ...(over.platforms ? { platforms: over.platforms } : {}) })) as
    { webhook: { id: string; active: boolean; failureStreak: number }; secret: string }
}

const okReply = () => new Response('secret receiver body', { status: 200 })

describe('the address', () => {
  it('accepts a normal public https address and tidies it', () => {
    expect(checkWebhookUrl(HOOK)).toEqual({ ok: true, url: HOOK })
    expect(checkWebhookUrl('  https://hooks.acme.dev:443/a?b=1#frag ')).toEqual({ ok: true, url: 'https://hooks.acme.dev/a?b=1' })
    expect(checkWebhookUrl('https://hooks.acme.dev./x').ok).toBe(true)
  })

  it('refuses anything that could make our server call into a private network', () => {
    const bad = [
      '', '   ', 'hooks.acme.dev', 'http://hooks.acme.dev/x', 'ftp://hooks.acme.dev/x', 'javascript:alert(1)', 'not a url',
      'https://localhost/x', 'https://LOCALHOST/x', 'https://127.0.0.1/x', 'https://10.0.0.5/x', 'https://192.168.1.1/x', 'https://169.254.169.254/latest',
      'https://0x7f000001/x', 'https://2130706433/x', 'https://0177.0.0.1/x', 'https://[::1]/x', 'https://[fd00::1]/x',
      'https://user:pass@hooks.acme.dev/x', 'https://hooks.acme.dev:8443/x', 'https://hooks.acme.dev:80/x',
      'https://intranet/x', 'https://printer.local/x', 'https://db.internal/x', 'https://metadata.google.internal/x', 'https://x.lan/x', 'https://x.corp/x', 'https://x.localhost/x',
      'https://127.0.0.1.nip.io/x', 'https://10-0-0-1.sslip.io/x', 'https://foo.localtest.me/x', 'https://a.lvh.me/x', 'https://nip.io/x',
      'https://hooks..acme.dev/x', 'https://.acme.dev/x', 'https://hooks.acme.dev/' + 'x'.repeat(500), 'https://exa mple.com/x', 'https://hooks.example/x', 'https://a.test/x',
    ]
    for (const address of bad) expect(checkWebhookUrl(address).ok, address).toBe(false)
  })

  it('says why in plain words', () => {
    expect((checkWebhookUrl('http://hooks.acme.dev/x') as { reason: string }).reason).toContain('https://')
    expect((checkWebhookUrl('https://127.0.0.1/x') as { reason: string }).reason).toContain('IP address')
    expect((checkWebhookUrl('https://db.internal/x') as { reason: string }).reason).toContain('private')
  })
})

describe('signing', () => {
  it('is a real HMAC-SHA256 (checked against the RFC 4231 test vector)', async () => {
    expect(await hmacHex('Jefe', 'what do ya want for nothing?')).toBe('5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843')
  })

  it('signs the timestamp and the exact body, and a receiver can verify it', async () => {
    const secret = newWebhookSecret()
    expect(secret).toMatch(/^whsec_[0-9a-f]{64}$/)
    const body = '{"a":1}'
    const signature = await signPayload(secret, 1_790_000_000, body)
    expect(signature).toMatch(/^v1=[0-9a-f]{64}$/)
    expect(signature).toBe(`v1=${await hmacHex(secret, `1790000000.${body}`)}`)
    expect(await verifySignature(secret, 1_790_000_000, body, signature, 1_790_000_010)).toBe(true)
  })

  it('rejects a changed body, secret, timestamp or signature, and a replay', async () => {
    const secret = newWebhookSecret()
    const signature = await signPayload(secret, 1_790_000_000, '{"a":1}')
    expect(await verifySignature(secret, 1_790_000_000, '{"a":2}', signature, 1_790_000_001)).toBe(false)
    expect(await verifySignature(newWebhookSecret(), 1_790_000_000, '{"a":1}', signature, 1_790_000_001)).toBe(false)
    expect(await verifySignature(secret, 1_790_000_001, '{"a":1}', signature, 1_790_000_001)).toBe(false)
    expect(await verifySignature(secret, 1_790_000_000, '{"a":1}', signature.slice(0, -1), 1_790_000_001)).toBe(false)
    expect(await verifySignature(secret, 1_790_000_000, '{"a":1}', signature, 1_790_000_000 + REPLAY_WINDOW_SECONDS + 1)).toBe(false)
  })
})

describe('webhooks are a Pro feature', () => {
  it('are refused on the Free plan, in the dashboard and in the API, and say so', async () => {
    const { t, alice } = setup()
    vi.stubEnv('PLAN_WEBHOOKS_PER_PERSON', '')
    await expect(newHook(alice)).rejects.toThrow('Webhooks are part of the Pro plan, which is coming soon.')
    const { secret } = await makeKey(alice)
    const res = await call(t, 'POST', '/api/v1/webhooks', secret, { url: HOOK })
    expect([res.status, (await res.json()).error]).toEqual([403, { code: 'plan_limit', message: 'Webhooks are part of the Pro plan, which is coming soon.' }])
    expect(await alice.query(anyApi.webhooks.list, {})).toEqual({ limit: 0, webhooks: [] })
    expect((await alice.query(anyApi.plan.mine, {})).limits.webhooksPerPerson).toBe(0)
  })

  it('can be switched on for a deployment by the operator, with a limit', async () => {
    const { alice } = setup()
    vi.stubEnv('PLAN_WEBHOOKS_PER_PERSON', '1')
    await newHook(alice)
    await expect(newHook(alice, { url: 'https://other.acme.dev/x' })).rejects.toThrow('The Free plan has 1 webhook at a time')
    expect((await alice.query(anyApi.webhooks.list, {})).limit).toBe(1)
    expect((await alice.query(anyApi.plan.mine, {})).usage.webhooks).toBe(1)
  })
})

describe('making and managing webhooks', () => {
  it('shows the secret once, keeps it sealed, and never lists it', async () => {
    const { t, alice } = setup()
    const made = await newHook(alice)
    expect(made.secret).toMatch(/^whsec_/)
    expect(made.webhook).toMatchObject({ url: HOOK, minScore: 70, platforms: [], active: true, failureStreak: 0 })
    const row = await t.run(ctx => ctx.db.query('webhooks').first())
    expect(JSON.stringify(row)).not.toContain(made.secret)
    const listed = await alice.query(anyApi.webhooks.list, {})
    expect(JSON.stringify(listed)).not.toContain(made.secret)
    expect(JSON.stringify(listed)).not.toMatch(/secret/i)
    expect(listed.webhooks).toHaveLength(1)
  })

  it('checks everything it is given', async () => {
    const { alice } = setup()
    await expect(newHook(alice, { url: 'http://hooks.acme.dev/x' })).rejects.toThrow('https://')
    await expect(newHook(alice, { url: 'https://10.0.0.5/x' })).rejects.toThrow('IP address')
    await expect(newHook(alice, { minScore: 101 })).rejects.toThrow('min_score must be a whole number from 0 to 100')
    await expect(newHook(alice, { minScore: 7.5 })).rejects.toThrow('min_score')
    await newHook(alice)
    await expect(newHook(alice)).rejects.toThrow('You already have a webhook for that address')
    expect((await alice.query(anyApi.webhooks.list, {})).webhooks).toHaveLength(1)
  })

  it('belong to one person: nobody else can see, change, test or remove them', async () => {
    const { t, alice, bob } = setup()
    const made = await newHook(alice)
    expect((await bob.query(anyApi.webhooks.list, {})).webhooks).toEqual([])
    await expect(bob.mutation(anyApi.webhooks.remove, { id: made.webhook.id })).rejects.toThrow('Webhook not found')
    await expect(bob.mutation(anyApi.webhooks.update, { id: made.webhook.id, active: false })).rejects.toThrow('Webhook not found')
    await expect(bob.query(anyApi.webhooks.deliveries, { id: made.webhook.id })).rejects.toThrow('Webhook not found')
    vi.stubGlobal('fetch', vi.fn(async () => okReply()))
    await expect(bob.action(anyApi.webhooks.test, { id: made.webhook.id })).rejects.toThrow('Webhook not found')
    await expect(t.query(anyApi.webhooks.list, {})).rejects.toThrow('Authentication required')
  })

  it('can be edited and switched off and on, and removing one removes its log', async () => {
    const { t, alice } = setup()
    const made = await newHook(alice)
    const off = await alice.mutation(anyApi.webhooks.update, { id: made.webhook.id, active: false, minScore: 90, platforms: ['x', 'x', 'reddit'] })
    expect(off).toMatchObject({ active: false, minScore: 90, platforms: ['x', 'reddit'] })
    vi.stubGlobal('fetch', vi.fn(async () => okReply()))
    await alice.action(anyApi.webhooks.test, { id: made.webhook.id })
    expect(await t.run(ctx => ctx.db.query('webhookDeliveries').take(5))).toHaveLength(1)
    await alice.mutation(anyApi.webhooks.remove, { id: made.webhook.id })
    expect(await t.run(ctx => ctx.db.query('webhookDeliveries').take(5))).toHaveLength(0)
    expect((await alice.query(anyApi.webhooks.list, {})).webhooks).toEqual([])
  })
})

describe('sending a scored match', () => {
  it('posts a signed event the receiver can verify, with the same match the API shows', async () => {
    const { t, alice } = setup()
    const made = await newHook(alice)
    const fetcher = vi.fn(async () => okReply())
    vi.stubGlobal('fetch', fetcher)
    const hitId = await match(t, ALICE, { score: 88 })
    await t.mutation(internal.webhooks.fanOut, { hitId })
    await settle(t)
    expect(fetcher).toHaveBeenCalledTimes(1)
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(url).toBe(HOOK)
    expect(init.method).toBe('POST')
    expect(init.redirect).toBe('manual')   // never follow a redirect into somewhere else
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['X-ListeningKit-Event']).toBe('match.created')
    expect(headers['User-Agent']).toBe('ListeningKit-Webhooks/1')
    const body = init.body as string
    const seconds = Number(headers['X-ListeningKit-Timestamp'])
    expect(await verifySignature(made.secret, seconds, body, headers['X-ListeningKit-Signature'], seconds)).toBe(true)
    const event = JSON.parse(body)
    expect(event).toMatchObject({ id: headers['X-ListeningKit-Delivery'], type: 'match.created', createdAt: new Date(NOW).toISOString() })
    expect(event.data).toMatchObject({ id: hitId, score: 88, intent: 'looking_for_help', platform: 'x', phrase: 'need a helper', post: { author: 'someone', text: 'we need a helper today', url: expect.stringContaining('https://x.com/') } })
    const shown = (await (await call(t, 'GET', `/api/v1/matches/${hitId}`, (await makeKey(alice, ['read'])).secret)).json()).data
    expect(event.data).toEqual(shown)   // the webhook and the API say the same thing
    const json = JSON.stringify(event)
    expect(json).not.toContain(made.secret)
    expect(json).not.toMatch(/owner|test\.example|whsec/)
    const [delivery] = await t.run(ctx => ctx.db.query('webhookDeliveries').take(5))
    expect(delivery).toMatchObject({ status: 'delivered', attempts: 1, statusCode: 200, event: 'match.created' })
    expect(JSON.stringify(delivery)).not.toContain('secret receiver body')   // the answer is never stored
  })

  it('only sends what the webhook asked for, and only its owner\'s', async () => {
    const { t, alice, bob } = setup()
    await newHook(alice, { minScore: 80, platforms: ['x'] })
    await newHook(bob)
    const fetcher = vi.fn(async () => okReply())
    vi.stubGlobal('fetch', fetcher)
    for (const hitId of [
      await match(t, ALICE, { score: 79 }),                      // too low
      await match(t, ALICE, { score: 95, platform: 'reddit' }),  // wrong platform
      await match(t, ALICE, { score: null }),                    // not scored yet
    ]) await t.mutation(internal.webhooks.fanOut, { hitId })
    await settle(t)
    expect(fetcher).not.toHaveBeenCalled()
    const wanted = await match(t, ALICE, { score: 80 })
    await t.mutation(internal.webhooks.fanOut, { hitId: wanted })
    await t.mutation(internal.webhooks.fanOut, { hitId: wanted })   // a repeat is not sent twice
    await settle(t)
    expect(fetcher).toHaveBeenCalledTimes(1)
    const body = JSON.parse(((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1]).body as string)
    expect(body.data.id).toBe(wanted)
    const bobs = await match(t, BOB, { score: 90 })
    fetcher.mockClear()
    await t.mutation(internal.webhooks.fanOut, { hitId: bobs })
    await settle(t)
    expect(fetcher).toHaveBeenCalledTimes(1)                        // bob's webhook only, for bob's match
  })

  it('does not send while the webhook is switched off', async () => {
    const { t, alice } = setup()
    const made = await newHook(alice)
    await alice.mutation(anyApi.webhooks.update, { id: made.webhook.id, active: false })
    const fetcher = vi.fn(async () => okReply())
    vi.stubGlobal('fetch', fetcher)
    await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
    await settle(t)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('fires by itself when a match is scored, from the scoring step', async () => {
    const { t, alice } = setup()
    await newHook(alice)
    const fetcher = vi.fn(async () => okReply())
    vi.stubGlobal('fetch', fetcher)
    const hitId = await match(t, ALICE, { score: null })
    await t.mutation(internal.scoring.save, { model: 'test:model', results: [{ hitId, score: 91, intent: 'buying', reason: 'ready to buy' }] })
    await settle(t)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(JSON.parse(((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1]).body as string).data).toMatchObject({ score: 91, intent: 'buying' })
    // a failed scoring attempt sends nothing
    fetcher.mockClear()
    const other = await match(t, ALICE, { score: null })
    await t.mutation(internal.scoring.save, { model: 'test:model', results: [{ hitId: other }] })
    await settle(t)
    expect(fetcher).not.toHaveBeenCalled()
  })
})

describe('when the receiver has trouble', () => {
  it('retries with a growing wait, then gives up, and never stores what the receiver said', async () => {
    const { t, alice } = setup()
    const made = await newHook(alice)
    const fetcher = vi.fn(async () => new Response('database password is hunter2', { status: 500 }))
    vi.stubGlobal('fetch', fetcher)
    await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
    await settle(t)
    expect(fetcher).toHaveBeenCalledTimes(4)                        // the first try and three retries
    const [delivery] = await t.run(ctx => ctx.db.query('webhookDeliveries').take(5))
    expect(delivery).toMatchObject({ status: 'failed', attempts: 4, statusCode: 500, error: 'the receiver answered HTTP 500' })
    expect(JSON.stringify(delivery)).not.toContain('hunter2')
    const hook = await t.run(ctx => ctx.db.query('webhooks').first())
    expect(hook).toMatchObject({ active: true, failureStreak: 1 })
    expect(await alice.query(anyApi.webhooks.deliveries, { id: made.webhook.id })).toEqual([
      { id: delivery._id, event: 'match.created', status: 'failed', attempts: 4, statusCode: 500, error: 'the receiver answered HTTP 500', at: expect.any(Number) },
    ])
  })

  it('waits 1 minute, then 5, then 30 between tries', async () => {
    const { t, alice } = setup()
    await newHook(alice)
    const stamps: number[] = []
    vi.stubGlobal('fetch', vi.fn(async () => { stamps.push(Date.now()); return new Response('', { status: 503 }) }))
    await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
    await settle(t)
    expect(stamps.slice(1).map((stamp, i) => stamp - stamps[i])).toEqual([60_000, 300_000, 1_800_000])
  })

  it('recovers: a later success delivers it and clears the failure count', async () => {
    const { t, alice } = setup()
    await newHook(alice)
    const answers = [500, 502, 200]
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: answers.shift() ?? 200 })))
    await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
    await settle(t)
    const [delivery] = await t.run(ctx => ctx.db.query('webhookDeliveries').take(5))
    expect(delivery).toMatchObject({ status: 'delivered', attempts: 3, statusCode: 200 })
    expect(await t.run(ctx => ctx.db.query('webhooks').first())).toMatchObject({ failureStreak: 0, lastDeliveryAt: expect.any(Number) })
  })

  it('says what went wrong in plain words for a timeout, a refused connection and a redirect', async () => {
    const { t, alice } = setup()
    await newHook(alice)
    const outcomes: (() => Promise<Response>)[] = [
      async () => { throw Object.assign(new Error('timed out'), { name: 'TimeoutError' }) },
      async () => { throw new TypeError('fetch failed: ECONNREFUSED 10.1.2.3:443 secret-token') },
      async () => new Response(null, { status: 302, headers: { Location: 'https://169.254.169.254/latest' } }),
    ]
    const seen: string[] = []
    for (const outcome of outcomes) {
      vi.stubGlobal('fetch', vi.fn(outcome))
      await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
      await settle(t)
    }
    for (const delivery of await t.run(ctx => ctx.db.query('webhookDeliveries').take(10))) seen.push(delivery.error ?? '')
    expect(seen).toEqual(['the receiver did not answer in 5 seconds', 'could not connect to the receiver', 'the address redirected, and redirects are not followed'])
    expect(seen.join(' ')).not.toMatch(/ECONNREFUSED|10\.1\.2\.3|secret-token|169\.254/)
  })

  it('switches itself off after 5 failed deliveries in a row, and can be switched back on', async () => {
    const { t, alice } = setup()
    const made = await newHook(alice)
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))
    for (let i = 0; i < 5; i++) {
      await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
      await settle(t)
    }
    const hook = await t.run(ctx => ctx.db.query('webhooks').first())
    expect(hook).toMatchObject({ active: false, failureStreak: 5 })
    expect(hook!.disabledReason).toContain('Switched off after 5 failed deliveries in a row')
    const fetcher = vi.fn(async () => okReply())
    vi.stubGlobal('fetch', fetcher)
    await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
    await settle(t)
    expect(fetcher).not.toHaveBeenCalled()                          // it stays off
    const back = await alice.mutation(anyApi.webhooks.update, { id: made.webhook.id, active: true })
    expect(back).toMatchObject({ active: true, failureStreak: 0, disabledReason: null })
    await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
    await settle(t)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('checks the address again at send time, and never calls a private one', async () => {
    const { t, alice } = setup()
    await newHook(alice)
    await t.run(async ctx => { const row = (await ctx.db.query('webhooks').first())!; await ctx.db.patch(row._id, { url: 'https://127.0.0.1/x' }) })
    const fetcher = vi.fn(async () => okReply())
    vi.stubGlobal('fetch', fetcher)
    await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
    await settle(t)
    expect(fetcher).not.toHaveBeenCalled()
    expect((await t.run(ctx => ctx.db.query('webhookDeliveries').first()))).toMatchObject({ status: 'failed', error: 'the address is not allowed' })
  })

  it('does not send when the signing secret cannot be read', async () => {
    const { t, alice } = setup()
    await newHook(alice)
    vi.stubEnv('SESSION_ENCRYPTION_KEY', btoa(String.fromCharCode(...new Uint8Array(32).fill(9))))   // a different key
    const fetcher = vi.fn(async () => okReply())
    vi.stubGlobal('fetch', fetcher)
    await t.mutation(internal.webhooks.fanOut, { hitId: await match(t, ALICE) })
    await settle(t)
    expect(fetcher).not.toHaveBeenCalled()
    expect((await t.run(ctx => ctx.db.query('webhookDeliveries').first()))!.error).toBe('the signing secret could not be read')
  })
})

describe('testing a webhook', () => {
  it('sends one signed test event now and reports what came back, without retrying', async () => {
    const { t, alice } = setup()
    const made = await newHook(alice)
    const fetcher = vi.fn(async () => okReply())
    vi.stubGlobal('fetch', fetcher)
    expect(await alice.action(anyApi.webhooks.test, { id: made.webhook.id })).toEqual({ delivered: true, statusCode: 200 })
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect([url, headers['X-ListeningKit-Event']]).toEqual([HOOK, 'ping'])
    const seconds = Number(headers['X-ListeningKit-Timestamp'])
    expect(await verifySignature(made.secret, seconds, init.body as string, headers['X-ListeningKit-Signature'], seconds)).toBe(true)
    // a failing test is reported, is not retried, and does not count against the webhook
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
    expect(await alice.action(anyApi.webhooks.test, { id: made.webhook.id })).toEqual({ delivered: false, statusCode: 404, error: 'the receiver answered HTTP 404' })
    await settle(t)
    expect(await t.run(ctx => ctx.db.query('webhooks').first())).toMatchObject({ failureStreak: 0, active: true })
    const log = await alice.query(anyApi.webhooks.deliveries, { id: made.webhook.id })
    expect(log.map((entry: { event: string; status: string; attempts: number }) => [entry.event, entry.status, entry.attempts])).toEqual([['ping', 'failed', 1], ['ping', 'delivered', 1]])
  })
})

describe('the API for webhooks', () => {
  it('needs the webhooks scope: a read key or a write key cannot manage them', async () => {
    const { t, alice } = setup()
    for (const scopes of [['read'], ['write:phrases']]) {
      const { secret } = await makeKey(alice, scopes)
      for (const [method, path, body] of [['GET', '/api/v1/webhooks', undefined], ['POST', '/api/v1/webhooks', { url: HOOK }], ['DELETE', '/api/v1/webhooks/abcdefgh1234', undefined], ['POST', '/api/v1/webhooks/abcdefgh1234/test', undefined]] as const) {
        const res = await call(t, method, path, secret, body)
        expect([res.status, (await res.json()).error.code], `${scopes} ${method} ${path}`).toEqual([403, 'forbidden'])
      }
    }
    expect((await alice.query(anyApi.webhooks.list, {})).webhooks).toEqual([])
  })

  it('creates, lists, edits, tests, shows the log of, and deletes a webhook', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    const created = await call(t, 'POST', '/api/v1/webhooks', secret, { url: HOOK, min_score: 80, platforms: ['x', 'facebook'] })
    expect(created.status).toBe(201)
    const made = (await created.json()).data
    expect(made).toMatchObject({ url: HOOK, minScore: 80, platforms: ['x', 'facebook'], active: true, secret: expect.stringMatching(/^whsec_/) })
    const listed = await (await call(t, 'GET', '/api/v1/webhooks', secret)).json()
    expect(listed.data).toHaveLength(1)
    expect(JSON.stringify(listed)).not.toContain(made.secret)
    const edited = await (await call(t, 'PATCH', `/api/v1/webhooks/${made.id}`, secret, { min_score: 50, active: false })).json()
    expect(edited.data).toMatchObject({ minScore: 50, active: false })
    vi.stubGlobal('fetch', vi.fn(async () => okReply()))
    const tested = await call(t, 'POST', `/api/v1/webhooks/${made.id}/test`, secret)
    expect([tested.status, (await tested.json()).data]).toEqual([200, { delivered: true, statusCode: 200 }])
    const log = await (await call(t, 'GET', `/api/v1/webhooks/${made.id}/deliveries`, secret)).json()
    expect(log.data).toEqual([expect.objectContaining({ event: 'ping', status: 'delivered', statusCode: 200 })])
    const removed = await call(t, 'DELETE', `/api/v1/webhooks/${made.id}`, secret)
    expect([removed.status, (await removed.json()).data]).toEqual([200, { id: made.id, deleted: true }])
    expect((await (await call(t, 'GET', '/api/v1/webhooks', secret)).json()).data).toEqual([])
  })

  it('refuses bad input with a plain reason, and unknown addresses with 404', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    const cases: [string, unknown, number, string][] = [
      ['POST', { url: 'http://hooks.acme.dev/x' }, 400, 'https://'],
      ['POST', { url: 'https://127.0.0.1/x' }, 400, 'IP address'],
      ['POST', {}, 400, 'url must be a string'],
      ['POST', { url: HOOK, min_score: '80' }, 400, 'min_score must be a whole number from 0 to 100'],
      ['POST', { url: HOOK, min_score: 300 }, 400, 'min_score must be a whole number from 0 to 100'],
      ['POST', { url: HOOK, platforms: ['myspace'] }, 400, 'platforms must be a list of reddit, x and facebook'],
      ['POST', { url: HOOK, platforms: 'x' }, 400, 'platforms must be a list'],
    ]
    for (const [method, body, status, message] of cases) {
      const res = await call(t, method, '/api/v1/webhooks', secret, body)
      const json = await res.json()
      expect([res.status, json.error.message], JSON.stringify(body)).toEqual([status, expect.stringContaining(message)])
    }
    expect((await call(t, 'POST', '/api/v1/webhooks', secret, { url: HOOK })).status).toBe(201)
    const again = await call(t, 'POST', '/api/v1/webhooks', secret, { url: HOOK })
    expect([again.status, (await again.json()).error.code]).toEqual([409, 'conflict'])   // the same address twice
    for (const [method, path] of [['GET', '/api/v1/webhooks/abcdefgh1234'], ['POST', '/api/v1/webhooks/abcdefgh1234/nope'], ['DELETE', '/api/v1/webhooks/a/b/c'], ['DELETE', '/api/v1/webhooks/abcdefgh1234'], ['PATCH', '/api/v1/webhooks/abcdefgh1234']] as const) {
      const res = await call(t, method, path, secret, method === 'PATCH' ? { active: true } : undefined)
      expect(res.status, `${method} ${path}`).toBe(404)
    }
    expect((await call(t, 'PATCH', '/api/v1/webhooks/abcdefgh1234', secret, { active: 'yes' })).status).toBe(400)
  })

  it('cannot reach another person\'s webhook', async () => {
    const { t, alice, bob } = setup()
    const made = await newHook(alice)
    const { secret } = await makeKey(bob)
    for (const [method, path, body] of [['DELETE', `/api/v1/webhooks/${made.webhook.id}`, undefined], ['PATCH', `/api/v1/webhooks/${made.webhook.id}`, { active: false }], ['POST', `/api/v1/webhooks/${made.webhook.id}/test`, undefined], ['GET', `/api/v1/webhooks/${made.webhook.id}/deliveries`, undefined]] as const) {
      const res = await call(t, method, path, secret, body)
      expect([res.status, (await res.json()).error.code], `${method} ${path}`).toEqual([404, 'not_found'])
    }
    expect((await alice.query(anyApi.webhooks.list, {})).webhooks).toHaveLength(1)
  })
})
