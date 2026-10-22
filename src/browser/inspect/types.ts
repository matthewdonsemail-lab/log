import type { BrowserDriverName } from '../driver/types'

export type InspectAction = 'goto' | 'snapshot' | 'click' | 'type' | 'press' | 'solve' | 'upload' | 'signIn' | 'code' | 'back' | 'wait' | 'stop'
  | 'pin'
  | 'clickRole' | 'fillRole' | 'uploadRole' | 'waitRole'
  | 'highlight'
  | 'scroll' | 'scrollIn' | 'openAny' | 'clickAny'
  | 'closeTab'
  | 'nextPost' | 'likePost' | 'postButton'
  | 'dwell'
  | 'saveState' | 'pageText' | 'sellLocation' | 'setLocation'

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
