import type { Database } from 'bun:sqlite'
import { createHash } from 'node:crypto'
import { FACT_SLOTS, PEOPLE_ACCOUNT, PEOPLE_PLATFORM, SINGLE_SLOTS } from '../types'
import type { EventInput, EventInsert, PersonFactInput } from '../types'

const normal = (text: string): string => text.toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/[^\p{L}\p{N}$]+/gu, ' ').trim()

export function factIdOf(input: Pick<PersonFactInput, 'personId' | 'platform' | 'userId' | 'slot' | 'text' | 'sourceMessageKeys'>): string {
  const subject = input.platform && input.userId ? `${input.platform}:${input.userId}` : String(input.personId ?? '')
  return `f_${createHash('sha1').update([subject, input.slot, normal(input.text), [...input.sourceMessageKeys].sort().join(',')].join('|')).digest('hex').slice(0, 16)}`
}

export function factProblem(input: PersonFactInput): string | null {
  if (!(FACT_SLOTS as readonly string[]).includes(input.slot)) return `slot ${input.slot} isn't one of ${FACT_SLOTS.join(', ')}`
  if (!input.sourceMessageKeys.length) return 'a fact needs the message it came from'
  if (!input.quote.trim()) return 'a fact needs the quoted source line'
  if (!(input.platform && input.userId) && !input.personId) return 'a fact needs a person or an identity'
  if (Number.isNaN(Date.parse(input.validFrom))) return `validFrom ${input.validFrom} isn't a time`
  return null
}

export function personFactRecordedEvent(input: PersonFactInput, at: string): EventInsert {
  const factId = input.factId ?? factIdOf(input)
  const payload = { factId, personId: input.personId ?? null, platform: input.platform ?? null, userId: input.userId ?? null, slot: input.slot, text: input.text, quote: input.quote, sourceMessageKeys: [...input.sourceMessageKeys], validFrom: input.validFrom, confidence: input.confidence, extractedBy: input.extractedBy, supersedes: [...(input.supersedes ?? [])] }
  const subject = input.personId ?? `${input.platform}:${input.userId}`
  return { eventId: `pf_${factId.slice(2)}`, platform: PEOPLE_PLATFORM, account: PEOPLE_ACCOUNT, conversationId: subject, type: 'personFactRecorded', with: '', text: input.text, box: '', payload, sourceAt: input.validFrom, receivedAt: at, source: input.extractedBy, known: true }
}

function linkedPerson(handle: Database, platform: string | null, userId: string | null): string | null {
  if (!platform || !userId) return null
  return (handle.prepare('SELECT personId FROM identityLinks WHERE platform = ? AND userId = ? AND revokedAt IS NULL').get(platform, userId) as { personId: string } | null)?.personId ?? null
}

function close(handle: Database, oldIds: readonly string[], by: { factId: string; validFrom: string; recordedAt: string }): void {
  const update = handle.prepare('UPDATE personFacts SET validTo = ?, closedAt = ?, supersededBy = ? WHERE factId = ? AND closedAt IS NULL AND factId != ?')
  for (const id of oldIds) update.run(by.validFrom, by.recordedAt, by.factId, id, by.factId)
}

function sameSubject(handle: Database, personId: string | null, platform: string | null, userId: string | null, slot: string): { factId: string; validFrom: string; recordedAt: string }[] {
  if (personId) return handle.prepare('SELECT factId, validFrom, recordedAt FROM personFacts WHERE personId = ? AND slot = ? AND closedAt IS NULL').all(personId, slot) as { factId: string; validFrom: string; recordedAt: string }[]
  return handle.prepare('SELECT factId, validFrom, recordedAt FROM personFacts WHERE platform = ? AND userId = ? AND slot = ? AND closedAt IS NULL').all(platform, userId, slot) as { factId: string; validFrom: string; recordedAt: string }[]
}

export function derivePersonFact(handle: Database, event: EventInput): void {
  const p = event.payload
  const factId = String(p.factId ?? '')
  const slot = String(p.slot ?? '')
  const keys = Array.isArray(p.sourceMessageKeys) ? (p.sourceMessageKeys as unknown[]).map(String) : []
  if (!factId || !slot || !keys.length) return
  const platform = typeof p.platform === 'string' && p.platform ? p.platform : null
  const userId = typeof p.userId === 'string' && p.userId ? p.userId : null
  const personId = linkedPerson(handle, platform, userId) ?? (typeof p.personId === 'string' && p.personId ? p.personId : null)
  const validFrom = String(p.validFrom ?? event.receivedAt)
  const inserted = handle.prepare('INSERT OR IGNORE INTO personFacts (factId, eventId, personId, platform, userId, slot, text, quote, sourceMessageKeys, validFrom, recordedAt, confidence, extractedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(factId, event.eventId, personId, platform, userId, slot, String(p.text ?? event.text), String(p.quote ?? ''), JSON.stringify(keys), validFrom, event.receivedAt, Number(p.confidence ?? 0), String(p.extractedBy ?? event.source)).changes
  if (!inserted) return
  const named = Array.isArray(p.supersedes) ? (p.supersedes as unknown[]).map(String) : []
  const open = SINGLE_SLOTS.has(slot) ? sameSubject(handle, personId, platform, userId, slot).filter((f) => f.factId !== factId) : []
  close(handle, [...new Set([...named, ...open.filter((f) => f.validFrom <= validFrom).map((f) => f.factId)])], { factId, validFrom, recordedAt: event.receivedAt })
  const later = open.filter((f) => f.validFrom > validFrom).sort((a, b) => a.validFrom.localeCompare(b.validFrom))[0]
  if (later) close(handle, [factId], { factId: later.factId, validFrom: later.validFrom, recordedAt: event.receivedAt })
}

export function factsFollowLink(handle: Database, personId: string, platform: string, userId: string, at: string): void {
  handle.prepare('UPDATE personFacts SET personId = ? WHERE platform = ? AND userId = ?').run(personId, platform, userId)
  for (const slot of SINGLE_SLOTS) {
    const open = (handle.prepare('SELECT factId, validFrom, recordedAt FROM personFacts WHERE personId = ? AND slot = ? AND closedAt IS NULL ORDER BY validFrom DESC, recordedAt DESC, factId').all(personId, slot) as { factId: string; validFrom: string; recordedAt: string }[])
    if (open.length < 2) continue
    const [newest, ...rest] = open
    close(handle, rest.map((f) => f.factId), { factId: newest.factId, validFrom: newest.validFrom, recordedAt: at })
  }
}

export function factsLeaveLink(handle: Database, personId: string, platform: string, userId: string): void {
  handle.prepare('UPDATE personFacts SET personId = NULL WHERE personId = ? AND platform = ? AND userId = ?').run(personId, platform, userId)
}
