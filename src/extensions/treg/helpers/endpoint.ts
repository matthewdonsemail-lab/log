import type { TregCallInput, TregEndpoint } from '../types'

function field(text: string, name: string): string | null {
  const line = text.split(/\r?\n/).find((l) => l.startsWith(`${name}:`))
  if (!line) return null
  const value = line.slice(name.length + 1).trim().replace(/^"(.*)"$/, '$1')
  return value || null
}

export function isFreePrice(price: string | null): boolean {
  if (!price) return false
  return /^free\b/i.test(price) || /^\$?0(\.0+)?(\s|\/|$)/.test(price)
}

export function endpointOf(id: string, text: string): TregEndpoint {
  const price = field(text, 'price')
  return { id: field(text, 'id') ?? id, summary: field(text, 'summary'), price, free: isFreePrice(price), call: field(text, 'call'), text }
}

export function paramsOf(raw: unknown): { ok: true; params: [string, string][] } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === '') return { ok: true, params: [] }
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { ok: false, error: 'params is a JSON object of query params, e.g. {"query":"kick streamer managers","domain_type":"web"}' }
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ok: false, error: 'params is a JSON object of query params, not a list or a value' }
  const params: [string, string][] = []
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (value === undefined || value === null) continue
    params.push([key, Array.isArray(value) ? value.map(String).join(',') : typeof value === 'object' ? JSON.stringify(value) : String(value)])
  }
  return { ok: true, params }
}

export function callArgs(input: TregCallInput): string[] {
  const args = ['call', input.id]
  if (input.path) args.push(input.path)
  for (const [key, value] of input.params) args.push('--query', `${key}=${value}`)
  if (input.method) args.push('--method', input.method.toUpperCase())
  if (input.data !== undefined) args.push('--data', input.data)
  if (input.wait) args.push('--await')
  return args
}

export function shownCommand(args: string[]): string {
  return ['treg', ...args.map((a) => (/^[\w./:=@,-]+$/.test(a) ? a : `'${a.replace(/'/g, `'\\''`)}'`))].join(' ')
}
