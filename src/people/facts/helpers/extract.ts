import type { Database } from 'bun:sqlite'
import type { DecisionsClient } from '../../../subq/decisions/index'
import { getState, putState } from '../../../storage/state/index'
import { xPartiesOf } from '../../../twitter/dm/person/client'
import { resolveWho } from '../../client'
import { factsAbout, linkedPersonOf, overlapOf, recordFact } from '../client'
import { DECIDE_BATCH, DECIDE_CONTEXT_LINES, DEFAULT_CHATS, EXTRACTED_BY_DECIDE, REPEAT_OVERLAP, STREAM_LINES, STREAM_OFFSET } from '../types'
import type { Candidate, ChatLine, Decision, ExtractReport, FactRow, ScreenMark, Screener, StreamReport, Subject } from '../types'
import { decideBatch } from './decide'
import { endpointsOf, isCandidate, screenLines } from './screen'

type Embed = (texts: string[]) => Promise<Float32Array[]>

export interface ExtractOptions {
  screener: Screener
  decisions: DecisionsClient | null
  decideModel?: string
  embed?: Embed
  who?: string
  since?: string
  chats?: number
  platforms?: readonly string[]
  now?: Date
  log?: (line: string) => void
}

const OWNER_ONLY: ReadonlySet<string> = new Set(['promisedByOwner', 'owes'])

const THEIRS_ONLY: ReadonlySet<string> = new Set(['job', 'workplace', 'building', 'location', 'interest', 'promisedByThem'])

export function sideAllows(slot: string, fromOwner: boolean): boolean {
  if (OWNER_ONLY.has(slot)) return fromOwner
  if (THEIRS_ONLY.has(slot)) return !fromOwner
  return true
}

interface ChatRow {
  chatId: string
  platform: string
  account: string
  conversationId: string
  subject?: Subject
}

function subjectOf(handle: Database, chat: ChatRow): Subject | null {
  const spoke = handle.prepare("SELECT senderUserId AS userId, COUNT(*) AS n FROM messages WHERE chatId = ? AND fromOwner = 0 AND senderUserId NOT LIKE 'unknown:%' GROUP BY senderUserId ORDER BY n DESC LIMIT 1").get(chat.chatId) as { userId: string } | null
  let userId = spoke?.userId ?? null
  if (!userId && chat.platform === 'twitter') {
    const owner = (handle.prepare('SELECT userId FROM accounts WHERE platform = ? AND account = ?').get(chat.platform, chat.account) as { userId: string } | null)?.userId
    userId = xPartiesOf(chat.conversationId).find((id) => id !== owner) ?? null
  }
  if (!userId) return null
  const identity = handle.prepare('SELECT handle FROM identities WHERE platform = ? AND userId = ?').get(chat.platform, userId) as { handle: string | null } | null
  return { personId: linkedPersonOf(handle, { platform: chat.platform, userId }), platform: chat.platform, userId, handle: identity?.handle ?? null }
}

