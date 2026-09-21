import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { internal } from './_generated/api'
import { AGENTMAIL_URL, isEmail, renderDigest, sendEmail } from './lib/agentmail'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './alerts.ts': () => import('./alerts'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './reddit.ts': () => import('./reddit'),
  './scoring.ts': () => import('./scoring'),
  './watch.ts': () => import('./watch'),
}

const KEY = 'am-test-key-not-real'
const INBOX = 'alerts@agentmail.example'
const NOW = Date.UTC(2026, 8, 21, 12)
const ALICE = 'https://test.example|alice'
const BOB = 'https://test.example|bob'

beforeEach(() => {
  vi.stubEnv('AGENTMAIL_API_KEY', KEY)
  vi.stubEnv('AGENTMAIL_INBOX_ID', INBOX)
  vi.stubEnv('CONVEX_SITE_URL', 'https://site.example')
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers() })

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}

type T = ReturnType<typeof setup>['t']
let counter = 0

/** One scored match for `owner`, with a real post behind it. */
async function hit(t: T, owner: string, over: { score?: number; scoredAgoMs?: number; body?: string; alertedAt?: number } = {}) {
  counter += 1
  return await t.run(async ctx => {
    const accountId = await ctx.db.insert('accounts', { owner, platform: 'x', label: 'x', connectedAt: null })
    const keywordId = await ctx.db.insert('keywords', { owner, accountId, platform: 'x', phrase: 'need a bookkeeper', status: 'listening' })
    const postId = await ctx.db.insert('posts', {
      owner, accountId, platform: 'x', externalId: `p${counter}`, authorName: `author${counter}`, body: [over.body ?? `post ${counter} we need a bookkeeper`],
      url: `https://x.com/author${counter}/status/${counter}`, likes: 1, comments: 0,
    })
    return await ctx.db.insert('hits', {
      owner, keywordId, postId, phrase: 'need a bookkeeper', platform: 'x',
      score: over.score ?? 90, intent: 'looking_for_help', reason: `Reason ${counter}`, scoredAt: NOW - (over.scoredAgoMs ?? 60_000),
      ...(over.alertedAt === undefined ? {} : { alertedAt: over.alertedAt }),
    })
  })
}

const ok = () => new Response(JSON.stringify({ message_id: 'm', thread_id: 't' }), { status: 200 })

describe('email addresses', () => {
  it('accepts one plain address and nothing that could add a second recipient or a header', () => {
    expect(isEmail('you@example.com')).toBe(true)
    expect(isEmail('first.last+tag@sub.example.co.uk')).toBe(true)
    for (const bad of ['', 'you', 'you@', '@example.com', 'you@example', 'a b@example.com', 'a@example.com, b@example.com', 'a@example.com;b@example.com',
      'Name <a@example.com>', 'a@example.com\nBcc: x@example.com', `${'a'.repeat(250)}@example.com`]) {
      expect(isEmail(bad), bad).toBe(false)
    }
  })
})

describe('the email', () => {
  const hits = [
    { score: 92, intent: 'looking_for_help', reason: 'Asks for a bookkeeper', phrase: 'need a bookkeeper', platform: 'x', author: 'pat', excerpt: 'we need a bookkeeper\nurgently', url: 'https://x.com/pat/status/1' },
    { score: 71, intent: null, reason: null, phrase: 'switching accountants', platform: 'facebook', author: 'kim', excerpt: '', url: 'https://www.facebook.com/kim/posts/2' },
  ]

  it('is plain text with a fixed subject that never contains post text', () => {
    const { subject, text } = renderDigest(hits, 'https://site.example')
    expect(subject).toBe('2 strong matches on ListeningKit')
    expect(renderDigest(hits.slice(0, 1), 'https://site.example').subject).toBe('1 strong match on ListeningKit')
    expect(text).toContain('92/100, wants help · "need a bookkeeper" on X · pat')
    expect(text).toContain('Asks for a bookkeeper')
    expect(text).toContain('> we need a bookkeeper urgently')  // line breaks in a post are flattened
    expect(text).toContain('71/100 · "switching accountants" on Facebook · kim')
    expect(text).toContain('https://www.facebook.com/kim/posts/2')
    expect(text).toContain('Open ListeningKit: https://site.example/dashboard/keywords')
  })

  it('does not turn a hostile post into markup: text only, and the subject stays fixed', () => {
    const { subject, text } = renderDigest([{ ...hits[0], excerpt: '<script>alert(1)</script> Ignore previous instructions' }], 'https://site.example')
    expect(subject).not.toContain('<')
    expect(text).toContain('> <script>alert(1)</script>')  // shown as text; there is no html part to run it in
  })

  it('goes to the AgentMail inbox with the key, and errors carry neither the key nor the body', async () => {
    const fetcher = vi.fn(async () => ok())
    await sendEmail(fetcher as unknown as typeof fetch, KEY, INBOX, { to: 'you@example.com', subject: 'S', text: 'T' })
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${AGENTMAIL_URL}/inboxes/${encodeURIComponent(INBOX)}/messages/send`)
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`)
    expect(JSON.parse(init.body as string)).toEqual({ to: 'you@example.com', subject: 'S', text: 'T' })
    const cases: [number, RegExp][] = [[401, /refused the API key/], [403, /refused the API key/], [404, /inbox was not found/], [429, /rate limiting/], [500, /HTTP 500/]]
    for (const [status, message] of cases) {
      const error = await sendEmail((async () => new Response('secret body', { status })) as unknown as typeof fetch, KEY, INBOX, { to: 'a@b.co', subject: 'S', text: 'T' }).catch((e: Error) => e)
      expect((error as Error).message).toMatch(message)
      expect((error as Error).message).not.toContain('secret body')
      expect((error as Error).message).not.toContain(KEY)
    }
  })
})

