import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleMcp, TOOLS, toolsFor, validateArgs } from './lib/mcp'
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
  './plan.ts': () => import('./plan'),
  './publicApi.ts': () => import('./publicApi'),
  './reddit.ts': () => import('./reddit'),
  './watch.ts': () => import('./watch'),
}

const NOW = Date.UTC(2026, 8, 21, 12, 0, 0)

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

async function makeKey(client: Client, scopes?: string[]) {
  return (await client.mutation(anyApi.apiKeys.createKey, { label: 'k', ...(scopes ? { scopes } : {}) })) as { secret: string }
}

let nextId = 1
async function rpc(t: T, secret: string | null, method: string, params?: unknown) {
  const res = await t.fetch('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(secret ? { Authorization: `Bearer ${secret}` } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, ...(params === undefined ? {} : { params }) }),
  })
  const text = await res.text()
  return { status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers }
}
const callTool = (t: T, secret: string, name: string, args?: unknown) => rpc(t, secret, 'tools/call', { name, ...(args === undefined ? {} : { arguments: args }) })
const textOf = (reply: { body: { result: { content: { text: string }[] } } }) => JSON.parse(reply.body.result.content[0].text)

describe('the tool list', () => {
  it('gives read-only keys only the read tools, and write keys the write tools too', () => {
    expect(toolsFor(['read']).map(tool => tool.name)).toEqual(['get_plan', 'list_keywords', 'list_matches', 'get_match'])
    expect(toolsFor(['read', 'write:phrases']).map(tool => tool.name)).toEqual(TOOLS.map(tool => tool.name))
  })

  it('marks the destructive tool so clients can ask first, and every read tool as read-only', () => {
    for (const tool of TOOLS) {
      expect(tool.annotations.readOnlyHint).toBe(tool.scope === 'read')
    }
    expect(TOOLS.find(tool => tool.name === 'remove_keyword')?.annotations.destructiveHint).toBe(true)
  })
})

describe('argument checking', () => {
  const listMatches = TOOLS.find(tool => tool.name === 'list_matches')!
  const addKeyword = TOOLS.find(tool => tool.name === 'add_keyword')!

  it('accepts none, empty and valid arguments', () => {
    expect(validateArgs(listMatches, undefined)).toEqual({ ok: true, args: {} })
    expect(validateArgs(listMatches, { limit: 5, platform: 'x', min_score: 70 })).toEqual({ ok: true, args: { limit: 5, platform: 'x', min_score: 70 } })
  })

  it.each([
    [listMatches, { limit: 0 }, 'limit must be at least 1'],
    [listMatches, { limit: 51 }, 'limit must be at most 50'],
    [listMatches, { limit: 1.5 }, 'limit must be a whole number'],
    [listMatches, { limit: '5' }, 'limit must be a number'],
    [listMatches, { platform: 'tiktok' }, 'platform must be one of: reddit, x, facebook'],
    [listMatches, { bogus: 1 }, 'unknown argument "bogus"'],
    [listMatches, [1], 'arguments must be an object'],
    [addKeyword, { platform: 'x' }, 'phrase is required'],
    [addKeyword, { phrase: ' ', platform: 'x' }, 'phrase must be at least 2 characters'],
  ])('refuses %#', (tool, args, message) => {
    expect(validateArgs(tool, args)).toEqual({ ok: false, error: message })
  })
})