function chatsToRead(handle: Database, options: ExtractOptions): ChatRow[] | { problem: string } {
  const platforms = options.platforms?.length ? options.platforms : null
  const on = platforms ? ` AND c.platform IN (${platforms.map(() => '?').join(',')})` : ''
  if (options.who) {
    const who = resolveWho(handle, options.who)
    if (!who.ok) return { problem: who.problem }
    const ids = who.identities.map((i) => [i.platform, i.userId] as const)
    const theirs = new Set(who.identities.filter((i) => i.runByLogAs).map((i) => `${i.platform}:${i.runByLogAs}`))
    const pairs = ids.map(() => '(platform = ? AND userId = ?)').join(' OR ')
    const sent = ids.map(() => '(senderPlatform = ? AND senderUserId = ?)').join(' OR ')
    const sql = `SELECT c.chatId, c.platform, c.account, c.conversationId FROM chats c WHERE c.kind = 'dm' AND (c.chatId IN (SELECT roomId FROM memberships WHERE ${pairs}) OR c.chatId IN (SELECT chatId FROM messages WHERE ${sent}))${on}`
    const rows = handle.prepare(sql).all(...ids.flatMap((i) => [...i]), ...ids.flatMap((i) => [...i]), ...(platforms ?? [])) as ChatRow[]
    const mine = new Set(who.identities.map((i) => `${i.platform}:${i.userId}`))
    return rows.filter((row) => !theirs.has(`${row.platform}:${row.account}`)).flatMap((row) => {
      const found = subjectOf(handle, row)
      const identity = who.identities.find((i) => i.platform === row.platform)
      if (found && !mine.has(`${found.platform}:${found.userId}`)) return []
      if (!found && !identity) return []
      const subject = found ?? { personId: who.personId, platform: row.platform, userId: identity!.userId, handle: identity!.handle ?? null }
      return [{ ...row, subject: { ...subject, personId: who.personId ?? subject.personId } }]
    })
  }
  const limit = options.chats ?? DEFAULT_CHATS
  const rows = handle.prepare(`SELECT c.chatId, c.platform, c.account, c.conversationId FROM chats c WHERE c.kind = 'dm' AND c.lastMessageAtMs IS NOT NULL${on} AND EXISTS (SELECT 1 FROM messages m WHERE m.chatId = c.chatId AND m.fromOwner = 1) ORDER BY c.lastMessageAtMs DESC LIMIT ?`).all(...(platforms ?? []), limit * 3) as ChatRow[]
  const subjects = new Set<string>()
  const out: ChatRow[] = []
  for (const row of rows) {
    const s = subjectOf(handle, row)
    if (!s) continue
    const key = `${s.platform}:${s.userId}`
    if (!subjects.has(key) && subjects.size >= limit) continue
    subjects.add(key)
    out.push(row)
  }
  return out
}

const keyOfLine = (l: { fromOwner: boolean; text: string; sentAt: string }): string => `${l.fromOwner ? 1 : 0}|${l.text.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim().toLowerCase()}|${l.sentAt.slice(0, 19)}`

function linesOf(handle: Database, chats: readonly ChatRow[], since: string | null): { lines: ChatLine[]; fresh: Set<string>; through: Map<string, number> } {
  const seen = new Set<string>()
  const lines: ChatLine[] = []
  const fresh = new Set<string>()
  const through = new Map<string, number>()
  const all: (ChatLine & { seq: number; sentAtMs: number })[] = []
  for (const chat of chats) {
    const offset = getState<{ throughSeq: number }>('factOffsets', chat.chatId, {}, handle)?.body.throughSeq ?? 0
    const rows = handle.prepare('SELECT seq, messageKey, chatId, fromOwner, sentAt, sentAtMs, text FROM messages WHERE chatId = ? ORDER BY sentAtMs, seq').all(chat.chatId) as { seq: number; messageKey: string; chatId: string; fromOwner: number; sentAt: string; sentAtMs: number; text: string }[]
    through.set(chat.chatId, rows.reduce((n, r) => Math.max(n, r.seq), offset))
    for (const r of rows) {
      const line = { seq: r.seq, sentAtMs: r.sentAtMs ?? 0, messageKey: r.messageKey, chatId: r.chatId, platform: chat.platform, fromOwner: r.fromOwner === 1, sentAt: r.sentAt, text: r.text ?? '' }
      all.push(line)
      if (r.seq > offset && (!since || r.sentAt >= since)) fresh.add(r.messageKey)
    }
  }
  all.sort((a, b) => a.sentAtMs - b.sentAtMs || a.seq - b.seq)
  for (const l of all) {
    const key = keyOfLine(l)
    if (seen.has(key)) {
      fresh.delete(l.messageKey)
      continue
    }
    seen.add(key)
    lines.push({ messageKey: l.messageKey, chatId: l.chatId, platform: l.platform, fromOwner: l.fromOwner, sentAt: l.sentAt, text: l.text })
  }
  return { lines, fresh, through }
}

const repeatIn = (line: { text: string; fromOwner: boolean }, facts: readonly FactRow[], slot?: string | null): FactRow | null => facts.filter((f) => (!slot || f.slot === slot) && (f.source?.fromOwner ?? line.fromOwner) === line.fromOwner).map((f) => ({ f, o: Math.max(overlapOf(line.text, f.text), overlapOf(line.text, f.quote)) })).filter((x) => x.o >= REPEAT_OVERLAP).sort((a, b) => b.o - a.o)[0]?.f ?? null

