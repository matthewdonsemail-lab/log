import { describe, expect, it, vi } from 'vitest'
import type { SessionView } from '@/lib/controlApi'
import { clerkErrorText, exchangeClerkSession, nextPath, sendEmailCode, startProvider, verifyEmailCode, type EmailSignIn, type EmailSignUp } from '../clerkFlow'

const ok = () => Promise.resolve({ error: null })
const apiError = (code: string, longMessage: string) => ({ errors: [{ code, message: 'short', longMessage }] })

function clerk(overrides: { signIn?: Partial<EmailSignIn>; signUp?: Partial<EmailSignUp>; signInStatus?: string; signUpStatus?: string } = {}) {
  const signIn = {
    status: overrides.signInStatus ?? 'complete',
    create: vi.fn(ok),
    emailCode: { sendCode: vi.fn(ok), verifyCode: vi.fn(ok) },
    sso: vi.fn(ok),
    finalize: vi.fn(ok),
    ...overrides.signIn,
  }
  const signUp = {
    status: overrides.signUpStatus ?? 'complete',
    create: vi.fn(ok),
    verifications: { sendEmailCode: vi.fn(ok), verifyEmailCode: vi.fn(ok) },
    finalize: vi.fn(ok),
    ...overrides.signUp,
  }
  return { signIn, signUp }
}

const session = (selectedTeamId: string | null): SessionView => ({ user: { id: 'user1', email: 'person@example.com', emailVerified: true }, teams: [], selectedTeamId, expiresAt: '2026-12-01T00:00:00Z' })

describe('email code', () => {
  it('signs in an existing email with an email code', async () => {
    const { signIn, signUp } = clerk()
    await expect(sendEmailCode(signIn, signUp, 'person@example.com')).resolves.toBe('signIn')
    expect(signIn.create).toHaveBeenCalledWith({ identifier: 'person@example.com' })
    expect(signIn.emailCode.sendCode).toHaveBeenCalledWith({ emailAddress: 'person@example.com' })
    expect(signUp.create).not.toHaveBeenCalled()
  })

  it('signs up a new email with an email code', async () => {
    const { signIn, signUp } = clerk({ signIn: { create: vi.fn(() => Promise.resolve({ error: apiError('form_identifier_not_found', 'No account') })) } })
    await expect(sendEmailCode(signIn, signUp, 'new@example.com')).resolves.toBe('signUp')
    expect(signUp.create).toHaveBeenCalledWith({ emailAddress: 'new@example.com' })
    expect(signUp.verifications.sendEmailCode).toHaveBeenCalled()
    expect(signIn.emailCode.sendCode).not.toHaveBeenCalled()
  })

  it('raises any other Clerk error with its long message', async () => {
    const { signIn, signUp } = clerk({ signIn: { create: vi.fn(() => Promise.resolve({ error: apiError('form_param_format_invalid', 'Email address must be a valid email address.') })) } })
    await expect(sendEmailCode(signIn, signUp, 'nope')).rejects.toThrow('Email address must be a valid email address.')
    expect(signUp.create).not.toHaveBeenCalled()
  })

  it('verifies a sign-in code and activates the session', async () => {
    const { signIn, signUp } = clerk()
    await verifyEmailCode(signIn, signUp, 'signIn', '123 456')
    expect(signIn.emailCode.verifyCode).toHaveBeenCalledWith({ code: '123456' })
    expect(signIn.finalize).toHaveBeenCalled()
  })

  it('verifies a sign-up code and activates the session', async () => {
    const { signIn, signUp } = clerk()
    await verifyEmailCode(signIn, signUp, 'signUp', '654321')
    expect(signUp.verifications.verifyEmailCode).toHaveBeenCalledWith({ code: '654321' })
    expect(signUp.finalize).toHaveBeenCalled()
    expect(signIn.finalize).not.toHaveBeenCalled()
  })

  it('does not activate a session when the code is wrong', async () => {
    const { signIn, signUp } = clerk({ signIn: { emailCode: { sendCode: vi.fn(ok), verifyCode: vi.fn(() => Promise.resolve({ error: apiError('form_code_incorrect', 'Incorrect code') })) } } })
    await expect(verifyEmailCode(signIn, signUp, 'signIn', '000000')).rejects.toThrow('Incorrect code')
    expect(signIn.finalize).not.toHaveBeenCalled()
  })

  it('stops when the sign-in needs another step', async () => {
    const { signIn, signUp } = clerk({ signInStatus: 'needs_second_factor' })
    await expect(verifyEmailCode(signIn, signUp, 'signIn', '123456')).rejects.toThrow('another sign-in step')
    expect(signIn.finalize).not.toHaveBeenCalled()
  })
})

describe('providers', () => {
  it('redirects to Google and GitHub through the SSO callback', async () => {
    const { signIn } = clerk()
    await startProvider(signIn, 'oauth_google', '/console/connections')
    expect(signIn.sso).toHaveBeenCalledWith({ strategy: 'oauth_google', redirectUrl: '/sign-in?returnPath=%2Fconsole%2Fconnections', redirectCallbackUrl: '/sso-callback?returnPath=%2Fconsole%2Fconnections' })
    await startProvider(signIn, 'oauth_github', null)
    expect(signIn.sso).toHaveBeenLastCalledWith({ strategy: 'oauth_github', redirectUrl: '/sign-in', redirectCallbackUrl: '/sso-callback' })
  })

  it('raises a disabled provider as an error message', async () => {
    const { signIn } = clerk({ signIn: { sso: vi.fn(() => Promise.resolve({ error: apiError('strategy_for_user_invalid', 'GitHub is not enabled.') })) } })
    await expect(startProvider(signIn, 'oauth_github', null)).rejects.toThrow('GitHub is not enabled.')
  })
})

describe('workspace exchange', () => {
  it('posts the Clerk token and picks where to go', async () => {
    const post = vi.fn(() => Promise.resolve(session('team1')))
    const result = await exchangeClerkSession(() => Promise.resolve('jwt'), post)
    expect(post).toHaveBeenCalledWith('jwt')
    expect(nextPath(result, '/console/usage')).toBe('/console/usage')
    expect(nextPath(result, null)).toBe('/console/start')
    expect(nextPath(result, '//elsewhere')).toBe('/console/start')
    expect(nextPath(session(null), '/console/usage')).toBe('/teams')
  })

  it('reads Clerk error text', () => {
    expect(clerkErrorText({ longMessage: 'Long', message: 'Short' })).toBe('Long')
    expect(clerkErrorText(new Error('Plain'))).toBe('Plain')
    expect(clerkErrorText(null)).toBe('Sign-in did not go through. Try again.')
  })
})
