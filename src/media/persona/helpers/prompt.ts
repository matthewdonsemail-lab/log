import type { BehaviourProfile } from '../../../warmup/persona/types'
import type { PersonaRecord, PictureFacet } from '../types'

export function characteristicsOf(profile: BehaviourProfile): Record<string, string> {
  const doom = profile.rows.find((r) => r.source.startsWith('doomscrolling'))?.fields ?? {}
  const social = profile.rows.find((r) => r.source.startsWith('socialBehaviour'))?.fields ?? {}
  const out: Record<string, string> = {
    ...profile.summary,
    country: doom.country ?? profile.country,
    education: doom.education_level ?? '',
    sleepHours: doom.sleep_hours_avg ?? '',
    anxietyLevel: doom.anxiety_level ?? '',
    device: social.preferred_device ?? '',
    profession: social.profession ?? ''
  }
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined && v !== ''))
}

const camel = (words: string) =>
  words
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join('')

export function personaIdOf(characteristics: Record<string, string>, taken: Set<string>): string {
  const base = camel(`${characteristics.occupation ?? 'person'} ${characteristics.gender?.split('/')[0] ?? ''} ${characteristics.age ?? ''}`)
  let id = base
  for (let n = 2; taken.has(id); n++) id = `${base}${n}`
  taken.add(id)
  return id
}

const WHO: Record<string, string> = { Male: 'man', Female: 'woman' }

const SETTING: Record<string, string> = {
  Student: 'in their bedroom, an unmade bed and a cluttered desk behind them',
  'Full-time Employee': 'at their desk at work, plain beige office walls and a framed picture behind them',
  'Part-time Employee': 'in a plain back room at work on their break',
  'Freelancer/Self-employed': 'at a cluttered desk at home',
  Unemployed: 'slouched on the sofa at home'
}

const LIGHT: Record<string, string> = {
  Morning: 'flat morning daylight from a window behind them, the window blown out to white and the face a little dark',
  Afternoon: 'a harsh overhead ceiling light that blows out to a white blob at the top of the frame',
  Evening: 'dim yellow lamp light, the picture underexposed and muddy',
  'Late Night': 'a dark room at night, lying back on a pillow, the face lit only by a cold blue-white glow from below, very underexposed and grainy'
}

export const SELFIE_STYLE =
  'It is a selfie they took of themselves to use as a profile picture: the camera held low, below the chin, pointing up at the face, so it is seen from underneath: the chin, jaw, neck and underside of the nose show, the ceiling or upper wall is behind the head, and the top of the head is close to the edge of the frame or cut off. It is an unflattering angle and they have not tried to look good. The arm holding the camera is out of the frame: no arm, elbow or hand in the picture. They look just off the lens with a flat, neutral, unsmiling expression, not posing. Ordinary everyday clothes, nothing styled. Old front-facing camera quality: low resolution, soft focus, noise in the shadows, washed-out colours, auto exposure that blows any light or window out to white. Unflattering and unposed, nothing composed: the kind of picture an ordinary person takes without thinking about it.'

export const PERSONA_AVOID =
  'No readable text, letters, numbers, logos or brand names anywhere. No device, screen, app interface or frame drawn into the picture. No outstretched arm, elbow or hand holding the camera in the frame. No eye-level or high flattering angle. No smiling for the camera, no posing, no studio or cinematic lighting, no beauty filter, no smooth retouched skin, no model or influencer looks, no sharp detail, no shallow depth of field or bokeh, no HDR, no glossy CGI look, no extra fingers or warped hands, no distorted face.'

export function personaPrompt(c: Record<string, string>): string {
  const who = WHO[c.gender ?? ''] ?? 'person'
  const setting = SETTING[c.occupation ?? ''] ?? 'at home'
  const light = LIGHT[c.whenTheyScroll ?? ''] ?? LIGHT.Afternoon
  const mood = c.moodWhileScrolling ? ` They look ${c.moodWhileScrolling.toLowerCase()}.` : ''
  return `A candid photo of an ordinary ${c.age}-year-old ${who} from ${c.country ?? 'the United States'}, ${setting}. ${light[0].toUpperCase()}${light.slice(1)}.${mood} ${SELFIE_STYLE} Nothing in the picture carries readable text, letters, numbers, logos or brand names.`
}

const FIX: Record<PictureFacet, (c: Record<string, string>) => string> = {
  matchesPersona: (c) => `The person must clearly read as this ${c.age}-year-old ${(c.occupation ?? '').toLowerCase()}.`,
  ageFits: (c) => `They must clearly look ${c.age} years old, a grown adult, no younger and no older.`,
  genderFits: (c) => `They must clearly be a ${WHO[c.gender ?? ''] ?? 'person'}.`,
  lifeFits: (c) => `The place and light must clearly be ${SETTING[c.occupation ?? ''] ?? 'at home'}, ${(c.whenTheyScroll ?? '').toLowerCase()}.`,
  selfieStyle: () => 'It must be a low-angle selfie looking up at the face, unposed, flat expression.',
  lowAngle: () => 'The camera must be below the face pointing up at it, seen from under the chin, the ceiling behind the head.',
  unflattering: () => 'It must be unflattering: under the chin, nostrils showing, a heavy jaw, bad light, not posed or attractive.',
  armHidden: () => 'No arm, elbow or hand may show: the arm holding the camera stays completely out of the frame.',
  looksReal: () => 'It must look like a real, low-quality snapshot an ordinary person took, not a generated or studio image.',
  noText: () => 'There must be no text, logo or device anywhere in the picture.'
}

export function retryPrompt(record: PersonaRecord, failed: PictureFacet[]): string {
  if (!failed.length) return record.prompt
  return `${record.prompt} Fix from the last check: ${failed.map((f) => FIX[f](record.characteristics)).join(' ')}`
}
