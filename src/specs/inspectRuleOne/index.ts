import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const reading = 'src/subq/stepReading/client.ts'
const readingTypes = 'src/subq/stepReading/types.ts'
const goal = 'src/browser/inspect/helpers/goal.ts'
const inspect = 'src/browser/inspect/client.ts'
const cli = 'src/cli/inspect/index.ts'
const hook = 'src/agentHooks/pageState/index.ts'

export const inspectRuleOne = {
  description: 'Rule one in log inspect: read the internal API, collate an unknown step, ask SubQ, say it loudly, keep going to the goal, write P.E.E.',
  specPath: 'docs/specs/inspectRuleOne.md',
  codePaths: [
    'src/subq/stepReading/client.ts',
    'src/subq/stepReading/types.ts',
    'src/subq/stepReading/helpers/exchangesOf.ts',
    'src/subq/stepReading/helpers/collate.ts',
    'src/subq/stepReading/helpers/decide.ts',
    'src/subq/stepReading/helpers/questions.ts',
    'src/subq/stepReading/helpers/loud.ts',
    'src/browser/inspect/helpers/goal.ts',
    'src/browser/inspect/client.ts',
    'src/cli/inspect/index.ts',
    'src/agentHooks/pageState/index.ts',
  ],
  anchors: {
    'REQ-INSPECT-01': [
      { kind: 'symbol', file: 'src/subq/stepReading/helpers/exchangesOf.ts', name: 'exchangesOf' },
      { kind: 'value', file: readingTypes, name: 'EXCHANGES_FILE', equals: 'exchanges.json' },
      { kind: 'string', file: reading, includes: 'network.har' },
      { kind: 'string', file: reading, includes: 'exchanges.md' },
    ],
    'REQ-INSPECT-02': [{ kind: 'symbol', file: 'src/subq/stepReading/helpers/exchangesOf.ts', name: 'exchangesOf' }],
    'REQ-INSPECT-03': [
      { kind: 'symbol', file: 'src/subq/stepReading/helpers/decide.ts', name: 'decisionOf' },
      { kind: 'string', file: 'src/subq/stepReading/helpers/decide.ts', includes: 'pageState' },
    ],
    'REQ-INSPECT-04': [
      { kind: 'symbol', file: 'src/subq/stepReading/helpers/decide.ts', name: 'decisionOf' },
      { kind: 'string', file: 'src/subq/stepReading/helpers/decide.ts', includes: 'noChange' },
    ],
    'REQ-INSPECT-05': [
      { kind: 'symbol', file: 'src/subq/stepReading/helpers/collate.ts', name: 'bundleOf' },
      { kind: 'symbol', file: 'src/subq/stepReading/helpers/collate.ts', name: 'stateOf' },
      { kind: 'symbol', file: reading, name: 'exitOf' },
      { kind: 'symbol', file: reading, name: 'screenshotOf' },
    ],
    'REQ-INSPECT-06': [
      { kind: 'value', file: readingTypes, name: 'SUBQ_STEP_MODEL', equals: 'subq-snap-1.1' },
      { kind: 'value', file: readingTypes, name: 'MAX_QUESTIONS', equals: 128 },
    ],
    'REQ-INSPECT-07': [
      { kind: 'symbol', file: 'src/subq/stepReading/helpers/questions.ts', name: 'coreQuestions' },
      { kind: 'symbol', file: 'src/subq/stepReading/helpers/questions.ts', name: 'EXCHANGE_MEANINGS' },
    ],
    'REQ-INSPECT-08': [
      { kind: 'symbol', file: 'src/subq/stepReading/helpers/loud.ts', name: 'loudText' },
      { kind: 'symbol', file: cli, name: 'readInspectStep' },
    ],
    'REQ-INSPECT-09': [{ kind: 'symbol', file: hook, name: 'findingOf' }],
    'REQ-INSPECT-10': [
      { kind: 'symbol', file: cli, name: 'readInspectStep' },
      { kind: 'string', file: cli, includes: 'network.har' },
    ],
    'REQ-INSPECT-11': [{ kind: 'symbol', file: inspect, name: 'writeCurrentInspect' }],
    'REQ-INSPECT-12': [
      { kind: 'value', file: goal, name: 'GOAL_MET_AT', equals: 0.5 },
      { kind: 'string', file: goal, includes: 'goalMet' },
      { kind: 'symbol', file: goal, name: 'goalProgressOf' },
    ],
    'REQ-INSPECT-13': [
      { kind: 'symbol', file: hook, name: 'hookReply' },
      { kind: 'symbol', file: goal, name: 'goalLine' },
    ],
    'REQ-INSPECT-14': [{ kind: 'symbol', file: goal, name: 'goalMark' }],
    'REQ-INSPECT-15': [
      { kind: 'symbol', file: goal, name: 'wentWrong' },
      { kind: 'string', file: goal, includes: 'wrongResult' },
      { kind: 'string', file: goal, includes: 'stoppedByPlatform' },
      { kind: 'string', file: goal, includes: 'unclear' },
    ],
    'REQ-INSPECT-16': [
      { kind: 'symbol', file: goal, name: 'evidenceOf' },
      { kind: 'string', file: cli, includes: 'point' },
      { kind: 'string', file: cli, includes: 'explain' },
    ],
    'REQ-INSPECT-17': [{ kind: 'symbol', file: goal, name: 'goalLine' }],
    'REQ-INSPECT-18': [
      { kind: 'value', file: inspect, name: 'GOAL_EVENTS_FILE', equals: 'goalFindings.jsonl' },
      { kind: 'value', file: inspect, name: 'GOAL_FINDINGS_FILE', equals: 'goalFindings.md' },
      { kind: 'symbol', file: inspect, name: 'addGoalEvent' },
      { kind: 'symbol', file: goal, name: 'peeMarkdown' },
    ],
    'REQ-INSPECT-19': [
      { kind: 'value', file: goal, name: 'PERSON_AT', equals: 0.5 },
      { kind: 'string', file: goal, includes: 'personNeeded' },
    ],
  },
  rubrics: {
    'REQ-INSPECT-01': noul('Does readStep run exchangesOf on the HAR of the step folder and write the exchanges to EXCHANGES_FILE and their timeline to exchanges.md, with each exchange carrying both what was sent and the answer?'),
    'REQ-INSPECT-02': noul('Does exchangesOf set the offsetMs of each exchange to its start time minus t0, where t0 is the start time of the earliest entry in the HAR of the step?'),
    'REQ-INSPECT-03': noul('Does decisionOf return decided true whenever bundle.pageState is set, so that readStep does not call the Decisions client for that step?'),
    'REQ-INSPECT-04': noul('Does decisionOf return decided false when the step failed, when newRequests is not empty, or when an exchange has errors or a status of 400 or more, and decide noChange only when the step was ok with no exchanges and none of those reasons?'),
    'REQ-INSPECT-05': noul('Does the readStep call to the Decisions client pass an images array holding the screenshot, together with a state built from the bundle that carries the goal, the account with its proxy exit, what we did (the action, args, mouse and ms), every exchange, the page text and the earlier steps?'),
    'REQ-INSPECT-06': noul('Does readStep make one Decisions call per undecided step with SUBQ_STEP_MODEL as the model, and does questionsOf never return more questions than MAX_QUESTIONS?'),
    'REQ-INSPECT-07': noul('Do coreQuestions ask goalMet, fitsAccount, shouldNeverHaveComeUp, pageMatchesApi and causedByOurAction, and does questionsOf add one choice question per exchange asking what it says about the goal, rather than asking what to do next?'),
    'REQ-INSPECT-08': noul('Does loudText start an undecided reading with the text ">>> UNKNOWN STATE", and does readInspectStep put loudText first in its text, with the inspect do result printing that text before the rest of the step result?'),
    'REQ-INSPECT-09': noul('Does findingOf in the page-state hook return a line carrying the reading text when at.reading is set and not decided and no page state matches?'),
    'REQ-INSPECT-10': noul('Does the inspect read subcommand call readInspectStep on the given step folder, refusing a folder with no network.har?'),
    'REQ-INSPECT-11': noul('Does inspect start save the --goal flag into the session, and does inspect goal --set write the new goal into the session with writeCurrentInspect?'),
    'REQ-INSPECT-12': noul('Does goalProgressOf set status to reached when the goalMet noul answer of a reading is greater than or equal to GOAL_MET_AT?'),
    'REQ-INSPECT-13': noul('On the Stop event, does hookReply return decision block while goalLine says the goal is open, with a line saying to keep going with the next inspect step?'),
    'REQ-INSPECT-14': noul('After a PostToolUse event, does hookReply include a goal line only when its goalMark differs from the one saved in memory.seen, while on SessionStart and UserPromptSubmit it always includes it?'),
    'REQ-INSPECT-15': noul('Does wentWrong return true for an undecided reading whose meaning is in WENT_WRONG, or whose SubQ call failed, and does goalLine then return blocks true asking for the finding of that step?'),
    'REQ-INSPECT-16': noul('Does the inspect finding subcommand refuse a finding without both --point and --explain, and take the evidence from evidenceOf on the reading of the step plus any --evidence given?'),
    'REQ-INSPECT-17': noul('When the goal status is reached and some findings have no fix, does goalLine return blocks true asking for the fix of each unfixed finding?'),
    'REQ-INSPECT-18': noul('Does addGoalEvent append each finding or fix to GOAL_EVENTS_FILE and rewrite GOAL_FINDINGS_FILE with peeMarkdown, and does inspect goal print peeMarkdown?'),
    'REQ-INSPECT-19': noul('When the personNeeded answer of the latest reading is at least PERSON_AT, does goalLine return blocks false with a line saying to stop the account and tell matt?'),
    'REQ-INSPECT-20': noul('On the Stop event, when stopHookActive is true and memory.stopBlocked equals the current marks, does hookReply return no output so the turn can end?'),
    unspecifiedBehavior: noul('Does the inspect reading or the goal hook decide a step, reach a goal or release the turn by a route the specification does not describe, such as deciding on a timer or the page loading alone?'),
  },
  assertions: {
    'REQ-INSPECT-01': MET,
    'REQ-INSPECT-02': MET,
    'REQ-INSPECT-03': MET,
    'REQ-INSPECT-04': MET,
    'REQ-INSPECT-05': MET,
    'REQ-INSPECT-06': MET,
    'REQ-INSPECT-07': MET,
    'REQ-INSPECT-08': MET,
    'REQ-INSPECT-09': MET,
    'REQ-INSPECT-10': MET,
    'REQ-INSPECT-11': MET,
    'REQ-INSPECT-12': MET,
    'REQ-INSPECT-13': MET,
    'REQ-INSPECT-14': MET,
    'REQ-INSPECT-15': MET,
    'REQ-INSPECT-16': MET,
    'REQ-INSPECT-17': MET,
    'REQ-INSPECT-18': MET,
    'REQ-INSPECT-19': MET,
    'REQ-INSPECT-20': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
