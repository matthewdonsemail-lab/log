/**
 * The account lifecycle (rule 35): one machine per account, the browser opened
 * once per local day and kept open, every action a step inside it.
 *
 *   onboarding:  proxying ─▶ opening ─▶ next ─┬─▶ signingIn ─────┐
 *                                    ▲         ├─▶ checkingAccount│
 *                                    │         ├─▶ settingProfile │  each ok ─▶ next
 *                                    │         ├─▶ settingName    │
 *                                    │         ├─▶ settingLocation│
 *                                    │         ├─▶ warming (Listaro's five activities, a day)
 *                                    │         └─▶ attached ─▶ host
 *                                    └── overnight (close: endOfActiveHours, wait, reopen)
 *   host:        opening ─▶ watching ⇄ checking (Selling, inbox, notifications)
 *                              ⇅ ACT ─▶ acting (publish, reply: a tab, never a launch)
 *                              └─ end of day ─▶ overnight ─▶ opening
 *   any step:    issue ─▶ needsLogin: signingIn (same browser) | checkpoint: needsPerson ─PERSON_DONE─▶ checkingAccount
 *                         limited: cooling ─▶ opening | restricted/banned: closed, final (kept in Twenty)
 *                error ─▶ retried once ─▶ stuck (needs a person)
 *   anywhere:    PAUSE ─▶ paused ─RESUME─▶ opening | SHUTDOWN ─▶ stopped | LOST ─▶ lost
 *
 * The router `onboarding.next` picks the first step not done yet from the
 * context, so an interruption (a person, a sign-in, the night) comes back to
 * exactly where it left, and an account loaded from Twenty starts where it is.
 */
import { assign, fromPromise, setup } from 'xstate'
import { statusForIssue } from '../socialAccount/helpers/index'
import { nextOnboardingStep, nextWarmupActivity, warmupComplete } from './helpers/onboardingStep'
import type { CloseReason, HostAction, LifecycleActorInputs, LifecycleContext, LifecycleEvent, LifecycleInput, StepOutcome, WarmupActivity } from './types'
import { DEFAULT_LIFECYCLE_TIMING, OPENS_PER_DAY } from './types'

const need = <I>(name: string) =>
  fromPromise<StepOutcome, I>(async () => {
    throw new Error(`lifecycleMachine: provide the \`${name}\` actor`)
  })

type Ctx = { context: LifecycleContext }
type Done = { context: LifecycleContext; event: { output: StepOutcome } }

const ok = (_: unknown, o: StepOutcome) => o.kind === 'ok'
const isIssue = (_: unknown, o: StepOutcome) => o.kind === 'issue'
const canRetry = ({ context }: Ctx, o: StepOutcome) => o.kind === 'error' && o.retryable && !context.retried

/**
 * One step that touches Facebook: run it; ok ─▶ `next` (with `onOk`); an account
 * issue ─▶ the issue router; a retryable error ─▶ once more after `retry`; else stuck.
 */
function step<K extends keyof LifecycleActorInputs>(
  src: K,
  input: (args: Ctx) => LifecycleActorInputs[K],
  next: string,
  onOk: (args: Done) => Partial<LifecycleContext> = () => ({})
) {
  // Steps sit inside a lane; a bare target names a state of the onboarding lane.
  const target = next.startsWith('#') ? next : `#lifecycle.onboarding.${next}`
  return {
    initial: 'run',
    states: {
      run: {
        entry: assign(({ context }: Ctx) => ({ trail: [...context.trail, src] })),
        invoke: {
          src,
          input,
          onDone: [
            {
              guard: { type: 'ok', params: ({ event }: Done) => event.output },
              target,
              actions: assign(((args: Done) => ({ ...onOk(args), retried: false, lastError: null })) as never)
            },
            {
              guard: { type: 'isIssue', params: ({ event }: Done) => event.output },
              target: '#lifecycle.issue',
              actions: 'recordIssue'
            },
            {
              guard: { type: 'canRetry', params: ({ event }: Done) => event.output },
              target: 'waitRetry',
              actions: 'recordError'
            },
            { target: '#lifecycle.stuck', actions: 'recordError' }
          ],
          onError: { target: '#lifecycle.stuck', actions: assign(({ event }: { event: { error: unknown } }) => ({ lastError: { code: 'crashed', detail: String(event.error) } })) }
        }
      },
      waitRetry: { entry: assign({ retried: true }), after: { retry: 'run' } }
    }
    // Built outside `setup`, so XState can't infer it here; the machine around it stays typed (as createFlowMachine).
  } as never
}

