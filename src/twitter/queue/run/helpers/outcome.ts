import type { TwitterSessionAnswer } from '../../../account/session/index'
import type { PlanEvent, Queue, QueueItem } from '../../plan/index'
import { toAPerson } from '../../plan/types'
import { networkError } from '../../../live/feed/index'
import type { FailureKind, XRefusal } from '../types'

export function failureOf(answer: TwitterSessionAnswer): FailureKind {
  if (answer.event === 'sessionDead' || answer.event === 'restricted' || answer.code === 'noSession') return 'auth'
  if (answer.event === 'gone') return 'gone'
  if (answer.event === 'tooBig' || answer.code === 'authorTooBig') return 'tooBig'
  if (answer.event && answer.event !== 'failed') return 'refused'
  const said = `${answer.code ?? ''} ${answer.detail ?? ''}`
  if (answer.code === 'governorBlocked' || answer.code === 'rateLimited' || answer.httpStatus === 429 || /(?<!\d)429(?!\d)/.test(said)) return 'refused'
  if (networkError(said)) return 'network'
  return 'broken'
}

export function refusalOf(answer: TwitterSessionAnswer, nowMs: number): XRefusal {
  return { code: answer.code ?? answer.event ?? 'failed', detail: (answer.detail ?? '').slice(0, 300), at: new Date(nowMs).toISOString() }
}

export function succeeded(answer: TwitterSessionAnswer, kind: PlanEvent['kind']): boolean {
  if (!answer.ok || answer.event !== 'sent') return false
  return kind === 'like' ? answer.liked === true : Boolean(answer.tweetId || answer.conversationId)
}

export function sentUrlOf(queue: Queue, item: QueueItem, answer: TwitterSessionAnswer): string | null {
  return toAPerson(item.action) ? null : `https://x.com/${queue.account}/status/${answer.tweetId}`
}

export const saidOf = (answer: TwitterSessionAnswer) => `${answer.code ?? answer.event ?? 'failed'}: ${(answer.detail ?? '').slice(0, 200)}`
