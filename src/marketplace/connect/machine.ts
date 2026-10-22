import { assign, fromPromise, setup } from 'xstate'
import { DEFAULT_CAPTCHA_POLICY, planNextSolver } from '../../captcha/router/index'
import type { CaptchaPlan } from '../../captcha/router/index'
import { ERROR_CATALOG } from '../../errors/catalog/index'
import type { CodedFailure } from '../../errors/catalog/index'
import { DEFAULT_CONNECT_LIMITS } from './types'
import type {
  ActOutput,
  ConnectActorInputs,
  ConnectContext,
  ConnectFailure,
  ConnectInput,
  ConnectOutput,
  ConnectPage,
  ConnectResultKind,
  ReadOutput,
  SaveOutput,
  SolveOutput
} from './types'

function missing<TOutput, TInput>(name: string) {
  return fromPromise<TOutput, TInput>(async () => {
    throw new Error('connectMachine: provide a `' + name + '` actor')
  })
}

const isFailure = (output: { ok?: boolean }): output is CodedFailure => output.ok === false

const sessionGone = (output: { ok?: boolean; code?: string }) =>
  isFailure(output) && ERROR_CATALOG[output.code].layer === 'runtime' && output.code !== 'crashed'

const crash = (state: string, error: unknown): ConnectFailure => ({ state, code: 'crashed', detail: String(error) })

const codeWindow = (context: ConnectContext) => Math.floor(Date.now() / context.timing.codeWindowMs)

const pageIs = (context: ConnectContext, ...kinds: ConnectPage['kind'][]) => context.page != null && kinds.includes(context.page.kind)

const RESULT_FOR_CODE: Partial<Record<ConnectFailure['code'], ConnectResultKind>> = {
  checkpointed: 'checkpointed',
  accountDisabled: 'disabled',
  wrongPassword: 'wrongPassword',
  signInNotFinished: 'timedOut',
  videoSelfieRequired: 'videoSelfie'
}

const actDone = (state: string) => [
  {
    guard: { type: 'sessionGone' as const, params: ({ event }: { event: { output: ActOutput } }) => event.output },
    target: '#connect.stopping',
    actions: { type: 'recordFailure' as const, params: ({ event }: { event: { output: ActOutput } }) => ({ state, ...(event.output as CodedFailure) }) }
  },
  { target: 'reading' }
]
const actError = (state: string) => ({
  target: '#connect.stopping',
  actions: { type: 'recordFailure' as const, params: ({ event }: { event: { error: unknown } }) => crash(state, event.error) }
})

