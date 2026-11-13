import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth, useSignIn, useSignUp } from '@clerk/react'
import { api, errorText, safeReturnPath, sessionKey, type SessionView } from '@/lib/controlApi'
import { Button, Spinner, toast } from '@listeningkit/ui'
import { ArrowRight } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons'
import { AuthShell, authFieldClass } from './AuthShell'
import { clerkErrorText, exchangeClerkSession, nextPath, sendEmailCode, signInPath, startProvider, verifyEmailCode, type EmailFlow, type ProviderStrategy } from './clerkFlow'

type VerifyState = { email?: string; flow?: EmailFlow } | null

const PROVIDERS: { label: string; icon: typeof faGoogle; strategy: ProviderStrategy }[] = [
  { label: 'Google', icon: faGoogle, strategy: 'oauth_google' },
  { label: 'GitHub', icon: faGithub, strategy: 'oauth_github' },
]

function useWorkspaceExchange(returnPath: string | null) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const navigate = useNavigate()
  const queries = useQueryClient()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let cancelled = false
    setFailed(false)
    void (async () => {
      try {
        const session = await exchangeClerkSession(() => getToken(), (token) => api<SessionView>('/auth/clerk', { method: 'POST', body: { token } }))
        if (cancelled) return
        queries.clear()
        queries.setQueryData(sessionKey, session)
        navigate(nextPath(session, returnPath), { replace: true })
      } catch (reason) {
        if (cancelled) return
        toast.error(errorText(reason))
        setFailed(true)
      }
    })()
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, getToken, returnPath, navigate, queries, attempt])
  return { isLoaded, signedIn: Boolean(isLoaded && isSignedIn), failed, retry: () => setAttempt((value) => value + 1) }
}

export function AuthPage({ mode }: { mode: 'signIn' | 'verify' }) {
  const [busy, setBusy] = useState(false)
  const verifying = mode === 'verify'
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath = safeReturnPath(params.get('returnPath'))
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const exchange = useWorkspaceExchange(returnPath)
  const verifyState = (location.state as VerifyState) ?? null
  const sentTo = verifyState?.email ?? null
  const flow: EmailFlow = verifyState?.flow ?? (signUp?.status === 'missing_requirements' && signUp.emailAddress ? 'signUp' : 'signIn')
  const ready = exchange.isLoaded && !busy
  async function run(task: () => Promise<void>) {
    setBusy(true)
    try {
      await task()
    } catch (reason) {
      toast.error(clerkErrorText(reason))
    } finally {
      setBusy(false)
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void run(async () => {
      if (verifying) {
        await verifyEmailCode(signIn, signUp, flow, String(form.get('code') ?? ''))
        return
      }
      const email = String(form.get('email') ?? '').trim()
      const started = await sendEmailCode(signIn, signUp, email)
      const query = returnPath ? `?returnPath=${encodeURIComponent(returnPath)}` : ''
      navigate(`/verify${query}`, { state: { email, flow: started } })
    })
  }
  function provider(strategy: ProviderStrategy) {
    void run(() => startProvider(signIn, strategy, returnPath))
  }
  return (
    <AuthShell>
            {exchange.signedIn ? (
              <>
                <h1 className="text-center text-2xl font-bold leading-tight">{exchange.failed ? 'Your workspace is not open yet' : 'Opening your workspace…'}</h1>
                <p role="status" className="mt-3 text-center text-sm leading-6 text-slate-500">{exchange.failed ? 'You are signed in. Try opening your workspace again.' : 'You are signed in. One moment.'}</p>
                {!exchange.failed && <Spinner className="min-h-0 py-6" label="Opening your workspace" />}
                {exchange.failed && <Button type="button" variant="blue" onClick={exchange.retry} className="mt-6 h-12 w-full rounded-xl text-sm font-bold">Try again <ArrowRight size={16} className="ml-2" /></Button>}
              </>
            ) : (
              <>
                <h1 className="text-center text-2xl font-bold leading-tight">{verifying ? 'Check your email' : 'Sign in to ListeningKit'}</h1>
                <p className="mt-3 text-center text-sm leading-6 text-slate-500">{verifying ? (sentTo ? `We sent a 6-digit code to ${sentTo}.` : 'Enter your sign-in code to continue.') : 'Enter your email to sign in or create an account.'}</p>
                {!verifying && (
                  <div className="mt-7 space-y-3">
                    {PROVIDERS.map((item) => (
                      <button key={item.label} type="button" disabled={!ready} onClick={() => provider(item.strategy)} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 hover:border-[#2A8CFF] hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2A8CFF] disabled:cursor-not-allowed disabled:opacity-60">
                        <FontAwesomeIcon icon={item.icon} className="size-5" />
                        Continue with {item.label}
                      </button>
                    ))}
                    <div className="flex items-center gap-3 pt-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div>
                  </div>
                )}
                <form className="mt-6 space-y-5" onSubmit={submit}>
                  <div>
                    <label htmlFor={verifying ? 'code' : 'email'} className="mb-2 block text-sm font-semibold text-slate-700">{verifying ? 'Sign-in code' : 'Email address'}</label>
                    {verifying ? <input id="code" name="code" type="text" inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} autoComplete="one-time-code" required autoFocus placeholder="123456" className={authFieldClass} /> : <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={authFieldClass} />}
                  </div>
                  {!verifying && <div id="clerk-captcha" />}
                  <Button type="submit" variant="blue" disabled={!ready} className="h-12 w-full rounded-xl text-sm font-bold">{busy ? (verifying ? 'Checking…' : 'Sending…') : verifying ? 'Verify code' : 'Send sign-in code'} <ArrowRight size={16} className="ml-2" /></Button>
                </form>
                <p className="mt-5 text-center text-xs text-slate-500">{verifying ? 'Use the code from your sign-in email.' : 'A sign-in code. No password to remember.'}</p>
                {verifying && <Link to={signInPath(returnPath)} className="mt-6 text-center text-sm font-semibold text-[#2A8CFF]">Use a different email</Link>}
              </>
            )}
    </AuthShell>
  )
}
