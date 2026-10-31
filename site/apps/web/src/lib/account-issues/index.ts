export type {
  AccountIssue,
  AccountIssueInfo,
  AccountIssueRecord,
  IssueFix,
  IssueSeverity,
  RawSignal
} from './types'
export {
  ISSUE_CATALOG,
  LIFECYCLE_ISSUES,
  issueInfo,
  severityToState,
  type CatalogEntry
} from './catalog'
export { FIX_LABELS, normalizeSignal } from './normalize'
export { getAccountIssueEvents, type AccountIssueEvent } from './events'
export {
  CHALLENGE_RESOLVABLE_ISSUES,
  CHALLENGE_SOLVED_MESSAGE,
  challengePageFor
} from './challenge'
export {
  accountStateView,
  accountStateNotification,
  accountIssuePatch,
  type AccountState,
  type AccountStateChangeInput,
  type AccountStateViewModel,
  type AccountNotification,
  type AccountUserAction
} from './state'
export {
  createMockAccountStateStore,
  type AccountStateStore
} from './store'

import { assessAccountHealth, type AccountHealth } from '../health'
import type { ConnectionRecord } from '../connections/types'
import { issueInfo } from './catalog'
import type { AccountIssueInfo } from './types'

export interface AccountIssueSnapshot {
  health: AccountHealth
  issue: AccountIssueInfo | null
}

export function accountIssueSnapshot(
  record: ConnectionRecord,
  now: Date = new Date()
): AccountIssueSnapshot {
  const health = assessAccountHealth(record, now)
  const issue = record.lastIssue
    ? issueInfo(record.lastIssue, record.platform)
    : health.state === 'unhealthy' && record.connectedAt === null
      ? issueInfo('never_connected', record.platform)
      : null
  return { health, issue }
}

const SEVERITY_ORDER: Record<AccountIssueInfo['severity'], number> = {
  healthy: 0,
  degraded: 1,
  unhealthy: 2
}

export function effectiveSeverity(
  snapshot: AccountIssueSnapshot
): 'healthy' | 'degraded' | 'unhealthy' {
  const fromIssue = snapshot.issue ? SEVERITY_ORDER[snapshot.issue.severity] : -1
  const fromHealth = SEVERITY_ORDER[snapshot.health.state]
  const worst = Math.max(fromIssue, fromHealth)
  const names: Array<'healthy' | 'degraded' | 'unhealthy'> = ['healthy', 'degraded', 'unhealthy']
  return names[worst]
}
