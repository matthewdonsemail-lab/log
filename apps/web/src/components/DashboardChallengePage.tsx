import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@listeningkit/ui'
import { getAccounts, resolveChallenge, type ConnectionRecord } from '../lib/connections'
import { CHALLENGE_RESOLVABLE_ISSUES, ISSUE_CATALOG } from '../lib/account-issues'
import { ChallengeResolver } from './Modals/ChallengeResolver'

/**
 * Dedicated resolver route (`/dashboard/accounts/:accountId/challenge`).
 * Same `ChallengeResolver` the Accounts table docks, but addressable: the
 * account id is the only segment, so the page survives even when the
 * account has no threads (the `x/x-challenge` empty-inbox case). Callers
 * pass `state: { from }` to return where they came from (Messages gate
 * links here); otherwise back goes to the account page.
 */
export function DashboardChallengePage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error: notifyError } = useToast()
  const [account, setAccount] = useState<ConnectionRecord | null | undefined>(undefined)

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
  const goBack = () => navigate(back)

  if (account === undefined) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-black/5" />
        <div className="h-[420px] animate-pulse rounded-xl bg-black/5" />
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

  const issue = account.lastIssue
  const resolvable = issue != null && CHALLENGE_RESOLVABLE_ISSUES.has(issue)

  if (!resolvable) {
    const entry = issue ? ISSUE_CATALOG[issue] : null
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
    <div className="flex h-full min-h-0 flex-col gap-4 pb-6">
      <BackLink to={back} label={from ? 'Back' : 'Back to account'} />
      <div className="min-h-0 flex-1">
        <ChallengeResolver
          account={account}
          onClose={goBack}
          onResolve={async () => {
            try {
              await resolveChallenge(account.id)
              success(`Challenge cleared — ${account.label} is listening again`)
              navigate(back, { replace: true })
            } catch (err: unknown) {
              notifyError('Resolve failed', err instanceof Error ? err.message : 'Could not clear the challenge.')
            }
          }}
        />
      </div>
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
