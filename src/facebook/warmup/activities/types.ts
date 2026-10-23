export const WARMUP_PLATFORMS = ['facebook'] as const
export type WarmupPlatform = (typeof WARMUP_PLATFORMS)[number]

export type ActivityAction = 'goto' | 'dwell' | 'wait' | 'snapshot' | 'clickRole' | 'clickAny' | 'scrollIn' | 'scroll' | 'back' | 'openAny' | 'nextPost' | 'likePost' | 'postButton'

import type { AnswerExpect } from '../../../browser/flow/types'

export type { AnswerCheck, AnswerExpect } from '../../../browser/flow/types'

export interface StepExpect {
  urlMatches?: string
  urlChanges?: boolean
  shows?: { role: string; name: string }
  hides?: { role: string; name: string }
  answers?: AnswerExpect[]
}

export interface ActivityStep {
  id: string
  action: ActivityAction
  args: string[]
  why: string
  expect?: StepExpect
  clicks?: boolean
  likes?: boolean
  optional?: boolean
  recorded?: string
}

export interface PlatformActivity {
  platform: WarmupPlatform
  activity: string
  summary: string
  steps: ActivityStep[]
  knownIssues: string[]
}

export interface StepOutcome {
  id: string
  ok: boolean
  issue?: string
  error?: string
  url?: string
  folder?: string
  skipped?: string
}
