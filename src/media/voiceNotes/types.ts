export const ASSEMBLY_AI_API = 'https://api.assemblyai.com/v2'
export const ASSEMBLY_AI_KEY_NAME = 'ASSEMBLYAI_API_KEY'
export const ASSEMBLY_AI_KEY_NAMES = ['ASSEMBLYAI_API_KEY', 'ASSEMBLY_AI_KEY'] as const
export const POLL_EVERY_MS = 3000
export const POLL_FOR_MS = 900000
export const TRANSCRIBE_AT_ONCE = 4
export const AUDIO_MARKER = /\(audio: ([^)]+)\)/g
export const AUDIO_LEFTOVER = /\s*\(audio (?:saved|not downloaded): [^)]*\)/g
export const VOICE_NOTE_PREFIX = '(voice note: '
export const NO_KEY_NOTE = '(voice note not transcribed: ASSEMBLYAI_API_KEY is not set)'

export interface Transcript {
  hash: string
  text: string
  languageCode: string | null
  seconds: number | null
  transcriptId: string
  file: string
  transcribedAt: string
}

export interface VoiceNote {
  platform: string
  account: string
  conversationId: string
  messageId: string
  from: string | null
  fromMe: boolean
  at: string | null
  name: string
  path: string | null
  mediaHashKey?: string
  error?: string
}

export type TranscribeFailureCode = 'assemblyAiKeyMissing' | 'transcriptionFailed'

export type TranscribeAnswer =
  | { ok: true; transcript: Transcript; cached: boolean }
  | { ok: false; code: TranscribeFailureCode; status: number; error: string }

export interface AssemblyAiClient {
  hasKey: boolean
  transcribe(bytes: Uint8Array, file: string, hash: string): Promise<TranscribeAnswer>
}

export interface AssemblyAiOptions {
  key: string | null
  fetcher?: typeof fetch
  wait?: (ms: number) => Promise<void>
  now?: () => Date
  pollEveryMs?: number
  pollForMs?: number
}

export interface MessageLink {
  platform: string
  account: string
  messageId: string
  name: string
}

export interface XchatMedia {
  type?: string
  filename?: string
  media_hash_key?: string
  path?: string
  error?: string
}
