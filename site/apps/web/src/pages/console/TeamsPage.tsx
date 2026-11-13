import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api, errorText, sessionKey, useResetPrivate, useSession, type SessionView, type TeamView } from '@/lib/controlApi'
import './console.css'
import { localConsole } from '@/lib/consoleMode'
import { LocalNoTeamPage } from './LocalNoTeamPage'
import { Button, Spinner, toast } from '@listeningkit/ui'
import { ArrowRight } from 'lucide-react'
import { AuthShell, authFieldClass } from '../auth/AuthShell'

function slugOf(name: string): string {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
}

export function TeamsPage() {
  return localConsole ? <LocalNoTeamPage title="Teams" /> : <HostedTeamsPage />
}

function HostedTeamsPage() {
  const session = useSession()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const resetPrivate = useResetPrivate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const invite = params.get('invite')

  useEffect(() => {
    if (!slugTouched) setSlug(slugOf(name))
  }, [name, slugTouched])

  useEffect(() => {
    if (!invite || !session.data) return
    let stopped = false
    setBusy(true)
    api<TeamView>('/invites/accept', { method: 'POST', body: { token: invite } })
      .then(async (team) => {
        if (stopped) return
        await choose(team.id)
      })
      .catch((error) => {
        if (stopped) return
        toast.error(errorText(error))
        params.delete('invite')
        setParams(params, { replace: true })
      })
      .finally(() => !stopped && setBusy(false))
    return () => {
      stopped = true
    }
  }, [invite, session.data?.user.id])

  if (session.isLoading) return <AuthShell><Spinner className="min-h-0 py-10" label="Loading your teams" /></AuthShell>
  if (!session.data) return <Navigate to={`/sign-in?returnPath=${encodeURIComponent(`/teams${invite ? `?invite=${invite}` : ''}`)}`} replace />

  async function choose(teamId: string) {
    const next = await api<SessionView>('/session/team', { method: 'POST', body: { teamId } })
    resetPrivate()
    queryClient.setQueryData(sessionKey, next)
    navigate('/console/start', { replace: true })
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const team = await api<TeamView>('/teams', { method: 'POST', body: { name: name.trim(), slug } })
      await choose(team.id)
    } catch (error) {
      toast.error(errorText(error))
    } finally {
      setBusy(false)
    }
  }

  async function pick(teamId: string) {
    setBusy(true)
    try {
      await choose(teamId)
    } catch (error) {
      toast.error(errorText(error))
      setBusy(false)
    }
  }

  const teams = session.data.teams
  return (
    <AuthShell wide>
      <h1 className="text-center text-2xl font-bold leading-tight">Your teams</h1>
      <p className="mt-3 text-center text-sm leading-6 text-slate-500">Signed in as {session.data.user.email}. A team shares one workspace, its accounts and its AI connections.</p>
      {invite && busy ? (
        <div role="status" className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-500"><Spinner className="min-h-0 flex-none py-0" label="Joining the team" />Joining the team</div>
      ) : null}

      {teams.length ? (
        <section className="mt-7">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Pick a team</h2>
          <ul className="space-y-3">
            {teams.map((team) => (
              <li key={team.id}>
                <button type="button" disabled={busy} onClick={() => pick(team.id)} className="flex h-14 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left hover:border-[#2A8CFF] hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2A8CFF] disabled:cursor-not-allowed disabled:opacity-60">
                  <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-[#2A8CFF] text-sm font-bold text-white">{team.name.slice(0, 1).toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{team.name}</span>
                    <span className="text-xs text-slate-500">{team.role}{team.id === session.data?.selectedTeamId ? ' · current' : ''}</span>
                  </span>
                  <ArrowRight size={16} className="text-[#2A8CFF]" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 pt-6 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or create a new team<span className="h-px flex-1 bg-slate-200" /></div>
        </section>
      ) : null}

      <form className={teams.length ? 'mt-5 space-y-5' : 'mt-7 space-y-5'} onSubmit={create}>
        <div>
          <label htmlFor="teamName" className="mb-2 block text-sm font-semibold text-slate-700">Team name</label>
          <input id="teamName" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} placeholder="ListeningKit" className={authFieldClass} />
        </div>
        <div>
          <label htmlFor="teamSlug" className="mb-2 block text-sm font-semibold text-slate-700">Team URL</label>
          <input id="teamSlug" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value.toLowerCase()) }} required minLength={2} maxLength={48} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="listeningkit" className={authFieldClass} />
        </div>
        <Button type="submit" variant="blue" disabled={busy || !name.trim() || slug.length < 2} className="h-12 w-full rounded-xl text-sm font-bold">{busy ? 'Creating…' : 'Create team'} <ArrowRight size={16} className="ml-2" /></Button>
      </form>
      <p className="mt-5 text-center text-xs text-slate-500">To join someone else’s team, open the invite link from your email while signed in with that address.</p>
    </AuthShell>
  )
}
