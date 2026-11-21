import { createDecisionsClient, subqKey } from '../../../subq/decisions/index'
import type { DecisionAnswer, DecisionQuestion, DecisionsClient } from '../../../subq/decisions/index'
import { FACT_SLOTS, SINGLE_SLOTS } from '../../../storage/platform/types'
import type { FactSlot } from '../../../storage/platform/types'
import { overlapOf } from '../client'
import { DECIDER_SETTING, DEFAULT_DECIDER, FACT_OPS, LASTING_MIN, NO_SLOT, SLOT_MIN, SLOT_WORDS, SUBQ_DECIDER_PREFIX } from '../types'
import type { Candidate, Decision, FactDecider, FactOp, FactRow } from '../types'

const sideOf = (fromOwner: boolean): string => (fromOwner ? 'the owner' : 'them')

export function decideRequest(person: string, candidates: readonly Candidate[], current: readonly FactRow[], model?: string) {
  const state = {
    task: `Lasting facts about ${person}, kept so later replies don't forget them. A fact must be stated in the message itself; never infer one.`,
    currentFacts: current.map((f) => ({ id: f.factId, slot: f.slot, text: f.text, since: f.validFrom.slice(0, 10) })),
    messages: candidates.map((c, n) => ({ n, from: sideOf(c.fromOwner), at: c.sentAt, text: c.text, before: c.before.map((b) => `${sideOf(b.fromOwner)}: ${b.text}`), screen: { kind: c.mark.kind, people: c.mark.entities.filter((e) => e.label === 'person').map((e) => e.text) } })),
  }
  const slotCriteria: Record<string, string> = { [NO_SLOT]: 'no lasting fact: small talk, a reaction, thanks, a question, a link, or something only true right now' }
  for (const slot of FACT_SLOTS) slotCriteria[slot] = SLOT_WORDS[slot]
  const questions: Record<string, DecisionQuestion> = {}
  candidates.forEach((c, n) => {
    questions[`slot${n}`] = { type: 'choice', instructions: `Message n=${n} was written by ${sideOf(c.fromOwner)}. Which lasting fact about ${person} does that message state? promisedByOwner and owes only when the owner wrote it about himself; job, workplace, building, location and interest only when they say it about themselves.`, criteria: slotCriteria }
    questions[`lasting${n}`] = { type: 'noul', instructions: `Does message n=${n}, read with the lines before it, state something concrete that will still matter in a week: a specific commitment to do something for the other person, money owed, or a lasting fact about the writer (job, workplace, what they build, where they live, an interest)? Banter, jokes, wishes, plans with no one to hold to them, reactions and polite filler are no.` }
    questions[`op${n}`] = { type: 'choice', instructions: `Compare message n=${n} with currentFacts in the same slot. ADD when it is new, SUPERSEDE when it corrects or replaces one of them (a new job, a promise kept or taken back), NOOP when it says again what one of them already says.`, criteria: { ADD: 'a new fact', SUPERSEDE: 'replaces or corrects a current fact in that slot', NOOP: 'the same as a current fact, or nothing lasting' } }
  })
  return { ...(model ? { model } : {}), state, questions }
}

const choiceOf = (answer: DecisionAnswer | undefined): { choice: string; confidence: number } => (answer && answer.type === 'choice' ? { choice: answer.choice, confidence: answer.confidence } : { choice: NO_SLOT, confidence: 0 })

export function closestIn(text: string, facts: readonly FactRow[]): FactRow | null {
  return [...facts].map((f) => ({ f, o: overlapOf(text, f.text) })).sort((a, b) => b.o - a.o)[0]?.f ?? null
}

export async function decideBatch(person: string, candidates: readonly Candidate[], current: readonly FactRow[], decisions: DecisionsClient, model?: string): Promise<{ decisions: Decision[]; inputTokens: number }> {
  if (!candidates.length) return { decisions: [], inputTokens: 0 }
  const answer = await decisions(decideRequest(person, candidates, current, model))
  const out = candidates.map((c, n): Decision => {
    const slot = choiceOf(answer.answers[`slot${n}`])
    const held = answer.answers[`lasting${n}`]
    const lasting = held && held.type === 'noul' ? held.noul : 1
    const op = choiceOf(answer.answers[`op${n}`])
    const chosen = lasting >= LASTING_MIN && slot.choice !== NO_SLOT && slot.confidence >= SLOT_MIN && (FACT_SLOTS as readonly string[]).includes(slot.choice) ? (slot.choice as FactSlot) : null
    const fact: FactOp = (FACT_OPS as readonly string[]).includes(op.choice) ? (op.choice as FactOp) : 'ADD'
    const inSlot = chosen ? current.filter((f) => f.slot === chosen) : []
    const replaced = fact === 'SUPERSEDE' && chosen && !SINGLE_SLOTS.has(chosen) ? closestIn(c.text, inSlot) : null
    const repeatOf = fact === 'NOOP' ? closestIn(c.text, inSlot)?.factId ?? null : null
    return { messageKey: c.messageKey, slot: chosen, op: chosen ? (fact === 'SUPERSEDE' && !inSlot.length ? 'ADD' : fact) : 'NOOP', confidence: Math.min(slot.confidence, op.confidence || 1, lasting), supersedes: replaced ? [replaced.factId] : [], repeatOf }
  })
  return { decisions: out, inputTokens: answer.usage?.input_tokens ?? 0 }
}

export function factDecider(env: Record<string, string | undefined> = process.env, key: string | null = subqKey(env)): FactDecider {
  const model = env[DECIDER_SETTING]?.trim() || DEFAULT_DECIDER
  if (!model.startsWith(SUBQ_DECIDER_PREFIX)) return { ok: false, code: 'factDeciderUnavailable', problem: `${DECIDER_SETTING} names ${model}, and only SubQ models are wired as the fact decider so far` }
  if (!key) return { ok: false, code: 'factDeciderUnavailable', problem: `SUBQ_API_KEY is not set, and ${DECIDER_SETTING} names the SubQ model ${model}` }
  return { ok: true, model, decisions: createDecisionsClient(key) }
}
