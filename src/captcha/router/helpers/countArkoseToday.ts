import type { CaptchaAttempt } from '../types'

export function countArkoseToday(attempts: CaptchaAttempt[], accountId: string, now: Date = new Date()): number {
  const day = now.toISOString().slice(0, 10)
  return attempts.filter(
    (a) => a.accountId === accountId && a.kind === 'arkose' && a.solver === 'twoCaptcha' && a.at.slice(0, 10) === day
  ).length
}
