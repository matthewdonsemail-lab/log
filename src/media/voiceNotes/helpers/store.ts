import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { db } from '../../../inbox/store/index'
import { hashOf } from '../client'
import { AUDIO_LEFTOVER, AUDIO_MARKER } from '../types'
import type { AssemblyAiClient, MessageLink, Transcript, TranscribeAnswer } from '../types'
import type { Conversation } from '../../../search/conversations/types'

export function transcriptsRoot(): string {
  return process.env.LOG_TRANSCRIPTS_DIR || join(homedir(), '.logCli', 'transcripts')
}

const importedRoots = new Set<string>()

function putTranscript(transcript: Transcript, source: string): void {
  db().prepare('INSERT INTO transcripts (audioHash, provider, text, durationMs, createdAt, body) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(audioHash) DO UPDATE SET text = excluded.text, durationMs = excluded.durationMs, body = excluded.body').run(transcript.hash, source, transcript.text ?? '', typeof transcript.seconds === 'number' ? Math.round(transcript.seconds * 1000) : null, new Date().toISOString(), JSON.stringify(transcript))
}

export function importTranscriptFiles(root = transcriptsRoot()): number {
  if (importedRoots.has(root)) return 0
  importedRoots.add(root)
  const handle = db()
  const store = `transcriptFiles:${root}`
  if (handle.prepare("SELECT 1 FROM imports WHERE store = ? AND state = 'done'").get(store) || !existsSync(root)) return 0
  let count = 0
  handle.transaction(() => {
    for (const file of readdirSync(root).filter((f) => f.endsWith('.json'))) {
      try {
        const value = JSON.parse(readFileSync(join(root, file), 'utf8')) as unknown
        if (file === 'messages.json') {
          for (const [key, hash] of Object.entries(value as Record<string, string>)) handle.prepare('INSERT INTO transcriptLinks (linkKey, audioHash) VALUES (?, ?) ON CONFLICT(linkKey) DO NOTHING').run(key, hash)
          continue
        }
        const transcript = value as Transcript
        if (!transcript?.hash) continue
        if (!handle.prepare('SELECT 1 FROM transcripts WHERE audioHash = ?').get(transcript.hash)) {
          putTranscript(transcript, 'assemblyai')
          count++
        }
      } catch {}
    }
    handle.prepare("INSERT INTO imports (store, state, rows, detail, startedAt, endedAt) VALUES (?, 'done', ?, ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = 'done', rows = excluded.rows, endedAt = excluded.endedAt").run(store, count, root, new Date().toISOString(), new Date().toISOString())
  }).immediate()
  return count
}

export function readTranscript(hash: string, root = transcriptsRoot()): Transcript | null {
  importTranscriptFiles(root)
  const row = db().prepare('SELECT body, text, durationMs FROM transcripts WHERE audioHash = ?').get(hash) as { body: string | null; text: string; durationMs: number | null } | null
  if (!row) return null
  if (row.body) return JSON.parse(row.body) as Transcript
  return { hash, text: row.text, ...(row.durationMs !== null ? { seconds: row.durationMs / 1000 } : {}) } as Transcript
}

export function writeTranscript(transcript: Transcript, root = transcriptsRoot()): void {
  importTranscriptFiles(root)
  putTranscript(transcript, 'assemblyai')
}

export function linkKey(link: MessageLink): string {
  return `${link.platform}:${link.account}:${link.messageId}:${link.name}`
}

export function readLinks(root = transcriptsRoot()): Record<string, string> {
  importTranscriptFiles(root)
  const rows = db().prepare('SELECT linkKey, audioHash FROM transcriptLinks').all() as { linkKey: string; audioHash: string }[]
  return Object.fromEntries(rows.map((r) => [r.linkKey, r.audioHash]))
}

export function linkMessages(pairs: readonly { link: MessageLink; hash: string }[], root = transcriptsRoot()): void {
  if (!pairs.length) return
  importTranscriptFiles(root)
  const handle = db()
  handle.transaction(() => {
    for (const { link, hash } of pairs) handle.prepare('INSERT INTO transcriptLinks (linkKey, audioHash) VALUES (?, ?) ON CONFLICT(linkKey) DO UPDATE SET audioHash = excluded.audioHash').run(linkKey(link), hash)
  }).immediate()
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
