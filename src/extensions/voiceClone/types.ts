export const VOICE_PROVIDERS = ['inworld', 'fishAudio'] as const
export type VoiceProvider = (typeof VOICE_PROVIDERS)[number]
export const DEFAULT_PROVIDER: VoiceProvider = 'inworld'
export const PROVIDER_ENV = 'LOG_VOICE_PROVIDER'

export const ACCENT_ENV = 'LOG_VOICE_ACCENT'
export const DEFAULT_ACCENT = 'Northern Irish'
export const LANGUAGE_ENV = 'LOG_VOICE_LANGUAGE'
export const DEFAULT_LANGUAGE = 'en-IE'
export const FALLBACK_LANGUAGE = 'en-GB'

export interface VoiceSettings {
  accent: string
  language: string
  fallback: string
}

export const SPEAK_FORMATS = ['mp3', 'wav'] as const
export type SpeakFormat = (typeof SPEAK_FORMATS)[number]

export const CLONE_TITLE = 'matt'
export const SHORTEST_CLIP = 5
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

export type VoiceNoteCode = 'voiceCloneMissing' | 'voiceNoteInvalid' | 'voiceKeyMissing' | 'voiceProviderRefused' | 'voiceNoteConvertFailed'

export interface Recording {
  path: string
  platform: string
  account: string
  conversationId: string
  messageId: string
  seconds: number
}

export interface CloneLimits {
  least: number
  most: number
}

export interface VoiceAnswer<T> {
  ok: boolean
  status: number
  code: string | null
  error: string | null
  data: T | null
}

export interface ReferenceAudio {
  name: string
  bytes: Uint8Array
  type: string
  transcription?: string
}

export interface SpeakRequest {
  text: string
  voiceId: string
  model: string
  format: SpeakFormat
  language?: string
  accent?: string
}

export interface VoiceResponse {
  status: number
  json: () => Promise<unknown>
  arrayBuffer: () => Promise<ArrayBuffer>
}

export type VoiceFetch = (url: string, init: { method: 'GET' | 'POST'; headers: Record<string, string>; body?: FormData | string }) => Promise<VoiceResponse>

export interface VoiceProviderClient {
  provider: VoiceProvider
  keyName: string
  models: readonly string[]
  cheapest: string
  limits: CloneLimits
  referenceFormat: 'asIs' | 'wav'
  clone: (title: string, references: readonly ReferenceAudio[], settings?: VoiceSettings) => Promise<VoiceAnswer<{ voiceId: string; state: string | null; language?: string }>>
  speak: (request: SpeakRequest) => Promise<VoiceAnswer<Uint8Array>>
}

export interface ProviderClone {
  provider: VoiceProvider
  voiceId: string
  title: string
  model: string
  createdAt: string
  state: string | null
  references: Recording[]
  language?: string
  accent?: string
  previous?: ProviderClone[]
}

export interface CloneStore {
  clones: Partial<Record<VoiceProvider, ProviderClone>>
}

export interface VoiceNote {
  path: string
  platform: VoiceNotePlatform
  seconds: number
  waveform: string
  levels: number[]
  provider: VoiceProvider
  model: string
}
