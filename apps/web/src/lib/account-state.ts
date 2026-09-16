import { ISSUE_CATALOG } from './account-issues'
import type { AccountIssue } from './account-issues'
import type { ConnectionRecord } from './connections/types'

/**
 * The account-level gate — the one place account state cascades into the rows
 * that reference it (`ListingRecord.accountId`, `Community.accountId`).
 *
 * Rows never store account state. They hold the `accountId` foreign key and
 * resolve the gate at read/write time: the UI when it hides or explains an
 * action, the store when it 409s a write, and the live client when it decides
 * whether a row under this account is worth polling at all. That is why a
 * banned account doesn't rewrite history — every row under it reads as stale
 * while the gate is closed, and everything re-validates when the account
 * comes back (appeal accepted, cookie re-exported), with zero row churn.
 *
 * The closed forms:
 *  - `terminal` — the platform took the account itself (banned / suspended,
 *    or the row was deleted from the roster). Nothing under it can be observed
 *    or written, and every poll or write aimed at it is a wasted request: the
 *    session no longer exists. Rows keep their last-known join/listing state
 *    and surface as stale through the gate instead of being mutated.
 *  - `stalled` — the session is temporarily out of reach (disconnected,
 *    expired, checkpointed, …). The membership/listing itself may still be
 *    valid on the platform; we just cannot confirm or act until the session
 *    is back. Transient by nature — the fix is a reconnect, not an appeal.
 *
 * Everything else (rate limits, proxy trouble, degraded-but-alive issues like
 * X's read-only limit) is a transport condition, not a session-ownership
 * condition: writes still reach the platform and the platform decides.
 *
 * `WRITE_BLOCKING_ISSUES` is the stricter, machine-level list the per-write
 * checks use (the platform refuses marketplace/group writes from these
 * accounts even when a session nominally connects) — `suspended` and
 * `read_only_limited` (limited access). It is separate from the gate because
 * the gate answers "can we reach this account's rows at all" while the
 * write-block answers "will the platform accept a mutation through it".
 */
export type AccountGate =
  | { ok: true }
  | { ok: false; kind: 'terminal' | 'stalled'; reason: string }

/** The account's label — resolved from the roster; falls back to a neutral noun. */
export const TERMINAL_ISSUES: readonly AccountIssue[] = ['suspended']

/**
 * Session-ownership issues: the saved session cannot reach the account at all.
 * Derived from the catalog's `fix` verbs that act on the session itself
 * (re-export / reconnect / clear-by-hand), minus `stale` (a lifecycle drift —
 * the session may still be live) and `never_connected` (no session to lose;
 * that is a setup state, not a session that went away).
 */
const STALLED_ISSUES: readonly AccountIssue[] = [
  'disconnected',
  'session_expired',
  'session_invalidated_changed',
  'checkpointed',
  'unconfirmed_user',
  'cookie_invalid',
  'login_wall',
  'captcha_html'
]

/**
 * Issues the platform treats as "this account may not mutate here" —
 * marketplace writes and group joins are refused even with a live session.
 * Shared by the listings machine (seller writes) and the communities machine
 * (user writes) so both domains 409 the same set of refused moves.
 */
export const WRITE_BLOCKING_ISSUES: readonly AccountIssue[] = ['suspended', 'read_only_limited']

function labelFor(record: ConnectionRecord | undefined, accountId: string): string {
  return record?.label ?? accountId
}

/**
 * Resolve the gate for the account behind a row.
 *
 * `accountId === null` is the workspace-scoped join (subreddits and X
 * communities have no owning account) — there is nothing to gate, and the
 * row is always operable.
 */
export function gateAccount(
  accountId: string | null | undefined,
  accounts: readonly ConnectionRecord[]
): AccountGate {
  if (!accountId) return { ok: true }
  const record = accounts.find((row) => row.id === accountId)
  if (!record) {
    return {
      ok: false,
      kind: 'terminal',
      reason: `${labelFor(record, accountId)} is no longer in the account roster — its rows are stale until the account is connected again.`
    }
  }
  const issue = record.lastIssue
  if (issue && TERMINAL_ISSUES.includes(issue)) {
    return {
      ok: false,
      kind: 'terminal',
      reason: `${record.label} is ${ISSUE_CATALOG[issue].label.toLowerCase()} — the platform will not act on requests through it, and its rows are stale until the appeal lands.`
    }
  }
  if (issue && STALLED_ISSUES.includes(issue)) {
    return {
      ok: false,
      kind: 'stalled',
      reason: `${record.label} is ${ISSUE_CATALOG[issue].label.toLowerCase()} — reconnect the session before requests through it will succeed.`
    }
  }
  return { ok: true }
}

/**
 * One-line human copy for a closed gate — the digest form for UI surfaces
 * (toasts, table hints) that already branch on the gate itself elsewhere.
 * `subject` is what is gated ("the group join", "the listing", …).
 */
export function describeGate(gate: AccountGate, subject: string): string | null {
  if (gate.ok) return null
  return gate.kind === 'terminal'
    ? `${subject} is tied to a terminated account — the platform won't act on it until the account is restored.`
    : `${subject} can't be worked until the account's session is back.`
}