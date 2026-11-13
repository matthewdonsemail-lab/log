import { HandleSSOCallback } from '@clerk/react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { safeReturnPath } from '@/lib/controlApi'
import { toast } from '@listeningkit/ui'
import { signInPath } from './clerkFlow'

export function SsoCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const back = signInPath(safeReturnPath(params.get('returnPath')))
  const unfinished = (message: string) => {
    toast.error(message)
    navigate(back, { replace: true })
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 py-12 font-sans text-slate-900">
      <Link to="/" aria-label="ListeningKit home"><img src="/logo.svg" alt="" className="size-14 rounded-[14px] object-contain" /></Link>
      <p role="status" className="text-sm text-slate-500">Finishing sign-in…</p>
      <HandleSSOCallback
        navigateToApp={() => navigate(back, { replace: true })}
        navigateToSignIn={() => unfinished('This account needs another sign-in step. Sign in with your email code instead.')}
        navigateToSignUp={() => unfinished('This sign-up needs more details. Sign in with your email code instead.')}
      />
      <Link to={back} className="text-sm font-semibold text-[#2A8CFF]">Back to sign in</Link>
    </main>
  )
}
