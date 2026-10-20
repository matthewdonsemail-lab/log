/**
 * Answering a group's questions in its dialog (`log join group --fill`,
 * rule 45): the draft the Clack stepper saved (`joinSubmission.draft`) typed
 * and ticked into Facebook's own dialog, one step per stepper step, in the
 * account's open browser, every step recorded (rules 22, 29, 35).
 *
 * Recorded on Bethlehem in AdsPower, 2026-10-20 (run 20261019T224900):
 *   a private group after Join shows `button "Cancel Request"`, "Your
 *   membership is pending" and `button "Answer questions"`, which opens
 *   `dialog "Answer questions"`: each question's text, then its
 *   `checkbox "<option>"`s or its `textbox "<prompt>"`,
 *   `checkbox "I agree to the group rules"`, and `button "Submit" [disabled]`
 *   until it is filled (steps 16, 20).
 */
import type { ErrorCode } from '../../errors/catalog/index'
import type { GroupRef, GroupStepReply, JoinDraft, JoinOptions } from '../join/types'

/**
 * Where the application stands, kept in `joinSubmission.application`:
 *   notStarted   no draft
 *   drafting     a draft with answers missing
 *   ready        every answer given and the rules agreed: it can be filled
 *   filling      a --live fill is typing and ticking in the dialog
 *   filled       every step done in the dialog, Submit not pressed
 *   submitted    Submit pressed and the dialog closed
 *   cannotReopen the page shows no way back into the questions (not recorded yet)
 */
export const APPLICATION_STATUSES = ['notStarted', 'drafting', 'ready', 'filling', 'filled', 'submitted', 'cannotReopen'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export interface Application {
  status: ApplicationStatus
  /** Facebook's `viewer_membership_questions_answer_state`, when read (NO_ANSWER, QUESTIONNAIRE_COMPLETED). */
  answerState?: string | null
  /** The fill steps done in the dialog, by their stepper step. */
  filled: string[]
  submittedAt: string | null
  updatedAt: string
  detail: string
}

/**
 * One fill step: the stepper step it does (`question:<id>`, `agree`,
 * `submit`), the dialog element it acts on (by this session's ref, read from
 * the dialog's own snapshot), and the inspect action.
 */
export interface FillStep {
  /** The Clack stepper step it maps to: `question:2345806658994243`, `agree`, `submit`. */
  stepperStep: string
  label: string
  action: 'click' | 'type'
  ref: string
  /** `type`: the answer. */
  text?: string
}

export interface FillPlan {
  steps: FillStep[]
  /** Stepper steps the dialog had no element for (a question the page doesn't show, a type not recorded). */
  missing: string[]
  /** The dialog's Submit button, and whether it was enabled when read. */
  submit: { ref: string; enabled: boolean } | null
}

export interface GroupAnswerInput {
  account: string
  group: GroupRef
  options: JoinOptions
  draft: JoinDraft
  /** Type and tick in the dialog (rule 8). Without it the run opens the group, finds the way in and stops. */
  live: boolean
  /** Press Submit once everything is filled (only with live). */
  submit: boolean
}

export interface GroupAnswerContext extends GroupAnswerInput {
  page: GroupStepReply | null
  dialog: GroupStepReply | null
  plan: FillPlan | null
  index: number
  /** Clicks on "Answer questions" so far: a second one after the page settles, never a third. */
  reopenTries: number
  /** Facebook's answer state after Submit (`QUESTIONNAIRE_COMPLETED`), from the Submit step's HAR. */
  answerState: string | null
  filled: string[]
  application: ApplicationStatus
  problem: { code: ErrorCode; detail: string } | null
  steps: { step: string; ok: boolean; folder?: string; detail?: string }[]
}

export interface GroupAnswerOutput {
  result: 'planned' | 'filled' | 'submitted' | 'stopped'
  application: ApplicationStatus
  answerState: string | null
  plan: FillPlan | null
  filled: string[]
  problem: GroupAnswerContext['problem']
  steps: GroupAnswerContext['steps']
}
