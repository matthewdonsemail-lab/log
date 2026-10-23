import { assign, fromPromise, setup } from 'xstate'
import type { ActivityOutcome, WarmupActivity, WarmupContext, WarmupInput } from './types'

export const NOTED_ISSUES: readonly string[] = ['marketplaceMayNotPost']

export const warmupMachine = setup({
  types: {
    context: {} as WarmupContext,
    input: {} as WarmupInput,
    events: {} as { type: 'STOP' },
    output: {} as { done: WarmupActivity[]; failure: WarmupContext['failure']; noted: WarmupContext['noted']; stopped: boolean; blocked: boolean }
  },
  actors: {
    runActivity: fromPromise<ActivityOutcome, { accountId: string; activity: WarmupActivity }>(async () => {
      throw new Error('warmupMachine: provide a `runActivity` actor')
    })
  },
  guards: {
    activityLeft: ({ context }) => context.activities.some((a) => !context.done.includes(a)),
    ok: (_, outcome: ActivityOutcome) => outcome.ok,
    noted: (_, outcome: ActivityOutcome) => !outcome.ok && NOTED_ISSUES.includes(outcome.issue ?? ''),
    accountIssue: (_, outcome: ActivityOutcome) => !outcome.ok && (outcome.issue === 'checkpointed' || outcome.issue === 'loginWall' || outcome.issue === 'restrictedPolicy')
  },
  delays: {
    gap: ({ context }) => context.gapMs
  }
}).createMachine({
  id: 'warmup',
  context: ({ input }) => ({ ...input, done: [], current: null, failure: null, noted: [] }),
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
            guard: { type: 'noted', params: ({ event }) => event.output },
            target: 'resting',
            actions: assign(({ context, event }) => {
              const o = event.output as Extract<ActivityOutcome, { ok: false }>
              const activity = context.current as WarmupActivity
              return { done: [...context.done, activity], current: null, noted: [...context.noted, { activity, failedAt: o.failedAt, error: o.error, issue: o.issue ?? '' }] }
            })
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
    blocked: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({
    done: context.done,
    failure: context.failure,
    noted: context.noted,
    stopped: context.failure !== null || context.done.length < context.activities.length,
    blocked: ['checkpointed', 'loginWall', 'restrictedPolicy'].includes(context.failure?.issue ?? '')
  })
})
