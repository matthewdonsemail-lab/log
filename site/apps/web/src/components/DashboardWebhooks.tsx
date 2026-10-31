import { useMemo, useState } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { Button, useToast } from '@listeningkit/ui'
import { webhooksDeliveriesRef, webhooksListRef } from '@/lib/convex'
import {
  createWebhook, deliveriesSchema, describeDelivery, describeWebhook, MIN_SCORE_CHOICES, removeWebhook, setWebhookActive, testWebhook,
  webhookListSchema, webhooksAllowed, type CreatedWebhook, type Webhook,
} from '@/lib/webhooks-live'

function Log({ id }: { id: string }) {
  const data = useQuery(webhooksDeliveriesRef, { id })
  const log = useMemo(() => {
    const parsed = data === undefined ? null : deliveriesSchema.safeParse(data)
    return parsed?.success ? parsed.data : null
  }, [data])
  if (log === null) return <p className="text-xs text-text-secondary">Loading…</p>
  if (log.length === 0) return <p className="text-xs text-text-secondary">Nothing sent yet. Press "Send a test" to try it.</p>
  return (
    <ul className="flex flex-col gap-1 text-xs text-text-secondary">
      {log.slice(0, 6).map((entry) => (
        <li key={entry.id}>{new Date(entry.at).toLocaleString()} · {describeDelivery(entry)}</li>
      ))}
    </ul>
  )
}

/** Webhooks: ListeningKit posts a signed event to your address when a match scores high enough. A Pro feature, so on Free this shows the notice. */
export function DashboardWebhooks() {
  const { isAuthenticated } = useConvexAuth()
  const data = useQuery(webhooksListRef, isAuthenticated ? {} : 'skip')
  const list = useMemo(() => {
    const parsed = data === undefined ? null : webhookListSchema.safeParse(data)
    return parsed?.success ? parsed.data : null
  }, [data])
  const { error: notifyError, success: notifySuccess } = useToast()

  const [url, setUrl] = useState('')
  const [minScore, setMinScore] = useState(70)
  const [busy, setBusy] = useState<string | null>(null)
  const [fresh, setFresh] = useState<CreatedWebhook | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  async function guarded(name: string, task: () => Promise<void>, failure: string) {
    if (busy) return
    setBusy(name)
    try { await task() } catch (err: unknown) {
      notifyError(failure, err instanceof Error ? err.message : 'Try again.')
    } finally { setBusy(null) }
  }

  const create = () => guarded('create', async () => {
    setFresh(await createWebhook({ url, minScore, platforms: [] }))
    setUrl('')
  }, 'Could not create the webhook')

  const test = (hook: Webhook) => guarded(`test-${hook.id}`, async () => {
    const outcome = await testWebhook(hook.id)
    if (outcome.delivered) notifySuccess('Test delivered', `Your receiver answered HTTP ${outcome.statusCode ?? 200}.`)
    else notifyError('Test failed', outcome.error ?? 'The receiver did not accept it.')
    setOpen(hook.id)
  }, 'Could not send the test')

  const toggle = (hook: Webhook) => guarded(`toggle-${hook.id}`, async () => {
    await setWebhookActive(hook.id, !hook.active)
  }, 'Could not update the webhook')

  const remove = (hook: Webhook) => guarded(`remove-${hook.id}`, async () => {
    await removeWebhook(hook.id)
    if (fresh?.webhook.id === hook.id) setFresh(null)
    notifySuccess('Webhook removed', 'It will not be sent any more matches.')
  }, 'Could not remove the webhook')

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text)
      notifySuccess('Copied', `${what} is on your clipboard.`)
    } catch {
      notifyError('Copy failed', 'Select the text and copy it by hand.')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text-primary">Webhooks</h2>
        <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-bold uppercase text-[#1f6fe6]">Pro</span>
      </div>
      <p className="text-sm text-text-secondary">
        We send a signed message to your address the moment a match scores high enough. Your own code can then react to it.
      </p>

      {list === null ? <p className="text-sm text-text-secondary">Loading…</p> : null}

      {list !== null && !webhooksAllowed(list.limit) ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-text-secondary">
          Webhooks are part of the Pro plan, which is coming soon. Nothing to set up yet.
        </p>
      ) : null}

      {list !== null && webhooksAllowed(list.limit) ? (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block min-w-0 flex-1">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Address (https)</span>
              <input
                id="webhook-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void create() }}
                placeholder="https://your-server.com/listeningkit"
                autoComplete="off"
                maxLength={500}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#2a8cff] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Send when</span>
              <select
                id="webhook-min-score"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="h-12 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 focus:border-[#2a8cff] focus:outline-none"
              >
                {MIN_SCORE_CHOICES.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
              </select>
            </label>
            <Button type="button" variant="blue" size="lg" shadow="hard" disabled={busy !== null || !url.trim()} onClick={create} className="font-bold text-white">
              {busy === 'create' ? 'Creating…' : 'Add webhook'}
            </Button>
          </div>

          {fresh ? (
            <div className="flex flex-col gap-2 rounded-xl border-2 border-[#2a8cff] p-4">
              <p className="text-sm font-bold text-text-primary">Copy your signing secret now. It is shown only once.</p>
              <div className="flex flex-wrap items-center gap-3">
                <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-900">{fresh.secret}</code>
                <Button type="button" variant="blue" size="lg" onClick={() => copy(fresh.secret, 'The secret')}>Copy secret</Button>
              </div>
              <p className="text-xs text-text-secondary">
                Every request has an <code>X-ListeningKit-Signature</code> header: <code>v1=</code> plus the HMAC-SHA256 of <code>timestamp.body</code>, signed with this secret. Check it, and reject old timestamps.
              </p>
              <div><Button type="button" variant="gray" size="lg" onClick={() => setFresh(null)}>I saved it</Button></div>
            </div>
          ) : null}

          {list.webhooks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-text-secondary">No webhooks yet.</p>
          ) : null}
          {list.webhooks.map((hook) => (
            <div key={hook.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-bold text-text-primary">{hook.url}</span>
                  <span className={`text-sm ${hook.active ? 'text-text-secondary' : 'text-amber-700'}`}>{describeWebhook(hook)}</span>
                </div>
                <Button type="button" variant="gray" size="lg" disabled={busy !== null} onClick={() => test(hook)}>
                  {busy === `test-${hook.id}` ? 'Sending…' : 'Send a test'}
                </Button>
                <Button type="button" variant="gray" size="lg" disabled={busy !== null} onClick={() => toggle(hook)}>
                  {hook.active ? 'Turn off' : 'Turn on'}
                </Button>
                <Button type="button" variant="red" size="lg" shadow="hard" disabled={busy !== null} onClick={() => remove(hook)}>Remove</Button>
              </div>
              <button type="button" className="self-start text-sm font-semibold text-[#1f6fe6] underline decoration-dashed underline-offset-4" onClick={() => setOpen(open === hook.id ? null : hook.id)}>
                {open === hook.id ? 'Hide recent deliveries' : 'Show recent deliveries'}
              </button>
              {open === hook.id ? <Log id={hook.id} /> : null}
            </div>
          ))}
        </>
      ) : null}
    </div>
  )
}
