import type { Database } from 'bun:sqlite'
import { factProblem, insertEventRow, personFactRecordedEvent } from '../../storage/platform/index'
import { PROMISE_SLOTS } from '../../storage/platform/types'
import type { PersonFactInput } from '../../storage/platform/types'
import { FACT_LINE_CHARS, REPEAT_COSINE, REPEAT_OVERLAP } from './types'
import type { FactRow } from './types'

type Embed = (texts: string[]) => Promise<Float32Array[]>

interface StoredFact {
  factId: string
  personId: string | null
  platform: string | null
  userId: string | null
  slot: string
  text: string
  quote: string
  sourceMessageKeys: string
  validFrom: string
  validTo: string | null
  recordedAt: string
  closedAt: string | null
  supersededBy: string | null
  confidence: number
  extractedBy: string
}

export function recordFact(handle: Database, input: PersonFactInput, now: Date = new Date()): { ok: true; factId: string; fresh: boolean } | { ok: false; problem: string } {
  const problem = factProblem(input)
  if (problem) return { ok: false, problem }
  const read = handle.prepare('SELECT text FROM messages WHERE messageKey = ?')
  for (const key of input.sourceMessageKeys) {
    const row = read.get(key) as { text: string } | null
    if (!row) return { ok: false, problem: `the source message ${key} isn't in log.db` }
    if (!row.text.includes(input.quote.trim()) && !input.quote.includes(row.text.trim())) return { ok: false, problem: `the quote isn't in the source message ${key}` }
  }
  const event = personFactRecordedEvent(input, now.toISOString())
  const inserted = insertEventRow(handle, event, now)
  return { ok: true, factId: String(event.payload.factId), fresh: Boolean(inserted) }
}

function rowOf(handle: Database, f: StoredFact): FactRow {
  const keys = JSON.parse(f.sourceMessageKeys) as string[]
  const src = keys.length ? (handle.prepare('SELECT c.platform AS platform, c.account AS account, m.sentAt AS sentAt, m.fromOwner AS fromOwner FROM messages m JOIN chats c ON c.chatId = m.chatId WHERE m.messageKey = ?').get(keys[0]) as { platform: string; account: string; sentAt: string; fromOwner: number } | null) : null
  return { ...f, sourceMessageKeys: keys, source: src ? { platform: src.platform, account: src.account, sentAt: src.sentAt, fromOwner: src.fromOwner === 1 } : null }
}

export function factsAbout(handle: Database, subject: { personId: string | null; identities: readonly { platform: string; userId: string }[] }, options: { all?: boolean; slots?: ReadonlySet<string> } = {}): FactRow[] {
  const ids = subject.identities.map((i) => [i.platform, i.userId] as const)
  const where = [...(subject.personId ? ['personId = ?'] : []), ...ids.map(() => '(platform = ? AND userId = ?)')]
  if (!where.length) return []
  const rows = handle.prepare(`SELECT factId, personId, platform, userId, slot, text, quote, sourceMessageKeys, validFrom, validTo, recordedAt, closedAt, supersededBy, confidence, extractedBy FROM personFacts WHERE (${where.join(' OR ')})${options.all ? '' : ' AND closedAt IS NULL'} ORDER BY validFrom DESC, recordedAt DESC`).all(...(subject.personId ? [subject.personId] : []), ...ids.flatMap((i) => [...i])) as StoredFact[]
  return rows.filter((r) => !options.slots || options.slots.has(r.slot)).map((r) => rowOf(handle, r))
}

export function counterpartsOf(handle: Database, chatIds: readonly string[]): { platform: string; userId: string }[] {
  if (!chatIds.length) return []
  const rows = handle.prepare(`SELECT senderPlatform AS platform, senderUserId AS userId, COUNT(*) AS n FROM messages WHERE chatId IN (${chatIds.map(() => '?').join(',')}) AND fromOwner = 0 AND senderUserId NOT LIKE 'unknown:%' GROUP BY senderPlatform, senderUserId ORDER BY n DESC`).all(...chatIds) as { platform: string; userId: string; n: number }[]
  return rows.map((r) => ({ platform: r.platform, userId: r.userId }))
}

