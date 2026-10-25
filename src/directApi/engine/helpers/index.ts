import type { FacebookAccount } from '../../../marketplace/socialAccount/index'
import type { EngineAnswer, SessionState } from '../types'

interface Cookie { name: string; value: string; domain?: string; path?: string; expires?: number; httpOnly?: boolean }

export function cookiesOf(account: Pick<FacebookAccount, 'cookies'>): Cookie[] {
  const raw = account.cookies as unknown
  if (Array.isArray(raw)) return raw as Cookie[]
  if (typeof raw === 'string' && raw) {
    try {
      return JSON.parse(raw) as Cookie[]
    } catch {
      return []
    }
  }
  return []
}

export function accountHasSession(account: Pick<FacebookAccount, 'cookies'>): boolean {
  const names = new Set(cookiesOf(account).map((c) => c.name))
  return names.has('c_user') && names.has('xs')
}

export function netscape(cookies: Cookie[]): string {
  const lines = ['# Netscape HTTP Cookie File']
  for (const c of cookies) {
    const domain = c.domain?.startsWith('.') ? c.domain : `.${(c.domain || 'facebook.com').replace(/^\./, '')}`
    const expiry = c.expires && c.expires > 0 ? Math.floor(c.expires) : 9999999999
    const row = `${domain}\tTRUE\t${c.path || '/'}\tTRUE\t${expiry}\t${c.name}\t${c.value}`
    lines.push(c.httpOnly ? `#HttpOnly_${row}` : row)
  }
  return lines.join('\n') + '\n'
}

export function sessionStateOf(answer: EngineAnswer): SessionState | null {
  if (answer.code === 'accountWarning' || answer.accountWarnings?.length) return 'accountWarning'
  return answer.loginState ?? null
}

export function lastJsonLine(stdout: string): EngineAnswer | null {
  const line = stdout.trim().split('\n').filter(Boolean).pop() || ''
  try {
    return JSON.parse(line) as EngineAnswer
  } catch {
    return null
  }
}
