import { useEffect, useMemo, useState } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { Button, useToast } from '@listeningkit/ui'
import { alertsMineRef } from '@/lib/convex'
import { alertSettingsSchema, MIN_SCORE_CHOICES, saveAlertSettings, sendTestAlert } from '@/lib/live-alerts'

/** Email alerts for strong matches, sent through AgentMail from the server. Errors go through toasts, never inline. */
export function DashboardSettingsEmailAlerts() {
  const { isAuthenticated } = useConvexAuth()
  const data = useQuery(alertsMineRef, isAuthenticated ? {} : 'skip')
  const saved = useMemo(() => {
    const parsed = data === undefined ? null : alertSettingsSchema.safeParse(data)
    return parsed?.success ? parsed.data : null
  }, [data])
  const { error: notifyError, success: notifySuccess } = useToast()

  const [email, setEmail] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [minScore, setMinScore] = useState(70)
  const [busy, setBusy] = useState<'save' | 'test' | null>(null)

  // Fill the form once from what is saved; after that the person's edits are theirs.
  const [filled, setFilled] = useState(false)
  useEffect(() => {
    if (!saved || filled) return
    setEmail(saved.email ?? '')
    setEnabled(saved.enabled)
    setMinScore(saved.minScore)
    setFilled(true)
  }, [saved, filled])

  async function save() {
    if (busy) return
    setBusy('save')
    try {
      await saveAlertSettings({ email, enabled, minScore })
      notifySuccess('Saved', enabled ? 'We will email you when a strong match shows up.' : 'Email alerts are off.')
    } catch (err: unknown) {
      notifyError('Could not save', err instanceof Error ? err.message : 'Try again.')
    } finally {
      setBusy(null)
    }
  }

  async function test() {
    if (busy) return
    setBusy('test')
    try {
      await saveAlertSettings({ email, enabled, minScore })
      await sendTestAlert()
      notifySuccess('Test email sent', `Check ${email.trim()}. It can take a minute to arrive.`)
    } catch (err: unknown) {
      notifyError('Could not send the test', err instanceof Error ? err.message : 'Try again.')
    } finally {
      setBusy(null)
    }
  }

  const unavailable = saved !== null && !saved.available

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Email me strong matches</h2>
        <p className="text-sm text-text-secondary">
          When a match scores high enough we send one short email with the best ones. At most one email every 10 minutes.
        </p>
      </div>
      {unavailable ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Email alerts are not switched on for this site yet.</p>
      ) : null}
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Send to</span>
        <input
          id="alert-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={254}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#2a8cff] focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Only when the match is</span>
        <select
          id="alert-min-score"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 focus:border-[#2a8cff] focus:outline-none"
        >
          {MIN_SCORE_CHOICES.map((choice) => (
            <option key={choice.value} value={choice.value}>{choice.label}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input id="alert-enabled" type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-4" />
        Send me these emails
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void save()} disabled={busy !== null || email.trim() === ''}>
          {busy === 'save' ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => void test()} disabled={busy !== null || email.trim() === '' || unavailable}>
          {busy === 'test' ? 'Sending…' : 'Send a test email'}
        </Button>
      </div>
    </div>
  )
}
