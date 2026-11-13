declare global {
  interface Window {
    logConsoleMode?: string
  }
}

export const localConsole = typeof window !== 'undefined' && window.logConsoleMode === 'local'

export const LOCAL_NO_TEAM = 'local: no team or billing. Run log login to sign in to a team.'

export async function localApi<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('consoleWorkspaceUnavailable')
  const body = await response.json()
  if (!body || typeof body !== 'object' || body.schemaVersion !== 1) throw new Error('consoleResponseInvalid')
  return body as T
}
