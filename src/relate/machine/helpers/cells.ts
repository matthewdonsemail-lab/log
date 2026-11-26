import type { Database } from 'bun:sqlite'
import { PROMISE_SLOTS } from '../../../storage/platform/types'
import type { FactRow } from '../../../people/facts/index'
import { MACHINE_LIMITS, MACHINE_PAGE, STUCK_AFTER_MS } from '../types'
import type { MachinePerson, MachinePersonFact, PersonStanding } from '../types'
import { botKnowledge } from './bots'
import type { BotKnowledge } from './bots'

const DAY = 86_400_000

export interface FactStats {
  promises: number
  at: string | null
}

const promiseSlots = [...PROMISE_SLOTS]

const keyOf = (platform: string, userId: string): string => `${platform}:${userId}`
export function factStatsOf(handle: Database | null): Map<string, FactStats> {
  const out = new Map<string, FactStats>()
  if (!handle) return out
  const add = (key: string, promises: number, at: string | null) => {
    if (!key) return
    const held = out.get(key) ?? { promises: 0, at: null }
    held.promises += promises
    if (at && (!held.at || at > held.at)) held.at = at
    out.set(key, held)
  }
  const marks = promiseSlots.map(() => '?').join(', ')
  const rows = handle
    .prepare(`SELECT platform, userId, personId, COALESCE(SUM(CASE WHEN slot IN (${marks}) THEN 1 ELSE 0 END), 0) AS promises, MAX(validFrom) AS at FROM personFacts WHERE closedAt IS NULL GROUP BY platform, userId, personId`)
    .all(...promiseSlots) as { platform: string | null; userId: string | null; personId: string | null; promises: number; at: string | null }[]
  for (const r of rows) {
    if (r.platform && r.userId) add(keyOf(r.platform, r.userId), Number(r.promises ?? 0), r.at)
    if (r.personId) add(`person:${r.personId}`, Number(r.promises ?? 0), r.at)
  }
  return out
}

export function factsOf(handle: Database | null, subjects: readonly { platform: string; userId: string; personId: string | null }[]): Map<string, FactRow[]> {
  const out = new Map<string, FactRow[]>()
  if (!handle || !subjects.length) return out
  const keys = [...new Set(subjects.filter((s) => s.userId).map((s) => keyOf(s.platform, s.userId)))]
  const persons = [...new Set(subjects.map((s) => s.personId).filter((p): p is string => Boolean(p)))]
  const where = [...(keys.length ? ['platform || \':\' || userId IN (SELECT value FROM json_each(?))'] : []), ...(persons.length ? ['personId IN (SELECT value FROM json_each(?))'] : [])]
  if (!where.length) return out
  const rows = handle
    .prepare(`SELECT factId, personId, platform, userId, slot, text, quote, sourceMessageKeys, validFrom, validTo, recordedAt, closedAt, supersededBy, confidence, extractedBy FROM personFacts WHERE closedAt IS NULL AND (${where.join(' OR ')}) ORDER BY validFrom DESC`)
    .all(...[...(keys.length ? [JSON.stringify(keys)] : []), ...(persons.length ? [JSON.stringify(persons)] : [])]) as (Omit<FactRow, 'sourceMessageKeys' | 'source'> & { sourceMessageKeys: string })[]
  for (const r of rows) {
    const fact: FactRow = { ...r, sourceMessageKeys: JSON.parse(r.sourceMessageKeys) as string[], source: null }
    for (const s of subjects) {
      if (s.personId && r.personId === s.personId) out.set(keyOf(s.platform, s.userId), [...(out.get(keyOf(s.platform, s.userId)) ?? []), fact])
      else if (r.platform === s.platform && r.userId === s.userId) out.set(keyOf(s.platform, s.userId), [...(out.get(keyOf(s.platform, s.userId)) ?? []), fact])
    }
  }
  return out
}

const clip = (text: string, n: number): string => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat
}

export const initialsOf = (handle: string, name?: string | null): string => {
  const source = (name ?? '').trim() || handle.replace(/^@/, '').trim()
  const words = source.split(/[\s._-]+/).filter(Boolean)
  const letters = words.length > 1 ? `${words[0][0] ?? ''}${words[words.length - 1][0] ?? ''}` : source.slice(0, 2)
  return [...letters.toUpperCase()].slice(0, 2).join('') || '?'
}

const fitOf = (fit: number | null | undefined): number => (fit === null || fit === undefined ? 0 : Math.max(0, Math.min(1, fit > 1 ? fit / 100 : fit)))

