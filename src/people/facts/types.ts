import type { FactSlot } from '../../storage/platform/types'
import type { DecisionsClient } from '../../subq/decisions/index'

export const SLOT_WORDS: Readonly<Record<FactSlot, string>> = {
  job: 'their job, role or title',
  workplace: 'the company or team they work at',
  building: 'the product, project or startup they are building',
  location: 'where they live or are based',
  relationship: 'how they and the owner know each other',
  promisedByOwner: 'something the owner promised to do for them later',
  promisedByThem: 'something they promised to do for the owner later',
  owes: 'money or a favour the owner owes them',
  owedToOwner: 'money or a favour they owe the owner',
  interest: 'a lasting interest or hobby of theirs',
}

export const NO_SLOT = 'none'

export const SCREEN_KINDS: readonly string[] = ['promise', 'debt', 'job', 'workplace', 'building', 'location', 'interest', 'relationship']

export const FACT_OPS = ['ADD', 'SUPERSEDE', 'NOOP'] as const

export type FactOp = (typeof FACT_OPS)[number]

export const MARK_MIN = 0.45

export const PROMISE_MARK_MIN = 0.3

export const PROMISE_KINDS: ReadonlySet<string> = new Set(['promise', 'debt'])

export const SCREEN_MIN_CHARS = 6

export const SCREEN_BATCH = 8

export const DECIDE_BATCH = 8

export const DECIDE_CONTEXT_LINES = 4

export const SLOT_MIN = 0.5

export const LASTING_MIN = 0.6

export const DEFAULT_CHATS = 20

export const STREAM_LINES = 64

export const STREAM_OFFSET = 'stream'

export const STREAM_RETRY_MS = 600_000

export const STREAM_IDLE_MS = 600_000

export const DECIDER_SETTING = 'LOG_FACTS_DECIDER'

export const DEFAULT_DECIDER = 'subq-snap-1.1'

export const SUBQ_DECIDER_PREFIX = 'subq'

export const SCREEN_SETTING = 'LOG_FACTS_SCREEN'

export const REPEAT_OVERLAP = 0.6

export const REPEAT_COSINE = 0.8

export const FACT_LINE_CHARS = 140

export const SCREEN_START_MS = 120_000

export const SCREEN_ASK_MS = 300_000

export const SCREEN_MODEL_KEY = 'facts'

export const EXTRACTED_BY_SCREEN = 'gliner2'

export const EXTRACTED_BY_DECIDE = 'subq'

export const PRONOUNS_SPEAKER: ReadonlySet<string> = new Set(['i', 'me', 'my', 'im', "i'm", 'ill', "i'll", 'myself'])

export const PRONOUNS_LISTENER: ReadonlySet<string> = new Set(['you', 'u', 'your', 'ur', 'yours', 'yourself', 'ya'])

export interface ScreenMark {
  kind: string
  confidence: number
  entities: { label: string; text: string }[]
  relations: { label: string; head: string; tail: string }[]
}

export interface ScreenAnswer {
  marks: ScreenMark[]
  ms: number
}

export type Screener = { model: string; screen: (texts: readonly string[]) => Promise<ScreenAnswer>; stop?: () => void }

export interface ChatLine {
  messageKey: string
  chatId: string
  platform: string
  fromOwner: boolean
  sentAt: string
  text: string
}

export interface Candidate extends ChatLine {
  mark: ScreenMark
  before: ChatLine[]
}

export interface Subject {
  personId: string | null
  platform: string
  userId: string
  handle: string | null
}

export interface FactRow {
  factId: string
  personId: string | null
  platform: string | null
  userId: string | null
  slot: string
  text: string
  quote: string
  sourceMessageKeys: string[]
  validFrom: string
  validTo: string | null
  recordedAt: string
  closedAt: string | null
  supersededBy: string | null
  confidence: number
  extractedBy: string
  source: { platform: string; account: string; sentAt: string; fromOwner: boolean } | null
}

export interface Decision {
  messageKey: string
  slot: FactSlot | null
  op: FactOp
  confidence: number
  supersedes: string[]
  repeatOf: string | null
}

export interface ExtractReport {
  chats: number
  people: { subject: Subject; label: string; messages: number; marked: number; added: FactRow[]; repeats: { messageKey: string; text: string; repeatOf: FactRow }[]; noop: number }[]
  messages: number
  marked: number
  screenMs: number[]
  screenModel: string
  decideModel: string | null
  queued: number
  decideCalls: number
  decideTokens: number
  dropped: number
}

export interface StreamReport {
  lines: number
  marked: number
  ms: number[]
  throughSeq: number
}

export type FactDecider = { ok: true; model: string; decisions: DecisionsClient } | { ok: false; code: string; problem: string }
