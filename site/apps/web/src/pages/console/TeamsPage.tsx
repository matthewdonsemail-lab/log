import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api, errorText, sessionKey, useResetPrivate, useSession, type SessionView, type TeamView } from '@/lib/controlApi'
import './console.css'

function slugOf(name: string): string {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
}

export function TeamsPage() {
  const session = useSession()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const resetPrivate = useResetPrivate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [notice, setNotice] = useState('')
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
        setNotice(errorText(error))
        params.delete('invite')
        setParams(params, { replace: true })
      })
      .finally(() => !stopped && setBusy(false))
    return () => {
      stopped = true
    }
  }, [invite, session.data?.user.id])

  if (session.isLoading) return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading…</main>
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
    setNotice('')
    try {
      const team = await api<TeamView>('/teams', { method: 'POST', body: { name: name.trim(), slug } })
      await choose(team.id)
    } catch (error) {
      setNotice(errorText(error))
    } finally {
      setBusy(false)
    }
  }

  async function pick(teamId: string) {
    setBusy(true)
    setNotice('')
    try {
      await choose(teamId)
    } catch (error) {
      setNotice(errorText(error))
      setBusy(false)
    }
  }

  const teams = session.data.teams
  const field = 'h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-[#2A8CFF] focus:ring-2 focus:ring-[#2A8CFF]/20'
  return (
    <main className="relative min-h-screen bg-[#F8FBFF] px-4 py-10 font-sans text-slate-900 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" aria-label="ListeningKit home" className="mb-6 inline-flex"><img src="/logo.svg" alt="" className="size-10 rounded-[10px]" /></Link>
        <h1 className="text-2xl font-black tracking-tight">Your teams</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Signed in as {session.data.user.email}. A team shares one workspace, its accounts and its AI connections.</p>
        {notice ? <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{notice}</p> : null}
        {invite && busy ? <p role="status" className="mt-5 rounded-xl bg-white p-3 text-sm text-slate-600">Joining the team…</p> : null}

        {teams.length ? (
          <section className="mt-8">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Pick a team</h2>
            <ul className="space-y-2">
              {teams.map((team) => (
                <li key={team.id}>
                  <button type="button" disabled={busy} onClick={() => pick(team.id)} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-[#2A8CFF] disabled:opacity-60">
                    <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-[#2A8CFF] text-sm font-bold text-white">{team.name.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{team.name}</span>
                      <span className="text-xs text-slate-500">{team.role}{team.id === session.data?.selectedTeamId ? ' · current' : ''}</span>
                    </span>
                    <span className="text-sm font-semibold text-[#1B6FD6]">Open →</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold">Create a team</h2>
          <form className="mt-4 space-y-3" onSubmit={create}>
            <label className="block text-sm font-semibold text-slate-700">
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} placeholder="ListeningKit" className={`${field} mt-1.5`} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Team URL
              <input value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value.toLowerCase()) }} required minLength={2} maxLength={48} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="listeningkit" className={`${field} mt-1.5`} />
            </label>
            <button type="submit" disabled={busy || !name.trim() || slug.length < 2} className="h-11 w-full rounded-xl bg-[#2A8CFF] text-sm font-bold text-white disabled:opacity-60">{busy ? 'Working…' : 'Create team'}</button>
          </form>
          <p className="mt-4 text-xs leading-5 text-slate-500">To join someone else’s team, open the invite link from your email while signed in with that address.</p>
        </section>
      </div>
    </main>
  )
}
