import { assign, fromCallback, fromPromise, setup } from 'xstate'
import { browserFrame, browserInput, browserStatus } from './browserCheckData'
import type { BrowserCheckView, BrowserInput } from './browserCheckTypes'

type Context = { account: string; view: BrowserCheckView | null; error: string | null; attempts: number; hasFrame: boolean; pending: boolean; input: BrowserInput | null; drawFrame: (blob: Blob) => Promise<void> }
type Event = { type: 'CLOSE' | 'RECONNECT' } | { type: 'INPUT'; input: BrowserInput } | { type: 'OBSERVED'; view: BrowserCheckView } | { type: 'FRAME_READY'; revision: string | null } | { type: 'STREAM_LOST'; error: string }
const sessionPhases = ['signInRequired', 'needsAttention', 'busy', 'ready']
const delay = (ms: number, signal: AbortSignal) => new Promise<void>((resolve) => { const done = () => { clearTimeout(timer); signal.removeEventListener('abort', done); resolve() }; const timer = setTimeout(done, ms); signal.addEventListener('abort', done, { once: true }); if (signal.aborted) done() })
const errorOf = (event: unknown) => { const error = (event as { error?: unknown }).error; return error instanceof Error ? error.message : 'browserViewerUnavailable' }

export const browserCheckMachine = setup({
  types: { context: {} as Context, input: {} as Pick<Context, 'account' | 'drawFrame'>, events: {} as Event },
  actors: {
    status: fromPromise(({ input, signal }: { input: { account: string }; signal: AbortSignal }) => browserStatus(input.account, signal)),
    input: fromPromise(({ input, signal }: { input: { view: BrowserCheckView; event: BrowserInput }; signal: AbortSignal }) => browserInput(input.view, input.event, signal)),
    stream: fromCallback<Event, Context>(({ input, sendBack }) => {
      const controller = new AbortController()
      if (input.view?.stream) { sendBack({ type: 'FRAME_READY', revision: null }); return () => controller.abort() }
      void (async () => {
        let nextStatus = 0
        while (!controller.signal.aborted) {
          try {
            const frame = await browserFrame(input.account, input.view!.generation!, controller.signal)
            if (controller.signal.aborted) break
            await input.drawFrame(frame.blob)
            if (controller.signal.aborted) break
            sendBack({ type: 'FRAME_READY', revision: frame.revision })
            if (Date.now() >= nextStatus) { const view = await browserStatus(input.account, controller.signal); if (!controller.signal.aborted) sendBack({ type: 'OBSERVED', view }); nextStatus = Date.now() + 2000 }
          } catch (error) { if (!controller.signal.aborted) sendBack({ type: 'STREAM_LOST', error: error instanceof Error ? error.message : 'browserViewerUnavailable' }); break }
          await delay(500, controller.signal)
        }
      })()
      return () => controller.abort()
    }),
  },
  guards: {
    inSession: ({ context }) => Boolean(context.view?.generation && sessionPhases.includes(context.view.phase)),
    missing: ({ context }) => context.view?.phase === 'browserMissing',
    exhausted: ({ context }) => context.attempts >= 5,
    generationChanged: ({ context, event }) => event.type === 'OBSERVED' && event.view.generation !== context.view?.generation,
    canInteract: ({ context }) => context.hasFrame && !context.pending && context.view?.canInteract === true,
  },
  actions: {
    accept: assign(({ context, event }) => { const view = (event as unknown as { output: BrowserCheckView }).output; return { view, error: null, input: null, attempts: view.phase === 'viewerUnavailable' ? context.attempts : 0 } }),
    observe: assign(({ context, event }) => (event.type === 'OBSERVED' ? { view: { ...event.view, revision: context.pending ? context.view?.revision ?? event.view.revision : event.view.revision } } : {})),
    setFrame: assign(({ context, event }) => (event.type === 'FRAME_READY' ? { hasFrame: true, view: context.view && event.revision && !context.pending ? { ...context.view, revision: event.revision } : context.view } : {})),
    attempt: assign({ attempts: ({ context }) => context.attempts + 1 }),
    begin: assign({ pending: true }),
    settle: assign({ pending: false, input: null }),
    clear: assign({ hasFrame: false }),
    keepInput: assign(({ event }) => (event.type === 'INPUT' ? { input: event.input } : {})),
    fail: assign(({ event }) => ({ error: errorOf(event), pending: false, input: null })),
    loseStream: assign(({ event }) => ({ error: event.type === 'STREAM_LOST' ? event.error : 'browserViewerUnavailable', hasFrame: false })),
  },
}).createMachine({
  id: 'consoleBrowserCheck',
  initial: 'connecting',
  context: ({ input }) => ({ ...input, view: null, error: null, attempts: 0, hasFrame: false, pending: false, input: null }),
  on: { CLOSE: '.closed' },
  states: {
    connecting: { entry: ['clear', 'attempt'], invoke: { src: 'status', input: ({ context }) => ({ account: context.account }), onDone: { target: 'route', actions: 'accept' }, onError: { target: 'reconnecting', actions: 'fail' } } },
    route: { always: [{ guard: 'inSession', target: 'session' }, { guard: 'missing', target: 'missing' }, { target: 'reconnecting' }] },
    reconnecting: { always: { guard: 'exhausted', target: 'disconnected' }, after: { 2000: 'connecting' } },
    missing: { after: { 3000: 'connecting' }, on: { RECONNECT: 'connecting' } },
    disconnected: { on: { RECONNECT: { target: 'connecting', actions: assign({ attempts: 0 }) } } },
    session: {
      initial: 'viewing',
      invoke: { src: 'stream', input: ({ context }) => context },
      on: {
        FRAME_READY: { actions: 'setFrame' },
        STREAM_LOST: { target: 'reconnecting', actions: 'loseStream' },
        OBSERVED: [{ guard: 'generationChanged', target: 'connecting', actions: 'observe' }, { actions: 'observe' }],
      },
      states: {
        viewing: { on: { INPUT: { guard: 'canInteract', target: 'interacting', actions: 'keepInput' } } },
        interacting: {
          entry: 'begin',
          exit: 'settle',
          invoke: { src: 'input', input: ({ context }) => ({ view: context.view!, event: context.input! }), onDone: { target: 'viewing', actions: 'accept' }, onError: { target: 'viewing', actions: 'fail' } },
        },
      },
    },
    closed: { type: 'final' },
  },
})
