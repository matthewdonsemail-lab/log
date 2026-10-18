/**
 * Publishing one listing as an XState machine, so `log publish` can print
 * every step (`observability/trace`).
 *
 *   preparingPhotos ─▶ openingForm ─ready─▶ choosingCategory ─▶ uploadingPhotos
 *                        │  ▲                ─▶ fillingFields ─▶ reviewing ─dryRun─▶ done
 *                 captcha│  │re-check                              │
 *                        ▼  │                                      ▼
 *                 routingCaptcha ─▶ solvingCaptcha     publishing ─▶ confirming
 *                                                                       │
 *                                                       capturingId ─▶ done
 *
 *   any failure ─▶ stopping ─▶ blocked | needsPerson | unconfirmedId | failed
 *
 * Every failure carries an error-catalog code (`src/errors/catalog/types.ts`)
 * and goes through `stopping`, which reads the code's `publish` end from the
 * catalog (`helpers/publishEnd.ts`). No state decides its own ending, so the
 * catalog is the one place that says what each code does.
 *
 * Rules (docs/listingPublish/stateMachine.md §4):
 * - every write is read back by the actor; a step that can't confirm fails
 * - photos are gated on FB's own `N/10` counter, never a sleep
 * - once Publish is clicked nothing is retried (Listaro's retry made duplicates)
 * - captchas are routed by kind: CaptchaKraken → 2Captcha → a person
 */
import { assign, fromPromise, setup } from 'xstate'
import { DEFAULT_CAPTCHA_POLICY, planNextSolver } from '../../captcha/router/index'
import type { CaptchaPlan } from '../../captcha/router/index'
import type { AccountIssue } from '../account/types'
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

/** Placeholder actor: the caller must provide the real one with `machine.provide`. */
function missing<TOutput, TInput>(name: string) {
  return fromPromise<TOutput, TInput>(async () => {
    throw new Error('publishMachine: provide a `' + name + '` actor')
  })
}

const isFailure = (output: { ok?: boolean }): output is StepFailure => output.ok === false

/** A step's `{ ok: false }` output as the failure for `state`. */
const stepFailure = (state: string, output: unknown): PublishFailure => {
  const out = output as StepFailure
  return { state, code: out.code, detail: out.detail }
}

/** A thrown actor. Runtime, so after Publish `stopping` turns it into `crashedAfterPublish`. */
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
    captureId: missing<CaptureOutput, PublishActorInputs['captureId']>('captureId')
  },
  guards: {
    hasSolver: ({ context }) => context.plan?.solver != null,
    isDryRun: ({ context }) => context.dryRun,
    stepFailed: (_, output: { ok?: boolean }) => isFailure(output),
    formReady: (_, outcome: FormOutcome) => outcome.kind === 'ready',
    formCaptcha: (_, outcome: FormOutcome) => outcome.kind === 'captcha',
    formIssue: (_, outcome: FormOutcome) => outcome.kind === 'issue',
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
    issue: null,
    failure: null,
    result: null
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
        input: ({ context }) => ({ accountId: context.accountId, recheck: context.formOpened }),
        onDone: [
          {
            guard: { type: 'formReady', params: ({ event }) => event.output },
            target: 'choosingCategory',
            actions: assign(({ context }) => ({
              formOpened: true,
              captcha: null,
              // The page moved past the captcha: the last solve was accepted.
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
        // Solved or not, look at the page again: the page is the judge.
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
          // FB's "Oops / Something went wrong" dialog: rejected, nothing listed.
          {
            guard: { type: 'rejected', params: ({ event }) => event.output },
            target: 'stopping',
            actions: { type: 'recordFailure', params: ({ event }) => stepFailure('confirming', event.output) }
          },
          // No toast seen (`noConfirmation`): it may still have gone out, so look for it rather than retry.
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
    /** Reads the failure's end from the error catalog. Never waits, never retries. */
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
    issue: context.issue,
    failure: context.failure,
    captchaAttempts: context.captchaAttempts,
    plan: context.plan,
    filled: context.filled,
    photoCount: context.photoCount,
    photoHashes: context.photoHashes,
    receipt: context.receipt
  })
})

/** Settle the newest captcha attempt's `accepted`, if it is still open. */
function markLast(context: PublishContext, accepted: boolean) {
  const attempts = context.captchaAttempts
  const last = attempts.at(-1)
  if (!last || last.accepted !== null) return attempts
  return [...attempts.slice(0, -1), { ...last, accepted }]
}
