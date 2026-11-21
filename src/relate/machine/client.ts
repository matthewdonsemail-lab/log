import { Database } from 'bun:sqlite'
import { existsSync } from 'node:fs'
import { defaultDbPath } from '../../storage/schema/index'
import { findPeople, GraphUnreadable, pointerOf, readFromFile, readOffset } from '../graph/index'
import { ownerRequest } from '../owner/helpers/index'
import { identitySpec } from '../../people/helpers/identity'
import type { Ask, PersonFound } from '../graph/index'
import { evidenceOf, firstInteractions, networkBlock, ownerAccounts, personBlock, rankLinks, routeBlock, routeCandidates, standingOf } from './helpers/index'
import { machineText } from './render/text'
import { MACHINE_READ_MS, ROUTE_CONNECTORS } from './types'
import { MACHINE_PLATFORMS } from './types'
import type { EvidenceTime, MachineAccount, MachinePlatform, MachinePlatformView, MachineView, PersonStanding, StageEvidence, StateMachineBlock } from './types'

export interface MachineAsk {
  view?: MachineView
  person?: string
  to?: string
  platform?: MachinePlatform
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
  const max = (a: number | null, b: number | null) => (a === null ? b : b === null ? a : Math.max(a, b))
  const from: Partial<Record<EvidenceTime, string>> = {}
  const earliest = (field: EvidenceTime, e: StageEvidence) => {
    const v = e[field]
    if (v === null) return
    const held = base[field]
    if (held === null || v < held || (v === held && !from[field])) {
      base[field] = v
      from[field] = e.platform
    }
  }
  for (const f of ['followedAt', 'nearAt', 'engagedAt', 'theyWroteAt', 'youWroteAt'] as const) {
    base[f] = null
  }
  for (const e of list) {
    base.follows ||= e.follows
    earliest('followedAt', e)
    earliest('nearAt', e)
    base.near.push(...e.near)
    const engagedBefore = base.engagedAt
    earliest('engagedAt', e)
    if (base.engagedAt !== engagedBefore || (base.engagedAt === null && !base.engagedHow && e.engagedHow)) base.engagedHow = e.engagedHow
    earliest('theyWroteAt', e)
    earliest('youWroteAt', e)
    base.lastAt = max(base.lastAt, e.lastAt)
    base.ring = base.ring === null ? e.ring : e.ring === null ? base.ring : Math.min(base.ring, e.ring)
  }
  base.handle ??= person.handle
  base.name ??= person.name
  base.near = [...new Set(base.near)]
  if (list.length > 1) base.from = from
  return base
}

async function identityOn(read: Ask, platform: string, who: string): Promise<PersonFound | null> {
  const bare = who.replace(/^@/, '').toLowerCase()
  const rows = await read('MATCH (i:Identity) WHERE NOT i.owner AND i.platform = $platform AND (i.handleLower = $bare OR toLower(i.handle) = $bare OR i.key = $key OR any(a IN coalesce(i.aliases, []) WHERE a = $bare)) RETURN i.key AS key, i.platform AS platform, i.handle AS handle, i.name AS name, i.personId AS personId ORDER BY key', { platform, bare, key: `${platform}:${who}` })
  if (!rows.length) return null
  const first = rows[0]
  const personId = (first.personId as string | null) ?? null
  const linked = personId ? (await read('MATCH (j:Identity) WHERE j.personId = $personId RETURN j.key AS key ORDER BY key', { personId })).map((r) => String(r.key)) : []
  const keys = [String(first.key), ...rows.slice(1).map((r) => String(r.key)), ...linked]
  return { key: String(first.key), keys: [...new Set(keys)], personId, platform: String(first.platform), handle: (first.handle as string | null) ?? null, name: (first.name as string | null) ?? null }
}

