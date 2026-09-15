import { beforeEach, describe, expect, it } from 'vitest'
import { mockApiApp } from '../mock-api'
import { DEFAULT_MESSAGING_ACCOUNT, identityFor } from '../messaging/identities'
import { FB_THREAD_IDS } from '../messaging/facebook/mock'
import {
  acknowledgeThread,
  getThread,
  getThreadMessages,
  listThreads,
  resetMessagingStore,
  sendMessage,
  startThread,
  StoreError,
} from '../messaging/store'
import type { Thread } from '../messaging/types'
import { X_T1_M1, X_THREAD_IDS } from '../messaging/twitter/mock'

/**
 * Multi-account messaging contract. The store is the source of truth and the
 * Hono routes in `routes.ts` are a thin reference implementation, so most
 * cases drive the store directly (isolation, native id shapes, write rules)
 * and a final block drives `mockApiApp.request` for the HTTP surface:
 * `?accountId=` required, per-platform mounts, and the `/twitter` alias.
 *
 * Seeded thread/message ids are generated UUIDs; the tests pin them by the
 * mocks' exported constants (`X_THREAD_IDS`, `FB_THREAD_IDS`, `X_T1_M1`)
 * rather than literals, so they hold regardless of the loaded UUID values.
 */

async function req(path: string, init?: RequestInit) {
  const res = await mockApiApp.request(path, init)
  const body = await res.json().catch(() => ({}))
  return { res, body: body as Record<string, unknown> }
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

beforeEach(() => resetMessagingStore())

describe('seeded inboxes are per-account', () => {
  it('each seeded account lists only its own threads, newest first', () => {
    const ops = listThreads('x', 'x-ops')
    expect(ops.map((t) => t.id)).toEqual([X_THREAD_IDS.t1, X_THREAD_IDS.t2])
    const listeningkit = listThreads('x', 'x-listeningkit')
    expect(listeningkit.map((t) => t.id)).toEqual([X_THREAD_IDS.t3])
    expect(ops.every((t) => t.accountId === 'x-ops')).toBe(true)
    expect(listeningkit.every((t) => t.accountId === 'x-listeningkit')).toBe(true)
  })

  it('a connected account with no seed gets an empty inbox, not an error', () => {
    expect(listThreads('x', 'x-archived')).toEqual([])
    expect(listThreads('facebook', 'x-archived')).toEqual([])
  })

  it('an unknown account id also resolves to an empty inbox', () => {
    expect(listThreads('x', 'account-never-connected')).toEqual([])
    expect(listThreads('reddit', 'account-never-connected')).toEqual([])
  })
})

describe('thread isolation between accounts and platforms', () => {
  it('a thread only resolves under the account that owns it', () => {
    expect(getThread('x', 'x-listeningkit', X_THREAD_IDS.t3)).toBeTruthy()
    expect(getThread('x', 'x-ops', X_THREAD_IDS.t3)).toBeUndefined()
    expect(getThread('x', 'x-archived', X_THREAD_IDS.t3)).toBeUndefined()
  })

  it('platforms never share threads', () => {
    expect(getThread('facebook', 'fb-personal', X_THREAD_IDS.t3)).toBeUndefined()
    expect(getThread('reddit', 'reddit-listeningkit', X_THREAD_IDS.t3)).toBeUndefined()
    expect(getThread('x', 'x-ops', FB_THREAD_IDS.t1)).toBeUndefined()
  })

  it('messages follow the same isolation', () => {
    expect(getThreadMessages('x', 'x-ops', X_THREAD_IDS.t1)).toHaveLength(5)
    expect(getThreadMessages('x', 'x-listeningkit', X_THREAD_IDS.t1)).toBeUndefined()
    expect(getThreadMessages('x', 'x-archived', X_THREAD_IDS.t3)).toBeUndefined()
  })
})

describe('platform-native id shapes', () => {
  it('X threads are dm_conversation_ids (selfId-participantId) with 19-digit event ids', () => {
    const t = getThread('x', 'x-ops', X_THREAD_IDS.t1) as Thread
    const selfId = identityFor('x-ops')?.platformUserId
    expect(t).toBeTruthy()
    expect(t.platformThreadId).toBe(`${selfId}-${t.platformParticipantId}`)
    expect(t.platformThreadId).toMatch(/^\d{19}-\d{19}$/)
    for (const m of getThreadMessages('x', 'x-ops', X_THREAD_IDS.t1) ?? []) {
      expect(m.platformMessageId).toMatch(/^\d{19}$/)
      expect(m.sentAt).toMatch(ISO)
    }
  })

  it('Facebook threads use numeric thread_keys and participant page ids', () => {
    for (const account of ['fb-personal', 'fb-galway-rubbish']) {
      for (const t of listThreads('facebook', account)) {
        expect(t.platformThreadId).toMatch(/^\d{13,17}$/)
        expect(t.platformParticipantId).toMatch(/^\d+$/)
      }
    }
  })

  it('Reddit threads are their first message (first_message_name = t4_ id)', () => {
    for (const account of ['reddit-listeningkit', 'reddit-watch']) {
      for (const t of listThreads('reddit', account)) {
        expect(t.platformThreadId).toMatch(/^t4_[a-z0-9]+$/)
        expect(t.subject).toBeTruthy()
        const messages = getThreadMessages('reddit', account, t.id) ?? []
        expect(messages.length).toBeGreaterThan(0)
        expect(messages[0]?.platformMessageId).toBe(t.platformThreadId)
        for (const m of messages) expect(m.platformMessageId).toMatch(/^t4_[a-z0-9]+$/)
      }
    }
  })
})

describe('sendMessage', () => {
  it('appends a message and syncs the thread preview + updatedAt', () => {
    const result = sendMessage('x', 'x-ops', X_THREAD_IDS.t1, { body: 'Thanks, see you Thursday' })
    expect(result.message.from).toBe('me')
    expect(result.message.platformMessageId).toMatch(/^\d{19}$/)
    expect(getThreadMessages('x', 'x-ops', X_THREAD_IDS.t1)?.at(-1)?.id).toBe(result.message.id)
    expect(result.thread.preview).toBe('Thanks, see you Thursday')
    expect(result.thread.updatedAt).toBe(result.message.sentAt)
    expect(result.message.sentAt).toMatch(ISO)
  })

  it('never crosses an account boundary', () => {
    expect(() => sendMessage('x', 'x-listeningkit', X_THREAD_IDS.t1, { body: 'hello' })).toThrowError(StoreError)
    try {
      sendMessage('x', 'x-listeningkit', X_THREAD_IDS.t1, { body: 'hello' })
    } catch (err) {
      expect((err as StoreError).status).toBe(404)
    }
  })

  it('rejects empty bodies and unresolvable reply targets', () => {
    expect(() => sendMessage('x', 'x-ops', X_THREAD_IDS.t1, { body: '   ' })).toThrowError(StoreError)
    expect(() => sendMessage('x', 'x-ops', X_THREAD_IDS.t1, { body: 'reply', replyToPlatformMessageId: 't4_nobody' })).toThrowError(StoreError)
    const existing = getThreadMessages('x', 'x-ops', X_THREAD_IDS.t1)?.[0]
    try {
      sendMessage('x', 'x-ops', X_THREAD_IDS.t1, { body: 'reply', replyToPlatformMessageId: 't4_nobody' })
    } catch (err) {
      expect((err as StoreError).status).toBe(400)
    }
    const replied = sendMessage('x', 'x-ops', X_THREAD_IDS.t1, { body: 'replying', replyToPlatformMessageId: existing?.platformMessageId })
    expect(replied.message.replyTo?.platformMessageId).toBe(existing?.platformMessageId)
  })
})

describe('startThread', () => {
  it('opens a conversation whose native id follows the platform', () => {
    const result = startThread('x', 'x-archived', {
      platformParticipantId: '1740000000000000001',
      handle: 'newlead',
      body: 'Hi — are you still looking for a plumber?',
    })
    const selfId = identityFor('x-archived')?.platformUserId
    expect(result.thread.accountId).toBe('x-archived')
    expect(result.thread.platformThreadId).toBe(`${selfId}-1740000000000000001`)
    expect(result.thread.participant.handle).toBe('newlead')
    expect(result.thread.unread).toBe(0)
    expect(listThreads('x', 'x-archived').map((t) => t.id)).toEqual([result.thread.id])
    expect(getThreadMessages('x', 'x-archived', result.thread.id)).toHaveLength(1)
  })

  it('keeps the name/handle fallbacks sane', () => {
    const result = startThread('x', 'x-archived', {
      platformParticipantId: '1740000000000000002',
      body: 'Testing with no handle.',
    })
    expect(result.thread.participant.name).toBe('@1740000000000000002')
  })

  it('duplicates the same participant 409s, empty compose 400s', () => {
    startThread('x', 'x-archived', { platformParticipantId: '1740000000000000003', body: 'first' })
    try {
      startThread('x', 'x-archived', { platformParticipantId: '1740000000000000003', body: 'again' })
      expect.unreachable('expected thread_already_exists')
    } catch (err) {
      expect((err as StoreError).status).toBe(409)
      expect((err as StoreError).code).toBe('thread_already_exists')
    }
    expect(() =>
      startThread('x', 'x-archived', { platformParticipantId: '1740000000000000004', body: '' }),
    ).toThrowError(StoreError)
    expect(() =>
      startThread('x', 'x-archived', { platformParticipantId: '   ', body: 'no recipient' }),
    ).toThrowError(StoreError)
  })

  it('attaches a subject on Reddit only', () => {
    const reddit = startThread('reddit', 'reddit-captcha', {
      platformParticipantId: 'u/newneighbor',
      body: 'Saw your post about the burst pipe.',
      subject: 'That pipe post',
    })
    expect(reddit.thread.subject).toBe('That pipe post')
    const xThread = startThread('x', 'x-archived', {
      platformParticipantId: '1740000000000000005',
      body: 'x has no subject',
      subject: 'ignored',
    })
    expect((xThread.thread as Thread & { subject?: string }).subject).toBeUndefined()
  })
})

describe('acknowledgeThread', () => {
  it('clears unread and is idempotent', () => {
    const first = acknowledgeThread('x', 'x-ops', X_THREAD_IDS.t1)
    expect(first).toEqual({ threadId: X_THREAD_IDS.t1, acknowledged: 1 })
    expect((getThread('x', 'x-ops', X_THREAD_IDS.t1) as Thread).unread).toBe(0)
    const second = acknowledgeThread('x', 'x-ops', X_THREAD_IDS.t1)
    expect(second.acknowledged).toBe(0)
    expect(() => acknowledgeThread('x', 'x-ops', 'x-t404')).toThrowError(StoreError)
  })
})

describe('HTTP surface', () => {
  it('requires ?accountId= on every route', async () => {
    for (const path of ['/messaging/x/threads', '/messaging/x/threads?accountId=', `/messaging/x/threads/${X_THREAD_IDS.t1}/messages`]) {
      const { res } = await req(path)
      expect(res.status).toBe(400)
    }
    const sendNoAccount = await req(`/messaging/x/threads/${X_THREAD_IDS.t1}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: 'hi' }),
    })
    expect(sendNoAccount.res.status).toBe(400)
    const ackNoAccount = await req(`/messaging/x/threads/${X_THREAD_IDS.t1}/ack`, { method: 'POST' })
    expect(ackNoAccount.res.status).toBe(400)
    const postNoAccount = await req('/messaging/x/threads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ platformParticipantId: '1', body: 'hi' }),
    })
    expect(postNoAccount.res.status).toBe(400)
  })

  it('serves each platform inbox under the requesting account', async () => {
    const { res, body } = await req('/messaging/x/threads?accountId=x-ops')
    expect(res.status).toBe(200)
    const threads = (body as { threads: Thread[] }).threads
    expect(threads.map((t) => t.id)).toEqual([X_THREAD_IDS.t1, X_THREAD_IDS.t2])
    expect(threads.every((t) => t.accountId === 'x-ops')).toBe(true)

    const empty = await req('/messaging/x/threads?accountId=x-archived')
    expect((empty.body as { threads: Thread[] }).threads).toEqual([])
  })

  it('404s a thread that belongs to another account', async () => {
    const { res } = await req(`/messaging/x/threads/${X_THREAD_IDS.t3}/messages?accountId=x-ops`)
    expect(res.status).toBe(404)
    const ok = await req(`/messaging/x/threads/${X_THREAD_IDS.t3}/messages?accountId=x-listeningkit`)
    expect(ok.res.status).toBe(200)
    expect((ok.body as { messages: unknown[] }).messages).toHaveLength(2)
  })

  it('starts, sends, and acks over HTTP', async () => {
    const start = await req('/messaging/reddit/threads?accountId=reddit-watch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ platformParticipantId: 'u/tester', name: 'tester', body: 'First message', subject: 'Question' }),
    })
    expect(start.res.status).toBe(201)
    const started = (start.body as { thread: Thread; message: { id: string } }).thread
    expect(started.subject).toBe('Question')

    const bad = await req(`/messaging/reddit/threads/${started.id}/messages?accountId=reddit-watch`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: '' }),
    })
    expect(bad.res.status).toBe(400)

    const send = await req(`/messaging/reddit/threads/${started.id}/messages?accountId=reddit-watch`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: 'Second message' }),
    })
    expect(send.res.status).toBe(201)
    const sentThread = (send.body as { thread: Thread }).thread
    expect(sentThread.preview).toBe('Second message')

    const crossAccount = await req(`/messaging/reddit/threads/${started.id}/messages?accountId=reddit-listeningkit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: 'sneaky' }),
    })
    expect(crossAccount.res.status).toBe(404)

    const ack = await req(`/messaging/reddit/threads/${started.id}/ack?accountId=reddit-watch`, { method: 'POST' })
    expect(ack.res.status).toBe(200)
    expect((ack.body as { acknowledged: number }).acknowledged).toBe(0)
  })

  it('validates the compose body schema', async () => {
    const { res } = await req('/messaging/x/threads?accountId=x-ops', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: 'no participant id' }),
    })
    expect(res.status).toBe(400)
  })

  it('keeps the legacy /twitter mount in sync with /x', async () => {
    const canonical = await req('/messaging/x/threads?accountId=x-ops')
    const alias = await req('/messaging/twitter/threads?accountId=x-ops')
    expect(alias.res.status).toBe(200)
    expect(alias.body).toEqual(canonical.body)
  })

  it('round-trips through the dashboard client', async () => {
    const { getThreads, getThreadMessages, acknowledgeThread: ackClient } = await import('../messaging')
    const inbox = await getThreads(DEFAULT_MESSAGING_ACCOUNT.x)
    const t1 = inbox.threads.find((t) => t.id === X_THREAD_IDS.t1)
    expect(t1).toBeTruthy()
    const messages = await getThreadMessages('x', 'x-ops', X_THREAD_IDS.t1)
    expect(messages.messages.map((m) => m.id)).toContain(X_T1_M1)
    const ack = await ackClient('x', 'x-ops', X_THREAD_IDS.t1)
    expect(ack.acknowledged).toBe(1)
  })
})