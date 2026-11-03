import { TRANSCRIBE_AT_ONCE } from '../types'
import type { AssemblyAiClient, MessageLink, Transcript, TranscribeAnswer, VoiceNote } from '../types'
import { linkMessages, readLinks, readTranscript, transcribeFile, transcriptsRoot, withTranscripts } from './store'

export interface NoteResult {
  note: VoiceNote
  answer: TranscribeAnswer | null
}

export const linkOf = (note: VoiceNote): MessageLink => ({ platform: note.platform, account: note.account, messageId: note.messageId, name: note.name })

export async function transcribeNotes(notes: readonly VoiceNote[], client: AssemblyAiClient, progress: (line: string) => void = () => {}, root = transcriptsRoot(), atOnce = TRANSCRIBE_AT_ONCE): Promise<NoteResult[]> {
  const results: NoteResult[] = new Array(notes.length)
  let next = 0
  let done = 0
  const worker = async () => {
    for (;;) {
      const index = next++
      if (index >= notes.length) return
      const note = notes[index]
      const answer = note.path ? await transcribeFile(note.path, note.name, client, root).catch((error: Error) => ({ ok: false as const, code: 'transcriptionFailed' as const, status: 0, error: error.message })) : null
      results[index] = { note, answer }
      if (answer?.ok) linkMessages([{ link: linkOf(note), hash: answer.transcript.hash }], root)
      done++
      const said = answer === null ? `no file (${note.error ?? 'not downloaded'})` : answer.ok ? `${answer.cached ? 'cached' : 'transcribed'}, ${Math.round(answer.transcript.seconds ?? 0)} s, ${answer.transcript.text.split(/\s+/).filter(Boolean).length} words` : `${answer.code}: ${answer.error}`
      progress(`transcribe ${done}/${notes.length}: ${note.platform} ${note.account} ${note.conversationId} ${note.messageId} ${note.fromMe ? 'sent' : `from ${note.from ?? '?'}`}: ${said}`)
      if (answer && !answer.ok && answer.code === 'assemblyAiKeyMissing') {
        next = notes.length
        return
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(atOnce, notes.length)) }, worker))
  return results.filter(Boolean)
}

export function transcriptByName(platform: string, account: string, root = transcriptsRoot()): (name: string) => Transcript | null {
  const links = readLinks(root)
  const prefix = `${platform}:${account}:`
  return (name) => {
    const hit = Object.entries(links).find(([key]) => key.startsWith(prefix) && key.endsWith(`:${name}`))
    return hit ? readTranscript(hit[1], root) : null
  }
}

export function inboxTextWithVoiceNotes(message: { platform: string; account: string; text: string }, root = transcriptsRoot()): string {
  if (!message.text.includes('(audio: ')) return message.text
  const text = withTranscripts(message.text, transcriptByName(message.platform, message.account, root))
  if (text !== message.text) return text
  return `${text} (a voice note, not transcribed yet: reading the chat transcribes it, or \`transcribe\`)`
}
