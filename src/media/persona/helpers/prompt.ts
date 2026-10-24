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

export const BACKGROUNDS: Record<string, string[]> = {
  Engineer: ['at a workbench in a home garage workshop, a pegboard of tools on the wall behind them', 'in a narrow server room aisle, racks of blinking equipment behind them', 'at a standing desk in an open-plan office, big windows and other desks behind them'],
  Teacher: ['in an empty classroom after school, rows of small desks and a blank whiteboard behind them', 'in a school staff room, a kettle, mugs and a noticeboard with no writing behind them', 'at the kitchen table at home, a pile of plain exercise books beside them'],
  Marketer: ['in a bright coworking space, plants and long shared tables behind them', 'in a glass-walled meeting room, an empty table and chairs behind them', 'on the sofa of a small city apartment, cushions and a window behind them'],
  Researcher: ['in a university lab, shelves of plain glassware and a fume hood behind them', 'between tall library shelves of plain unmarked books', 'at a cluttered desk at home piled with plain printouts and an old lamp'],
  Entrepreneur: ['in the back stockroom of a small shop, plain unprinted boxes stacked behind them', 'in a corner booth of a quiet coffee shop', 'in a sparse home office, a blank whiteboard and a filing cabinet behind them'],
  Student: ['in a campus library study carrel', 'in a shared student kitchen, dirty pans and a fridge behind them', 'on the bed in a small dorm room, a bare wall and a desk behind them'],
  Freelancer: ['at a cluttered desk at home with a warm lamp and coffee mugs, a window behind them', 'at a window seat in a café', 'in a small spare-room office, a bookshelf of plain books behind them'],
  Doctor: ['in a hospital corridor under strip lights, wearing plain scrubs', 'in a small hospital staff break room, wearing plain scrubs, a coffee machine behind them', 'in a hospital locker room, wearing plain scrubs, grey lockers behind them'],
  Designer: ['in a design studio, sketches of shapes pinned on a corkboard behind them', 'in a bright loft with exposed brick and plants behind them', 'at a drafting table by a window, rolls of paper behind them'],
  Other: ['in a laundry room, a washing machine and a basket of clothes behind them', 'in a cluttered hallway at home, coats on hooks and shoes behind them', 'in the kitchen at home, cupboards and a fridge behind them'],
  Unemployed: ['slouched on the sofa at home, cushions and a lamp behind them', 'in the kitchen at home, cupboards and a fridge behind them', 'in a cluttered hallway at home, coats on hooks and shoes behind them']
}

export function backgroundOf(c: Record<string, string>, seed: number, used: Set<string>): string {
  const pool = BACKGROUNDS[c.occupation === 'Unemployed' ? 'Unemployed' : c.profession ?? ''] ?? BACKGROUNDS[c.profession === 'Student' || c.occupation === 'Student' ? 'Student' : 'Other']
  const fresh = pool.filter((b) => !used.has(b))
  const from = fresh.length ? fresh : pool
  const background = from[seed % from.length]
  used.add(background)
  return background
}

export function nextBackground(c: Record<string, string>, tried: string[]): string | null {
  const own = BACKGROUNDS[c.occupation === 'Unemployed' ? 'Unemployed' : c.profession ?? ''] ?? []
  const all = [...own, ...Object.values(BACKGROUNDS).flat()]
  return all.find((b) => !tried.includes(b)) ?? null
}

const LIGHT: Record<string, string> = {
  Morning: 'flat morning daylight from a window behind them, the window blown out to white and the face a little dark',
  Afternoon: 'a harsh overhead ceiling light that blows out to a white blob at the top of the frame',
  Evening: 'dim yellow lamp light, the picture underexposed and muddy',
  'Late Night': 'a dark room at night, the face lit only by a cold blue-white glow from below, very underexposed and grainy'
}

export const SELFIE_STYLE =
  'It is a selfie they took of themselves to use as a profile picture: the camera held a little below the face and slightly off to one side, tilted, pointing up at it, so it is seen from underneath at an angle: the jaw, neck and underside of the nose show, the head turned a little, the ceiling or upper wall is behind the head, and the top of the head is close to the edge of the frame or cut off. It is an unflattering angle and they have not tried to look good. The arm holding the camera is out of the frame: no arm, elbow or hand in the picture. They look just off the lens with a flat, neutral, unsmiling expression, not posing. Ordinary everyday clothes, nothing styled. Old front-facing camera quality: low resolution, soft focus, noise in the shadows, washed-out colours, auto exposure that blows any light or window out to white. Unflattering and unposed, nothing composed: the kind of picture an ordinary person takes without thinking about it.'

export const PERSONA_AVOID =
  'No readable text, letters, numbers, logos or brand names anywhere. No device, screen, app interface or frame drawn into the picture. No outstretched arm, elbow or hand holding the camera in the frame. No eye-level or high flattering angle. No smiling for the camera, no posing, no studio or cinematic lighting, no beauty filter, no smooth retouched skin, no model or influencer looks, no sharp detail, no shallow depth of field or bokeh, no HDR, no glossy CGI look, no extra fingers or warped hands, no distorted face.'

export function personaPrompt(c: Record<string, string>): string {
  const who = WHO[c.gender ?? ''] ?? 'person'
  const setting = c.background ?? SETTING[c.occupation ?? ''] ?? 'at home'
  const light = LIGHT[c.whenTheyScroll ?? ''] ?? LIGHT.Afternoon
  const mood = c.moodWhileScrolling ? ` They look ${c.moodWhileScrolling.toLowerCase()}.` : ''
  return `A candid photo of an ordinary ${c.age}-year-old ${who} from ${c.country ?? 'the United States'}, ${setting}. ${light[0].toUpperCase()}${light.slice(1)}.${mood} ${SELFIE_STYLE} Nothing in the picture carries readable text, letters, numbers, logos or brand names.`
}

const FIX: Record<PictureFacet, (c: Record<string, string>) => string> = {
  matchesPersona: (c) => `The person must clearly read as this ${c.age}-year-old ${(c.occupation ?? '').toLowerCase()}.`,
  ageFits: (c) => `They must clearly look ${c.age} years old, a grown adult, no younger and no older.`,
  genderFits: (c) => `They must clearly be a ${WHO[c.gender ?? ''] ?? 'person'}.`,
  lifeFits: (c) => `The place and light must clearly be ${c.background ?? SETTING[c.occupation ?? ''] ?? 'at home'}, ${(c.whenTheyScroll ?? '').toLowerCase()}.`,
  backgroundDistinct: (c) => `The place must clearly be ${c.background ?? 'somewhere of their own'}, not a plain office or a bedroom.`,
  likeReference: () => 'Take it the way the best example is taken: slightly from below and off to one side, the head turned a little, part of the head cut off by the edge, warm everyday light.',
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
