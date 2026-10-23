import type { AccountIssue } from '../types'

export const WRITE_BLOCKING_ISSUES: readonly AccountIssue[] = ['suspended', 'readOnlyLimited']

export function isWriteBlocked(issue: AccountIssue | null | undefined): boolean {
  return issue ? WRITE_BLOCKING_ISSUES.includes(issue) : false
}
