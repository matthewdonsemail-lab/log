import type { Database } from 'bun:sqlite'
import type { Connection } from '@relate/relate'
import type { StageEvidence } from '../types'

type Row = Record<string, unknown>

const num = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null)

const minOf = (...values: (number | null)[]): number | null => {
  const kept = values.filter((v): v is number => v !== null)
  return kept.length ? Math.min(...kept) : null
}

const maxOf = (...values: (number | null)[]): number | null => {
  const kept = values.filter((v): v is number => v !== null)
  return kept.length ? Math.max(...kept) : null
}

const isoMs = (v: unknown): number | null => {
  if (typeof v === 'number') return v
  const ms = typeof v === 'string' ? Date.parse(v) : NaN
  return Number.isFinite(ms) ? ms : null
}

const FILTER = '($all OR i.key IN $keys) AND NOT i.owner'

export function firstInteractions(handle: Database | null): Map<string, { kind: string; at: number }[]> {
  const out = new Map<string, { kind: string; at: number }[]>()
  if (!handle) return out
  const rows = handle.prepare('SELECT platform, actorUserId, kind, MIN(atMs) AS at FROM interactions WHERE atMs IS NOT NULL GROUP BY platform, actorUserId, kind').all() as { platform: string; actorUserId: string; kind: string; at: number }[]
  for (const r of rows) {
    const key = `${r.platform}:${r.actorUserId}`
    out.set(key, [...(out.get(key) ?? []), { kind: r.kind, at: r.at }])
  }
  return out
}

function blank(r: Row): StageEvidence {
  return { key: String(r.key), personId: (r.personId as string | null) ?? null, platform: String(r.platform), handle: (r.handle as string | null) ?? null, name: (r.name as string | null) ?? null, ring: num(r.ring), followedAt: null, follows: false, nearAt: null, near: [], engagedAt: null, engagedHow: null, theyWroteAt: null, youWroteAt: null, lastAt: null }
}

const PAST: Record<string, string> = { like: 'liked your post', reply: 'replied to your post', repost: 'reposted you', retweet: 'reposted you', quote: 'quoted you', mention: 'mentioned you', reaction: 'reacted to you' }

export function evidenceOf(conn: Connection, keys: readonly string[] | null, firsts: Map<string, { kind: string; at: number }[]> = new Map()): Map<string, StageEvidence> {
  const params = { all: keys === null, keys: [...(keys ?? [])] }
  const out = new Map<string, StageEvidence>()
  for (const r of conn.query(`MATCH (i:Identity) WHERE ${FILTER} RETURN i.key AS key, i.personId AS personId, i.platform AS platform, i.handle AS handle, i.name AS name, i.ring AS ring`, params).rows) out.set(String(r.key), blank(r))
  const at = (key: unknown) => out.get(String(key))
  for (const r of conn.query(`MATCH (i:Identity)-[f:FOLLOWED]->(:Account) WHERE ${FILTER} RETURN i.key AS key, f.kind AS kind, f.lastAtMs AS at`, params).rows) {
    const e = at(r.key)
    if (!e) continue
    const when = num(r.at)
    if (r.kind === 'follow') {
      e.follows = true
      e.followedAt = minOf(e.followedAt, when)
    } else {
      e.engagedAt = minOf(e.engagedAt, when)
      e.engagedHow ??= PAST[String(r.kind)] ?? `${String(r.kind)} you`
    }
    e.lastAt = maxOf(e.lastAt, when)
  }
  for (const r of conn.query(`MATCH (i:Identity)-[:FOLLOWS]->(:Account) WHERE ${FILTER} RETURN DISTINCT i.key AS key`, params).rows) {
    const e = at(r.key)
    if (e) e.follows = true
  }
  for (const r of conn.query(`MATCH (i:Identity)-[x:ENGAGED]->(:Post) WHERE ${FILTER} RETURN i.key AS key, x.kind AS kind, x.lastAtMs AS at ORDER BY at`, params).rows) {
    const e = at(r.key)
    if (!e) continue
    const when = num(r.at)
    if (e.engagedAt === null || (when !== null && when < e.engagedAt)) {
      e.engagedAt = when
      e.engagedHow = PAST[String(r.kind)] ?? `${String(r.kind)} your post`
    }
    e.lastAt = maxOf(e.lastAt, when)
  }
  for (const r of conn.query(`MATCH (i:Identity)-[x:REPLIED_TO|MENTIONED]->(:Account) WHERE ${FILTER} RETURN i.key AS key, min(x.firstAtMs) AS first, max(x.lastAtMs) AS last`, params).rows) {
    const e = at(r.key)
    if (!e) continue
    const first = num(r.first)
    if (e.engagedAt === null || (first !== null && first < e.engagedAt)) {
      e.engagedAt = first
      e.engagedHow = 'replied to or mentioned you'
    }
    e.lastAt = maxOf(e.lastAt, num(r.last))
  }
  for (const r of conn.query(`MATCH (i:Identity)-[:SAID|MEMBER_OF]->(d:Room {kind: 'dm'}) WHERE ${FILTER} WITH DISTINCT i, d OPTIONAL MATCH (i)-[s:SAID]->(d) OPTIONAL MATCH (a:Account)-[o:SAID]->(d) RETURN i.key AS key, min(s.firstAtMs) AS theirs, min(o.firstAtMs) AS ours, max(d.lastAtMs) AS last`, params).rows) {
    const e = at(r.key)
    if (!e) continue
    e.theyWroteAt = minOf(e.theyWroteAt, num(r.theirs))
    e.youWroteAt = minOf(e.youWroteAt, num(r.ours))
    e.lastAt = maxOf(e.lastAt, num(r.last))
  }
  for (const r of conn.query(`MATCH (i:Identity)-[m:MEMBER_OF]->(g:Room) WHERE ${FILTER} AND g.kind <> 'dm' RETURN i.key AS key, min(m.firstSeenAt) AS first, max(m.lastSeenAt) AS last, collect(DISTINCT coalesce(g.name, g.conversationId))[0..3] AS rooms`, params).rows) {
    const e = at(r.key)
    if (!e) continue
    e.nearAt = minOf(e.nearAt, isoMs(r.first))
    e.near.push(...((r.rooms as string[] | null) ?? []).map(String))
    e.lastAt = maxOf(e.lastAt, isoMs(r.last))
  }
  for (const r of conn.query(`MATCH (i:Identity)-[:IN_CIRCLE_OF]->(l:Leader)<-[:IN_CIRCLE_OF]-(c:Identity)-[:SAID]->(:Room {kind: 'dm'}) WHERE ${FILTER} AND c.key <> i.key RETURN i.key AS key, collect(DISTINCT l.handle)[0..2] AS leaders`, params).rows) {
    const e = at(r.key)
    if (e) e.near.push(...((r.leaders as string[] | null) ?? []).map((h) => `the circle of @${h}`))
  }
  for (const r of conn.query(`MATCH (i:Identity)-[:MENTIONED]-(c:Identity)-[:SAID]->(:Room {kind: 'dm'}) WHERE ${FILTER} AND c.key <> i.key RETURN i.key AS key, collect(DISTINCT c.handle)[0..2] AS people`, params).rows) {
    const e = at(r.key)
    if (e) e.near.push(...((r.people as string[] | null) ?? []).filter(Boolean).map((h) => `talks with @${h}`))
  }
  for (const [key, list] of firsts) {
    const e = out.get(key)
    if (!e) continue
    for (const f of list) {
      if (f.kind === 'follow') e.followedAt = minOf(e.followedAt, f.at)
      else if (e.engagedAt === null || f.at < e.engagedAt) {
        e.engagedAt = f.at
        e.engagedHow = PAST[f.kind] ?? `${f.kind} your post`
      }
    }
  }
  for (const e of out.values()) e.near = [...new Set(e.near)]
  return out
}

