import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Check, LayoutGrid, LogOut, Plus, Table2, ThumbsDown, X } from 'lucide-react'
import {
  Badge,
  Button,
  Dropdown,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useSquircleClip,
  useToast
} from '@listeningkit/ui'
import { SOCIAL_ICONS, SocialBadge, SocialGlyph, type SocialIcon } from '@/lib/social-icons'
import {
  acceptCommunity,
  declineCommunity,
  getCommunities,
  joinCommunity,
  leaveCommunity,
  type Community
} from '@/lib/communities'
import { communityActions as machineActions } from '@/lib/communities/machine'
import { describeGate, gateAccount } from '@/lib/account-state'
import { getAccounts, type ConnectionPlatform, type ConnectionRecord } from '@/lib/connections'
import { healthForAccountId } from '@/lib/health'
import { AccountHealthBadge } from './AccountHealthBadge'
import { AccountTooltip } from './AccountTooltip'
import { DashboardGroupsForm } from './DashboardGroupsForm'
import { useDashboardFormSlot } from './DashboardFormSlot'
import { DashboardTab } from './DashboardTab'

function GroupsTab({ icon, active, onClick }: { icon: SocialIcon; active: boolean; onClick: () => void }) {
  return (
    <DashboardTab
      label={icon.label}
      icon={<SocialGlyph icon={icon} className="size-4" />}
      active={active}
      onClick={onClick}
    />
  )
}

type CommunityHandlers = {
  onJoin: (community: Community) => void
  onLeave: (community: Community) => void
  onAccept: (community: Community) => void
  onDecline: (community: Community) => void
  onCancel: (community: Community) => void
}

/**
 * One-line card copy per join state — the poller-observed states
 * (`login-wall`, `unknown`) and the refusal states (`declined`,
 * `removed`) explain themselves instead of falling back to the catalog
 * description, so a row never reads as joined when it isn't.
 */
function communitySubtitle(community: Community): string {
  switch (community.joinState) {
    case 'pending':
      return `Request sent — waiting on the group to accept${community.accountLabel ? ` · ${community.accountLabel}` : ''}${
        community.answers.length > 0
          ? ` · ${community.answers.length} answer${community.answers.length === 1 ? '' : 's'} sent`
          : ''
      }`
    case 'limited':
      return `Limited member — full posting isn't open yet${community.accountLabel ? ` · ${community.accountLabel}` : ''}`
    case 'declined':
      return 'The group declined the request — update the answers and ask again'
    case 'removed':
      return community.removedBy === 'platform'
        ? "Removed by the group — rejoining is at the group's discretion"
        : 'You left this group — rejoin any time'
    case 'login-wall':
      return 'The last check hit a login wall — reconnect and it will re-observe'
    case 'unknown':
      return "The last check couldn't classify the membership — it will re-observe"
    default:
      return community.description
  }
}

/**
 * Blue community card — same card language as `KeywordCard` in
 * DashboardKeywords: brand-blue squircle, platform glyph left, identity
 * middle, metric + status + row actions right. One component covers all
 * eight join states; the dropdown only offers the moves the machine allows
 * for this row (see `communityMenuItems`), so the menu never offers a move
 * the store would 409.
 */