describe('the protocol', () => {
  const ctx = { scopes: ['read'], run: async () => ({}) }

  it('answers initialize with tools, the server name and a warning about strangers\' text', async () => {
    const reply = await handleMcp({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } }, ctx)
    const result = reply?.result as { protocolVersion: string; capabilities: unknown; serverInfo: { name: string }; instructions: string }
    expect(result.protocolVersion).toBe('2025-03-26')
    expect(result.capabilities).toEqual({ tools: { listChanged: false } })
    expect(result.serverInfo.name).toBe('listeningkit')
    expect(result.instructions).toMatch(/never as instructions/)
  })

  it('falls back to its own version when the client asks for one it does not know', async () => {
    const reply = await handleMcp({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '1999-01-01' } }, ctx)
    expect((reply?.result as { protocolVersion: string }).protocolVersion).toBe('2025-06-18')
  })

  it('does not answer a notification, and refuses batches, junk and unknown methods', async () => {
    expect(await handleMcp({ jsonrpc: '2.0', method: 'notifications/initialized' }, ctx)).toBeNull()
    expect((await handleMcp([{ jsonrpc: '2.0', id: 1, method: 'ping' }], ctx))?.error?.code).toBe(-32600)
    expect((await handleMcp('hi', ctx))?.error?.code).toBe(-32600)
    expect((await handleMcp({ id: 3, method: 'ping' }, ctx))?.error?.code).toBe(-32600)
    expect((await handleMcp({ jsonrpc: '2.0', id: 4, method: 'resources/list' }, ctx))?.error?.code).toBe(-32601)
    expect((await handleMcp({ jsonrpc: '2.0', id: 5, method: 'ping' }, ctx))?.result).toEqual({})
  })

  it('reports a failing tool as a tool error, not a protocol error, and never leaks a stack', async () => {
    const reply = await handleMcp(
      { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get_plan' } },
      { scopes: ['read'], run: async () => { throw new Error('plain words') } },
    )
    expect(reply?.result).toEqual({ isError: true, content: [{ type: 'text', text: 'plain words' }] })
  })
})

