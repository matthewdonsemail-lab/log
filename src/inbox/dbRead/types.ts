export const BACKFILL_SCOPE = 'backfill:'

export const READ_CATCH_UP_MS = 30_000

export const CHAT_LIST_FRESH_MS = 6 * 60 * 60 * 1000

export type ReadSource =
  | { from: 'db'; reason: 'backfilled' | 'enoughInDb' }
  | { from: 'platform'; reason: 'noLiveOwner' | 'notBackfilled' | 'serverChannel' | 'askedFull' }
  | { from: 'refused'; refused: string }

export interface ReadSourceDeps {
  live: (platform: string, account: string) => boolean
  waitCaughtUp: (platform: string, account: string, options: { timeoutMs: number }) => Promise<{ ok: true; waitedMs: number } | { ok: false; refused: string }>
  backfilledAt: (platform: string, account: string, chatKey: string) => string | null
}

export interface DbMessage {
  id: string
  conversationId: string
  at: string
  from: string
  fromMe: boolean
  text: string
}
