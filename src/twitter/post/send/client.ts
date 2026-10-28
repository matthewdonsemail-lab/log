import { DEFAULT_COPY_STYLE, styleHint, styleProblems } from '../../copy/style/index'
import type { SendAction, SendPlan, SendRequest } from './types'

export const TWEET_URL = /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+/

export const WITH_TEXT: readonly SendAction[] = ['reply', 'quote', 'dm']

export function targetOf(request: Pick<SendRequest, 'action' | 'tweetUrl' | 'userId'>): string | undefined {
  return request.action === 'dm' ? request.userId : request.tweetUrl
}

export function planSend(request: SendRequest): SendPlan {
  const target = targetOf(request)?.trim()
  if (!target) return { ok: false, problem: { code: 'targetMissing', detail: request.action === 'dm' ? 'dm needs --userId, the recipient from treg research' : `${request.action} needs --tweet, the post's url` } }
  if (request.action !== 'dm' && !TWEET_URL.test(target)) return { ok: false, problem: { code: 'tweetUrlInvalid', detail: `${target} isn't an x.com post url (https://x.com/<handle>/status/<id>)` } }
  if (request.action === 'dm' && !/^\d+$/.test(target)) return { ok: false, problem: { code: 'userIdInvalid', detail: `${target} isn't an X user id (digits only)` } }
  const text = request.text?.trim()
  if (WITH_TEXT.includes(request.action) && !text) return { ok: false, problem: { code: 'textMissing', detail: `${request.action} needs --text` } }
  if (text && !request.skipStyleCheck) {
    const style = request.style?.trim() || DEFAULT_COPY_STYLE
    const problems = styleProblems(text, style)
    if (problems.length) return { ok: false, problem: { code: 'styleFailed', detail: `the ${style} style check failed: ${problems.join(', ')} (${styleHint(style)})` } }
  }
  const approvedBy = request.approvedBy?.trim()
  if (request.live && !approvedBy) return { ok: false, problem: { code: 'notApproved', detail: `${request.action} sends on X: --approvedBy <who approved it> is needed with --live` } }
  return {
    ok: true,
    target,
    spec: {
      action: request.action,
      live: request.live,
      approvedBy,
      ...(request.action === 'dm' ? { userId: target } : { tweetUrl: target }),
      ...(text ? { text } : {})
    }
  }
}
