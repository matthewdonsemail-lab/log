import { SignIn, useAuth } from '@clerk/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@listeningkit/ui'
import { api, errorText, safeReturnPath, sessionKey, type SessionView } from '@/lib/controlApi'

const clerkErrorSelector = '.cl-formFieldErrorText, .cl-alertText, .cl-otpCodeFieldErrorText'
const clerkAppearance = { elements: { formFieldErrorText: 'hidden', alert: 'hidden', otpCodeFieldErrorText: 'hidden' } }

function useClerkErrorToasts() {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = box.current
    if (!root) return
    const read = (changes: MutationRecord[]) => {
      const touched = new Set<Element>()
      for (const change of changes) {
        const target = change.target instanceof Element ? change.target : change.target.parentElement
        const owner = target?.closest(clerkErrorSelector)
        if (owner) touched.add(owner)
        for (const added of change.addedNodes) if (added instanceof Element) for (const node of [added, ...added.querySelectorAll(clerkErrorSelector)]) if (node.matches(clerkErrorSelector)) touched.add(node)
      }
      for (const node of touched) {
        const text = node.textContent?.trim()
        if (text) toast.error(text)
      }
    }
    const watcher = new MutationObserver(read)
    watcher.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] })
    return () => watcher.disconnect()
  }, [])
  return box
}

export function ClerkAuthPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [params] = useSearchParams()
  const destination = safeReturnPath(params.get('returnPath')) ?? '/console/start'
  const navigate = useNavigate()
  const queries = useQueryClient()
  const [failed, setFailed] = useState(false)
  const clerkBox = useClerkErrorToasts()
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
        if (!cancelled) {
          toast.error(errorText(reason))
          setFailed(true)
        }
      }
    })()
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, getToken, destination, navigate, queries])
  const suffix = `?returnPath=${encodeURIComponent(destination)}`
  return <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F8FBFF] px-4 py-12">
    <Link to="/" aria-label="ListeningKit home"><img src="/logo.svg" alt="ListeningKit" className="size-14" /></Link>
    {!isLoaded ? <p>Loading sign-in…</p> : isSignedIn ? <p role="status">{failed ? 'Your workspace did not open.' : 'Opening your workspace…'}</p>
      : null}
    <div ref={clerkBox} hidden={!isLoaded || isSignedIn}>
      {isLoaded && !isSignedIn ? <SignIn routing="hash" withSignUp appearance={clerkAppearance} forceRedirectUrl={`/sign-in${suffix}`} signUpForceRedirectUrl={`/sign-in${suffix}`} /> : null}
    </div>
    {failed && <button type="button" onClick={() => window.location.reload()}>Try again</button>}
    <Link to="/">Back to ListeningKit</Link>
  </main>
}
