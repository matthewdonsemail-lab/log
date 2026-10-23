import type { DecisionQuestion } from '../../decisions/types'
import { MAX_QUESTIONS } from '../types'
import type { StepBundle } from '../types'

export const EXCHANGE_MEANINGS: Record<string, string> = {
  supportsGoal: 'Its answer shows the goal being reached, or the account where it should be',
  contradictsGoal: 'Its answer shows something wrong for the goal or the account: another place, country, account or result than intended',
  routine: 'Background the page always does; it says nothing about the goal',
  unclear: 'It cannot be told from what is here'
}

export const STEP_MEANINGS: Record<string, string> = {
  goalReached: 'The step did what the goal asked',
  wrongResult: 'The step ran but the result is wrong for the goal or the account',
  stoppedByPlatform: 'The platform stopped the account here or asks it to do something before it can go on',
  needsMoreSteps: 'Nothing is wrong yet, but the goal needs more steps',
  nothingHappened: 'Nothing changed',
  unclear: 'It cannot be told from what is here'
}

function goalText(bundle: StepBundle): string {
  return bundle.goal ? `the goal ("${bundle.goal}")` : 'what this step was meant to do'
}

export function coreQuestions(bundle: StepBundle): Record<string, DecisionQuestion> {
  const goal = goalText(bundle)
  return {
    goalMet: { type: 'noul', instructions: `Taking this step together with every earlier step since the goal was set (earlierSteps with forGoal, and goalSoFar's count of what the platform saved), has the whole of ${goal} been reached by now? A goal that asks for a number of things (2 to 3 likes) needs that many saved in total, not one step's.`, criteria: { true: 'The internal API answers across the session show all of it reached', false: 'Not all of it yet, or it went somewhere else' } },
    fitsAccount: { type: 'noul', instructions: "Does everything in the internal API answers and on the page fit this account: its home city and country, its platform, its own profile?", criteria: { true: 'Every place, country, language, currency and account named fits it', false: 'Something names another place, country or account than this one' } },
    shouldNeverHaveComeUp: { type: 'noul', instructions: `Is anything here something that should never have come up at all for this account and ${goal}?`, criteria: { true: 'Yes: a place, country, result or screen that has nothing to do with this account or goal', false: 'No: everything here belongs to this account and goal' } },
    pageMatchesApi: { type: 'noul', instructions: 'Does what the page shows (its text and the screenshot) agree with what the internal API answered?', criteria: { true: 'They tell the same story', false: 'They disagree' } },
    causedByOurAction: { type: 'noul', instructions: 'Were the internal API answers in this step caused by our action (what we clicked, typed or opened, and when), rather than by the page on its own?', criteria: { true: 'They follow from our action, in time and in what they are about', false: 'They would have happened without it' } },
    timingNormal: { type: 'noul', instructions: 'Did every answer arrive in a normal time after our action, with nothing slow, missing or repeated oddly?', criteria: { true: 'Normal timing', false: 'Something was slow, missing or repeated' } },
    stoppedByPlatform: { type: 'noul', instructions: 'Has the platform stopped this account here, limited it, or asked it to do something before it can go on?', criteria: { true: 'Yes', false: 'No' } },
    personNeeded: { type: 'noul', instructions: 'Is this something only a person can clear (an ID, a video selfie, a code sent somewhere we cannot read)?', criteria: { true: 'Only a person can clear it', false: 'The system can carry on or fix it itself' } },
    earlierStepsExplain: { type: 'noul', instructions: 'Do the earlier steps explain what happened here (for example a wrong state the account was already in)?', criteria: { true: 'An earlier step explains it', false: 'Nothing earlier explains it' } },
    meaning: { type: 'choice', instructions: `Taking the internal API, the page, the account, the earlier steps and ${goal} together, what does this step mean?`, criteria: STEP_MEANINGS }
  }
}

export function exchangeKey(index: number): string {
  return `api${String(index).padStart(3, '0')}`
}

export function questionsOf(bundle: StepBundle): { questions: Record<string, DecisionQuestion>; exchangeKeys: Record<string, number> } {
  const questions = coreQuestions(bundle)
  const room = MAX_QUESTIONS - Object.keys(questions).length
  const goal = goalText(bundle)
  const exchangeKeys: Record<string, number> = {}
  const order = bundle.exchanges
    .map((e, i) => ({ e, i }))
    .sort((a, b) => Number(a.e.known) - Number(b.e.known) || (a.e.kind === 'document' ? -1 : 0) - (b.e.kind === 'document' ? -1 : 0))
    .slice(0, room)
  for (const { e, i } of order) {
    const key = exchangeKey(i)
    exchangeKeys[key] = i
    questions[key] = { type: 'choice', instructions: `What does exchanges[${i}], ${e.name} at +${(e.offsetMs / 1000).toFixed(2)}s (status ${e.status}), say about ${goal}?`, criteria: EXCHANGE_MEANINGS }
  }
  return { questions, exchangeKeys }
}
