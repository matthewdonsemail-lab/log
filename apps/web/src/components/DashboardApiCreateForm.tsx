import { useEffect, useState } from 'react'
import { Check, Copy, Inbox, Send, Tag } from 'lucide-react'
import { useToast } from '@listeningkit/ui'
import { createApiKey, type ApiKeyScope, type CreatedApiKeyResponse } from '../lib/api'
import { getAccounts, platformLabel, type ConnectionRecord } from '../lib/connections'
import { getCommunities, type Community } from '../lib/communities'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'
import { DashboardFormSheet } from './DashboardFormSheet'

const STEP_HINTS = [
  'Name the key for where it will live',
  'Which account may it act as?',
  'Which communities may it touch?',
  'What may it do?',
  'Copy it now — this is the only time it appears',
]

function SelectRow({
  selected,
  onSelect,
  title,
  detail,
  leading,
}: {
  selected: boolean
  onSelect: () => void
  title: React.ReactNode
  detail?: React.ReactNode
  leading?: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${
        selected
          ? 'border-[#2A8CFF] bg-[#EAF3FF]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-bold ${selected ? 'text-[#0B3E91]' : 'text-slate-800'}`}>
          {title}
        </span>
        {detail ? <span className="block truncate text-xs text-slate-500">{detail}</span> : null}
      </span>
      <span
        aria-hidden="true"
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? 'border-[#2A8CFF] bg-[#2A8CFF]' : 'border-slate-300 bg-transparent'
        }`}
      >
        {selected ? <Check aria-hidden="true" className="size-3.5 text-white" /> : null}
      </span>
    </button>
  )
}

/**
 * Scoped API key creation in the dashboard form slot. Four gated steps —
 * name, account scope, community scope, message + listing permissions — then the key is
 * minted and its secret shows exactly once: closing or finishing the form
 * drops it, and no route will ever hand it out again. Selection only ever
 * marks; the sheet's Continue button is the only thing that advances.
 */
export function DashboardApiCreateForm({
  onClose,
  onCreated,
}: {
  onClose: () => void
  /** Reload the key list after a successful create. */
  onCreated: () => void
}) {
  const { success: notifySuccess, error: notifyError } = useToast()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [accountMode, setAccountMode] = useState<'all' | 'one'>('all')
  const [accountId, setAccountId] = useState<string | null>(null)
  const [communityMode, setCommunityMode] = useState<'all' | 'some'>('all')
  const [communityIds, setCommunityIds] = useState<string[]>([])
  const [canSend, setCanSend] = useState(true)
  const [canReceive, setCanReceive] = useState(true)
  const [canPublish, setCanPublish] = useState(true)
  const [accounts, setAccounts] = useState<ConnectionRecord[] | null>(null)
  const [communities, setCommunities] = useState<Community[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<CreatedApiKeyResponse | null>(null)

  const loaded = accounts !== null && communities !== null

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

  function toggleCommunity(id: string) {
    setCommunityIds((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]))
  }

  async function create() {
    const trimmed = name.trim()
    if (!trimmed || creating) return
    setCreating(true)
    try {
      const scopes: ApiKeyScope = {
        accountId: accountMode === 'one' ? accountId : null,
        communityIds: communityMode === 'some' ? communityIds : [],
        canSendMessages: canSend,
        canReceiveMessages: canReceive,
        canPublishListings: canPublish,
      }
      const result = await createApiKey({ name: trimmed, scopes })
      setCreated(result)
      onCreated()
      setStep(5)
    } catch (err: unknown) {
      notifyError('Create failed', err instanceof Error ? err.message : 'Could not create the key.')
    } finally {
      setCreating(false)
    }
  }

  async function copySecret() {
    if (!created) return
    try {
      await navigator.clipboard.writeText(created.key)
      notifySuccess('Key copied', 'It will never be shown again.')
    } catch {
      notifyError('Copy failed', 'Could not reach the clipboard in this browser.')
    }
  }

  const accountGlyph = (platform: ConnectionRecord['platform']) => {
    const icon = SOCIAL_ICONS.find((row) => row.id === platform)
    return icon ? <SocialGlyph icon={icon} className="size-6 shrink-0 text-[#2A8CFF]" /> : null
  }
  const communityGlyph = (platform: Community['platform']) => {
    const icon = SOCIAL_ICONS.find((row) => row.id === platform)
    return icon ? <SocialGlyph icon={icon} className="size-6 shrink-0 text-[#2A8CFF]" /> : null
  }

  return (
    <DashboardFormSheet
      open
      title="New API key"
      subtitle="Scoped to exactly what it may touch"
      step={step}
      stepCount={5}
      stepHint={STEP_HINTS[step - 1]}
      confirmLabel={step === 5 ? 'Done' : step === 4 ? 'Create key' : 'Continue'}
      confirmDisabled={
        creating ||
        (step === 1 && !name.trim()) ||
        (step === 2 && (!loaded || (accountMode === 'one' && !accountId))) ||
        ((step === 2 || step === 3) && !loaded)
      }
      busy={creating}
      onConfirm={() => {
        if (step === 5) {
          onClose()
          return
        }
        if (step === 4) {
          void create()
          return
        }
        setStep((prev) => Math.min(prev + 1, 5))
      }}
      onBack={step > 1 && step < 5 ? () => setStep((prev) => prev - 1) : undefined}
      backDisabled={step <= 1}
      onClose={onClose}
    >
      {step === 1 ? (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Key name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Production"
            autoComplete="off"
            autoFocus
            className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#2a8cff] focus:outline-none"
          />
        </label>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-1.5">
          <SelectRow
            selected={accountMode === 'all'}
            onSelect={() => setAccountMode('all')}
            title="All accounts"
            detail="The key acts as any connected account"
          />
          {(accounts ?? []).map((account) => (
            <SelectRow
              key={account.id}
              selected={accountMode === 'one' && accountId === account.id}
              onSelect={() => {
                setAccountMode('one')
                setAccountId(account.id)
              }}
              leading={accountGlyph(account.platform)}
              title={account.label}
              detail={platformLabel(account.platform)}
            />
          ))}
          {accounts !== null && accounts.length === 0 ? (
            <p className="px-1 text-xs text-slate-500">No connected accounts — the key will cover all of them once added.</p>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-1.5">
          <SelectRow
            selected={communityMode === 'all'}
            onSelect={() => setCommunityMode('all')}
            title="All communities"
            detail="The key may touch every joined community"
          />
          {(communities ?? []).map((community) => (
            <SelectRow
              key={community.id}
              selected={communityMode === 'some' && communityIds.includes(community.id)}
              onSelect={() => {
                setCommunityMode('some')
                toggleCommunity(community.id)
              }}
              leading={communityGlyph(community.platform)}
              title={community.name}
              detail={community.joinState === 'accepted' ? community.members : `Not joined · ${community.members}`}
            />
          ))}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="flex flex-col gap-1.5">
          <SelectRow
            selected={canSend}
            onSelect={() => setCanSend((prev) => !prev)}
            leading={<Send aria-hidden="true" className="size-6 shrink-0 text-[#2A8CFF]" />}
            title="Send messages"
            detail="Post and reply through the platform clients"
          />
          <SelectRow
            selected={canReceive}
            onSelect={() => setCanReceive((prev) => !prev)}
            leading={<Inbox aria-hidden="true" className="size-6 shrink-0 text-[#2A8CFF]" />}
            title="Receive messages"
            detail="Read threads, signals and mentions back"
          />
          <SelectRow
            selected={canPublish}
            onSelect={() => setCanPublish((prev) => !prev)}
            leading={<Tag aria-hidden="true" className="size-6 shrink-0 text-[#2A8CFF]" />}
            title="Publish listings"
            detail="Create, edit status, and delete marketplace listings"
          />
        </div>
      ) : null}

      {step === 5 && created ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-slate-700">
            Copy it now — this is the only time the full secret is shown. Closing this form erases it for good.
          </p>
          <p className="break-all rounded-xl bg-black/[0.04] p-4 text-sm text-text-primary">
            {created.key}
          </p>
          <button
            type="button"
            onClick={() => void copySecret()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2A8CFF] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1E66C9]"
          >
            <Copy aria-hidden="true" className="size-4" />
            Copy key
          </button>
        </div>
      ) : null}
    </DashboardFormSheet>
  )
}
