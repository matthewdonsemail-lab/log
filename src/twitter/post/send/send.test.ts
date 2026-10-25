import { describe, expect, test } from 'bun:test'
import { planSend } from './index'

const POST = 'https://x.com/someone/status/1900000000000000000'

describe('planSend', () => {
  test('a reply with house-style copy plans the engine spec, live only when asked', () => {
    expect(planSend({ action: 'reply', tweetUrl: POST, text: 'love this', live: false })).toEqual({ ok: true, target: POST, spec: { action: 'reply', live: false, approvedBy: undefined, tweetUrl: POST, text: 'love this' } })
    const live = planSend({ action: 'reply', tweetUrl: POST, text: 'love this', approvedBy: 'matt', live: true })
    expect(live.ok && live.spec).toMatchObject({ live: true, approvedBy: 'matt' })
  })

  test('live needs who approved it; a dry run does not', () => {
    expect(planSend({ action: 'like', tweetUrl: POST, live: true })).toMatchObject({ ok: false, problem: { code: 'notApproved' } })
    expect(planSend({ action: 'like', tweetUrl: POST, live: false }).ok).toBe(true)
  })

  test('the target, the text and the style are checked before X is called', () => {
    expect(planSend({ action: 'quote', text: 'yes', live: false })).toMatchObject({ ok: false, problem: { code: 'targetMissing' } })
    expect(planSend({ action: 'reply', tweetUrl: 'https://example.com/x', text: 'yes', live: false })).toMatchObject({ ok: false, problem: { code: 'tweetUrlInvalid' } })
    expect(planSend({ action: 'dm', userId: '@bob', text: 'yes', live: false })).toMatchObject({ ok: false, problem: { code: 'userIdInvalid' } })
    expect(planSend({ action: 'dm', userId: '42', live: false })).toMatchObject({ ok: false, problem: { code: 'textMissing' } })
    expect(planSend({ action: 'reply', tweetUrl: POST, text: 'Great, thanks.', live: false })).toMatchObject({ ok: false, problem: { code: 'styleFailed' } })
    expect(planSend({ action: 'reply', tweetUrl: POST, text: 'Great, thanks.', skipStyleCheck: true, live: false }).ok).toBe(true)
  })
})
