import { useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, errorText, useSelectedTeam, useWorkspaces, type InviteView, type MemberView, type PairingView, type WorkspaceView } from '@/lib/controlApi'
import { ConsoleLayout, SectionHeading, WorkspaceChip, workspaceStateOf } from './ConsoleLayout'
import { toast } from '@listeningkit/ui'

function origin(): string {
  return window.location.origin
}

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-start gap-2 rounded-xl bg-[#0D2A4C] p-3 font-mono text-xs leading-5 text-white">
      <code className="min-w-0 flex-1 break-all">{children}</code>
      <button type="button" onClick={() => navigator.clipboard.writeText(children).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })} className="shrink-0 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold hover:bg-white/25">{copied ? 'Copied' : 'Copy'}</button>
    </div>
  )
}

function WorkspaceSetup({ teamId, canAdmin }: { teamId: string; canAdmin: boolean }) {
  const workspaces = useWorkspaces(teamId)
  const queryClient = useQueryClient()
  const [hash, setHash] = useState('')
  const [pairing, setPairing] = useState<PairingView | null>(null)
  const [busy, setBusy] = useState(false)
  const selected = workspaces.data?.find((item) => item.selected) ?? null
  const state = workspaceStateOf(workspaces.data, workspaces.isError)

  async function run(work: () => Promise<void>) {
    setBusy(true)
    try {
      await work()
    } catch (error) {
      toast.error(errorText(error))
    } finally {
      setBusy(false)
    }
  }

  const create = () => run(async () => {
    await api<WorkspaceView>(`/teams/${teamId}/workspaces`, { method: 'POST', body: { provider: 'ownCloud' } })
    await queryClient.invalidateQueries({ queryKey: ['controlWorkspaces', teamId] })
  })

  const pair = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    run(async () => {
      setPairing(await api<PairingView>(`/teams/${teamId}/workspaces/${selected.id}/pairings`, { method: 'POST', body: { challengeHash: hash.trim().toLowerCase() } }))
      setHash('')
    })
  }

  const revoke = () => {
    if (!selected || !window.confirm('Revoke this workspace? Its runtime is cut off at once and has to be paired again as a new workspace.')) return
    run(async () => {
      await api<void>(`/teams/${teamId}/workspaces/${selected.id}/revoke`, { method: 'POST', body: {} })
      setPairing(null)
      await queryClient.invalidateQueries({ queryKey: ['controlWorkspaces', teamId] })
    })
  }

  return (
    <section className="mb-10">
      <SectionHeading title="Workspace" />
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <WorkspaceChip state={state} />
          {selected?.lastContactAt ? <span className="text-xs text-slate-500">Last contact {new Date(selected.lastContactAt).toLocaleString()}</span> : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">Your workspace is the cloud machine where log runs with your accounts, sessions and messages. They stay there; this site only routes requests to it.</p>

        {!selected ? (
          canAdmin ? <button type="button" disabled={busy} onClick={create} className="mt-4 h-10 rounded-xl bg-[#2A8CFF] px-4 text-sm font-bold text-white disabled:opacity-60">Add a workspace</button> : <p className="mt-4 text-sm text-slate-600">Ask an owner or admin to add the team’s workspace.</p>
        ) : selected.status === 'revoked' ? (
          <p className="mt-4 text-sm text-slate-600">This workspace was revoked.</p>
        ) : canAdmin ? (
          <div className="mt-5 space-y-4">
            <ol className="space-y-4 text-sm leading-6 text-slate-700">
              <li>
                <b>1.</b> In the workspace, with log installed, run:
                <div className="mt-2"><Code>{`log runtime init --origin ${origin()}`}</Code></div>
              </li>
              <li>
                <b>2.</b> Paste the challenge hash it prints:
                <form onSubmit={pair} className="mt-2 flex flex-wrap gap-2">
                  <input value={hash} onChange={(event) => setHash(event.target.value)} required pattern="[0-9a-fA-F]{64}" placeholder="64-character challenge hash" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 font-mono text-xs outline-none focus:border-[#2A8CFF] focus:ring-2 focus:ring-[#2A8CFF]/20" />
                  <button type="submit" disabled={busy || hash.trim().length !== 64} className="h-10 rounded-xl bg-[#2A8CFF] px-4 text-sm font-bold text-white disabled:opacity-60">Get pairing token</button>
                </form>
              </li>
              {pairing ? (
                <li>
                  <b>3.</b> Run this in the workspace within 10 minutes. The token is shown once.
                  <div className="mt-2"><Code>{`log runtime pair --token ${pairing.token}`}</Code></div>
                </li>
              ) : null}
              <li>
                <b>{pairing ? '4.' : '3.'}</b> Keep it connected (as a service, so it restarts on its own):
                <div className="mt-2"><Code>log runtime connect</Code></div>
              </li>
            </ol>
            <button type="button" disabled={busy} onClick={revoke} className="text-xs font-semibold text-red-600 hover:underline">Revoke this workspace</button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function Members({ teamId, canInvite, manageOwners }: { teamId: string; canInvite: boolean; manageOwners: boolean }) {
  const members = useQuery({ queryKey: ['controlMembers', teamId], queryFn: ({ signal }) => api<MemberView[]>(`/teams/${teamId}/members`, { signal }) })
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [sent, setSent] = useState<InviteView[]>([])

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const made = await api<InviteView>(`/teams/${teamId}/invites`, { method: 'POST', body: { email: email.trim(), role } })
      setSent((items) => [made, ...items])
      setEmail('')
    } catch (error) {
      toast.error(errorText(error))
    }
  }

  async function update(member: MemberView, change: { role?: string; status?: string }) {
    try {
      await api<MemberView>(`/teams/${teamId}/members/${member.id}`, { method: 'PATCH', body: change })
      await queryClient.invalidateQueries({ queryKey: ['controlMembers', teamId] })
    } catch (error) {
      toast.error(errorText(error))
    }
  }

  async function withdraw(item: InviteView) {
    try {
      await api<void>(`/teams/${teamId}/invites/${item.id}/revoke`, { method: 'POST', body: {} })
      setSent((items) => items.map((entry) => (entry.id === item.id ? { ...entry, status: 'revoked' } : entry)))
    } catch (error) {
      toast.error(errorText(error))
    }
  }

  return (
    <section className="mb-10">
      <SectionHeading title="Members" count={members.data?.filter((item) => item.status === 'active').length} />
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {members.isLoading ? <li className="p-4 text-sm text-slate-500">Loading…</li> : null}
        {members.data?.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{member.email}</span>
            <span className="text-xs text-slate-500">{member.status === 'revoked' ? 'removed' : member.role}</span>
            {canInvite && member.status === 'active' && (member.role !== 'owner' || manageOwners) ? (
              <span className="flex gap-2">
                {manageOwners && member.role !== 'owner' ? <button type="button" onClick={() => update(member, { role: 'owner' })} className="text-xs font-semibold text-[#1B6FD6]">Make owner</button> : null}
                {member.role === 'member' ? <button type="button" onClick={() => update(member, { role: 'admin' })} className="text-xs font-semibold text-[#1B6FD6]">Make admin</button> : null}
                {member.role === 'admin' ? <button type="button" onClick={() => update(member, { role: 'member' })} className="text-xs font-semibold text-[#1B6FD6]">Make member</button> : null}
                <button type="button" onClick={() => window.confirm(`Remove ${member.email} from the team?`) && update(member, { status: 'revoked' })} className="text-xs font-semibold text-red-600">Remove</button>
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {canInvite ? (
        <form onSubmit={invite} className="mt-4 flex flex-wrap gap-2">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="teammate@example.com" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#2A8CFF] focus:ring-2 focus:ring-[#2A8CFF]/20" />
          <select value={role} onChange={(event) => setRole(event.target.value as 'member' | 'admin')} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="h-10 rounded-xl bg-[#2A8CFF] px-4 text-sm font-bold text-white">Send invite</button>
        </form>
      ) : null}
      {sent.length ? (
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          {sent.map((item) => (
            <li key={item.id}>Invite to {item.email} ({item.role}): {item.status}{item.status === 'pending' ? <> · <button type="button" onClick={() => withdraw(item)} className="font-semibold text-red-600">withdraw</button></> : null}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export function SettingsPage() {
  const { team } = useSelectedTeam()
  return (
    <ConsoleLayout title="Settings" subtitle="Your team’s workspace, members and invites.">
      {team ? (
        <>
          <WorkspaceSetup teamId={team.id} canAdmin={team.role !== 'member'} />
          <Members teamId={team.id} canInvite={team.role !== 'member'} manageOwners={team.role === 'owner'} />
        </>
      ) : null}
    </ConsoleLayout>
  )
}
