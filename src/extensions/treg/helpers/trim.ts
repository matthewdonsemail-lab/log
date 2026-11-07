import type { TregTrim } from '../types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function matches(row: Record<string, unknown>, where: [string, string][]): boolean {
  return where.every(([key, value]) => String(row[key]) === value)
}

function trimRows(rows: unknown[], trim: TregTrim): unknown[] {
  const kept = trim.where.length ? rows.filter((row) => isRecord(row) && matches(row, trim.where)) : rows
  const capped = trim.maxItems === undefined ? kept : kept.slice(0, trim.maxItems)
  if (!trim.fields.length) return capped
  return capped.map((row) => (isRecord(row) ? Object.fromEntries(trim.fields.filter((f) => f in row).map((f) => [f, row[f]])) : row))
}

function trimValue(value: unknown, trim: TregTrim, depth: number): unknown {
  if (Array.isArray(value)) return value.some(isRecord) ? trimRows(value, trim) : value
  if (!isRecord(value) || depth > 4) return value
  return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, trimValue(inner, trim, depth + 1)]))
}

export function trimAnswer(answer: unknown, trim: TregTrim): unknown {
  if (!isRecord(answer)) return answer
  const kept = trim.raw ? answer : Object.fromEntries(Object.entries(answer).filter(([key]) => key !== 'raw'))
  const trimming = trim.fields.length > 0 || trim.maxItems !== undefined || trim.where.length > 0
  return trimming ? trimValue(kept, trim, 0) : kept
}

export function trimOf(flags: Record<string, unknown>): { ok: true; trim: TregTrim } | { ok: false; error: string } {
  const listOf = (raw: unknown) => (typeof raw === 'string' ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [])
  const where: [string, string][] = []
  for (const pair of listOf(flags['where'])) {
    const at = pair.indexOf('=')
    if (at < 1) return { ok: false, error: `where is key=value[,key=value], e.g. isReply=false (got "${pair}")` }
    where.push([pair.slice(0, at), pair.slice(at + 1)])
  }
  let maxItems: number | undefined
  if (flags['maxItems'] !== undefined) {
    maxItems = Number(flags['maxItems'])
    if (!Number.isInteger(maxItems) || maxItems < 1 || maxItems > 1000) return { ok: false, error: 'maxItems is a whole number from 1 to 1000' }
  }
  return { ok: true, trim: { fields: listOf(flags['fields']), maxItems, where, raw: flags['raw'] === true } }
}
