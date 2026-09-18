import { useCallback, useEffect, useState } from 'react'
import { Button, useToast } from '@listeningkit/ui'
import {
  createIngestKey, ingestAvailable, ingestEndpoint, listIngestKeys, revokeIngestKey,
  type CreatedIngestKey, type IngestKey,
} from '@/lib/ingest-keys'

function when(ms: number | null): string {
  return ms === null ? 'Never used' : new Date(ms).toLocaleString()
}

function exampleCurl(endpoint: string, secret: string): string {
  return [
    `curl -X POST ${endpoint} \\`,
    `  -H "Authorization: Bearer ${secret}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"platform":"x","posts":[{"externalId":"1","url":"https://x.com/a/status/1","authorName":"a","body":["hello"],"likes":0,"comments":0}]}'`,
  ].join('\n')
}

export function DashboardSettingsIngest() {
  const available = ingestAvailable()
  const endpoint = ingestEndpoint()
  const [keys, setKeys] = useState<IngestKey[] | null>(null)
  const [label, setLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [fresh, setFresh] = useState<CreatedIngestKey | null>(null)
  const { error: notifyError, success: notifySuccess } = useToast()

  const reload = useCallback(() => {
    listIngestKeys()
      .then(setKeys)
      .catch((err: unknown) => {
        notifyError('Ingest keys failed to load', err instanceof Error ? err.message : 'Could not load keys.')
        setKeys([])
      })
  }, [notifyError])

  useEffect(() => {
    if (available) reload()
  }, [available, reload])

  async function create() {
    if (creating) return
    setCreating(true)
    try {
      setFresh(await createIngestKey(label))
      setLabel('')
      reload()
    } catch (err: unknown) {
      notifyError('Could not create the key', err instanceof Error ? err.message : 'Could not create the key.')
    } finally {
      setCreating(false)
    }
  }

  async function revoke(key: IngestKey) {
    try {
      await revokeIngestKey(key.id)
      if (fresh?.id === key.id) setFresh(null)
      notifySuccess('Key revoked', `${key.label} can no longer send posts.`)
      reload()
    } catch (err: unknown) {
      notifyError('Could not revoke the key', err instanceof Error ? err.message : 'Could not revoke.')
    }
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text)
      notifySuccess('Copied', `${what} is on your clipboard.`)
    } catch {
      notifyError('Copy failed', 'Select the text and copy it by hand.')
    }
  }

  if (!available || !endpoint) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-text-primary">Send posts in</h2>
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
          Ingest keys need the live backend. Set VITE_API_MODE=live and VITE_CONVEX_URL, then sign in.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Send posts in</h2>
        <p className="text-sm text-text-secondary">
          Your Facebook, X and Reddit clients push the posts they find here. Each key belongs to you, and posts
          sent with it land in your feed only.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Endpoint</span>
        <div className="flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-900">{endpoint}</code>
          <Button type="button" variant="gray" size="lg" onClick={() => copy(endpoint, 'The endpoint')}>Copy</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Key name</span>
          <input
            id="ingest-key-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void create() }}
            placeholder="e.g. X client on my laptop"
            maxLength={80}
            autoComplete="off"
            className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#2a8cff] focus:outline-none"
          />
        </label>
        <Button type="button" variant="blue" size="lg" shadow="hard" disabled={creating || !label.trim()} onClick={create} className="font-bold text-white">
          {creating ? 'Creating…' : 'Create key'}
        </Button>
      </div>

      {fresh ? (
        <div className="flex flex-col gap-3 rounded-xl border-2 border-[#2a8cff] bg-white p-5">
          <p className="text-sm font-bold text-text-primary">Copy your key now. It is shown only once.</p>
          <div className="flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-900">{fresh.secret}</code>
            <Button type="button" variant="blue" size="lg" onClick={() => copy(fresh.secret, 'The key')}>Copy key</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">{exampleCurl(endpoint, fresh.secret)}</pre>
          <div>
            <Button type="button" variant="gray" size="lg" onClick={() => setFresh(null)}>I saved it</Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {(keys ?? []).map((key) => (
          <div key={key.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-bold text-text-primary">{key.label}</span>
              <span className="truncate text-sm text-text-secondary">
                {key.prefix}… · created {new Date(key.createdAt).toLocaleDateString()} · {when(key.lastUsedAt)}
              </span>
            </div>
            <Button type="button" variant="red" size="lg" shadow="hard" onClick={() => revoke(key)}>Revoke</Button>
          </div>
        ))}
        {keys === null ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">Loading keys…</p>
        ) : null}
        {keys !== null && keys.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
            No keys yet. Create one to let a client send posts in.
          </p>
        ) : null}
      </div>
    </div>
  )
}
