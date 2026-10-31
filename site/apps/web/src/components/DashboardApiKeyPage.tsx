import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, Waves } from 'lucide-react'
import { Badge } from '@listeningkit/ui'
import { apiActivityFor, getApiKeys, type ApiActivityEvent, type ApiKey } from '../lib/api'
import { DashboardApiKeyConsole } from './DashboardApiKeyConsole'
import { DashboardApiKeyScopes } from './DashboardApiKeyScopes'
import { DashboardApiActivityInspectForm } from './DashboardApiActivityInspectForm'
import { DashboardTab } from './DashboardTab'
import { useDashboardFormSlot } from './DashboardFormSlot'

/**
 * Per-key observability, keyed by the key UUID in the route
 * (`/dashboard/api/:keyId`). Header carries the key's identity and scopes;
 * tabs below switch between the scope panel (the exact permissions chosen
 * at setup) and the scope-activity firehose (what the key calls and what
 * its scopes stop). A row click on the API table lands here; a firehose
 * row opens that call in the inspect sheet.
 */
export function DashboardApiKeyPage() {
  const { keyId } = useParams()
  const setFormSlot = useDashboardFormSlot()
  const [apiKey, setApiKey] = useState<ApiKey | null | undefined>(undefined)
  const [tab, setTab] = useState<'scope' | 'activity'>('scope')
  const [inspectedEvent, setInspectedEvent] = useState<ApiActivityEvent | null>(null)

  useEffect(() => {
    let cancelled = false
    getApiKeys()
      .then((list) => {
        if (!cancelled) setApiKey(list.find((row) => row.id === keyId) ?? null)
      })
      .catch(() => {
        if (!cancelled) setApiKey(null)
      })
    return () => {
      cancelled = true
    }
  }, [keyId])

  const activity = useMemo(() => (apiKey ? apiActivityFor(apiKey) : []), [apiKey])

  // A firehose row opens that call in the inspect sheet over the content —
  // there is no deeper page to navigate to, so it docks in the dashboard
  // form slot like the analytics post inspect does.
  useEffect(() => {
    setFormSlot(
      inspectedEvent && apiKey ? (
        <DashboardApiActivityInspectForm
          apiKey={apiKey}
          event={inspectedEvent}
          onClose={() => setInspectedEvent(null)}
        />
      ) : null
    )
    return () => setFormSlot(null)
  }, [inspectedEvent, apiKey, setFormSlot])

  // Scrim (backdrop) dismiss clears the rendered slot without touching page
  // state — without this reset the selection goes stale and a later click
  // on the same row no-ops.
  useEffect(() => {
    const onExternalDismiss = () => setInspectedEvent(null)
    window.addEventListener('lk:form-dismissed', onExternalDismiss)
    return () => window.removeEventListener('lk:form-dismissed', onExternalDismiss)
  }, [])

  if (apiKey === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <p className="rounded-xl bg-black/5 p-4 text-sm text-text-secondary" aria-busy="true">
          Loading key…
        </p>
      </div>
    )
  }

  if (apiKey === null) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
          That key doesn&apos;t exist in this workspace (it may have been revoked).{' '}
          <Link to="/dashboard/api" className="font-semibold text-[#2A8CFF] hover:underline">
            Back to API keys
          </Link>
        </p>
      </div>
    )
  }

  const scopeSummary = [
    apiKey.scopes.accountId ? 'One account' : 'All accounts',
    apiKey.scopes.groupIds.length > 0
      ? `${apiKey.scopes.groupIds.length} ${apiKey.scopes.groupIds.length === 1 ? 'group' : 'groups'}`
      : 'All groups',
    apiKey.scopes.canSendMessages ? 'Send' : 'No send',
    apiKey.scopes.canReceiveMessages ? 'Receive' : 'No receive',
  ].join(' · ')

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div>
        <Link
          to="/dashboard/api"
          className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={15} strokeWidth={2.25} aria-hidden="true" />
          API keys
        </Link>
        <h1 className="mt-1 truncate text-3xl font-bold text-text-primary" title={apiKey.name}>
          {apiKey.name}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Badge variant="success">Active</Badge>
          <span className="truncate text-xs text-text-secondary" title={apiKey.prefix}>
            {apiKey.prefix}
          </span>
          <span className="text-xs text-text-secondary" title={scopeSummary}>
            {scopeSummary}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Key detail view">
        <DashboardTab
          active={tab === 'scope'}
          onClick={() => setTab('scope')}
          label="Scope"
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          accent="blue"
        />
        <DashboardTab
          active={tab === 'activity'}
          onClick={() => setTab('activity')}
          label="Activity"
          icon={<Waves className="size-4" aria-hidden="true" />}
          accent="sky"
        />
      </div>

      {tab === 'scope' ? (
        <DashboardApiKeyScopes apiKey={apiKey} />
      ) : (
        <DashboardApiKeyConsole
          keyName={apiKey.name}
          activity={activity}
          onSelect={setInspectedEvent}
        />
      )}
    </div>
  )
}
