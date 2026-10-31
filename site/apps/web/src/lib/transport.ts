type TokenProvider = () => Promise<string | null>
let tokenProvider: TokenProvider = async () => null

/** Auth UI supplies fresh access tokens; no hardcoded tokens or localStorage secrets. */
export function setApiTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider
}

export async function requireApiToken(): Promise<string> {
  const token = await tokenProvider()
  if (!token) throw new Error('Sign in before using the live API')
  return token
}

export function apiMode(): 'mock' | 'live' {
  const mode = import.meta.env.VITE_API_MODE ?? 'mock'
  if (mode !== 'mock' && mode !== 'live') throw new Error('VITE_API_MODE must be mock or live')
  return mode
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await tokenProvider()
  if (!token) throw new Error('Sign in before using the live API')
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${base}${path}`, {
    ...init, headers, credentials: 'omit',
    signal: init.signal ?? AbortSignal.timeout(15_000),
  })
}
