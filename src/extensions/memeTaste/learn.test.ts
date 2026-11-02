import { describe, expect, test } from 'bun:test'
import { captionLines, learnedFrom, memeLeans, MINE, mineName, mixed, rankLearned, shownCounts, tasteLines, theirMemes } from './helpers/learn'
import type { LabelledMeme } from './helpers/situation'
import type { TasteRating } from './types'

const meme = (name: string, fit: number): LabelledMeme => ({ id: name, name, type: 'meme', mediaUrl: null, previewUrl: null, fitsWhen: '', fit })
const rated = (shown: string[], name = '', extra: Partial<TasteRating> = {}): TasteRating => ({ word: 'moment', templateId: '', name, mediaUrl: null, good: !!name, shown, at: '2026-11-02T00:00:00Z', ...extra })

describe('meme learning', () => {
  test('a meme passed over twice and never picked stops coming up', () => {
    const ratings = [rated(['Palantir CEO', 'Write That Down'], 'Write That Down'), rated(['Palantir CEO', 'Sad Kermit'])]
    expect(memeLeans(ratings).get('palantir ceo')).toMatchObject({ picked: 0, passed: 2 })
    expect(rankLearned([meme('Palantir CEO', 0.95), meme('Write That Down', 0.4)], ratings).map((m) => m.name)).toEqual(['Write That Down'])
  })

  test('a picked meme ranks up, and a skipped post teaches nothing about its memes', () => {
    const ratings = [rated(['A', 'B'], 'B'), rated(['A', 'B'], '', { skipped: true }), rated(['A', 'B'], '', { skipped: true })]
    expect(rankLearned([meme('A', 0.6), meme('B', 0.5)], ratings).map((m) => m.name)).toEqual(['B', 'A'])
    expect(tasteLines(ratings)).toMatchObject({ picked: ['B'], passed: [], captions: [], skipRate: 2 / 3 })
    expect(tasteLines(ratings).skips).toHaveLength(2)
  })

  test('a meme shown many times sinks, and his own memes come in as options', () => {
    const shown = shownCounts([rated(['Roll Safe', 'Fresh']), rated(['Roll Safe']), rated(['Roll Safe'])])
    expect(mixed([meme('Roll Safe', 0.9), meme('Fresh', 0.5)], shown, 2).map((m) => m.name)).toEqual(['Fresh', 'Roll Safe'])
    const index = { builtAt: '', from: '', read: 2, memes: [{ id: 'a', source: 'x' as const, url: '', text: '@x my goat shitting on pvpers', at: null, imageUrl: 'thumb.jpg', mediaUrl: 'clip.mp4', kind: 'gif' as const, meme: 0.9, style: 'other' as const, styleConfidence: 0.4 }] }
    const mine = theirMemes(index, new Set(), 3)
    expect(mine).toHaveLength(1)
    expect(mine[0]).toMatchObject({ id: `${MINE}a`, name: 'yours: my goat shitting on pvpers', mediaUrl: 'clip.mp4', raw: { preview_url: 'thumb.jpg' } })
    expect(theirMemes(index, new Set([`${MINE}a`]), 3)).toHaveLength(0)
  })

  test('a reply keeps its meme and its caption together, and both reach the prompts', () => {
    const ratings = [rated(['B'], 'B', { reply: 'bro really said that', thread: [{ handle: 'x', text: 'we raised 2m today' }] }), rated(['C'], 'C', { reply: 'who asked', searched: 'guy yawning', fromSearch: true }), rated([], '', { other: 'no meme, not learned' }), rated([], '', { skipped: true })]
    expect(tasteLines(ratings).captions).toEqual([{ post: 'we raised 2m today', context: 'moment', meme: 'B', searched: null, caption: 'bro really said that' }, { post: 'moment', context: 'moment', meme: 'C', searched: 'guy yawning', caption: 'who asked' }])
    const lines = captionLines(tasteLines(ratings).captions)
    expect(lines).toContain('he sent the meme "B" captioned "bro really said that"')
    expect(lines).toContain('he searched "guy yawning" and sent the meme "C" captioned "who asked"')
    expect(learnedFrom(ratings[1]!).map((p) => p.label)).toEqual(['+1 C', '+1 your search', '+1 caption'])
  })

  test('his memes with no words still get a name of their own', () => {
    const blank = { id: '2087116630119846343:17', text: '@someone https://t.co/x', kind: 'gif' as const, style: 'streamerReacts' as const, at: 'Tue Aug 11 09:59:16 +0000 2026' }
    expect(mineName(blank)).toBe('yours: streamer reacts gif from Aug 11 #6343')
    expect(mineName({ ...blank, id: '2087566980241150174:9', style: 'other' as const })).not.toBe(mineName(blank))
  })

  test('the captions sent to the prompts are spread across roles, not just the newest', () => {
    const captioned = (role: string, n: number) => rated([], `${role}${n}`, { reply: `${role} caption ${n}`, person: { handle: role + n, name: role, role, degree: 1, followsYou: false } })
    const ratings = [captioned('investor', 1), ...Array.from({ length: 30 }, (_, i) => captioned('saas_founder', i))]
    const memes = tasteLines(ratings).captions!.map((c) => c.meme)
    expect(memes).toHaveLength(20)
    expect(memes).toContain('investor1')
    expect(memes).toContain('saas_founder29')
  })

  test('each rating says what it taught', () => {
    expect(learnedFrom(rated(['B'], 'B', { person: { handle: 'x', name: 'x', role: 'saas_founder', degree: 1, followsYou: false } })).map((p) => p.label)).toEqual(['+1 saas founder', '+1 B'])
    expect(learnedFrom(rated([], '', { skipped: true })).map((p) => p.label)).toEqual(['+1 skip'])
  })
})
