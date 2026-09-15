import type { ConnectionRecord } from '../connections/types'
import { ISSUE_CATALOG, accountIssueSnapshot } from './index'
import type { AccountIssue, AccountIssueInfo, RawSignal } from './types'

export type AccountState = 'not_connected' | 'healthy' | 'degraded' | 'action_required'

export type AccountUserAction =
  | 'connect'
  | 'reconnect'
  | 'wait'
  | 'use_proxy'
  | 'open_challenge'
  | 'login_in_browser'
  | 'appeal'
  | 'rejoin'
  | 'none'

export interface AccountNotification {
  type: 'account-state-changed'
  accountId: string
  previousIssue: AccountIssue | null
  issue: AccountIssue | null
  state: AccountState
  requiresAction: boolean
  title: string
  detail: string
}

export interface AccountStateViewModel {
  account: ConnectionRecord
  state: AccountState
  issue: AccountIssueInfo | null
  action: AccountUserAction
  requiresAction: boolean
}

function actionFor(issue: AccountIssueInfo | null): AccountUserAction {
  if (!issue) return 'none'
  switch (issue.fix) {
    case 'connect': return 'connect'
    case 'reconnect': return 'reconnect'
    case 'wait': return 'wait'
    case 'use_proxy': return 'use_proxy'
    case 'resolve': return 'open_challenge'
    case 'login_in_browser': return 'login_in_browser'
    case 'appeal': return 'appeal'
    case 'rejoin': return 'rejoin'
    default: return 'none'
  }
}

/**
 * Converts the persisted account record into the component's render model.
 * Components should consume this model instead of interpreting platform
 * errors or `lastIssue` directly.
 */
export function accountStateView(record: ConnectionRecord, now = new Date()): AccountStateViewModel {
  const snapshot = accountIssueSnapshot(record, now)
  if (!record.connectedAt) {
    const issue = snapshot.issue ?? ISSUE_CATALOG.never_connected && null
    return {
      account: record,
      state: 'not_connected',
      issue,
      action: issue ? actionFor(issue) : 'connect',
      requiresAction: true
    }
  }

  if (!snapshot.issue) {
    return {
      account: record,
      state: 'healthy',
      issue: null,
      action: 'none',
      requiresAction: false
    }
  }

  const action = actionFor(snapshot.issue)
  const requiresAction = !snapshot.issue.transient && action !== 'none'
  return {
    account: record,
    state: requiresAction ? 'action_required' : 'degraded',
    issue: snapshot.issue,
    action,
    requiresAction
  }
}

/**
 * Pure transition detector. A backend subscription, polling adapter, or
 * Convex query can feed old/new records into this function; the component
 * does not need to know how the state was delivered.
 */
export function accountStateNotification(
  previous: ConnectionRecord | null,
  next: ConnectionRecord,
  now = new Date()
): AccountNotification | null {
  const previousIssue = previous?.lastIssue ?? null
  const nextIssue = next.lastIssue ?? null
  const previousView = previous ? accountStateView(previous, now) : null
  const nextView = accountStateView(next, now)

  if (previousView?.state === nextView.state && previousIssue === nextIssue) return null

  const title = nextView.issue?.label ?? (nextView.state === 'healthy' ? 'Account recovered' : 'Account state changed')
  const detail = nextView.issue?.remediation[next.platform] ??
    (nextView.state === 'healthy' ? 'The account is healthy again.' : 'Review the account state and required action.')

  return {
    type: 'account-state-changed',
    accountId: next.id,
    previousIssue,
    issue: nextIssue,
    state: nextView.state,
    requiresAction: nextView.requiresAction,
    title,
    detail
  }
}

export interface AccountStateChangeInput {
  issue: AccountIssue | null
  signal?: RawSignal | null
  retryAfter?: number | null
}

/** Build the canonical persisted issue patch produced by a detector. */
export function accountIssuePatch(input: AccountStateChangeInput): Pick<ConnectionRecord, 'lastIssue' | 'rawSignal' | 'lastCheckedAt' | 'retryAfter'> {
  return {
    lastIssue: input.issue,
    rawSignal: input.signal ?? null,
    lastCheckedAt: new Date().toISOString(),
    retryAfter: input.retryAfter ?? null
  }
}