export const connectMachine = setup({
  types: {
    context: {} as ConnectContext,
    input: {} as ConnectInput,
    output: {} as ConnectOutput
  },
  actors: {
    open: missing<ActOutput, ConnectActorInputs['open']>('open'),
    read: missing<ReadOutput, ConnectActorInputs['read']>('read'),
    submitCredentials: missing<ActOutput, ConnectActorInputs['submitCredentials']>('submitCredentials'),
    chooseAuthApp: missing<ActOutput, ConnectActorInputs['chooseAuthApp']>('chooseAuthApp'),
    submitCode: missing<ActOutput, ConnectActorInputs['submitCode']>('submitCode'),
    dismiss: missing<ActOutput, ConnectActorInputs['dismiss']>('dismiss'),
    save: missing<SaveOutput, ConnectActorInputs['save']>('save'),
    solveCaptcha: missing<SolveOutput, ConnectActorInputs['solveCaptcha']>('solveCaptcha')
  },
  delays: {
    poll: ({ context }) => context.timing.pollMs,
    deadline: ({ context }) => Math.max(0, context.startedAt + context.timing.deadlineMs - Date.now()),
    nextCodeWindow: ({ context }) => context.timing.codeWindowMs - (Date.now() % context.timing.codeWindowMs)
  },
  guards: {
    stepFailed: (_, output: { ok?: boolean }) => isFailure(output),
    sessionGone: (_, output: { ok?: boolean; code?: string }) => sessionGone(output),
    loggedIn: ({ context }) => pageIs(context, 'loggedIn'),
    disabled: ({ context }) => pageIs(context, 'disabled'),
    wrongPassword: ({ context }) => pageIs(context, 'wrongPassword'),
    videoSelfie: ({ context }) => pageIs(context, 'videoSelfie'),
    canSubmitCredentials: ({ context }) =>
      pageIs(context, 'loginForm') && context.hasPassword && context.loginTries < context.limits.loginTries,
    canChooseMethod: ({ context }) =>
      pageIs(context, 'twoStepMethod') && context.hasTotp && context.methodTries < context.limits.methodTries,
    canSubmitCode: ({ context }) =>
      pageIs(context, 'twoStepCode') && context.hasTotp && context.codeTries < context.limits.codeTries && context.lastCodeWindow !== codeWindow(context),
    codeWindowUsed: ({ context }) =>
      pageIs(context, 'twoStepCode') && context.hasTotp && context.codeTries < context.limits.codeTries,
    findAccountAgain: ({ context }) => pageIs(context, 'findAccount') && context.findAccountTried,
    canDismiss: ({ context }) =>
      pageIs(context, 'trustDevice', 'saveLogin', 'continueAs', 'cookieBanner', 'automatedBehaviour', 'findAccount') &&
      context.dismissTries < context.limits.dismissTries,
    captcha: ({ context }) => pageIs(context, 'captcha') && context.page?.captcha != null,
    hasSolver: ({ context }) => context.plan?.solver != null,
    needsPerson: ({ context }) => !pageIs(context, 'unknown'),
    lastWasCheckpoint: ({ context }) => pageIs(context, 'checkpoint'),
    savedLoggedIn: (_, output: SaveOutput) => output.ok === true && output.loggedIn
  },
  actions: {
    recordFailure: assign((_, failure: ConnectFailure) => ({ failure })),
    recordPage: assign(({ context }, page: ConnectPage) => ({
      page,
      captchaAttempts: markLast(context, page.kind !== 'captcha'),
      pages: context.pages.at(-1) === page.kind ? context.pages : [...context.pages, page.kind],
      checkpoint: page.kind === 'checkpoint' ? (page.heading ?? 'checkpoint') : context.checkpoint
    }))
  }
}).createMachine({
  id: 'connect',
  context: ({ input }) => ({
    accountId: input.accountId,
    hasPassword: input.hasPassword,
    hasTotp: input.hasTotp,
    timing: input.timing,
    limits: input.limits ?? DEFAULT_CONNECT_LIMITS,
    startedAt: Date.now(),
    page: null,
    pages: [],
    loginTries: 0,
    codeTries: 0,
    methodTries: 0,
    dismissTries: 0,
    findAccountTried: false,
    availability: input.availability,
    policy: input.policy ?? DEFAULT_CAPTCHA_POLICY,
    arkoseToday: input.arkoseToday ?? 0,
    plan: null,
    captchaAttempts: [],
    bodySample: null,
    lastCodeWindow: null,
    checkpoint: null,
    failure: null,
    result: null,
    loggedIn: false
  }),
  initial: 'opening',
  states: {
    opening: {
      invoke: {
        src: 'open',
        onDone: [
          {
            guard: { type: 'stepFailed', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => ({ state: 'opening', ...(event.output as CodedFailure) }) }
          },
          { target: 'signingIn' }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('opening', event.error) } }
      }
    },
    signingIn: {
      after: {
        deadline: [
          {
            guard: 'lastWasCheckpoint',
            target: 'stopping',
            actions: {
              type: 'recordFailure',
              params: ({ context }) => ({ state: 'signingIn', code: 'checkpointed', detail: context.checkpoint ?? undefined })
            }
          },
          {
            target: 'stopping',
            actions: {
              type: 'recordFailure',
              params: ({ context }) => ({ state: 'signingIn', code: 'signInNotFinished', detail: `last page: ${context.page?.kind ?? 'none'} ${context.page?.path ?? ''}`.trim() })
            }
          }
        ]
      },
      initial: 'reading',
      states: {
        reading: {
          invoke: {
            src: 'read',
            onDone: [
              {
                guard: { type: 'stepFailed', params: ({ event }) => event.output },
                target: '#connect.stopping',
                actions: { type: 'recordFailure', params: ({ event }) => ({ state: 'reading', ...(event.output as CodedFailure) }) }
              },
              { target: 'routing', actions: { type: 'recordPage', params: ({ event }) => event.output as ConnectPage } }
            ],
            onError: actError('reading')
          }
        },
        routing: {
          always: [
            { guard: 'loggedIn', target: '#connect.saving' },
            {
              guard: 'disabled',
              target: '#connect.stopping',
              actions: { type: 'recordFailure', params: ({ context }) => ({ state: 'routing', code: 'accountDisabled', detail: context.page?.heading }) }
            },
            {
              guard: 'videoSelfie',
              target: '#connect.stopping',
              actions: { type: 'recordFailure', params: ({ context }) => ({ state: 'routing', code: 'videoSelfieRequired', detail: context.page?.heading || context.page?.path }) }
            },
            {
              guard: 'wrongPassword',
              target: '#connect.stopping',
              actions: { type: 'recordFailure', params: ({ context }) => ({ state: 'routing', code: 'wrongPassword', detail: context.page?.heading }) }
            },
            {
              guard: 'findAccountAgain',
              target: '#connect.stopping',
              actions: { type: 'recordFailure', params: ({ context }) => ({ state: 'routing', code: 'wrongPassword', detail: context.page?.heading || 'Find your account' }) }
            },
            { guard: 'captcha', target: 'routingCaptcha' },
            { guard: 'canSubmitCredentials', target: 'submittingCredentials' },
            { guard: 'canChooseMethod', target: 'choosingMethod' },
            { guard: 'canSubmitCode', target: 'submittingCode' },
            { guard: 'codeWindowUsed', target: 'waitingForCode' },
            { guard: 'canDismiss', target: 'dismissing' },
            { guard: 'needsPerson', target: 'awaitingPerson' },
            { target: 'waiting' }
          ]
        },
        submittingCredentials: {
          entry: assign(({ context }) => ({ loginTries: context.loginTries + 1 })),
          invoke: {
            src: 'submitCredentials',
            input: ({ context }) => ({ attempt: context.loginTries }),
            onDone: actDone('submittingCredentials'),
            onError: actError('submittingCredentials')
          }
        },
        choosingMethod: {
          entry: assign(({ context }) => ({ methodTries: context.methodTries + 1 })),
          invoke: { src: 'chooseAuthApp', onDone: actDone('choosingMethod'), onError: actError('choosingMethod') }
        },
        submittingCode: {
          entry: assign(({ context }) => ({ codeTries: context.codeTries + 1, lastCodeWindow: codeWindow(context) })),
          invoke: {
            src: 'submitCode',
            input: ({ context }) => ({ attempt: context.codeTries }),
            onDone: actDone('submittingCode'),
            onError: actError('submittingCode')
          }
        },
        waitingForCode: { after: { nextCodeWindow: 'reading' } },
        routingCaptcha: {
          entry: assign(({ context }) => ({
            plan: planNextSolver(context.page!.captcha!, context.captchaAttempts, context.availability, context.policy, context.arkoseToday) as CaptchaPlan
          })),
          always: [{ guard: 'hasSolver', target: 'solvingCaptcha' }, { target: 'awaitingPerson' }]
        },
        solvingCaptcha: {
          invoke: {
            src: 'solveCaptcha',
            input: ({ context }) => ({ solver: context.plan!.solver!, detection: context.page!.captcha! }),
            onDone: {
              target: 'reading',
              actions: assign(({ context, event }) => ({
                captchaAttempts: [
                  ...context.captchaAttempts,
                  {
                    at: new Date().toISOString(),
                    accountId: context.accountId,
                    kind: context.page!.captcha!.kind,
                    solver: context.plan!.solver!,
                    solved: event.output.solved,
                    accepted: null,
                    code: event.output.code,
                    detail: event.output.detail
                  }
                ],
                arkoseToday:
                  context.page!.captcha!.kind === 'arkose' && context.plan!.solver === 'twoCaptcha' ? context.arkoseToday + 1 : context.arkoseToday
              }))
            },
            onError: actError('solvingCaptcha')
          }
        },
        dismissing: {
          entry: assign(({ context }) => ({
            dismissTries: context.dismissTries + 1,
            findAccountTried: context.findAccountTried || pageIs(context, 'findAccount')
          })),
          invoke: {
            src: 'dismiss',
            input: ({ context }) => ({ kind: context.page!.kind }),
            onDone: actDone('dismissing'),
            onError: actError('dismissing')
          }
        },
        awaitingPerson: { after: { poll: 'reading' } },
        waiting: { after: { poll: 'reading' } }
      }
    },
    saving: {
      invoke: {
        src: 'save',
        onDone: [
          {
            guard: { type: 'savedLoggedIn', params: ({ event }) => event.output },
            target: 'done',
            actions: assign(({ event }) => ({ result: 'connected' as const, loggedIn: true, bodySample: (event.output as { bodySample?: string }).bodySample ?? null }))
          },
          {
            guard: { type: 'stepFailed', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => ({ state: 'saving', ...(event.output as CodedFailure) }) }
          },
          { target: '#connect.signingIn.waiting' }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('saving', event.error) } }
      }
    },
    stopping: {
      always: {
        target: 'done',
        actions: assign(({ context }) => ({ result: RESULT_FOR_CODE[context.failure!.code] ?? 'failed' }))
      }
    },
    done: { type: 'final' }
  },
  output: ({ context }) => ({
    accountId: context.accountId,
    result: context.result ?? 'failed',
    loggedIn: context.loggedIn,
    page: context.page,
    pages: context.pages,
    checkpoint: context.checkpoint,
    failure: context.failure,
    loginTries: context.loginTries,
    codeTries: context.codeTries,
    captchaAttempts: context.captchaAttempts,
    bodySample: context.bodySample
  })
})

function markLast(context: ConnectContext, accepted: boolean) {
  const last = context.captchaAttempts.at(-1)
  if (!last || last.accepted !== null) return context.captchaAttempts
  return [...context.captchaAttempts.slice(0, -1), { ...last, accepted }]
}
