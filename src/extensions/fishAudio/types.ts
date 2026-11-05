export const FISH_API = 'https://api.fish.audio'

export const FISH_ENDPOINTS = {
  createModel: '/model',
  getModel: '/model/',
  speak: '/v1/tts',
} as const

export const FISH_KEY_NAME = 'FISH_API_KEY'

export const FISH_MODELS = ['s2.1-pro-free', 's2.1-pro'] as const
export type FishModel = (typeof FISH_MODELS)[number]

export const FISH_LIMITS = { least: 10, most: 60 } as const

export interface FishModelInfo {
  id: string
  title: string
  state: string | null
  visibility: string | null
}