async function personOf(read: Ask, text: string): Promise<PersonFound | null> {
  const asked = text.trim()
  const named = identitySpec(asked)
  if (named.platform && named.who && !/\s/.test(asked)) return identityOn(read, named.platform, named.who)
  const tagged = asked.startsWith('@') || asked.includes(' ') ? asked : `@${asked}`
  const found = (await findPeople(read, tagged))[0]
  if (found) return found
  const rows = await read('MATCH (i:Identity) WHERE NOT i.owner AND toLower(i.handle) = $handle RETURN i.key AS key, i.platform AS platform, i.handle AS handle, i.name AS name ORDER BY key', { handle: asked.replace(/^@/, '').toLowerCase() })
  if (!rows.length) return null
  const first = rows[0]
  return { key: String(first.key), keys: rows.filter((r) => r.platform === first.platform).map((r) => String(r.key)), personId: null, platform: String(first.platform), handle: (first.handle as string | null) ?? null, name: (first.name as string | null) ?? null }
}

export async function accountsOf(read: Ask, person: PersonFound): Promise<MachineAccount[]> {
  const mine = await read('MATCH (i:Identity) WHERE i.key IN $keys RETURN i.key AS key, i.platform AS platform, i.handle AS handle, i.handleLower AS handleLower, i.personId AS personId ORDER BY platform, key', { keys: [...person.keys] })
  const linked: MachineAccount[] = mine.map((r) => ({ platform: String(r.platform), handle: String(r.handle ?? r.key), link: 'linked' as const }))
  const handles = [...new Set(mine.map((r) => String(r.handleLower ?? r.handle ?? '').toLowerCase()).filter(Boolean))]
  const platforms = new Set(mine.map((r) => String(r.platform)))
  if (!handles.length) return linked
  const suggested = (
    await read('MATCH (j:Identity) WHERE NOT j.owner AND NOT j.key IN $keys AND toLower(coalesce(j.handleLower, j.handle)) IN $handles AND (j.personId IS NULL OR $personId IS NULL OR j.personId <> $personId) RETURN j.platform AS platform, j.handle AS handle ORDER BY platform', { keys: [...person.keys], handles, personId: person.personId ?? null })
  )
    .filter((r) => !platforms.has(String(r.platform)))
    .map((r) => ({ platform: String(r.platform), handle: String(r.handle), link: 'suggested' as const }))
  return [...linked, ...suggested]
}

const onPlatform = (platform: MachinePlatform | undefined) => (e: StageEvidence): boolean => !platform || platform === 'all' || e.platform === platform

function platformViews(build: (platform: MachinePlatform) => { block: StateMachineBlock; count: number } | null): MachinePlatformView[] {
  return MACHINE_PLATFORMS.flatMap((platform) => {
    const made = build(platform)
    if (!made || (platform !== 'all' && made.count === 0)) return []
    return [{ platform, count: made.count, ...(made.block.summary ? { summary: made.block.summary } : {}), states: made.block.states, transitions: made.block.transitions }]
  })
}

