export const VOICE_PROVIDERS = ['inworld', 'fishAudio'] as const
export type VoiceProvider = (typeof VOICE_PROVIDERS)[number]
export const DEFAULT_PROVIDER: VoiceProvider = 'inworld'
export const PROVIDER_ENV = 'LOG_VOICE_PROVIDER'

export const ACCENT_ENV = 'LOG_VOICE_ACCENT'
export const DEFAULT_ACCENT = 'Irish'
export const LANGUAGE_ENV = 'LOG_VOICE_LANGUAGE'
export const DEFAULT_LANGUAGE = 'en-IE'
export const FALLBACK_LANGUAGE = 'en-GB'
export const SPEED_ENV = 'LOG_VOICE_SPEED'
export const DEFAULT_SPEED = 1.15
export const SPEED_RANGE = { least: 0.8, most: 1.5 } as const

export interface VoiceSettings {
  accent: string
  language: string
  fallback: string
  speed: number
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

export type VoiceNoteCode = 'voiceCloneMissing' | 'voiceNoteInvalid' | 'voiceKeyMissing' | 'voiceProviderRefused' | 'voiceNoteConvertFailed' | 'pronunciationUnknown' | 'spokenMismatch' | 'spokenCheckFailed' | 'voiceProcessingFailed'

export const REALISM = {
  rate: 48000,
  shape: 'dynaudnorm=f=120:g=9:p=0.9:m=8,highshelf=f=3000:g=5,equalizer=f=4000:t=q:w=1:g=3',
  snrDb: 22,
  movementDb: 1.9,
  movementHz: 0.7,
  swayHz: 0.5,
  cutoffHz: 8000,
  cutoffSwayHz: 1100,
  cutoffLeast: 4500,
  cutoffMost: 12000,
  drive: 0.9,
  peakDb: -6,
  frameSeconds: 0.05,
  fadeSeconds: 0.03,
  quietAboveFloorDb: 3,
  quietFrames: 6,
  silentFloorDb: -60,
  phoneCurve: [[100, -12.1], [112, -14.6], [126, -17.4], [141, -14.8], [159, -15.1], [178, -8.9], [200, -7.5], [224, -4.8], [252, -8.8], [283, -7.0], [317, -6.5], [356, -5.9], [400, -7.6], [449, -5.8], [504, -4.5], [566, -2.8], [635, -2.0], [713, -2.6], [800, -3.6], [898, -3.7], [1008, -0.9], [1131, -0.6], [1270, -3.7], [1425, -4.9], [1600, -6.2], [1796, -7.9], [2016, -9.2], [2263, -8.1], [2540, -5.3], [2851, -2.0], [3200, -2.6], [3592, -0.1], [4032, -1.3], [4525, -2.6], [5080, -5.0], [5702, -8.3], [6400, -12.9], [7184, -11.6], [8063, -10.3], [9051, -5.5], [10159, -7.4]],
} as const

export interface SpokenEntry {
  say: 'word' | 'letters'
  write: string
  heard: readonly string[]
}

export const SPOKEN_LEXICON: Readonly<Record<string, SpokenEntry>> = {
  op: { say: 'word', write: 'OP', heard: ['op'] },
}

export const WORD_MOST_MS = 400
export const SPOKEN_MOST_ERROR = 0.25
export const BREATH_WORDS = { least: 8, most: 18 } as const
export const PACE_JITTER = 0.07

export interface SpokenWord {
  text: string
  start: number
  end: number
  confidence: number
}

export interface SpokenReading {
  ok: boolean
  errorRate: number
  problems: string[]
  heard: string
}

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
  speed?: number
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
  preferred?: string
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
  heard?: string
}
