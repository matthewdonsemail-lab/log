import { assign, setup } from 'xstate'
import type { ClientTaskEvent, ClientTaskInput, ClientTaskState } from './types'
import { CLIENT_TASK_LEASE_MS } from './types'

export interface ClientTaskContext {
  communityId: string
  platform: ClientTaskInput['platform']
  accountId: string | null
  questions: string[]
  questionsHash: string | null
  draftAnswers: string[]
  leaseExpiresAt: string | null
  attempts: number
  lastError: string | null
  updatedAt: string
}

function leaseFrom(at: string, leaseMs?: number): string {
  return new Date(Date.parse(at) + (leaseMs ?? CLIENT_TASK_LEASE_MS)).toISOString()
}

/**
 * Client-task lifecycle (xstate v5). Time passes only through events
 * carrying timestamps (`HEARTBEAT.at`, `CHECK_LEASE.now`) — never
 * `Date.now()` inside the machine — so lease expiry is deterministic and
 * unit-testable. The mock store (and later the Convex backend) owns the
 * clock; the machine owns the rules.
 */
export const clientTaskMachine = setup({
  types: {
    context: {} as ClientTaskContext,
    events: {} as ClientTaskEvent,
    input: {} as ClientTaskInput
  },
  guards: {
    leaseLive: ({ context, event }) => {
      if (event.type !== 'CHECK_LEASE' && event.type !== 'HEARTBEAT') return false
      const now = event.type === 'CHECK_LEASE' ? event.now : event.at
      return context.leaseExpiresAt !== null && Date.parse(now) <= Date.parse(context.leaseExpiresAt)
    }
  },
  actions: {
    stamp: assign({
      updatedAt: ({ event }) => {
        switch (event.type) {
          case 'DISPATCHED':
          case 'ANSWERS_UPDATED':
          case 'HEARTBEAT':
          case 'SUBMIT':
          case 'SUBMIT_OK':
          case 'CANCEL':
          case 'RESUME':
            return event.at
          case 'QUESTIONS_RECEIVED':
            return event.at
          case 'SUBMIT_FAIL':
            return event.at
          default:
            return new Date().toISOString()
        }
      }
    }),
    trackDispatch: assign({
      leaseExpiresAt: ({ event }) =>
        event.type === 'DISPATCHED' ? leaseFrom(event.at, event.leaseMs) : null
    }),
    trackQuestions: assign({
      questions: ({ event }) => (event.type === 'QUESTIONS_RECEIVED' ? event.questions : []),
      questionsHash: ({ event }) => (event.type === 'QUESTIONS_RECEIVED' ? event.questionsHash : null),
      draftAnswers: [],
      leaseExpiresAt: ({ event }) =>
        event.type === 'QUESTIONS_RECEIVED' ? leaseFrom(event.at, event.leaseMs) : null
    }),
    trackDrafts: assign({
      draftAnswers: ({ event }) => (event.type === 'ANSWERS_UPDATED' ? event.draftAnswers : [])
    }),
    trackHeartbeat: assign({
      leaseExpiresAt: ({ context, event }) =>
        event.type === 'HEARTBEAT' ? leaseFrom(event.at, event.leaseMs) : context.leaseExpiresAt
    }),
    trackSubmit: assign({ attempts: ({ context }) => context.attempts + 1 }),
    trackFail: assign({
      lastError: ({ event }) => (event.type === 'SUBMIT_FAIL' ? event.error : null)
    }),
    trackResume: assign({
      lastError: null,
      leaseExpiresAt: ({ event }) =>
        event.type === 'RESUME' ? leaseFrom(event.at, event.leaseMs) : null
    })
  }
}).createMachine({
  id: 'clientTask',
  initial: 'queued',
  context: ({ input }) => ({
    communityId: input.communityId,
    platform: input.platform,
    accountId: input.accountId ?? null,
    questions: [],
    questionsHash: null,
    draftAnswers: [],
    leaseExpiresAt: null,
    attempts: 0,
    lastError: null,
    updatedAt: input.at ?? new Date().toISOString()
  }),
  states: {
    queued: {
      on: { START: 'running' }
    },
    running: {
      on: {
        DISPATCHED: { target: 'running', actions: ['trackDispatch', 'stamp'] },
        QUESTIONS_RECEIVED: { target: 'awaiting_input', actions: ['trackQuestions', 'stamp'] },
        SUBMIT_OK: { target: 'done', actions: 'stamp' },
        SUBMIT_FAIL: { target: 'failed', actions: ['trackFail', 'stamp'] },
        CHECK_LEASE: [
          { guard: 'leaseLive', target: 'running' },
          { target: 'expired' }
        ],
        CANCEL: { target: 'abandoned', actions: 'stamp' }
      }
    },
    awaiting_input: {
      on: {
        ANSWERS_UPDATED: { target: 'awaiting_input', actions: ['trackDrafts', 'stamp'] },
        HEARTBEAT: [
          { guard: 'leaseLive', target: 'awaiting_input', actions: ['trackHeartbeat', 'stamp'] },
          { target: 'expired' }
        ],
        SUBMIT: { target: 'submitting', actions: ['trackSubmit', 'stamp'] },
        CHECK_LEASE: [
          { guard: 'leaseLive', target: 'awaiting_input' },
          { target: 'expired' }
        ],
        CANCEL: { target: 'abandoned', actions: 'stamp' }
      }
    },
    submitting: {
      on: {
        SUBMIT_OK: { target: 'done', actions: 'stamp' },
        SUBMIT_FAIL: { target: 'awaiting_input', actions: ['trackFail', 'stamp'] },
        CANCEL: { target: 'abandoned', actions: 'stamp' }
      }
    },
    done: { on: {} },
    failed: {
      on: {
        RESUME: { target: 'awaiting_input', actions: ['trackResume', 'stamp'] },
        CANCEL: { target: 'abandoned', actions: 'stamp' }
      }
    },
    abandoned: {
      on: {
        RESUME: { target: 'awaiting_input', actions: ['trackResume', 'stamp'] }
      }
    },
    expired: {
      on: {
        RESUME: { target: 'awaiting_input', actions: ['trackResume', 'stamp'] }
      }
    }
  }
})

export type { ClientTaskState }
