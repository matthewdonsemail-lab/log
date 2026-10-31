import type { ReactNode } from 'react'
import { Badge } from '@listeningkit/ui'
import type { ConnectionRecord } from '../lib/connections'
import {
  accountIssueSnapshot,
  effectiveSeverity,
  type AccountIssueSnapshot,
  type IssueSeverity
} from '../lib/account-issues'

/**
 * The one account-status vocabulary the whole dashboard renders from.
 * Every surface that shows where an account stands — the Accounts table
 * row, the account page header, the console firehose, the hover tooltip —
 * derives its badge/label/dot from these maps, so the same account always
 * reads the same everywhere. Issue-state wins over lifecycle state (the
 * normalized issue the client last observed is ground truth).
 */

/** Severity → Badge variant. */
export const SEVERITY_BADGE: Record<IssueSeverity, 'success' | 'warning' | 'danger'> = {
  healthy: 'success',
  degraded: 'warning',
  unhealthy: 'danger'
}

/** Severity → status dot class (single-row grammar: firehose rows, tooltip dots). */
export const SEVERITY_DOT: Record<IssueSeverity, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  unhealthy: 'bg-red-500'
}

/** Severity → the severity's own name, for the console's event rows. */
export const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  unhealthy: 'Critical'
}

/** Severity → lifecycle state: what the account is doing right now. */
export const SEVERITY_LIFECYCLE_LABEL: Record<IssueSeverity, string> = {
  healthy: 'Connected',
  degraded: 'Stale',
  unhealthy: 'Not connected'
}

/** The label a status badge wears: the active issue when observed, else the lifecycle state. */
export function accountStatusLabel(snapshot: AccountIssueSnapshot): string {
  return snapshot.issue ? snapshot.issue.label : SEVERITY_LIFECYCLE_LABEL[effectiveSeverity(snapshot)]
}

/** The one-line detail the badge's native tooltip explains. */
export function accountStatusTitle(snapshot: AccountIssueSnapshot): string {
  return snapshot.issue ? snapshot.issue.detail : snapshot.health.reason
}

/**
 * The standard account status badge: active normalized issue wins
 * ("Checkpoint challenge", "Rate limited"), falling back to the lifecycle
 * state ("Connected" / "Stale" / "Not connected"). The variant and title
 * both come from the shared maps above.
 */
export function AccountStatusBadge({
  account,
  icon,
  className
}: {
  account: ConnectionRecord
  /** Optional leading glyph (e.g. the platform icon). */
  icon?: ReactNode
  className?: string
}) {
  const snapshot = accountIssueSnapshot(account)
  return (
    <Badge
      variant={SEVERITY_BADGE[effectiveSeverity(snapshot)]}
      icon={icon}
      className={className}
      title={accountStatusTitle(snapshot)}
    >
      {accountStatusLabel(snapshot)}
    </Badge>
  )
}