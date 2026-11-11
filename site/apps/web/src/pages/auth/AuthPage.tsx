import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api, errorText, safeReturnPath, sessionKey, type AuthChallengeView, type SessionView } from '@/lib/controlApi'
import { Button } from '@listeningkit/ui'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { UsecaseLoop } from '@/landing/UsecaseLoop'
import { ClayClouds } from '@/landing/ClayClouds'
import { DitherFade } from '@/landing/useCases/DitherFade'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons'

export function AuthPage({ mode }: { mode: 'signIn' | 'verify' }) {
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const verifying = mode === 'verify'
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const returnPath = safeReturnPath(params.get('returnPath'))
  const challengeId = params.get('challenge')
  const sentTo = params.get('email')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setNotice('')
    try {
      if (verifying) {
        if (!challengeId) {
          setNotice('Ask for a sign-in code first.')
          return
        }
        const session = await api<SessionView>('/auth/email/verify', { method: 'POST', body: { challengeId, code: String(form.get('code') ?? '').replace(/\D/g, '') } })
        queryClient.clear()
        queryClient.setQueryData(sessionKey, session)
        navigate(returnPath ?? (session.selectedTeamId ? '/console/start' : '/teams'), { replace: true })
      } else {
        const email = String(form.get('email') ?? '').trim()
        const challenge = await api<AuthChallengeView>('/auth/email/start', { method: 'POST', body: { email, ...(returnPath ? { returnPath } : {}) } })
        const next = new URLSearchParams({ challenge: challenge.challengeId, email, ...(returnPath ? { returnPath } : {}) })
        navigate(`/verify?${next.toString()}`)
      }
    } catch (error) {
      setNotice(errorText(error))
    } finally {
      setBusy(false)
    }
  }
  const fieldClass = 'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none placeholder:text-slate-400 focus:border-[#2A8CFF] focus:ring-2 focus:ring-[#2A8CFF]/20'
  return (
    <main className="relative min-h-screen overflow-hidden bg-white font-sans text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-white lg:hidden">
        <div className="absolute inset-x-0 top-0 h-[54rem] bg-[#2A8CFF]">
          <DitherFade stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']} cell={5} hold={0.18} className="absolute inset-x-0 bottom-0 h-[46rem]" />
          <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_130%_100%_at_50%_0%,rgba(92,167,255,0.85)_0%,transparent_80%)]" />
          <ClayClouds className="absolute inset-x-0 top-0 h-[18rem] [mask-image:linear-gradient(to_bottom,black_72%,transparent)]" />
        </div>
      </div>
      <div className="relative grid min-h-screen w-full items-stretch lg:grid-cols-2">
        <section className="flex flex-col px-5 pb-6 pt-5 sm:px-10 lg:px-20 lg:py-10 xl:px-32">
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/90 drop-shadow-[0_1px_3px_rgba(6,32,72,0.45)] hover:text-white lg:text-slate-500 lg:drop-shadow-none lg:hover:text-slate-900"><ArrowLeft size={16} /> Back to ListeningKit</Link>
          <div className="mx-auto mt-[8.5rem] flex w-full max-w-sm flex-1 flex-col justify-center rounded-[1.75rem] border-2 border-[#C3D3E8] bg-[#F8FBFF] px-6 py-8 sm:px-8 lg:mt-0 lg:max-w-xs lg:flex-none lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:py-16">
            <Link to="/" aria-label="ListeningKit home" className="mb-6 self-center"><img src="/logo.svg" alt="" className="size-14 rounded-[14px] object-contain" /></Link>
            <h1 className="text-center text-2xl font-bold leading-tight">{verifying ? 'Check your email' : 'Sign in to ListeningKit'}</h1>
            <p className="mt-3 text-center text-sm leading-6 text-slate-500">{verifying ? (sentTo ? `We sent a 6-digit code to ${sentTo}.` : 'Enter your sign-in code to continue.') : 'Enter your email to sign in or create an account.'}</p>
            {!verifying && (
              <div className="mt-7 space-y-3">
                {[{ label: 'Google', icon: faGoogle }, { label: 'GitHub', icon: faGithub }].map((provider) => (
                  <button key={provider.label} type="button" onClick={() => setNotice(`${provider.label} sign-in is not connected yet.`)} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 hover:border-[#2A8CFF] hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2A8CFF]">
                    <FontAwesomeIcon icon={provider.icon} className="size-5" />
                    Continue with {provider.label}
                  </button>
                ))}
                <div className="flex items-center gap-3 pt-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div>
              </div>
            )}
            <form className="mt-6 space-y-5" onSubmit={submit}>
              <div>
                <label htmlFor={verifying ? 'code' : 'email'} className="mb-2 block text-sm font-semibold text-slate-700">{verifying ? 'Sign-in code' : 'Email address'}</label>
                {verifying ? <input id="code" name="code" type="text" inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} autoComplete="one-time-code" required autoFocus placeholder="123456" className={fieldClass} /> : <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={fieldClass} />}
              </div>
              <Button type="submit" variant="blue" disabled={busy} className="h-12 w-full rounded-xl text-sm font-bold">{busy ? (verifying ? 'Checking…' : 'Sending…') : verifying ? 'Verify code' : 'Send sign-in code'} <ArrowRight size={16} className="ml-2" /></Button>
              {notice && <p role="status" className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{notice}</p>}
            </form>
            <p className="mt-5 text-center text-xs text-slate-500">{verifying ? 'Use the code from your sign-in email.' : 'A sign-in code. No password to remember.'}</p>
            {verifying && <Link to={returnPath ? `/sign-in?returnPath=${encodeURIComponent(returnPath)}` : '/sign-in'} className="mt-6 text-center text-sm font-semibold text-[#2A8CFF]">Use a different email</Link>}
          </div>
        </section>
        <aside aria-label="ListeningKit showcase" className="hidden overflow-hidden bg-white p-8 lg:sticky lg:top-0 lg:flex lg:h-screen lg:max-h-screen lg:flex-col lg:justify-center"><div className="flex min-h-0 flex-1 flex-col overflow-hidden"><UsecaseLoop /></div></aside>
      </div>
    </main>
  )
}
