import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  Button,
  Dropdown,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@listeningkit/ui'
import { getApiKeys, revokeApiKey, type ApiKey } from '@/lib/api'
import { getAccounts } from '@/lib/connections'
import { getCommunities } from '@/lib/communities'
import { useDashboardFormSlot } from './DashboardFormSlot'
import { DashboardApiCreateForm } from './DashboardApiCreateForm'

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ScopeChip({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex max-w-40 items-center gap-1 truncate rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[11px] font-semibold text-text-secondary"
    >
      {children}
    </span>
  )
}

export function DashboardAPI() {
  const navigate = useNavigate()
  const [keys, setKeys] = useState<ApiKey[] | null>(null)
  const [accountLabels, setAccountLabels] = useState<Map<string, string>>(new Map())
  const [communityNames, setCommunityNames] = useState<Map<string, string>>(new Map())
  const [formOpen, setFormOpen] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const { error: notifyError, success: notifySuccess } = useToast()

  const load = useCallback(() => {
    getApiKeys()
      .then(setKeys)
      .catch(() => setKeys([]))
  }, [])

  // Key list plus the label maps its scope chips resolve through. Label
  // lookups tolerate failure — unresolved scopes fall back to raw ids.
  useEffect(() => {
    load()
    getAccounts()
      .then((list) => setAccountLabels(new Map(list.map((account) => [account.id, account.label]))))
      .catch(() => setAccountLabels(new Map()))
    getCommunities()
      .then((list) => setCommunityNames(new Map(list.map((community) => [community.id, community.name]))))
      .catch(() => setCommunityNames(new Map()))
  }, [load])

  // The create form lives in the layout overlay, not in the page: register
  // it when open, clear it when closed or when the page unmounts.
  const setFormSlot = useDashboardFormSlot()
  useEffect(() => {
    if (!formOpen) {
      setFormSlot(null)
      return
    }
    setFormSlot(<DashboardApiCreateForm onClose={() => setFormOpen(false)} onCreated={load} />)
    return () => setFormSlot(null)
  }, [formOpen, load, setFormSlot])

  // Scrim (backdrop) dismiss clears the rendered slot without touching page
  // state — without this reset the selection goes stale and a later click
  // on the same row no-ops.
  useEffect(() => {
    const onExternalDismiss = () => setFormOpen(false)
    window.addEventListener('lk:form-dismissed', onExternalDismiss)
    return () => window.removeEventListener('lk:form-dismissed', onExternalDismiss)
  }, [])

  async function revoke(id: string) {
    if (revokingId) return
    setRevokingId(id)
    try {
      const next = await revokeApiKey(id)
      setKeys(next)
      notifySuccess('Key revoked', 'That key no longer authenticates.')
    } catch (err: unknown) {
      notifyError('Revoke failed', err instanceof Error ? err.message : 'Could not revoke the key.')
    } finally {
      setRevokingId(null)
    }
  }

  const rows = keys ?? []

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">API</h1>
          <p className="text-sm text-text-secondary">Private keys for programs that talk to ListeningKit.</p>
        </div>
        <Button
          type="button"
          variant="blue"
          size="lg"
          shadow="hard"
          onClick={() => setFormOpen(true)}
          className="font-bold text-white"
        >
          <PlusIcon aria-hidden="true" className="size-4" strokeWidth={2.25} />
          New API key
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Active keys</h2>
          <p className="text-sm text-text-secondary">
            Secrets are shown once at creation and never again. Click a row for what the key calls.
          </p>
        </div>
        {rows.length > 0 && (
          <Table>
            <table className="w-full min-w-[880px] text-left">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Key</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Communities</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((apiKey) => {
                  const communityNamesForKey = apiKey.scopes.communityIds.map((id) => communityNames.get(id) ?? id)
                  return (
                    <TableRow
                      key={apiKey.id}
                      onClick={() => navigate(`/dashboard/api/${apiKey.id}`)}
                      title={`Scope activity for “${apiKey.name}”`}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-bold text-text-primary">{apiKey.name}</span>
                          <span className="truncate text-xs text-text-secondary" title={apiKey.prefix}>
                            {apiKey.prefix}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48">
                        <span className="block truncate text-text-secondary" title={apiKey.scopes.accountId ? (accountLabels.get(apiKey.scopes.accountId) ?? apiKey.scopes.accountId) : undefined}>
                          {apiKey.scopes.accountId ? (accountLabels.get(apiKey.scopes.accountId) ?? apiKey.scopes.accountId) : 'All accounts'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-48">
                        <span className="block truncate text-text-secondary" title={communityNamesForKey.join(', ') || undefined}>
                          {communityNamesForKey.length > 0
                            ? `${communityNamesForKey.length} ${communityNamesForKey.length === 1 ? 'community' : 'communities'}`
                            : 'All communities'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-wrap gap-1">
                          <ScopeChip>{apiKey.scopes.canSendMessages ? 'Send' : 'No send'}</ScopeChip>
                          <ScopeChip>{apiKey.scopes.canReceiveMessages ? 'Receive' : 'No receive'}</ScopeChip>
                          <ScopeChip>{apiKey.scopes.canPublishListings ? 'Publish' : 'No publish'}</ScopeChip>
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-text-secondary">
                        {formatDateTime(apiKey.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-text-secondary">
                        {formatDateTime(apiKey.lastUsedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dropdown
                          aria-label={`${apiKey.name} key actions`}
                          items={[
                            {
                              id: 'revoke',
                              label: 'Revoke',
                              icon: <TrashIcon aria-hidden="true" className="size-4" />,
                              danger: true,
                              onSelect: () => void revoke(apiKey.id)
                            }
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </table>
          </Table>
        )}
        {keys === null && (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
            Loading keys…
          </p>
        )}
        {keys !== null && keys.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
            No API keys yet — create one above.
          </p>
        )}
      </div>
    </div>
  )
}
