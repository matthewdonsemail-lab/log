const PATTERNS: readonly [RegExp, string][] = [
  [/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '<redacted jwt>'],
  [/([a-z][a-z0-9+.-]*:\/\/)[^\s:/@]+:[^\s@/]+@/gi, '$1<redacted>@'],
  [/\b((?:api[_-]?key|secret|token|password|passwd|pin|totp[_-]?secret|private[_-]?key|auth[_-]?tag)\s*[:=]\s*)["']?[^\s"'`,;]{6,}/gi, '$1<redacted>'],
  [/\b(?:sk|pk|rk|ghp|gho|xox[abpr])[-_][A-Za-z0-9_-]{16,}/g, '<redacted key>'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '<redacted private key>'],
]

function entropy(text: string): number {
  const counts = new Map<string, number>()
  for (const c of text) counts.set(c, (counts.get(c) ?? 0) + 1)
  let bits = 0
  for (const n of counts.values()) bits -= (n / text.length) * Math.log2(n / text.length)
  return bits
}

export function looksRandom(token: string, minLength = 24): boolean {
  if (token.length < minLength || /^[A-Za-z][a-z]+(?:[A-Z][a-z]+|[A-Z](?![a-z])|[0-9])*$/.test(token)) return false
  const kinds = [/[a-z]/, /[A-Z]/, /\d/].filter((r) => r.test(token)).length
  return kinds >= 2 && /\d/.test(token) && entropy(token) > 4
}

const core = (token: string) => token.replace(/[+=_\-/]/g, '')

function secretLike(token: string): boolean {
  if (!looksRandom(core(token))) return false
  if (!token.includes('/')) return true
  return token.split('/').some((part) => looksRandom(core(part), 16))
}

export function scrubSecrets(text: string): string {
  const named = PATTERNS.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text)
  return named.replace(/[A-Za-z0-9_\-+/=]{24,}/g, (token) => (secretLike(token) ? '<redacted>' : token))
}
