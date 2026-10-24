import { describe, expect, test } from 'bun:test'
import { drawPersonas, makeProfilePicture } from './client'
import { BACKGROUNDS, backgroundCheckRequest, personaPrompt, pictureCheckRequest, readPictureCheck, retryPrompt } from './helpers/index'
import type { PictureCheck, PictureDeps } from './types'

const row = (fields: Record<string, string>) => fields
const FILES = {
  doomscrolling: [row({ respondent_id: 'D1', age: '61', gender: 'Male', country: 'United States', occupation_category: 'Full-time Employee', primary_platform: 'Facebook', time_of_day_most_used: 'Afternoon', primary_motivation: 'News', education_level: "Bachelor's" })],
  socialBehaviour: [row({ user_id: 'U1', country: 'USA', primary_platform: 'Facebook', mood_while_scrolling: 'Bored', preferred_device: 'Smartphone', profession: 'Teacher' })],
  shortFormMemory: [row({ folder_id: 'F1', interrupt: 'tiktok' })]
}

const check = (scores: Partial<PictureCheck['scores']>): PictureCheck =>
  readPictureCheck({ model: 'x', usage: { input_tokens: 1, output_tokens: 1 }, answers: Object.fromEntries(Object.entries({ matchesPersona: 0.9, ageFits: 0.9, genderFits: 0.9, lifeFits: 0.9, selfieStyle: 0.9, looksReal: 0.9, noText: 0.9, armHidden: 0.9, lowAngle: 0.9, unflattering: 0.9, ...scores }).map(([k, v]) => [k, { type: 'noul', noul: v }])) })

describe('persona profile pictures', () => {
  test('a persona is drawn from the datasets and its prompt is built from its characteristics, in the selfie style, with no device words', () => {
    const [p] = drawPersonas(FILES, 'US', [7])
    expect(p.personaId).toBe('fullTimeEmployeeMale61')
    expect(p.characteristics).toMatchObject({ age: '61', gender: 'Male', occupation: 'Full-time Employee', whenTheyScroll: 'Afternoon', education: "Bachelor's" })
    expect(p.sources).toEqual(['doomscrolling D1', 'socialBehaviour U1', 'shortFormMemory F1'])
    expect(p.prompt).toContain('61-year-old man')
    expect(p.characteristics.background).toContain('staff room')
    expect(p.prompt).toContain(p.characteristics.background)
    expect(p.prompt).toContain('overhead ceiling light')
    expect(p.prompt).toContain('pointing up at it')
    expect(p.prompt).toContain('out of the frame: no arm')
    expect(personaPrompt(p.characteristics)).not.toMatch(/phone|iPhone|screen/i)
  })

  test('each persona in a draw gets a different background from its profession, and SubQ compares it against the others', () => {
    const backgrounds = drawPersonas(FILES, 'US', [7, 7, 7]).map((p) => p.characteristics.background)
    expect(new Set(backgrounds).size).toBe(3)
    for (const b of backgrounds) expect(BACKGROUNDS.Teacher).toContain(b)
    const req = backgroundCheckRequest({ mediaType: 'image/png', base64: 'a' }, [{ mediaType: 'image/png', base64: 'b' }, { mediaType: 'image/png', base64: 'c' }])
    expect(req.images).toHaveLength(3)
    expect(Object.keys(req.questions)).toEqual(['backgroundDistinct'])
  })

  test('a background SubQ finds too like the others is swapped for the next one from the profession before the retry', async () => {
    const [p] = drawPersonas(FILES, 'US', [7])
    const first = p.characteristics.background
    const checks = [check({ backgroundDistinct: 0.2 }), check({})]
    const prompts: string[] = []
    const deps: PictureDeps = {
      generate: async (prompt) => {
        prompts.push(prompt)
        return { task: 't', url: 'u', credits: 30 }
      },
      download: async () => new Uint8Array([1]),
      toPng: async (b) => b,
      check: async () => checks.shift()!,
      save: async () => 'x',
      log: () => {}
    }
    const out = await makeProfilePicture(p, deps)
    expect(out.matched).toBe(true)
    expect(out.backgroundsTried).toEqual([first])
    expect(out.characteristics.background).not.toBe(first)
    expect(BACKGROUNDS.Teacher).toContain(out.characteristics.background)
    expect(prompts[1]).toContain(out.characteristics.background)
  })

  test('only adults are drawn: a row under 18 is never a persona', () => {
    const files = { ...FILES, doomscrolling: [{ ...FILES.doomscrolling[0], respondent_id: 'D0', age: '14' }, ...FILES.doomscrolling] }
    for (const seed of [1, 2, 3, 4, 5, 6]) expect(drawPersonas(files, 'US', [seed])[0].characteristics.age).toBe('61')
  })

  test('SubQ is asked about image 1 only, with the persona and the style examples', () => {
    const [p] = drawPersonas(FILES, 'US', [7])
    const req = pictureCheckRequest(p, { mediaType: 'image/png', base64: 'a' }, [{ mediaType: 'image/jpeg', base64: 'b' }, { mediaType: 'image/jpeg', base64: 'c' }])
    expect(req.images).toHaveLength(3)
    expect(Object.keys(req.questions)).toEqual(['matchesPersona', 'ageFits', 'genderFits', 'lifeFits', 'selfieStyle', 'looksReal', 'noText', 'armHidden', 'lowAngle', 'unflattering'])
    expect(String((req.state as { images: string }).images)).toContain('Images 2 to 3')
  })

  test('a low check regenerates with the fix for what was low, until SubQ says it matches', async () => {
    const [p] = drawPersonas(FILES, 'US', [7])
    const checks = [check({ ageFits: 0.2 }), check({ matchesPersona: 0.65 }), check({})]
    const prompts: string[] = []
    const lines: string[] = []
    let saved = 0
    const deps: PictureDeps = {
      generate: async (prompt) => {
        prompts.push(prompt)
        return { task: `t${prompts.length}`, url: `u${prompts.length}`, credits: 30 }
      },
      download: async () => new Uint8Array([1]),
      toPng: async (b) => b,
      check: async () => checks.shift()!,
      save: async (r) => {
        saved++
        return `${r.personaId}/profilePicture.png`
      },
      log: (l) => lines.push(l)
    }
    const out = await makeProfilePicture(p, deps)
    expect(out.matched).toBe(true)
    expect(out.attempts.map((a) => a.check.failed)).toEqual([['ageFits'], ['matchesPersona'], []])
    expect(prompts[1]).toBe(retryPrompt(p, ['ageFits']))
    expect(prompts[1]).toContain('clearly look 61 years old')
    expect(prompts[2]).toBe(retryPrompt(p, ['ageFits', 'matchesPersona']))
    expect(saved).toBe(1)
    expect(out.profilePicture).toBe('fullTimeEmployeeMale61/profilePicture.png')
  })

  test('when no attempt matches, the closest is kept and the persona says it did not match', async () => {
    const [p] = drawPersonas(FILES, 'US', [7])
    const checks = [check({ ageFits: 0.1, lifeFits: 0.1 }), check({ ageFits: 0.5 })]
    let kept = ''
    const deps: PictureDeps = {
      generate: async () => ({ task: 't', url: 'u', credits: 30 }),
      download: async () => new Uint8Array([checks.length]),
      toPng: async (b) => b,
      check: async () => checks.shift()!,
      save: async (_r, png) => {
        kept = String(png[0])
        return 'x'
      },
      log: () => {}
    }
    const out = await makeProfilePicture(p, deps, 2)
    expect(out.matched).toBe(false)
    expect(kept).toBe('1')
  })
})
