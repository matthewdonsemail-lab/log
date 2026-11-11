import { assign, fromCallback, fromPromise, setup } from 'xstate'
import { BrowserRequestError, browserFrame, requestBrowser } from './browserCheckData'
import type { BrowserCheckView, BrowserOperation, BrowserPhase } from './browserCheckTypes'

type Context = { closeRequested: boolean; navigation: 'back' | 'reload' | null; provisioned: boolean; opened: boolean; attempts: number; accountId: string; view: BrowserCheckView | null; error: string | null; hasFrame: boolean; pending: boolean; input: Record<string, unknown> | null; drawFrame: (blob: Blob) => Promise<void> }
type Event = { type: 'CLOSE' | 'OPEN' | 'LINK_PROFILE' | 'RECONNECT' | 'VERIFY' | 'RESOLVE' | 'COMPLETE' } | { type: 'NAVIGATE'; action: 'back' | 'reload' } | { type: 'INPUT'; input: Record<string, unknown> } | { type: 'OBSERVED'; view: BrowserCheckView } | { type: 'FRAME_READY' } | { type: 'STREAM_LOST' }
type RequestInput = { context: Context; operation: BrowserOperation }
const phaseStates = {
  profileSetupBlocked: 'setupBlocked', operationUncertain: 'uncertain', serviceUnavailable: 'disconnected',
  launchCooldown: 'waiting', waitingForOwner: 'waiting', launchBlocked: 'blocked', launchUncertain: 'uncertain',
  providerSetupRequired: 'setupRequired', profileRequired: 'setupBlocked', browserMissing: 'uncertain', viewerUnavailable: 'unavailable',
  ready: 'session', signInRequired: 'session', needsResolution: 'session', needsAttention: 'blocked', stopped: 'blocked',
  unknown: 'session', verified: 'session', busy: 'waiting',
} satisfies Record<BrowserPhase, string>
const sessionPhases: BrowserPhase[] = ['ready', 'signInRequired', 'needsResolution', 'unknown', 'verified', 'busy']
const delay = (ms: number, signal: AbortSignal) => new Promise<void>((resolve) => { const done = () => { clearTimeout(timer); signal.removeEventListener('abort', done); resolve() }; const timer = setTimeout(done, ms); signal.addEventListener('abort', done, { once: true }); if (signal.aborted) done() })

