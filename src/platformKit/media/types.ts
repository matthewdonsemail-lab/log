export const AUDIO_SUFFIXES = ['.ogg', '.oga', '.opus', '.m4a', '.mp3', '.wav', '.aac', '.flac', '.webm'] as const
export const AUDIO_TYPES = ['audio/', 'video/ogg'] as const
export const DISCORD_VOICE_FLAG = 8192
export const SLACK_AUDIO_SUBTYPES = ['slack_audio'] as const

export interface MessageAttachment {
  name?: string
  type?: string
  subtype?: string
  duration?: number
  waveform?: boolean
  audio?: boolean
  path?: string | null
  error?: string
}
