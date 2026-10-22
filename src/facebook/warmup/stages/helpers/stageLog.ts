import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { StageLogLine } from '../types'

export function stageLogPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_WARMUP_STAGE_LOG || join(homedir(), '.logCli', 'runs', 'warmup', 'stageLog.jsonl')
}

export function appendStageLog(line: StageLogLine, path = stageLogPath()): void {
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify(line)}\n`)
}

export function readStageLog(options: { account?: string; count?: number } = {}, path = stageLogPath()): StageLogLine[] {
  if (!existsSync(path)) return []
  const lines: StageLogLine[] = []
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!raw.trim()) continue
    try {
      const line = JSON.parse(raw) as StageLogLine
      if (!options.account || line.account === options.account) lines.push(line)
    } catch {
    }
  }
  return lines.slice(-(options.count ?? 40))
}

export function renderStageLogLine(line: StageLogLine): string {
  const time = line.at.replace('T', ' ').slice(11, 19)
  const mark = line.ok === false ? '✗' : line.ok ? '✓' : '·'
  const what = [line.activity, line.step].filter(Boolean).join(' ')
  return `${time}  ${line.account.padEnd(15)} ${mark} ${line.event.padEnd(8)} ${what}${line.detail ? `  ${line.detail}` : ''}`
}
