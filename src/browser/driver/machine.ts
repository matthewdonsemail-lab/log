/**
 * One account's browser session, for any driver (rule 42). XState v5, `setup()` with named
 * actors, guards and actions; the driver's steps are provided with `machine.provide`.
 *
 *   preparing ─▶ gating ─(gatePassed)─▶ starting ─▶ selfChecking ─(selfCheckPassed)─▶ open
 *                  └─(else)─▶ refused                    └─(else)─▶ closing(selfCheckFailed)
 *   open ─CLOSE─▶ closing ─▶ closed        open ─CRASHED─▶ closing(crashed) ─▶ closed
 *
 * `starting` is only reachable from a passed gate, so no driver opens a browser without its
 * proxy checked (rule 12), and nothing is "open" before the self-check passed (rule 17).
 */
import { assign, fromPromise, setup } from 'xstate'
import type { BrowserEndpoint, BrowserSessionContext, BrowserSessionEvent, BrowserSessionInput, BrowserSessionOutput, CloseReason, DriverFailure, GateResult } from './types'

const failureOf = (error: unknown): DriverFailure => {
  if (error && typeof error === 'object' && 'code' in error) {
    const e = error as { code: unknown; detail?: unknown; message?: unknown }
    return { code: String(e.code), detail: String(e.detail ?? e.message ?? '') }
  }
  return { code: 'browserDriverFailed', detail: error instanceof Error ? error.message : String(error) }
}

/** Placeholders: a session must be given its driver's steps (`createBrowserSession`). */
const missing = (step: string): never => {
  throw { code: 'browserDriverFailed', detail: `no driver step "${step}" provided` }
}

export const browserSessionMachine = setup({
  types: {
    context: {} as BrowserSessionContext,
    events: {} as BrowserSessionEvent,
    input: {} as BrowserSessionInput,
    output: {} as BrowserSessionOutput
  },
  actors: {
    prepare: fromPromise<string, BrowserSessionInput>(async () => missing('prepare')),
    gate: fromPromise<GateResult, { input: BrowserSessionInput; handle: string }>(async () => missing('gate')),
    start: fromPromise<BrowserEndpoint, { input: BrowserSessionInput; handle: string; gate: GateResult }>(async () => missing('start')),
    selfCheck: fromPromise<{ ok: boolean; failure: DriverFailure | null }, { input: BrowserSessionInput; endpoint: BrowserEndpoint; gate: GateResult }>(async () => missing('selfCheck')),
    stop: fromPromise<void, { input: BrowserSessionInput; endpoint: BrowserEndpoint }>(async () => missing('stop'))
  },
  guards: {
    gatePassed: ({ context }) => context.gate?.ok === true,
    selfCheckPassed: (_, params: { ok: boolean }) => params.ok
  },
  actions: {
    recordFailure: assign({ failure: (_, params: { error: unknown }) => failureOf(params.error) }),
    recordGateRefusal: assign({ failure: ({ context }) => context.gate?.failure ?? { code: 'proxyGateFailed', detail: 'the gate refused the proxy' } }),
    recordClose: assign({ closeReason: (_, params: { reason: CloseReason }) => params.reason }),
    end: assign({ ended: (_, params: { as: BrowserSessionOutput['state'] }) => params.as })
  }
}).createMachine({
  id: 'browserSession',
  initial: 'preparing',
  context: ({ input }) => ({ input, handle: null, gate: null, endpoint: null, failure: null, closeReason: null, ended: null }),
  states: {
    preparing: {
      invoke: {
        src: 'prepare',
        input: ({ context }) => context.input,
        onDone: { target: 'gating', actions: assign({ handle: ({ event }) => event.output }) },
        onError: { target: 'failed', actions: { type: 'recordFailure', params: ({ event }) => ({ error: event.error }) } }
      }
    },
    gating: {
      invoke: {
        src: 'gate',
        input: ({ context }) => ({ input: context.input, handle: context.handle! }),
        onDone: { target: 'gateDecided', actions: assign({ gate: ({ event }) => event.output }) },
        onError: { target: 'refused', actions: { type: 'recordFailure', params: ({ event }) => ({ error: event.error }) } }
      }
    },
    gateDecided: {
      always: [{ guard: 'gatePassed', target: 'starting' }, { target: 'refused', actions: 'recordGateRefusal' }]
    },
    starting: {
      invoke: {
        src: 'start',
        input: ({ context }) => ({ input: context.input, handle: context.handle!, gate: context.gate! }),
        onDone: { target: 'selfChecking', actions: assign({ endpoint: ({ event }) => event.output }) },
        onError: { target: 'failed', actions: { type: 'recordFailure', params: ({ event }) => ({ error: event.error }) } }
      }
    },
    selfChecking: {
      invoke: {
        src: 'selfCheck',
        input: ({ context }) => ({ input: context.input, endpoint: context.endpoint!, gate: context.gate! }),
        onDone: [
          { guard: { type: 'selfCheckPassed', params: ({ event }) => ({ ok: event.output.ok }) }, target: 'open' },
          {
            target: 'closing',
            actions: [
              assign({ failure: ({ event }) => event.output.failure ?? { code: 'selfCheckFailed', detail: 'the launch self-check failed' } }),
              { type: 'recordClose', params: { reason: 'selfCheckFailed' } }
            ]
          }
        ],
        onError: {
          target: 'closing',
          actions: [{ type: 'recordFailure', params: ({ event }) => ({ error: event.error }) }, { type: 'recordClose', params: { reason: 'selfCheckFailed' } }]
        }
      }
    },
    open: {
      on: {
        CLOSE: { target: 'closing', actions: { type: 'recordClose', params: ({ event }) => ({ reason: event.reason }) } },
        CRASHED: {
          target: 'closing',
          actions: [assign({ failure: ({ event }) => ({ code: 'browserGone', detail: event.detail }) }), { type: 'recordClose', params: { reason: 'crashed' } }]
        }
      }
    },
    closing: {
      always: { guard: ({ context }) => context.endpoint === null, target: 'closed' },
      invoke: {
        src: 'stop',
        input: ({ context }) => ({ input: context.input, endpoint: context.endpoint! }),
        onDone: 'closed',
        onError: { target: 'closed', actions: { type: 'recordFailure', params: ({ event }) => ({ error: event.error }) } }
      }
    },
    closed: { type: 'final', entry: { type: 'end', params: { as: 'closed' } } },
    refused: { type: 'final', entry: { type: 'end', params: { as: 'refused' } } },
    failed: { type: 'final', entry: { type: 'end', params: { as: 'failed' } } }
  },
  output: ({ context }) => ({ state: context.ended ?? 'closed', closeReason: context.closeReason, failure: context.failure })
})
