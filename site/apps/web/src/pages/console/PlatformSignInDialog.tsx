import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUser, faCookieBite, faArrowLeft, faEye, faEyeSlash, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { useToast } from '@listeningkit/ui'
import { errorText } from '@/lib/controlApi'
import { signInAccount, type LocalConnection, type SignInAnswer } from './connectionsData'
import type { ConsoleTarget } from './consoleClient'

type SignInPlatform = { service: string; label: string; icon: IconDefinition; summary: string }

const previewCycle = { duration: 7, repeat: Infinity, ease: 'linear' } as const

function PreviewTyping({ text, start, reduced, instant = false }: { text: string; start: number; reduced: boolean; instant?: boolean }) {
  if (reduced) return <>{text}</>
  return <>{[...text].map((character, index) => <motion.span key={index} animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={{ ...previewCycle, times: [0, start + (instant ? 0 : index * 0.012), start + (instant ? 0 : index * 0.012) + 0.002, 0.94, 0.98, 1] }}>{character}</motion.span>)}</>
}

function PreviewStages({ method, reduced }: { method: 'password' | 'cookies'; reduced: boolean }) {
  const first = method === 'password' ? 'Enter your login details' : 'Paste browser cookies'
  if (reduced) return <span className="text-sm font-medium text-slate-500">{first}</span>
  return <span className="grid h-5 items-center justify-items-center text-sm font-medium">
    <motion.span style={{ gridArea: '1 / 1' }} className="text-slate-500" animate={{ opacity: [1, 1, 0, 0, 1] }} transition={{ ...previewCycle, times: [0, 0.42, 0.46, 0.96, 1] }}>{first}</motion.span>
    <motion.span style={{ gridArea: '1 / 1' }} className="inline-flex items-center gap-2 text-slate-600" animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={{ ...previewCycle, times: [0, 0.42, 0.46, 0.70, 0.74, 1] }}><FontAwesomeIcon icon={faSpinner} className="size-3.5 animate-spin" />{method === 'password' ? 'Signing in…' : 'Checking session…'}</motion.span>
    <motion.span style={{ gridArea: '1 / 1' }} className="inline-flex items-center gap-2 text-[#1B6FD6]" animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={{ ...previewCycle, times: [0, 0.70, 0.74, 0.94, 0.98, 1] }}><FontAwesomeIcon icon={faCheck} className="size-3.5" />Session ready</motion.span>
  </span>
}

