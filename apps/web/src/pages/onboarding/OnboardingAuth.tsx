import { SignIn, SignUp, useSignIn, useSignUp } from '@clerk/react'
import { useState } from 'react'
import { siGithub, siGoogle } from 'simple-icons'
import { useToast } from '@listeningkit/ui'
import { UsecaseLoop } from '@/landing/UsecaseLoop'
import { OnboardingShell } from './OnboardingShell'
import { OnboardingLoading } from './OnboardingLoading'

/**
 * Auth is a continuation of onboarding, not a second app shell: one white
 * panel on the brand-blue backdrop, same recipe as the step-2 token card
 * (white, large radius, slate-900 ink). Clerk's own header is hidden — the
 * page headline already says what this screen is — and Clerk's card chrome
 * is dissolved so fields and buttons read as native onboarding controls
 * (h-12, rounded-xl, brand-blue primary).
 */
const appearance = {
  variables: {
    colorPrimary: '#2A8CFF',
    colorText: '#0F172A',
    colorTextSecondary: '#475569',
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif",
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    card: 'w-full bg-transparent p-0 shadow-none',
    header: 'hidden',
    // Provider choice lives in our own platform cards below — never two pickers.
    socialButtonsBlockButton: 'hidden',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-sm text-slate-500',
    formFieldLabel: 'text-sm font-semibold text-slate-700',
    formFieldInput:
      '!h-12 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#2A8CFF]',
    formButtonPrimary:
      'h-12 rounded-xl bg-[#2A8CFF] text-sm font-bold text-white hover:bg-[#1f7bef] shadow-none',
    footer: 'bg-transparent',
    footerAction: 'bg-transparent',
    footerPages: 'bg-transparent',
    footerActionText: 'text-sm text-slate-500',
    footerActionLink: 'font-semibold text-[#2A8CFF] hover:text-[#1f7bef]',
  },
}

const COPY = {
  'sign-in': {
    title: 'Sign In',
    subtitle: '',
  },
  'sign-up': {
    title: 'Sign Up',
    subtitle: '',
  },
} as const

type OAuthProvider = {
  id: string
  label: string
  strategy: 'oauth_google' | 'oauth_github'
  icon: { path: string }
}

const OAUTH_PROVIDERS: OAuthProvider[] = [
  { id: 'google', label: 'Google', strategy: 'oauth_google', icon: siGoogle },
  { id: 'github', label: 'GitHub', strategy: 'oauth_github', icon: siGithub },
]

/**
 * Starts the OAuth handoff for either mode. Prefers the classic redirect flow
 * (the one Clerk's path-routed <SignIn>/<SignUp> knows how to finalize at
 * …/sso-callback) and falls back to the newer `sso()` API only when the
 * classic entry point is absent at runtime.
 */
async function startOAuth(
  resource: unknown,
  mode: 'sign-in' | 'sign-up',
  provider: OAuthProvider,
  redirectTo = '/onboarding',
): Promise<void> {
  const callback = mode === 'sign-in' ? '/sign-in/sso-callback' : '/sign-up/sso-callback'
  const target = resource as unknown as {
    authenticateWithRedirect?: (params: {
      strategy: OAuthProvider['strategy']
      redirectUrl: string
      redirectUrlComplete: string
    }) => Promise<unknown>
    sso?: (params: {
      strategy: OAuthProvider['strategy']
      redirectUrl: string
      redirectCallbackUrl: string
    }) => Promise<unknown>
  }
  if (typeof target.authenticateWithRedirect === 'function') {
    await target.authenticateWithRedirect({
      strategy: provider.strategy,
      redirectUrl: callback,
      redirectUrlComplete: redirectTo,
    })
    return
  }
  if (typeof target.sso === 'function') {
    await target.sso({ strategy: provider.strategy, redirectUrl: redirectTo, redirectCallbackUrl: callback })
    return
  }
  throw new Error('OAuth is not available right now — try email sign-in instead.')
}

/**
 * Provider choice as onboarding platform cards — same visual language as the
 * "Where should we listen?" step. Clicking a card starts the OAuth handoff
 * immediately (the redirect IS the action, not a form step). The email form
 * below stays rendered by Clerk, so password/username flows keep working.
 */
