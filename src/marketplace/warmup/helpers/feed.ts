import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { FeedLine } from '../types'

/** `~/.logCli/runs/warmup/feed.jsonl`, or `LOG_WARMUP_FEED`: every account's warm-up, one line per step. */
export function feedPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_WARMUP_FEED || join(homedir(), '.logCli', 'runs', 'warmup', 'feed.jsonl')
}

export function appendFeed(line: FeedLine, path = feedPath()): void {
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify(line)}\n`)
}

/** The last `count` lines, for one account or all. */
export function readFeed(options: { account?: string; count?: number } = {}, path = feedPath()): FeedLine[] {
  if (!existsSync(path)) return []
  const lines: FeedLine[] = []
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!raw.trim()) continue
    try {
      const line = JSON.parse(raw) as FeedLine
      if (!options.account || line.account === options.account) lines.push(line)
    } catch {
      // a line still being written
    }
  }
  return lines.slice(-(options.count ?? 40))
}

/** One feed line as a person reads it. Pure. */
export function renderFeedLine(line: FeedLine): string {
  const time = line.at.replace('T', ' ').slice(11, 19)
  const mark = line.ok === false ? '✗' : line.ok ? '✓' : '·'
  const what = [line.activity, line.step].filter(Boolean).join(' ')
  return `${time}  ${line.account.padEnd(15)} ${mark} ${line.event.padEnd(8)} ${what}${line.detail ? `  ${line.detail}` : ''}`
}
