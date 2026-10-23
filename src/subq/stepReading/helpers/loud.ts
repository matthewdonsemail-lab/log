import type { DecisionAnswer } from '../../decisions/types'
import { exchangeLine, exchangeTimeline } from './exchangeLines'
import { STEP_MEANINGS } from './questions'
import type { StepAnswer, StepBundle, StepReading } from '../types'

const NOUL_SAYS: Record<string, [string, string]> = {
  goalMet: ['the goal was reached', 'the goal was NOT reached'],
  fitsAccount: ['everything fits the account', 'something does NOT fit the account (another place, country or account)'],
  shouldNeverHaveComeUp: ['something here should never have come up for this account and goal', 'nothing out of place came up'],
  pageMatchesApi: ['the page agrees with the internal API', 'the page and the internal API DISAGREE'],
  causedByOurAction: ['our action caused these answers', 'these answers did not come from our action'],
  timingNormal: ['timing was normal', 'timing was NOT normal (slow, missing or repeated)'],
  stoppedByPlatform: ['the platform stopped the account here or asks it to do something', 'the platform did not stop the account'],
  personNeeded: ['only a person can clear this', 'no person is needed'],
  earlierStepsExplain: ['an earlier step explains it', 'nothing earlier explains it']
}

const pct = (p: number) => `${Math.round(p * 100)}%`

export function answerLine(question: string, answer: DecisionAnswer): string | null {
  if (answer.type === 'noul') {
    const says = NOUL_SAYS[question]
    if (!says) return null
    return `${answer.noul >= 0.5 ? says[0] : says[1]} (${pct(answer.noul >= 0.5 ? answer.noul : 1 - answer.noul)})`
  }
  if (answer.type === 'choice' && question === 'meaning') return `meaning: ${answer.choice}: ${STEP_MEANINGS[answer.choice] ?? ''} (${pct(answer.probabilities[answer.choice] ?? answer.confidence)})`
  return null
}

export function meaningOf(answers: StepAnswer[], bundle: StepBundle, exchangeKeys: Record<string, number>): string[] {
  const lines: string[] = []
  const timeline = exchangeTimeline(bundle.exchanges)
  const meaning = answers.find((a) => a.question === 'meaning')
  if (meaning) lines.push(answerLine('meaning', meaning.answer) ?? '')
  for (const a of answers) {
    if (a.question === 'meaning' || a.question in exchangeKeys) continue
    const line = answerLine(a.question, a.answer)
    if (line) lines.push(line)
  }
  for (const a of answers) {
    if (!(a.question in exchangeKeys) || a.answer.type !== 'choice' || a.answer.choice !== 'contradictsGoal') continue
    const e = bundle.exchanges[exchangeKeys[a.question]]
    lines.push(`contradicts the goal (${pct(a.answer.probabilities.contradictsGoal ?? a.answer.confidence)}): ${timeline[exchangeKeys[a.question]] ?? exchangeLine(e, 8, 12)}`)
  }
  return lines.filter(Boolean)
}

export function loudText(reading: StepReading): string {
  const d = reading.decision
  if (d.decided) return `Known state at ${reading.step}: ${d.state} (${d.by}). No reading needed.`
  const head = `>>> UNKNOWN STATE at ${reading.step}: ${d.why.join('; ')}.`
  if (reading.error) return `${head}\n>>> SubQ could not read it: ${reading.error}. Read ${reading.folder}/exchanges.json and the screenshot yourself before going on.`
  return [`${head}`, `>>> SubQ read the step (${reading.answers.length} questions, ${reading.inputTokens} input tokens):`, ...reading.meaning.map((l) => `>>>   - ${l}`), `>>> Name this state before the flow goes on (rule 74). Everything it read: ${reading.folder}/reading.json, exchanges.json, exchanges.md`].join('\n')
}

export function timelineText(reading: StepReading): string {
  if (!reading.timeline.length) return 'Internal API in this step: none.'
  return [`Internal API in this step, what went in and what came back (${reading.timeline.length} calls, seconds from the step's first request; exchanges.md):`, ...reading.timeline.map((l) => `  ${l}`)].join('\n')
}