export function matterOf(standing: PersonStanding, stats: FactStats | undefined, now: number): number {
  const last = standing.evidence.lastAt
  const recency = last ? Math.max(0, 1 - (now - last) / (DAY * 180)) : 0
  const promises = stats?.promises ?? 0
  return recency * 2 + fitOf(standing.evidence.fit) + Math.min(1, promises) * 1.5
}

export interface CellOptions {
  limit?: number
  cursor?: number
  quiet?: boolean
}

export interface CellPage {
  people: MachinePerson[]
  more: number
  quiet: number
}

export interface CellContext {
  handle: Database | null
  now: number
  bots: BotKnowledge
  stats: Map<string, FactStats>
}

export function cellContext(handle: Database | null, now: number): CellContext {
  return { handle, now, bots: botKnowledge(handle), stats: factStatsOf(handle) }
}

export const personKeyOf = (s: PersonStanding): string => {
  const evidenceKey = s.evidence.key
  const bare = evidenceKey.startsWith(`${s.evidence.platform}:`) ? evidenceKey.slice(s.evidence.platform.length + 1) : evidenceKey
  return keyOf(s.evidence.platform, bare)
}

const factsForPerson = (rows: FactRow[] | undefined): MachinePersonFact[] =>
  (rows ?? []).slice(0, MACHINE_LIMITS.personFacts).map((f) => ({ slot: f.slot, text: clip(f.text, MACHINE_LIMITS.quote), quote: clip(f.quote, MACHINE_LIMITS.quote), at: f.validFrom }))

export function cellsIn(context: CellContext, standings: readonly PersonStanding[], options: CellOptions = {}, nextOf: (s: PersonStanding) => { event: string; tool?: string } | null = () => null, labelOf: (s: PersonStanding) => string = () => ''): CellPage {
  const limit = Math.max(1, Math.min(options.limit ?? MACHINE_PAGE, MACHINE_LIMITS.people))
  const cursor = Math.max(0, options.cursor ?? 0)
  const quiet = standings.filter((s) => s.evidence.lastAt !== null && context.now - s.evidence.lastAt > STUCK_AFTER_MS)
  const pool = options.quiet ? quiet : [...standings]
  const ranked = [...pool]
    .map((s) => ({ s, score: matterOf(s, context.stats.get(personKeyOf(s)) ?? context.stats.get(`person:${s.evidence.personId ?? ''}`), context.now) }))
    .sort((a, b) => b.score - a.score || (b.s.evidence.lastAt ?? 0) - (a.s.evidence.lastAt ?? 0) || String(a.s.evidence.handle ?? a.s.evidence.key).localeCompare(String(b.s.evidence.handle ?? b.s.evidence.key)))
    .map((x) => x.s)
  const page = ranked.slice(cursor, cursor + limit)
  const subjects = page.map((s) => ({ platform: s.evidence.platform, userId: personKeyOf(s).slice(s.evidence.platform.length + 1), personId: s.evidence.personId }))
  const facts = factsOf(context.handle, subjects)
  const people = page.map((s) => {
    const key = personKeyOf(s)
    const lanes = s.lanes?.map((l) => ({ platform: l.platform, state: labelOf(l) })).slice(0, MACHINE_LIMITS.lanes)
    const next = nextOf(s)
    return {
      key,
      handle: String(s.evidence.handle ?? key),
      ...(s.evidence.name ? { name: s.evidence.name } : {}),
      initials: initialsOf(String(s.evidence.handle ?? key), s.evidence.name),
      platform: s.evidence.platform,
      at: s.evidence.lastAt,
      ...(s.evidence.lastAt !== null && context.now - s.evidence.lastAt > STUCK_AFTER_MS ? { quiet: true } : {}),
      ...(s.evidence.fit !== null && s.evidence.fit !== undefined ? { fit: s.evidence.fit } : {}),
      ...(next ? { next: next.event, ...(next.tool ? { tool: next.tool } : {}) } : {}),
      ...(lanes && lanes.length > 1 ? { lanes } : {}),
      ...(facts.get(key)?.length ? { facts: factsForPerson(facts.get(key)) } : {}),
    }
  })
  return { people, more: Math.max(0, pool.length - cursor - page.length), quiet: quiet.length }
}

export const withoutBots = (standings: readonly PersonStanding[], bots: BotKnowledge): PersonStanding[] => standings.filter((s) => !bots.keys.has(personKeyOf(s)))
