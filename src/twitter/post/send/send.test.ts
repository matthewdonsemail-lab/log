import { describe, expect, test } from 'bun:test'
import { resolve } from 'node:path'
import { mediaProblem, NEW_POST, planSend } from './index'

const POST = 'https://x.com/someone/status/1900000000000000000'

describe('planSend', () => {
  test('a reply with house-style copy plans the engine spec, live only when asked', () => {
    expect(planSend({ action: 'reply', tweetUrl: POST, text: 'love this', live: false })).toMatchObject({ ok: true, target: POST, watermark: { level: 'clean', statistical: 'unknown' }, spec: { action: 'reply', live: false, approvedBy: undefined, tweetUrl: POST, text: 'love this' } })
    const live = planSend({ action: 'reply', tweetUrl: POST, text: 'love this', approvedBy: 'matt', live: true })
    expect(live.ok && live.spec).toMatchObject({ live: true, approvedBy: 'matt' })
  })

  test('live needs who approved it; a dry run does not', () => {
    expect(planSend({ action: 'like', tweetUrl: POST, live: true })).toMatchObject({ ok: false, problem: { code: 'notApproved' } })
    expect(planSend({ action: 'like', tweetUrl: POST, live: false }).ok).toBe(true)
    expect(planSend({ action: 'repost', tweetUrl: POST, live: true })).toMatchObject({ ok: false, problem: { code: 'notApproved' } })
    expect(planSend({ action: 'repost', tweetUrl: POST, live: false }).ok).toBe(true)
  })

  test('the target, the text and the style are checked before X is called', () => {
    expect(planSend({ action: 'quote', text: 'yes', live: false })).toMatchObject({ ok: false, problem: { code: 'targetMissing' } })
    expect(planSend({ action: 'reply', tweetUrl: 'https://example.com/x', text: 'yes', live: false })).toMatchObject({ ok: false, problem: { code: 'tweetUrlInvalid' } })
    expect(planSend({ action: 'dm', userId: '@bob', text: 'yes', live: false })).toMatchObject({ ok: false, problem: { code: 'userIdInvalid' } })
    expect(planSend({ action: 'dm', userId: '42', live: false })).toMatchObject({ ok: false, problem: { code: 'textMissing' } })
    expect(planSend({ action: 'reply', tweetUrl: POST, text: 'Great, thanks.', live: false })).toMatchObject({ ok: false, problem: { code: 'styleFailed' } })
    expect(planSend({ action: 'reply', tweetUrl: POST, text: 'Great, thanks.', skipStyleCheck: true, live: false }).ok).toBe(true)
  })

  test('a post needs no target, only its text, and carries its media as full paths', () => {
    const sizes: Record<string, number> = { [resolve('clip.mp4')]: 3_000_000 }
    const sizeOf = (p: string) => sizes[p] ?? null
    const plan = planSend({ action: 'post', text: 'one in 173', media: ['clip.mp4'], live: false }, sizeOf)
    expect(plan).toMatchObject({ ok: true, target: NEW_POST, watermark: { level: 'clean' }, spec: { action: 'post', live: false, approvedBy: undefined, text: 'one in 173', media: [resolve('clip.mp4')] } })
    expect(planSend({ action: 'post', live: false })).toMatchObject({ ok: false, problem: { code: 'textMissing' } })
    expect(planSend({ action: 'post', text: 'Hello, world.', live: false })).toMatchObject({ ok: false, problem: { code: 'styleFailed' } })
    expect(planSend({ action: 'post', text: 'one in 173', media: ['clip.mp4'], live: true }, sizeOf)).toMatchObject({ ok: false, problem: { code: 'notApproved' } })
    expect(planSend({ action: 'reply', tweetUrl: POST, text: 'yes', media: ['clip.mp4'], live: false }, sizeOf)).toMatchObject({ ok: false, problem: { code: 'mediaInvalid' } })
  })

  test('media is checked before X is called: type, size, a video alone, at most 4 images', () => {
    const sizeOf = (p: string) => (p.includes('missing') ? null : p.includes('empty') ? 0 : p.includes('huge') ? 600 * 1024 * 1024 : p.includes('big') ? 6 * 1024 * 1024 : 1000)
    expect(mediaProblem([], sizeOf)).toBeNull()
    expect(mediaProblem(['a.mp4'], sizeOf)).toBeNull()
    expect(mediaProblem(['a.jpg', 'b.png', 'c.webp', 'd.jpeg'], sizeOf)).toBeNull()
    expect(mediaProblem(['a.txt'], sizeOf)?.code).toBe('mediaInvalid')
    expect(mediaProblem(['missing.mp4'], sizeOf)?.detail).toContain('no such file')
    expect(mediaProblem(['empty.png'], sizeOf)?.detail).toContain('empty')
    expect(mediaProblem(['big.jpg'], sizeOf)?.detail).toContain('5 MB')
    expect(mediaProblem(['huge.mov'], sizeOf)?.detail).toContain('512 MB')
    expect(mediaProblem(['a.mp4', 'b.jpg'], sizeOf)?.detail).toContain('alone')
    expect(mediaProblem(['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg'], sizeOf)?.detail).toContain('up to 4')
  })
})
