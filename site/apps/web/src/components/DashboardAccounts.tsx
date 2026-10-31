import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Cable, Globe, Plus, Settings, ShieldCheck, Trash, Unplug } from 'lucide-react'
import {
  Dropdown,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast
} from '@listeningkit/ui'
import {
  createAccount,
  deleteAccount,
  disconnectAccount,
  getAccounts,
  platformLabel,
  resolveChallenge,
  type ConnectionPlatform,
  type ConnectionRecord
} from '../lib/connections'
import { CHALLENGE_RESOLVABLE_ISSUES } from '../lib/account-issues'
import { SocialBadge, SOCIAL_ICONS } from '../lib/social-icons'
import { AccountStatusBadge } from './AccountStatus'
import { useDashboardFormSlot } from './DashboardFormSlot'
import { ChallengeResolver } from './Modals/ChallengeResolver'

const PLATFORMS: ConnectionPlatform[] = ['facebook', 'x', 'reddit']

function socialIconFor(platform: ConnectionPlatform) {
  return SOCIAL_ICONS.find((icon) => icon.id === platform)
}

function platformGlyph(platform: ConnectionPlatform) {
  const icon = socialIconFor(platform)
  return icon ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  ) : undefined
}

function formatConnectedAt(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function DashboardAccounts() {
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error: notifyError } = useToast()
  const [accounts, setAccounts] = useState<ConnectionRecord[] | null>(null)
  const [filter, setFilter] = useState('all')
  const [issueFilter, setIssueFilter] = useState('all')
  const [resolverAccount, setResolverAccount] = useState<ConnectionRecord | null>(null)
  const setFormSlot = useDashboardFormSlot()

  const load = () =>
    getAccounts().then(setAccounts).catch(() => setAccounts([]))

  // Fetch through the connections API on mount and whenever we come back
  // to this page (e.g. from the Settings tab after editing connections).
  useEffect(() => {
    load()
  }, [location])

  // The challenge resolver docks in the dashboard form slot at double width
  // — register it when an account is picked, clear it on close or unmount.
  useEffect(() => {
    if (!resolverAccount) {
      setFormSlot(null)
      return
    }
    const target = resolverAccount
    setFormSlot(
      <ChallengeResolver
        account={target}
        onClose={() => setResolverAccount(null)}
        onResolve={async () => {
          try {
            setAccounts(await resolveChallenge(target.id))
            success(`Challenge cleared — ${target.label} is listening again`)
            setResolverAccount(null)
          } catch (err: unknown) {
            notifyError('Resolve failed', err instanceof Error ? err.message : 'Could not clear the challenge.')
          }
        }}
      />,
      { slots: 2 }
    )
    return () => setFormSlot(null)
  }, [resolverAccount, setFormSlot, success, notifyError])

  // Scrim (backdrop) dismiss clears the rendered slot without touching page
  // state — without this reset the pick goes stale and reopening the same
  // row no-ops.
  useEffect(() => {
    const onExternalDismiss = () => setResolverAccount(null)
    window.addEventListener('lk:form-dismissed', onExternalDismiss)
    return () => window.removeEventListener('lk:form-dismissed', onExternalDismiss)
  }, [])

  const rows = (accounts ?? []).filter((account) => {
    const platformOk = filter === 'all' || filter === account.platform
    const challengeOk =
      issueFilter === 'all' ||
      (issueFilter === 'challenge' &&
        account.lastIssue != null &&
        CHALLENGE_RESOLVABLE_ISSUES.has(account.lastIssue))
    return platformOk && challengeOk
  })

  async function handleDisconnect(account: ConnectionRecord) {
    try {
      setAccounts(await disconnectAccount(account.id))
      success(`${account.label} disconnected`)
    } catch (err: unknown) {
      notifyError('Disconnect failed', err instanceof Error ? err.message : 'Could not disconnect.')
    }
  }

  async function handleDelete(account: ConnectionRecord) {
    try {
      setAccounts(await deleteAccount(account.id))
      success(`“${account.label}” deleted`)
    } catch (err: unknown) {
      notifyError('Delete failed', err instanceof Error ? err.message : 'Could not delete the account.')
    }
  }

  async function handleAddAccount(platform: ConnectionPlatform) {
    try {
      const record = await createAccount(platform)
      setAccounts((prev) => [...(prev ?? []), record])
      success(`${platformLabel(platform)} account added`)
      navigate('/dashboard/settings')
    } catch (err: unknown) {
      notifyError('Add account failed', err instanceof Error ? err.message : 'Could not add an account.')
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Accounts</h1>
          <p className="text-sm text-text-secondary">
            {accounts === null
              ? 'Loading accounts…'
              : 'Social accounts and proxies ListeningKit reads from. Click a row for its full state.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            matchWidth
            value={filter}
            onChange={setFilter}
            aria-label="Filter platforms"
            options={[
              { value: 'all', label: 'All platforms', icon: <Globe className="size-3.5" strokeWidth={2.25} /> },
              ...PLATFORMS.map((platform) => ({
                value: platform,
                label: platformLabel(platform),
                icon: platformGlyph(platform)
              }))
            ]}
          />
          <Select
            matchWidth
            value={issueFilter}
            onChange={setIssueFilter}
            aria-label="Filter by issue"
            options={[
              { value: 'all', label: 'All statuses', icon: <Globe className="size-3.5" strokeWidth={2.25} /> },
              { value: 'challenge', label: 'Needs challenge', icon: <ShieldCheck className="size-3.5" strokeWidth={2.25} /> }
            ]}
          />
          <Select
            matchWidth
            value=""
            onChange={(value) => {
              if (value) handleAddAccount(value as ConnectionPlatform)
            }}
            aria-label="Add account"
            icon={<Plus aria-hidden="true" className="size-3.5" strokeWidth={2.25} />}
            placeholder="Add account"
            options={PLATFORMS.map((platform) => ({
              value: platform,
              label: platformLabel(platform),
              icon: platformGlyph(platform)
            }))}
          />
        </div>
      </div>

      {rows.length > 0 && (
        <Table>
          <table className="w-full text-left">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connected</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((account) => {
                const icon = socialIconFor(account.platform)
                // Only accounts stuck behind a human-verification wall offer
                // the resolver — every other row keeps the current menu.
                const canResolve =
                  account.lastIssue != null && CHALLENGE_RESOLVABLE_ISSUES.has(account.lastIssue)
                return (
                  <TableRow
                    key={account.id}
                    onClick={() => navigate(`/dashboard/accounts/${account.id}`)}
                    className="cursor-pointer hover:bg-black/[0.025]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {icon ? (
                          <SocialBadge icon={icon} variant="blue" />
                        ) : (
                          <span className="size-8 rounded-full bg-black/5" aria-hidden="true" />
                        )}
                        <span className="font-semibold">{account.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AccountStatusBadge account={account} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-text-secondary">
                      {formatConnectedAt(account.connectedAt)}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Dropdown
                        aria-label={`${account.label} account actions`}
                        items={
                          account.connectedAt
                            ? [
                                {
                                  id: 'settings',
                                  label: 'Open in Settings',
                                  icon: <Settings aria-hidden="true" className="size-4" />,
                                  onSelect: () => navigate('/dashboard/settings')
                                },
                                ...(canResolve
                                  ? [
                                      {
                                        id: 'resolve',
                                        label: 'Resolve challenge',
                                        icon: <ShieldCheck aria-hidden="true" className="size-4" />,
                                        onSelect: () => setResolverAccount(account)
                                      }
                                    ]
                                  : []),
                                {
                                  id: 'disconnect',
                                  label: 'Disconnect',
                                  icon: <Unplug aria-hidden="true" className="size-4" />,
                                  danger: true,
                                  onSelect: () => handleDisconnect(account)
                                },
                                {
                                  id: 'delete',
                                  label: 'Delete',
                                  icon: <Trash aria-hidden="true" className="size-4" />,
                                  danger: true,
                                  onSelect: () => handleDelete(account)
                                }
                              ]
                            : [
                                {
                                  id: 'connect',
                                  label: 'Connect',
                                  icon: <Cable aria-hidden="true" className="size-4" />,
                                  onSelect: () => navigate('/dashboard/settings')
                                },
                                {
                                  id: 'settings',
                                  label: 'Open in Settings',
                                  icon: <Settings aria-hidden="true" className="size-4" />,
                                  onSelect: () => navigate('/dashboard/settings')
                                },
                                {
                                  id: 'delete',
                                  label: 'Delete',
                                  icon: <Trash aria-hidden="true" className="size-4" />,
                                  danger: true,
                                  onSelect: () => handleDelete(account)
                                }
                              ]
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </table>
        </Table>
      )}

      {accounts !== null && rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
          {accounts.length === 0
            ? 'No accounts yet — add one to start listening.'
            : issueFilter === 'challenge'
              ? `No accounts need a challenge${filter === 'all' ? '' : ` on ${platformLabel(filter as ConnectionPlatform)}`} — try a different filter.`
              : `No ${filter === 'all' ? '' : platformLabel(filter as ConnectionPlatform) + ' '}accounts yet.`}
        </p>
      )}

    </div>
  )
}