export const browserCheckMachine = setup({
  types: { context: {} as Context, input: {} as Pick<Context, 'accountId' | 'drawFrame'>, events: {} as Event },
  actors: {
    request: fromPromise(({ input, signal }: { input: RequestInput; signal: AbortSignal }) => requestBrowser(input.context.accountId, input.operation, input.context.view, input.context.input, signal)),
    stream: fromCallback<Event, Context>(({ input, sendBack }) => {
      const controller = new AbortController()
      void (async () => {
        let nextStatus = 0
        while (!controller.signal.aborted) {
          try {
            const blob = await browserFrame(input.accountId, input.view!.viewerId!, controller.signal)
            if (controller.signal.aborted) break
            await input.drawFrame(blob)
            if (controller.signal.aborted) break
            sendBack({ type: 'FRAME_READY' })
            if (Date.now() >= nextStatus) { const view = await requestBrowser(input.accountId, 'status', null, null, controller.signal); if (!controller.signal.aborted) sendBack({ type: 'OBSERVED', view }); nextStatus = Date.now() + 2000 }
          } catch (error) { if (!controller.signal.aborted) console.warn('[browserCheck] stream failed', { reason: error instanceof Error ? error.name + ': ' + error.message : 'unknown' }); if (!controller.signal.aborted) sendBack({ type: 'STREAM_LOST' }); break }
          await delay(500, controller.signal)
        }
      })()
      return () => controller.abort()
    }),
  },
  guards: {
    wantsClose: ({ context }) => context.closeRequested,
    viewerChanged: ({ context, event }) => !context.pending && event.type === 'OBSERVED' && (event.view.generation !== context.view?.generation || event.view.viewerId !== context.view?.viewerId),
    phaseIs: ({ context }, params: { phase: BrowserPhase }) => context.view?.phase === params.phase && (phaseStates[params.phase] !== 'session' || Boolean(context.view.viewerId)),
    sessionEnded: ({ context, event }) => !context.pending && event.type === 'OBSERVED' && !sessionPhases.includes(event.view.phase),
    hasFailureView: ({ context }) => Boolean(context.view),
    viewerUnavailable: ({ context }) => context.view?.phase === 'viewerUnavailable',
    notPending: ({ context }) => !context.pending,
    canOpen: ({ context }) => !context.opened && context.view?.phase === 'browserMissing',
    canLink: ({ context }) => !context.provisioned && context.view?.phase === 'profileRequired',
    canVerify: ({ context }) => context.hasFrame && !context.pending && Boolean(context.view && ['ready', 'signInRequired', 'needsResolution', 'unknown', 'verified'].includes(context.view.phase)),
    canResolve: ({ context }) => context.hasFrame && !context.pending && context.view?.canResolve === true,
    canInteract: ({ context }) => context.hasFrame && !context.pending && context.view?.canInteract === true,
    canNavigate: ({ context, event }) => context.hasFrame && !context.pending && context.view?.canNavigate === true && event.type === 'NAVIGATE' && (event.action !== 'back' || context.view.canGoBack === true),
    canComplete: ({ context }) => context.hasFrame && !context.pending && context.view?.canComplete === true,
  },
  actions: {
    requestClose: assign({ closeRequested: true }),
    accept: assign(({ context, event }) => { const view = (event as unknown as { output: BrowserCheckView }).output; return { view, hasFrame: Boolean(view.viewerId && sessionPhases.includes(view.phase) && context.hasFrame), error: null, input: null } }),
    observe: assign(({ event }) => event.type === 'OBSERVED' ? { view: event.view } : {}),
    setFrame: assign({ hasFrame: true, attempts: 0 }),
    provision: assign({ provisioned: true }),
    open: assign({ opened: true }),
    attempt: assign({ attempts: ({ context }) => context.attempts + 1 }),
    begin: assign({ pending: true, error: null }),
    settle: assign({ pending: false, input: null }),
    clear: assign({ hasFrame: false, error: null, input: null }),
    fail: assign(({ event }) => { const error = (event as unknown as { error: unknown }).error; return { view: error instanceof BrowserRequestError ? error.view : null, error: error instanceof Error ? error.message : 'browserUnavailable', pending: false, input: null, hasFrame: false } }),
    changedViewer: assign({ error: 'browserGenerationChanged', hasFrame: false, pending: false, input: null }),
    loseStream: assign({ error: 'browserViewerUnavailable', hasFrame: false, pending: false, input: null }),
    keepNavigation: assign(({ event }) => event.type === 'NAVIGATE' ? { navigation: event.action } : {}),
    keepInput: assign(({ event }) => event.type === 'INPUT' ? { input: event.input } : {}),
  },
}).createMachine({
  id: 'consoleBrowserCheck', initial: 'connecting', context: ({ input }) => ({ ...input, view: null, closeRequested: false, navigation: null, provisioned: false, opened: false, attempts: 0, error: null, hasFrame: false, pending: false, input: null }),
  on: { CLOSE: [{ guard: 'notPending', target: '.closing', actions: 'requestClose' }, { actions: 'requestClose' }] },
  states: {
    connecting: { entry: ['clear', 'attempt'], invoke: { src: 'request', input: ({ context }) => ({ context, operation: 'status' }), onDone: { target: 'route', actions: 'accept' }, onError: { target: 'reconnecting', actions: 'fail' } } },
    route: { always: [{ guard: 'wantsClose', target: 'closing' }, { guard: 'canLink', target: 'linking' }, { guard: 'canOpen', target: 'opening' }, { guard: ({ context }) => context.view?.phase === 'busy' && Boolean(context.view.viewerId), target: 'session' }, ...Object.entries(phaseStates).map(([phase, target]) => ({ guard: { type: 'phaseIs' as const, params: { phase: phase as BrowserPhase } }, target })), { target: 'uncertain' }] },
    reconnecting: { always: { guard: ({ context }) => context.attempts >= 5, target: 'disconnected' }, after: { 2000: 'connecting' } },
    unavailable: { always: { guard: ({ context }) => context.view?.phase === 'viewerUnavailable' && context.attempts >= 5, target: 'disconnected' }, after: { 2000: { guard: 'viewerUnavailable', target: 'connecting' } }, on: { OPEN: { guard: 'canOpen', target: 'opening' }, LINK_PROFILE: { guard: 'canLink', target: 'linking' }, RECONNECT: 'connecting' } },
    opening: { entry: ['begin', 'open'], exit: 'settle', invoke: { src: 'request', input: ({ context }) => ({ context, operation: 'open' }), onDone: { target: 'route', actions: 'accept' }, onError: { target: 'failure', actions: 'fail' } } },
    linking: { entry: ['begin', 'provision'], exit: 'settle', invoke: { src: 'request', input: ({ context }) => ({ context, operation: 'linkProfile' }), onDone: { target: 'route', actions: 'accept' }, onError: { target: 'failure', actions: 'fail' } } },
    session: {
      initial: 'viewing', invoke: { src: 'stream', input: ({ context }) => context },
      on: { FRAME_READY: { actions: 'setFrame' }, STREAM_LOST: [{ guard: 'notPending', target: 'reconnecting', actions: 'loseStream' }, { actions: assign({ hasFrame: false }) }], OBSERVED: [{ guard: 'sessionEnded', target: '#consoleBrowserCheck.route', actions: ['observe', 'clear'] }, { guard: 'viewerChanged', target: 'reconnecting', actions: 'changedViewer' }, { guard: 'notPending', actions: 'observe' }] },
      states: {
        viewing: { on: { NAVIGATE: { guard: 'canNavigate', target: 'navigating', actions: 'keepNavigation' }, VERIFY: { guard: 'canVerify', target: 'checking' }, RESOLVE: { guard: 'canResolve', target: 'resolving' }, COMPLETE: { guard: 'canComplete', target: 'completing' }, INPUT: { guard: 'canInteract', target: 'interacting', actions: 'keepInput' } } },
        navigating: { entry: 'begin', exit: 'settle', invoke: { src: 'request', input: ({ context }) => ({ context, operation: context.navigation! }), onDone: { target: '#consoleBrowserCheck.route', actions: 'accept' }, onError: { target: '#consoleBrowserCheck.failure', actions: 'fail' } } },
        checking: { entry: 'begin', exit: 'settle', invoke: { src: 'request', input: ({ context }) => ({ context, operation: 'verify' }), onDone: { target: '#consoleBrowserCheck.route', actions: 'accept' }, onError: { target: '#consoleBrowserCheck.failure', actions: 'fail' } } },
        resolving: { entry: 'begin', exit: 'settle', invoke: { src: 'request', input: ({ context }) => ({ context, operation: 'resolve' }), onDone: { target: '#consoleBrowserCheck.route', actions: 'accept' }, onError: { target: '#consoleBrowserCheck.failure', actions: 'fail' } } },
        interacting: { entry: 'begin', exit: 'settle', invoke: { src: 'request', input: ({ context }) => ({ context, operation: 'input' }), onDone: { target: '#consoleBrowserCheck.route', actions: 'accept' }, onError: { target: '#consoleBrowserCheck.failure', actions: 'fail' } } },
        completing: { entry: 'begin', exit: 'settle', invoke: { src: 'request', input: ({ context }) => ({ context, operation: 'complete' }), onDone: { target: '#consoleBrowserCheck.completed', actions: 'accept' }, onError: { target: '#consoleBrowserCheck.failure', actions: 'fail' } } },
      },
    },
    failure: { always: [{ guard: 'wantsClose', target: 'closing' }, { guard: 'hasFailureView', target: 'route' }] },
    closing: { entry: 'begin', exit: 'settle', invoke: { src: 'request', input: ({ context }) => ({ context, operation: 'close' }), onDone: { target: 'closed', actions: 'accept' }, onError: { target: 'closeFailed', actions: 'fail' } }, on: { CLOSE: {} } },
    closeFailed: {},
    closed: { type: 'final' },
    waiting: {},
    setupRequired: {},
    setupBlocked: {},
    blocked: {},
    uncertain: {},
    disconnected: {},
    completed: { type: 'final' },
  },
})
