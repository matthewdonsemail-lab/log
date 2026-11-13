import { safeReturnPath, type SessionView } from '@/lib/controlApi'

type ClerkResult = Promise<{ error: unknown }>
type Finalize = (params?: { navigate?: () => void }) => ClerkResult

export type EmailSignIn = {
  readonly status: string
  create: (params: { identifier: string }) => ClerkResult
  emailCode: {
    sendCode: (params: { emailAddress: string }) => ClerkResult
    verifyCode: (params: { code: string }) => ClerkResult
  }
  sso: (params: { strategy: ProviderStrategy; redirectUrl: string; redirectCallbackUrl: string }) => ClerkResult
  finalize: Finalize
}

export type EmailSignUp = {
  readonly status: string
  create: (params: { emailAddress: string }) => ClerkResult
  verifications: {
    sendEmailCode: () => ClerkResult
    verifyEmailCode: (params: { code: string }) => ClerkResult
  }
  finalize: Finalize
}

export type EmailFlow = 'signIn' | 'signUp'
export type ProviderStrategy = 'oauth_google' | 'oauth_github'

const FALLBACK = 'Sign-in did not go through. Try again.'
const UNKNOWN_EMAIL = new Set(['form_identifier_not_found', 'form_identifier_not_found_for_sign_in'])

type ErrorShape = { code?: unknown; message?: unknown; longMessage?: unknown; errors?: { code?: unknown; message?: unknown; longMessage?: unknown }[] }

function first(error: unknown): { code: string; text: string } {
  if (!error || typeof error !== 'object') return { code: '', text: FALLBACK }
  const shaped = error as ErrorShape
  const inner = Array.isArray(shaped.errors) ? shaped.errors[0] : undefined
  const pick = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : '')
  const code = pick(inner?.code) || pick(shaped.code)
  const text = pick(inner?.longMessage) || pick(inner?.message) || pick(shaped.longMessage) || pick(shaped.message) || FALLBACK
  return { code, text }
}

export function clerkErrorText(error: unknown): string {
  return first(error).text
}

export class ClerkFlowError extends Error {}

function check({ error }: { error: unknown }) {
  if (error) throw new ClerkFlowError(clerkErrorText(error))
}

export async function sendEmailCode(signIn: EmailSignIn, signUp: EmailSignUp, email: string): Promise<EmailFlow> {
  const started = await signIn.create({ identifier: email })
  if (started.error) {
    if (!UNKNOWN_EMAIL.has(first(started.error).code)) check(started)
    check(await signUp.create({ emailAddress: email }))
    check(await signUp.verifications.sendEmailCode())
    return 'signUp'
  }
  check(await signIn.emailCode.sendCode({ emailAddress: email }))
  return 'signIn'
}

export async function verifyEmailCode(signIn: EmailSignIn, signUp: EmailSignUp, flow: EmailFlow, code: string) {
  const clean = code.replace(/\D/g, '')
  if (flow === 'signUp') {
    check(await signUp.verifications.verifyEmailCode({ code: clean }))
    if (signUp.status !== 'complete') throw new ClerkFlowError('This sign-up needs more details than an email code. Try again.')
    check(await signUp.finalize({ navigate: () => {} }))
    return
  }
  check(await signIn.emailCode.verifyCode({ code: clean }))
  if (signIn.status !== 'complete') throw new ClerkFlowError('This account needs another sign-in step. Try again.')
  check(await signIn.finalize({ navigate: () => {} }))
}

export function signInPath(returnPath: string | null) {
  return returnPath ? `/sign-in?returnPath=${encodeURIComponent(returnPath)}` : '/sign-in'
}

export async function startProvider(signIn: EmailSignIn, strategy: ProviderStrategy, returnPath: string | null) {
  const query = returnPath ? `?returnPath=${encodeURIComponent(returnPath)}` : ''
  check(await signIn.sso({ strategy, redirectUrl: signInPath(returnPath), redirectCallbackUrl: `/sso-callback${query}` }))
}

export async function exchangeClerkSession(getToken: () => Promise<string | null>, post: (token: string | null) => Promise<SessionView>) {
  return post(await getToken())
}

export function nextPath(session: SessionView, returnPath: string | null) {
  return session.selectedTeamId ? safeReturnPath(returnPath) ?? '/console/start' : '/teams'
}