function OAuthCards({ mode, redirectTo = '/onboarding' }: { mode: 'sign-in' | 'sign-up'; redirectTo?: string }) {
  const signInState = useSignIn()
  const signUpState = useSignUp()
  const toast = useToast()
  const [pending, setPending] = useState<string | null>(null)

async function start(provider: OAuthProvider) {
    if (pending) return
    setPending(provider.id)
    try {
      if (mode === 'sign-in') {
        if (signInState.fetchStatus === 'fetching' || !signInState.signIn) throw new Error('Sign-in is still loading — try again in a moment.')
         await startOAuth(signInState.signIn, mode, provider, redirectTo)
      } else {
        if (signUpState.fetchStatus === 'fetching' || !signUpState.signUp) throw new Error('Sign-up is still loading — try again in a moment.')
         await startOAuth(signUpState.signUp, mode, provider, redirectTo)
      }
    } catch (err) {
      setPending(null)
      toast.error('Could not start sign-in', err instanceof Error ? err.message : 'Try again in a moment.')
    }
  }

  return (
    <div>
      <div className="mt-3 grid w-full grid-cols-1 gap-3">
        {OAUTH_PROVIDERS.map((provider) => {
          const isPending = pending === provider.id
          return (
              <button
                key={provider.id}
                type="button"
                onClick={() => start(provider)}
                disabled={pending !== null}
                className="flex min-h-12 flex-row items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 hover:border-[#2A8CFF] hover:bg-[#EFF6FF] disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" role="img" aria-label={provider.label} className="size-6 shrink-0" fill="currentColor">
                  <path d={provider.icon.path} />
                </svg>
                <span className="whitespace-nowrap text-base font-bold">
                  {isPending ? 'Redirecting…' : `Continue with ${provider.label}`}
                </span>
              </button>
          )
        })}
      </div>
    </div>
  )
}

export function OnboardingAuth({ mode, riskNotice = false, redirectTo = '/onboarding' }: { mode: 'sign-in' | 'sign-up'; riskNotice?: boolean; redirectTo?: string }) {
  const copy = COPY[mode]
  return (
    <OnboardingShell hero={false} tone="white">
      {/* No clouds hero on the auth screens — the two-grid card is the header. */}
      <main className="relative flex w-full flex-1 flex-col">
        <div className="grid w-full flex-1 items-stretch text-left lg:grid-cols-2">
          <div className="bg-white p-8 lg:p-32">
            <div className="mx-auto w-full max-w-xs text-center">
            <a href="/" aria-label="ListeningKit home" className="mb-6 inline-block">
              <img src="/logo.svg" alt="ListeningKit logo" className="size-14 rounded-[14px] object-contain" />
            </a>
            <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{copy.title}</h1>
            {copy.subtitle ? <p className="mt-4 text-lg text-slate-600">{copy.subtitle}</p> : null}
            {riskNotice && (
              <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900" role="note">
                <p className="font-bold">You are connecting your account</p>
                <p className="mt-1 text-amber-800">
                  ListeningKit will use your account to connect the services you choose. Only continue on a computer you trust.
                  If your computer is compromised, saved sessions and connected accounts may be at risk.
                </p>
              </div>
            )}
            <div className="lk-clerk mt-6 text-left">
              <OAuthCards mode={mode} redirectTo={redirectTo} />
              {mode === 'sign-in' ? (
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl={redirectTo} appearance={appearance} />
              ) : (
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl={redirectTo} appearance={appearance} />
              )}
            </div>
            <a href="/onboarding" className="mt-6 inline-block text-sm font-semibold text-slate-500 underline decoration-dashed underline-offset-4 hover:text-slate-800">Back to platform selection</a>
            </div>
          </div>
          {/* Pinned to the viewport on desktop: the showcase is always
              exactly full height, never stretched by the form's height and
              never collapsed. The form half scrolls beside it. */}
          <div className="flex flex-col justify-center bg-white p-8 lg:sticky lg:top-0 lg:h-screen">
            <div className="flex min-h-0 flex-1 flex-col">
              <UsecaseLoop />
            </div>
          </div>
        </div>
      </main>
    </OnboardingShell>
  )
}

export function OnboardingAuthLoading({ children }: { children: string }) {
  return (
    <OnboardingShell hero={false} tone="white">
      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center sm:px-10">
        <OnboardingLoading message={children} />
      </main>
    </OnboardingShell>
  )
}
