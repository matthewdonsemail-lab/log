import { describe, expect, test } from 'bun:test'
import { createMemelordClient, MEMELORD_API, MEMELORD_TOOLS, templatesIn, toolUrl } from './index'
import type { MemelordFetch } from './index'

const TEMPLATE = { id: 'abc', name: 'The horrors persist but so do I', type: 'meme', url: 'https://cdn.example/abc/main.webp', preview_url: 'https://cdn.example/abc/preview.webp', description: 'A man keeps going', text_slot_count: 2 }

function recorder(status: number, body: unknown) {
  const calls: { url: string; method: string; auth: string }[] = []
  const fetcher: MemelordFetch = async (url, init) => {
    calls.push({ url, method: init.method, auth: init.headers.Authorization ?? '' })
    return { status, json: async () => body }
  }
  return { calls, fetcher }
}

describe('the Memelord extension reaches only its four free tools (rules 41, 119)', () => {
  test('every tool is a GET under the v1 API, and nothing billable has a path', () => {
    expect(Object.keys(MEMELORD_TOOLS).sort()).toEqual(['getMemeTemplate', 'getTrendingMemes', 'listImageTools', 'searchMemes'])
    expect(toolUrl('searchMemes', { query: 'deploy on friday', limit: 3 })).toBe(`${MEMELORD_API}/templates/search?query=deploy+on+friday&limit=3`)
    expect(toolUrl('getMemeTemplate', {}, 'a b')).toBe(`${MEMELORD_API}/templates/a%20b`)
  })

  test('search sends the key as a bearer token with GET and reads the results', async () => {
    const r = recorder(200, { results: [TEMPLATE] })
    const answer = await createMemelordClient('mlord_live_test', r.fetcher).searchMemes({ query: 'deploy', type: 'meme', limit: 1 })
    expect(r.calls).toEqual([{ url: `${MEMELORD_API}/templates/search?query=deploy&type=meme&limit=1`, method: 'GET', auth: 'Bearer mlord_live_test' }])
    expect(answer.ok).toBe(true)
    expect(answer.data?.[0]).toMatchObject({ id: 'abc', name: TEMPLATE.name, type: 'meme', mediaUrl: TEMPLATE.url, textSlots: 2 })
  })

  test('trending reads the trending list with its cultural context', () => {
    expect(templatesIn({ count: 1, trending: [{ ...TEMPLATE, context: 'Used for persistence' }] })[0]?.context).toBe('Used for persistence')
  })

  test('no key: nothing is called, and the answer names memelordKeyMissing', async () => {
    const r = recorder(200, {})
    const answer = await createMemelordClient(null, r.fetcher).getTrendingMemes()
    expect(r.calls).toEqual([])
    expect(answer).toMatchObject({ ok: false, code: 'memelordKeyMissing' })
  })

  test("Memelord's own error is passed on with its code", async () => {
    const r = recorder(401, { success: false, code: 'API_KEY_INVALID', error: 'bad key' })
    expect(await createMemelordClient('mlord_live_x', r.fetcher).listImageTools()).toMatchObject({ ok: false, status: 401, code: 'API_KEY_INVALID', error: 'bad key' })
  })
})
