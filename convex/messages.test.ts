import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './apiKeys.ts': () => import('./apiKeys'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './messages.ts': () => import('./messages'),
  './plan.ts': () => import('./plan'),
  './publicApi.ts': () => import('./publicApi'),
  './reddit.ts': () => import('./reddit'),
  './watch.ts': () => import('./watch'),
}

const NOW = Date.UTC(2026, 8, 22, 12, 0, 0)

beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW) })
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs() })

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}
type T = ReturnType<typeof setup>['t']
type Client = ReturnType<T['withIdentity']>

async function makeIngestKey(client: Client) {
  return (await client.mutation(anyApi.ingest.createKey, { label: 'helper' })) as { id: string; secret: string }
}

const dmIngest = (t: T, secret: string, threads: unknown) =>
  t.fetch('/dm/ingest', {
    method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'x', threads }),
  })
const dmPending = (t: T, secret: string) => t.fetch('/dm/pending?platform=x', { headers: { Authorization: `Bearer ${secret}` } })
const dmSent = (t: T, secret: string, messageId: string, externalId?: string) =>
  t.fetch('/dm/sent', { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, ...(externalId ? { externalId } : {}) }) })
const dmFailed = (t: T, secret: string, messageId: string, error: string) =>
  t.fetch('/dm/failed', { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, error }) })

const CONVO = [{ peerHandle: 'needhelp99', peerName: 'Need Help', messages: [{ externalId: 'm1', text: 'hey, saw your post, can you help?', sentAt: 1000 }] }]

describe('/dm/ingest', () => {
  it('needs a valid ingest key', async () => {
    const { t, alice } = setup()
    const key = await makeIngestKey(alice)
    expect((await dmIngest(t, 'lk_ingest_' + 'a'.repeat(40), CONVO)).status).toBe(401)
    expect((await dmIngest(t, key.secret, CONVO)).status).toBe(200)
  })

  it('creates a thread and a message, visible to the owner and only the owner', async () => {
    const { t, alice, bob } = setup()
    const key = await makeIngestKey(alice)
    const res = await dmIngest(t, key.secret, CONVO)
    expect(await res.json()).toEqual({ threadsSeen: 1, messagesAdded: 1 })
    const threads = await alice.query(anyApi.messages.listThreads, {})
    expect(threads).toHaveLength(1)
    expect(threads[0]).toMatchObject({ platform: 'x', peerHandle: 'needhelp99', peerName: 'Need Help', lastMessagePreview: 'hey, saw your post, can you help?' })
    const messages = await alice.query(anyApi.messages.listMessages, { threadId: threads[0].id })
    expect(messages).toEqual([{ id: messages[0].id, direction: 'in', text: 'hey, saw your post, can you help?', sentAt: 1000, status: 'sent' }])
    expect(await bob.query(anyApi.messages.listThreads, {})).toEqual([])
  })

  it('never duplicates a message read twice, and updates the thread preview to the newest one', async () => {
    const { t, alice } = setup()
    const key = await makeIngestKey(alice)
    await dmIngest(t, key.secret, CONVO)
    await dmIngest(t, key.secret, [{ peerHandle: 'needhelp99', messages: [...CONVO[0].messages, { externalId: 'm2', text: 'still there?', sentAt: 2000 }] }])
    const threads = await alice.query(anyApi.messages.listThreads, {})
    expect(threads).toHaveLength(1)
    expect(threads[0].lastMessagePreview).toBe('still there?')
    const messages = await alice.query(anyApi.messages.listMessages, { threadId: threads[0].id })
    expect(messages.map((m: { text: string }) => m.text)).toEqual(['hey, saw your post, can you help?', 'still there?'])
  })

  it('refuses a bad batch', async () => {
    const { t, alice } = setup()
    const key = await makeIngestKey(alice)
    expect((await dmIngest(t, key.secret, [])).status).toBe(400)
    expect((await t.fetch('/dm/ingest', { method: 'POST', headers: { Authorization: `Bearer ${key.secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: 'bluesky', threads: CONVO }) })).status).toBe(400)
  })
})

describe('sending', () => {
  it('queues a message as pending, the helper polls it, and confirms it sent', async () => {
    const { t, alice } = setup()
    const key = await makeIngestKey(alice)
    await dmIngest(t, key.secret, CONVO)
    const [thread] = await alice.query(anyApi.messages.listThreads, {})
    const sent = await alice.mutation(anyApi.messages.sendMessage, { threadId: thread.id, text: 'sure, what do you need?' })
    expect(sent.status).toBe('pending')

    const pendingRes = await dmPending(t, key.secret)
    const { pending } = await pendingRes.json()
    expect(pending).toEqual([{ id: sent.id, threadId: thread.id, peerHandle: 'needhelp99', text: 'sure, what do you need?', sentAt: sent.sentAt }])

    expect((await dmSent(t, key.secret, sent.id, 'x-msg-1')).status).toBe(200)
    const messages = await alice.query(anyApi.messages.listMessages, { threadId: thread.id })
    expect(messages.find((m: { id: string }) => m.id === sent.id)).toMatchObject({ status: 'sent' })
    expect((await dmPending(t, key.secret)).status).toBe(200)
    expect((await (await dmPending(t, key.secret)).json()).pending).toEqual([])
  })

  it('records a failed send with a plain-words reason', async () => {
    const { t, alice } = setup()
    const key = await makeIngestKey(alice)
    await dmIngest(t, key.secret, CONVO)
    const [thread] = await alice.query(anyApi.messages.listThreads, {})
    const sent = await alice.mutation(anyApi.messages.sendMessage, { threadId: thread.id, text: 'sure, what do you need?' })
    expect((await dmFailed(t, key.secret, sent.id, 'X refused the saved login')).status).toBe(200)
    const messages = await alice.query(anyApi.messages.listMessages, { threadId: thread.id })
    expect(messages.find((m: { id: string }) => m.id === sent.id)).toMatchObject({ status: 'failed' })
  })

  it('refuses an empty message and one over the length limit', async () => {
    const { t, alice } = setup()
    const key = await makeIngestKey(alice)
    await dmIngest(t, key.secret, CONVO)
    const [thread] = await alice.query(anyApi.messages.listThreads, {})
    await expect(alice.mutation(anyApi.messages.sendMessage, { threadId: thread.id, text: '   ' })).rejects.toThrow('must not be empty')
    await expect(alice.mutation(anyApi.messages.sendMessage, { threadId: thread.id, text: 'x'.repeat(2001) })).rejects.toThrow('at most 2000')
  })

  it('refuses to send into, mark sent, or mark failed someone else\'s thread', async () => {
    const { t, alice, bob } = setup()
    const aliceKey = await makeIngestKey(alice)
    const bobKey = await makeIngestKey(bob)
    await dmIngest(t, aliceKey.secret, CONVO)
    const [thread] = await alice.query(anyApi.messages.listThreads, {})
    await expect(bob.mutation(anyApi.messages.sendMessage, { threadId: thread.id, text: 'nope' })).rejects.toThrow('not found')
    const sent = await alice.mutation(anyApi.messages.sendMessage, { threadId: thread.id, text: 'hi' })
    expect((await dmSent(t, bobKey.secret, sent.id)).status).toBe(404)
    expect((await dmFailed(t, bobKey.secret, sent.id, 'nope')).status).toBe(404)
  })
})
