import { Badge } from '@listeningkit/ui'
import { Users } from 'lucide-react'
import { API_ROUTES } from '../lib/api'
import type { ApiActivityEvent, ApiKey } from '../lib/api'
import {
  AccountScopeVisuals,
  GroupScopeVisuals,
  MessageScopeVisuals,
  NamedGroupRows,
  ScopeVisual,
  useScopeDirectory,
} from './DashboardScopeRows'
import { DashboardFormSheet } from './DashboardFormSheet'

const METHOD_BADGE: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  GET: 'info',
  POST: 'success',
  PATCH: 'warning',
  DELETE: 'danger',
}

function formatTs(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

type BlockedDimension = 'account' | 'group' | 'send' | 'receive' | null

/**
 * The denial reason text names exactly which scope dimension stopped the
 * call (it is the checkAccess boilerplate), so the highlight maps to that
 * one row instead of painting valid scopes red.
 */
function blockedDimensionByReason(reason: string | null): BlockedDimension {
  if (!reason) return null
  if (reason.includes('not scoped to that account')) return 'account'
  if (reason.includes('not scoped to that group')) return 'group'
  if (reason.includes('cannot send messages')) return 'send'
  if (reason.includes('cannot receive messages')) return 'receive'
  return null
}

/**
 * The group dimension under a group denial: a flagged summary row carries
 * the exact reason, and the key's own named groups render beneath it as
 * their valid checked rows — the denied call touched a group outside them.
 */
function GroupScopeDenialRow({
  scope,
  reason,
}: {
  scope: ApiKey['scopes']
  reason: string
}) {
  const { communities, loaded } = useScopeDirectory()
  if (scope.groupIds.length === 0) {
    return (
      <ScopeVisual
        tone="flagged"
        leading={<Users className="size-6" />}
        title="All groups"
        detail={reason}
      />
    )
  }
  const names = scope.groupIds
    .map((id) => communities.find((row) => row.id === id)?.name ?? (loaded ? id : undefined))
    .filter((name): name is string => name !== undefined)
  return (
    <div className="flex flex-col gap-1.5">
      <ScopeVisual
        tone="flagged"
        leading={<Users className="size-6" />}
        title={
          loaded
            ? names.length === scope.groupIds.length
              ? `${scope.groupIds.length} ${scope.groupIds.length === 1 ? 'group' : 'groups'}`
              : 'Scoped groups'
            : 'Resolving…'
        }
        detail={reason}
      />
      <NamedGroupRows groupIds={scope.groupIds} />
    </div>
  )
}

/**
 * Inspect view for one scope-activity call: the outcome (allowed or denied
 * with the exact scope reason), when it happened, and what the route demands
 * next to what the key carries — rendered in the key-creation form's visual
 * language so the scopes read the same here as at setup. A denial lands its
 * denial treatment on the one dimension that stopped it. Registered into the
 * dashboard form slot from the key page's firehose.
 */
export function DashboardApiActivityInspectForm({
  apiKey,
  event,
  onClose,
}: {
  apiKey: ApiKey
  event: ApiActivityEvent
  onClose: () => void
}) {
  const route = API_ROUTES.find((row) => row.method === event.method && row.path === event.path)
  const blocked = event.allowed ? null : blockedDimensionByReason(event.reason)

  return (
    <DashboardFormSheet
      open
      title={event.path}
      subtitle={
        <>
          <Badge variant={METHOD_BADGE[event.method] ?? 'muted'}>{event.method}</Badge>
          <span>· {formatTs(event.ts)}</span>
        </>
      }
      onClose={onClose}
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-bold uppercase text-text-secondary">Outcome</p>
        <div className="flex items-center gap-2">
          <Badge variant={event.allowed ? 'success' : 'danger'}>
            {event.allowed ? 'Allowed' : 'Denied'}
          </Badge>
          {event.allowed ? (
            <span className="text-sm text-text-secondary">The key&apos;s scopes covered this call.</span>
          ) : null}
        </div>
        {!event.allowed && event.reason ? (
          <p className="text-sm leading-relaxed text-red-600">{event.reason}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-bold uppercase text-text-secondary">
          What this route needs — and what {apiKey.name} carries
        </p>
        {!route ? (
          <p className="text-sm text-text-secondary">This call isn&apos;t in the route registry.</p>
        ) : (
          <>
            {route.needs.account ? (
              <AccountScopeVisuals scope={apiKey.scopes} tone={blocked === 'account' ? 'flagged' : 'on'} />
            ) : null}
            {route.needs.group ? (
              blocked === 'group' && event.reason ? (
                <GroupScopeDenialRow scope={apiKey.scopes} reason={event.reason} />
              ) : (
                <GroupScopeVisuals scope={apiKey.scopes} />
              )
            ) : null}
            {route.needs.send || route.needs.receive ? (
              <MessageScopeVisuals
                scope={apiKey.scopes}
                flagged={(blocked === 'send' || blocked === 'receive' ? blocked : null) as 'send' | 'receive' | null}
              />
            ) : null}
            {route.planned ? (
              <p className="text-xs text-text-secondary">
                No server route implements this yet — the scope bit is carried ahead of it.
              </p>
            ) : null}
          </>
        )}
      </div>
    </DashboardFormSheet>
  )
}