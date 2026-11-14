import type { TwitterEngineRun, TwitterEngineSpec, TwitterSessionAnswer } from '../../account/session/index'
import type { EngagerKind, NotificationStore, PostEngagerSummary, UnrollCandidate } from '../feed/index'

export const UNROLL_CALL_PAGES = 5
export const UNROLL_RUN_PAGES = 40

export const UNROLL_OUTCOMES = ['done', 'stopped', 'crashed'] as const

export type UnrollOutcome = (typeof UNROLL_OUTCOMES)[number]

export type UnrollStage = 'feed' | 'likers' | 'reposters'

export interface UnrollInput {
  account: string
  storePath: string
  full: boolean
  pages?: number
  postId?: string
  everyPost: boolean
  since?: string
  unrollPages: number
}

export interface UnrollDeps {
  engine: (spec: TwitterEngineSpec) => Promise<TwitterEngineRun>
  readStore: (path: string) => NotificationStore | null
  log: (line: string) => void
}

export interface UnrollKindRead {
  wanted: boolean
  done: boolean
  pages: number
  newRows: number
}

export interface UnrollPost {
  postId: string
  like: UnrollKindRead
  repost: UnrollKindRead
}

export interface UnrollStop {
  stage: UnrollStage | 'pageCap'
  code: string | null
  detail: string
  postId: string | null
}

export interface UnrollContext {
  input: UnrollInput
  storePath: string
  feed: TwitterSessionAnswer | null
  lastRun: TwitterEngineRun | null
  refusal: TwitterSessionAnswer | null
  posts: UnrollPost[]
  index: number
  pagesLeft: number
  pagesRead: number
  stop: UnrollStop | null
  outcome: UnrollOutcome | null
  error: unknown
}

export interface UnrollRun {
  outcome: UnrollOutcome
  storePath: string
  feed: TwitterSessionAnswer | null
  lastRun: TwitterEngineRun | null
  refusal: TwitterSessionAnswer | null
  stop: UnrollStop | null
  posts: UnrollPost[]
  pagesRead: number
  error: unknown
}

export interface UnrollReport {
  state: UnrollOutcome
  stoppedBeforeTheEnd: boolean
  stop: UnrollStop | null
  pagesRead: number
  posts: PostEngagerSummary[]
}

export type { EngagerKind, UnrollCandidate }
