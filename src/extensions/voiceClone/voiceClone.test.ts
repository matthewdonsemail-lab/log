import { describe, expect, test } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { conversationsRoot } from '../../search/conversations/index'
import { discordWaveform, providerOf, insideVoiceNotes, instagramLevels, mattsRecordings, pickReferences, rmsLevels, sentByMatt, textOnlyProblem, voiceNotesDir } from './index'
import type { Recording } from './index'

const rec = (messageId: string, seconds: number): Recording => ({ path: `/x/${messageId}`, platform: 'discord', account: 'a', conversationId: '1', messageId, seconds })

describe('fishAudio helpers', () => {
  test('pickReferences takes the shortest first, each at least 5 s, within the provider limit', () => {
    expect(pickReferences([rec('a', 271.9), rec('b', 34.1), rec('c', 8.5), rec('d', 15.9), rec('e', 4), rec('f', 46.2)], { least: 10, most: 60 }).map((r) => r.messageId)).toEqual(['c', 'd', 'b'])
    expect(pickReferences([rec('b', 34.1), rec('c', 8.5), rec('d', 15.9)], { least: 3, most: 30 }).map((r) => r.messageId)).toEqual(['c', 'd'])
  })

  test('only recordings matt sent are kept', () => {
    const dir = join(conversationsRoot(), 'discord', 'mattDiscord')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, '77.json'), JSON.stringify({ messages: [{ id: '1', fromMe: true }, { id: '2', fromMe: false }] }))
    const base = { platform: 'discord', account: 'mattDiscord', conversationId: '77' }
    expect(sentByMatt({ ...base, messageId: '1' })).toBe(true)
    expect(sentByMatt({ ...base, messageId: '2' })).toBe(false)
    expect(sentByMatt({ ...base, messageId: '3' })).toBe(false)
    const kept = mattsRecordings({ files: () => [{ ...base, messageId: '1', path: '/one' }, { ...base, messageId: '2', path: '/two' }], seconds: () => 12.345 })
    expect(kept).toEqual([{ ...base, messageId: '1', path: '/one', seconds: 12.35 }])
  })

  test('the provider is --provider, then LOG_VOICE_PROVIDER, then inworld', () => {
    expect(providerOf('fishAudio', {})).toMatchObject({ ok: true, provider: 'fishAudio', from: '--provider' })
    expect(providerOf(undefined, { LOG_VOICE_PROVIDER: 'fishAudio' })).toMatchObject({ ok: true, provider: 'fishAudio', from: 'LOG_VOICE_PROVIDER' })
    expect(providerOf('nope', {}).ok).toBe(false)
  })

  test('a voice note takes text only', () => {
    expect(textOnlyProblem('yo how was it')).toBeNull()
    expect(textOnlyProblem('  ')).toContain('needs --text')
    expect(textOnlyProblem('clip.ogg')).toContain('text only')
    expect(textOnlyProblem('C:/notes/voice_1.m4a')).toContain('text only')
    expect(textOnlyProblem('x'.repeat(601))).toContain('600')
  })

  test('only files under the voice notes folder count as log-made', () => {
    expect(insideVoiceNotes(join(voiceNotesDir(), 'a.ogg'))).toBe(true)
    expect(insideVoiceNotes(join(voiceNotesDir(), '..', 'a.ogg'))).toBe(false)
  })

  test('waveforms are measured from the audio itself', () => {
    const samples = new Int16Array(8000 * 4).map((_, i) => (i < 16000 ? 1000 : 16000))
    expect(rmsLevels(samples, 2).map((l) => Math.round(l * 100) / 100)).toEqual([0.06, 1])
    expect(Buffer.from(discordWaveform(samples, 4), 'base64').length).toBe(40)
    const levels = instagramLevels(samples)
    expect(levels.length).toBe(70)
    expect(Math.min(...levels)).toBeGreaterThanOrEqual(0.05)
    expect(Math.max(...levels)).toBe(1)
  })
})
