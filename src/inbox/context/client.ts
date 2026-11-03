import { partiesOf } from '../claims/index'
import { chatEvents } from '../store/index'
import type { StoredEvent } from '../store/index'
import type { ChatContext, ContextMessage, Who } from './types'

function payloadOf(row: StoredEvent): Record<string, unknown> {
  try {
    return JSON.parse(row.payload) as Record<string, unknown>
  } catch {
    return {}
  }
}

function isTheirs(platform: string, row: StoredEvent, payload: Record<string, unknown>, who: Who): boolean {
  const handle = who.handle?.replace(/^@/, '').toLowerCase() ?? null
  if (row.type === 'notification') return (!!who.userId && String(payload.userId ?? '') === who.userId) || (!!handle && String(payload.handle ?? row.withWho).toLowerCase() === handle)
  if (who.conversationId && row.conversationId === who.conversationId) return true
  if (who.userId && partiesOf(platform, row.conversationId).includes(who.userId)) return true
  return !!handle && row.withWho.replace(/^@/, '').toLowerCase() === handle
}

export function chatContextOf(platform: string, account: string, who: Who, since = ''): ChatContext {
  const messages: ContextMessage[] = []
  const activity: Record<string, unknown>[] = []
  for (const row of chatEvents(platform, account, () => true, since)) {
    const payload = payloadOf(row)
    if (!isTheirs(platform, row, payload, who)) continue
    if (row.type === 'notification') activity.push(payload)
    else messages.push({ id: row.eventId, conversationId: row.conversationId, senderId: row.type === 'ownMessage' ? 'me' : row.withWho, text: row.text, time: row.sourceAt || row.receivedAt, fromMe: row.type === 'ownMessage', source: row.source })
  }
  return { messages, activity }
}
