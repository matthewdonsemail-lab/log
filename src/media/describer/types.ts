export interface Describer {
  model: string
  describe(input: string | Uint8Array, prompt?: string): Promise<string>
}

export interface SpeechWord {
  text: string
  start: number
  end: number
}

export interface Speech {
  text: string
  words: SpeechWord[]
  model: string
}

export interface Transcriber {
  model: string
  transcribe(bytes: Uint8Array, name: string): Promise<Speech>
}

export interface Probe {
  durationMs: number | null
  width: number | null
  height: number | null
  hasAudio: boolean
  hasVideo: boolean
}

export interface Scene {
  start: number
  end: number
  screen: string
  speech: string
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
  sha256?: string | null
  sizeBytes?: number | null
  durationMs?: number | null
  width?: number | null
  height?: number | null
  preview?: Uint8Array | null
  previewMime?: string | null
  scenes?: string | null
  transcript?: string | null
  providers?: string | null
  fileRemovedAt?: string | null
}

export const VISION_MODEL = 'onnx-community/LFM2.5-VL-450M-ONNX'
export const VISION_DTYPE = { embed_tokens: 'q4', vision_encoder: 'q4', decoder_model_merged: 'q4' } as const
export const MAX_NEW_TOKENS = 180
export const REPETITION_PENALTY = 1.15
export const DESCRIBE_PROMPT = 'Describe what is in this image. Read out any text in it word for word. Then say what it means, or what the joke is if it is a meme.'
export const SCENE_PROMPT = 'This is one scene of a video. In one or two sentences say what is on screen and what is happening. Read out any words on screen word for word.'
export const SCENE_THRESHOLD = 0.3
export const MAX_SCENES = 8
export const MIN_SCENE_SECONDS = 1.5
export const PREVIEW_WIDTH = 320
export const SHEET_COLUMNS = 3
export const SHEET_ROWS = 2
export const SHEET_TILE_WIDTH = 200
export const FRAME_WIDTH = 768
export const LINE_LIMIT = 1600
export const VISUAL_KINDS: readonly string[] = ['image', 'meme', 'gif', 'video']
export const QUEUE_FULL_DETAIL = 'the describer queue was full'
export const QUEUE_LIMIT = 20
export const MEMORY_CEILING_MB = 4096
export const DESCRIBER_HEARTBEAT_MS = 5_000