function CommunityCard({
  community,
  accounts,
  busy,
  handlers
}: {
  community: Community
  accounts: ConnectionRecord[]
  busy: boolean
  handlers: CommunityHandlers
}) {
  const clip = useSquircleClip<HTMLDivElement>(20)
  const icon = SOCIAL_ICONS.find((i) => i.id === community.platform) as SocialIcon | undefined
  const pending = community.joinState === 'pending'
  // The account gate cascades into the row: a terminated or stalled joining
  // account reads as a stale/session note, never as a state rewrite.
  const gate = gateAccount(community.accountId, accounts)
  const gateNote = describeGate(gate, 'This group')
  const items = communityMenuItems(community, accounts, handlers)

  return (
    <div ref={clip.ref} style={clip.style} className="flex items-center gap-4 bg-[#2A8CFF] p-5">
      {icon ? (
        <SocialGlyph icon={icon} className="size-12 shrink-0 text-white" />
      ) : (
        <span className="size-12 rounded-full bg-white/20" aria-hidden="true" />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xl font-bold text-white" title={community.name}>{community.name}</span>
        <span className="truncate text-sm text-white/75" title={`${community.handle} · ${community.members}`}>
          {community.handle} · {community.members}
        </span>
        <span className="truncate text-sm text-white/75" title={communitySubtitle(community)}>
          {communitySubtitle(community)}
        </span>
        {community.joinState === 'accepted' && community.accountLabel ? (
          <span className="truncate text-xs text-white/75">Joined as {community.accountLabel}</span>
        ) : null}
        {gateNote ? (
          <span className="truncate text-xs text-white/75" title={gateNote}>{gateNote}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-bold tabular-nums text-white">
          {busy
            ? pending
              ? 'Updating…'
              : community.joinState === 'accepted' || community.joinState === 'limited'
                ? 'Leaving…'
                : 'Joining…'
            : community.members}
        </span>
        <span className="flex items-center gap-2">
          <JoinStateBadge community={community} />
          {items.length > 0 ? (
            <Dropdown
              aria-label={`${community.name} community actions`}
              items={items}
              className="text-white hover:text-white"
            />
          ) : null}
        </span>
      </span>
    </div>
  )
}

type ViewMode = 'cards' | 'table'

function JoinStateBadge({ community }: { community: Community }) {
  switch (community.joinState) {
    case 'accepted':
      return (
        <Badge variant="success">
          Member
        </Badge>
      )
    case 'pending':
      return <Badge variant="warning">Pending</Badge>
    case 'limited':
      return <Badge variant="info">Limited</Badge>
    case 'declined':
      return <Badge variant="danger">Declined</Badge>
    case 'removed':
      return community.removedBy === 'platform' ? (
        <Badge variant="danger">Removed by group</Badge>
      ) : (
        <Badge variant="muted">Left</Badge>
      )
    case 'login-wall':
      return <Badge variant="warning">Login wall</Badge>
    case 'unknown':
      return <Badge variant="muted">Unclassified</Badge>
    default:
      return <Badge variant="muted">Not joined</Badge>
  }
}

type CommunityMenuItem = {
  id: string
  label: string
  icon: ReactNode
  danger?: boolean
  onSelect: () => void
}

/**
 * The row menu, gated by the same machine that 409s in the store: only the
 * user edges from this row's state (composed with the joining account's
 * issue and the row's removal provenance) appear, so the menu never offers
 * a refused move. Refusals that only the server can see (a race, a stale
 * row) still 409 with the machine reason and surface through the toast.
 * Platform-side simulation (accept / decline) mirrors the mock admin
 * routes; removal stays poller-observed, so it has no menu twin.
 */
function communityMenuItems(
  community: Community,
  accounts: ConnectionRecord[],
  handlers: CommunityHandlers
): CommunityMenuItem[] {
  const accountIssue = community.accountId
    ? (accounts.find((row) => row.id === community.accountId)?.lastIssue ?? undefined)
    : undefined
  const allowed = machineActions(community.joinState, {
    accountIssue,
    removedBy: community.removedBy
  })
  const items: CommunityMenuItem[] = []
  if (community.joinState === 'pending' || community.joinState === 'limited') {
    items.push({
      id: 'accept',
      label: 'Simulate acceptance',
      icon: <Check aria-hidden="true" className="size-4" />,
      onSelect: () => handlers.onAccept(community)
    })
  }
  if (community.joinState === 'pending') {
    items.push({
      id: 'decline',
      label: 'Simulate decline',
      icon: <ThumbsDown aria-hidden="true" className="size-4" />,
      onSelect: () => handlers.onDecline(community)
    })
  }
  if (allowed.withdraw) {
    items.push({
      id: 'cancel',
      label: 'Cancel request',
      icon: <X aria-hidden="true" className="size-4" />,
      danger: true,
      onSelect: () => handlers.onCancel(community)
    })
  }
  if (allowed.leave) {
    items.push({
      id: 'leave',
      label: 'Leave',
      icon: <LogOut aria-hidden="true" className="size-4" />,
      danger: true,
      onSelect: () => handlers.onLeave(community)
    })
  }
  if (allowed.join) {
    items.push({
      id: 'join',
      label: community.joinState === 'none' ? 'Join' : 'Re-join',
      icon: <Plus aria-hidden="true" className="size-4" />,
      onSelect: () => handlers.onJoin(community)
    })
  }
  return items
}

function CommunitySection({
  title,
  sub,
  children
}: {
  title: string
  sub: string
  children: ReactNode
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <p className="text-sm text-text-secondary">{sub}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  )
}

export function DashboardGroups() {
  const [platform, setPlatform] = useState<ConnectionPlatform>(SOCIAL_ICONS[0].id as ConnectionPlatform)
  const [communities, setCommunities] = useState<Community[] | null>(null)
  const [accounts, setAccounts] = useState<ConnectionRecord[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('cards')
  const [formOpen, setFormOpen] = useState(false)
  const [formScope, setFormScope] = useState<{ platform: ConnectionPlatform; communityId: string } | null>(null)

  const load = useCallback(() => {
    getCommunities({ platform })
      .then(setCommunities)
      .catch(() => setCommunities([]))
  }, [platform])

  useEffect(() => {
    setCommunities(null)
    load()
  }, [load])

  // The joining account behind each community — the account badges read
  // their health from this roster, not from the community row itself.
  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(() => setAccounts([]))
  }, [])

  // The form lives in the layout overlay, not in the page: register it
  // when open, clear it when closed or when the page unmounts.
  const setFormSlot = useDashboardFormSlot()
  useEffect(() => {
    if (!formOpen) {
      setFormSlot(null)
      return
    }
    setFormSlot(
      <DashboardGroupsForm
        open
        onClose={() => setFormOpen(false)}
        onJoined={load}
        initialPlatform={formScope?.platform ?? null}
        initialCommunityId={formScope?.communityId ?? null}
      />
    )
    return () => setFormSlot(null)
  }, [formOpen, formScope, load, setFormSlot])

  // Scrim (backdrop) dismiss clears the rendered slot without touching page
  // state — without this reset the selection goes stale and a later click
  // on the same row no-ops.
  useEffect(() => {
    const onExternalDismiss = () => {
      setFormOpen(false)
      setFormScope(null)
    }
    window.addEventListener('lk:form-dismissed', onExternalDismiss)
    return () => window.removeEventListener('lk:form-dismissed', onExternalDismiss)
  }, [])

  const { success, error: notifyError } = useToast()
  const active = SOCIAL_ICONS.find((i) => i.id === platform) ?? SOCIAL_ICONS[0]
  const current = (communities ?? []).filter((c) => c.joinState === 'accepted' || c.joinState === 'limited')
  const pending = (communities ?? []).filter((c) => c.joinState === 'pending')
  const attention = (communities ?? []).filter((c) => c.joinState === 'login-wall' || c.joinState === 'unknown')
  const declined = (communities ?? []).filter((c) => c.joinState === 'declined')
  const removed = (communities ?? []).filter((c) => c.joinState === 'removed')
  const recommended = (communities ?? []).filter((c) => c.joinState === 'none')
  // Flat table order mirrors the card sections: members, then pending,
  // then needs-attention, declined, removed, then not joined.
  const all = [...current, ...pending, ...attention, ...declined, ...removed, ...recommended]

  async function handleLeave(community: Community) {
    setBusyId(community.id)
    try {
      setCommunities(await leaveCommunity(community.id))
      success(
        community.joinState === 'pending'
          ? `Withdrew the request to ${community.name}`
          : `Left ${community.name}`
      )
    } catch (err: unknown) {
      notifyError('Could not leave the community', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  // The group side accepting a request — the mock stands in for the admin
  // until the live client reports real approvals.
  async function handleAccept(community: Community) {
    setBusyId(community.id)
    try {
      await acceptCommunity(community.id)
      success(`${community.name} accepted the request`, 'Member')
      load()
    } catch (err: unknown) {
      notifyError('Could not simulate the acceptance', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  // The group side declining a request — same mock-admin stand-in. The row
  // keeps its answers so the next ask starts from what the admin saw.
  async function handleDecline(community: Community) {
    setBusyId(community.id)
    try {
      await declineCommunity(community.id)
      success(`${community.name} declined the request`, 'Declined')
      load()
    } catch (err: unknown) {
      notifyError('Could not simulate the decline', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  // Cancelling a pending request is the same relation write as leaving.
  async function handleCancelRequest(community: Community) {
    await handleLeave(community)
  }

  // Facebook joins need the connected account that joins, so they open the
  // form pre-scoped to this community; x / reddit go straight to the API.
  // Re-joins ride the same path — the store machines declined and
  // self-removed rows back in and 409s platform-removed ones.
  async function handleJoin(community: Community) {
    if (community.platform === 'facebook') {
      setFormScope({ platform: community.platform, communityId: community.id })
      setFormOpen(true)
      return
    }
    setBusyId(community.id)
    try {
      await joinCommunity(community.id)
      success(community.joinState === 'none' ? `Joined ${community.name}` : `Rejoined ${community.name}`)
      load()
    } catch (err: unknown) {
      notifyError('Could not join the community', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const handlers: CommunityHandlers = {
    onJoin: handleJoin,
    onLeave: handleLeave,
    onAccept: handleAccept,
    onDecline: handleDecline,
    onCancel: handleCancelRequest
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Groups</h1>
          <p className="text-sm text-text-secondary">Pick the communities ListeningKit watches for you.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Card / table view switcher — same segmented shape as the keywords page. */}
          <div className="flex h-9 items-center gap-0.5 rounded-lg border border-black/10 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView('cards')}
              aria-pressed={view === 'cards'}
              className={`flex h-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors ${
                view === 'cards' ? 'bg-[#2A8CFF] text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LayoutGrid className="size-3.5" aria-hidden="true" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
              className={`flex h-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors ${
                view === 'table' ? 'bg-[#2A8CFF] text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Table2 className="size-3.5" aria-hidden="true" />
              Table
            </button>
          </div>
          <Button type="button" variant="blue" size="lg" shadow="hard" onClick={() => { setFormScope(null); setFormOpen(true) }}>
            <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
            Add group
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {SOCIAL_ICONS.map((icon) => (
          <GroupsTab key={icon.id} icon={icon} active={icon.id === platform} onClick={() => setPlatform(icon.id as ConnectionPlatform)} />
        ))}
      </div>
      {communities === null ? (
        <p className="rounded-xl bg-black/5 p-4 text-sm text-text-secondary" aria-busy="true">
          Loading {active.label} communities…
        </p>
      ) : view === 'cards' ? (
        <>
          <CommunitySection
            title="Your current communities"
            sub={`Listening on ${active.label} right now.`}
          >
            {current.length === 0 ? (
              <p className="py-4 text-sm text-text-secondary">
                You haven&apos;t joined any {active.label} communities yet — pick one below.
              </p>
            ) : (
              current.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  accounts={accounts}
                  busy={busyId === c.id}
                  handlers={handlers}
                />
              ))
            )}
          </CommunitySection>
          {pending.length > 0 ? (
            <CommunitySection
              title="Pending acceptance"
              sub="Join requests waiting on the group — they move up once accepted."
            >
              {pending.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  accounts={accounts}
                  busy={busyId === c.id}
                  handlers={handlers}
                />
              ))}
            </CommunitySection>
          ) : null}
          {attention.length > 0 ? (
            <CommunitySection
              title="Needs attention"
              sub="The last check couldn't confirm these memberships — reconnect the account and they'll re-observe."
            >
              {attention.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  accounts={accounts}
                  busy={busyId === c.id}
                  handlers={handlers}
                />
              ))}
            </CommunitySection>
          ) : null}
          {declined.length > 0 ? (
            <CommunitySection
              title="Declined requests"
              sub="The group turned these down — fix the answers and ask again."
            >
              {declined.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  accounts={accounts}
                  busy={busyId === c.id}
                  handlers={handlers}
                />
              ))}
            </CommunitySection>
          ) : null}
          {removed.length > 0 ? (
            <CommunitySection
              title="Left or removed"
              sub="Past memberships — the ones you left rejoin freely; group removals are at the group's discretion."
            >
              {removed.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  accounts={accounts}
                  busy={busyId === c.id}
                  handlers={handlers}
                />
              ))}
            </CommunitySection>
          ) : null}
          <CommunitySection
            title="Recommended communities"
            sub={`Popular ${active.label} spots your customers hang out.`}
          >
            {recommended.length === 0 ? (
              <p className="py-4 text-sm text-text-secondary">
                {pending.length + attention.length + declined.length + removed.length > 0
                  ? 'Nothing new to join — the rest are listed above.'
                  : "You're in all of them. Nice."}
              </p>
            ) : (
              recommended.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  accounts={accounts}
                  busy={busyId === c.id}
                  handlers={handlers}
                />
              ))
            )}
          </CommunitySection>
        </>
      ) : all.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
          No {active.label} communities tracked yet.
        </p>
      ) : (
        <Table>
          <table className="w-full min-w-[840px] text-left">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Community</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {all.map((c) => {
                const health = healthForAccountId(accounts, c.accountId)
                const icon = SOCIAL_ICONS.find((i) => i.id === c.platform)
                const items = communityMenuItems(c, accounts, handlers)
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {icon ? (
                          <SocialBadge icon={icon} variant="blue" />
                        ) : (
                          <span className="size-8 rounded-full bg-black/5" aria-hidden="true" />
                        )}
                        <span className="min-w-0">
                          {c.url ? (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              title={`Open ${c.name} in a new tab`}
                              className="block max-w-48 truncate font-semibold text-[#2A8CFF] underline decoration-dashed decoration-[#2A8CFF]/50 underline-offset-2 hover:decoration-[#2A8CFF]"
                            >
                              {c.name}
                            </a>
                          ) : (
                            <span className="block max-w-48 truncate font-semibold" title={c.name}>
                              {c.name}
                            </span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <JoinStateBadge community={c} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {!c.accountLabel ? (
                        <span className="text-text-secondary">—</span>
                      ) : (
                        <AccountTooltip
                          label={c.accountLabel}
                          health={health}
                          badge={
                            health ? (
                              <AccountHealthBadge label={c.accountLabel} health={health} />
                            ) : (
                              <Badge variant="neutral">{c.accountLabel}</Badge>
                            )
                          }
                        >
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-white/80">
                            {c.url ? (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#2A8CFF] underline decoration-dashed decoration-[#2A8CFF]/50 underline-offset-2 hover:decoration-[#2A8CFF]"
                              >
                                {c.name}
                              </a>
                            ) : (
                              <span>{c.name}</span>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{c.members}</span>
                          </span>
                        </AccountTooltip>
                      )}
                    </TableCell>
                  <TableCell className="text-right tabular-nums">{c.members}</TableCell>
                    <TableCell className="text-right">
                      {items.length > 0 ? (
                        <Dropdown
                          aria-label={`${c.name} community actions`}
                          items={items}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </table>
        </Table>
      )}
    </div>
  )
}