const labelOf = (subject: Subject): string => (subject.handle ? `${subject.platform} @${subject.handle}` : `${subject.platform} ${subject.userId}`)

const subjectKey = (subject: Subject): string => subject.personId ?? `${subject.platform}:${subject.userId}`

function markCandidates(handle: Database, subject: Subject, marked: readonly { line: ChatLine; mark: ScreenMark }[], model: string, now: Date): void {
  const known = new Map<string, string>([[String(subject.handle ?? '').toLowerCase(), `${subject.platform}:${subject.userId}`]])
  const put = handle.prepare('INSERT OR IGNORE INTO factCandidates (messageKey, chatId, kind, confidence, marks, model, decided, markedAt) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)')
  for (const { line, mark } of marked) {
    const sides = line.fromOwner ? { speaker: 'owner', listener: `${subject.platform}:${subject.userId}` } : { speaker: `${subject.platform}:${subject.userId}`, listener: 'owner' }
    put.run(line.messageKey, line.chatId, mark.kind, mark.confidence, JSON.stringify({ entities: mark.entities, relations: endpointsOf(mark, sides, known) }), model, now.toISOString())
  }
}

interface QueuedRow {
  messageKey: string
  chatId: string
  kind: string
  confidence: number
  marks: string
  fromOwner: number
  sentAt: string
  sentAtMs: number
  seq: number
  text: string
  platform: string
}

function queuedIn(handle: Database, chatIds: readonly string[]): QueuedRow[] {
  if (!chatIds.length) return []
  return handle.prepare(`SELECT f.messageKey, f.chatId, f.kind, f.confidence, f.marks, m.fromOwner, m.sentAt, m.sentAtMs, m.seq, m.text, c.platform FROM factCandidates f JOIN messages m ON m.messageKey = f.messageKey JOIN chats c ON c.chatId = f.chatId WHERE f.decided IS NULL AND f.chatId IN (${chatIds.map(() => '?').join(', ')}) ORDER BY m.sentAtMs, m.seq`).all(...chatIds) as QueuedRow[]
}

function beforeOf(handle: Database, row: QueuedRow, platform: string): ChatLine[] {
  const rows = handle.prepare('SELECT messageKey, chatId, fromOwner, sentAt, text FROM messages WHERE chatId = ?1 AND (sentAtMs < ?2 OR (sentAtMs = ?2 AND seq < ?3)) ORDER BY sentAtMs DESC, seq DESC LIMIT ?4').all(row.chatId, row.sentAtMs ?? 0, row.seq, DECIDE_CONTEXT_LINES) as { messageKey: string; chatId: string; fromOwner: number; sentAt: string; text: string }[]
  return rows.reverse().map((r) => ({ messageKey: r.messageKey, chatId: r.chatId, platform, fromOwner: r.fromOwner === 1, sentAt: r.sentAt, text: r.text ?? '' }))
}

function queuedCandidates(handle: Database, chatIds: readonly string[]): Candidate[] {
  const decided = handle.prepare('UPDATE factCandidates SET decided = ? WHERE messageKey = ?')
  const seen = new Set<string>()
  const out: Candidate[] = []
  for (const row of queuedIn(handle, chatIds)) {
    const line: ChatLine = { messageKey: row.messageKey, chatId: row.chatId, platform: row.platform, fromOwner: row.fromOwner === 1, sentAt: row.sentAt, text: row.text ?? '' }
    const key = keyOfLine(line)
    if (seen.has(key)) {
      decided.run('NOOP', row.messageKey)
      continue
    }
    seen.add(key)
    const stored = JSON.parse(row.marks) as { entities?: ScreenMark['entities'] }
    out.push({ ...line, mark: { kind: row.kind, confidence: row.confidence, entities: stored.entities ?? [], relations: [] }, before: beforeOf(handle, row, row.platform) })
  }
  return out
}

export function queuedCount(handle: Database): number {
  return (handle.prepare('SELECT COUNT(*) AS n FROM factCandidates WHERE decided IS NULL').get() as { n: number }).n
}

