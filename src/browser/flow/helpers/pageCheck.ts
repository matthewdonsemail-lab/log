import type { ErrorCode } from '../../../errors/catalog/index'

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
      if (wantedPath === '/me' || wantedPath === '/me/') return null
      const section = (p: string) => p.split('/').filter(Boolean)[0] ?? ''
      if (path && section(path) !== section(wantedPath)) return { code: 'pageNotReached', detail: `went to ${wanted.pathname}, landed on ${path}` }
    } catch {
    }
  }
  return null
}
