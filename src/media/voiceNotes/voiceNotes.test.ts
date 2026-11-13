import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyTranscripts, assemblyAiKey, createAssemblyAiClient, discordStoredNotes, hashOf, inboxTextWithVoiceNotes, linkMessages, transcribeFile, transcribeNotes, twitterVoiceNotes, withDiscordNotes, withTranscripts, writeTranscript, xchatMediaPath } from './index'
import type { Transcript } from './index'
import type { Conversation } from '../../search/conversations/types'

let dir = ''

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'voiceNotes'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

type Call = { url: string; method: string; headers: Record<string, string>; body: unknown }

function fakeAssemblyAi(states: Record<string, unknown>[], calls: Call[]): typeof fetch {
  let poll = 0
  return (async (url: string, init: RequestInit) => {
    calls.push({ url, method: String(init.method), headers: init.headers as Record<string, string>, body: init.body })
    if (url.endsWith('/upload')) return new Response(JSON.stringify({ upload_url: 'https://cdn.assemblyai.com/upload/abc' }), { status: 200 })
    if (url.endsWith('/transcript')) return new Response(JSON.stringify({ id: 'tr1', status: 'queued' }), { status: 200 })
    return new Response(JSON.stringify(states[Math.min(poll++, states.length - 1)]), { status: 200 })
  }) as unknown as typeof fetch
}

const transcript = (hash: string, text: string): Transcript => ({ hash, text, languageCode: 'en', seconds: 4, transcriptId: 't', file: 'a.m4a', transcribedAt: '2026-11-03T00:00:00Z' })

describe('AssemblyAI client', () => {
  test('the key comes from ASSEMBLYAI_API_KEY first', () => {
    expect(assemblyAiKey({ ASSEMBLYAI_API_KEY: ' k1 ' }, dir)).toBe('k1')
  })

  test('no key: nothing is called, and the answer names assemblyAiKeyMissing', async () => {
    const calls: Call[] = []
    const client = createAssemblyAiClient({ key: null, fetcher: fakeAssemblyAi([], calls) })
    expect(client.hasKey).toBe(false)
    expect(await client.transcribe(new Uint8Array([1]), 'a.m4a', 'h')).toMatchObject({ ok: false, code: 'assemblyAiKeyMissing' })
    expect(calls).toEqual([])
  })

  test('uploads the bytes, asks for a transcript, polls until it is done', async () => {
    const calls: Call[] = []
    const client = createAssemblyAiClient({ key: 'k', fetcher: fakeAssemblyAi([{ status: 'processing' }, { status: 'completed', text: ' yo it works ', language_code: 'en', audio_duration: 7 }], calls), wait: async () => {} })
    const answer = await client.transcribe(new Uint8Array([1, 2]), 'a.m4a', 'h1')
    expect(answer).toMatchObject({ ok: true, cached: false, transcript: { hash: 'h1', text: 'yo it works', languageCode: 'en', seconds: 7, transcriptId: 'tr1', file: 'a.m4a' } })
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual(['POST https://api.assemblyai.com/v2/upload', 'POST https://api.assemblyai.com/v2/transcript', 'GET https://api.assemblyai.com/v2/transcript/tr1', 'GET https://api.assemblyai.com/v2/transcript/tr1'])
    expect(calls.every((c) => c.headers.authorization === 'k')).toBe(true)
    expect(JSON.parse(String(calls[1].body))).toEqual({ audio_url: 'https://cdn.assemblyai.com/upload/abc', language_detection: true })
  })

  test("AssemblyAI's error comes back as transcriptionFailed", async () => {
    const client = createAssemblyAiClient({ key: 'k', fetcher: fakeAssemblyAi([{ status: 'error', error: 'file has no audio' }], []), wait: async () => {} })
    expect(await client.transcribe(new Uint8Array([1]), 'a.m4a', 'h')).toMatchObject({ ok: false, code: 'transcriptionFailed', error: 'AssemblyAI: file has no audio' })
  })

  test('a file is kept by its hash, so it is never sent twice', async () => {
    const calls: Call[] = []
    const client = createAssemblyAiClient({ key: 'k', fetcher: fakeAssemblyAi([{ status: 'completed', text: 'hello' }], calls), wait: async () => {} })
    const path = join(dir, 'a.m4a')
    writeFileSync(path, 'audio bytes')
    const first = await transcribeFile(path, 'a.m4a', client, join(dir, 'transcripts'))
    const second = await transcribeFile(path, 'a.m4a', client, join(dir, 'transcripts'))
    expect(first).toMatchObject({ ok: true, cached: false })
    expect(second).toMatchObject({ ok: true, cached: true, transcript: { hash: hashOf(new TextEncoder().encode('audio bytes')), text: 'hello' } })
    expect(calls.filter((c) => c.url.endsWith('/upload'))).toHaveLength(1)
  })

  test('a missing key stops the whole run after the first note', async () => {
    const client = createAssemblyAiClient({ key: null })
    writeFileSync(join(dir, 'a.ogg'), 'x')
    writeFileSync(join(dir, 'b.ogg'), 'y')
    const note = (id: string, path: string) => ({ platform: 'discord', account: 'd', conversationId: 'c', messageId: id, from: 'A', fromMe: false, at: null, name: 'voice-message.ogg', path })
    const results = await transcribeNotes([note('1', join(dir, 'a.ogg')), note('2', join(dir, 'b.ogg'))], client, () => {}, join(dir, 't'), 1)
    expect(results).toHaveLength(1)
  })
})

