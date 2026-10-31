import type { LifecycleContext, LifecycleEvent, WarmupActivity } from '../lifecycle/types'

export interface HostProgress {
  account: string
  accountId: string
  state: string
  savedAt: string
  day: string
  resume: { warmupDone: WarmupActivity[]; warmupStartedAt: number | null; opensToday: number }
  issue: LifecycleContext['issue']
  lastError: LifecycleContext['lastError']
  closes: LifecycleContext['browser']['closes']
  snapshot: unknown
}

export type HostControl = Extract<LifecycleEvent, { type: 'PERSON_DONE' | 'PAUSE' | 'RESUME' | 'SHUTDOWN' | 'LOST' }> | Extract<LifecycleEvent, { type: 'ACT' }>

export type MilestoneField = 'profileSetAt' | 'profileNamedAt' | 'marketplaceLocationAt' | 'warmupStartedAt' | 'warmedAt' | 'lifecycleState'
