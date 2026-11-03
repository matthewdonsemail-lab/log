import { spawnSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCRAMBLER_DIR, SCRAMBLER_INSPECT } from './types'
import type { ScramblerHit, ScramblerReading } from './types'

export function scramblerScript(): string {
  const repo = resolve(fileURLToPath(new URL('../../../..', import.meta.url)))
  return join(repo, SCRAMBLER_DIR, SCRAMBLER_INSPECT)
}

export type ScramblerRunner = (text: string) => { status: number | null; stdout: string; stderr: string }

export const runScrambler: ScramblerRunner = (text) => {
  const done = spawnSync(process.env.LOG_PYTHON || 'python', ['-I', '-X', 'utf8', scramblerScript(), '-', '--json', '--aggressive'], { input: text, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
  return { status: done.status, stdout: done.stdout ?? '', stderr: done.stderr ?? '' }
}

export function scramblerReadingOf(text: string, run: ScramblerRunner = runScrambler): ScramblerReading {
  const done = run(text)
  try {
    const report = JSON.parse(done.stdout) as { suspicious_total?: number; hits?: ScramblerHit[] }
    return { ran: true, suspicious: report.suspicious_total ?? 0, hits: report.hits ?? [], statistical: 'unknown' }
  } catch {
    return { ran: false, suspicious: 0, hits: [], statistical: 'unknown', error: (done.stderr || done.stdout).trim().slice(0, 300) }
  }
}

export function scramblerLine(reading: ScramblerReading): string {
  if (!reading.ran) return `watermark scrambler: couldn't run (${reading.error ?? 'no answer'})`
  if (!reading.suspicious) return 'watermark scrambler: no invisible or lookalike characters (layer A); the statistical mark is not checked here'
  return `watermark scrambler: ${reading.suspicious} invisible or lookalike character(s) (${[...new Set(reading.hits.map((h) => h.kind))].join(', ')})`
}
