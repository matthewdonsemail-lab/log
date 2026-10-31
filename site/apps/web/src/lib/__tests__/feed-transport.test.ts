import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getFeed, syncFeed } from '../feed'
import { setApiTokenProvider } from '../transport'

beforeEach(() => {
  vi.stubEnv('VITE_API_MODE', 'mock')
  setApiTokenProvider(async () => 'user-access-token')
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); setApiTokenProvider(async () => null) })

describe('feed transport', () => {
  it('preserves legacy platform calls and object search filters', async () => {
    const legacy = await getFeed('reddit')
    expect(legacy.items.length).toBeGreaterThan(0)
    expect(legacy.items.every(item => item.platform === 'reddit')).toBe(true)
    expect(await getFeed({ platform: 'reddit', search: 'a-definitely-missing-phrase' })).toEqual({ items: [] })
    await expect(getFeed('invalid')).rejects.toThrow('platform')
  })

  it('keeps empty live results empty and sends filters without service credentials', async () => {
    vi.stubEnv('VITE_API_MODE', 'live')
    vi.stubEnv('VITE_API_BASE_URL', '/api')
    const fetcher = vi.fn().mockResolvedValue(Response.json({ items: [] }))
    vi.stubGlobal('fetch', fetcher)
    expect(await getFeed({ platform: 'x', search: ' hello world ' })).toEqual({ items: [] })
    expect(fetcher).toHaveBeenCalledWith('/api/feed?platform=x&search=hello+world', expect.objectContaining({
      credentials: 'omit', headers: expect.any(Headers),
    }))
    const headers = fetcher.mock.calls[0][1].headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer user-access-token')
  })

  it('does not hide HTTP, network, or schema errors behind mock rows', async () => {
    vi.stubEnv('VITE_API_MODE', 'live')
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 401 }))
    vi.stubGlobal('fetch', fetcher)
    await expect(getFeed()).rejects.toThrow('401')
    fetcher.mockRejectedValueOnce(new Error('offline'))
    await expect(getFeed()).rejects.toThrow('offline')
    fetcher.mockResolvedValueOnce(Response.json({ items: [{ likes: '4 comments' }] }))
    await expect(getFeed()).rejects.toThrow('invalid response')
  })

  it('rejects invalid mode instead of silently choosing mocks', async () => {
    vi.stubEnv('VITE_API_MODE', 'production')
    await expect(getFeed()).rejects.toThrow('VITE_API_MODE')
  })

  it('syncs one subreddit through the live API and validates the summary', async () => {
    vi.stubEnv('VITE_API_MODE', 'live')
    vi.stubEnv('VITE_API_BASE_URL', '/api')
    const fetcher = vi.fn().mockResolvedValue(Response.json({ accountId: 'a1', fetched: 3, ingested: 2, skipped: 1 }))
    vi.stubGlobal('fetch', fetcher)
    expect(await syncFeed(' marketing ')).toEqual({ accountId: 'a1', fetched: 3, ingested: 2, skipped: 1 })
    expect(fetcher).toHaveBeenCalledWith('/api/feed/sync', expect.objectContaining({ method: 'POST' }))
    const body = JSON.parse(fetcher.mock.calls[0][1].body as string)
    expect(body).toEqual({ subreddit: 'marketing', limit: 25 })
    await expect(syncFeed('bad name!')).rejects.toThrow('Subreddit')
    fetcher.mockResolvedValueOnce(Response.json({ accountId: 'a1' }))
    await expect(syncFeed('marketing')).rejects.toThrow('invalid response')
  })

  it('refuses mock-mode sync instead of pretending to ingest', async () => {
    await expect(syncFeed('marketing')).rejects.toThrow('VITE_API_MODE=live')
  })
})
