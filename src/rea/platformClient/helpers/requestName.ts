import { endpointName } from '../../facebookClient/index'

const PARAM_AFTER = new Set(['r', 'u', 'user'])

const NAMED_AFTER = new Set(['communityHoverCard', 'subredditPostingEligibilityModal'])

export function camelOf(text: string): string {
  return text.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase())
}

export function stablePath(path: string): string {
  const kept: string[] = []
  const parts = path.split('/').filter(Boolean)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (PARAM_AFTER.has(part)) {
      i++
      continue
    }
    if (/\d/.test(part) || /^[A-Z]/.test(part) || (/^[A-Za-z]{6}$/.test(part) && /[a-z]/.test(part) && /[A-Z]/.test(part))) continue
    kept.push(part)
    if (NAMED_AFTER.has(camelOf(part))) i++
  }
  return `/${kept.join('/')}`
}

export function requestNameOf(host: string, path: string, operation: string | null): string {
  if (operation) return operation
  const label = host.split('.')[0]
  return endpointName(label === 'www' ? stablePath(path) : `${label}/${stablePath(path)}`)
}

export function operationOf(sent: unknown, path: string): string | null {
  if (!/graphql/i.test(path)) return null
  const body = sent && typeof sent === 'object' && !Array.isArray(sent) && 'body' in (sent as Record<string, unknown>) ? (sent as Record<string, unknown>).body : sent
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const value = (body as Record<string, unknown>).operationName ?? (body as Record<string, unknown>).operation
  return typeof value === 'string' && /^[A-Za-z0-9_]+$/.test(value) ? value : null
}

export function needlesOf(host: string, path: string, operation: string | null): string[] {
  if (operation) return [operation]
  const stable = stablePath(path)
  if (host.split('.')[0] !== 'www') return [`${host}${stable}`, host]
  const needles = [stable.replace(/^\//, '')]
  const words = stable.split('/').filter((part) => part.includes('-') || part.length > 7)
  if (words.length) needles.push(words[words.length - 1])
  return [...new Set(needles.filter((n) => n.length > 3))]
}

export function domainOfRequest(name: string, domains: [string, RegExp][]): string {
  for (const [domain, pattern] of domains) if (pattern.test(name)) return domain
  return 'background'
}
