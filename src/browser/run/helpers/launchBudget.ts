import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { CAPTURE_FOLDERS } from '../../driver/types'

export interface LaunchLimits {
  minGapMinutes: number
  perDay: number
}

export const LAUNCH_LIMITS: LaunchLimits = { minGapMinutes: 10, perDay: 8 }

const SELF_CHECK = 'Self-check passed'

export const launchResetsPath = (env: Record<string, string | undefined> = process.env) => env.LOG_LAUNCH_RESETS || join(homedir(), '.logCli', 'launchResets.jsonl')

export function lastLaunchReset(accountName: string, path: string = launchResetsPath()): Date | null {
  if (!existsSync(path)) return null
  let last: Date | null = null
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue
    try {
      const entry = JSON.parse(line) as { account: string; at: string }
      const at = new Date(entry.at)
      if (entry.account === accountName && !Number.isNaN(at.getTime()) && (!last || at > last)) last = at
    } catch {
    }
  }
  return last
}

export function recordLaunchReset(accountName: string, reason: string, at: Date = new Date(), path: string = launchResetsPath()): void {
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify({ account: accountName, at: at.toISOString(), reason })}\n`)
}

export function listLaunches(accountName: string, roots: { runs?: string; publish?: string; resets?: string } = {}): Date[] {
  const key = accountName.replace(/\W/g, '')
  const runsRoot = roots.runs ?? (process.env.LOG_RUNS_DIR || join(homedir(), '.logCli', 'runs'))
  const publishRoot = roots.publish ?? (process.env.LOG_PUBLISH_DIR || join(homedir(), '.logCli', 'publish'))
  const files: string[] = []
  for (const action of dirNames(runsRoot)) {
    for (const run of dirNames(join(runsRoot, action)).filter((name) => name.endsWith(`_${key}`))) {
      for (const folder of CAPTURE_FOLDERS) {
        const capture = join(runsRoot, action, run, folder)
        files.push(join(capture, 'steps.jsonl'), ...dirNames(capture).map((check) => join(capture, check, 'steps.jsonl')))
      }
    }
  }
  for (const run of dirNames(publishRoot).filter((name) => name.endsWith(key))) files.push(...CAPTURE_FOLDERS.map((folder) => join(publishRoot, run, folder, 'steps.jsonl')))
  const launches: Date[] = []
  for (const file of files) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!line.includes(SELF_CHECK)) continue
      try {
        const at = new Date((JSON.parse(line) as { at: string }).at)
        if (!Number.isNaN(at.getTime())) launches.push(at)
      } catch {
      }
    }
  }
  const reset = lastLaunchReset(accountName, roots.resets ?? launchResetsPath())
  return launches.filter((at) => !reset || at > reset).sort((a, b) => a.getTime() - b.getTime())
}

function dirNames(path: string): string[] {
  try {
    return readdirSync(path, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    return []
  }
}

const dayIn = (at: Date, timezone: string) => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(at)

export function overLaunchBudget(
  launches: Date[],
  now: Date,
  timezone: string,
  limits: LaunchLimits = LAUNCH_LIMITS
): { code: 'launchTooSoon' | 'launchBudgetSpent'; detail: string } | null {
  const today = launches.filter((at) => dayIn(at, timezone) === dayIn(now, timezone))
  if (today.length >= limits.perDay) {
    return { code: 'launchBudgetSpent', detail: `${today.length} launches today (local ${dayIn(now, timezone)}), the most is ${limits.perDay}. It opens again tomorrow, local time.` }
  }
  const last = launches.at(-1)
  if (last) {
    const minutes = (now.getTime() - last.getTime()) / 60_000
    if (minutes >= 0 && minutes < limits.minGapMinutes) {
      const wait = Math.ceil(limits.minGapMinutes - minutes)
      return { code: 'launchTooSoon', detail: `the last launch was ${Math.floor(minutes)} min ago; wait ${wait} min (at least ${limits.minGapMinutes} between launches)` }
    }
  }
  return null
}
