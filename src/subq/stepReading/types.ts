import type { DecisionAnswer } from '../decisions/types'

export const SUBQ_STEP_MODEL = 'subq-snap-1.1'
export const EXCHANGES_FILE = 'exchanges.json'
export const READING_FILE = 'reading.json'
export const MAX_QUESTIONS = 128
export const MAX_STATE_CHARS = 1_000_000
export const MAX_STRING_CHARS = 400
export const MAX_LIST_ITEMS = 6
export const MAX_DEPTH = 10
export const MAX_PAGE_TEXT_CHARS = 30_000
export const MAX_DOCUMENT_FIELD_CHARS = 2_000

export const SECRET_PARAMS = /^(fb_dtsg|fb_dtsg_ag|lsd|jazoest|__user|__a|__req|__hs|__hsi|__hsdp|__hblp|__sjsp|__dyn|__csr|__comet_req|__rev|__s|__spin_r|__spin_b|__spin_t|__crn|__ccg|__aaid|dpr|av|access_token|token|csrf|csrf_token|xsrf|session|password|pass|otp|code)$/i

export const ANSWER_SECRETS = /^(fb_dtsg|lsd|jazoest|access_token|csrf_token|password)$/i

export const DOCUMENT_FIELDS: Record<string, readonly string[]> = {
  facebook: ['sell_location', 'buy_location', 'marketplace_listing_creation_limit_reason', 'marketplace_new_seller_can_post_item', 'current_marketplace', 'product_details_type', 'partner_brand_name', 'partner_listing_location']
}

export const CODE_LOADING_PATHS = /^\/(static_resources|ajax\/bootloader-endpoint|ajax\/bulk-route-definitions|ajax\/route-definition|btmanifest|rsrc\.php)(\/|$)/i

export type ExchangeKind = 'api' | 'document'

export interface StepExchange {
  offsetMs: number
  kind: ExchangeKind
  name: string
  method: string
  host: string
  path: string
  status: number
  ms: number
  sent: unknown
  answer: unknown
  errors: string[]
  known: boolean
}

export interface StepAccount {
  name: string
  platform: string
  homeCity: string | null
  homeCountry: string | null
  browser: string | null
  exit: string | null
}

export interface StepTaken {
  step: string
  action: string
  args: string[]
  ok: boolean
  error: string | null
  url: string
  title: string
  ms: number | null
  landedMs: number | null
  mouse: unknown
}

export interface EarlierStep {
  step: string
  action: string
  args: string[]
  ok: boolean
  url: string
  ms: number | null
  requests: string[]
  meaning: string | null
  forGoal: boolean
  saved: string[]
}

export interface GoalSoFar {
  since: string | null
  steps: number
  saved: Record<string, number>
}

export interface StepBundle {
  goal: string | null
  account: StepAccount
  taken: StepTaken
  pageState: string | null
  pageText: string
  exchanges: StepExchange[]
  newRequests: string[]
  earlier: EarlierStep[]
  goalSoFar: GoalSoFar
}

export type StepDecision =
  | { decided: true; by: 'pageState'; state: string }
  | { decided: true; by: 'nothingHappened'; state: 'noChange' }
  | { decided: false; why: string[] }

export interface StepAnswer {
  question: string
  asked: string
  answer: DecisionAnswer
}

export interface StepReading {
  step: string
  folder: string
  at: string
  decision: StepDecision
  asked: boolean
  model: string | null
  answers: StepAnswer[]
  meaning: string[]
  timeline: string[]
  inputTokens: number
  error: string | null
}
