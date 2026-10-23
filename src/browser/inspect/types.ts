import type { BrowserDriverName } from '../driver/types'

export const INSPECT_ACTIONS = [
  'goto', 'snapshot', 'click', 'type', 'press', 'solve', 'upload', 'signIn', 'code', 'back', 'wait', 'stop',
  'pin',
  'clickRole', 'fillRole', 'uploadRole', 'waitRole',
  'highlight',
  'scroll', 'scrollIn', 'openAny', 'clickAny',
  'closeTab',
  'nextPost', 'likePost', 'postButton',
  'dwell',
  'saveState', 'pageText', 'sellLocation', 'setLocation',
] as const

export type InspectAction = (typeof INSPECT_ACTIONS)[number]

export interface InspectSessionConfig {
  accountId: string
  storageStatePath: string
  proxyPath: string
  devicePath: string | null
  captureDir: string
  commandsPath: string
  repliesPath: string
  loginPath: string | null
  idleMouse?: boolean
  startUrl: string | null
  browser?: { driver: BrowserDriverName; profileId: string | null }
}

export interface CurrentInspect {
  account: string
  runDir: string
  commandsPath: string
  repliesPath: string
  startedAt: string
  messengerPin?: boolean
  goal?: string | null
  goalSince?: string | null
}

export interface InspectCommand {
  id: string
  action: InspectAction
  args: string[]
  expect?: string
  expectMs?: number
}

export interface InspectStepOptions {
  reaLater?: boolean
  quietMs?: number
  settleMaxMs?: number
  urlChange?: boolean
  rest?: boolean
  already?: [string, string]
  findMs?: number
}

export interface FeedPost {
  heading: string
  text: string
  images: string[]
  words: number
  liked: boolean
}

export interface InspectStepResult {
  ok: boolean
  error?: string
  code?: string
  detail?: string
  step?: string
  url?: string
  title?: string
  requests?: number
  notable?: string[]
  rea?: { code: number; evidenceId: string | null; records?: number }
  interactive?: string[]
  interactiveTotal?: number
  interactiveNew?: number
  folder?: string
  landedMs?: number
  ms?: number
  openedTab?: string
  post?: FeedPost | null
  expect?: { name: string; seen: boolean }
  mouse?: { legs: number; idleMoves: number }
  stopped?: boolean
  steps?: number
}

export type InspectSessionRunner = (config: InspectSessionConfig) => Promise<number>

export interface BrowserAt {
  account: string
  step: string
  url: string
  text: string
  failed: string | null
  messengerPin?: boolean
  reading?: { decided: boolean; text: string } | null
  goal?: GoalProgress | null
}

export interface BrowserView {
  account: string
  step: string
  url: string
  failed: string | null
  state: { id: string; what: string; person: boolean } | null
  next: { tool: string; input: Record<string, unknown> } | null
  needsMatt: string | null
}

export interface GoalFinding {
  n: number
  at: string
  step: string
  point: string
  evidence: string[]
  explain: string
  fix: string | null
  fixedAt: string | null
}

export type GoalEvent =
  | { type: 'finding'; at: string; step: string; point: string; evidence: string[]; explain: string }
  | { type: 'fix'; at: string; n: number; fix: string }

export type GoalStatus = 'none' | 'open' | 'reached'

export interface GoalProgress {
  goal: string | null
  status: GoalStatus
  lastStep: string | null
  reachedAt: { step: string; goalMet: number } | null
  needsFinding: { step: string; evidence: string[] } | null
  personNeeded: { step: string; text: string } | null
  unfixed: number[]
  findings: GoalFinding[]
}
