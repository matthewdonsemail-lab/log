import { SignIn, SignUp, useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api, errorText, safeReturnPath, sessionKey, type SessionView } from '@/lib/controlApi'

export function ClerkAuthPage({ signUp = false }: { signUp?: boolean }) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [params] = useSearchParams()
  const destination = safeReturnPath(params.get('returnPath')) ?? '/console/start'
  const navigate = useNavigate()
  const queries = useQueryClient()
  const [error, setError] = useState('')
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let cancelled = false
    void (async () => {
      try {
        const token = await getToken()
        const session = await api<SessionView>('/auth/clerk', { method: 'POST', body: { token } })
        if (cancelled) return
        queries.clear()
        queries.setQueryData(sessionKey, session)
        navigate(session.selectedTeamId ? destination : '/teams', { replace: true })
      } catch (reason) {
        if (!cancelled) setError(errorText(reason))
      }
    })()
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, getToken, destination, navigate, queries])
  const suffix = `?returnPath=${encodeURIComponent(destination)}`
  return <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F8FBFF] px-4 py-12">
    <Link to="/" aria-label="ListeningKit home"><img src="/logo.svg" alt="ListeningKit" className="size-14" /></Link>
    {!isLoaded ? <p>Loading sign-in…</p> : isSignedIn ? <p role="status">{error || 'Opening your workspace…'}</p> : signUp
      ? <SignUp routing="hash" signInUrl={`/sign-in${suffix}`} forceRedirectUrl={`/sign-in${suffix}`} />
      : <SignIn routing="hash" signUpUrl={`/sign-up${suffix}`} forceRedirectUrl={`/sign-in${suffix}`} />}
    {error && <button type="button" onClick={() => window.location.reload()}>Try again</button>}
    <Link to="/">Back to ListeningKit</Link>
  </main>
}
