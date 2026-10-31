import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getAccounts, createAccount, testConnection, connectAccount } from '../connections'
import { setApiTokenProvider } from '../transport'

beforeEach(() => {
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_API_BASE_URL', '/api')
  setApiTokenProvider(async () => 'access-token')
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); setApiTokenProvider(async () => null) })

it('uses live account routes, without falling back to the seeded roster', async () => {
  const account = { id: 'a', platform: 'reddit', label: 'Reddit', connectedAt: null }
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ accounts: [] }))
    .mockResolvedValueOnce(Response.json({ account, accounts: [account] }, { status: 201 }))
  vi.stubGlobal('fetch', fetcher)
  expect(await getAccounts()).toEqual([])
  expect(await createAccount('reddit')).toEqual(account)
  expect(fetcher.mock.calls.map(call => call[0])).toEqual(['/api/accounts', '/api/accounts'])
})

it('requires sign-in before any network access', async () => {
  setApiTokenProvider(async () => null)
  const fetcher = vi.fn()
  vi.stubGlobal('fetch', fetcher)
  await expect(getAccounts()).rejects.toThrow('Sign in')
  expect(fetcher).not.toHaveBeenCalled()
})

it('never pretends a live cookie/session was verified', async () => {
  const input = { id: 'a', platform: 'reddit' as const, cookie: 'placeholder' }
  await expect(testConnection(input)).rejects.toThrow('not implemented')
  await expect(connectAccount(input)).rejects.toThrow('not implemented')
})
