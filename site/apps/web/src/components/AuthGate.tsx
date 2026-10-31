import { useAuth } from '@clerk/react'
import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { setApiTokenProvider } from '../lib/transport'
import { OnboardingPage } from '../pages/onboarding/OnboardingPage'
import { OnboardingAuth, OnboardingAuthLoading } from '../pages/onboarding/OnboardingAuth'

/**
 * Always mounted inside the Router. Wires the live-API token provider to the
 * Clerk session and remounts the tree on session changes so cached queries
 * are never shared across users.
 */
export function AuthSetup({ children }: { children: ReactNode }) {
  const { isSignedIn, sessionId, getToken } = useAuth()

  useEffect(() => {
    setApiTokenProvider(async () => (isSignedIn ? getToken({ template: 'convex' }) : null))
    return () => setApiTokenProvider(async () => null)
  }, [getToken, isSignedIn])

  return <Fragment key={sessionId ?? 'signed-out'}>{children}</Fragment>
}

/** Signed-out visitors start at platform selection; Continue routes them through sign-in. */
export function OnboardingRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-in…</OnboardingAuthLoading>
  return <OnboardingPage requireSignIn={!isSignedIn} />
}

/** Auth screens continue the onboarding shell — signed-in users skip straight to it. */
export function SignInRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-in…</OnboardingAuthLoading>
  if (isSignedIn) return <Navigate to="/onboarding" replace />
  return <OnboardingAuth mode="sign-in" />
}

export function SignUpRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-in…</OnboardingAuthLoading>
  if (isSignedIn) return <Navigate to="/onboarding" replace />
  return <OnboardingAuth mode="sign-up" />
}

/** Dedicated extension/API entry point with the connection risk notice. */
export function AuthRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-in…</OnboardingAuthLoading>
  if (isSignedIn) return <Navigate to="/dashboard/settings" replace />
  return <OnboardingAuth mode="sign-in" riskNotice redirectTo="/dashboard/settings" />
}

/** Dashboard content stays protected — signed-out visits bounce to onboarding. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, sessionId } = useAuth()
  const [readySession, setReadySession] = useState<string | null>(null)

  useEffect(() => {
    setReadySession(isSignedIn ? (sessionId ?? null) : null)
  }, [isSignedIn, sessionId])

  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-in…</OnboardingAuthLoading>
  if (!isSignedIn) return <Navigate to="/onboarding" replace />
  if (readySession !== sessionId) return <OnboardingAuthLoading>Preparing your workspace…</OnboardingAuthLoading>
  return <Fragment key={sessionId}>{children}</Fragment>
}
