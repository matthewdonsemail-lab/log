import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildTaste, candidatesFromXPosts, readTaste, tasteFit, tasteSummary, writeTaste } from './index'
import type { DecisionRequest, DecisionResponse } from '../../subq/decisions/index'

const POSTS = [
  { tweet_id: '1', created_at: 'Mon Nov 02 03:58:23 +0000 2026', text: 'put the fries in the bag https://t.co/abc', author: { screen_name: 'matthewsoldit' }, media: { video: [{ media_url_https: 'https://pbs.twimg.com/amplify_video_thumb/1/img/a.jpg', variants: [{ content_type: 'video/mp4', url: 'https://video.twimg.com/a.mp4', bitrate: 600 }] }] } },
  { tweet_id: '2', text: 'our dashboard', author: { screen_name: 'matthewsoldit' }, media: { photo: [{ media_url_https: 'https://pbs.twimg.com/media/b.jpg' }] } },
  { tweet_id: '3', text: 'no media' },
]

const picture = async () => new Response(new Uint8Array([255, 216, 255]), { status: 200, headers: { 'content-type': 'image/jpeg' } })

function deciding(answer: (request: DecisionRequest) => Record<string, unknown>) {
  const seen: DecisionRequest[] = []
  const decide = async (request: DecisionRequest): Promise<DecisionResponse> => {
    seen.push(request)
    return { model: 'test', answers: answer(request) as never, usage: { input_tokens: 1, output_tokens: 0 } }
  }
  return { seen, decide }
}

describe("matt's meme taste (rule 120)", () => {
  test('every picture in his X media posts is a candidate, its text without the t.co link', () => {
    const candidates = candidatesFromXPosts(POSTS)
    expect(candidates.map((c) => [c.url, c.kind, c.text])).toEqual([
      ['https://x.com/matthewsoldit/status/1', 'video', 'put the fries in the bag'],
      ['https://x.com/matthewsoldit/status/2', 'photo', 'our dashboard'],
    ])
    expect(candidates[0]?.mediaUrl).toBe('https://video.twimg.com/a.mp4')
  })

  test('SubQ reads each picture; only what it calls a meme is kept, with its style', async () => {
    const { seen, decide } = deciding((r) => ({ meme: { type: 'noul', noul: (r.state as { postText: string }).postText.includes('fries') ? 0.96 : 0.1 }, style: { type: 'choice', choice: 'larping', confidence: 0.6 } }))
    const index = await buildTaste(candidatesFromXPosts(POSTS), decide, 'posts.json', { fetcher: picture as never })
    expect(seen.every((r) => r.images?.length === 1)).toBe(true)
    expect(index.read).toBe(2)
    expect(index.memes.map((m) => [m.text, m.style])).toEqual([['put the fries in the bag', 'larping']])
    const path = join(mkdtempSync(join(tmpdir(), 'taste')), 'taste.json')
    writeTaste(index, path)
    expect(readTaste(path)?.memes.length).toBe(1)
  })

  test('the summary names the styles he gave, and what he has sent once there is an index', () => {
    expect(tasteSummary(null)).toContain('deepFried')
    expect(tasteSummary(null)).toContain('FlightReacts')
    const line = tasteSummary({ builtAt: '', from: '', read: 1, memes: [{ ...candidatesFromXPosts(POSTS)[0]!, meme: 0.9, style: 'larping', styleConfidence: 0.6 }] })
    expect(line).toContain('larping 1')
    expect(line).toContain('put the fries in the bag')
  })

  test('a template is scored against his taste from its picture', async () => {
    const { seen, decide } = deciding(() => ({ fit: { type: 'noul', noul: 0.82 }, style: { type: 'choice', choice: 'streamerReacts', confidence: 0.7 } }))
    const fit = await tasteFit(decide, null, { name: 'Jerry Jones pissed', description: 'a reaction' }, { mediaType: 'image/jpeg', base64: 'AA==' })
    expect(fit).toEqual({ fit: 0.82, style: 'streamerReacts', styleConfidence: 0.7 })
    expect((seen[0]?.state as { mattsTaste: string }).mattsTaste).toContain("matt's meme taste")
  })
})
