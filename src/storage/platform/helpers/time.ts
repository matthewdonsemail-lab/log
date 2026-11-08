import { createHash } from 'node:crypto'
import { textOf } from './ids'

const SECONDS_BELOW = 100_000_000_000

export function msOf(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? Math.round(value < SECONDS_BELOW ? value * 1000 : value) : null
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null
  if (/^\d+(\.\d+)?$/.test(text)) return msOf(Number(text))
  const parsed = Date.parse(text)
  return Number.isFinite(parsed) ? parsed : null
}

export function platformMessageIdOf(payload: Record<string, unknown>): string | null {
  return textOf(payload.id) ?? textOf(payload.itemId) ?? textOf(payload.ts) ?? textOf(payload.messageId)
}

export function messageKeyOf(platform: string, account: string, conversationId: string, platformMessageId: string | null): string | null {
  if (!platformMessageId || !conversationId) return null
  return `${platform}:${account}:${conversationId}:${platformMessageId}`
}

export interface MessageTime {
  sentAtMs: number
  timeSource: 'platform' | 'received'
}

export function messageTimeOf(sourceAt: string, receivedAt: string, fallbackMs: number = Date.now()): MessageTime {
  const platform = msOf(sourceAt)
  if (platform !== null) return { sentAtMs: platform, timeSource: 'platform' }
  return { sentAtMs: msOf(receivedAt) ?? fallbackMs, timeSource: 'received' }
}

export function eventIdFrom(event: { platform: string; account: string; conversationId: string; at: string; text: string; messageKey?: string | null }): string {
  if (event.messageKey) return createHash('sha1').update(event.messageKey).digest('hex').slice(0, 12)
  const at = msOf(event.at)
  return createHash('sha1').update([event.platform, event.account, event.conversationId, at === null ? event.at : String(at), event.text].join('|')).digest('hex').slice(0, 12)
}

export function derivedEventId(type: string, parts: readonly string[]): string {
  return createHash('sha1').update([type, ...parts].join('|')).digest('hex').slice(0, 12)
}