export async function extractFacts(handle: Database, options: ExtractOptions): Promise<ExtractReport | { problem: string }> {
  const now = options.now ?? new Date()
  const log = options.log ?? (() => undefined)
  const chats = chatsToRead(handle, options)
  if ('problem' in chats) return chats
  const groups = new Map<string, { subject: Subject; chats: ChatRow[] }>()
  for (const chat of chats) {
    const subject = chat.subject ?? subjectOf(handle, chat)
    if (!subject) continue
    const key = subjectKey(subject)
    const held = groups.get(key) ?? { subject, chats: [] }
    held.chats.push(chat)
    groups.set(key, held)
  }
  const report: ExtractReport = { chats: chats.length, people: [], messages: 0, marked: 0, screenMs: [], screenModel: options.screener.model, decideModel: options.decideModel ?? null, decideCalls: 0, decideTokens: 0, dropped: 0, queued: 0 }
  for (const { subject, chats: group } of groups.values()) {
    const label = labelOf(subject)
    const { lines, fresh, through } = linesOf(handle, group, options.since ?? null)
    const index = new Map(lines.map((l, i) => [l.messageKey, i]))
    const asked = lines.filter((l) => fresh.has(l.messageKey))
    const entry: ExtractReport['people'][number] = { subject, label, messages: asked.length, marked: 0, added: [], repeats: [], noop: 0 }
    report.people.push(entry)
    report.messages += asked.length
    if (asked.length) {
      log(`facts: ${label}: screening ${asked.length} new message(s) with ${options.screener.model}`)
      const screened = await screenLines(asked, options.screener, (l) => lines.slice(Math.max(0, (index.get(l.messageKey) ?? 0) - DECIDE_CONTEXT_LINES), index.get(l.messageKey) ?? 0))
      report.screenMs.push(...screened.perMessageMs)
      entry.marked = screened.candidates.length
      report.marked += screened.candidates.length
      markCandidates(handle, subject, screened.candidates.map((c) => ({ line: c, mark: c.mark })), options.screener.model, now)
    }
    for (const [chatId, seq] of through) putState('factOffsets', chatId, { throughSeq: seq }, now.getTime(), handle)
    if (!options.decisions) continue
    await decideFor(handle, subject, group.map((c) => c.chatId), entry, report, options.decisions, options, now)
  }
  report.queued = queuedCount(handle)
  return report
}

async function decideFor(handle: Database, subject: Subject, chatIds: readonly string[], entry: ExtractReport['people'][number], report: ExtractReport, decisions: DecisionsClient, options: ExtractOptions, now: Date): Promise<void> {
  const queued = queuedCandidates(handle, chatIds)
  if (!queued.length) return
  const current = () => factsAbout(handle, { personId: subject.personId, identities: [{ platform: subject.platform, userId: subject.userId }] })
  const pending: Candidate[] = []
  const settled: Decision[] = []
  for (const c of queued) {
    const again = repeatIn(c, current())
    if (again) settled.push({ messageKey: c.messageKey, slot: null, op: 'NOOP', confidence: 1, supersedes: [], repeatOf: again.factId })
    else pending.push(c)
  }
  for (let i = 0; i < pending.length; i += DECIDE_BATCH) {
    const batch = pending.slice(i, i + DECIDE_BATCH)
    const answer = await decideBatch(entry.label, batch, current(), decisions, options.decideModel)
    report.decideCalls++
    report.decideTokens += answer.inputTokens
    settled.push(...answer.decisions)
  }
  const byKey = new Map(queued.map((c) => [c.messageKey, c]))
  const decided = handle.prepare('UPDATE factCandidates SET decided = ? WHERE messageKey = ?')
  const addedIds: string[] = []
  for (const d of settled.sort((a, b) => byKey.get(a.messageKey)!.sentAt.localeCompare(byKey.get(b.messageKey)!.sentAt))) {
    const c = byKey.get(d.messageKey)!
    const facts = current()
    const repeat = d.repeatOf ? facts.find((f) => f.factId === d.repeatOf) ?? null : d.slot ? repeatIn(c, facts, d.slot) : null
    if (repeat && (d.op === 'NOOP' || d.op === 'ADD')) {
      entry.repeats.push({ messageKey: c.messageKey, text: c.text, repeatOf: repeat })
      decided.run('NOOP', c.messageKey)
      continue
    }
    if (!d.slot || d.op === 'NOOP') {
      entry.noop++
      decided.run('NOOP', c.messageKey)
      continue
    }
    if (!sideAllows(d.slot, c.fromOwner)) {
      report.dropped++
      decided.run('dropped', c.messageKey)
      continue
    }
    const recorded = recordFact(handle, { personId: subject.personId, platform: subject.platform, userId: subject.userId, slot: d.slot, text: c.text.trim(), quote: c.text.trim(), sourceMessageKeys: [c.messageKey], validFrom: c.sentAt, confidence: Number(d.confidence.toFixed(3)), extractedBy: `${options.screener.model}+${options.decideModel ?? EXTRACTED_BY_DECIDE}`, supersedes: d.supersedes }, now)
    if (!recorded.ok) {
      report.dropped++
      decided.run('dropped', c.messageKey)
      continue
    }
    decided.run(d.op, c.messageKey)
    addedIds.push(recorded.factId)
  }
  if (addedIds.length && options.embed) await options.embed(current().filter((f) => addedIds.includes(f.factId)).map((f) => f.text)).catch(() => [])
  entry.added.push(...factsAbout(handle, { personId: subject.personId, identities: [{ platform: subject.platform, userId: subject.userId }] }, { all: true }).filter((f) => addedIds.includes(f.factId)))
}

