import type { DbMessage } from '../dbRead/types'
import type { InboxMessage } from '../watch/types'

export interface PendingRead {
  reader: string
  messages: InboxMessage[]
  alerts: string[]
  text: string | null
}

export type ChatRead = (platform: string, account: string, conversationId: string, limit: number) => DbMessage[]

export type WhoLine = (platform: string, account: string, conversationId: string) => string | null

export type LogSent = (platform: string) => (messageId: string) => boolean
