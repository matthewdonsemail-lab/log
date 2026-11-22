import type { Database } from 'bun:sqlite'
import { getState, putState } from '../../storage/state/index'
import { decideFor, markCandidates, subjectOf } from '../../people/facts/helpers/extract'
import { isCandidate, screenLines } from '../../people/facts/helpers/screen'
import type { ChatLine, ExtractReport, FactDecider, FactRow, Screener, Subject } from '../../people/facts/types'
import { EXTRACTED_BY_SCREEN } from '../../people/facts/types'
import { correctionBook } from './corrections'
import type { CorrectionBook } from './corrections'
import type { PassChat } from '../types'

export interface FactsStageResult {
  screened: number
  marked: number
  decided: number
  added: number
  ms: number
  subject: Subject | null
}

export const OFFSETS_SCOPE = 'factOffsets' as const

export function chatOffsetOf(handle: Database, chatId: string): number {
  return getState<{ throughSeq: number }>(OFFSETS_SCOPE, chatId, {}, handle)?.body.throughSeq ?? 0
}

export function markChatOffset(handle: Database, chatId: string, throughSeq: number, now: number): void {
  putState(OFFSETS_SCOPE, chatId, { throughSeq }, now, handle)
}

export async function screenChat(handle: Database, chat: PassChat, screener: Screener, decider: FactDecider, options: { now: Date; log?: (line: string) => void; embed?: (texts: string[]) => Promise<Float32Array[]>; book?: CorrectionBook } = { now: new Date() }): Promise<FactsStageResult> {
  const started = performance.now()
  const now = options.now
  const book = options.book ?? correctionBook(handle)
  const chatRow = { chatId: chat.chatId, platform: chat.platform, account: chat.account, conversationId: chat.conversationId }
  const subject = subjectOf(handle, chatRow)
  const held = chatOffsetOf(handle, chat.chatId)
  const fresh: ChatLine[] = chat.lines.filter((l) => l.seq > held && l.text.trim()).map((l) => ({ messageKey: l.messageKey, chatId: l.chatId, platform: l.platform, fromOwner: l.fromOwner, sentAt: l.sentAt, text: l.text }))
  const result: FactsStageResult = { screened: 0, marked: 0, decided: 0, added: 0, ms: 0, subject }
  if (!subject || !fresh.length) {
    result.ms = performance.now() - started
    return result
  }
  const screened = await screenLines(fresh, screener, () => [])
  const marked = screened.marks.filter((m) => m.mark && isCandidate(m.line, m.mark))
  result.screened = fresh.length
  result.marked = marked.length
  markCandidates(handle, subject, marked, screener.model, now)
  for (const line of fresh) {
    const mark = screened.marks.find((m) => m.line.messageKey === line.messageKey)
    if (!mark?.mark) continue
    const lasting = isCandidate(line, mark.mark)
    if (!lasting) book.add({ text: line.text, label: 'none', kind: mark.mark.kind, from: 'screen', messageKey: line.messageKey, at: now })
  }
  if (decider.ok) {
    const entry: ExtractReport['people'][number] = { subject, label: labelOf(subject), messages: fresh.length, marked: marked.length, added: [], repeats: [], noop: 0 }
    const report = emptyReport(screener.model, decider.model)
    const before = marked.length
    await decideFor(handle, subject, [chat.chatId], entry, report, decider.decisions, { screener, decisions: decider.decisions, decideModel: decider.model, now, ...(options.embed ? { embed: options.embed } : {}), ...(options.log ? { log: options.log } : {}) }, now)
    result.decided = before
    result.added = entry.added.length
    for (const line of fresh) learnFrom(book, line, entry, now)
  }
  if (!options.book) book.flush(now)
  result.ms = performance.now() - started
  return result
}

const labelOf = (subject: Subject): string => (subject.handle ? `${subject.platform} @${subject.handle}` : `${subject.platform} ${subject.userId}`)

function emptyReport(screenModel: string, decideModel: string | null): ExtractReport {
  return { chats: 0, people: [], messages: 0, marked: 0, screenMs: [], screenModel, decideModel, decideCalls: 0, decideTokens: 0, dropped: 0, queued: 0 }
}

function learnFrom(book: CorrectionBook, line: ChatLine, entry: ExtractReport['people'][number], now: Date): void {
  const added: FactRow | undefined = entry.added.find((f) => f.sourceMessageKeys.includes(line.messageKey))
  if (added) {
    book.add({ text: line.text, label: added.slot, kind: added.slot, from: 'decider', messageKey: line.messageKey, at: now })
    return
  }
  const repeat = entry.repeats.find((r) => r.messageKey === line.messageKey)
  if (repeat) {
    book.add({ text: line.text, label: repeat.repeatOf.slot, kind: repeat.repeatOf.slot, from: 'decider', messageKey: line.messageKey, at: now })
    return
  }
  book.add({ text: line.text, label: 'none', kind: EXTRACTED_BY_SCREEN, from: 'decider', messageKey: line.messageKey, at: now })
}
