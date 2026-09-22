import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { extractBrandFromUrl } from '../brand'
import { alertSettingsSchema, MIN_SCORE_CHOICES, saveAlertSettings, sendTestAlert } from '../live-alerts'
import { applyWebsiteFacts, brandOnConvex, readingIsOff, readSiteMap, readWebsite, websiteFactsSchema } from '../live-brand'
import { setApiTokenProvider } from '../transport'

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

const FACTS = {
  name: 'Acme Books', tagline: 'Bookkeeping for tradespeople', sourceUrl: 'https://acmebooks.com/about',
  offerings: [{ name: 'Monthly bookkeeping', detail: 'Fixed fee' }],
  tone: 'friendly and plain-spoken', formality: 'casual' as const, locationLabel: 'Leeds', logoUrl: 'https://acmebooks.com/logo.png',
}

beforeEach(() => {
  calls.length = 0
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
  setApiTokenProvider(async () => 'token')
})
afterEach(() => { vi.unstubAllEnvs(); setApiTokenProvider(async () => null) })

describe('reading the website', () => {
  it('sends the trimmed address and returns validated facts', async () => {
    reply = () => FACTS
    expect(await readWebsite('  acmebooks.com  ')).toEqual(FACTS)
    expect(calls[0]).toEqual({ ref: 'brand:extractFromWebsite', args: { url: 'acmebooks.com' } })
  })

  it("shows the server's plain-words reason, and hides anything else behind a fallback", async () => {
    reply = () => new ConvexError('That website took too long to read. Try again.')
    await expect(readWebsite('acmebooks.com')).rejects.toThrow('took too long')
    reply = () => new Error('Server Error: stack trace with details')
    await expect(readWebsite('acmebooks.com')).rejects.toThrow('Could not read that website')
    reply = () => ({ name: 'No other fields' })
    await expect(readWebsite('acmebooks.com')).rejects.toThrow('invalid response')
  })

  it('knows when reading is simply not switched on, so onboarding can carry on', async () => {
    reply = () => new ConvexError('Reading your website is not switched on yet.')
    const error = await readWebsite('acmebooks.com').catch((e: unknown) => e)
    expect(readingIsOff(error)).toBe(true)
    expect(readingIsOff(new Error('That website took too long to read.'))).toBe(false)
    expect(readingIsOff('nope')).toBe(false)
  })

  it('exists only on the live backend', () => {
    expect(brandOnConvex()).toBe(true)
    vi.stubEnv('VITE_API_MODE', 'mock')
    vi.stubEnv('VITE_CONVEX_URL', '')
    expect(brandOnConvex()).toBe(false)
  })

  it('accepts a page that gave only a name', () => {
    expect(websiteFactsSchema.safeParse({ name: 'A', tagline: '', offerings: [], sourceUrl: 'https://a.com/' }).success).toBe(true)
    expect(websiteFactsSchema.safeParse({ name: 'A', tagline: '', offerings: [], sourceUrl: 'https://a.com/', formality: 'shouting' }).success).toBe(false)
  })
})

describe('mapping the website', () => {
  it('sends the trimmed address and returns validated links', async () => {
    const map = {
      sourceUrl: 'https://acmebooks.com/',
      links: [{ url: 'https://acmebooks.com/', title: 'Acme Books' }, { url: 'https://acmebooks.com/services' }],
    }
    reply = () => map
    expect(await readSiteMap('  acmebooks.com  ')).toEqual(map)
    expect(calls[0]).toEqual({ ref: 'brand:mapWebsite', args: { url: 'acmebooks.com' } })
  })

  it('rejects an invalid map response', async () => {
    reply = () => ({ sourceUrl: 'https://acmebooks.com/' })
    await expect(readSiteMap('acmebooks.com')).rejects.toThrow('invalid response')
  })

  it('seeds no sources — pages only enter from a real read', () => {
    expect(extractBrandFromUrl('acmebooks.com').sources).toEqual([])
  })
})

describe('putting the facts into the brand', () => {
  const base = extractBrandFromUrl('acmebooks.com')

  it('replaces the guessed defaults with what the site said', () => {
    const brand = applyWebsiteFacts(base, FACTS)
    expect(brand.identity).toMatchObject({ name: 'Acme Books', website: 'https://acmebooks.com', tagline: 'Bookkeeping for tradespeople', logoUrl: 'https://acmebooks.com/logo.png' })
    expect(brand.voice).toMatchObject({ tone: 'friendly and plain-spoken', formality: 'casual' })
    expect(brand.location.label).toBe('Leeds')
    expect(brand.offerings).toEqual([{ name: 'Monthly bookkeeping', detail: 'Fixed fee' }])
    expect(brand.sourceUrl).toBe('https://acmebooks.com/about')
    expect(brand.channels).toEqual(base.channels)  // everything the site did not speak to is untouched
  })

  it('keeps the defaults for anything the site did not say, and invents nothing', () => {
    const brand = applyWebsiteFacts(base, { name: 'Acme Books', tagline: '', offerings: [], sourceUrl: 'https://acmebooks.com/' })
    expect(brand.identity.name).toBe('Acme Books')
    expect(brand.identity.tagline).toBe(base.identity.tagline)
    expect(brand.identity).not.toHaveProperty('logoUrl')
    expect(brand.voice).toEqual(base.voice)
    expect(brand.location).toEqual(base.location)
    expect(brand.offerings).toEqual([])
  })
})

describe('email alert settings', () => {
  it('validates what the server sends', () => {
    const ok = { available: true, email: 'a@b.co', enabled: true, minScore: 70, lastSentAt: null }
    expect(alertSettingsSchema.parse(ok)).toEqual(ok)
    expect(alertSettingsSchema.safeParse({ ...ok, minScore: 'high' }).success).toBe(false)
    expect(alertSettingsSchema.safeParse({ ...ok, email: null, lastSentAt: 5 }).success).toBe(true)
  })

  it('offers plain-worded bars that match the server range', () => {
    expect(MIN_SCORE_CHOICES.map((choice) => choice.value)).toEqual([60, 70, 80, 90])
    expect(MIN_SCORE_CHOICES.every((choice) => choice.value >= 1 && choice.value <= 100)).toBe(true)
  })

  it('saves and sends a test through the backend, with plain-words errors', async () => {
    reply = () => ({ email: 'a@b.co', enabled: true, minScore: 80 })
    await saveAlertSettings({ email: 'a@b.co', enabled: true, minScore: 80 })
    expect(calls[0]).toEqual({ ref: 'alerts:save', args: { email: 'a@b.co', enabled: true, minScore: 80 } })
    reply = () => ({ sent: true })
    await sendTestAlert()
    expect(calls[1]).toEqual({ ref: 'alerts:sendTest', args: {} })
    reply = () => new ConvexError('Wait a minute before sending another test.')
    await expect(sendTestAlert()).rejects.toThrow('Wait a minute')
    reply = () => new ConvexError('Enter one email address, like you@example.com.')
    await expect(saveAlertSettings({ email: 'x', enabled: true, minScore: 70 })).rejects.toThrow('one email address')
    reply = () => new Error('boom')
    await expect(saveAlertSettings({ email: 'a@b.co', enabled: true, minScore: 70 })).rejects.toThrow('Could not save your email settings')
    await expect(sendTestAlert()).rejects.toThrow('Could not send the test email')
  })
})
