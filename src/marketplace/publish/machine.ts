import { assign, fromPromise, setup } from 'xstate'
import { DEFAULT_CAPTCHA_POLICY, planNextSolver } from '../../captcha/router/index'
import type { CaptchaPlan } from '../../captcha/router/index'
import type { AccountIssue } from '../account/types'
import { connectMachine } from '../connect/machine'
import type { ConnectOutput } from '../connect/types'
import { publishEnd, toConditionLabel } from './helpers/index'
import type {
  CaptureOutput,
  ConfirmOutput,
  FillOutput,
  FormOutcome,
  PreparePhotosOutput,
  PublishActorInputs,
  PublishClickOutput,
  PublishContext,
  PublishFailure,
  PublishInput,
  PublishOutput,
  ReviewOutput,
  SolveOutput,
  StepFailure,
  StepOutput,
  UploadOutput
} from './types'

function missing<TOutput, TInput>(name: string) {
  return fromPromise<TOutput, TInput>(async () => {
    throw new Error('publishMachine: provide a `' + name + '` actor')
  })
}

const isFailure = (output: { ok?: boolean }): output is StepFailure => output.ok === false

const SIGN_IN_ISSUES: readonly string[] = ['sessionExpired', 'loginWall', 'checkpointed']

const stepFailure = (state: string, output: unknown): PublishFailure => {
  const out = output as StepFailure
  return { state, code: out.code, detail: out.detail }
}

const crash = (state: string, error: unknown): PublishFailure => ({ state, code: 'crashed', detail: String(error) })

