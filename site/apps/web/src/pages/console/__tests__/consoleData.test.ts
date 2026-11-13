import { afterEach, describe, expect, it, vi } from 'vitest'
import { ControlError } from '@/lib/controlApi'
import { checkConnection, KEY_MASK, loadConnections, readConnectionKeys, saveConnectionKeys, signInAccount } from '../connectionsData'
import { loadUsageSummary } from '../usageData'
import { loadConsoleEvents } from '../eventsData'
import type { ConsoleTarget } from '../consoleClient'

const local: ConsoleTarget = { kind: 'local' }
const hosted: ConsoleTarget = { kind: 'hosted', teamId: 'team1' }
const account = { id: 'a'.repeat(24), name: 'fakeBird', platform: 'twitter', homeCountry: 'US', proxyProvider: 'twoCaptcha', status: 'active', statusReason: null, state: 'loggedIn', checkedAt: '2026-11-12T10:00:00.000Z', signIn: 'cookies', lastCheck: null }
const connections = { schemaVersion: 1, source: 'workspace', generatedAt: '2026-11-13T00:00:00.000Z', accounts: [account], extensions: [{ key: 'jina', state: 'configured', persisted: true, fields: [{ id: 'JINA_API_KEY', label: 'API key', secret: true, required: true, inputType: 'password', hasValue: true, masked: KEY_MASK }] }] }
const usage = { schemaVersion: 1, source: 'workspace', generatedAt: '2026-11-13T00:00:00.000Z', from: '2026-10-15T00:00:00.000Z', to: '2026-11-13T00:00:00.000Z', totals: { calls: 1, succeeded: 1, failed: 0, p50Ms: 5, p95Ms: 5 }, buckets: [], kinds: [{ kind: 'control', calls: 1, succeeded: 1, failed: 0, p50Ms: 5, p95Ms: 5 }], recentCalls: [{ id: 's1', time: 1, kind: 'control', status: 'succeeded', durationMs: 5 }] }
const events = { schemaVersion: 1, source: 'workspace', generatedAt: '2026-11-13T00:00:00.000Z', events: [{ id: 'event1', type: 'event', time: 1, status: 'recorded', kind: 'Message received', model: null, platform: 'discord', durationMs: null, usage: null }] }

type Call = { url: string; method: string; headers: Record<string, string>; body: unknown }

function serve(answer: (call: Call) => { status?: number; body: unknown }) {
  const calls: Call[] = []
  vi.stubGlobal('document', { cookie: 'logCsrf=csrfValue' })
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit = {}) => {
    const call = { url, method: init.method ?? 'GET', headers: init.headers as Record<string, string>, body: init.body ? JSON.parse(String(init.body)) : undefined }
    calls.push(call)
    const { status = 200, body } = answer(call)
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
  }))
  return calls
}

afterEach(() => { vi.unstubAllGlobals() })

describe('console data client, local mode', () => {
  it('reads connections, usage and events from this machine’s console API', async () => {
    const calls = serve((call) => ({ body: call.url.startsWith('/api/console/usage') ? usage : call.url.startsWith('/api/console/events') ? events : connections }))
    expect((await loadConnections(local)).accounts[0]).toMatchObject({ name: 'fakeBird', state: 'loggedIn', homeCountry: 'US' })
    expect((await loadUsageSummary(local, 30)).recentCalls).toHaveLength(1)
    expect((await loadConsoleEvents(local)).events[0].platform).toBe('discord')
    expect(calls.map((call) => call.url)).toEqual(['/api/console/connections', '/api/console/usage?days=30', '/api/console/events?pageSize=1000'])
  })

  it('posts changes as same-origin JSON with the console header, and keys come back masked', async () => {
    const calls = serve((call) => ({ body: call.url === '/api/console/credentials/read' ? { values: { LOG_ADSPOWER_HOMES: 'US', ADSPOWER_HOST: 'http://127.0.0.1:50325' } } : { saved: true, changed: true, signedIn: true, next: 'none', accountId: account.id, detail: 'signedIn', connections } }))
    const saved = await saveConnectionKeys(local, 'jina', { JINA_API_KEY: 'sk-typed' })
    expect(saved.extensions[0].fields[0]).toMatchObject({ hasValue: true, masked: KEY_MASK })
    expect(await readConnectionKeys(local, 'adsPower')).toEqual({ LOG_ADSPOWER_HOMES: 'US', ADSPOWER_HOST: 'http://127.0.0.1:50325' })
    await checkConnection(local, account.id)
    await signInAccount(local, { platform: 'x', method: 'cookies', account: 'fakeBird', cookies: 'ct0=1' })
    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual(['POST /api/console/credentials', 'POST /api/console/credentials/read', 'POST /api/console/connections/check', 'POST /api/console/signIn'])
    expect(calls.every((call) => call.headers['x-log-console'] === '1' && call.headers['content-type'] === 'application/json')).toBe(true)
    expect(calls[0].body).toEqual({ provider: 'jina', values: { JINA_API_KEY: 'sk-typed' } })
  })

  it('raises a refusal as a toastable error with its code', async () => {
    serve(() => ({ status: 422, body: { error: 'credentialRejected' } }))
    const error = await saveConnectionKeys(local, 'jina', { JINA_API_KEY: 'bad' }).catch((caught) => caught)
    expect(error).toBeInstanceOf(ControlError)
    expect(error).toMatchObject({ code: 'credentialRejected', message: 'The provider rejected this key. Check it and try again.' })
  })

  it('refuses an answer that carries a key instead of the mask', async () => {
    serve(() => ({ body: { ...connections, extensions: [{ ...connections.extensions[0], fields: [{ ...connections.extensions[0].fields[0], masked: 'sk-real' }] }] } }))
    await expect(loadConnections(local)).rejects.toThrow('consoleResponseInvalid')
  })
})

describe('console data client, hosted mode', () => {
  it('asks the control service for the selected team, with the CSRF token on changes', async () => {
    const calls = serve((call) => ({ body: call.url.includes('/console/usage') ? usage : call.url.includes('/console/events') ? events : call.method === 'POST' ? { saved: true, changed: true, connections } : connections }))
    await loadConnections(hosted)
    await loadUsageSummary(hosted, 7)
    await loadConsoleEvents(hosted)
    await saveConnectionKeys(hosted, 'jina', { JINA_API_KEY: 'sk-typed' })
    await checkConnection(hosted, account.id)
    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual(['GET /api/v1/teams/team1/console/connections', 'GET /api/v1/teams/team1/console/usage?days=7', 'GET /api/v1/teams/team1/console/events', 'POST /api/v1/teams/team1/console/credentials', 'POST /api/v1/teams/team1/console/accountCheck'])
    expect(calls[3].headers['x-csrf-token']).toBe('csrfValue')
    expect(calls[3].headers['x-log-console']).toBeUndefined()
  })

  it('turns the service’s error codes into the same messages as local', async () => {
    serve(() => ({ status: 409, body: { code: 'accountCheckBusy', requestId: 'r' } }))
    await expect(checkConnection(hosted, account.id)).rejects.toMatchObject({ code: 'accountCheckBusy', message: 'Another account check is running. Try again when it finishes.' })
    serve(() => ({ status: 503, body: { code: 'workspaceOffline', safeMessage: 'the workspace is not connected' } }))
    await expect(loadConnections(hosted)).rejects.toMatchObject({ code: 'workspaceOffline' })
  })
})