function withPlatforms(views: MachinePlatformView[], chosen: MachinePlatform | undefined, fallback: StateMachineBlock): StateMachineBlock {
  const pick = views.find((v) => v.platform === (chosen ?? 'all')) ?? views[0]
  if (!pick) return fallback
  return { ...fallback, states: pick.states, transitions: pick.transitions, ...(pick.summary ? { summary: pick.summary } : {}), platform: pick.platform, ...(views.length > 2 ? { platforms: views } : {}) }
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

async function standingFor(read: Ask, person: PersonFound, firsts: ReturnType<typeof firstInteractions>, platform?: MachinePlatform): Promise<PersonStanding | null> {
  const evidence = await evidenceOf(read, person.keys, firsts)
  const keys = person.keys.filter((k) => { const e = evidence.get(k); return e ? onPlatform(platform)(e) : platform === undefined || platform === 'all' })
  if (!keys.length) return null
  const lead = evidence.get(keys[0])
  return standingOf(merged(keys, evidence, lead ? { ...person, key: keys.includes(person.key) ? person.key : keys[0], platform: lead.platform } : person))
}

export async function machineFrom(read: Ask, ask: MachineAsk, throughSeq: number | null, handle: Database | null = null, now: number = Date.now()): Promise<MachineAnswer> {
  const view = viewOf(ask)
  const firsts = firstInteractions(handle)
  let block: StateMachineBlock
  if (view === 'network') {
    const evidence = await evidenceOf(read, null, firsts)
    const everyone = people(evidence)
    const views = platformViews((platform) => {
      const kept = platform === 'all' ? everyone : people(new Map([...evidence].filter(([, e]) => e.platform === platform)))
      return { block: networkBlock(kept.map(standingOf), throughSeq, now), count: kept.length }
    })
    block = withPlatforms(views, ask.platform, networkBlock(everyone.map(standingOf), throughSeq, now))
  } else {
    const asked = view === 'route' ? ask.to ?? ask.person : ask.person ?? ask.to
    if (!asked) return { ok: false, code: 'relateMachineNobody', problem: `the ${view} view needs ${view === 'route' ? 'to' : 'person'}: a handle or name` }
    const person = await personOf(read, asked)
    if (!person) return { ok: false, code: 'relateMachineNobody', problem: `nobody in the Relate graph matches "${asked}"` }
    const target = (await standingFor(read, person, firsts))!
    const accounts = await accountsOf(read, person)
    if (view === 'person') {
      const standings = new Map<MachinePlatform, PersonStanding | null>()
      for (const platform of MACHINE_PLATFORMS) standings.set(platform, platform === 'all' ? target : await standingFor(read, person, firsts, platform))
      const views = platformViews((platform) => {
        const standing = standings.get(platform) ?? null
        return standing ? { block: personBlock(standing, throughSeq, accounts), count: platform === 'all' ? person.keys.length : accounts.filter((a) => a.link === 'linked' && a.platform === platform).length } : null
      })
      block = withPlatforms(views, ask.platform, personBlock(target, throughSeq, accounts))
    }
    else {
      const candidates = await routeCandidates(read, person.keys)
      const evidence = await evidenceOf(read, [...candidates.keys()], firsts)
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
      const accounts = (await ownerAccounts(read)).sort((a, b) => Number(b.platform === target.evidence.platform) - Number(a.platform === target.evidence.platform))
      const note = accounts.slice(0, 3).map((a) => `@${a.account.replace(/^@/, '')} on ${a.platform}`).join(', ')
      block = routeBlock({ label: 'You', note: note || 'your accounts' }, target, links, throughSeq)
    }
  }
  return { ok: true, block, text: machineText(block), throughSeq: throughSeq ?? 0 }
}

export async function relateMachine(ask: MachineAsk, dbPath: string = defaultDbPath(), now: number = Date.now()): Promise<MachineAnswer> {
  if (!existsSync(dbPath)) return { ok: false, code: 'relateMachineNoGraph', problem: `no log.db at ${dbPath}` }
  const handle = new Database(dbPath, { readonly: true })
  try {
    const reply = await ownerRequest<MachineAnswer>(handle, 'machine', { ask, now }, MACHINE_READ_MS)
    if (reply?.ok) return reply.value
    if (reply) return { ok: false, code: 'graphUnreadable', problem: reply.error }
    const pointer = pointerOf(dbPath, handle)
    if (!pointer) return { ok: false, code: 'relateMachineNoGraph', problem: 'no Relate graph for this log.db yet: `log relate build` makes one' }
    try {
      return await readFromFile(pointer.file, async (read) => machineFrom(read, ask, (await readOffset(read))?.throughSeq ?? pointer.throughSeq, handle, now))
    } catch (error) {
      if (error instanceof GraphUnreadable) return { ok: false, code: 'graphUnreadable', problem: error.message }
      throw error
    }
  } finally {
    handle.close()
  }
}
