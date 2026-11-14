import type { PlanEvent, Rng } from '../../plan/index'
import { spaceOut } from '../../plan/index'
import type { RunDeps } from '../types'
import { POLL_SECONDS } from '../types'

export const uniform = (rng: Rng, low: number, high: number) => low + rng() * (high - low)

export const iso = (seconds: number) => new Date(Math.round(seconds) * 1000).toISOString()

export const atSeconds = (event: PlanEvent) => new Date(event.at).getTime() / 1000

export const CANCELLED = -1

export const ADDED = -2

export function dropPost(todo: PlanEvent[], n: number, why: string): void {
  for (const e of todo.filter((x) => x.n === n)) {
    e.skipped = why
    todo.splice(todo.indexOf(e), 1)
  }
}

export function mergeAdded(todo: PlanEvent[], added: readonly PlanEvent[], minGap = 0): void {
  todo.push(...added)
  if (minGap > 0 && added.length) spaceOut(todo, minGap, new Set(added))
  todo.sort((a, b) => atSeconds(a) - atSeconds(b))
}

export async function waitUntil(deps: RunDeps, dueSeconds: number, todo?: PlanEvent[], minGap = 0): Promise<number> {
  let left = dueSeconds - deps.nowMs() / 1000
  while (left > 0) {
    await deps.sleep(Math.min(POLL_SECONDS, left) * 1000)
    if (deps.cancelled?.()) return CANCELLED
    const added = todo && deps.takeAdded ? deps.takeAdded() : []
    if (added.length) {
      mergeAdded(todo!, added, minGap)
      deps.log(`added ${added.length} to the queue while it runs, each fitted in its window and what was planned after it moved back to keep the gap: ${added.map((e) => `#${e.n} at ${e.at}`).join(', ')}`)
      if (added.some((e) => atSeconds(e) < dueSeconds + minGap)) return ADDED
    }
    const nudged = deps.takeNudge()
    if (nudged) return nudged
    left = dueSeconds - deps.nowMs() / 1000
  }
  return 0
}

export async function awaitAdded(deps: RunDeps, todo: PlanEvent[]): Promise<boolean> {
  while (!todo.length) {
    await deps.sleep(POLL_SECONDS * 1000)
    if (deps.cancelled?.()) return false
    mergeAdded(todo, deps.takeAdded!())
  }
  return true
}