describe('the conversation store', () => {
  const root = () => join(dir, 'transcripts')
  const conversation = (text: string): Conversation => ({ platform: 'twitter', account: 'matt', conversationId: '1:2', box: 'xchat', with: ['handle_n1'], messages: [{ id: '10', at: null, from: 'handle_n1', fromMe: false, text }] })

  test('a voice note marker becomes what was said, and the saved-path marker goes', () => {
    expect(withTranscripts('(audio: v.m4a) (audio saved: C:\\x\\v.m4a)', () => transcript('h', 'call me "tomorrow"'))).toBe(`(voice note: "call me 'tomorrow'")`)
    expect(withTranscripts('(audio: v.m4a)', () => null)).toBe('(audio: v.m4a)')
  })

  test('applyTranscripts rewrites only the messages that have a transcript', () => {
    writeTranscript(transcript('h1', 'see you at nine'), root())
    linkMessages([{ link: { platform: 'twitter', account: 'matt', messageId: '10', name: 'v.m4a' }, hash: 'h1' }], root())
    const { conversations, changed } = applyTranscripts([conversation('(audio: v.m4a)'), conversation('just text')], root())
    expect(changed).toHaveLength(1)
    expect(conversations[0].messages[0].text).toBe('(voice note: "see you at nine")')
    expect(conversations[1].messages[0].text).toBe('just text')
  })

  test('X voice notes find their file from the X Chat store', () => {
    const state = join(dir, 'state')
    const media = { type: 'audio', filename: 'v.m4a', media_hash_key: 'abcDEF' }
    mkdirSync(join(state, 'matt'), { recursive: true })
    writeFileSync(join(state, 'matt', 'inboxSync.json'), JSON.stringify({ xchat: { '1:2': { messages: [{ event_id: '10', media: [media] }] } } }))
    const path = xchatMediaPath(state, 'matt', '1:2', media)
    expect(path).toBe(join(state, 'matt', 'media', '1_2', 'abcDEF.m4a'))
    expect(twitterVoiceNotes([conversation('(audio: v.m4a)')], state)).toMatchObject([{ messageId: '10', name: 'v.m4a', path: null, mediaHashKey: 'abcDEF' }])
    mkdirSync(join(state, 'matt', 'media', '1_2'), { recursive: true })
    writeFileSync(path, 'x')
    expect(twitterVoiceNotes([conversation('(audio: v.m4a)')], state)[0].path).toBe(path)
  })

  test('a Discord voice message found by the sound search gets its marker and attachment in the store', () => {
    const c: Conversation = { platform: 'discord', account: 'd', conversationId: '55', box: 'dm', with: ['A'], messages: [{ id: '9', at: null, from: 'A', fromMe: false, text: '' }] }
    const { conversations, changed } = withDiscordNotes([c], 'd', [{ channelId: '55', messageId: '9', at: null, from: 'A', fromMe: false, text: '(audio: voice-message.ogg)', name: 'voice-message.ogg', type: 'audio/ogg', duration: 12 }])
    expect(changed).toHaveLength(1)
    expect(conversations[0].messages[0]).toMatchObject({ text: '(audio: voice-message.ogg)', attachments: [{ name: 'voice-message.ogg', type: 'audio/ogg', duration: 12 }] })
    expect(discordStoredNotes(conversations, join(dir, 'state'))).toMatchObject([{ platform: 'discord', messageId: '9', name: 'voice-message.ogg', path: null }])
  })

  test('the inbox alert shows a kept transcript, or says it is not transcribed yet', () => {
    writeTranscript(transcript('h2', 'yo'), root())
    linkMessages([{ link: { platform: 'twitter', account: 'matt', messageId: '10', name: 'v.m4a' }, hash: 'h2' }], root())
    expect(inboxTextWithVoiceNotes({ platform: 'twitter', account: 'matt', text: '(audio: v.m4a)' }, root())).toBe('(voice note: "yo")')
    expect(inboxTextWithVoiceNotes({ platform: 'twitter', account: 'matt', text: '(audio: w.m4a)' }, root())).toContain('not transcribed yet')
  })
})
