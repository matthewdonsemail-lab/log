import type { DecisionAnswer, DecisionImage, DecisionRequest, DecisionResponse } from '../../../subq/decisions/types'
import { PERSONA_OVERALL_PASS, PERSONA_PASS } from '../types'
import type { PersonaRecord, PictureCheck, PictureFacet } from '../types'
import { SELFIE_STYLE } from './prompt'

export const PICTURE_FACETS: PictureFacet[] = ['matchesPersona', 'ageFits', 'genderFits', 'lifeFits', 'selfieStyle', 'looksReal', 'noText', 'armHidden', 'lowAngle', 'unflattering', 'backgroundDistinct', 'likeReference']

export function pictureCheckRequest(record: PersonaRecord, picture: DecisionImage, examples: DecisionImage[], reference: DecisionImage | null = null): DecisionRequest {
  const c = record.characteristics
  const style = examples.length ? `Images 2${examples.length > 1 ? ` to ${examples.length + 1}` : ''} are profile selfies showing the wanted style. ` : ''
  const best = reference ? `Image ${examples.length + 2} is the best example, the one to match. ` : ''
  const likeReference: DecisionRequest['questions'] = reference
    ? { likeReference: { type: 'noul', instructions: `Is image 1 taken the same way as image ${examples.length + 2}, the best example: the angle, the framing, how natural and careless it looks?`, criteria: { true: 'Taken the same way, just as natural', false: 'Taken differently, or looks staged or odd' } } }
    : {}
  return {
    state: {
      persona: Object.entries(c).map(([k, v]) => `${k}: ${v}`).join('; '),
      wantedStyle: SELFIE_STYLE,
      images: `Image 1 is the generated profile picture for this persona. ${style}${best}Judge image 1 only.`
    },
    images: [picture, ...examples, ...(reference ? [reference] : [])],
    questions: {
      matchesPersona: { type: 'noul', instructions: 'Is the person in image 1 believable as this exact persona, in age, gender, life and setting?', criteria: { true: 'Yes, this could be that person', false: 'No, it is someone else' } },
      ageFits: { type: 'noul', instructions: `Does the person in image 1 look about ${c.age} years old?`, criteria: { true: `Looks about ${c.age}`, false: 'Clearly younger or older' } },
      genderFits: { type: 'noul', instructions: `Does the person in image 1 read as ${c.gender}?`, criteria: { true: `Reads as ${c.gender}`, false: 'Does not' } },
      lifeFits: { type: 'noul', instructions: `Do the place and light in image 1 fit a ${c.profession ?? c.occupation} who scrolls mostly in the ${c.whenTheyScroll}${c.background ? `, ${c.background}` : ''}?`, criteria: { true: 'Fits their life', false: 'Does not fit' } },
      selfieStyle: { type: 'noul', instructions: 'Is image 1 taken the same way as the wanted style: a selfie from a low angle looking up, unposed, flat expression, poor light, low quality?', criteria: { true: 'Same kind of selfie', false: 'A different kind of photo' } },
      looksReal: { type: 'noul', instructions: 'Does image 1 look like a real photo an ordinary person took, not AI-generated, stock or studio?', criteria: { true: 'Looks like a real snapshot', false: 'Looks generated, stock or studio' } },
      noText: { type: 'noul', instructions: 'Is image 1 free of readable text, logos, and any device, screen or app interface drawn into it?', criteria: { true: 'Free of them', false: 'Has text, a logo or a device in it' } },
      armHidden: { type: 'noul', instructions: 'Is the person\'s own arm, the one holding the camera, out of image 1 or under 20% of it?', criteria: { true: 'No arm, or the arm is under 20% of the picture', false: 'The arm holding the camera takes up 20% or more of the picture' } },
      lowAngle: { type: 'noul', instructions: 'In image 1, is the camera below the face pointing up at it, so the jaw and underside of the nose are seen from below?', criteria: { true: 'Taken from below, pointing up at the face', false: 'Taken from eye level or above' } },
      unflattering: { type: 'noul', instructions: 'Is image 1 an unflattering shot of the person, the way an ordinary careless selfie from below is: under the chin, nostrils, a heavy jaw, bad light, not their best side?', criteria: { true: 'Unflattering, careless', false: 'Flattering, posed or attractive' } },
      ...likeReference
    }
  }
}

export function backgroundCheckRequest(picture: DecisionImage, others: DecisionImage[]): DecisionRequest {
  return {
    state: { images: `Image 1 is a new profile picture. Images 2 to ${others.length + 1} are other people's profile pictures in the same set. Judge image 1's background against them.` },
    images: [picture, ...others],
    questions: {
      backgroundDistinct: { type: 'noul', instructions: 'Name the kind of room behind the person in each image (an office, a bedroom, a kitchen, a classroom, a library, a garage, a café and so on). Is image 1\'s kind of room different from the kind of room in every other image? Only the kind of room counts, not the lighting, the ceiling or the camera angle.', criteria: { true: 'Image 1 is a different kind of room from all of them', false: 'Image 1 is the same kind of room as one of them' } }
    }
  }
}

const noul = (a: DecisionAnswer | undefined) => (a?.type === 'noul' ? Math.round(a.noul * 100) / 100 : 1)

export function readPictureCheck(response: DecisionResponse, ...more: DecisionResponse[]): PictureCheck {
  const all = [response, ...more]
  const answer = (f: PictureFacet) => Math.min(...all.map((r) => noul(r.answers[f] as DecisionAnswer | undefined)))
  const scores = Object.fromEntries(PICTURE_FACETS.map((f) => [f, answer(f)])) as Record<PictureFacet, number>
  const failed = PICTURE_FACETS.filter((f) => scores[f] < (f === 'matchesPersona' ? PERSONA_OVERALL_PASS : PERSONA_PASS))
  return { scores, passed: failed.length === 0, failed, inputTokens: all.reduce((n, r) => n + (r.usage?.input_tokens ?? 0), 0) }
}

export const checkTotal = (check: PictureCheck) => PICTURE_FACETS.reduce((n, f) => n + check.scores[f], 0)
