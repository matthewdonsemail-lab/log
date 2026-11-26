import type { Database } from 'bun:sqlite'

export const HAND_SETTLE_MS = 20_000

export const HAND_MAX_ROWS = 200

export const HAND_SHOWN = 8

export const HAND_TEXT_CHARS = 200

export const UNREADABLE = /^\(could not open\b/

export interface HandSend {
  seq: number
  platform: string
  account: string
  conversationId: string
  with: string
  at: string
  text: string
}

export interface ByHandRead {
  sends: HandSend[]
  text: string | null
}

export interface ByHandDeps {
  handle: () => Database
  now: () => number
}
