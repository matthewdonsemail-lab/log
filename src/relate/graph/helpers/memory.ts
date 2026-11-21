import type { Database } from 'bun:sqlite'
import { createHash } from 'node:crypto'
import type { Connection } from '@relate/relate'
import { EMBED_DIMENSIONS, EMBED_MODEL } from '../../../search/conversations/types'
import { MEMORY_RECALL } from '../types'
import type { Ask, MemoryProjection, RecalledFact } from '../types'

export const EMPTY_MEMORY: MemoryProjection = { episodes: [], facts: [], from: [], about: [], supersedes: [], mentions: [] }

const textHashOf = (text: string): string => createHash('sha256').update(text).digest('hex').slice(0, 32)

function vectorOf(handle: Database, text: string): number[] | null {
  const row = handle.prepare('SELECT vector FROM embeddings WHERE hash = ? AND model = ? AND dimensions = ?').get(textHashOf(text), EMBED_MODEL, EMBED_DIMENSIONS) as { vector: Uint8Array } | null
  if (!row) return null
  const bytes = Uint8Array.from(row.vector)
  return [...new Float32Array(bytes.buffer, 0, bytes.byteLength / 4)]
}

interface FactRow {
  factId: string
  personId: string | null
  platform: string | null
  userId: string | null
  slot: string
  text: string
  sourceMessageKeys: string
  validFrom: string
  validTo: string | null
  recordedAt: string
  closedAt: string | null
  supersededBy: string | null
}

export function memoryProjectionOf(handle: Database, vectors: boolean = true): MemoryProjection {
  const rows = handle.prepare('SELECT factId, personId, platform, userId, slot, text, sourceMessageKeys, validFrom, validTo, recordedAt, closedAt, supersededBy FROM personFacts ORDER BY recordedAt, factId').all() as FactRow[]
  const out: MemoryProjection = { episodes: [], facts: [], from: [], about: [], supersedes: [], mentions: [] }
  const seen = new Set<string>()
  const episode = handle.prepare('SELECT m.messageKey AS id, m.sentAt AS at, m.text AS text, m.senderPlatform AS platform, m.chatId AS room FROM messages m WHERE m.messageKey = ?')
  for (const f of rows) {
    const subject = f.personId ? `person:${f.personId}` : `${f.platform}:${f.userId}`
    const subjectLabel = f.personId ? 'Person' : 'Identity'
    out.facts.push({ key: f.factId, id: f.factId, text: f.text, slot: f.slot, validFrom: f.validFrom, validTo: f.validTo, closedAt: f.closedAt, recordedAt: f.recordedAt, embedding: f.closedAt || !vectors ? null : vectorOf(handle, f.text) })
    out.about.push({ fact: f.factId, subject, label: subjectLabel })
    if (f.supersededBy) out.supersedes.push({ fact: f.supersededBy, old: f.factId })
    for (const key of JSON.parse(f.sourceMessageKeys) as string[]) {
      if (!seen.has(key)) {
        const e = episode.get(key) as { id: string; at: string; text: string; platform: string; room: string } | null
        if (!e) continue
        seen.add(key)
        out.episodes.push({ key, id: e.id, at: e.at, text: e.text, platform: e.platform, room: e.room })
        out.mentions.push({ episode: key, subject, label: subjectLabel })
      }
      out.from.push({ fact: f.factId, episode: key })
    }
  }
  return out
}

export function ensureMemoryIndexes(conn: Connection): void {
  conn.query('CREATE CONSTRAINT factKey IF NOT EXISTS FOR (n:Fact) REQUIRE n.key IS UNIQUE')
  conn.query('CREATE CONSTRAINT episodeKey IF NOT EXISTS FOR (n:Episode) REQUIRE n.key IS UNIQUE')
  conn.query('CREATE INDEX factSlot IF NOT EXISTS FOR (f:Fact) ON (f.slot)')
  conn.query(`CREATE VECTOR INDEX factEmbedding IF NOT EXISTS FOR (f:Fact) ON (f.embedding) WITH [f.closedAt] OPTIONS {indexConfig: {\`vector.dimensions\`: ${EMBED_DIMENSIONS}, \`vector.similarity_function\`: 'cosine'}}`)
}

const PERSON_EDGES: readonly ['ABOUT' | 'MENTIONS', string][] = [['ABOUT', 'UNWIND $rows AS r MATCH (f:Fact {key: r.fact}), (n:Person {key: r.subject}) MERGE (f)-[:ABOUT]->(n)'], ['MENTIONS', 'UNWIND $rows AS r MATCH (e:Episode {key: r.episode}), (n:Person {key: r.subject}) MERGE (e)-[:MENTIONS]->(n)']]