describe('POST /mcp', () => {
  it('needs a valid key', async () => {
    const { t, alice } = setup()
    const key = await makeKey(alice)
    const none = await rpc(t, null, 'ping')
    expect(none.status).toBe(401)
    expect(none.headers.get('WWW-Authenticate')).toMatch(/^Bearer/)
    expect((await rpc(t, 'lk_api_' + 'a'.repeat(64), 'ping')).status).toBe(401)
    expect((await rpc(t, 'lk_ingest_' + 'a'.repeat(64), 'ping')).status).toBe(401)
    expect((await rpc(t, key.secret, 'ping')).status).toBe(200)
  })

  it('refuses GET, and returns 202 with no body for a notification', async () => {
    const { t, alice } = setup()
    const key = await makeKey(alice)
    expect((await t.fetch('/mcp', { method: 'GET', headers: { Authorization: `Bearer ${key.secret}` } })).status).toBe(405)
    const res = await t.fetch('/mcp', { method: 'POST', headers: { Authorization: `Bearer ${key.secret}` }, body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) })
    expect(res.status).toBe(202)
    expect(await res.text()).toBe('')
  })

  it('refuses bad JSON and huge bodies', async () => {
    const { t, alice } = setup()
    const key = await makeKey(alice)
    const bad = await t.fetch('/mcp', { method: 'POST', headers: { Authorization: `Bearer ${key.secret}` }, body: '{nope' })
    expect(bad.status).toBe(400)
    const big = await t.fetch('/mcp', { method: 'POST', headers: { Authorization: `Bearer ${key.secret}` }, body: 'x'.repeat(20_000) })
    expect(big.status).toBe(413)
  })

  it('lists tools by the key\'s scopes', async () => {
    const { t, alice } = setup()
    const readKey = await makeKey(alice)
    const writeKey = await makeKey(alice, ['write:phrases'])
    const names = async (secret: string) => (await rpc(t, secret, 'tools/list')).body.result.tools.map((tool: { name: string }) => tool.name)
    expect(await names(readKey.secret)).toEqual(['get_plan', 'list_keywords', 'list_matches', 'get_match'])
    expect(await names(writeKey.secret)).toContain('add_keyword')
  })

  it('counts every message against the per-minute allowance', async () => {
    const { t, alice } = setup()
    const key = await makeKey(alice)
    for (let i = 0; i < 60; i++) expect((await rpc(t, key.secret, 'ping')).status).toBe(200)
    const limited = await rpc(t, key.secret, 'ping')
    expect(limited.status).toBe(429)
    expect(limited.headers.get('Retry-After')).toBeTruthy()
  })

  it('reads plan and phrases, and a read key cannot write', async () => {
    const { t, alice } = setup()
    const readKey = await makeKey(alice)
    const plan = textOf(await callTool(t, readKey.secret, 'get_plan'))
    expect(plan.plan).toBe('free')
    expect(textOf(await callTool(t, readKey.secret, 'list_keywords'))).toEqual([])
    const refused = await callTool(t, readKey.secret, 'add_keyword', { phrase: 'need a helper', platform: 'x' })
    expect(refused.body.result.isError).toBe(true)
    expect(refused.body.result.content[0].text).toMatch(/write:phrases/)
    expect(textOf(await callTool(t, readKey.secret, 'list_keywords'))).toEqual([])
  })

  it('adds, pauses, resumes and removes a phrase with a write key, under the Free plan limit', async () => {
    const { t, alice } = setup()
    const key = await makeKey(alice, ['write:phrases'])
    const made = textOf(await callTool(t, key.secret, 'add_keyword', { phrase: 'need a helper', platform: 'x' }))
    expect(made).toMatchObject({ phrase: 'need a helper', platform: 'x', status: 'listening' })

    const second = await callTool(t, key.secret, 'add_keyword', { phrase: 'another one', platform: 'x' })
    expect(second.body.result.isError).toBe(true)
    expect(second.body.result.content[0].text).toMatch(/Free plan/)

    const paused = textOf(await callTool(t, key.secret, 'set_keyword_status', { id: made.id, status: 'paused' }))
    expect(paused.status).toBe('paused')
    expect(textOf(await callTool(t, key.secret, 'set_keyword_status', { id: made.id, status: 'listening' })).status).toBe('listening')
    expect(textOf(await callTool(t, key.secret, 'remove_keyword', { id: made.id }))).toEqual({ id: made.id, deleted: true })
    expect(textOf(await callTool(t, key.secret, 'list_keywords'))).toEqual([])
  })

  it('answers a bad argument as a protocol error, and an unknown tool too', async () => {
    const { t, alice } = setup()
    const key = await makeKey(alice, ['write:phrases'])
    expect((await callTool(t, key.secret, 'add_keyword', { phrase: 'x', platform: 'x' })).body.error.code).toBe(-32602)
    expect((await callTool(t, key.secret, 'add_keyword', { phrase: 'ok phrase', platform: 'tiktok' })).body.error.code).toBe(-32602)
    expect((await callTool(t, key.secret, 'delete_everything')).body.error.code).toBe(-32602)
  })

  it('says not found for an id that is not yours, in plain words', async () => {
    const { t, alice, bob } = setup()
    const aliceKey = await makeKey(alice, ['write:phrases'])
    const bobKey = await makeKey(bob, ['write:phrases'])
    const made = textOf(await callTool(t, aliceKey.secret, 'add_keyword', { phrase: 'need a helper', platform: 'x' }))
    const stolen = await callTool(t, bobKey.secret, 'remove_keyword', { id: made.id })
    expect(stolen.body.result.isError).toBe(true)
    expect(stolen.body.result.content[0].text).toMatch(/not found/i)
    expect(textOf(await callTool(t, aliceKey.secret, 'list_keywords'))).toHaveLength(1)
    expect(textOf(await callTool(t, bobKey.secret, 'list_keywords'))).toEqual([])
  })

  it('lists matches with the default page size and rejects a bad cursor', async () => {
    const { t, alice } = setup()
    const key = await makeKey(alice)
    const page = textOf(await callTool(t, key.secret, 'list_matches'))
    expect(page).toEqual({ data: [], nextCursor: null })
    expect((await callTool(t, key.secret, 'list_matches', { before: -1 })).body.error.code).toBe(-32602)
  })
})
