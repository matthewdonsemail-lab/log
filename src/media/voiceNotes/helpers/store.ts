import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { hashOf } from '../client'
import { AUDIO_LEFTOVER, AUDIO_MARKER } from '../types'
import type { AssemblyAiClient, MessageLink, Transcript, TranscribeAnswer } from '../types'
import type { Conversation } from '../../../search/conversations/types'

export function transcriptsRoot(): string {
  return process.env.LOG_TRANSCRIPTS_DIR || join(homedir(), '.logCli', 'transcripts')
}

const transcriptPath = (root: string, hash: string) => join(root, `${hash}.json`)
const linksPath = (root: string) => join(root, 'messages.json')

function readJson<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return fallback
  }
}

export function readTranscript(hash: string, root = transcriptsRoot()): Transcript | null {
  return existsSync(transcriptPath(root, hash)) ? readJson<Transcript | null>(transcriptPath(root, hash), null) : null
}

export function writeTranscript(transcript: Transcript, root = transcriptsRoot()): void {
  mkdirSync(root, { recursive: true })
  writeFileSync(transcriptPath(root, transcript.hash), JSON.stringify(transcript, null, 2))
}

export function linkKey(link: MessageLink): string {
  return `${link.platform}:${link.account}:${link.messageId}:${link.name}`
}

export function readLinks(root = transcriptsRoot()): Record<string, string> {
  return readJson<Record<string, string>>(linksPath(root), {})
}

export function linkMessages(pairs: readonly { link: MessageLink; hash: string }[], root = transcriptsRoot()): void {
  if (!pairs.length) return
  const links = readLinks(root)
  for (const { link, hash } of pairs) links[linkKey(link)] = hash
  mkdirSync(root, { recursive: true })
  writeFileSync(linksPath(root), JSON.stringify(links, null, 2))
}

export function transcriptOf(link: MessageLink, root = transcriptsRoot(), links: Record<string, string> = readLinks(root)): Transcript | null {
  const hash = links[linkKey(link)]
  return hash ? readTranscript(hash, root) : null
}

export function voiceNoteText(transcript: Transcript): string {
  const said = transcript.text.replace(/\s+/g, ' ').replace(/"/g, "'").trim()
  return said ? `(voice note: "${said}")` : '(voice note: no words in it)'
}

export function withTranscripts(text: string, find: (name: string) => Transcript | null): string {
  let replaced = false
  const out = text.replace(AUDIO_MARKER, (marker, name: string) => {
    const found = find(name.trim())
    if (!found) return marker
    replaced = true
    return voiceNoteText(found)
  })
  return replaced ? out.replace(AUDIO_LEFTOVER, '').trim() : out
}

export function applyTranscripts(conversations: readonly Conversation[], root = transcriptsRoot()): { conversations: Conversation[]; changed: Conversation[] } {
  const links = readLinks(root)
  if (!Object.keys(links).length) return { conversations: [...conversations], changed: [] }
  const changed: Conversation[] = []
  const out = conversations.map((c) => {
    let touched = false
    const messages = c.messages.map((m) => {
      if (!m.text.includes('(audio: ')) return m
      const text = withTranscripts(m.text, (name) => transcriptOf({ platform: c.platform, account: c.account, messageId: m.id, name }, root, links))
      if (text === m.text) return m
      touched = true
      return { ...m, text }
    })
    if (!touched) return c
    const next = { ...c, messages }
    changed.push(next)
    return next
  })
  return { conversations: out, changed }
}

export async function transcribeFile(path: string, file: string, client: AssemblyAiClient, root = transcriptsRoot()): Promise<TranscribeAnswer> {
  const bytes = new Uint8Array(readFileSync(path))
  const hash = hashOf(bytes)
  const cached = readTranscript(hash, root)
  if (cached) return { ok: true, transcript: cached, cached: true }
  const answer = await client.transcribe(bytes, file, hash)
  if (answer.ok) writeTranscript(answer.transcript, root)
  return answer
}
