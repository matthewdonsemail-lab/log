import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

/**
 * Rule 24: how often one account's browser may open on Facebook. On
 * 2026-10-19 the account opened 14 times in 90 minutes (dry runs included)
 * went automated behaviour → text captcha → video selfie; the one opened 3
 * times stayed clean (RESEARCH/LOG_CLI_RUN_CAPTURES_2026_10_19.md).
 */
export interface LaunchLimits {
  /** Minutes between two launches of one account. */
  minGapMinutes: number
  /** Launches per account per local day, dry runs counted. */
  perDay: number
}

export const LAUNCH_LIMITS: LaunchLimits = { minGapMinutes: 10, perDay: 8 }

const SELF_CHECK = 'Self-check passed'

/** `~/.logCli/launchResets.jsonl` (or `LOG_LAUNCH_RESETS`): one line per reset matt asked for. */
export const launchResetsPath = (env: Record<string, string | undefined> = process.env) => env.LOG_LAUNCH_RESETS || join(homedir(), '.logCli', 'launchResets.jsonl')

/**
 * When this account's opens were last reset (`log account resetOpens`, matt
 * 2026-10-19): launches before it no longer count against rule 24. Nothing
 * is deleted; the recordings stay. Null when never reset.
 */
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
      // a half-written line
    }
  }
  return last
}

export function recordLaunchReset(accountName: string, reason: string, at: Date = new Date(), path: string = launchResetsPath()): void {
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify({ account: accountName, at: at.toISOString(), reason })}\n`)
}

/**
 * When this account's browser reached Facebook, from every run folder's
 * `steps.jsonl` ("Self-check passed": the launch passed the gate and opened).
 * Runs refused before a launch (no proxy, too slow) don't count.
 */
export function listLaunches(accountName: string, roots: { runs?: string; publish?: string; resets?: string } = {}): Date[] {
  const key = accountName.replace(/\W/g, '')
  const runsRoot = roots.runs ?? (process.env.LOG_RUNS_DIR || join(homedir(), '.logCli', 'runs'))
  const publishRoot = roots.publish ?? (process.env.LOG_PUBLISH_DIR || join(homedir(), '.logCli', 'publish'))
  const files: string[] = []
  // runs/<action>/<time>_<account>/firefox[/check<N>]/steps.jsonl
  for (const action of dirNames(runsRoot)) {
    for (const run of dirNames(join(runsRoot, action)).filter((name) => name.endsWith(`_${key}`))) {
      const firefox = join(runsRoot, action, run, 'firefox')
      files.push(join(firefox, 'steps.jsonl'), ...dirNames(firefox).map((check) => join(firefox, check, 'steps.jsonl')))
    }
  }
  // publish/<iso><account>/firefox/steps.jsonl
  for (const run of dirNames(publishRoot).filter((name) => name.endsWith(key))) files.push(join(publishRoot, run, 'firefox', 'steps.jsonl'))
  const launches: Date[] = []
  for (const file of files) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!line.includes(SELF_CHECK)) continue
      try {
        const at = new Date((JSON.parse(line) as { at: string }).at)
        if (!Number.isNaN(at.getTime())) launches.push(at)
      } catch {
        // a half-written line from a killed run
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

/**
 * Why another launch now would break rule 24, or null. Too soon after the
 * last one (`launchTooSoon`), or the account's local day already has its
 * launches (`launchBudgetSpent`). Pure.
 */
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
