import { Hono } from 'hono'
import { facebookMessagingApp } from './facebook/server'
import { xMessagingApp } from './twitter/server'
import { redditMessagingApp } from './reddit/server'
import type {
  AckResponse,
  MessagesResponse,
  MessagingPlatform,
  SendInput,
  StartThreadInput,
  ThreadResult,
  ThreadsResponse
} from './types'

export * from './types'
export { MESSAGING_IDENTITIES, DEFAULT_MESSAGING_ACCOUNT, identityFor, type MessagingIdentity } from './identities'

/**
 * Hono-shaped messaging API, mirroring lib/feed. Mock-backed for now —
 * when the real backend lands, point these clients at it; routes and
 * response shapes stay the same. X lives at `/x` (canonical Platform);
 * `/twitter` stays as a legacy alias so old clients don't 404.
 */
export const messagingApp = new Hono()
  .route('/facebook', facebookMessagingApp)
  .route('/x', xMessagingApp)
  .route('/twitter', xMessagingApp)
  .route('/reddit', redditMessagingApp)

export type MessagingApp = typeof messagingApp

const PLATFORMS: MessagingPlatform[] = ['facebook', 'x', 'reddit']

async function asJson<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `${label} failed (${res.status})`)
  }
  return (await res.json()) as T
}

/** The selected account's inbox across three platforms (the dashboard's Messages view shapes this). */
export async function getThreads(accountId: string): Promise<ThreadsResponse> {
  const query = `?accountId=${encodeURIComponent(accountId)}`
  const responses = await Promise.all(PLATFORMS.map((platform) => messagingApp.request(`/${platform}/threads${query}`)))
  const lists = await Promise.all(responses.map((res, i) => asJson<ThreadsResponse>(res, `Threads request failed on ${PLATFORMS[i]}`)))
  return { threads: lists.flatMap((list) => list.threads) }
}

export async function getThreadMessages(platform: MessagingPlatform, accountId: string, threadId: string): Promise<MessagesResponse> {
  const res = await messagingApp.request(`/${platform}/threads/${threadId}/messages?accountId=${encodeURIComponent(accountId)}`)
  return asJson<MessagesResponse>(res, 'Messages request failed')
}

/** Send into an existing thread; resolves the created message + updated thread. */
export async function sendThreadMessage(platform: MessagingPlatform, accountId: string, threadId: string, input: SendInput): Promise<ThreadResult> {
  const res = await messagingApp.request(`/${platform}/threads/${threadId}/messages?accountId=${encodeURIComponent(accountId)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input)
  })
  return asJson<ThreadResult>(res, 'Send failed')
}

/** Start a conversation — the first message opens the thread (201). */
export async function startThread(platform: MessagingPlatform, accountId: string, input: StartThreadInput): Promise<ThreadResult> {
  const res = await messagingApp.request(`/${platform}/threads?accountId=${encodeURIComponent(accountId)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input)
  })
  return asJson<ThreadResult>(res, 'Could not start the conversation')
}

/** Clear a thread's unread count (what opening it does natively). */
export async function acknowledgeThread(platform: MessagingPlatform, accountId: string, threadId: string): Promise<AckResponse> {
  const res = await messagingApp.request(`/${platform}/threads/${threadId}/ack?accountId=${encodeURIComponent(accountId)}`, { method: 'POST' })
  return asJson<AckResponse>(res, 'Could not mark the thread read')
}