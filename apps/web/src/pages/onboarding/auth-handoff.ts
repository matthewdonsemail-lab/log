// Persist only the confirmed platform choice across OAuth; never cookies/tokens.
const KEY = 'listeningkit.onboarding-auth-source'
export function readAuthSource(): string | null {
  try {
    const source = window.sessionStorage.getItem(KEY)
    return source === 'facebook' || source === 'x' || source === 'reddit' ? source : null
  } catch { return null }
}
export function saveAuthSource(source: string): void {
  if (!['facebook', 'x', 'reddit'].includes(source)) return
  try { window.sessionStorage.setItem(KEY, source) } catch { /* Choice can be made again after login. */ }
}
export function clearAuthSource(): void {
  try { window.sessionStorage.removeItem(KEY) } catch { /* Storage may be unavailable. */ }
}
