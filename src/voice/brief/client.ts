import { existsSync, readFileSync, statSync } from 'node:fs'
import { basename, extname } from 'node:path'
import type { DecisionsClient } from '../../subq/decisions/index'
import { ATTACHED_TEXT_CHARS, BRIEF_CHECKS, BRIEF_MODEL, BRIEF_PASS } from './types'
import type { BriefCheck, BriefDraft, BriefReading } from './types'

const QUESTIONS: Record<BriefCheck, { instructions: string; criteria: { true: string; false: string } }> = {
  clear: { instructions: 'This is a task matt is handing to someone who works with him (draft), not a casual chat message. Read it as that person would, with only what is in the draft, the files attached to it (attachedFiles) and this chat (thisConversation). Is it clear exactly what they have to do, in order, with any term they may not know explained, so they could start without asking anything back?', criteria: { true: 'They could start straight away without asking what to do', false: 'They would have to ask what to do, or it leans on words they may not know' } },
  why: { instructions: 'Does the brief (draft and attachedFiles) say why this work matters: what it is for and what it leads to, so they know the point of it?', criteria: { true: 'The point of the work is said', false: 'They are told what to do but not why' } },
  doneWhen: { instructions: 'Does the brief (draft and attachedFiles) say what done looks like (what they hand back, where) and by when?', criteria: { true: 'What finished means and the deadline are both said', false: 'What to hand back or by when is missing' } },
  kind: { instructions: 'Going by howMattWrites, is the brief respectful and informative, written like matt helping someone on his team in his own casual register: warm, plain, never curt, bossy, cold or rude, and never a bare order with nothing explained?', criteria: { true: 'It reads like matt helping a teammate get it done', false: 'It reads curt, rude, bossy or like a bare order' } },
  steerable: { instructions: 'Does the brief leave them a clear way to ask, push back or say they are stuck (who to tell and when), so the work can be steered as it goes instead of going wrong in silence?', criteria: { true: 'They know how to ask or say they are stuck', false: 'Nothing says what to do when they are stuck or unsure' } },
}

const ROOM_QUESTION = { type: 'noul', instructions: 'Read theRoom: what kind of chat this is, who has spoken in it lately and who the message must be addressed to (addressTo). Does the brief speak to that audience as it really is, addressing the person the task is for?', criteria: { true: 'It speaks to the room as it is', false: 'It talks to someone who is not there, or ignores who is' } }

const FAILED_SAYS: Record<BriefCheck, string> = {
  clear: "isn't clear what to do, in order",
  why: "doesn't say why the work matters",
  doneWhen: "doesn't say what done looks like and by when",
  kind: 'reads curt, bossy or rude instead of helping',
  steerable: "doesn't say how to ask or say they're stuck",
}

export function attachedOf(paths: readonly string[]): { name: string; text: string | null }[] {
  return paths.map((path) => {
    const textual = ['.md', '.txt', '.csv', '.tsv', '.json'].includes(extname(path).toLowerCase())
    const text = textual && existsSync(path) && statSync(path).isFile() ? readFileSync(path, 'utf8').slice(0, ATTACHED_TEXT_CHARS) : null
    return { name: basename(path), text }
  })
}

export async function readBrief(draft: BriefDraft, decide: DecisionsClient): Promise<BriefReading> {
  const questions: Record<string, unknown> = Object.fromEntries(BRIEF_CHECKS.map((check) => [check, { type: 'noul', ...QUESTIONS[check] }]))
  if (draft.room) questions.fitsTheRoom = ROOM_QUESTION
  const response = await decide({
    model: BRIEF_MODEL,
    state: {
      ...(draft.howMattWrites ? { howMattWrites: draft.howMattWrites } : {}),
      recipient: draft.to,
      ...(draft.conversation?.length ? { thisConversation: draft.conversation } : {}),
      ...(draft.room ? { theRoom: draft.room } : {}),
      attachedFiles: draft.attached ?? [],
      draft: draft.text,
    },
    questions: questions as never,
  })
  const answers = response.answers as Record<string, { noul?: number }>
  const scores = Object.fromEntries(BRIEF_CHECKS.map((check) => [check, answers[check]?.noul ?? 0])) as Record<BriefCheck, number>
  const fitsTheRoom = draft.room ? answers.fitsTheRoom?.noul ?? 0 : null
  return { to: draft.to, scores, fitsTheRoom, pass: BRIEF_CHECKS.every((check) => scores[check] >= BRIEF_PASS) && (fitsTheRoom === null || fitsTheRoom >= BRIEF_PASS) }
}

export function briefFailedParts(reading: BriefReading): string[] {
  const out = BRIEF_CHECKS.filter((check) => reading.scores[check] < BRIEF_PASS).map((check) => `${FAILED_SAYS[check]} (${check} ${reading.scores[check].toFixed(2)}, needs ${BRIEF_PASS})`)
  if (reading.fitsTheRoom !== null && reading.fitsTheRoom < BRIEF_PASS) out.push(`talks to someone who isn't there (fitsTheRoom ${reading.fitsTheRoom.toFixed(2)})`)
  return out
}

export function briefLine(reading: BriefReading): string {
  return `brief gate: passed for ${reading.to} (${BRIEF_CHECKS.map((check) => `${check} ${reading.scores[check].toFixed(2)}`).join(', ')})`
}
