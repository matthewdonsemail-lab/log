import { hashOf } from '../../voiceNotes/client'
import { readTranscript, writeTranscript } from '../../voiceNotes/helpers/store'
import type { AssemblyAiClient, Transcript } from '../../voiceNotes/types'
import type { Speech, Transcriber } from '../types'

const speechOf = (transcript: Transcript, model: string): Speech => ({ text: transcript.text, words: (transcript.words ?? []).map((w) => ({ text: w.text, start: w.start, end: w.end })), model })

export function assemblyAiTranscriber(client: AssemblyAiClient): Transcriber {
  const model = 'assemblyai'
  return {
    model,
    async transcribe(bytes, name) {
      const hash = hashOf(bytes)
      const kept = readTranscript(hash)
      if (kept) return speechOf(kept, model)
      const answer = await client.transcribe(bytes, name, hash)
      if (!answer.ok) throw new Error(`${answer.code}: ${answer.error}`)
      writeTranscript(answer.transcript)
      return speechOf(answer.transcript, model)
    },
  }
}

export function transcriptOfHash(hash: string | null | undefined): Transcript | null {
  if (!hash) return null
  try {
    return readTranscript(hash)
  } catch {
    return null
  }
}
