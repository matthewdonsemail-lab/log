export interface Describer {
  model: string
  describe(path: string, prompt?: string): Promise<string>
}

export type MediaKind = 'image' | 'meme' | 'video' | 'audio' | 'gif' | 'file'

export type MediaStatus = 'pending' | 'describing' | 'described' | 'notDescribed' | 'failed'

export interface MediaRow {
  id: number
  eventId: string
  platform: string
  account: string
  conversationId: string
  kind: MediaKind
  name: string
  path: string | null
  status: MediaStatus
  description: string | null
  model: string | null
  detail: string | null
  createdAt: string
  describedAt: string | null
}

export const VISION_MODEL = 'onnx-community/LFM2.5-VL-450M-ONNX'
export const VISION_DTYPE = { embed_tokens: 'q4', vision_encoder: 'q4', decoder_model_merged: 'q4' } as const
export const MAX_NEW_TOKENS = 180
export const REPETITION_PENALTY = 1.15
export const DESCRIBE_PROMPT = 'Describe what is in this image. Read out any text in it word for word. Then say what it means, or what the joke is if it is a meme.'
export const VIDEO_FRAMES = [0.1, 0.5, 0.9] as const
export const QUEUE_LIMIT = 20
export const MEMORY_CEILING_MB = 4096
export const DESCRIBER_HEARTBEAT_MS = 5_000
