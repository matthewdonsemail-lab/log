import { describe, expect, it } from 'vitest'
import { createActor, waitFor } from 'xstate'
import { parseView } from './browserCheckData'
import { browserCheckMachine } from './browserCheckMachine'

const view = { account: 'fixtureAccount', phase: 'signInRequired', needsHuman: true, generation: 'a'.repeat(32), revision: 'b'.repeat(64), pageState: 'loginForm', address: 'https://example.com/login', width: 800, height: 600, canInteract: true, stream: null }

describe('the console browser view', () => {
  it('reads a view and only lets a sign-in page take input', () => {
    expect(parseView(view)).toMatchObject({ phase: 'signInRequired', canInteract: true, stream: null })
    expect(parseView({ ...view, phase: 'needsAttention' }).canInteract).toBe(false)
    expect(() => parseView({ ...view, phase: 'verified' })).toThrow('browserResponseInvalid')
    expect(parseView({ ...view, stream: { kind: 'voxl', url: 'javascript:alert(1)', page: {}, window: {} } }).stream).toBeNull()
  })

  it('waits for a browser that is not open and closes on request', async () => {
    const fetchBefore = globalThis.fetch
    globalThis.fetch = (async () => new Response(JSON.stringify({ schemaVersion: 1, view: { ...view, phase: 'browserMissing', generation: null, revision: null, pageState: null, address: null, canInteract: false } }), { headers: { 'content-type': 'application/json' } })) as typeof fetch
    try {
      const actor = createActor(browserCheckMachine, { input: { account: 'fixtureAccount', drawFrame: async () => {} } }).start()
      await waitFor(actor, (snapshot) => snapshot.matches('missing'))
      actor.send({ type: 'CLOSE' })
      expect(actor.getSnapshot().status).toBe('done')
    } finally {
      globalThis.fetch = fetchBefore
    }
  })
})