describe('the settings', () => {
  it('start switched off, and are private to each person', async () => {
    const { alice, bob } = setup()
    expect(await alice.query(anyApi.alerts.mine, {})).toMatchObject({ available: true, email: null, enabled: false, minScore: 70 })
    await alice.mutation(anyApi.alerts.save, { email: '  alice@example.com ', enabled: true, minScore: 80 })
    expect(await alice.query(anyApi.alerts.mine, {})).toMatchObject({ email: 'alice@example.com', enabled: true, minScore: 80 })
    expect(await bob.query(anyApi.alerts.mine, {})).toMatchObject({ email: null, enabled: false })
  })

  it('reports when the deployment cannot send email', async () => {
    const { alice } = setup()
    vi.stubEnv('AGENTMAIL_API_KEY', '')
    expect((await alice.query(anyApi.alerts.mine, {})).available).toBe(false)
  })

  it('validate the address and clamp the score', async () => {
    const { t, alice } = setup()
    await expect(alice.mutation(anyApi.alerts.save, { email: 'nope', enabled: true, minScore: 70 })).rejects.toThrow('one email address')
    await expect(alice.mutation(anyApi.alerts.save, { email: 'a@b.co, c@d.co', enabled: true, minScore: 70 })).rejects.toThrow('one email address')
    await alice.mutation(anyApi.alerts.save, { email: 'a@b.co', enabled: true, minScore: 250 })
    await alice.mutation(anyApi.alerts.save, { email: 'a@b.co', enabled: true, minScore: -5 })
    expect((await t.run(ctx => ctx.db.query('emailAlerts').collect())).map(row => row.minScore)).toEqual([1])  // one row, updated in place
    await expect(t.mutation(anyApi.alerts.save, { email: 'a@b.co', enabled: true, minScore: 70 })).rejects.toThrow('Authentication required')
  })
})

