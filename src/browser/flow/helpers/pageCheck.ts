import type { ErrorCode } from '../../../errors/catalog/index'

/**
 * Where a step actually landed, checked after every step (Erie, 2026-10-19:
 * `GET /` was answered 302 to /checkpoint/1501092823525282/ and the warm-up
 * scrolled the lock page for a minute, because a step only checked that the
 * browser navigated). Returns the problem, or null when the page is where
 * the step meant to be. Pure.
 */
export function pageProblem(
  step: { action: string; url?: string },
  landed: { url?: string | null; title?: string | null }
): { code: ErrorCode; detail: string } | null {
  const url = landed.url ?? ''
  const path = (() => {
    try {
      return new URL(url).pathname
    } catch {
      return ''
    }
  })()
  if (/^\/checkpoint\b/.test(path)) return { code: 'checkpointed', detail: `Facebook sent the page to ${path} (a checkpoint)` }
  if (/^\/(login|login\.php)\b|^\/two_step_verification/.test(path)) return { code: 'loginWall', detail: `Facebook sent the page to ${path} (signed out)` }
  if (step.action === 'goto' && step.url) {
    try {
      const wanted = new URL(step.url)
      const wantedPath = wanted.pathname.replace(/\{\w+\}/g, '')
      // /me is the account's own profile, which Facebook serves as /profile.php or a vanity path (Harrisburg, 2026-10-19).
      if (wantedPath === '/me' || wantedPath === '/me/') return null
      // A Marketplace page may settle on its city page (/marketplace/<id>/), still Marketplace: only another section is a miss.
      const section = (p: string) => p.split('/').filter(Boolean)[0] ?? ''
      if (path && section(path) !== section(wantedPath)) return { code: 'pageNotReached', detail: `went to ${wanted.pathname}, landed on ${path}` }
    } catch {
      // a goto without a parsable URL is checked by the session itself
    }
  }
  return null
}
