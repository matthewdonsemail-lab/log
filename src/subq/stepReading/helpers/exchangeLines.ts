import type { StepExchange } from '../types'

const NOISE_KEYS = /^(fb_api_caller_class|server_timestamps|__typename|__relay_internal__pv__.*|client_mutation_id|actor_id|scale|extensions|server_metadata|is_final)$/
const WRAPPERS = /^(data|viewer|node|edges|result|payload)$/
const MAX_VALUE_CHARS = 60
const PER_ITEM = 3

function show(value: unknown): string {
  if (typeof value === 'string') {
    const cut = value.length > MAX_VALUE_CHARS ? `${value.slice(0, MAX_VALUE_CHARS)}…` : value
    return JSON.stringify(cut)
  }
  return String(value)
}

export function leavesOf(value: unknown, path: string[] = [], out: [string, string][] = []): [string, string][] {
  if (value === null || typeof value !== 'object') {
    if (path.length) out.push([path.filter((p) => !WRAPPERS.test(p)).join('.') || path.join('.'), show(value)])
    return out
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      const item = leavesOf(v, [...path.slice(0, -1), `${path.at(-1) ?? ''}[${i}]`])
      out.push(...(v && typeof v === 'object' ? item.slice(0, PER_ITEM) : item))
    })
    return out
  }
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (NOISE_KEYS.test(key)) continue
    leavesOf(v, [...path, key], out)
  }
  return out
}

export function leafText(value: unknown, max: number): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return show(value)
  const leaves = leavesOf(value)
  if (!leaves.length) return '—'
  const shown = leaves.slice(0, max).map(([k, v]) => `${k}=${v}`).join(', ')
  return leaves.length > max ? `${shown} … +${leaves.length - max} more` : shown
}

export function sentForLine(e: StepExchange): unknown {
  const sent = e.sent as Record<string, unknown> | null
  if (sent && typeof sent === 'object' && 'variables' in sent) return sent.variables
  return sent
}

export function exchangeLine(e: StepExchange, maxSent = 12, maxAnswer = 12): string {
  const head = `+${(e.offsetMs / 1000).toFixed(2)}s ${e.kind === 'document' ? 'page' : e.method} ${e.name} ${e.status} (${(e.ms / 1000).toFixed(2)}s)${e.known ? '' : ' NEW'}`
  const errors = e.errors.length ? ` | errors: ${e.errors.join('; ')}` : ''
  if (e.kind === 'document') {
    const doc = e.answer as { title?: string | null; fields?: Record<string, unknown> } | null
    return `${head} | title ${show(doc?.title ?? '')} | read: ${leafText(doc?.fields ?? null, maxAnswer)}`
  }
  return `${head} | sent: ${leafText(sentForLine(e), maxSent)} | answered: ${leafText(e.answer, maxAnswer)}${errors}`
}

export function changedSent(previous: unknown, current: unknown): unknown {
  const before = new Map(leavesOf(previous))
  const changed = leavesOf(current).filter(([k, v]) => before.get(k) !== v)
  return changed.length ? Object.fromEntries(changed.map(([k, v]) => [k, v.startsWith('"') ? JSON.parse(v) : v])) : null
}

export function exchangeTimeline(exchanges: StepExchange[], maxSent = 12, maxAnswer = 12): string[] {
  const lastSent = new Map<string, unknown>()
  return exchanges.map((e) => {
    if (e.kind !== 'api') return exchangeLine(e, maxSent, maxAnswer)
    const sent = sentForLine(e)
    const before = lastSent.get(e.name)
    lastSent.set(e.name, sent)
    if (before === undefined) return exchangeLine(e, maxSent, maxAnswer)
    const changed = changedSent(before, sent)
    return exchangeLine({ ...e, sent: changed === null ? 'same as its last call' : { changedSinceLastCall: changed } }, maxSent, maxAnswer)
  })
}
