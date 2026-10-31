import type { LifecycleContext, WarmupActivity } from '../types'
import { clock } from './clock'
import { WARMUP_ACTIVITIES } from '../types'

export type OnboardingStep = 'signingIn' | 'checkingAccount' | 'settingProfile' | 'settingName' | 'settingLocation' | 'warming' | 'attached'

type Progress = Pick<LifecycleContext, 'standing' | 'checked' | 'warmup' | 'timing'>

export function nextWarmupActivity(context: Pick<LifecycleContext, 'warmup'>): WarmupActivity | null {
  return WARMUP_ACTIVITIES.find((a) => !context.warmup.done.includes(a)) ?? null
}

export function warmupComplete(context: Progress, now: number): boolean {
  if (context.standing.warmedAt) return true
  const start = context.warmup.startedAt
  return start !== null && nextWarmupActivity(context) === null && now >= start + context.timing.warmupMs
}

export function nextOnboardingStep(context: Progress, now: number = clock.now()): OnboardingStep {
  const s = context.standing
  if (!s.hasSession || s.status === 'needsLogin') return 'signingIn'
  if (!context.checked) return 'checkingAccount'
  if (!s.profileSet) return 'settingProfile'
  if (s.wantsName && !s.named) return 'settingName'
  if (!s.locationSet) return 'settingLocation'
  if (!warmupComplete(context, now)) return 'warming'
  return 'attached'
}
