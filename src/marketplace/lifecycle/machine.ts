import { assign, fromPromise, setup } from 'xstate'
import { statusForIssue } from '../socialAccount/helpers/index'
import { clock } from './helpers/clock'
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

function step<K extends keyof LifecycleActorInputs>(
  src: K,
  input: (args: Ctx) => LifecycleActorInputs[K],
  next: string,
  onOk: (args: Done) => Partial<LifecycleContext> = () => ({})
) {
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
  } as never
}

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
    signInSpent: ({ context }) => context.signInTries >= 2,
    activityLeft: ({ context }) => nextWarmupActivity(context) !== null,
    warmupOver: ({ context }) => warmupComplete(context, clock.now())
  },
  actions: {
    recordIssue: assign(({ event }) => {
      const o = (event as { output?: StepOutcome }).output
      return o?.kind === 'issue' ? { issue: { code: o.issue, detail: o.detail } } : {}
    }),
    recordError: assign(({ event }) => {
      const o = (event as { output?: StepOutcome }).output
      return o?.kind === 'error' ? { lastError: { code: o.code, detail: o.detail } } : {}
    }),
    logClose: assign(({ context }, reason: CloseReason) => ({
      browser: { ...context.browser, open: false, closes: [...context.browser.closes, { reason, at: new Date(clock.now()).toISOString() }] },
      trail: [...context.trail, `close:${reason}`]
    })),
    countSignIn: assign(({ context }) => ({ signInTries: context.signInTries + 1 })),
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
    warmupLeft: ({ context }) => Math.max(0, (context.warmup.startedAt ?? clock.now()) + context.timing.warmupMs - clock.now()),
    untilNextLook: ({ context }) =>
      Math.min(context.timing.watchIntervalMs, Math.max(0, (context.warmup.startedAt ?? clock.now()) + context.timing.warmupMs - clock.now()))
  }
}).createMachine({
  id: 'lifecycle',
  context: ({ input }) => {
    const s = input.standing
    return {
      accountId: s.accountId,
      liveActions: input.liveActions,
      timing: { ...DEFAULT_LIFECYCLE_TIMING, ...input.timing },
      standing: s,
      browser: { open: false, opensToday: input.resume?.opensToday ?? 0, closes: [] },
      warmup: {
        startedAt: input.resume?.warmupStartedAt ?? (s.warmupStartedAt ? Date.parse(s.warmupStartedAt) : null),
        done: input.resume?.warmupDone ?? []
      },
      issue: null,
      lastError: null,
      retried: false,
      actions: [],
      checks: 0,
      trail: [],
      checked: false,
      pending: null,
      signInTries: 0
    }
  },
  initial: 'routing',
  on: {
    PAUSE: { target: '.paused' },
    SHUTDOWN: { target: '.stopping' },
    LOST: { target: '.losing' }
  },
  states: {
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
        signingIn: Object.assign(
          { entry: 'countSignIn' },
          step('signIn', ({ context }) => ({ accountId: context.accountId }), 'next', ({ context }) => ({
            standing: { ...context.standing, hasSession: true, status: 'active' },
            issue: null,
            signInTries: 0
          }))
        ),
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
        warming: {
          entry: assign(({ context }) => (context.warmup.startedAt ? {} : { warmup: { ...context.warmup, startedAt: clock.now() } })),
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
            waitingOutDay: {
              after: { untilNextLook: 'dayCheck' }
            },
            dayCheck: {
              entry: assign(({ context }) => ({ trail: [...context.trail, 'dayCheck'] })),
              invoke: {
                src: 'watchCheck',
                input: ({ context }) => ({ accountId: context.accountId }),
                onDone: [
                  { guard: { type: 'endOfDay', params: ({ event }) => event.output }, target: '#lifecycle.onboarding.overnight' },
                  { guard: { type: 'ok', params: ({ event }) => event.output }, target: 'pick' },
                  { guard: { type: 'isIssue', params: ({ event }) => event.output }, target: '#lifecycle.issue', actions: 'recordIssue' },
                  { target: '#lifecycle.stuck', actions: 'recordError' }
                ],
                onError: { target: '#lifecycle.stuck' }
              }
            }
          }
        },
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
            standing: { ...context.standing, warmedAt: context.standing.warmedAt ?? new Date(clock.now()).toISOString() },
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
            browser: { ...context.browser, open: false, closes: [...context.browser.closes, { reason: 'crash' as const, at: new Date(clock.now()).toISOString() }] },
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

    issue: {
      entry: assign(({ context }) => ({ trail: [...context.trail, `issue:${context.issue?.code}`] })),
      always: [
        {
          guard: ({ context }) => context.signInTries >= 2 && context.issue != null && statusForIssue(context.issue.code) === 'needsLogin',
          target: 'stuck',
          actions: assign({ lastError: { code: 'signInSpent', detail: 'two sign-ins in a row ended signed out' } })
        },
        { guard: { type: 'issueStatus', params: 'needsLogin' }, target: 'onboarding.signingIn' },
        { guard: { type: 'issueStatus', params: 'checkpoint' }, target: 'needsPerson' },
        { guard: { type: 'issueStatus', params: 'limited' }, target: 'cooling' },
        { guard: { type: 'issueStatus', params: 'restricted' }, target: 'restricting' },
        { guard: { type: 'issueStatus', params: 'banned' }, target: 'banning' },
        { target: 'needsPerson' }
      ]
    },
    needsPerson: {
      on: { PERSON_DONE: { target: 'onboarding.checkingAccount', actions: assign({ retried: false, checked: false }) } }
    },
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
    paused: { on: { RESUME: { target: 'onboarding.opening' } } },
    stuck: { on: { PERSON_DONE: { target: 'onboarding.opening', actions: assign({ retried: false, lastError: null }) } } },
    restricted: { type: 'final' },
    banned: { type: 'final' },
    lost: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({ accountId: context.accountId, state: '', context })
})
