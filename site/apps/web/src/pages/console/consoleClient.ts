import { api, ControlError } from '@/lib/controlApi'

export type ConsoleTarget = { kind: 'local' } | { kind: 'hosted'; teamId: string }
export type ConsoleRoute = { local: string; hosted: string; method?: 'GET' | 'POST' }

export const CONSOLE_MESSAGES: Record<string, string> = {
  consoleWorkspaceAccessDenied: 'This console only answers on this machine.',
  consoleWorkspaceUnavailable: 'Your workspace could not answer. Try again in a moment.',
  consoleResponseInvalid: 'Your workspace sent an answer this page does not understand. Update log and try again.',
  consoleOperationUnknown: 'Update log in your workspace, then try again.',
  operationPending: 'Your workspace is still working on it. The page updates when it finishes.',
  credentialInputInvalid: 'Enter a complete key without quotes or line breaks.',
  credentialRejected: 'The provider rejected this key. Check it and try again.',
  credentialRateLimited: 'The provider is rate limiting checks. Try again later.',
  credentialValidationUnavailable: 'The provider could not confirm this key. Your saved key has not changed.',
  credentialSaveUnconfirmed: 'The saved settings did not match your changes. Your changes are still here.',
  browserProviderUnavailable: 'AdsPower did not answer at that URL. Open AdsPower and check its Local API.',
  accountNotFound: 'That account is not in your workspace any more. Refresh and try again.',
  accountCheckBusy: 'Another account check is running. Try again when it finishes.',
  accountCheckStopped: 'Resolve the recorded stop in log before checking again.',
  accountDeactivated: 'This account is deactivated.',
  browserCheckRequired: 'This account is checked in its own browser.',
  accountCheckUnavailable: 'The status check could not be completed. Your last recorded status is still shown.',
  signInInputInvalid: 'Check the account name and what you pasted, then try again.',
  cookieSignInUnavailable: 'This platform does not sign in with pasted cookies. Use its browser sign-in.',
  passwordSignInUnavailable: 'This platform does not sign in with a username and password here. Paste cookies or use its browser sign-in.',
  cookiesIncomplete: 'Those cookies are missing one the platform needs. Copy them again from a signed-in browser.',
  signInBusy: 'Another sign-in is running. Try again when it finishes.',
  usageRangeInvalid: 'Pick 1, 7 or 30 days.',
}

export function consoleError(status: number, code: string): ControlError {
  return new ControlError(status, code, CONSOLE_MESSAGES[code] ?? 'Something went wrong. Try again.')
}

export function routeUrl(target: ConsoleTarget, route: ConsoleRoute): string {
  return target.kind === 'local' ? route.local : `/api/v1/teams/${encodeURIComponent(target.teamId)}${route.hosted}`
}

export async function consoleRequest(target: ConsoleTarget, route: ConsoleRoute, init: { body?: unknown; signal?: AbortSignal } = {}): Promise<unknown> {
  const method = route.method ?? 'GET'
  if (target.kind === 'hosted') {
    try {
      return await api<unknown>(`/teams/${encodeURIComponent(target.teamId)}${route.hosted}`, { method, body: init.body, signal: init.signal })
    } catch (error) {
      if (error instanceof ControlError && CONSOLE_MESSAGES[error.code]) throw consoleError(error.status, error.code)
      throw error
    }
  }
  const headers: Record<string, string> = { accept: 'application/json' }
  if (method === 'POST') Object.assign(headers, { 'content-type': 'application/json', 'x-log-console': '1' })
  const response = await fetch(route.local, { method, headers, body: init.body === undefined ? undefined : JSON.stringify(init.body), credentials: 'same-origin', cache: 'no-store', signal: init.signal })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw consoleError(response.status, typeof body?.error === 'string' ? body.error : 'consoleWorkspaceUnavailable')
  return body
}

export function targetKey(target: ConsoleTarget | null): string {
  return target?.kind === 'hosted' ? target.teamId : target?.kind ?? 'none'
}
