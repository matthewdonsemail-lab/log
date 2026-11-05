import { fishAudioProvider } from '../fishAudio/index'
import { inworldProvider } from '../inworld/index'
import type { VoiceProvider, VoiceProviderClient } from './types'

export const PROVIDER_CLIENTS: Readonly<Record<VoiceProvider, () => VoiceProviderClient>> = {
  inworld: () => inworldProvider(),
  fishAudio: () => fishAudioProvider(),
}

export function voiceProvider(provider: VoiceProvider): VoiceProviderClient {
  return PROVIDER_CLIENTS[provider]()
}
