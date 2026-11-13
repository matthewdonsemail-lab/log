import { afterEach, describe, expect, it, vi } from 'vitest'
import { createActor, waitFor } from 'xstate'
import { parseView, requestBrowser } from './browserCheckData'
import { browserCheckMachine } from './browserCheckMachine'

const view = { accountId: 'a'.repeat(24), account: 'fixtureAccount', phase: 'signInRequired', location: 'remote', viewerId: 'g'.repeat(32), generation: 'g'.repeat(32), revision: 'b'.repeat(64), pageState: 'loginForm', address: 'https://example.com/login', width: 800, height: 600, canInteract: true, canResolve: true, canComplete: false, canNavigate: true, canGoBack: true, stream: null, reason: null }

afterEach(() => { vi.unstubAllGlobals() })

describe('the console browser check', () => {
  it('reads a view, lets only a sign-in page take input and drops an unsafe stream', () => {
    expect(parseView(view)).toMatchObject({ phase: 'signInRequired', canInteract: true, canResolve: true, location: 'remote' })
    expect(parseView({ ...view, phase: 'needsAttention' })).toMatchObject({ canInteract: false, canResolve: false })
    expect(parseView({ ...view, phase: 'ready', canComplete: true }).canComplete).toBe(false)
    expect(() => parseView({ ...view, phase: 'launchBlocked' })).toThrow('browserResponseInvalid')
    expect(parseView({ ...view, stream: { kind: 'voxl', url: 'javascript:alert(1)', page: { width: 1, height: 1 }, window: {} } }).stream).toBeNull()
  })

  it('sends each step to its console operation, locally and hosted', async () => {
    const calls: string[] = []
    vi.stubGlobal('document', { cookie: 'logCsrf=csrfValue' })
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit = {}) => { calls.push(`${url} ${init.body}`); return new Response(JSON.stringify({ view }), { headers: { 'content-type': 'application/json' } }) }))
    await requestBrowser({ kind: 'local' }, view.accountId, 'resolve', parseView(view))
    await requestBrowser({ kind: 'hosted', teamId: 't1' }, view.accountId, 'complete', parseView(view))
    expect(calls[0]).toBe(`/api/console/browserCheck/action {"accountId":"${view.accountId}","action":"resolve","generation":"${view.generation}","revision":"${view.revision}"}`)
    expect(calls[1].startsWith('/api/v1/teams/t1/console/browser/saveState ')).toBe(true)
  })

  it('opens a missing browser, and on close stops only the browser it opened', async () => {
    const paths: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string) => { paths.push(url); return new Response(JSON.stringify({ view: { ...view, phase: 'browserMissing', viewerId: null, generation: null, revision: null, canInteract: false, canResolve: false } }), { headers: { 'content-type': 'application/json' } }) }))
    const actor = createActor(browserCheckMachine, { input: { target: { kind: 'local' }, accountId: view.accountId, autoSignIn: false, drawFrame: async () => {} } }).start()
    await waitFor(actor, (snapshot) => snapshot.matches('uncertain'))
    actor.send({ type: 'CLOSE' })
    await waitFor(actor, (snapshot) => snapshot.status === 'done')
    expect(paths).toEqual(['/api/console/browserCheck/state', '/api/console/browserCheck/open', '/api/console/browserCheck/close'])
  })
})
