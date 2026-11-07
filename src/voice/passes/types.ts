export const PASS_REUSE_MS = 600_000

export const PASSES_KEPT = 200

export interface VoicePass {
  key: string
  to: string
  at: string
  voice: number
}
