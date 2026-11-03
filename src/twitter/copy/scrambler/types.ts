export interface ScramblerHit {
  kind: string
  char?: string
  codepoint?: string
  count?: number
}

export interface ScramblerReading {
  ran: boolean
  suspicious: number
  hits: ScramblerHit[]
  statistical: 'unknown'
  error?: string
}

export const SCRAMBLER_DIR = 'vendor/aiWatermarkScrambler'
export const SCRAMBLER_INSPECT = 'scripts/inspect_text.py'
