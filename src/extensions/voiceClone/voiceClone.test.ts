import { describe, expect, test } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { conversationsRoot } from '../../search/conversations/index'
import { discordWaveform, providerOf, insideVoiceNotes, instagramLevels, mattsRecordings, pickReferences, quietPieces, readSpoken, REALISM, rmsLevels, seeded, sentByMatt, shapeLikeMatt, speakableText, textOnlyProblem, unknownAcronyms, voiceNotesDir, withBreaths, wordsOf, paceOf } from './index'
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

describe("spoken words and realism (rule 147)", () => {
  const timed = (words: string[], ms = 200) => words.map((text, i) => ({ text, start: i * 300, end: i * 300 + ms, confidence: 0.99 }));

  test("readSpoken passes what was written, catches a lexicon word heard wrong, spelled out or drawn out", () => {
    expect(readSpoken("its actually so op when it works", timed(["It's", "actually", "so", "OP", "when", "it", "works."])).ok).toBe(true);
    const up = readSpoken("its actually so op when it works", timed(["It's", "actually", "so", "up", "when", "it", "works."]));
    expect(up.ok).toBe(false);
    expect(up.problems).toEqual(['"op" was heard as "up"']);
    const letters = readSpoken("so op", timed(["so", "O", "P"]));
    expect(letters.ok).toBe(false);
    expect(letters.problems.join(" ")).toContain("op");
    const slow = readSpoken("so op", [{ text: "so", start: 0, end: 200, confidence: 1 }, { text: "OP", start: 300, end: 900, confidence: 1 }]);
    expect(slow.problems[0]).toContain("as letters would");
    expect(readSpoken("one two three four", timed(["nine", "ten", "eleven", "four"])).ok).toBe(false);
  });

  test("wordsOf reads Chinese one character at a time beside Latin words, so a Chinese note is checked too (rule 148)", () => {
    expect(wordsOf("[excited] so OP 兄弟，这就是abc")).toEqual(["so", "op", "兄", "弟", "这", "就", "是", "abc"]);
    const said = "兄弟，这就是我说的那个。这条语音是工具做的，不是我本人。每个平台都能用。";
    const heard = (text: string) => wordsOf(text).map((t, i) => ({ text: t, start: i * 200, end: i * 200 + 150, confidence: 0.99 }));
    expect(readSpoken(said, heard("兄弟，这就是我说的那个这套语言是工具做的，不是我本人，每一个平台都能用。")).ok).toBe(true);
    expect(readSpoken(said, heard("今天天气很好我们去公园玩吧")).ok).toBe(false);
  });

  test("unknownAcronyms names acronyms the lexicon doesn't have, and speakableText writes lexicon words the way they're said", () => {
    expect(unknownAcronyms("we got into YC and the A.I. is OP [excited] lol")).toEqual(["YC", "A.I"]);
    expect(unknownAcronyms("its so op")).toEqual([]);
    expect(speakableText("[excited] its so op, op as anything")).toBe("[excited] its so OP, OP as anything");
  });

  test("withBreaths never opens with a breath, puts one in only after 8 to 18 words, at a gap drawn from the seed, and reads Chinese full stops (rule 149)", () => {
    const said = "yo whats the craic. ye im good bro been locked in building it all week. it posts and replies on its own on every platform. call me later bro."
    for (const seed of [1, 2, 3, 4, 5]) {
      const out = withBreaths(said, seed)
      expect(out.startsWith("[breathe]")).toBe(false)
      expect(out.replace(/\[breathe\] /g, "")).toBe(said)
      expect(withBreaths(said, seed)).toBe(out)
    }
    expect(new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seed) => withBreaths(said, seed))).size).toBeGreaterThan(1)
    expect(withBreaths("yo bro.", 3)).toBe("yo bro.")
    const chinese = withBreaths("我想用这个帮别人运营他们的社交账号，让他们变成创作者。它帮他们回消息，他们做别的事的时候也能靠这个赚钱。", 9)
    expect(chinese.startsWith("[breathe]")).toBe(false)
    expect(chinese).toContain("[breathe] 它")
    expect(withBreaths("[breathe] yo", 1)).toBe("[breathe] yo")
  })

  test("paceOf drifts the speed by at most 7% from the text, the same each time, within the speed range (rule 149)", () => {
    const paces = ["yo", "ye im good bro", "call me later", "its actually so op"].map((t) => paceOf(1.15, t))
    for (const p of paces) expect(Math.abs(p - 1.15)).toBeLessThanOrEqual(1.15 * 0.07 + 0.001)
    expect(new Set(paces).size).toBeGreaterThan(1)
    expect(paceOf(1.15, "yo")).toBe(paces[0])
    expect(paceOf(1.5, "yo")).toBeLessThanOrEqual(1.5)
  })

  test("shapeLikeMatt lays matt's own room tone under the voice at the measured level, and is the same for the same seed", () => {
    const rate = REALISM.rate;
    const voice = new Float32Array(rate).map((_, i) => (i % 9600 < 4800 ? 0.3 * Math.sin((2 * Math.PI * 220 * i) / rate) : 0));
    const room = [new Float32Array(rate / 2).map((_, i) => 0.001 * Math.sin(i))]
    const a = shapeLikeMatt(voice, room, seeded(5))
    const b = shapeLikeMatt(voice, room, seeded(5))
    expect(Array.from(a.slice(0, 50))).toEqual(Array.from(b.slice(0, 50)));
    const quiet = a.slice(6000, 9000).reduce((s, v) => s + Math.abs(v), 0);
    expect(quiet).toBeGreaterThan(0);
    expect(Math.max(...Array.from(a, Math.abs))).toBeCloseTo(10 ** (REALISM.peakDb / 20), 3);
    expect(quietPieces(new Float32Array(rate))).toEqual([]);
  });
});
