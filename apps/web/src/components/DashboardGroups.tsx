import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Check, LayoutGrid, LogOut, Plus, Table2, X } from 'lucide-react'
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
  useSquircleClip
} from '@listeningkit/ui'
import { SOCIAL_ICONS, SocialBadge, SocialGlyph, type SocialIcon } from '@/lib/social-icons'
import {
  acceptCommunity,
  getCommunities,
  joinCommunity,
  leaveCommunity,
  type Community
} from '@/lib/communities'
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
  onCancel: (community: Community) => void
}

/**
 * Blue community card — same card language as `KeywordCard` in
 * DashboardKeywords: brand-blue squircle, platform glyph left, identity
 * middle, metric + status + row actions right. One component covers all
 * three join states; the dropdown owns Join / Leave / Simulate acceptance
 * / Cancel request via `communityActions`.
 */
function CommunityCard({
  community,
  busy,
  handlers
}: {
  community: Community
  busy: boolean
  handlers: CommunityHandlers
}) {
  const clip = useSquircleClip<HTMLDivElement>(20)
  const icon = SOCIAL_ICONS.find((i) => i.id === community.platform) as SocialIcon | undefined
  const pending = community.joinState === 'pending'

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
        {pending ? (
          <span className="truncate text-sm text-white/75">
            Request sent — waiting on the group to accept
            {community.accountLabel ? ` · ${community.accountLabel}` : ''}
            {community.answers.length > 0
              ? ` · ${community.answers.length} answer${community.answers.length === 1 ? '' : 's'} sent`
              : ''}
          </span>
        ) : (
          <span className="truncate text-sm text-white/75" title={community.description}>{community.description}</span>
        )}
        {community.joinState === 'accepted' && community.accountLabel ? (
          <span className="truncate text-xs text-white/75">Joined as {community.accountLabel}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-bold tabular-nums text-white">
          {busy
            ? pending
              ? 'Updating…'
              : community.joinState === 'accepted'
                ? 'Leaving…'
                : 'Joining…'
            : community.members}
        </span>
        <span className="flex items-center gap-2">
          <JoinStateBadge community={community} />
          <Dropdown
            aria-label={`${community.name} community actions`}
            items={communityActions(community, handlers)}
            className="text-white hover:text-white"
          />
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
    default:
      return <Badge variant="muted">Not joined</Badge>
  }
}

function communityActions(
  community: Community,
  handlers: CommunityHandlers
) {
  if (community.joinState === 'accepted') {
    return [
      {
        id: 'leave',
        label: 'Leave',
        icon: <LogOut aria-hidden="true" className="size-4" />,
        danger: true,
        onSelect: () => handlers.onLeave(community)
      }
    ]
  }
  if (community.joinState === 'pending') {
    return [
      {
        id: 'accept',
        label: 'Simulate acceptance',
        icon: <Check aria-hidden="true" className="size-4" />,
        onSelect: () => handlers.onAccept(community)
      },
      {
        id: 'cancel',
        label: 'Cancel request',
        icon: <X aria-hidden="true" className="size-4" />,
        danger: true,
        onSelect: () => handlers.onCancel(community)
      }
    ]
  }
  return [
    {
      id: 'join',
      label: 'Join',
      icon: <Plus aria-hidden="true" className="size-4" />,
      onSelect: () => handlers.onJoin(community)
    }
  ]
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

  const active = SOCIAL_ICONS.find((i) => i.id === platform) ?? SOCIAL_ICONS[0]
  const current = (communities ?? []).filter((c) => c.joinState === 'accepted')
  const pending = (communities ?? []).filter((c) => c.joinState === 'pending')
  const recommended = (communities ?? []).filter((c) => c.joinState === 'none')
  // Flat table order mirrors the card sections: members, then pending,
  // then not joined.
  const all = [...current, ...pending, ...recommended]

  async function handleLeave(community: Community) {
    setBusyId(community.id)
    try {
      setCommunities(await leaveCommunity(community.id))
    } finally {
      setBusyId(null)
    }
  }

  // The group side accepting a request — the mock stands in for the admin
  // until the live client reports real acceptances.
  async function handleAccept(community: Community) {
    setBusyId(community.id)
    try {
      await acceptCommunity(community.id)
      load()
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
  async function handleJoin(community: Community) {
    if (community.platform === 'facebook') {
      setFormScope({ platform: community.platform, communityId: community.id })
      setFormOpen(true)
      return
    }
    setBusyId(community.id)
    try {
      await joinCommunity(community.id)
      load()
    } finally {
      setBusyId(null)
    }
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
                  busy={busyId === c.id}
                  handlers={{
                    onJoin: handleJoin,
                    onLeave: handleLeave,
                    onAccept: handleAccept,
                    onCancel: handleCancelRequest
                  }}
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
                  busy={busyId === c.id}
                  handlers={{
                    onJoin: handleJoin,
                    onLeave: handleLeave,
                    onAccept: handleAccept,
                    onCancel: handleCancelRequest
                  }}
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
                {pending.length > 0
                  ? 'Nothing new to join — the rest are waiting on acceptance above.'
                  : "You're in all of them. Nice."}
              </p>
            ) : (
              recommended.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  busy={busyId === c.id}
                  handlers={{
                    onJoin: handleJoin,
                    onLeave: handleLeave,
                    onAccept: handleAccept,
                    onCancel: handleCancelRequest
                  }}
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
                      <Dropdown
                        aria-label={`${c.name} community actions`}
                        items={communityActions(c, {
                          onJoin: handleJoin,
                          onLeave: handleLeave,
                          onAccept: handleAccept,
                          onCancel: handleCancelRequest
                        })}
                      />
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