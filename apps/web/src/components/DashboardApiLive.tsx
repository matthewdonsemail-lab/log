import { useCallback, useEffect, useState } from 'react'
import { Button, useToast } from '@listeningkit/ui'
import {
  API_ENDPOINTS, apiBaseUrl, apiKeysAvailable, createApiKey, exampleCurl, listApiKeys, RATE_LIMIT_TEXT, revokeApiKey,
  type ApiKeyRow, type CreatedApiKey,
} from '@/lib/api-keys-live'

function when(ms: number | null): string {
  return ms === null ? 'Never used' : `used ${new Date(ms).toLocaleString()}`
}

/** The real API: keys you make here read your own phrases and matches over HTTP. Read-only. */
export function DashboardApiLive() {
  const available = apiKeysAvailable()
  const base = apiBaseUrl()
  const [keys, setKeys] = useState<ApiKeyRow[] | null>(null)
  const [label, setLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [fresh, setFresh] = useState<CreatedApiKey | null>(null)
  const { error: notifyError, success: notifySuccess } = useToast()

  const reload = useCallback(() => {
    listApiKeys()
      .then(setKeys)
      .catch((err: unknown) => {
        notifyError('API keys failed to load', err instanceof Error ? err.message : 'Could not load keys.')
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
      setFresh(await createApiKey(label))
      setLabel('')
      reload()
    } catch (err: unknown) {
      notifyError('Could not create the key', err instanceof Error ? err.message : 'Could not create the key.')
    } finally {
      setCreating(false)
    }
  }

  async function revoke(key: ApiKeyRow) {
    try {
      await revokeApiKey(key.id)
      if (fresh?.id === key.id) setFresh(null)
      notifySuccess('Key revoked', `${key.label} can no longer read your data.`)
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

  if (!available || !base) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-text-primary">API</h1>
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
          API keys need the live backend. Set VITE_API_MODE=live and VITE_CONVEX_URL, then sign in.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">API</h1>
        <p className="text-sm text-text-secondary">
          Read your phrases and matches from your own code. Each key belongs to you and can only read your data. It cannot change anything.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Base address</span>
        <div className="flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-900">{base}</code>
          <Button type="button" variant="gray" size="lg" onClick={() => copy(base, 'The address')}>Copy</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Key name</span>
          <input
            id="api-key-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void create() }}
            placeholder="e.g. My reporting script"
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
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">{exampleCurl(base, fresh.secret)}</pre>
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
            No keys yet. Create one to start reading your data.
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-text-primary">Endpoints</h2>
        <p className="mt-1 text-sm text-text-secondary">Send the key as <code>Authorization: Bearer lk_api_...</code>. Everything is GET and returns JSON.</p>
        <table className="mt-3 w-full text-left text-sm">
          <tbody>
            {API_ENDPOINTS.map((endpoint) => (
              <tr key={endpoint.path} className="border-t border-slate-100 align-top">
                <td className="py-2 pr-3 font-mono font-semibold text-text-primary">{endpoint.path}</td>
                <td className="py-2 text-text-secondary">
                  {endpoint.what}
                  {endpoint.params === 'none' ? null : <span className="mt-1 block text-xs">Parameters: {endpoint.params}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-text-secondary">{RATE_LIMIT_TEXT}</p>
      </div>
    </div>
  )
}