export const publishMachine = setup({
  types: {
    context: {} as PublishContext,
    input: {} as PublishInput,
    output: {} as PublishOutput
  },
  actors: {
    preparePhotos: missing<PreparePhotosOutput, PublishActorInputs['preparePhotos']>('preparePhotos'),
    openForm: missing<FormOutcome, PublishActorInputs['openForm']>('openForm'),
    solveCaptcha: missing<SolveOutput, PublishActorInputs['solveCaptcha']>('solveCaptcha'),
    setCategory: missing<StepOutput, PublishActorInputs['setCategory']>('setCategory'),
    uploadPhotos: missing<UploadOutput, PublishActorInputs['uploadPhotos']>('uploadPhotos'),
    fillFields: missing<FillOutput, PublishActorInputs['fillFields']>('fillFields'),
    review: missing<ReviewOutput, PublishActorInputs['review']>('review'),
    publish: missing<PublishClickOutput, PublishActorInputs['publish']>('publish'),
    confirm: missing<ConfirmOutput, PublishActorInputs['confirm']>('confirm'),
    captureId: missing<CaptureOutput, PublishActorInputs['captureId']>('captureId'),
    signIn: connectMachine
  },
  guards: {
    hasSolver: ({ context }) => context.plan?.solver != null,
    isDryRun: ({ context }) => context.dryRun,
    stepFailed: (_, output: { ok?: boolean }) => isFailure(output),
    formReady: (_, outcome: FormOutcome) => outcome.kind === 'ready',
    formCaptcha: (_, outcome: FormOutcome) => outcome.kind === 'captcha',
    formIssue: (_, outcome: FormOutcome) => outcome.kind === 'issue',
    canSignIn: ({ context }, outcome: FormOutcome) =>
      outcome.kind === 'issue' && SIGN_IN_ISSUES.includes(outcome.issue) && context.signInConfig != null && !context.signInTried,
    signedIn: (_, output: ConnectOutput) => output.result === 'connected',
    rejected: (_, output: { ok?: boolean; code?: string }) => isFailure(output) && output.code === 'rejected',
    hasListingId: (_, output: CaptureOutput) => Boolean(output.listingId),
    endsBlocked: ({ context }) => publishEnd(context.failure!, context.publishClicked).end === 'blocked',
    endsNeedsPerson: ({ context }) => publishEnd(context.failure!, context.publishClicked).end === 'needsPerson',
    endsUnconfirmed: ({ context }) => publishEnd(context.failure!, context.publishClicked).end === 'unconfirmedId'
  },
  actions: {
    recordFailure: assign((_, failure: PublishFailure) => ({ failure }))
  }
}).createMachine({
  id: 'publish',
  context: ({ input }) => ({
    accountId: input.accountId,
    listing: { ...input.listing, condition: toConditionLabel(input.listing.condition) },
    dryRun: input.dryRun,
    availability: input.availability,
    policy: input.policy ?? DEFAULT_CAPTCHA_POLICY,
    arkoseToday: input.arkoseToday ?? 0,
    photoPaths: [],
    photoHashes: [],
    photoCount: 0,
    formOpened: false,
    captcha: null,
    plan: null,
    captchaAttempts: [],
    filled: {},
    receipt: null,
    publishClicked: false,
    listingId: null,
    listingUrl: null,
    review: null,
    issue: null,
    failure: null,
    result: null,
    signInConfig: input.signIn ?? null,
    signInTried: false,
    signIn: null
  }),
  initial: 'preparingPhotos',
  states: {
    preparingPhotos: {
      invoke: {
        src: 'preparePhotos',
        input: ({ context }) => ({ sources: context.listing.photos }),
        onDone: [
          {
            guard: { type: 'stepFailed', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => stepFailure('preparingPhotos', event.output) }
          },
          {
            target: 'openingForm',
            actions: assign(({ event }) => {
              const out = event.output as Extract<PreparePhotosOutput, { ok: true }>
              return { photoPaths: out.paths, photoHashes: out.hashes }
            })
          }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('preparingPhotos', event.error) } }
      }
    },
    openingForm: {
      invoke: {
        src: 'openForm',
        input: ({ context }) => ({
          accountId: context.accountId,
          recheck: context.formOpened,
          location: context.listing.location,
          postalCode: context.listing.postalCode,
          setLocation: !context.dryRun
        }),
        onDone: [
          {
            guard: { type: 'formReady', params: ({ event }) => event.output },
            target: 'choosingCategory',
            actions: assign(({ context }) => ({
              formOpened: true,
              captcha: null,
              captchaAttempts: markLast(context, true)
            }))
          },
          {
            guard: { type: 'formCaptcha', params: ({ event }) => event.output },
            target: 'routingCaptcha',
            actions: assign(({ context, event }) => ({
              formOpened: true,
              captcha: (event.output as Extract<FormOutcome, { kind: 'captcha' }>).detection,
              captchaAttempts: markLast(context, false)
            }))
          },
          {
            guard: { type: 'canSignIn', params: ({ event }) => event.output },
            target: 'signingIn'
          },
          {
            guard: { type: 'formIssue', params: ({ event }) => event.output },
            target: 'stopping',
            actions: {
              type: 'recordFailure',
              params: ({ event }) => {
                const out = event.output as Extract<FormOutcome, { kind: 'issue' }>
                return { state: 'openingForm', code: out.issue, detail: out.detail }
              }
            }
          },
          {
            target: 'stopping',
            actions: {
              type: 'recordFailure',
              params: ({ event }) => {
                const out = event.output as Extract<FormOutcome, { kind: 'error' }>
                return { state: 'openingForm', code: out.code, detail: out.detail }
              }
            }
          }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('openingForm', event.error) } }
      }
    },
    signingIn: {
      entry: assign({ signInTried: true }),
      invoke: {
        src: 'signIn',
        input: ({ context }) => ({
          accountId: context.accountId,
          hasPassword: context.signInConfig!.hasPassword,
          hasTotp: context.signInConfig!.hasTotp,
          timing: context.signInConfig!.timing,
          availability: context.availability,
          policy: context.policy,
          arkoseToday: context.arkoseToday
        }),
        onDone: [
          {
            guard: { type: 'signedIn', params: ({ event }) => event.output },
            target: 'openingForm',
            actions: assign(({ event }) => ({ signIn: event.output, formOpened: false }))
          },
          {
            target: 'stopping',
            actions: [
              assign(({ event }) => ({ signIn: event.output })),
              {
                type: 'recordFailure',
                params: ({ event }) => ({
                  state: 'signingIn',
                  code: event.output.failure?.code ?? 'signInNotFinished',
                  detail: event.output.failure?.detail ?? event.output.checkpoint ?? undefined
                })
              }
            ]
          }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('signingIn', event.error) } }
      }
    },
    routingCaptcha: {
      entry: assign(({ context }) => ({
        plan: planNextSolver(context.captcha!, context.captchaAttempts, context.availability, context.policy, context.arkoseToday) as CaptchaPlan
      })),
      always: [
        { guard: 'hasSolver', target: 'solvingCaptcha' },
        {
          target: 'stopping',
          actions: {
            type: 'recordFailure',
            params: ({ context }) => {
              const plan = context.plan as Extract<CaptchaPlan, { solver: null }>
              return { state: 'routingCaptcha', code: plan.reason, detail: plan.detail }
            }
          }
        }
      ]
    },
    solvingCaptcha: {
      invoke: {
        src: 'solveCaptcha',
        input: ({ context }) => ({
          accountId: context.accountId,
          solver: context.plan!.solver!,
          detection: context.captcha!
        }),
        onDone: {
          target: 'openingForm',
          actions: assign(({ context, event }) => ({
            captchaAttempts: [
              ...context.captchaAttempts,
              {
                at: new Date().toISOString(),
                accountId: context.accountId,
                kind: context.captcha!.kind,
                solver: context.plan!.solver!,
                solved: event.output.solved,
                accepted: null,
                code: event.output.code,
                detail: event.output.detail
              }
            ],
            arkoseToday:
              context.captcha!.kind === 'arkose' && context.plan!.solver === 'twoCaptcha' ? context.arkoseToday + 1 : context.arkoseToday
          }))
        },
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('solvingCaptcha', event.error) } }
      }
    },
    choosingCategory: {
      invoke: {
        src: 'setCategory',
        input: ({ context }) => ({ category: context.listing.category }),
        onDone: [
          {
            guard: { type: 'stepFailed', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => stepFailure('choosingCategory', event.output) }
          },
          {
            target: 'uploadingPhotos',
            actions: assign(({ context, event }) => ({
              filled: { ...context.filled, category: (event.output as { value?: string }).value ?? context.listing.category }
            }))
          }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('choosingCategory', event.error) } }
      }
    },
    uploadingPhotos: {
      invoke: {
        src: 'uploadPhotos',
        input: ({ context }) => ({ paths: context.photoPaths }),
        onDone: [
          {
            guard: { type: 'stepFailed', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => stepFailure('uploadingPhotos', event.output) }
          },
          { target: 'fillingFields', actions: assign({ photoCount: ({ event }) => (event.output as { count: number }).count }) }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('uploadingPhotos', event.error) } }
      }
    },
    fillingFields: {
      invoke: {
        src: 'fillFields',
        input: ({ context }) => ({ listing: context.listing }),
        onDone: [
          {
            guard: { type: 'stepFailed', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => stepFailure('fillingFields', event.output) }
          },
          {
            target: 'reviewing',
            actions: assign(({ context, event }) => ({
              filled: { ...context.filled, ...(event.output as { filled: Record<string, string> }).filled }
            }))
          }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('fillingFields', event.error) } }
      }
    },
    reviewing: {
      invoke: {
        src: 'review',
        input: ({ context }) => ({ listing: context.listing, photoCount: context.photoCount }),
        onDone: [
          {
            guard: { type: 'stepFailed', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => stepFailure('reviewing', event.output) }
          },
          {
            guard: 'isDryRun',
            target: 'done',
            actions: assign(({ event }) => ({ receipt: (event.output as { receipt: string | null }).receipt, result: 'dryRun' as const }))
          },
          { target: 'publishing', actions: assign({ receipt: ({ event }) => (event.output as { receipt: string | null }).receipt }) }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('reviewing', event.error) } }
      }
    },
    publishing: {
      entry: assign({ publishClicked: true }),
      invoke: {
        src: 'publish',
        input: () => ({}),
        onDone: [
          {
            guard: { type: 'stepFailed', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => stepFailure('publishing', event.output) }
          },
          { target: 'confirming' }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('publishing', event.error) } }
      }
    },
    confirming: {
      invoke: {
        src: 'confirm',
        input: () => ({}),
        onDone: [
          {
            guard: { type: 'rejected', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => stepFailure('confirming', event.output) }
          },
          { target: 'capturingId' }
        ],
        onError: { target: 'capturingId' }
      }
    },
    capturingId: {
      invoke: {
        src: 'captureId',
        input: ({ context }) => ({ title: context.listing.title }),
        onDone: [
          {
            guard: { type: 'hasListingId', params: ({ event }) => event.output },
            target: 'done',
            actions: assign(({ event }) => ({
              listingId: event.output.listingId,
              listingUrl: event.output.listingUrl,
              review: event.output.review ?? null,
              result: 'published' as const
            }))
          },
          {
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => ({ state: 'capturingId', code: 'noListingId', detail: event.output.detail }) }
          }
        ],
        onError: { target: 'stopping', actions: { type: 'recordFailure', params: ({ event }) => crash('capturingId', event.error) } }
      }
    },
    stopping: {
      entry: assign(({ context }) => ({ failure: publishEnd(context.failure!, context.publishClicked).failure })),
      always: [
        { guard: 'endsBlocked', target: 'blocked', actions: assign({ issue: ({ context }) => context.failure!.code as AccountIssue }) },
        { guard: 'endsNeedsPerson', target: 'needsPerson' },
        { guard: 'endsUnconfirmed', target: 'unconfirmedId' },
        { target: 'failed' }
      ]
    },
    done: { type: 'final' },
    unconfirmedId: { type: 'final', entry: assign({ result: 'unconfirmedId' as const }) },
    needsPerson: { type: 'final', entry: assign({ result: 'needsPerson' as const }) },
    blocked: { type: 'final', entry: assign({ result: 'blocked' as const }) },
    failed: { type: 'final', entry: assign({ result: 'failed' as const }) }
  },
  output: ({ context }) => ({
    accountId: context.accountId,
    result: context.result ?? 'failed',
    listingId: context.listingId,
    listingUrl: context.listingUrl,
    review: context.review,
    issue: context.issue,
    failure: context.failure,
    captchaAttempts: context.captchaAttempts,
    plan: context.plan,
    filled: context.filled,
    photoCount: context.photoCount,
    photoHashes: context.photoHashes,
    receipt: context.receipt,
    signIn: context.signIn
  })
})

function markLast(context: PublishContext, accepted: boolean) {
  const attempts = context.captchaAttempts
  const last = attempts.at(-1)
  if (!last || last.accepted !== null) return attempts
  return [...attempts.slice(0, -1), { ...last, accepted }]
}
