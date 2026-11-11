import { db } from '../../inbox/store/index'
import type { UsageBreakdown, UsageBucket, UsageKind, UsageSummary, UsageTotals } from './types'

const dayMs = 86400000
type CallRow = { tool: string; startedAt: number; ms: number; ok: number }
type Accumulator = { calls: number; failed: number; durations: number[] }

function kindOf(tool: string): UsageKind {
  const words = tool.replace(/^cli\s+/, '').split(/\s+/)
  const name = (words[0] ?? '').toLowerCase()
  if (/^(voice|subq|jev|typesafe)/.test(name)) return 'decision'
  if (/^(media|memelord|clone|transcribe)/.test(name)) return 'media'
  if (/^(hook:|job|.*watch)/.test(name)) return 'background'
  if (/^(twitter|facebook|discord|slack|instagram|reddit|linkedin)/.test(name)) {
    const action = name.replace(/^(twitter|facebook|discord|slack|instagram|reddit|linkedin)/, '') || (words[1] ?? '').toLowerCase()
    if (/^(send|post|reply|react|like|vote|follow|unfollow|delete|edit|join|leave|openchat)(live)?$/.test(action)) return 'platformWrite'
    if (/^(read|list|search|inspect|status|profile|followers|follows|messages|chats|inbox|feed|thread|history|notifications)/.test(action)) return 'platformRead'
    return 'other'
  }
  if (/^(getguide|log|get|search|timing|governor|inbox|account|balance|runs|storage|treg)/.test(name)) return 'control'
  return 'other'
}

function empty(): Accumulator {
  return { calls: 0, failed: 0, durations: [] }
}

function add(group: Accumulator, row: CallRow) {
  group.calls += 1
  group.failed += row.ok === 0 ? 1 : 0
  group.durations.push(Math.max(0, row.ms))
}

function summarize(group: Accumulator): UsageTotals {
  const sorted = group.durations.sort((left, right) => left - right)
  const percentile = (fraction: number) => Math.round(sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? 0)
  return { calls: group.calls, succeeded: group.calls - group.failed, failed: group.failed, p50Ms: percentile(0.5), p95Ms: percentile(0.95) }
}

export function readUsageSummary(fromMs: number, toMs = Date.now()): UsageSummary {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || fromMs >= toMs || toMs - fromMs > dayMs * 31) throw new Error('usageRangeInvalid')
  const totals = empty()
  const days = new Map<number, Accumulator>()
  const kinds = new Map<UsageKind, Accumulator>()
  for (let day = Math.floor(fromMs / dayMs) * dayMs; day < toMs; day += dayMs) days.set(day, empty())
  const rows = db().prepare("SELECT tool, startedAt, ms, ok FROM spans WHERE parentId IS NULL AND name = 'call' AND startedAt >= ? AND startedAt < ? ORDER BY startedAt").all(fromMs, toMs) as CallRow[]
  for (const row of rows) {
    const kind = kindOf(row.tool)
    const category = kinds.get(kind) ?? empty()
    kinds.set(kind, category)
    const day = days.get(Math.floor(row.startedAt / dayMs) * dayMs)
    add(totals, row)
    add(category, row)
    if (day) add(day, row)
  }
  const buckets: UsageBucket[] = [...days].map(([start, group]) => ({ start: new Date(start).toISOString(), ...summarize(group) }))
  const breakdown: UsageBreakdown[] = [...kinds].map(([kind, group]) => ({ kind, ...summarize(group) })).sort((left, right) => right.calls - left.calls)
  return { schemaVersion: 1, source: 'workspace', generatedAt: new Date().toISOString(), from: new Date(fromMs).toISOString(), to: new Date(toMs).toISOString(), totals: summarize(totals), buckets, kinds: breakdown }
}
