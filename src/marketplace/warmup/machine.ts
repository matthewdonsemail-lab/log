/**
 * The warm-up machine (rule 35): runs the recorded activity flows one after
 * another in the one open browser, spaced by `gapMs`.
 *
 *   picking ─▶ running (runActivity) ─ok─▶ resting ─after gap─▶ picking ─ none left ─▶ done
 *                 ├── the page went to a checkpoint or a login ─▶ blocked (the account's issue)
 *                 └── a step failed ─▶ stopped (the activity and step are in the feed)
 *   STOP (anywhere) ─▶ stopped
 *
 * `runActivity` is the one side effect, provided by the caller: `log warmup run`
 * runs the activity's flow in its inspect session; tests script it. The same
 * activities are the lifecycle machine's `warmupActivity` (onboarding.warming).
 */
import { assign, fromPromise, setup } from 'xstate'
import type { ActivityOutcome, WarmupActivity, WarmupContext, WarmupInput } from './types'

export const warmupMachine = setup({
  types: {
    context: {} as WarmupContext,
    input: {} as WarmupInput,
    events: {} as { type: 'STOP' },
    output: {} as { done: WarmupActivity[]; failure: WarmupContext['failure']; stopped: boolean; blocked: boolean }
  },
  actors: {
    runActivity: fromPromise<ActivityOutcome, { accountId: string; activity: WarmupActivity }>(async () => {
      throw new Error('warmupMachine: provide a `runActivity` actor')
    })
  },
  guards: {
    activityLeft: ({ context }) => context.activities.some((a) => !context.done.includes(a)),
    ok: (_, outcome: ActivityOutcome) => outcome.ok,
    // The account itself, not the step: the warm-up can't go on in this browser (the lifecycle's issue route).
    accountIssue: (_, outcome: ActivityOutcome) => !outcome.ok && (outcome.issue === 'checkpointed' || outcome.issue === 'loginWall' || outcome.issue === 'restrictedPolicy')
  },
  delays: {
    gap: ({ context }) => context.gapMs
  }
}).createMachine({
  id: 'warmup',
  context: ({ input }) => ({ ...input, done: [], current: null, failure: null }),
  initial: 'picking',
  on: { STOP: '.stopped' },
  states: {
    picking: {
      always: [
        {
          guard: 'activityLeft',
          target: 'running',
          actions: assign(({ context }) => ({ current: context.activities.find((a) => !context.done.includes(a)) ?? null }))
        },
        { target: 'done' }
      ]
    },
    running: {
      invoke: {
        src: 'runActivity',
        input: ({ context }) => ({ accountId: context.accountId, activity: context.current as WarmupActivity }),
        onDone: [
          {
            guard: { type: 'ok', params: ({ event }) => event.output },
            target: 'resting',
            actions: assign(({ context }) => ({ done: [...context.done, context.current as WarmupActivity], current: null }))
          },
          {
            guard: { type: 'accountIssue', params: ({ event }) => event.output },
            target: 'blocked',
            actions: assign(({ context, event }) => {
              const o = event.output as Extract<ActivityOutcome, { ok: false }>
              return { failure: { activity: context.current as WarmupActivity, failedAt: o.failedAt, error: o.error, issue: o.issue } }
            })
          },
          {
            target: 'stopped',
            actions: assign(({ context, event }) => {
              const o = event.output as Extract<ActivityOutcome, { ok: false }>
              return { failure: { activity: context.current as WarmupActivity, failedAt: o.failedAt, error: o.error, issue: o.issue } }
            })
          }
        ],
        onError: {
          target: 'stopped',
          actions: assign(({ context, event }) => ({ failure: { activity: context.current as WarmupActivity, failedAt: null, error: String(event.error) } }))
        }
      }
    },
    resting: {
      always: { guard: ({ context }) => !context.activities.some((a) => !context.done.includes(a)), target: 'done' },
      after: { gap: 'picking' }
    },
    done: { type: 'final' },
    /** A checkpoint, a sign-out or a restriction: the account goes to the lifecycle's issue route, not the next activity. */
    blocked: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({
    done: context.done,
    failure: context.failure,
    stopped: context.failure !== null || context.done.length < context.activities.length,
    blocked: ['checkpointed', 'loginWall', 'restrictedPolicy'].includes(context.failure?.issue ?? '')
  })
})
