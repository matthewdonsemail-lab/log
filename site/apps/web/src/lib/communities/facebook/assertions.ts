import { writeBlockedVerdict, type TransitionVerdict } from '../transition'
import type { FacebookContext, FacebookStateValue } from './types'
import { FACEBOOK_MODAL_LEASE_MS } from './types'

/**
 * Pure guards for the Facebook membership machine. The xstate machine
 * references these (single source for edge legality); the store calls the
 * machine, and the dashboard menu calls these directly — all three agree.
 */

const SUBMITTABLE: readonly FacebookStateValue[] = ['formRendered', 'formIncomplete', 'formAbandoned']

/** The operator may hand answers to the client from a rendered/abandoned form. */
export function canSubmitAnswers(
  value: FacebookStateValue,
  context: Pick<FacebookContext, 'accountIssue'>
): TransitionVerdict {
  const blocked = writeBlockedVerdict(context.accountIssue)
  if (blocked) return blocked
  if (!SUBMITTABLE.includes(value)) {
    return {
      allowed: false,
      reason: 'There is no open entry-question form to submit — initiate the join first.'
    }
  }
  return { allowed: true }
}

/**
 * Whether an open modal has idled past its lease and reads as abandoned.
 * `nowMs` is injected (not read) so the lease is unit-testable; the store
 * passes `Date.now()`.
 */
export function isFormStale(
  value: FacebookStateValue,
  context: Pick<FacebookContext, 'lastActivityAt'>,
  nowMs: number,
  leaseMs: number = FACEBOOK_MODAL_LEASE_MS
): boolean {
  if (value !== 'formRendered' && value !== 'formIncomplete') return false
  if (!context.lastActivityAt) return false
  return nowMs - Date.parse(context.lastActivityAt) > leaseMs
}

/** Completeness of a submit against the question set the client rendered. */
export function answersCompleteness(questions: string[], answers: string[]): boolean {
  if (questions.length === 0) return true
  return answers.length === questions.length && answers.every((answer) => answer.trim() !== '')
}
