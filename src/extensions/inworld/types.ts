export const INWORLD_API = 'https://api.inworld.ai'

export const INWORLD_ENDPOINTS = {
  clone: '/voices/v1/voices:clone',
  speak: '/tts/v1/voice',
} as const

export const INWORLD_KEY_NAME = 'INWORLD_API_KEY'

export const INWORLD_MODELS = ['inworld-tts-2-flash', 'inworld-tts-2'] as const
export type InworldModel = (typeof INWORLD_MODELS)[number]

export const INWORLD_LIMITS = { least: 3, most: 30 } as const

export const INWORLD_STEERING_MODELS: readonly InworldModel[] = ['inworld-tts-2']

export const INWORLD_LANGUAGE_REFUSED = /INVALID_ARGUMENT|lang|locale/i

export const INWORLD_ENCODINGS = { mp3: 'MP3', wav: 'WAV' } as const
