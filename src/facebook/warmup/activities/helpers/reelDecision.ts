import type { DecisionAnswer, DecisionImage, DecisionRequest, DecisionResponse } from '../../../../subq/decisions/types'
import type { PersonaPack } from '../../../../warmup/persona/types'
import type { ReelAction } from './reelOrderer'

/**
 * The reel's label: the content categories of the datasets the persona comes
 * from (rule 50). The social behaviour dataset's content types that say what
 * a reel is about (Educational, Entertainment, Memes, News; its others,
 * Photos, Stories, Videos, Reels/Shorts, are formats), and the doomscrolling
 * dataset's motivations that are content (Social Connection, Work/Research).
 */
export const REEL_LABELS: Record<string, string | null> = {
  educational: 'Teaches or explains something (Educational)',
  entertainment: 'Made to entertain: comedy, stunts, music, drama, scenery (Entertainment)',
  memes: 'A meme, a joke format, a trend (Memes)',
  news: 'News or current events (News)',
  socialConnection: "People's own lives, friends, family, relationships (Social Connection)",
  workResearch: 'Work, business, career, research (Work/Research)',
  other: null
}

/** What this run lets a reel do beyond watching and swiping (rule 8: clicks need --live, a like --likes too). */
export interface AllowedActions {
  comments: boolean
  profile: boolean
  like: boolean
}

const ACTION_TEXT: Record<ReelAction, string> = {
  like: 'Like this reel',
  openComments: "Open this reel's comments and read them",
  openProfile: "Open the creator's profile"
}

/** SubQ's read of one reel, from its frame: what it is, whether it is this persona's, and the one action they'd pick. */
export interface ReelRead {
  label: string
  labelConfidence: number
  /** The chance this is the persona's kind of content. */
  interest: number
  /** If they did one thing on it, which (or none); settles the orderer's close calls only. */
  pick: ReelAction | 'none'
  pickProbabilities: Record<string, number>
  inputTokens: number
}

/**
 * The read for one reel (rule 50): the reel's frame as it landed as the image
 * (SubQ reads what the reel is from it), the caption the page shows as text,
 * the persona (its pack, interests and profile) and the session so far as
 * state. Asked: the label, whether it is this persona's kind of content, and
 * which one action they'd take, only among those the run allows. Pure.
 */
export function reelReadRequest(
  pack: PersonaPack,
  persona: Record<string, string>,
  frame: DecisionImage,
  input: { caption: string; creator: string; sessionSoFar: string; allowed: AllowedActions }
): DecisionRequest {
  const allowed = (Object.keys(ACTION_TEXT) as ReelAction[]).filter((a) => (a === 'like' ? input.allowed.like : a === 'openComments' ? input.allowed.comments : input.allowed.profile))
  const into = pack.interests.length ? pack.interests.map((i) => REEL_LABELS[i] ?? i).join('; ') : 'their profile below'
  return {
    state: {
      persona: Object.entries(persona).map(([k, v]) => `${k}: ${v}`).join('; '),
      personaPack: JSON.stringify({ segment: pack.segment, interests: pack.interests, traits: pack.traits }),
      sessionSoFar: input.sessionSoFar,
      reel: `A Facebook reel on a desktop, the frame as it landed.${input.creator ? ` Creator: ${input.creator}.` : ''}${input.caption ? ` Caption: ${input.caption}` : ''}`
    },
    images: [frame],
    questions: {
      label: { type: 'choice', instructions: 'What is this reel about?', criteria: REEL_LABELS },
      interest: {
        type: 'noul',
        instructions: 'Is this reel the kind of content this person is into, the kind that would hold them and that they want more of?',
        criteria: { true: `It is what they are into (${into}), for their age, life and mood`, false: 'Not their kind of content: they would swipe on' }
      },
      pick: {
        type: 'choice',
        instructions: 'If this person did one thing on this reel beyond watching, which would it be?',
        criteria: { ...Object.fromEntries(allowed.map((a) => [a, ACTION_TEXT[a]])), none: 'Nothing: watch or swipe on' }
      }
    }
  }
}

const noul = (a: DecisionAnswer | undefined) => (a?.type === 'noul' ? a.noul : 0)

/** SubQ's answers → the read; a missing answer reads as not theirs, nothing picked. Pure. */
export function readReelRead(response: DecisionResponse): ReelRead {
  const label = response.answers.label as DecisionAnswer | undefined
  const pick = response.answers.pick as DecisionAnswer | undefined
  const picked = pick?.type === 'choice' && (['like', 'openComments', 'openProfile', 'none'] as string[]).includes(pick.choice) ? (pick.choice as ReelRead['pick']) : 'none'
  return {
    label: label?.type === 'choice' ? label.choice : 'other',
    labelConfidence: label?.type === 'choice' ? label.confidence : 0,
    interest: noul(response.answers.interest as DecisionAnswer | undefined),
    pick: picked,
    pickProbabilities: pick?.type === 'choice' ? pick.probabilities : {},
    inputTokens: response.usage?.input_tokens ?? 0
  }
}

/** The current reel's creator and caption, from the snapshot the reel landed on (one "see owner profile" heading, then its text). Pure. */
export function reelCaption(snapshot: string): { creator: string; caption: string } {
  const lines = snapshot.split('\n')
  const at = lines.findIndex((l) => /heading ".*, see owner profile"/.test(l))
  if (at < 0) return { creator: '', caption: '' }
  const creator = lines[at].match(/heading "(.*), see owner profile"/)?.[1] ?? ''
  const text = lines.slice(at + 1, at + 25).map((l) => l.match(/^\s*- text: (.*)$/)?.[1]).find((t) => t && t !== creator)
  return { creator, caption: (text ?? '').slice(0, 300) }
}
