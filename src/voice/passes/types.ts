export const PASS_REUSE_MS = 10 * 60 * 1000

export const PASSES_KEPT = 200

export interface VoicePass {
  key: string
  to: string
  at: string
  voice: number
}
