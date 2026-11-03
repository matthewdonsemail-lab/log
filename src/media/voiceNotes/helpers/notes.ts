import { existsSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { AUDIO_MARKER } from '../types'
import { isAudio } from '../../../platformKit/media/index'
import type { VoiceNote, XchatMedia } from '../types'
import type { Conversation } from '../../../search/conversations/types'

const safe = (text: string, keep: RegExp) => text.replace(keep, '_')

export function isVoiceName(name: string): boolean {
  return isAudio({ name })
}

export function audioNamesIn(text: string): string[] {
  return [...text.matchAll(AUDIO_MARKER)].map((m) => m[1].trim())
}

export function xchatMediaPath(stateRoot: string, account: string, conversationId: string, media: XchatMedia): string {
  const ext = extname(media.filename ?? '')
  const suffix = /^\.[A-Za-z0-9]{1,5}$/.test(ext) ? ext.toLowerCase() : '.bin'
  const stem = safe(String(media.media_hash_key ?? ''), /[^0-9A-Za-z_-]/g).slice(-48)
  return join(stateRoot, account, 'media', safe(conversationId, /[^0-9A-Za-z_-]/g), `${stem}${suffix}`)
}

export function discordMediaPath(stateRoot: string, account: string, channelId: string, messageId: string, name: string): string {
  return join(stateRoot, account, 'media', safe(channelId, /[^0-9A-Za-z_-]/g), `${messageId}_${safe(name, /[^0-9A-Za-z._-]/g).slice(-80)}`)
}

export function xchatStoredMedia(stateRoot: string, account: string): Map<string, XchatMedia[]> {
  const out = new Map<string, XchatMedia[]>()
  const path = join(stateRoot, account, 'inboxSync.json')
  if (!existsSync(path)) return out
  let state: { xchat?: Record<string, { messages?: { event_id?: string | number; media?: XchatMedia[] }[] }> }
  try {
    state = JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return out
  }
  for (const [conversationId, conv] of Object.entries(state.xchat ?? {})) {
    for (const m of conv.messages ?? []) {
      if (m.event_id && m.media?.length) out.set(`${conversationId}:${m.event_id}`, m.media)
    }
  }
  return out
}

export function twitterVoiceNotes(conversations: readonly Conversation[], stateRoot: string): VoiceNote[] {
  const stored = new Map<string, Map<string, XchatMedia[]>>()
  const notes: VoiceNote[] = []
  for (const c of conversations.filter((c) => c.platform === 'twitter')) {
    if (!stored.has(c.account)) stored.set(c.account, xchatStoredMedia(stateRoot, c.account))
    for (const m of c.messages) {
      for (const name of audioNamesIn(m.text)) {
        const media = stored.get(c.account)!.get(`${c.conversationId}:${m.id}`)?.find((x) => x.filename === name)
        const path = media?.media_hash_key ? xchatMediaPath(stateRoot, c.account, c.conversationId, media) : null
        notes.push({ platform: 'twitter', account: c.account, conversationId: c.conversationId, messageId: m.id, from: m.from, fromMe: m.fromMe, at: m.at, name, path: path && existsSync(path) ? path : null, ...(media?.media_hash_key ? { mediaHashKey: media.media_hash_key } : {}) })
      }
    }
  }
  return notes
}

export function discordStoredNotes(conversations: readonly Conversation[], stateRoot: string): VoiceNote[] {
  const notes: VoiceNote[] = []
  for (const c of conversations.filter((c) => c.platform === 'discord')) {
    for (const m of c.messages) {
      for (const name of audioNamesIn(m.text)) {
        const path = discordMediaPath(stateRoot, c.account, c.conversationId, m.id, name)
        notes.push({ platform: 'discord', account: c.account, conversationId: c.conversationId, messageId: m.id, from: m.from, fromMe: m.fromMe, at: m.at, name, path: existsSync(path) ? path : null })
      }
    }
  }
  return notes
}

export interface DiscordFoundNote {
  channelId: string
  messageId: string
  at: string | null
  from: string | null
  fromMe: boolean
  text: string
  name: string
  type?: string
  duration?: number
  path?: string
  error?: string
}

export function discordNoteOf(account: string, found: DiscordFoundNote): VoiceNote {
  return { platform: 'discord', account, conversationId: found.channelId, messageId: found.messageId, from: found.from, fromMe: found.fromMe, at: found.at, name: found.name, path: found.path ?? null, ...(found.error ? { error: found.error } : {}) }
}

export function withDiscordNotes(conversations: readonly Conversation[], account: string, found: readonly DiscordFoundNote[]): { conversations: Conversation[]; changed: Conversation[] } {
  const byMessage = new Map(found.map((n) => [`${n.channelId}:${n.messageId}`, n]))
  const changed: Conversation[] = []
  const out = conversations.map((c) => {
    if (c.platform !== 'discord' || c.account !== account) return c
    let touched = false
    const messages = c.messages.map((m) => {
      const note = byMessage.get(`${c.conversationId}:${m.id}`)
      if (!note || m.text.includes(`(audio: ${note.name})`) || m.text.includes('(voice note')) return m
      touched = true
      return { ...m, text: note.text, attachments: [...(m.attachments ?? []).filter((a) => a.name !== note.name), { name: note.name, ...(note.type ? { type: note.type } : {}), ...(note.duration ? { duration: note.duration } : {}) }] }
    })
    if (!touched) return c
    const next = { ...c, messages }
    changed.push(next)
    return next
  })
  return { conversations: out, changed }
}

export function whoSaid(note: VoiceNote, ownName: string): string {
  if (note.fromMe) return ownName
  return note.platform === 'twitter' && note.from ? `@${note.from}` : note.from ?? '?'
}
