import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@listeningkit/ui'
import { OnboardingRoute, RequireAuth, SignInRoute, SignUpRoute } from '../../components/AuthGate'

const state = vi.hoisted(() => ({ isLoaded: false, isSignedIn: false, sessionId: null as string | null, getToken: vi.fn() }))
vi.mock('@clerk/react', () => ({
  useAuth: () => state,
  useSignIn: () => ({ fetchStatus: 'idle', signIn: { authenticateWithRedirect: vi.fn(), sso: vi.fn() } }),
  useSignUp: () => ({ fetchStatus: 'idle', signUp: { authenticateWithRedirect: vi.fn(), sso: vi.fn() } }),
  SignIn: ({ path, signUpUrl, forceRedirectUrl }: { path: string; signUpUrl: string; forceRedirectUrl: string }) => <div>Local sign-in {path} signup {signUpUrl} return {forceRedirectUrl}</div>,
  SignUp: ({ path, signInUrl, forceRedirectUrl }: { path: string; signInUrl: string; forceRedirectUrl: string }) => <div>Local sign-up {path} signin {signInUrl} return {forceRedirectUrl}</div>,
  UserButton: () => null,
}))
vi.mock('../../pages/onboarding/OnboardingPage', () => ({
  OnboardingPage: ({ requireSignIn }: { requireSignIn?: boolean }) => <div>Existing onboarding; require sign-in: {String(requireSignIn)}</div>,
}))
beforeEach(() => { state.isLoaded = false; state.isSignedIn = false; state.sessionId = null })

const withRouter = (node: React.ReactNode) =>
  renderToStaticMarkup(<MemoryRouter initialEntries={['/']}><ToastProvider>{node}</ToastProvider></MemoryRouter>)

describe('onboarding route', () => {
  it('does not mount workspace views while Clerk is loading', () => {
    expect(withRouter(<OnboardingRoute />)).toContain('Loading sign-in')
  })
  it('gates platform selection behind sign-in while signed out', () => {
    state.isLoaded = true
    expect(withRouter(<OnboardingRoute />)).toContain('Existing onboarding; require sign-in: true')
  })
  it('runs the full flow once signed in', () => {
    state.isLoaded = true; state.isSignedIn = true; state.sessionId = 'session-1'
    expect(withRouter(<OnboardingRoute />)).toContain('Existing onboarding; require sign-in: false')
  })
})

describe('sign-in and sign-up routes', () => {
  it('renders the onboarding-styled sign-in screen while signed out', () => {
    state.isLoaded = true
    const html = withRouter(<SignInRoute />)
    expect(html).toContain('Local sign-in /sign-in signup /sign-up return /onboarding')
    expect(html).toContain('Sign In')
    expect(html).toContain('Google')
    expect(html).toContain('GitHub')
  })
  it('renders the onboarding-styled sign-up screen while signed out', () => {
    state.isLoaded = true
    const html = withRouter(<SignUpRoute />)
    expect(html).toContain('Local sign-up /sign-up signin /sign-in return /onboarding')
    expect(html).toContain('Sign Up')
  })
  it.each([<SignInRoute key="in" />, <SignUpRoute key="up" />])('redirects signed-in visitors to onboarding (%#)', (route) => {
    state.isLoaded = true; state.isSignedIn = true; state.sessionId = 'session-1'
    const html = withRouter(route)
    expect(html).not.toContain('Local sign-')
    expect(html).not.toContain('Welcome back')
    expect(html).not.toContain('Create your workspace')
  })
})

describe('dashboard protection', () => {
  const render = () => withRouter(<RequireAuth><div>Private workspace</div></RequireAuth>)
  it('does not mount workspace views while Clerk is loading', () => {
    expect(render()).toContain('Loading sign-in')
    expect(render()).not.toContain('Private workspace')
  })
  it('bounces signed-out visitors to onboarding instead of workspace content', () => {
    state.isLoaded = true
    expect(render()).not.toContain('Private workspace')
  })
  it('waits for token-provider setup before mounting signed-in workspace views', () => {
    state.isLoaded = true; state.isSignedIn = true; state.sessionId = 'session-1'
    expect(render()).toContain('Preparing your workspace')
    expect(render()).not.toContain('Private workspace')
  })
})
