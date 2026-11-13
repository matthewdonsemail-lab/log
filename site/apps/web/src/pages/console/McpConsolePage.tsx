import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, errorText, HOSTED_MCP_URL, useSelectedTeam, type ConsentRequestView, type GrantView } from '@/lib/controlApi'
import { ConsoleLayout, SectionHeading } from './ConsoleLayout'
import { Spinner, toast } from '@listeningkit/ui'
import { useErrorToast } from '@/lib/useErrorToast'
import { localConsole } from '@/lib/consoleMode'
import { loadLocalAiClients } from './aiClientsData'

const SCOPE_TEXT: Record<string, string> = {
  'log:read': 'Read your team’s accounts, DMs and chats through your workspace',
  'log:write': 'Send, post and reply from your team’s accounts (each send still needs your approval)',
}

function Consent({ requestId }: { requestId: string }) {
  const { session } = useSelectedTeam()
  const request = useQuery({ queryKey: ['controlConsent', requestId], queryFn: ({ signal }) => api<ConsentRequestView>(`/oauth/requests/${requestId}`, { signal }), retry: false, staleTime: Infinity })
  const [teamId, setTeamId] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (request.data && !teamId) setTeamId(request.data.selectedTeamId ?? request.data.teams[0]?.id ?? '')
  }, [request.data, teamId])

  useErrorToast(request.isError, request.error)

  async function decide(approve: boolean) {
    setBusy(true)
    try {
      const answer = await api<{ redirectTo: string }>(`/oauth/requests/${requestId}/${approve ? 'approve' : 'deny'}`, { method: 'POST', body: approve ? { teamId } : {} })
      window.location.assign(answer.redirectTo)
    } catch (error) {
      toast.error(errorText(error))
      setBusy(false)
    }
  }

  if (request.isLoading) return <p className="text-sm text-slate-500">Loading the request…</p>
  if (request.isError || !request.data) return <p className="text-sm text-slate-600">Start the connection again from your AI app.</p>
  const data = request.data
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-black tracking-tight">Connect {data.clientName} to log</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Signed in as {session.data?.user.email}. After you approve, {data.clientName} returns to <b>{data.redirectHost}</b>.</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {data.scopes.map((scope) => <li key={scope} className="rounded-xl bg-[#F8FBFF] p-3">{SCOPE_TEXT[scope] ?? scope}</li>)}
      </ul>
      <label className="mt-5 block text-sm font-semibold text-slate-700">
        For team
        <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm">
          {data.teams.map((team) => <option key={team.id} value={team.id}>{team.name} ({team.role})</option>)}
        </select>
      </label>
      <p className="mt-2 text-xs leading-5 text-slate-500">It can only reach this team’s workspace. Switching team on this site never moves it; connect again for another team.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" disabled={busy || !teamId} onClick={() => decide(true)} className="h-11 flex-1 rounded-xl bg-[#2A8CFF] text-sm font-bold text-white disabled:opacity-60">{busy ? 'Working…' : 'Approve'}</button>
        <button type="button" disabled={busy} onClick={() => decide(false)} className="h-11 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 disabled:opacity-60">Deny</button>
      </div>
    </section>
  )
}

function Grants({ teamId }: { teamId: string }) {
  const grants = useQuery({ queryKey: ['controlGrants', teamId], queryFn: ({ signal }) => api<GrantView[]>(`/teams/${teamId}/grants`, { signal }) })
  const queryClient = useQueryClient()
  const url = HOSTED_MCP_URL

  async function revoke(grant: GrantView) {
    if (!window.confirm(`Disconnect ${grant.clientName}? It stops working at once.`)) return
    try {
      await api<void>(`/teams/${teamId}/grants/${grant.id}/revoke`, { method: 'POST', body: {} })
      await queryClient.invalidateQueries({ queryKey: ['controlGrants', teamId] })
    } catch (error) {
      toast.error(errorText(error))
    }
  }

  const live = grants.data?.filter((grant) => !grant.revokedAt) ?? []
  return (
    <>
      <section className="mb-10">
        <SectionHeading title="Add log to your AI app" />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
          <p>Add this as a remote MCP server (custom connector) in Claude, ChatGPT, Cursor, Codex or Hermes. The app sends you here to approve it.</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#0D2A4C] p-3 font-mono text-xs text-white"><code className="min-w-0 flex-1 break-all">{url}</code><button type="button" onClick={() => navigator.clipboard.writeText(url)} className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold">Copy</button></div>
          <p className="mt-3">Claude Code: <code className="rounded bg-slate-100 px-1">claude mcp add --transport http log {url}</code></p>
        </div>
      </section>
      <section>
        <SectionHeading title="Connected AI apps" count={live.length} />
        {grants.isLoading ? <Spinner className="min-h-0 py-6" label="Loading your AI connections" /> : live.length ? (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {live.map((grant) => (
              <li key={grant.id} className="flex items-center gap-3 p-4">
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{grant.clientName}</span><span className="text-xs text-slate-500">{grant.scopes.join(', ')}</span></span>
                <button type="button" onClick={() => revoke(grant)} className="text-xs font-semibold text-red-600">Disconnect</button>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">No AI app connected yet.</p>}
      </section>
    </>
  )
}

function CopyBlock({ text }: { text: string }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-xl bg-[#0D2A4C] p-3 font-mono text-xs leading-5 text-white">
      <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all">{text}</pre>
      <button type="button" onClick={() => navigator.clipboard.writeText(text)} className="shrink-0 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold">Copy</button>
    </div>
  )
}

function LocalAiClients() {
  const query = useQuery({ queryKey: ['consoleAiClients'], queryFn: ({ signal }) => loadLocalAiClients(signal), retry: false, refetchOnWindowFocus: false })
  useErrorToast(query.isError, query.error, 'Could not read the MCP config for this machine.')
  if (query.isLoading) return <p className="text-sm text-slate-500">Reading this machine…</p>
  if (query.isError || !query.data) return <p className="text-sm text-slate-600"><button type="button" onClick={() => query.refetch()} className="font-semibold underline">Try again</button></p>
  return (
    <section className="space-y-6">
      {query.data.clients.map((client) => (
        <div key={client.id}>
          <SectionHeading title={client.label} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
            {client.command ? <><p className="font-semibold">Run once:</p><CopyBlock text={client.command} /></> : null}
            <p className="mt-3 font-semibold">Or put this in {client.configPath}:</p>
            <CopyBlock text={client.config.trimEnd()} />
            <p className="mt-3 text-slate-600">{client.note}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

export function McpConsolePage() {
  const [params] = useSearchParams()
  const requestId = params.get('request')
  const { team } = useSelectedTeam()
  if (localConsole) {
    return (
      <ConsoleLayout title="AI clients" subtitle="Connect Claude Code, Codex or opencode to log on this machine.">
        <LocalAiClients />
      </ConsoleLayout>
    )
  }
  return (
    <ConsoleLayout title="AI clients" subtitle="Connect Claude, ChatGPT, Cursor, Codex or Hermes to your team’s workspace.">
      {requestId ? <Consent requestId={requestId} /> : team ? <Grants teamId={team.id} /> : null}
    </ConsoleLayout>
  )
}