export function writeMemory(memory: MemoryProjection, put: (cypher: string, rows: readonly object[]) => void, one: (cypher: string) => void, personEdgesOnly: boolean = false): void {
  if (personEdgesOnly) {
    for (const [kind, cypher] of PERSON_EDGES) put(cypher, (kind === 'ABOUT' ? memory.about : memory.mentions).filter((a) => a.label === 'Person'))
    return
  }
  one('MATCH (f:Fact) DETACH DELETE f')
  one('MATCH (e:Episode) DETACH DELETE e')
  put('UNWIND $rows AS r CREATE (e:Episode) SET e = r', memory.episodes)
  put('UNWIND $rows AS r CREATE (f:Fact {key: r.key, id: r.id, text: r.text, slot: r.slot, validFrom: r.validFrom, validTo: r.validTo, closedAt: r.closedAt, recordedAt: r.recordedAt})', memory.facts)
  put(`UNWIND $rows AS r MATCH (f:Fact {key: r.key}) SET f.embedding = vector(r.embedding, ${EMBED_DIMENSIONS}, FLOAT32)`, memory.facts.filter((f) => f.embedding))
  put('UNWIND $rows AS r MATCH (f:Fact {key: r.fact}), (e:Episode {key: r.episode}) CREATE (f)-[:FROM]->(e)', memory.from)
  for (const label of ['Person', 'Identity'] as const) {
    put(`UNWIND $rows AS r MATCH (f:Fact {key: r.fact}), (n:${label} {key: r.subject}) CREATE (f)-[:ABOUT]->(n)`, memory.about.filter((a) => a.label === label))
    put(`UNWIND $rows AS r MATCH (e:Episode {key: r.episode}), (n:${label} {key: r.subject}) CREATE (e)-[:MENTIONS]->(n)`, memory.mentions.filter((m) => m.label === label))
  }
  put('UNWIND $rows AS r MATCH (f:Fact {key: r.fact}), (o:Fact {key: r.old}) CREATE (f)-[:SUPERSEDES]->(o)', memory.supersedes)
}

export async function memoryCountsIn(ask: Ask): Promise<{ episodes: number; facts: number; from: number; about: number; supersedes: number; mentions: number }> {
  const one = async (cypher: string) => Number((await ask(cypher))[0]?.n ?? 0)
  return {
    episodes: await one('MATCH (n:Episode) RETURN count(n) AS n'),
    facts: await one('MATCH (n:Fact) RETURN count(n) AS n'),
    from: await one('MATCH (:Fact)-[r:FROM]->(:Episode) RETURN count(r) AS n'),
    about: await one('MATCH (:Fact)-[r:ABOUT]->() RETURN count(r) AS n'),
    supersedes: await one('MATCH (:Fact)-[r:SUPERSEDES]->(:Fact) RETURN count(r) AS n'),
    mentions: await one('MATCH (:Episode)-[r:MENTIONS]->() RETURN count(r) AS n'),
  }
}

export const RECALL_CYPHER = 'MATCH (f:Fact) SEARCH f IN (VECTOR INDEX factEmbedding FOR $vector WHERE f.closedAt IS NULL LIMIT $k) SCORE AS score MATCH (f)-[:FROM]->(ep:Episode) OPTIONAL MATCH (f)-[:ABOUT]->(who) WITH f, score, collect(DISTINCT ep) AS eps, collect(DISTINCT coalesce(who.name, who.handle, who.key)) AS about RETURN f.id AS id, f.text AS memory, f.slot AS slot, f.validFrom AS validFrom, round(score, 4) AS score, [e IN eps | e.text] AS evidence, [e IN eps | e.at] AS evidenceAt, about, COLLECT { MATCH (f)-[:SUPERSEDES]->(old:Fact) RETURN old.text } AS replaced ORDER BY score DESC'

export const recallParams = (vector: ArrayLike<number>, k: number = MEMORY_RECALL): Record<string, unknown> => ({ vector: [...Array.from(vector)], k })

export async function recallFacts(ask: Ask, vector: ArrayLike<number>, k: number = MEMORY_RECALL): Promise<RecalledFact[]> {
  return recalledOf(await ask(RECALL_CYPHER, recallParams(vector, k)))
}

export function recalledOf(rows: readonly Record<string, unknown>[]): RecalledFact[] {
  return rows.map((r) => ({ id: String(r.id), memory: String(r.memory), slot: String(r.slot), validFrom: String(r.validFrom), score: Number(r.score), evidence: (r.evidence as string[]) ?? [], evidenceAt: (r.evidenceAt as string[]) ?? [], about: ((r.about as (string | null)[]) ?? []).filter((a): a is string => Boolean(a)), replaced: (r.replaced as string[]) ?? [] }))
}

export async function currentFactsAbout(ask: Ask, keys: readonly string[], personId: string | null | undefined): Promise<{ slot: string; text: string; validFrom: string; quote: string | null }[]> {
  const subjects = [...keys, ...(personId ? [`person:${personId}`] : [])]
  return (await ask('MATCH (f:Fact)-[:ABOUT]->(n) WHERE n.key IN $subjects AND f.closedAt IS NULL OPTIONAL MATCH (f)-[:FROM]->(ep:Episode) WITH f, min(ep.at) AS at, head(collect(ep.text)) AS quote RETURN DISTINCT f.slot AS slot, f.text AS text, f.validFrom AS validFrom, quote ORDER BY validFrom DESC LIMIT $limit', { subjects, limit: MEMORY_RECALL })).map((r) => ({ slot: String(r.slot), text: String(r.text), validFrom: String(r.validFrom), quote: (r.quote as string | null) ?? null }))
}
