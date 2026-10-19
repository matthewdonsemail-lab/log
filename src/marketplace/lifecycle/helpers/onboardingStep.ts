import type { LifecycleContext, WarmupActivity } from '../types'
import { WARMUP_ACTIVITIES } from '../types'

export type OnboardingStep = 'signingIn' | 'checkingAccount' | 'settingProfile' | 'settingName' | 'settingLocation' | 'warming' | 'attached'

type Progress = Pick<LifecycleContext, 'standing' | 'checked' | 'warmup' | 'timing'>

/** The next Listaro warm-up activity not done yet, in its stage order, or null. Pure. */
export function nextWarmupActivity(context: Pick<LifecycleContext, 'warmup'>): WarmupActivity | null {
  return WARMUP_ACTIVITIES.find((a) => !context.warmup.done.includes(a)) ?? null
}

/**
 * The warm-up is over: the account was attached before, or every activity ran
 * and a whole warm-up day (matt: a day) has passed since it began. Pure.
 */
export function warmupComplete(context: Progress, now: number): boolean {
  if (context.standing.warmedAt) return true
  const start = context.warmup.startedAt
  return start !== null && nextWarmupActivity(context) === null && now >= start + context.timing.warmupMs
}

/**
 * The first onboarding step this account hasn't done, in the lane's order:
 * sign in, check the account, profile, name, Marketplace location, a day's
 * warm-up, then attached to its host. Pure.
 */
export function nextOnboardingStep(context: Progress & { now: () => number }): OnboardingStep {
  const s = context.standing
  if (!s.hasSession || s.status === 'needsLogin') return 'signingIn'
  if (!context.checked) return 'checkingAccount'
  if (!s.profileSet) return 'settingProfile'
  if (s.wantsName && !s.named) return 'settingName'
  if (!s.locationSet) return 'settingLocation'
  if (!warmupComplete(context, context.now())) return 'warming'
  return 'attached'
}
