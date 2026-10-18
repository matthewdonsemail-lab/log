import type { AccountIssue } from '../types'

/**
 * Issues the platform treats as "this account may not mutate here" —
 * marketplace writes are refused even with a live session. Ported from
 * listeningkit-hackathon apps/web/src/lib/account-state.ts.
 */
export const WRITE_BLOCKING_ISSUES: readonly AccountIssue[] = ['suspended', 'read_only_limited']

export function isWriteBlocked(issue: AccountIssue | null | undefined): boolean {
  return issue ? WRITE_BLOCKING_ISSUES.includes(issue) : false
}
