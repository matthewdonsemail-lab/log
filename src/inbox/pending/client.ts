import { inboxTextWithVoiceNotes } from '../../media/voiceNotes/index'
import { readByHand, sentByLog, sentByLogIds } from '../byHand/index'
import { db } from '../store/index'
import { claimContext } from '../claims/index'
import { chatMessages } from '../dbRead/index'
import { withoutIgnored } from '../ignore/index'
import { heldText, judgeText, judgedMessages } from '../judge/index'
import type { DbMessage } from '../dbRead/types'
import { inboxContext, localTime, placeLabel, storedInboxContext, takeAlerts, takePending, twitterAccounts } from '../watch/index'
import type { InboxMessage } from '../watch/types'
import { pipelineLine } from '../pipeline/client'
import type { ChatRead, LogSent, PendingRead, WhoLine } from './types'

export const ONE_PROCESS_LINE = '>>> ONE PROCESS PER ACCOUNT, NEVER TWO (rule 105): a second watcher tried to start and was refused. Every session shares the one watcher per account through the inbox; another is never started. The owner is told now.'

export const READER_PATTERN = /^[A-Za-z0-9_-]{1,80}$/

export const CONVERSATION_LINES = 12

function chatKeyOf(m: InboxMessage): string {
  return `${m.platform}\u0000${m.account}\u0000${m.conversationId}`
}

function safeRead(read: ChatRead, m: InboxMessage): DbMessage[] {
  try {
    return read(m.platform, m.account, m.conversationId, CONVERSATION_LINES)
  } catch {
    return []
  }
}

function safeWhoLine(platform: string, account: string, conversationId: string): string | null {
  try {
    const line = pipelineLine(platform, account, conversationId)
    return line ? `  log's read of them:${line.slice(1)}` : null
  } catch {
    return null
  }
}

function safeLogSent(platform: string): (id: string) => boolean {
  try {
    const ids = sentByLogIds(db(), [platform])
    return (id) => sentByLog(ids, platform, id)
  } catch {
    return () => false
  }
}

function safeByHand(reader: string): string | null {
  try {
    return readByHand(reader).text
  } catch {
    return null
  }
}

function rowText(r: DbMessage): string {
  const judged = r.fromMe ? null : judgeText(r.text ?? '')
  if (judged?.verdict === 'held') return heldText(judged, (r.text ?? '').length)
  const text = r.text || (r.attachments?.length ? `[${r.attachments.map((a) => a.name).join(', ')}]` : '(no text)')
  return text.replace(/\s+/g, ' ').slice(0, 240)
}

export function againstTheDb(messages: readonly InboxMessage[], read: ChatRead = chatMessages, whoLine: WhoLine = safeWhoLine, logSent: LogSent = safeLogSent): { fresh: InboxMessage[]; behind: InboxMessage[]; conversations: string[] } {
  const chats = new Map<string, InboxMessage[]>()
  for (const m of messages) chats.set(chatKeyOf(m), [...(chats.get(chatKeyOf(m)) ?? []), m])
  const fresh: InboxMessage[] = []
  const behind: InboxMessage[] = []
  const conversations: string[] = []
  for (const group of chats.values()) {
    const rows = safeRead(read, group[0])
    const lastOwn = [...rows].reverse().find((r) => r.fromMe)
    const ownMs = lastOwn ? Date.parse(lastOwn.at) : NaN
    const isBehind = (m: InboxMessage) => Number.isFinite(ownMs) && Date.parse(m.at) < ownMs
    const live = group.filter((m) => !isBehind(m))
    behind.push(...group.filter(isBehind))
    fresh.push(...live)
    if (!live.length || !rows.length) continue
    const { with: who, platform, account, conversationId } = group[0]
    const byLog = rows.some((r) => r.fromMe) ? logSent(platform) : () => false
    conversations.push([
      `>>> THE CONVERSATION WITH ${who}${placeLabel(group[0])} NOW (${platform} ${account}, chat ${conversationId}), read from the .db as this turn starts, newest last. Answer this, not the single lines above: everything they sent since the owner last wrote is the context.`,
      ...rows.map((r) => `  ${localTime(r.at)} ${r.fromMe ? (byLog(r.id) ? 'the owner (sent by log)' : 'the owner (by hand)') : r.from}: ${rowText(r)}`),
      ...[whoLine(platform, account, conversationId)].filter((l): l is string => Boolean(l)),
    ].join('\n'))
  }
  return { fresh, behind, conversations }
}

export function behindLine(behind: readonly InboxMessage[]): string | null {
  if (!behind.length) return null
  const who = [...new Set(behind.map((m) => `${m.with} (${m.platform}, chat ${m.conversationId})`))].join(', ')
  return `>>> ALREADY BEHIND THE OWNER'S LAST MESSAGE (${behind.length}): ${who}. They landed late and the owner wrote in that chat after them, so there is nothing to answer and nothing to report one by one.`
}

export function readPending(reader: string, options: { stored?: boolean; read?: ChatRead; byHand?: (reader: string) => string | null } = {}): PendingRead {
  const alerts = takeAlerts(reader)
  const judged = judgedMessages(withoutIgnored(takePending(reader)).map((m) => ({ ...m, text: inboxTextWithVoiceNotes(m) })))
  const messages = judged.messages
  const { fresh, behind, conversations } = againstTheDb(messages, options.read)
  const loud = alerts.length ? [ONE_PROCESS_LINE, ...alerts].join('\n') : ''
  const hand = (options.byHand ?? safeByHand)(reader)
  const text = [loud, judged.alerts.join('\n'), inboxContext(fresh), hand, ...conversations, behindLine(behind), claimContext(fresh), options.stored ? storedInboxContext(twitterAccounts()) : null].filter(Boolean).join('\n\n')
  return { reader, messages, alerts, text: text || null }
}
