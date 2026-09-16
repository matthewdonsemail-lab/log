import { useEffect, useState } from 'react'
import { Check, Globe, Inbox, Send, Tag, Users, X } from 'lucide-react'
import type { ApiKeyScope } from '../lib/api'
import { getAccounts, platformLabel, type ConnectionRecord } from '../lib/connections'
import { getCommunities, type Community } from '../lib/communities'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'

/**
 * Read-only scope visuals that reuse the key-creation form's visual language:
 * platform logos for named accounts/groups, Globe/Users for the "All" rows,
 * Send/Inbox for the message bits — so a key's scopes read the same way here
 * as they did when the key was first made. Creation-scoped state renders as
 * its checked row; `off` renders the neutral un-checked row; `flagged` is the
 * denial treatment for the inspect sheet (the dimension that stopped a call).
 */

export interface ScopeDirectory {
  accounts: ConnectionRecord[]
  communities: Community[]
  loaded: boolean
}

/** Shared account/community lookup — one load, same pattern as the create form. */
export function useScopeDirectory(): ScopeDirectory {
  const [accounts, setAccounts] = useState<ConnectionRecord[] | null>(null)
  const [communities, setCommunities] = useState<Community[] | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getAccounts(), getCommunities()])
      .then(([accountList, communityList]) => {
        if (cancelled) return
        setAccounts(accountList)
        setCommunities(communityList)
      })
      .catch(() => {
        if (cancelled) return
        setAccounts([])
        setCommunities([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return {
    accounts: accounts ?? [],
    communities: communities ?? [],
    loaded: accounts !== null && communities !== null,
  }
}

export type ScopeRowTone = 'on' | 'off' | 'flagged'

const SHELL: Record<ScopeRowTone, string> = {
  on: 'border-[#2A8CFF] bg-[#EAF3FF]',
  off: 'border-slate-200 bg-white',
  flagged: 'border-red-300 bg-red-50',
}

const TITLE: Record<ScopeRowTone, string> = {
  on: 'text-[#0B3E91]',
  off: 'text-slate-500',
  flagged: 'text-red-700',
}

const DETAIL: Record<ScopeRowTone, string> = {
  on: 'text-slate-500',
  off: 'text-slate-400',
  flagged: 'text-red-600',
}

function LeadingBox({ tone, children }: { tone: ScopeRowTone; children: React.ReactNode }) {
  return (
    <span aria-hidden="true" className="shrink-0">
      <span className={tone === 'on' ? 'text-[#2A8CFF]' : tone === 'flagged' ? 'text-red-500' : 'text-slate-400'}>
        {children}
      </span>
    </span>
  )
}

const CIRCLE: Record<ScopeRowTone, string> = {
  on: 'border-[#2A8CFF] bg-[#2A8CFF]',
  off: 'border-slate-300 bg-transparent',
  flagged: 'border-red-500 bg-red-500',
}

export function ScopeVisual({
  tone = 'on',
  leading,
  title,
  detail,
}: {
  tone?: ScopeRowTone
  leading?: React.ReactNode
  title: React.ReactNode
  detail?: React.ReactNode
}) {
  return (
    <div className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 ${SHELL[tone]}`}>
      {leading ? <LeadingBox tone={tone}>{leading}</LeadingBox> : null}
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-bold ${TITLE[tone]}`}>{title}</span>
        {detail ? <span className={`block truncate text-xs ${DETAIL[tone]}`}>{detail}</span> : null}
      </span>
      <span
        aria-hidden="true"
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${CIRCLE[tone]}`}
      >
        {tone === 'on' ? (
          <Check aria-hidden="true" className="size-3.5 text-white" />
        ) : tone === 'flagged' ? (
          <X aria-hidden="true" className="size-3.5 text-white" />
        ) : null}
      </span>
    </div>
  )
}

function glyphFor(platform: ConnectionRecord['platform'] | Community['platform']) {
  const icon = SOCIAL_ICONS.find((row) => row.id === platform)
  return icon ? <SocialGlyph icon={icon} className="size-6 shrink-0" /> : null
}

/**
 * The account dimension as chosen rows — "All accounts" or the one named
 * account with its platform logo. Falls back to the raw id when the account
 * is no longer connected (and "Resolving…" while the directory loads).
 */
export function AccountScopeVisuals({ scope, tone = 'on' }: { scope: ApiKeyScope; tone?: ScopeRowTone }) {
  const { accounts, loaded } = useScopeDirectory()
  const accountById = new Map(accounts.map((account) => [account.id, account]))
  const account = scope.accountId ? accountById.get(scope.accountId) : undefined

  if (scope.accountId === null) {
    return (
      <ScopeVisual
        tone={tone}
        leading={<Globe className="size-6" />}
        title="All accounts"
        detail="The key acts as any connected account"
      />
    )
  }

  return (
    <ScopeVisual
      tone={tone}
      leading={account ? glyphFor(account.platform) : null}
      title={account ? account.label : loaded ? scope.accountId : 'Resolving…'}
      detail={account ? platformLabel(account.platform) : 'Account no longer connected'}
    />
  )
}

/** Each named community as its own row with logo and join state (create-form logic). */
export function NamedCommunityRows({ communityIds }: { communityIds: string[] }) {
  const { communities, loaded } = useScopeDirectory()
  const communityById = new Map(communities.map((community) => [community.id, community]))

  return (
    <div className="flex flex-col gap-1.5">
      {communityIds.map((communityId) => {
        const community = communityById.get(communityId)
        return (
          <ScopeVisual
            key={communityId}
            leading={community ? glyphFor(community.platform) : null}
            title={community ? community.name : loaded ? communityId : 'Resolving…'}
            detail={
              community
                ? community.joinState === 'accepted'
                  ? community.members
                  : `Not joined · ${community.members}`
                : 'Community no longer joined'
            }
          />
        )
      })}
    </div>
  )
}

/**
 * The community dimension as chosen rows — "All communities" or each named
 * community with its platform logo, name, and join state (create-form
 * logic). Each selected community gets its own row; stale ids render with a
 * fallback. The tone applies to the "All communities" row — named
 * communities are valid scopes, so they render as their checked rows.
 */
export function CommunityScopeVisuals({ scope, tone = 'on' }: { scope: ApiKeyScope; tone?: ScopeRowTone }) {
  if (scope.communityIds.length === 0) {
    return (
      <ScopeVisual
        tone={tone}
        leading={<Users className="size-6" />}
        title="All communities"
        detail="The key may touch every joined community"
      />
    )
  }
  return <NamedCommunityRows communityIds={scope.communityIds} />
}

/**
 * The message bits — Send / Receive rows in their on or off state. With
 * `flagged` set, the named bit takes the denial treatment and the other
 * renders its own state — the sheet uses it to mark the exact bit that
 * stopped a call.
 */
export function MessageScopeVisuals({
  scope,
  flagged = null,
}: {
  scope: ApiKeyScope
  flagged?: 'send' | 'receive' | null
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <ScopeVisual
        tone={flagged === 'send' ? 'flagged' : scope.canSendMessages ? 'on' : 'off'}
        leading={<Send className="size-6" />}
        title="Send messages"
        detail={scope.canSendMessages ? 'Post and reply through the platform clients' : 'Not allowed'}
      />
      <ScopeVisual
        tone={flagged === 'receive' ? 'flagged' : scope.canReceiveMessages ? 'on' : 'off'}
        leading={<Inbox className="size-6" />}
        title="Receive messages"
        detail={scope.canReceiveMessages ? 'Read threads, signals and mentions back' : 'Not allowed'}
      />
    </div>
  )
}

/**
 * The marketplace bit — Publish row in its on or off state, with the same
 * denial treatment when a listings write was stopped for it.
 */
export function ListingScopeVisuals({
  scope,
  flagged = false,
}: {
  scope: ApiKeyScope
  flagged?: boolean
}) {
  return (
    <ScopeVisual
      tone={flagged ? 'flagged' : scope.canPublishListings ? 'on' : 'off'}
      leading={<Tag className="size-6" />}
      title="Publish listings"
      detail={scope.canPublishListings ? 'Create, edit status, and delete marketplace listings' : 'Not allowed'}
    />
  )
}