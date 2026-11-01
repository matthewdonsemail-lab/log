export type WatermarkLevel = 'clean' | 'stylistic' | 'artifacts'

export interface WatermarkFinding {
  kind: string
  label: string
  count: number
  deterministic: boolean
}

export interface WatermarkReading {
  level: WatermarkLevel
  findings: WatermarkFinding[]
  statistical: 'unknown'
  note: string
}

export const STATISTICAL_NOTE = "Claude's own watermark is statistical (word choice under a secret key); Anthropic's text detector is private preview, so it can't be checked here. This reads only what is visible in the text: hidden characters, pasted Claude HTML, odd spaces, curly quotes and em dashes (RESEARCH/CLAUDE_WATERMARK_REPOS_2026_11_02.md)."
