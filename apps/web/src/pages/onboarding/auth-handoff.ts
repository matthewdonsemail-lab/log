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
// The website typed on the landing page, carried through sign-in into the brand step. A plain address only, never a credential.
const WEBSITE_KEY = 'listeningkit.landing-website'
export function saveLandingWebsite(value: string): void {
  const site = value.trim().slice(0, 200)
  if (!site) return
  try { window.sessionStorage.setItem(WEBSITE_KEY, site) } catch { /* The address can be typed again in onboarding. */ }
}
export function readLandingWebsite(): string {
  try { return window.sessionStorage.getItem(WEBSITE_KEY) ?? '' } catch { return '' }
}
export function clearLandingWebsite(): void {
  try { window.sessionStorage.removeItem(WEBSITE_KEY) } catch { /* Storage may be unavailable. */ }
}
export function clearAuthSource(): void {
  try { window.sessionStorage.removeItem(KEY) } catch { /* Storage may be unavailable. */ }
}
