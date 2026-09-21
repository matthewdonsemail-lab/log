import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { internal } from './_generated/api'
import { BRAND_SCHEMA, businessSummary, FIRECRAWL_URL, normalizeWebsite, parseBrandFacts, scrapeBrand } from './lib/firecrawl'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './brand.ts': () => import('./brand'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './reddit.ts': () => import('./reddit'),
  './scoring.ts': () => import('./scoring'),
  './watch.ts': () => import('./watch'),
  './webhooks.ts': () => import('./webhooks'),
}

const KEY = 'fc-test-key-not-real'
const NOW = Date.UTC(2026, 8, 21, 12)
const GOOD_JSON = {
  name: 'Acme Books', tagline: 'Bookkeeping for tradespeople',
  offerings: [{ name: 'Monthly bookkeeping', detail: 'Fixed fee' }, { name: 'Tax returns' }],
  tone: 'friendly and plain-spoken', formality: 'casual', location: 'Leeds', logo_url: 'https://acme.example/logo.png',
}
const firecrawlReply = (json: unknown, over: Record<string, unknown> = {}, status = 200) =>
  new Response(JSON.stringify({ success: true, data: { json, metadata: { statusCode: 200 } }, ...over }), { status })

beforeEach(() => {
  vi.stubEnv('FIRECRAWL_API_KEY', KEY)
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

describe('the website address', () => {
  it('accepts a normal site and adds https', () => {
    expect(normalizeWebsite('acmebooks.com')).toEqual({ ok: true, url: 'https://acmebooks.com/' })
    expect(normalizeWebsite('  http://www.acmebooks.co.uk/about#team  ')).toEqual({ ok: true, url: 'https://www.acmebooks.co.uk/about' })
  })

  it('refuses anything that is not a public website', () => {
    for (const bad of ['', '   ', 'localhost', 'http://localhost:3000', '127.0.0.1', 'http://10.0.0.5/admin', 'http://[::1]/', 'printer.local',
      'intranet', 'javascript:alert(1)', 'ftp://acmebooks.com', 'https://user:pass@acmebooks.com', 'not a url']) {
      expect(normalizeWebsite(bad).ok, bad).toBe(false)
    }
  })
})

describe('what the website says', () => {
  it('keeps clean facts and drops what it cannot trust', () => {
    const facts = parseBrandFacts(GOOD_JSON)
    expect(facts).toEqual({
      name: 'Acme Books', tagline: 'Bookkeeping for tradespeople',
      offerings: [{ name: 'Monthly bookkeeping', detail: 'Fixed fee' }, { name: 'Tax returns', detail: '' }],
      tone: 'friendly and plain-spoken', formality: 'casual', locationLabel: 'Leeds', logoUrl: 'https://acme.example/logo.png',
    })
  })

  it('caps sizes, ignores wrong types, and accepts only https logos and known formalities', () => {
    const facts = parseBrandFacts({
      name: `  ${'N'.repeat(500)}  `, tagline: 42, tone: ['x'], formality: 'shouting',
      offerings: [...Array.from({ length: 20 }, (_, i) => ({ name: `Service ${i}`, detail: 'd'.repeat(999) })), 'junk', null, { detail: 'no name' }],
      logo_url: 'javascript:alert(1)',
    })
    expect(facts!.name).toHaveLength(120)
    expect(facts!.tagline).toBe('')
    expect(facts!.offerings).toHaveLength(8)
    expect(facts!.offerings[0].detail).toHaveLength(200)
    expect(facts).not.toHaveProperty('tone')
    expect(facts).not.toHaveProperty('formality')
    expect(facts).not.toHaveProperty('logoUrl')
    expect(parseBrandFacts({ name: 'A', logo_url: 'http://insecure.example/logo.png' })).not.toHaveProperty('logoUrl')
  })

  it('treats "N/A" and its cousins as nothing, not as a fact (Firecrawl really answered location "N/A")', () => {
    const facts = parseBrandFacts({
      name: 'Acme', tagline: 'Not specified', tone: 'N/A', location: 'n/a', logo_url: 'none',
      offerings: [{ name: 'Payroll', detail: 'Unknown' }, { name: 'None' }, { name: 'Tax', detail: 'No information' }],
    })
    expect(facts).toEqual({ name: 'Acme', tagline: '', offerings: [{ name: 'Payroll', detail: '' }, { name: 'Tax', detail: '' }] })
    expect(parseBrandFacts({ name: 'N/A' })).toBeNull()
    expect(parseBrandFacts({ name: 'Nadia None Bakery', location: 'Notting Hill' })).toMatchObject({ name: 'Nadia None Bakery', locationLabel: 'Notting Hill' })
  })

  it('has no facts for an empty or nameless page, so nothing is invented', () => {
    for (const raw of [null, undefined, 'text', [], {}, { name: '   ' }, { name: 7 }, { tagline: 'no name' }]) expect(parseBrandFacts(raw)).toBeNull()
  })

  it('summarises the business briefly for the scoring prompt', () => {
    expect(businessSummary(null)).toBeNull()
    expect(businessSummary({ name: 'Acme Books', tagline: 'Bookkeeping', offerings: [{ name: 'Payroll' }, { name: 'Tax' }] })).toBe('Acme Books — Bookkeeping — Offers: Payroll, Tax')
    expect(businessSummary({ name: 'A'.repeat(900), tagline: '', offerings: [] })).toHaveLength(500)
  })
})

describe('the Firecrawl call', () => {
  it('sends the address, the schema and the key, and returns the facts', async () => {
    const fetcher = vi.fn(async () => firecrawlReply(GOOD_JSON))
    const facts = await scrapeBrand(fetcher as unknown as typeof fetch, KEY, 'https://acmebooks.com/')
    expect(facts.name).toBe('Acme Books')
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(FIRECRAWL_URL)
    expect(url).toBe('https://api.firecrawl.dev/v2/scrape')
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`)
    const body = JSON.parse(init.body as string)
    expect(body.url).toBe('https://acmebooks.com/')
    expect(body.formats).toEqual([{ type: 'json', schema: BRAND_SCHEMA }])
  })

  it('says what went wrong in plain words, without the key or the response body', async () => {
    const cases: [Response, RegExp][] = [
      [new Response('sk-leak', { status: 401 }), /refused the API key/],
      [new Response('sk-leak', { status: 402 }), /out of credits/],
      [new Response('sk-leak', { status: 429 }), /busy/],
      [new Response('sk-leak', { status: 500 }), /HTTP 500/],
      [firecrawlReply(GOOD_JSON, { success: false }), /could not read that website/],
      [new Response(JSON.stringify({ success: true, data: { json: GOOD_JSON, metadata: { statusCode: 404 } } })), /HTTP 404/],
      [firecrawlReply({ tagline: 'no name' }), /did not say enough/],
    ]
    for (const [response, message] of cases) {
      const error = await scrapeBrand((async () => response) as unknown as typeof fetch, KEY, 'https://acmebooks.com/').catch((e: Error) => e)
      expect((error as Error).message).toMatch(message)
      expect((error as Error).message).not.toContain('sk-leak')
      expect((error as Error).message).not.toContain(KEY)
    }
  })
})

describe('reading a website', () => {
  it('needs a signed-in person', async () => {
    const { t } = setup()
    await expect(t.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' })).rejects.toThrow('Authentication required')
  })

  it('reads, stores and returns the facts, and only that person can see them', async () => {
    const { alice, bob } = setup()
    const fetcher = vi.fn(async () => firecrawlReply(GOOD_JSON))
    vi.stubGlobal('fetch', fetcher)
    const facts = await alice.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' })
    expect(facts).toMatchObject({ name: 'Acme Books', sourceUrl: 'https://acmebooks.com/', formality: 'casual' })
    expect(await alice.query(anyApi.brand.mine, {})).toMatchObject({
      name: 'Acme Books', tone: 'friendly and plain-spoken', locationLabel: 'Leeds', summary: 'Acme Books — Bookkeeping for tradespeople — Offers: Monthly bookkeeping, Tax returns',
    })
    expect(await bob.query(anyApi.brand.mine, {})).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('says plainly when Firecrawl is not set up, and never calls out', async () => {
    const { alice } = setup()
    vi.stubEnv('FIRECRAWL_API_KEY', '')
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    await expect(alice.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' })).rejects.toThrow('not switched on yet')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('refuses an address that is not a public website before spending anything', async () => {
    const { alice } = setup()
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    await expect(alice.action(anyApi.brand.extractFromWebsite, { url: 'http://169.254.169.254/latest' })).rejects.toThrow('public website')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('surfaces a Firecrawl failure in plain words with no key in it', async () => {
    const { alice } = setup()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('secret body', { status: 402 })))
    const error = await alice.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' }).catch((e: Error) => e)
    expect(String((error as Error).message)).toContain('out of credits')
    expect(String((error as Error).message)).not.toContain(KEY)
    expect(await alice.query(anyApi.brand.mine, {})).toBeNull()  // a failed read stores nothing
  })

  it('makes a person wait between reads so the credits cannot be burned', async () => {
    const { alice } = setup()
    const fetcher = vi.fn(async () => firecrawlReply(GOOD_JSON))
    vi.stubGlobal('fetch', fetcher)
    await alice.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' })
    await expect(alice.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' })).rejects.toThrow('wait a few seconds')
    expect(fetcher).toHaveBeenCalledTimes(1)
    vi.setSystemTime(NOW + 31_000)
    await alice.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})

describe('the business in scoring', () => {
  async function seededHit(t: ReturnType<typeof setup>['t'], owner: string) {
    return await t.run(async ctx => {
      const accountId = await ctx.db.insert('accounts', { owner, platform: 'reddit', label: 'r', connectedAt: null })
      const keywordId = await ctx.db.insert('keywords', { owner, accountId, platform: 'reddit', phrase: 'need a bookkeeper', status: 'listening' })
      const postId = await ctx.db.insert('posts', {
        owner, accountId, platform: 'reddit', externalId: 'p1', authorName: 'pat', body: ['we need a bookkeeper'], title: 'Need a bookkeeper',
        url: 'https://www.reddit.com/r/smallbusiness/comments/p1/x/', likes: 1, comments: 0,
      })
      return await ctx.db.insert('hits', { owner, keywordId, postId, phrase: 'need a bookkeeper', platform: 'reddit' })
    })
  }

  it('tells the model about the owner’s business, and only theirs', async () => {
    const { t, alice } = setup()
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-not-real')
    vi.stubGlobal('fetch', vi.fn(async () => firecrawlReply(GOOD_JSON)))
    await alice.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' })
    const mine = await seededHit(t, 'https://test.example|alice')
    const theirs = await seededHit(t, 'https://test.example|bob')
    const rows = await t.query(internal.scoring.forScoring, { hitIds: [mine, theirs] })
    expect(rows.find(row => row.hitId === mine)!.business).toBe('Acme Books — Bookkeeping for tradespeople — Offers: Monthly bookkeeping, Tax returns')
    expect(rows.find(row => row.hitId === theirs)!.business).toBeNull()
  })

  it('sends that business to the model inside the fenced block', async () => {
    const { t, alice } = setup()
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-not-real')
    const scoreReply = new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ score: 88, intent: 'looking_for_help', reason: 'Asks for a bookkeeper' }) } }] }))
    const fetcher = vi.fn(async (url: string) => (String(url).includes('firecrawl') ? firecrawlReply(GOOD_JSON) : scoreReply.clone()))
    vi.stubGlobal('fetch', fetcher)
    await alice.action(anyApi.brand.extractFromWebsite, { url: 'acmebooks.com' })
    await seededHit(t, 'https://test.example|alice')
    await t.action(internal.scoring.backfill, {})
    const openaiCall = fetcher.mock.calls.find(call => !String(call[0]).includes('firecrawl'))!
    const prompt = JSON.parse((openaiCall[1] as RequestInit).body as string).messages[1].content as string
    expect(prompt).toMatch(/<business>\nAcme Books/)
  })
})
