import { Database } from 'bun:sqlite'
import { existsSync } from 'node:fs'
import type { Connection } from '@relate/relate'
import { defaultDbPath } from '../../storage/schema/index'
import { findPeople, graphConnection, GraphUnreadable, pointerOf } from '../graph/index'
import type { PersonFound } from '../graph/index'
import { evidenceOf, firstInteractions, networkBlock, ownerAccounts, personBlock, rankLinks, routeBlock, routeCandidates, standingOf } from './helpers/index'
import { machineText } from './render/text'
import { ROUTE_CONNECTORS } from './types'
import type { MachineView, PersonStanding, StageEvidence, StateMachineBlock } from './types'

export interface MachineAsk {
  view?: MachineView
  person?: string
  to?: string
}

export type MachineAnswer = { ok: true; block: StateMachineBlock; text: string; throughSeq: number } | { ok: false; code: 'relateMachineNoGraph' | 'relateMachineNobody' | 'graphUnreadable'; problem: string }

export function viewOf(ask: MachineAsk): MachineView {
  if (ask.view) return ask.view
  if (ask.to) return 'route'
  if (ask.person) return 'person'
  return 'network'
}

function merged(keys: readonly string[], evidence: Map<string, StageEvidence>, person: PersonFound): StageEvidence {
  const list = keys.map((k) => evidence.get(k)).filter((e): e is StageEvidence => Boolean(e))
  const first = list.find((e) => e.key === person.key) ?? list[0]
  const base: StageEvidence = first ? { ...first, near: [] } : { key: person.key, personId: person.personId ?? null, platform: person.platform, handle: person.handle, name: person.name, ring: null, followedAt: null, follows: false, nearAt: null, near: [], engagedAt: null, engagedHow: null, theyWroteAt: null, youWroteAt: null, lastAt: null }
  const min = (a: number | null, b: number | null) => (a === null ? b : b === null ? a : Math.min(a, b))
  const max = (a: number | null, b: number | null) => (a === null ? b : b === null ? a : Math.max(a, b))
  for (const e of list) {
    base.follows ||= e.follows
    base.followedAt = min(base.followedAt, e.followedAt)
    base.nearAt = min(base.nearAt, e.nearAt)
    base.near.push(...e.near)
    if (e.engagedAt !== null && (base.engagedAt === null || e.engagedAt <= base.engagedAt)) {
      base.engagedAt = e.engagedAt
      base.engagedHow = e.engagedHow
    }
    base.theyWroteAt = min(base.theyWroteAt, e.theyWroteAt)
    base.youWroteAt = min(base.youWroteAt, e.youWroteAt)
    base.lastAt = max(base.lastAt, e.lastAt)
    base.ring = base.ring === null ? e.ring : e.ring === null ? base.ring : Math.min(base.ring, e.ring)
  }
  base.handle ??= person.handle
  base.name ??= person.name
  base.near = [...new Set(base.near)]
  return base
}

function personOf(conn: Connection, text: string): PersonFound | null {
  const asked = text.trim()
  const tagged = asked.startsWith('@') || asked.includes(' ') ? asked : `@${asked}`
  const found = findPeople(conn, tagged)[0]
  if (found) return found
  const rows = conn.query('MATCH (i:Identity) WHERE NOT i.owner AND toLower(i.handle) = $handle RETURN i.key AS key, i.platform AS platform, i.handle AS handle, i.name AS name ORDER BY key', { handle: asked.replace(/^@/, '').toLowerCase() }).rows
  if (!rows.length) return null
  const first = rows[0]
  return { key: String(first.key), keys: rows.map((r) => String(r.key)), personId: null, platform: String(first.platform), handle: (first.handle as string | null) ?? null, name: (first.name as string | null) ?? null }
}

