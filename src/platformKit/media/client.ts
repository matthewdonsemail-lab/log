import { AUDIO_SUFFIXES, AUDIO_TYPES, DISCORD_VOICE_FLAG, SLACK_AUDIO_SUBTYPES } from './types'
import type { MessageAttachment } from './types'

export function isAudio(attachment: MessageAttachment, messageFlags?: number | null): boolean {
  if (attachment.audio !== undefined) return attachment.audio
  const kind = (attachment.type ?? '').toLowerCase()
  const name = (attachment.name ?? '').toLowerCase()
  if (AUDIO_TYPES.some((t) => kind.startsWith(t))) return true
  if ((SLACK_AUDIO_SUBTYPES as readonly string[]).includes(attachment.subtype ?? '')) return true
  if (attachment.waveform || (messageFlags != null && (messageFlags & DISCORD_VOICE_FLAG) !== 0 && attachment.duration)) return true
  if (kind.startsWith('video/') || kind.startsWith('image/')) return false
  return AUDIO_SUFFIXES.some((s) => name.endsWith(s))
}

export function audioMarker(name: string): string {
  return `(audio: ${name})`
}

export function audioOf<T extends MessageAttachment>(attachments: readonly T[] | undefined, messageFlags?: number | null): T[] {
  return (attachments ?? []).filter((a) => a.name && isAudio(a, messageFlags))
}