/** Close the browser for a reason (rule 35: never a silent close), then go on. */
function closing(reason: CloseReason, then: string) {
  return {
    invoke: {
      src: 'closeBrowser',
      input: ({ context }: Ctx) => ({ accountId: context.accountId, reason }),
      onDone: { target: then, actions: { type: 'logClose', params: reason } },
      onError: { target: then, actions: { type: 'logClose', params: reason } }
    }
  } as never
}

export const lifecycleMachine = setup({
  types: {
    context: {} as LifecycleContext,
    input: {} as LifecycleInput,
    events: {} as LifecycleEvent,
    output: {} as { accountId: string; state: string; context: LifecycleContext }
  },
  actors: {
    checkProxy: need<LifecycleActorInputs['checkProxy']>('checkProxy'),
    openBrowser: need<LifecycleActorInputs['openBrowser']>('openBrowser'),
    closeBrowser: need<LifecycleActorInputs['closeBrowser']>('closeBrowser'),
    signIn: need<LifecycleActorInputs['signIn']>('signIn'),
    checkAccount: need<LifecycleActorInputs['checkAccount']>('checkAccount'),
    setProfile: need<LifecycleActorInputs['setProfile']>('setProfile'),
    setName: need<LifecycleActorInputs['setName']>('setName'),
    setLocation: need<LifecycleActorInputs['setLocation']>('setLocation'),
    warmupActivity: need<LifecycleActorInputs['warmupActivity']>('warmupActivity'),
    watchCheck: need<LifecycleActorInputs['watchCheck']>('watchCheck'),
    act: need<LifecycleActorInputs['act']>('act'),
    waitForActiveHours: need<LifecycleActorInputs['waitForActiveHours']>('waitForActiveHours')
  },
  guards: {
    ok,
    isIssue,
    canRetry,
    endOfDay: (_, o: StepOutcome) => o.kind === 'ok' && o.endOfDay === true,
    opensLeft: ({ context }) => context.browser.opensToday < OPENS_PER_DAY,
    browserOpen: ({ context }) => context.browser.open,
    browserClosed: ({ context }) => !context.browser.open,
    toStep: ({ context }, step: string) => nextOnboardingStep(context) === step,
    issueStatus: ({ context }, status: string) => context.issue != null && statusForIssue(context.issue.code) === status,
    activityLeft: ({ context }) => nextWarmupActivity(context) !== null,
    warmupOver: ({ context }) => warmupComplete(context, context.now())
  },
  actions: {
    // Both read the step's outcome from its done event, so transitions name them plainly.
    recordIssue: assign(({ event }) => {
      const o = (event as { output?: StepOutcome }).output
      return o?.kind === 'issue' ? { issue: { code: o.issue, detail: o.detail } } : {}
    }),
    recordError: assign(({ event }) => {
      const o = (event as { output?: StepOutcome }).output
      return o?.kind === 'error' ? { lastError: { code: o.code, detail: o.detail } } : {}
    }),
    logClose: assign(({ context }, reason: CloseReason) => ({
      browser: { ...context.browser, open: false, closes: [...context.browser.closes, { reason, at: new Date(context.now()).toISOString() }] },
      trail: [...context.trail, `close:${reason}`]
    })),
    newDay: assign(({ context }) => ({ browser: { ...context.browser, opensToday: 0 }, trail: [...context.trail, 'newDay'] })),
    markActivity: assign(({ context }) => {
      const activity = nextWarmupActivity(context)
      return activity ? { warmup: { ...context.warmup, done: [...context.warmup.done, activity] }, retried: false } : {}
    }),
    recordAction: assign(({ context }) => ({ pending: null, actions: context.pending ? [...context.actions, { action: context.pending, outcome: 'ok' as const }] : context.actions })),
    opensSpent: assign({ lastError: { code: 'opensSpent', detail: `the browser was opened ${OPENS_PER_DAY} times today (rule 35)` } })
  },
  delays: {
    retry: ({ context }) => context.timing.retryMs,
    activityGap: ({ context }) => context.timing.activityGapMs,
    watchInterval: ({ context }) => context.timing.watchIntervalMs,
    limitedRest: ({ context }) => context.timing.limitedRestMs,
    warmupLeft: ({ context }) => Math.max(0, (context.warmup.startedAt ?? context.now()) + context.timing.warmupMs - context.now())
  }
}).createMachine({
  id: 'lifecycle',
  context: ({ input }) => {
    const now = input.now ?? (() => Date.now())
    const s = input.standing
    return {
      accountId: s.accountId,
      liveActions: input.liveActions,
      timing: { ...DEFAULT_LIFECYCLE_TIMING, ...input.timing },
      standing: s,
      browser: { open: false, opensToday: 0, closes: [] },
      warmup: { startedAt: s.warmupStartedAt ? Date.parse(s.warmupStartedAt) : null, done: [] },
      issue: null,
      lastError: null,
      retried: false,
      actions: [],
      checks: 0,
      trail: [],
      checked: false,
      pending: null,
      now
    }
  },
  initial: 'routing',
  on: {
    PAUSE: { target: '.paused' },
    SHUTDOWN: { target: '.stopping' },
    LOST: { target: '.losing' }
  },
  states: {
    /** Where a loaded account starts: the record decides (rule 13 keeps the final ones final). */
    routing: {
      always: [
        { guard: ({ context }) => context.standing.status === 'banned', target: 'banned' },
        { guard: ({ context }) => context.standing.status === 'dead', target: 'lost' },
        { guard: ({ context }) => context.standing.status === 'restricted', target: 'restricted' },
        { guard: ({ context }) => context.standing.status === 'paused', target: 'paused' },
        { guard: ({ context }) => !context.standing.hasProxy, target: 'onboarding.proxying' },
        { target: 'onboarding.opening' }
      ]
    },

    onboarding: {
      initial: 'next',
      states: {
        proxying: step('checkProxy', ({ context }) => ({ accountId: context.accountId }), 'opening', ({ context }) => ({ standing: { ...context.standing, hasProxy: true } })),
        /** The day's one open (or the crash reopen): gate, device, locale, self-check, HAR (rules 11-12, 15-17, 22). */
        opening: {
          initial: 'gate',
          states: {
            gate: {
              always: [
                { guard: 'browserOpen', target: '#lifecycle.onboarding.next' },
                { guard: 'opensLeft', target: 'launch' },
                { target: '#lifecycle.stuck', actions: 'opensSpent' }
              ]
            },
            launch: step(
              'openBrowser',
              ({ context }) => ({ accountId: context.accountId, opensToday: context.browser.opensToday }),
              '#lifecycle.onboarding.next',
              ({ context }) => ({ browser: { ...context.browser, open: true, opensToday: context.browser.opensToday + 1 } })
            )
          }
        },
        /** The router: the first onboarding step not done yet, or the host. */
        next: {
          always: [
            { guard: 'browserClosed', target: 'opening' },
            { guard: { type: 'toStep', params: 'signingIn' }, target: 'signingIn' },
            { guard: { type: 'toStep', params: 'checkingAccount' }, target: 'checkingAccount' },
            { guard: { type: 'toStep', params: 'settingProfile' }, target: 'settingProfile' },
            { guard: { type: 'toStep', params: 'settingName' }, target: 'settingName' },
            { guard: { type: 'toStep', params: 'settingLocation' }, target: 'settingLocation' },
            { guard: { type: 'toStep', params: 'warming' }, target: 'warming' },
            { target: 'attached' }
          ]
        },
        signingIn: step('signIn', ({ context }) => ({ accountId: context.accountId }), 'next', ({ context }) => ({
          standing: { ...context.standing, hasSession: true, status: 'active' },
          issue: null
        })),
        checkingAccount: step('checkAccount', ({ context }) => ({ accountId: context.accountId }), 'next', ({ context }) => ({
          standing: { ...context.standing, status: context.standing.status === 'checkpoint' ? 'active' : context.standing.status },
          issue: null,
          checked: true
        })),
        settingProfile: step('setProfile', ({ context }) => ({ accountId: context.accountId, live: context.liveActions }), 'next', ({ context }) => ({
          standing: { ...context.standing, profileSet: true }
        })),
        settingName: step('setName', ({ context }) => ({ accountId: context.accountId, live: context.liveActions }), 'next', ({ context }) => ({
          standing: { ...context.standing, named: true }
        })),
        settingLocation: step('setLocation', ({ context }) => ({ accountId: context.accountId, live: context.liveActions }), 'next', ({ context }) => ({
          standing: { ...context.standing, locationSet: true }
        })),
        /** A day of Listaro's five warm-up activities in the open browser, spaced through the day. */
        warming: {
          entry: assign(({ context }) => (context.warmup.startedAt ? {} : { warmup: { ...context.warmup, startedAt: context.now() } })),
          initial: 'pick',
          states: {
            pick: {
              always: [
                { guard: 'warmupOver', target: '#lifecycle.onboarding.attached' },
                { guard: 'activityLeft', target: 'activity' },
                { target: 'waitingOutDay' }
              ]
            },
            activity: {
              initial: 'run',
              states: {
                run: {
                  entry: assign(({ context }) => ({ trail: [...context.trail, `warmup:${nextWarmupActivity(context)}`] })),
                  invoke: {
                    src: 'warmupActivity',
                    input: ({ context }) => ({ accountId: context.accountId, activity: nextWarmupActivity(context) as WarmupActivity, live: context.liveActions }),
                    onDone: [
                      {
                        guard: { type: 'endOfDay', params: ({ event }) => event.output },
                        target: '#lifecycle.onboarding.overnight',
                        actions: 'markActivity'
                      },
                      { guard: { type: 'ok', params: ({ event }) => event.output }, target: '#lifecycle.onboarding.warming.gap', actions: 'markActivity' },
                      { guard: { type: 'isIssue', params: ({ event }) => event.output }, target: '#lifecycle.issue', actions: 'recordIssue' },
                      { guard: { type: 'canRetry', params: ({ event }) => event.output }, target: 'waitRetry', actions: 'recordError' },
                      { target: '#lifecycle.stuck', actions: 'recordError' }
                    ],
                    onError: { target: '#lifecycle.stuck' }
                  }
                },
                waitRetry: { entry: assign({ retried: true }), after: { retry: 'run' } }
              }
            },
            gap: { after: { activityGap: 'pick' } },
            /** Every activity ran: the browser stays open until the warm-up day is over. */
            waitingOutDay: { after: { warmupLeft: 'pick' } }
          }
        },
        /** The night during onboarding: close for the reason, wait for the morning, open again, carry on. */
        overnight: {
          initial: 'close',
          states: {
            close: closing('endOfActiveHours', 'rest'),
            rest: {
              invoke: {
                src: 'waitForActiveHours',
                input: ({ context }) => ({ accountId: context.accountId }),
                onDone: { target: '#lifecycle.onboarding.opening', actions: 'newDay' },
                onError: { target: '#lifecycle.stuck' }
              }
            }
          }
        },
        attached: {
          entry: assign(({ context }) => ({
            standing: { ...context.standing, warmedAt: context.standing.warmedAt ?? new Date(context.now()).toISOString() },
            trail: [...context.trail, 'attached']
          })),
          always: { target: '#lifecycle.host' }
        }
      }
    },

    host: {
      initial: 'opening',
      states: {
        opening: {
          initial: 'gate',
          states: {
            gate: {
              always: [
                { guard: 'browserOpen', target: '#lifecycle.host.watching' },
                { guard: 'opensLeft', target: 'launch' },
                { target: '#lifecycle.stuck', actions: 'opensSpent' }
              ]
            },
            launch: step(
              'openBrowser',
              ({ context }) => ({ accountId: context.accountId, opensToday: context.browser.opensToday }),
              '#lifecycle.host.watching',
              ({ context }) => ({ browser: { ...context.browser, open: true, opensToday: context.browser.opensToday + 1 } })
            )
          }
        },
        watching: {
          on: { ACT: { target: 'acting', actions: assign(({ context, event }) => ({ pending: event.action, trail: [...context.trail, `act:${event.action.kind}`] })) } },
          after: { watchInterval: 'checking' }
        },
        /** One check in the open browser: Selling (review, health), the inbox (rule 34), notifications. */
        checking: {
          initial: 'run',
          states: {
            run: {
              entry: assign(({ context }) => ({ checks: context.checks + 1, trail: [...context.trail, 'watchCheck'] })),
              invoke: {
                src: 'watchCheck',
                input: ({ context }) => ({ accountId: context.accountId }),
                onDone: [
                  { guard: { type: 'endOfDay', params: ({ event }) => event.output }, target: '#lifecycle.host.overnight' },
                  { guard: { type: 'ok', params: ({ event }) => event.output }, target: '#lifecycle.host.watching', actions: assign({ retried: false }) },
                  { guard: { type: 'isIssue', params: ({ event }) => event.output }, target: '#lifecycle.issue', actions: 'recordIssue' },
                  {
                    // The window went away (crash, closed by hand): reopen once, within today's opens.
                    guard: ({ event }) => event.output.kind === 'error' && event.output.code === 'browserGone',
                    target: '#lifecycle.host.crashed',
                    actions: 'recordError'
                  },
                  { guard: { type: 'canRetry', params: ({ event }) => event.output }, target: 'waitRetry', actions: 'recordError' },
                  { target: '#lifecycle.stuck', actions: 'recordError' }
                ],
                onError: { target: '#lifecycle.stuck' }
              }
            },
            waitRetry: { entry: assign({ retried: true }), after: { retry: 'run' } }
          }
        },
        /** An action is a tab in the open browser, never a launch (rule 35). */
        acting: {
          invoke: {
            src: 'act',
            input: ({ context }) => ({ accountId: context.accountId, action: context.pending as HostAction }),
            onDone: [
              {
                guard: { type: 'isIssue', params: ({ event }) => event.output },
                target: '#lifecycle.issue',
                actions: ['recordIssue', 'recordAction']
              },
              { target: 'watching', actions: 'recordAction' }
            ],
            onError: { target: '#lifecycle.stuck' }
          }
        },
        crashed: {
          entry: assign(({ context }) => ({
            browser: { ...context.browser, open: false, closes: [...context.browser.closes, { reason: 'crash' as const, at: new Date(context.now()).toISOString() }] },
            trail: [...context.trail, 'close:crash']
          })),
          always: { target: 'opening' }
        },
        overnight: {
          initial: 'close',
          states: {
            close: closing('endOfActiveHours', 'rest'),
            rest: {
              invoke: {
                src: 'waitForActiveHours',
                input: ({ context }) => ({ accountId: context.accountId }),
                onDone: { target: '#lifecycle.host.opening', actions: 'newDay' },
                onError: { target: '#lifecycle.stuck' }
              }
            }
          }
        }
      }
    },

    /** An account problem, routed by the status it puts the account in (`statusForIssue`, one status per issue). */
    issue: {
      entry: assign(({ context }) => ({ trail: [...context.trail, `issue:${context.issue?.code}`] })),
      always: [
        { guard: { type: 'issueStatus', params: 'needsLogin' }, target: 'onboarding.signingIn' },
        { guard: { type: 'issueStatus', params: 'checkpoint' }, target: 'needsPerson' },
        { guard: { type: 'issueStatus', params: 'limited' }, target: 'cooling' },
        { guard: { type: 'issueStatus', params: 'restricted' }, target: 'restricting' },
        { guard: { type: 'issueStatus', params: 'banned' }, target: 'banning' },
        // A captcha nobody took, a form problem: a person looks, in the same window.
        { target: 'needsPerson' }
      ]
    },
    /** Facebook's own checkpoint or a captcha: the window stays open for a person (rules 10, 23). */
    needsPerson: {
      on: { PERSON_DONE: { target: 'onboarding.checkingAccount', actions: assign({ retried: false, checked: false }) } }
    },
    /** Rate limited: closed for the day, rested, then opened again. */
    cooling: {
      initial: 'close',
      states: {
        close: closing('rateLimited', 'rest'),
        rest: { after: { limitedRest: '#lifecycle.onboarding.opening' }, exit: 'newDay' }
      }
    },
    restricting: closing('restricted', 'restricted'),
    banning: closing('restricted', 'banned'),
    losing: closing('accountLost', 'lost'),
    stopping: closing('shutdown', 'stopped'),
    /** Paused by hand: closed, and nothing runs until RESUME. */
    paused: { on: { RESUME: { target: 'onboarding.opening' } } },
    /** A step failed twice, or today's opens are spent: a person decides. */
    stuck: { on: { PERSON_DONE: { target: 'onboarding.opening', actions: assign({ retried: false, lastError: null }) } } },
    restricted: { type: 'final' },
    banned: { type: 'final' },
    lost: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({ accountId: context.accountId, state: '', context })
})
