import type { MessageAttachment } from '../catchUp/types'

export const BACKFILL_SCOPE = 'backfill:'

export const CHAT_LIST_FRESH_MS = 6 * 60 * 60 * 1000

export type ReadSource =
  | { from: 'db'; reason: 'backfilled' | 'enoughInDb' }
  | { from: 'platform'; reason: 'noLiveOwner' | 'notBackfilled' | 'serverChannel' | 'askedFull' | 'mediaNotSaved' | 'catchingUp' }
  | { from: 'refused'; refused: string }

export interface ReadSourceDeps {
  live: (platform: string, account: string) => boolean
  behind: (platform: string, account: string) => { status: string; fromAt: string; detail?: string | null } | null
  backfilledAt: (platform: string, account: string, chatKey: string) => string | null
}

export interface DbMessage {
  id: string
  conversationId: string
  at: string
  from: string
  fromMe: boolean
  text: string
  attachments?: MessageAttachment[]
}