export async function screenStream(handle: Database, screener: Screener, now: Date = new Date(), limit: number = STREAM_LINES): Promise<StreamReport> {
  const head = (handle.prepare('SELECT COALESCE(MAX(seq), 0) AS n FROM messages').get() as { n: number }).n
  const held = getState<{ throughSeq: number }>('factOffsets', STREAM_OFFSET, {}, handle)?.body.throughSeq
  if (held === undefined) {
    putState('factOffsets', STREAM_OFFSET, { throughSeq: head }, now.getTime(), handle)
    return { lines: 0, marked: 0, ms: [], throughSeq: head }
  }
  const rows = handle.prepare("SELECT m.seq, m.messageKey, m.chatId, m.fromOwner, m.sentAt, m.text, c.platform, c.account, c.conversationId FROM messages m JOIN chats c ON c.chatId = m.chatId WHERE m.seq > ?1 AND m.seq <= ?2 AND c.kind = 'dm' ORDER BY m.seq LIMIT ?3").all(held, head, limit) as { seq: number; messageKey: string; chatId: string; fromOwner: number; sentAt: string; text: string; platform: string; account: string; conversationId: string }[]
  const through = rows.length === limit ? rows[rows.length - 1].seq : head
  const byChat = new Map<string, typeof rows>()
  const offsets = new Map<string, number | undefined>()
  for (const r of rows) {
    if (!offsets.has(r.chatId)) offsets.set(r.chatId, getState<{ throughSeq: number }>('factOffsets', r.chatId, {}, handle)?.body.throughSeq)
    if (r.seq <= (offsets.get(r.chatId) ?? 0)) continue
    byChat.set(r.chatId, [...(byChat.get(r.chatId) ?? []), r])
  }
  const report: StreamReport = { lines: 0, marked: 0, ms: [], throughSeq: through }
  for (const [chatId, chatRows] of byChat) {
    const first = chatRows[0]
    const subject = subjectOf(handle, { chatId, platform: first.platform, account: first.account, conversationId: first.conversationId })
    const lines: ChatLine[] = chatRows.map((r) => ({ messageKey: r.messageKey, chatId: r.chatId, platform: r.platform, fromOwner: r.fromOwner === 1, sentAt: r.sentAt, text: r.text ?? '' }))
    report.lines += lines.length
    if (subject) {
      const screened = await screenLines(lines, screener, () => [])
      report.ms.push(...screened.perMessageMs)
      const marked = screened.marks.filter((m) => m.mark && isCandidate(m.line, m.mark))
      report.marked += marked.length
      markCandidates(handle, subject, marked, screener.model, now)
    }
    if (offsets.get(chatId) !== undefined) putState('factOffsets', chatId, { throughSeq: chatRows[chatRows.length - 1].seq }, now.getTime(), handle)
  }
  putState('factOffsets', STREAM_OFFSET, { throughSeq: through }, now.getTime(), handle)
  return report
}

export function percentile(values: readonly number[], p: number): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))]
}
