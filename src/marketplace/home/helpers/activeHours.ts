import { DEFAULT_ACTIVE_HOURS } from '../types'
import type { ActiveWindow, LocalClock } from '../types'

/** The wall clock at `now` in `timezone` (DST-correct, through Intl). Pure. */
export function localClock(now: Date, timezone: string): LocalClock {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  )
  const hours = Number(parts.hour) % 24
  const minutes = Number(parts.minute)
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: hours + minutes / 60,
    label: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
}

const validHour = (value: unknown, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max

/**
 * The account's window: its own activeHoursStart/End when both are set and
 * sane (start 0-23.99, end 0-24, not equal), else 08:00-22:00. Pure.
 */
export function activeWindow(account: { activeHoursStart: number | null; activeHoursEnd: number | null }): ActiveWindow {
  const { activeHoursStart: start, activeHoursEnd: end } = account
  if (validHour(start, 23.99) && validHour(end, 24) && start !== end) return { start, end }
  return { ...DEFAULT_ACTIVE_HOURS }
}

/** Is `hour` (local, 0-24) inside the window? Pure. */
export function insideWindow(hour: number, window: ActiveWindow): boolean {
  return window.start < window.end ? hour >= window.start && hour < window.end : hour >= window.start || hour < window.end
}

/** `8.5` → `08:30`. Pure. */
export function hourLabel(hour: number): string {
  const total = Math.round(hour * 60) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Hours from local `hour` until the window next opens. Pure. */
export function hoursUntilOpen(hour: number, window: ActiveWindow): number {
  return (((window.start - hour) % 24) + 24) % 24
}

/**
 * null when the account may run at `now`, else why not: the local time, the
 * window, and when it opens (AGENTS.md rule 18). Pure.
 */
export function outsideActiveHours(
  account: { accountName: string; homeCity: string | null; activeHoursStart: number | null; activeHoursEnd: number | null },
  timezone: string,
  now: Date
): string | null {
  const window = activeWindow(account)
  const clock = localClock(now, timezone)
  if (insideWindow(clock.hour, window)) return null
  const wait = hoursUntilOpen(clock.hour, window)
  const waitLabel = `${Math.floor(wait)}h${String(Math.round((wait % 1) * 60)).padStart(2, '0')}`
  const opensAt = new Date(now.getTime() + Math.round(wait * 60) * 60_000)
  const where = account.homeCity ? `${account.homeCity} (${timezone})` : timezone
  return (
    `it is ${clock.label} in ${where}; ${account.accountName} runs ${hourLabel(window.start)}-${hourLabel(window.end)} local. ` +
    `The window opens at ${hourLabel(window.start)} local, in ${waitLabel} (${opensAt.toISOString().slice(0, 16)}Z)`
  )
}
