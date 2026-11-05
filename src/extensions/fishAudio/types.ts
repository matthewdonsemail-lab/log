export const FISH_API = 'https://api.fish.audio'

export const FISH_ENDPOINTS = {
  createModel: '/model',
  getModel: '/model/',
  speak: '/v1/tts',
} as const

export const FISH_KEY_NAME = 'FISH_API_KEY'

export const FISH_MODELS = ['s2.1-pro-free', 's2.1-pro'] as const
export type FishModel = (typeof FISH_MODELS)[number]
export const CHEAPEST_MODEL: FishModel = 's2.1-pro-free'

export const SPEAK_FORMATS = ['mp3', 'wav'] as const
export type SpeakFormat = (typeof SPEAK_FORMATS)[number]

export const CLONE_SECONDS = { least: 10, most: 60, shortest: 5 } as const
export const CLONE_TITLE = 'matt'
export const MAX_SPEAK_CHARACTERS = 600

export const VOICE_NOTE_PLATFORMS = ['discord', 'instagram', 'slack'] as const
export type VoiceNotePlatform = (typeof VOICE_NOTE_PLATFORMS)[number]

export const PLATFORM_AUDIO: Readonly<Record<VoiceNotePlatform, { suffix: string; container: string; args: readonly string[] }>> = {
  discord: { suffix: '.ogg', container: 'ogg/opus', args: ['-c:a', 'libopus', '-b:a', '32k', '-ar', '48000', '-ac', '1', '-application', 'voip'] },
  instagram: { suffix: '.m4a', container: 'AAC in .m4a', args: ['-c:a', 'aac', '-b:a', '64k', '-ar', '44100', '-ac', '1', '-movflags', '+faststart'] },
  slack: { suffix: '.m4a', container: 'AAC in .m4a', args: ['-c:a', 'aac', '-b:a', '64k', '-ar', '44100', '-ac', '1', '-movflags', '+faststart'] },
}

export const AUDIO_SUFFIX = /\.(ogg|oga|opus|m4a|mp3|wav|aac|flac|webm|mp4)$/i

export const INSTAGRAM_LEVELS = 70

export type VoiceNoteCode = 'voiceCloneMissing' | 'voiceNoteInvalid' | 'fishKeyMissing' | 'fishRefused' | 'voiceNoteConvertFailed'

export interface Recording {
  path: string
  platform: string
  account: string
  conversationId: string
  messageId: string
  seconds: number
}

export interface VoiceClone {
  modelId: string
  title: string
  model: FishModel
  createdAt: string
  state: string | null
  references: Recording[]
}

export interface FishAnswer<T> {
  ok: boolean
  status: number
  code: string | null
  error: string | null
  data: T | null
}

export interface FishModelInfo {
  id: string
  title: string
  state: string | null
  visibility: string | null
}

export interface FishVoice {
  name: string
  bytes: Uint8Array
  type: string
}

export interface SpeakRequest {
  text: string
  referenceId: string
  model: FishModel
  format: SpeakFormat
}

export interface FishResponse {
  status: number
  json: () => Promise<unknown>
  arrayBuffer: () => Promise<ArrayBuffer>
}

export type FishFetch = (url: string, init: { method: 'GET' | 'POST'; headers: Record<string, string>; body?: FormData | string }) => Promise<FishResponse>

export interface VoiceNote {
  path: string
  platform: VoiceNotePlatform
  seconds: number
  waveform: string
  levels: number[]
  model: FishModel
}
