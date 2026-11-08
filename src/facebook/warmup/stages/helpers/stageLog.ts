import { homedir } from 'node:os'
import { join } from 'node:path'
import { appendRecord, importRecordFile, readRecords } from '../../../../storage/records/index'
import type { StageLogLine } from '../types'

export function stageLogPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_WARMUP_STAGE_LOG || join(homedir(), '.logCli', 'runs', 'warmup', 'stageLog.jsonl')
}

const accountOf = (body: Record<string, unknown>) => (typeof body.account === 'string' ? body.account : null)

export function appendStageLog(line: StageLogLine, path = stageLogPath()): void {
  importRecordFile('stageLog', path, accountOf)
  appendRecord('stageLog', line as unknown as Record<string, unknown>, line.account)
}

export function readStageLog(options: { account?: string; count?: number } = {}, path = stageLogPath()): StageLogLine[] {
  importRecordFile('stageLog', path, accountOf)
  return readRecords<StageLogLine>('stageLog', { ...(options.account ? { key: options.account } : {}), last: options.count ?? 40 })
}

export function renderStageLogLine(line: StageLogLine): string {
  const time = line.at.replace('T', ' ').slice(11, 19)
  const mark = line.ok === false ? '✗' : line.ok ? '✓' : '·'
  const what = [line.activity, line.step].filter(Boolean).join(' ')
  return `${time}  ${line.account.padEnd(15)} ${mark} ${line.event.padEnd(8)} ${what}${line.detail ? `  ${line.detail}` : ''}`
}
