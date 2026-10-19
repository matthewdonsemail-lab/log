/**
 * The host (rule 35): the runner above the lifecycle machine. One long-running
 * process per account holds ONE browser open for the account's day and drives
 * every lifecycle step inside it, saving its progress on every change so a
 * restart carries on from the exact next step (in a fresh browser).
 */
import type { LifecycleContext, LifecycleEvent, WarmupActivity } from '../lifecycle/types'

/** `~/.logCli/runs/host/<account>/progress.json`: what the host had done, and XState's own snapshot for the record. */
export interface HostProgress {
  account: string
  accountId: string
  /** The lifecycle state as a path (`onboarding.warming.gap`). */
  state: string
  savedAt: string
  /** The local day the opens were counted on (`YYYY-MM-DD` in the account's timezone): a new day starts at 0. */
  day: string
  resume: { warmupDone: WarmupActivity[]; warmupStartedAt: number | null; opensToday: number }
  issue: LifecycleContext['issue']
  lastError: LifecycleContext['lastError']
  closes: LifecycleContext['browser']['closes']
  /** `actor.getPersistedSnapshot()`, kept for reading; a restart resumes from `resume`, never mid-step. */
  snapshot: unknown
}

/** What `log host send` writes to the control file: one event per line, for the running machine. */
export type HostControl = Extract<LifecycleEvent, { type: 'PERSON_DONE' | 'PAUSE' | 'RESUME' | 'SHUTDOWN' | 'LOST' }> | Extract<LifecycleEvent, { type: 'ACT' }>

/** A Twenty field the host writes as the account passes a milestone. */
export type MilestoneField = 'profileSetAt' | 'profileNamedAt' | 'marketplaceLocationAt' | 'warmupStartedAt' | 'warmedAt' | 'lifecycleState'