function SignInMethodPreview({ method }: { method: 'password' | 'cookies' }) {
  const reduced = Boolean(useReducedMotion())
  return <span aria-hidden="true" className="flex h-36 w-full flex-col items-center justify-center gap-3 border-b border-slate-200 bg-slate-100 px-5 py-4">
    {method === 'password' ? <span className="flex w-full max-w-64 flex-col gap-2"><span className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-600"><FontAwesomeIcon icon={faUser} className="size-3.5 text-slate-400" /><span className="whitespace-pre"><PreviewTyping text="demo.user" start={0.05} reduced={reduced} /></span></span><span className="flex h-8 items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-500"><span className="tracking-widest"><PreviewTyping text="••••••••" start={0.24} reduced={reduced} /></span><FontAwesomeIcon icon={faEyeSlash} className="size-3.5 text-slate-400" /></span></span> : <span className="flex w-full max-w-64 flex-col gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-sm"><span className="flex items-center justify-between"><span className="font-mono text-sm font-medium text-slate-400">{'{ }'}</span><FontAwesomeIcon icon={faCookieBite} className="size-4 text-slate-400" /></span><span className="whitespace-pre font-mono text-sm font-normal text-slate-600"><PreviewTyping text={'"name": "session"'} start={0.10} reduced={reduced} instant /></span><span className="whitespace-pre font-mono text-sm font-normal text-slate-500"><PreviewTyping text={'"value": "••••••"'} start={0.10} reduced={reduced} instant /></span></span>}
    <PreviewStages method={method} reduced={reduced} />
  </span>
}

export function PlatformSignInDialog({ platform, target, accounts, onClose, onSignedIn }: { platform: SignInPlatform; target: ConsoleTarget | null; accounts: LocalConnection[]; onClose: () => void; onSignedIn: (answer: SignInAnswer) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const toast = useToast()
  const [method, setMethod] = useState<'password' | 'cookies' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({ account: '', username: '', password: '', cookies: '' })
  const known = accounts.filter((account) => (account.platform === 'twitter' ? 'x' : account.platform) === platform.service)
  const ready = Boolean(target && form.account.trim() && (method === 'password' ? form.username.trim() && form.password : form.cookies.trim()))
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => { document.body.style.overflow = previousOverflow; trigger?.focus() }
  }, [])
  const set = (name: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value }))
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ready || !target || !method || pending) return
    setPending(true)
    try {
      const answer = await signInAccount(target, method === 'password' ? { platform: platform.service, method, account: form.account.trim(), username: form.username.trim(), password: form.password } : { platform: platform.service, method, account: form.account.trim(), cookies: form.cookies })
      setForm({ account: '', username: '', password: '', cookies: '' })
      if (answer.signedIn) toast.success(`${platform.label} signed in`, `${form.account.trim()} is signed in. Its session stays in your workspace.`)
      else if (answer.next === 'browserCheck') toast.success('Login saved', `Finish signing ${form.account.trim()} in from its browser.`)
      else toast.error(`${platform.label} did not sign in`, answer.detail || 'Nothing was saved.')
      onSignedIn(answer)
    } catch (error) {
      toast.error('Sign-in not finished', errorText(error))
    } finally { setPending(false) }
  }
  const field = 'mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

  return <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); if (!pending) onClose() }} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget && !pending) onClose() }} className="m-auto w-[calc(100%-2rem)] max-h-[90dvh] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 font-sans text-slate-900 shadow-xl backdrop:bg-[#0D2A4C]/45 backdrop:backdrop-blur-[2px]">
    <div className="relative p-6 sm:p-7">
      <button type="button" autoFocus disabled={pending} onClick={onClose} aria-label="Close sign-in dialog" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><FontAwesomeIcon icon={faXmark} className="size-4" /></button>
      <div className="flex items-center gap-3 pr-9"><FontAwesomeIcon icon={platform.icon} className="size-8 shrink-0 text-[#0D2A4C]" aria-hidden="true" /><h2 id={titleId} className="min-w-0 text-xl font-semibold tracking-tight">Sign in to {platform.label}</h2></div>
      <p id={descriptionId} className="mt-3 text-sm leading-6 text-slate-600">{!method ? 'Sign in with your username and password, or paste cookies from a browser where you’re already signed in.' : method === 'password' ? `Enter your ${platform.label} username and password.` : `Paste the cookies from your signed-in ${platform.label} browser session.`}</p>
      {!method ? <div className="mb-2 mt-6 flex flex-col gap-3">
        <button type="button" onClick={() => setMethod('password')} className="group flex w-full flex-col overflow-hidden rounded-xl border border-[#2A8CFF] bg-[#2A8CFF] text-sm font-semibold text-white hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"><SignInMethodPreview method="password" /><span className="flex min-h-12 items-center justify-center gap-3 px-4 py-3"><FontAwesomeIcon icon={faUser} className="size-4" />Continue with Username &amp; Password</span></button>
        <button type="button" onClick={() => setMethod('cookies')} className="group flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"><SignInMethodPreview method="cookies" /><span className="flex min-h-12 items-center justify-center gap-3 px-4 py-3"><FontAwesomeIcon icon={faCookieBite} className="size-4" />Paste cookies</span></button>
      </div> : <form className="mt-6" onSubmit={(event) => { void submit(event) }} aria-busy={pending}>
        <button type="button" disabled={pending} onClick={() => { setMethod(null); setShowPassword(false) }} className="mb-5 inline-flex items-center gap-2 rounded-md py-1 text-sm font-semibold text-slate-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><FontAwesomeIcon icon={faArrowLeft} className="size-3.5" />Back</button>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Account<input autoFocus name="account" list={`${titleId}-accounts`} value={form.account} onChange={set('account')} disabled={pending} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder={platform.service === 'x' ? 'The handle, without @' : platform.service === 'linkedin' ? 'The part after linkedin.com/in/' : 'The account’s name in log'} className={field} /></label>
          <datalist id={`${titleId}-accounts`}>{known.map((account) => <option key={account.id} value={account.name} />)}</datalist>
          {method === 'password' ? <>
            <label className="block text-sm font-semibold text-slate-700">Username<input name="username" value={form.username} onChange={set('username')} disabled={pending} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Username or email" className={field} /></label>
            <div><label htmlFor={`${titleId}-password`} className="block text-sm font-semibold text-slate-700">Password</label><div className="relative mt-2"><input id={`${titleId}-password`} name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} disabled={pending} autoComplete="off" className="h-11 w-full rounded-lg border border-slate-300 pl-3 pr-12 text-base outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-blue-600"><FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="size-4" /></button></div></div>
          </> : <label className="block text-sm font-semibold text-slate-700">Cookies<textarea name="cookies" value={form.cookies} onChange={set('cookies')} disabled={pending} autoComplete="off" autoCapitalize="none" spellCheck={false} rows={7} placeholder="Paste your cookies" className="mt-2 w-full resize-y rounded-lg border border-slate-300 p-3 text-sm font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>}
        </div>
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><button type="submit" disabled={!ready || pending} className="inline-flex items-center gap-2 rounded-lg bg-[#2A8CFF] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">{pending ? <><FontAwesomeIcon icon={faSpinner} className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />{method === 'password' ? 'Signing in…' : 'Checking session…'}</> : 'Continue'}</button></div>
      </form>}
    </div>
  </dialog>
}