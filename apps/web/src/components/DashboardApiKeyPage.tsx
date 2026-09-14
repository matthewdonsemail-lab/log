import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@listeningkit/ui'
import { apiActivityFor, getApiKeys, type ApiKey } from '../lib/api'
import { DashboardApiKeyConsole } from './DashboardApiKeyConsole'

/**
 * Per-key observability, keyed by the key UUID in the route
 * (`/dashboard/api/:keyId`). Header carries the key's identity and scopes;
 * below it the scope-activity firehose replays what the key calls and what
 * its scopes stop. A row click on the API table lands here.
 */
export function DashboardApiKeyPage() {
  const { keyId } = useParams()
  const [apiKey, setApiKey] = useState<ApiKey | null | undefined>(undefined)

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

      <DashboardApiKeyConsole keyName={apiKey.name} activity={activity} />
    </div>
  )
}
