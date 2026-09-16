import { WRITE_BLOCKING_ISSUES } from '../account-state'
import type { AccountIssue } from '../account-issues'

/**
 * Shared transition vocabulary for the per-platform community machines
 * (`facebook/`, `reddit/`, `x/`). Every machine answers membership moves
 * with this shape so the store (409 with the reason) and the dashboard
 * (hiding the action, toasting the refusal) stay in lockstep.
 */
export interface TransitionVerdict {
  allowed: boolean
  reason?: string
}

export function allow(): TransitionVerdict {
  return { allowed: true }
}

export function refuse(reason: string): TransitionVerdict {
  return { allowed: false, reason }
}

/**
 * The account-level write gate every user-source move composes with: a
 * joining account carrying a write-blocking issue refuses the move before
 * any platform edge is consulted — the platform would reject the write, so
 * the store 409s first and the UI hides the action.
 */
export function writeBlockedVerdict(accountIssue: AccountIssue | undefined): TransitionVerdict | null {
  if (!accountIssue || !WRITE_BLOCKING_ISSUES.includes(accountIssue)) return null
  return refuse(
    accountIssue === 'suspended'
      ? 'The joining account is suspended — the platform will refuse the request.'
      : 'The joining account has limited access — the platform refuses writes through it.'
  )
}

/**
 * Opaque hash of an entry-question set. Answers and drafts are only
 * prefillable when the hash matches — a changed set means the group edited
 * its gate and the form re-asks from blanks.
 */
export function hashQuestionSet(questions: string[]): string {
  let hash = 5381
  const text = questions.join('\u0000')
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