export interface RouteCandidate {
  key: string
  rooms: string[]
  circles: string[]
  mentions: number
  orbit: number
}

export function routeCandidates(conn: Connection, keys: readonly string[]): Map<string, RouteCandidate> {
  const out = new Map<string, RouteCandidate>()
  const known = "AND NOT c.owner AND ((c)-[:SAID]->(:Room {kind: 'dm'}) OR (c)-[:ENGAGED]->(:Post) OR (c)-[:FOLLOWED]->(:Account) OR (c)-[:REPLIED_TO|MENTIONED]->(:Account))"
  const get = (key: unknown): RouteCandidate => {
    const k = String(key)
    const held = out.get(k) ?? { key: k, rooms: [], circles: [], mentions: 0, orbit: 0 }
    out.set(k, held)
    return held
  }
  for (const r of conn.query(`MATCH (t:Identity)-[:MEMBER_OF]->(g:Room)<-[:MEMBER_OF]-(c:Identity) WHERE t.key IN $keys AND g.kind <> 'dm' AND NOT c.key IN $keys ${known} RETURN c.key AS key, collect(DISTINCT coalesce(g.name, g.conversationId))[0..3] AS rooms`, { keys: [...keys] }).rows) get(r.key).rooms.push(...((r.rooms as string[]) ?? []))
  for (const r of conn.query(`MATCH (t:Identity)-[:IN_CIRCLE_OF]->(l:Leader)<-[:IN_CIRCLE_OF]-(c:Identity) WHERE t.key IN $keys AND NOT c.key IN $keys ${known} RETURN c.key AS key, collect(DISTINCT l.handle)[0..3] AS leaders`, { keys: [...keys] }).rows) get(r.key).circles.push(...((r.leaders as string[]) ?? []))
  for (const r of conn.query(`MATCH (t:Identity)-[m:MENTIONED]-(c:Identity) WHERE t.key IN $keys AND NOT c.key IN $keys ${known} RETURN c.key AS key, sum(coalesce(m.times, 1)) AS times`, { keys: [...keys] }).rows) get(r.key).mentions += Number(r.times ?? 0)
  for (const r of conn.query(`MATCH (t:Identity)-[:ENGAGED]->(p:Post)<-[:ENGAGED]-(c:Identity) WHERE t.key IN $keys AND NOT c.key IN $keys ${known} RETURN c.key AS key, count(DISTINCT p) AS posts`, { keys: [...keys] }).rows) get(r.key).orbit += Number(r.posts ?? 0)
  return out
}

export function ownerAccounts(conn: Connection): { platform: string; account: string }[] {
  return conn.query('MATCH (a:Account) RETURN a.platform AS platform, a.account AS account ORDER BY platform, account').rows.map((r) => ({ platform: String(r.platform), account: String(r.account) }))
}
