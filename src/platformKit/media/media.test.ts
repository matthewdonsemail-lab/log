import { describe, expect, test } from 'bun:test'
import { audioOf, DISCORD_VOICE_FLAG, isAudio } from './index'

describe('the shared audio detector', () => {
  test('a content type says audio, whatever the platform', () => {
    expect(isAudio({ name: 'x', type: 'audio/ogg' })).toBe(true)
    expect(isAudio({ name: 'x', type: 'video/ogg' })).toBe(true)
    expect(isAudio({ name: 'clip.webm', type: 'video/webm' })).toBe(false)
    expect(isAudio({ name: 'photo.png', type: 'image/png' })).toBe(false)
  })

  test('the extension says audio when there is no type', () => {
    for (const name of ['a.ogg', 'a.oga', 'a.opus', 'a.m4a', 'a.mp3', 'a.wav', 'a.aac', 'a.webm']) expect(isAudio({ name })).toBe(true)
    expect(isAudio({ name: 'a.pdf' })).toBe(false)
  })

  test("each platform's own flag says audio", () => {
    expect(isAudio({ name: 'voiceNote', waveform: true })).toBe(true)
    expect(isAudio({ name: 'voiceNote', duration: 4 }, DISCORD_VOICE_FLAG)).toBe(true)
    expect(isAudio({ name: 'audio_message', subtype: 'slack_audio' })).toBe(true)
    expect(isAudio({ name: 'handleO1', audio: true })).toBe(true)
  })

  test('audioOf keeps only the named audio attachments', () => {
    expect(audioOf([{ name: 'a.m4a' }, { name: 'b.png', type: 'image/png' }, { type: 'audio/ogg' }]).map((a) => a.name)).toEqual(['a.m4a'])
  })
})
