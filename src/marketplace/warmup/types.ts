/**
 * The warm-up (rule 35): Listaro's five warm-up activities
 * (`Listaro_backup/src/lib/account-warmup.ts`, stages 1-5), each recorded once
 * with `log inspect` in a headed session (rule 29), turned into a flow (rule 31),
 * and run in order, in ONE browser that stays open, by the warm-up machine.
 * Every step is written to the activity feed as it happens (rule 26).
 */
import type { WarmupActivity } from '../lifecycle/types'

export type { WarmupActivity }

/** One inspect command of a recording script: what is sent to `log inspect do`. */
export interface ScriptStep {
  action: 'goto' | 'dwell' | 'scroll' | 'openAny' | 'clickAny'
  args: string[]
  /** What it does, in Listaro's words where it has some. */
  why: string
  /** clickAny acts on Facebook (a like): only recorded and run with --likes (rule 8). */
  live?: boolean
}

export interface ActivityScript {
  activity: WarmupActivity
  /** The flow it becomes: `warmupFeedBrowse`... (`src/camofox/flow/definitions/<flow>.json`). */
  flow: string
  /** Where in Listaro it comes from. */
  source: string
  steps: ScriptStep[]
}

/** One line of the activity feed (`~/.logCli/runs/warmup/feed.jsonl`). */
export interface FeedLine {
  at: string
  account: string
  run: string
  /** start, activity, step, gap, done, stopped */
  event: 'start' | 'activity' | 'step' | 'gap' | 'done' | 'stopped'
  activity?: WarmupActivity
  step?: string
  ok?: boolean
  detail?: string
}

export type ActivityOutcome = { ok: true; steps: number } | { ok: false; failedAt: string | null; error?: string }

export interface WarmupInput {
  accountId: string
  /** The activities to run, in order (default all five). */
  activities: WarmupActivity[]
  /** Between activities: the day's spacing (default 2.5 h), or short for a watched run. */
  gapMs: number
}

export interface WarmupContext extends WarmupInput {
  done: WarmupActivity[]
  current: WarmupActivity | null
  failure: { activity: WarmupActivity; failedAt: string | null; error?: string } | null
}
