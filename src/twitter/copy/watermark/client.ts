import { detect } from '../../../../vendor/claudeArtifactDetector/src/artifacts'
import { STATISTICAL_NOTE } from './types'
import type { WatermarkReading } from './types'

export function watermarkReadingOf(text: string): WatermarkReading {
  const findings = detect(text).map((f) => ({ kind: f.kind, label: f.label, count: f.count, deterministic: f.deterministic }))
  const level = findings.some((f) => f.deterministic) ? 'artifacts' : findings.length ? 'stylistic' : 'clean'
  return { level, findings, statistical: 'unknown', note: STATISTICAL_NOTE }
}

export function watermarkLine(reading: WatermarkReading): string {
  const found = reading.findings.map((f) => `${f.label} ×${f.count}`).join(', ')
  const head = reading.level === 'clean' ? 'clean: no hidden characters, pasted Claude markup or AI punctuation' : reading.level === 'artifacts' ? `ARTIFACTS: ${found}` : `stylistic only: ${found}`
  return `watermark ${head}; Claude's statistical watermark: unknown (no public detector)`
}