export function linkedPersonOf(handle: Database, identity: { platform: string; userId: string }): string | null {
  return (handle.prepare('SELECT personId FROM identityLinks WHERE platform = ? AND userId = ? AND revokedAt IS NULL').get(identity.platform, identity.userId) as { personId: string } | null)?.personId ?? null
}

export function factsForChats(handle: Database, chatIds: readonly string[], options: { all?: boolean; slots?: ReadonlySet<string> } = {}): FactRow[] {
  const identities = counterpartsOf(handle, chatIds)
  const persons = [...new Set(identities.map((i) => linkedPersonOf(handle, i)).filter((p): p is string => Boolean(p)))]
  const byId = new Map<string, FactRow>()
  for (const f of factsAbout(handle, { personId: null, identities }, options)) byId.set(f.factId, f)
  for (const personId of persons) for (const f of factsAbout(handle, { personId, identities: [] }, options)) byId.set(f.factId, f)
  return [...byId.values()].sort((a, b) => b.validFrom.localeCompare(a.validFrom))
}

export function openPromises(facts: readonly FactRow[]): FactRow[] {
  return facts.filter((f) => PROMISE_SLOTS.has(f.slot) && !f.closedAt)
}

const words = (text: string): Set<string> => new Set(text.toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/[^\p{L}\p{N}$]+/gu, ' ').split(' ').filter((w) => w.length >= 2))

export function overlapOf(a: string, b: string): number {
  const x = words(a)
  const y = words(b)
  if (!x.size || !y.size) return 0
  let shared = 0
  for (const w of x) if (y.has(w)) shared++
  return shared / Math.min(x.size, y.size)
}

const cosine = (a: ArrayLike<number>, b: ArrayLike<number>): number => {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

export async function repeatedPromise(draft: string, promises: readonly FactRow[], embed?: Embed): Promise<{ fact: FactRow; how: string } | null> {
  if (!draft.trim() || !promises.length) return null
  const lexical = promises.map((fact) => ({ fact, overlap: Math.max(overlapOf(draft, fact.text), overlapOf(draft, fact.quote)) })).sort((a, b) => b.overlap - a.overlap)[0]
  if (lexical.overlap >= REPEAT_OVERLAP) return { fact: lexical.fact, how: `${Math.round(lexical.overlap * 100)}% the same words` }
  if (!embed) return null
  try {
    const vectors = await embed([draft, ...promises.map((p) => p.text)])
    const best = promises.map((fact, i) => ({ fact, score: cosine(vectors[0], vectors[i + 1]) })).sort((a, b) => b.score - a.score)[0]
    return best.score >= REPEAT_COSINE ? { fact: best.fact, how: `meaning ${best.score.toFixed(2)}` } : null
  } catch {
    return null
  }
}

const clip = (text: string, n = FACT_LINE_CHARS): string => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat
}

export function factLine(f: FactRow): string {
  const where = f.source ? `${f.source.platform}${f.source.fromOwner ? ', the owner said' : ', they said'}` : 'source not in log.db'
  return `${f.slot} since ${f.validFrom.slice(0, 10)}: "${clip(f.text)}" (${where}${f.closedAt ? `; replaced ${f.closedAt.slice(0, 10)}` : ''})`
}

export function alreadyPromisedBlock(repeat: { fact: FactRow; how: string }): string {
  return `already promised: the owner said "${clip(repeat.fact.quote, 90)}" on ${repeat.fact.validFrom.slice(0, 10)} and it is still open (${repeat.how}); saying it again reads as empty, so follow up on it or leave it out`
}

export function promiseLines(facts: readonly FactRow[]): string[] {
  const open = openPromises(facts)
  return open.length ? ['already promised and still open (never promise it again; follow up on it or say it was done):', ...open.map((f) => `  ${factLine(f)}`)] : []
}
