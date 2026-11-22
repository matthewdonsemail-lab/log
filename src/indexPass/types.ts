export const PASS_SETTING = 'LOG_INDEX_STREAM'

export const PASS_SCOPE = 'indexStream'

export const PASS_CURSOR = 'cursor'

export const PASS_SLICE_MS = 200

export const PASS_SLICE_LINES = 2000

export const PASS_SLICE_CHATS = 24

export const PASS_CHAT_LINES = 5000

export const PASS_RETRY_MS = 600_000

export const PASS_IDLE_MS = 900_000

export const PASS_STAGES = ['search', 'voice', 'facts'] as const

export type PassStage = (typeof PASS_STAGES)[number]

export const PASS_STAGE_NAMES: Readonly<Record<PassStage, string>> = {
  search: 'search',
  voice: 'voice',
  facts: 'facts',
}

export const PASS_BACKLOG_CHATS = 5000

export const PASS_TRAIN_EXAMPLES = 400

export const PASS_TRAIN_HELD_OUT = 5

export const PASS_TRAIN_EPOCHS = 3

export interface PassLine {
  seq: number
  messageKey: string
  chatId: string
  platform: string
  account: string
  conversationId: string
  kind: string
  fromOwner: boolean
  sentAt: string
  text: string
}

export interface PassChat {
  chatId: string
  platform: string
  account: string
  conversationId: string
  kind: string
  lines: PassLine[]
  throughSeq: number
}

export interface PassCounts {
  chats: number
  queued: number
  embedded: number
  voiced: number
  screened: number
  decided: number
}

export interface PassReport extends PassCounts {
  ms: number[]
  throughSeq: number
  head: number
  backlog: number
  stages: Record<PassStage, number>
  waiting: string
}

export interface PassTick {
  chats: number
  queued: number
  embedded: number
  voiced: number
  screened: number
  decided: number
  p50: number
  p95: number
  throughSeq: number
  head: number
  backlog: number
  at: string
  ms: number
  overran: number
}

export const EMPTY_TICK: Omit<PassTick, 'at'> = { chats: 0, queued: 0, embedded: 0, voiced: 0, screened: 0, decided: 0, p50: 0, p95: 0, throughSeq: 0, head: 0, backlog: 0, ms: 0, overran: 0 }

export interface PassOptions {
  limit?: number
  chatIds?: readonly string[]
  platform?: string
  account?: string
  since?: string
  only?: PassStage
  log?: (line: string) => void
  now?: Date
}
