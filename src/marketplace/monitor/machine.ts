import { assign, fromPromise, setup } from 'xstate'
import { detectHealth, evaluateRelist } from './helpers/index'
import {
  CIRCUIT_BREAKER_THRESHOLD,
  DEFAULT_MONITOR_TIMING,
  DEFAULT_RELIST_POLICY,
  MAX_TRANSIENT_RETRIES
} from './types'
import type { CheckOutcome, MonitorContext, MonitorInput } from './types'

export interface MonitorOutput {
  accountId: string
  checks: number
  stopReason: string | null
  issue: MonitorContext['issue']
  decisions: MonitorContext['decisions']
}

export const monitorMachine = setup({
  types: {
    context: {} as MonitorContext,
    input: {} as MonitorInput,
    events: {} as { type: 'STOP' },
    output: {} as MonitorOutput
  },
  actors: {
    check: fromPromise<CheckOutcome, { accountId: string }>(async () => {
      throw new Error('monitorMachine: provide a `check` actor')
    })
  },
  guards: {
    isOk: (_, outcome: CheckOutcome) => outcome.kind === 'ok',
    isRateLimited: (_, outcome: CheckOutcome) => outcome.kind === 'issue' && outcome.issue === 'rateLimited',
    isIssue: (_, outcome: CheckOutcome) => outcome.kind === 'issue',
    circuitOpen: ({ context }) => (context.failure?.count ?? 0) >= CIRCUIT_BREAKER_THRESHOLD,
    canQuickRetry: ({ context }) =>
      context.lastOutcome?.kind === 'error' && context.lastOutcome.retryable && context.retries < MAX_TRANSIENT_RETRIES,
    checksDone: ({ context }) => context.maxChecks > 0 && context.checks >= context.maxChecks
  },
  actions: {
    recordOutcome: assign(({ context }, outcome: CheckOutcome) => {
      const checks = context.retries > 0 ? context.checks : context.checks + 1
      if (outcome.kind === 'error') {
        const count = context.failure?.code === outcome.code ? context.failure.count + 1 : 1
        return { checks, lastOutcome: outcome, failure: { code: outcome.code, count } }
      }
      return { checks, lastOutcome: outcome, failure: null, issue: outcome.issue }
    }),
    countRetry: assign(({ context }) => ({ retries: context.retries + 1 })),
    clearRetries: assign({ retries: 0 }),
    decide: assign(({ context }) => {
      const outcome = context.lastOutcome
      if (outcome?.kind !== 'ok') return {}
      const health = detectHealth(context.listings, outcome.seen)
      const decisions = health.map(({ listingId, health: h }) =>
        evaluateRelist(context.listings.find((l) => l.listingId === listingId)!, h, context.policy)
      )
      const listings = context.listings.map((listing) => {
        const decision = decisions.find((d) => d.listingId === listing.listingId)
        return decision?.shouldRepost ? { ...listing, repostPending: true } : listing
      })
      return { decisions, listings }
    }),
    stopBecause: assign((_, reason: string) => ({ stopReason: reason }))
  },
  delays: {
    poll: ({ context }) => context.timing.pollIntervalMs,
    retry: ({ context }) => context.timing.retryDelayMs,
    rest: ({ context }) => context.timing.limitedRestMs
  }
}).createMachine({
  id: 'monitor',
  context: ({ input }) => ({
    accountId: input.accountId,
    listings: input.listings,
    policy: input.policy ?? DEFAULT_RELIST_POLICY,
    timing: input.timing ?? DEFAULT_MONITOR_TIMING,
    maxChecks: input.maxChecks ?? 1,
    checks: 0,
    failure: null,
    retries: 0,
    issue: null,
    lastOutcome: null,
    decisions: [],
    stopReason: null
  }),
  initial: 'checking',
  on: {
    STOP: { target: '.done', actions: { type: 'stopBecause', params: 'stopped' } }
  },
  states: {
    checking: {
      invoke: {
        id: 'check',
        src: 'check',
        input: ({ context }) => ({ accountId: context.accountId }),
        onDone: [
          {
            guard: { type: 'isOk', params: ({ event }) => event.output },
            target: 'evaluating',
            actions: { type: 'recordOutcome', params: ({ event }) => event.output }
          },
          {
            guard: { type: 'isRateLimited', params: ({ event }) => event.output },
            target: 'resting',
            actions: { type: 'recordOutcome', params: ({ event }) => event.output }
          },
          {
            guard: { type: 'isIssue', params: ({ event }) => event.output },
            target: 'blocked',
            actions: { type: 'recordOutcome', params: ({ event }) => event.output }
          },
          { target: 'failed', actions: { type: 'recordOutcome', params: ({ event }) => event.output } }
        ],
        onError: {
          target: 'failed',
          actions: {
            type: 'recordOutcome',
            params: ({ event }) => ({ kind: 'error', code: 'checkCrashed', detail: String(event.error), retryable: false })
          }
        }
      }
    },
    evaluating: {
      entry: 'decide',
      always: [{ guard: 'checksDone', target: 'done', actions: { type: 'stopBecause', params: 'checks done' } }, { target: 'waiting' }]
    },
    waiting: {
      entry: 'clearRetries',
      after: { poll: 'checking' }
    },
    resting: {
      entry: 'clearRetries',
      always: { guard: 'checksDone', target: 'done', actions: { type: 'stopBecause', params: 'rate limited' } },
      after: { rest: 'checking' }
    },
    failed: {
      always: [
        {
          guard: 'circuitOpen',
          target: 'tripped',
          actions: { type: 'stopBecause', params: `circuit breaker: ${CIRCUIT_BREAKER_THRESHOLD} failures in a row` }
        },
        { guard: 'canQuickRetry', target: 'retrying' },
        { guard: 'checksDone', target: 'done', actions: { type: 'stopBecause', params: 'check failed' } },
        { target: 'waiting' }
      ]
    },
    retrying: {
      entry: 'countRetry',
      after: { retry: 'checking' }
    },
    blocked: {
      type: 'final',
      entry: { type: 'stopBecause', params: 'account needs attention' }
    },
    tripped: { type: 'final' },
    done: { type: 'final' }
  },
  output: ({ context }) => ({
    accountId: context.accountId,
    checks: context.checks,
    stopReason: context.stopReason,
    issue: context.issue,
    decisions: context.decisions
  })
})
