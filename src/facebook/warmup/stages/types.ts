import type { WarmupActivity } from '../../../marketplace/lifecycle/types'

export type { WarmupActivity }

export interface ScriptStep {
  action: 'goto' | 'dwell' | 'scroll' | 'openAny' | 'clickAny'
  args: string[]
  why: string
  live?: boolean
}

export interface ActivityScript {
  activity: WarmupActivity
  flow: string
  source: string
  steps: ScriptStep[]
}

export interface StageLogLine {
  at: string
  account: string
  run: string
  event: 'start' | 'activity' | 'step' | 'gap' | 'done' | 'stopped'
  activity?: WarmupActivity
  step?: string
  ok?: boolean
  detail?: string
}

export type ActivityOutcome = { ok: true; steps: number } | { ok: false; failedAt: string | null; error?: string; issue?: string }

export interface WarmupInput {
  accountId: string
  activities: WarmupActivity[]
  gapMs: number
}

export interface WarmupContext extends WarmupInput {
  done: WarmupActivity[]
  current: WarmupActivity | null
  failure: { activity: WarmupActivity; failedAt: string | null; error?: string; issue?: string } | null
}