function people(evidence: Map<string, StageEvidence>): StageEvidence[] {
  const groups = new Map<string, string[]>()
  for (const e of evidence.values()) {
    const group = e.personId ? `person:${e.personId}` : `${e.platform}:${(e.handle ?? e.key).toLowerCase()}`
    groups.set(group, [...(groups.get(group) ?? []), e.key])
  }
  return [...groups.values()].map((keys) => {
    const first = evidence.get(keys[0])!
    return merged(keys, evidence, { key: first.key, keys, personId: first.personId, platform: first.platform, handle: first.handle, name: first.name })
  })
}

function standingFor(conn: Connection, person: PersonFound, firsts: ReturnType<typeof firstInteractions>): PersonStanding {
  const evidence = evidenceOf(conn, person.keys, firsts)
  return standingOf(merged(person.keys, evidence, person))
}

export function machineFrom(conn: Connection, ask: MachineAsk, throughSeq: number | null, handle: Database | null = null, now: number = Date.now()): MachineAnswer {
  const view = viewOf(ask)
  const firsts = firstInteractions(handle)
  let block: StateMachineBlock
  if (view === 'network') {
    const evidence = evidenceOf(conn, null, firsts)
    block = networkBlock(people(evidence).map(standingOf), throughSeq, now)
  } else {
    const asked = view === 'route' ? ask.to ?? ask.person : ask.person ?? ask.to
    if (!asked) return { ok: false, code: 'relateMachineNobody', problem: `the ${view} view needs ${view === 'route' ? 'to' : 'person'}: a handle or name` }
    const person = personOf(conn, asked)
    if (!person) return { ok: false, code: 'relateMachineNobody', problem: `nobody in the Relate graph matches "${asked}"` }
    const target = standingFor(conn, person, firsts)
    if (view === 'person') block = personBlock(target, throughSeq)
    else {
      const candidates = routeCandidates(conn, person.keys)
      const evidence = evidenceOf(conn, [...candidates.keys()], firsts)
      const links = rankLinks(
        [...candidates.values()].flatMap((c) => {
          const e = evidence.get(c.key)
          if (!e || !e.handle) return []
          const standing = standingOf(e)
          const reasons = [...c.rooms.map((r) => `both in ${r}`), ...c.circles.map((l) => `circle of @${l}`), ...(c.mentions ? [`mentioned them ×${c.mentions}`] : []), ...(c.orbit ? [`engaged the same posts ×${c.orbit}`] : [])]
          return [{ key: c.key, handle: e.handle, platform: e.platform, stage: standing.stage, reasons, score: 0, lastAt: e.lastAt, rooms: c.rooms.length, circles: c.circles.length, mentions: c.mentions, orbit: c.orbit }]
        }),
        ROUTE_CONNECTORS,
      )
      const accounts = ownerAccounts(conn).sort((a, b) => Number(b.platform === target.evidence.platform) - Number(a.platform === target.evidence.platform))
      const note = accounts.slice(0, 3).map((a) => `@${a.account.replace(/^@/, '')} on ${a.platform}`).join(', ')
      block = routeBlock({ label: 'You', note: note || 'your accounts' }, target, links, throughSeq)
    }
  }
  return { ok: true, block, text: machineText(block), throughSeq: throughSeq ?? 0 }
}

export function relateMachine(ask: MachineAsk, dbPath: string = defaultDbPath(), now: number = Date.now()): MachineAnswer {
  if (!existsSync(dbPath)) return { ok: false, code: 'relateMachineNoGraph', problem: `no log.db at ${dbPath}` }
  const handle = new Database(dbPath, { readonly: true })
  try {
    const pointer = pointerOf(dbPath, handle)
    if (!pointer) return { ok: false, code: 'relateMachineNoGraph', problem: 'no Relate graph for this log.db yet: `log relate build` makes one' }
    let conn: Connection
    try {
      conn = graphConnection(pointer.file)
    } catch (error) {
      if (error instanceof GraphUnreadable) return { ok: false, code: 'graphUnreadable', problem: error.message }
      throw error
    }
    return machineFrom(conn, ask, pointer.throughSeq, handle, now)
  } finally {
    handle.close()
  }
}