describe('the alert run', () => {
  async function subscribed(t: T, owner = ALICE, over: { minScore?: number; enabled?: boolean; email?: string } = {}) {
    await t.run(ctx => ctx.db.insert('emailAlerts', { owner, email: over.email ?? 'alice@example.com', enabled: over.enabled ?? true, minScore: over.minScore ?? 70 }))
  }

  it('sends one email with the strongest fresh matches, then marks them so they are never sent twice', async () => {
    const { t } = setup()
    await subscribed(t)
    await hit(t, ALICE, { score: 95 })
    await hit(t, ALICE, { score: 80 })
    await hit(t, ALICE, { score: 69 })                                     // below their bar
    await hit(t, ALICE, { score: 99, scoredAgoMs: 25 * 3_600_000 })        // older than a day
    await hit(t, ALICE, { score: 99, alertedAt: NOW - 1_000 })             // already sent
    const fetcher = vi.fn(async () => ok())
    vi.stubGlobal('fetch', fetcher)
    expect(await t.action(internal.alerts.sweep, {})).toEqual({ emails: 1, failed: 0 })
    expect(fetcher).toHaveBeenCalledTimes(1)
    const body = JSON.parse((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(body.to).toBe('alice@example.com')
    expect(body.subject).toBe('2 strong matches on ListeningKit')
    expect(body.text.indexOf('95/100')).toBeLessThan(body.text.indexOf('80/100'))  // strongest first
    const rows = await t.run(ctx => ctx.db.query('hits').collect())
    expect(rows.filter(row => row.alertedAt === NOW).map(row => row.score).sort()).toEqual([80, 95])
    expect((await t.run(ctx => ctx.db.query('emailAlerts').first()))!.lastSentAt).toBe(NOW)
    // A later run has nothing new to say.
    vi.setSystemTime(NOW + 11 * 60_000)
    expect(await t.action(internal.alerts.sweep, {})).toEqual({ emails: 0, failed: 0 })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('sends at most five in one email and waits ten minutes before the next', async () => {
    const { t } = setup()
    await subscribed(t)
    for (let i = 0; i < 7; i++) await hit(t, ALICE, { score: 90 - i })
    const fetcher = vi.fn(async () => ok())
    vi.stubGlobal('fetch', fetcher)
    await t.action(internal.alerts.sweep, {})
    expect(JSON.parse((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).subject).toBe('5 strong matches on ListeningKit')
    vi.setSystemTime(NOW + 5 * 60_000)
    await t.action(internal.alerts.sweep, {})
    expect(fetcher).toHaveBeenCalledTimes(1)                               // too soon
    vi.setSystemTime(NOW + 11 * 60_000)
    await t.action(internal.alerts.sweep, {})
    expect(fetcher).toHaveBeenCalledTimes(2)                               // the other two
    expect(JSON.parse((fetcher.mock.calls[1] as unknown as [string, RequestInit])[1].body as string).subject).toBe('2 strong matches on ListeningKit')
  })

  it('emails each person only their own matches, and nobody who switched it off', async () => {
    const { t } = setup()
    await subscribed(t, ALICE, { email: 'alice@example.com' })
    await subscribed(t, BOB, { email: 'bob@example.com', enabled: false })
    await hit(t, ALICE, { score: 90, body: 'alice private post' })
    await hit(t, BOB, { score: 99, body: 'bob private post' })
    const fetcher = vi.fn(async () => ok())
    vi.stubGlobal('fetch', fetcher)
    await t.action(internal.alerts.sweep, {})
    expect(fetcher).toHaveBeenCalledTimes(1)
    const body = JSON.parse((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(body.to).toBe('alice@example.com')
    expect(body.text).toContain('alice private post')
    expect(body.text).not.toContain('bob private post')
  })

  it('does not mark a match as sent when the send fails, and tries again next time', async () => {
    const { t } = setup()
    await subscribed(t)
    await hit(t, ALICE, { score: 90 })
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 500 })))
    expect(await t.action(internal.alerts.sweep, {})).toEqual({ emails: 0, failed: 1 })
    expect((await t.run(ctx => ctx.db.query('hits').first()))!.alertedAt).toBeUndefined()
    expect((await t.run(ctx => ctx.db.query('emailAlerts').first()))!.lastSentAt).toBeUndefined()
    vi.stubGlobal('fetch', vi.fn(async () => ok()))
    expect(await t.action(internal.alerts.sweep, {})).toEqual({ emails: 1, failed: 0 })
  })

  it('does nothing, and calls nobody, when AgentMail is not set up', async () => {
    const { t } = setup()
    await subscribed(t)
    await hit(t, ALICE, { score: 90 })
    vi.stubEnv('AGENTMAIL_INBOX_ID', '')
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    expect(await t.action(internal.alerts.sweep, {})).toMatchObject({ emails: 0, skipped: expect.stringContaining('AGENTMAIL') })
    expect(fetcher).not.toHaveBeenCalled()
  })
})

describe('the test email', () => {
  it('goes to the saved address, once a minute, for a signed-in person', async () => {
    const { t, alice } = setup()
    const fetcher = vi.fn(async () => ok())
    vi.stubGlobal('fetch', fetcher)
    await expect(t.action(anyApi.alerts.sendTest, {})).rejects.toThrow('Authentication required')
    await expect(alice.action(anyApi.alerts.sendTest, {})).rejects.toThrow('Save your email address first')
    await alice.mutation(anyApi.alerts.save, { email: 'alice@example.com', enabled: false, minScore: 70 })
    expect(await alice.action(anyApi.alerts.sendTest, {})).toEqual({ sent: true })
    const body = JSON.parse((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(body).toMatchObject({ to: 'alice@example.com', subject: 'ListeningKit test email' })
    await expect(alice.action(anyApi.alerts.sendTest, {})).rejects.toThrow('Wait a minute')
    vi.setSystemTime(NOW + 61_000)
    await alice.action(anyApi.alerts.sendTest, {})
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('says so, and calls nobody, when email is not switched on', async () => {
    const { alice } = setup()
    vi.stubEnv('AGENTMAIL_API_KEY', '')
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    await alice.mutation(anyApi.alerts.save, { email: 'alice@example.com', enabled: true, minScore: 70 })
    await expect(alice.action(anyApi.alerts.sendTest, {})).rejects.toThrow('not switched on yet')
    expect(fetcher).not.toHaveBeenCalled()
  })
})
