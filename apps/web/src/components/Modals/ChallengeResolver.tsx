import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useToast } from '@listeningkit/ui'
import { platformLabel, type ConnectionRecord } from '../../lib/connections'
import {
  CHALLENGE_RESOLVABLE_ISSUES,
  CHALLENGE_SOLVED_MESSAGE,
  ISSUE_CATALOG,
  challengePageFor
} from '../../lib/account-issues'
import { SOCIAL_ICONS, SocialGlyph } from '../../lib/social-icons'
import { DashboardFormSheet } from '../DashboardFormSheet'

/**
 * Two-slot-wide resolver docked on the right. The embedded session view is
 * the entire task — no duplicated explainers, no redundant headers. Solve
 * inside the frame (or use the fallback when the challenge was cleared in
 * another tab); only then does "Mark resolved & resume" unlock.
 */
export function ChallengeResolver({
  account,
  onClose,
  onResolve
}: {
  account: ConnectionRecord
  onClose: () => void
  /** Persist the cleared challenge (parent owns the mutation + toast). */
  onResolve: () => Promise<void>
}) {
  const { success: toast } = useToast()
  const [solved, setSolved] = useState(false)
  const [frameError, setFrameError] = useState(false)
  const [busy, setBusy] = useState(false)

  const issue = account.lastIssue
  const resolvable = issue != null && CHALLENGE_RESOLVABLE_ISSUES.has(issue)
  const entry = issue ? ISSUE_CATALOG[issue] : null
  const platformIcon = SOCIAL_ICONS.find((icon) => icon.id === account.platform)

  // The embedded challenge view announces the clear; honor it only when it
  // arrives same-origin for this account's platform.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const data = event.data as { type?: unknown; platform?: unknown } | null
      if (!data || data.type !== CHALLENGE_SOLVED_MESSAGE) return
      if (data.platform !== account.platform) return
      setSolved(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [account.platform])

  // Solve detected (iframe postMessage or the fallback button) → toast.
  useEffect(() => {
    if (solved) toast('Challenge cleared')
  }, [solved, toast])

  async function handleConfirm() {
    setBusy(true)
    try {
      await onResolve()
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardFormSheet
      open
      title={entry ? entry.label : 'Resolve challenge'}
      subtitle={
        <>
          {platformIcon ? <SocialGlyph icon={platformIcon} className="size-4" /> : null}
          <span>{platformLabel(account.platform)}</span>
          <span>· {account.label}</span>
        </>
      }
      onClose={onClose}
      confirmLabel={resolvable ? 'Mark resolved & resume' : undefined}
      confirmDisabled={!solved}
      busy={busy}
      onConfirm={handleConfirm}
    >
      {!resolvable ? (
        <p className="rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm leading-relaxed text-text-secondary">
          This account no longer has a pending challenge — its state changed while the resolver was
          open. Close this panel and pick the account again if it still needs attention.
        </p>
      ) : (
        <div className="flex min-h-0 flex-col gap-3">
          {frameError ? (
            <p className="rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm leading-relaxed text-text-secondary">
              The session view failed to load. {entry?.remediation[account.platform]}
            </p>
          ) : (
            <iframe
              src={challengePageFor(account.platform)}
              title={`${platformLabel(account.platform)} challenge session view`}
              sandbox="allow-scripts allow-same-origin"
              onError={() => setFrameError(true)}
              className="h-[420px] w-full rounded-xl border border-black/10 bg-white md:h-[520px]"
            />
          )}
          {!solved && (
            <button
              type="button"
              onClick={() => setSolved(true)}
              className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition-colors hover:border-[#2A8CFF] hover:text-text-primary"
            >
              <ShieldCheck size={15} strokeWidth={2.25} aria-hidden="true" className="shrink-0" />
              I cleared it in my own browser instead
            </button>
          )}
        </div>
      )}
    </DashboardFormSheet>
  )
}
