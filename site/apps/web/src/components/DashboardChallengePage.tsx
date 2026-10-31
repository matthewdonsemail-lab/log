import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge, useToast } from '@listeningkit/ui'
import { getAccounts, platformLabel, resolveChallenge, type ConnectionRecord } from '../lib/connections'
import { CHALLENGE_RESOLVABLE_ISSUES, ISSUE_CATALOG } from '../lib/account-issues'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'
import { AccountStatusBadge } from './AccountStatus'
import { useDashboardFormSlot } from './DashboardFormSlot'
import { ChallengeResolver } from './Modals/ChallengeResolver'

/**
 * Dedicated resolver route (`/dashboard/accounts/:accountId/challenge`).
 * Deep-linkable entry, but the resolver itself is NOT an inline page — it
 * docks in the layout's form slot (`{ slots: 2 }` wide overlay, right side),
 * exactly like the Accounts table flow. This page renders the account
 * context behind the overlay and owns the slot registration: open on mount,
 * close (navigate back) on confirm, Cancel, Escape, or scrim dismiss.
 *
 * The account id is the only segment, so the page survives even when the
 * account has no threads (the `x/x-challenge` empty-inbox case). Callers
 * pass `state: { from }` to return where they came from (the Messages gate
 * links here); otherwise back goes to the account page.
 */
export function DashboardChallengePage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error: notifyError } = useToast()
  const [account, setAccount] = useState<ConnectionRecord | null | undefined>(undefined)
  const setFormSlot = useDashboardFormSlot()
  const slotOwned = useRef(false)

  useEffect(() => {
    let cancelled = false
    getAccounts()
      .then((list) => {
        if (!cancelled) setAccount(list.find((row) => row.id === accountId) ?? null)
      })
      .catch(() => {
        if (!cancelled) setAccount(null)
      })
    return () => {
      cancelled = true
    }
  }, [accountId])

  const stateFrom = (location.state as { from?: unknown } | null)?.from
  const from = typeof stateFrom === 'string' && stateFrom.startsWith('/') ? stateFrom : null
  const back = from ?? (account ? `/dashboard/accounts/${account.id}` : '/dashboard/accounts')
  const goBack = useCallback(() => navigate(back), [navigate, back])

  const issue = account?.lastIssue ?? null
  const resolvable = issue != null && CHALLENGE_RESOLVABLE_ISSUES.has(issue)
  const entry = issue ? ISSUE_CATALOG[issue] : null
  const platformIcon = account ? SOCIAL_ICONS.find((icon) => icon.id === account.platform) : undefined

  // The resolver lives in the layout's form slot — register on mount once
  // the account is known-resolvable, release on unmount. Pages own their
  // open-state, so this never fights another page's slot content: this
  // route renders no other slot user.
  useEffect(() => {
    if (!resolvable || !account) return
    const target = account
    slotOwned.current = true
    setFormSlot(
      <ChallengeResolver
        account={target}
        onClose={goBack}
        onResolve={async () => {
          try {
            await resolveChallenge(target.id)
            success(`Challenge cleared — ${target.label} is listening again`)
            navigate(back, { replace: true })
          } catch (err: unknown) {
            notifyError('Resolve failed', err instanceof Error ? err.message : 'Could not clear the challenge.')
          }
        }}
      />,
      { slots: 2 }
    )
    return () => {
      slotOwned.current = false
      setFormSlot(null)
    }
  }, [resolvable, account, setFormSlot, goBack, navigate, back, success, notifyError])

  // Scrim (backdrop) dismiss clears the rendered slot without touching page
  // state — leaving here would strand a slot-less page, so go back instead.
  useEffect(() => {
    const onExternalDismiss = () => {
      if (slotOwned.current) goBack()
    }
    window.addEventListener('lk:form-dismissed', onExternalDismiss)
    return () => window.removeEventListener('lk:form-dismissed', onExternalDismiss)
  }, [goBack])

  if (account === undefined) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-black/5" />
        <div className="h-16 animate-pulse rounded-xl bg-black/5" />
      </div>
    )
  }

  if (account === null) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <BackLink to="/dashboard/accounts" label="Back to accounts" />
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
          Account not found — it may have been deleted. Pick an account from the roster instead.
        </p>
      </div>
    )
  }

  if (!resolvable) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <BackLink to={back} label={from ? 'Back' : 'Back to account'} />
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <h1 className="text-lg font-bold text-text-primary">No pending challenge</h1>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {entry
              ? `${account.label} currently reports “${entry.label}” — ${entry.detail[account.platform]} That state needs a different action, not the challenge resolver.`
              : `${account.label} has no recorded issue, so there is nothing to resolve.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/dashboard/accounts/${account.id}`}
              className="rounded-xl bg-[#2A8CFF] px-4 py-2 text-sm font-bold text-white"
            >
              Open account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <BackLink to={back} label={from ? 'Back' : 'Back to account'} />
      <div>
        <h1 className="text-xl font-bold text-text-primary">Resolve challenge</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {platformIcon ? (
            <Badge
              variant="brand"
              title={platformLabel(account.platform)}
              icon={<SocialGlyph icon={platformIcon} className="size-3.5" />}
            >
              {platformLabel(account.platform)}
            </Badge>
          ) : null}
          <span className="text-sm font-semibold">{account.label}</span>
          <AccountStatusBadge account={account} />
        </div>
        {entry ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {entry.detail[account.platform]}
          </p>
        ) : null}
      </div>
      {/* The resolver itself docks in the layout's form slot (overlay, right)
        — registered above, not rendered here. */}
    </div>
  )
}

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#2A8CFF] hover:underline"
    >
      <ArrowLeft size={15} strokeWidth={2.25} aria-hidden="true" />
      {label}
    </Link>
  )
}
