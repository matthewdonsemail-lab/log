import type { ErrorCode } from '../../../errors/catalog/index'
import type { Application } from '../answer/types'

export const GROUP_JOIN_STATUSES = ['notMember', 'requested', 'member', 'unknown'] as const
export type GroupJoinStatus = (typeof GROUP_JOIN_STATUSES)[number]

export interface GroupRef {
  key: string
  numeric: boolean
  url: string
}

export interface GroupPage {
  gate: 'join' | 'joined' | 'pending' | 'unknown'
  button: string | null
  buttonRef: string | null
  buttonNamed: boolean
  panels: string[]
  name: string | null
  members: string | null
  groupId: string | null
  url: string
}

export interface GroupStepReply {
  ok: boolean
  error?: string
  url?: string
  title?: string
  interactive?: string[]
  snapshot?: string
  options?: JoinOptions
  folder?: string
  notable?: string[]
}

export interface GroupJoinInput {
  account: string
  group: GroupRef
  live: boolean
}

export interface GroupJoinContext extends GroupJoinInput {
  page: GroupPage | null
  after: GroupPage | null
  opened: GroupStepReply | null
  formPhase: FormPhase
  dialog: JoinDialog | null
  options: JoinOptions | null
  inference: JoinInference | null
  questions: string[]
  submittedAt: string | null
  status: GroupJoinStatus
  problem: { code: ErrorCode; detail: string } | null
  steps: { step: string; ok: boolean; folder?: string; detail?: string }[]
}

export interface GroupJoinOutput {
  account: string
  group: GroupRef
  result: 'read' | 'alreadyIn' | 'alreadyRequested' | 'joined' | 'clicked' | 'questions' | 'stopped'
  status: GroupJoinStatus
  page: GroupPage | null
  after: GroupPage | null
  problem: { code: ErrorCode; detail: string } | null
  steps: GroupJoinContext['steps']
  formPhase: FormPhase
  dialog: JoinDialog | null
  options: JoinOptions | null
  inference: JoinInference | null
  questions: string[]
  submittedAt: string | null
}

export const FORM_PHASES = ['idle', 'rendered', 'incomplete', 'submitting', 'submitted', 'abandoned'] as const
export type FormPhase = (typeof FORM_PHASES)[number]

export interface SubmissionEntry {
  at: string
  step: string
  formPhase: FormPhase
  detail: string
  folder: string | null
}

export const JOIN_QUESTION_TYPES = ['paragraph', 'checkboxes'] as const
export type JoinQuestionType = (typeof JOIN_QUESTION_TYPES)[number]

export interface JoinQuestionOption {
  id: string
  label: string
}

export interface JoinQuestion {
  id: string
  stage: 'membership' | 'participation'
  prompt: string
  type: JoinQuestionType | 'notRecorded'
  rawType: string
  options: JoinQuestionOption[]
}

export interface JoinRule {
  id: string
  title: string
  description: string
}

export const JOIN_PATHS = ['instant', 'instantRules', 'instantQuestions', 'request', 'unknown'] as const
export type JoinPath = (typeof JOIN_PATHS)[number]

export interface JoinOptions {
  path: JoinPath
  joinOperation: string | null
  viewerJoinState: string | null
  forumJoinState: string | null
  answerState: string | null
  stateSource: string | null
  questions: JoinQuestion[]
  mustAnswerToSubmit: boolean | null
  rulesAgreementRequired: boolean | null
  rules: JoinRule[]
  emailVerificationQuestion: boolean | null
  dialog: { title: string | null; headline: string | null; body: string | null; explanation: string | null } | null
  questionsQueried: boolean
  seen: string[]
}

export type JoinAnswer = string | string[]

export interface JoinDraft {
  answers: Record<string, JoinAnswer>
  rulesAgreed: boolean
  questionsHash: string
  savedAt: string
}

export interface JoinInference {
  status: GroupJoinStatus
  path: JoinPath
  posting: 'open' | 'rulesAgreement' | 'questions' | 'unknown'
  ambiguous: boolean
  inferredFrom: string[]
}

export interface JoinDialog {
  title: string
  notes: string[]
  questions: string[]
  agreements: string[]
  rules: string[]
  submitEnabled: boolean | null
}

export interface GroupJoinSubmission {
  formPhase: FormPhase
  dialogTitle: string | null
  dialogNotes: string[]
  questions: string[]
  agreements: string[]
  rules: string[]
  submitEnabled: boolean | null
  options: JoinOptions | null
  inference: JoinInference | null
  draft: JoinDraft | null
  application: Application | null
  questionsHash: string | null
  questionsScrapedAt: string | null
  draftAnswers: string[]
  answers: string[]
  answersComplete: boolean
  submittedAt: string | null
  lastActivityAt: string | null
  history: SubmissionEntry[]
}

export interface Group {
  id: string
  name: string | null
  socialAccountId: string | null
  facebookGroupId: string | null
  groupUrl: string | null
  joinStatus: GroupJoinStatus | null
  joinStatusReason: string | null
  membersLabel: string | null
  joinRequestedAt: string | null
  lastCheckedAt: string | null
  joinSubmission: GroupJoinSubmission
}
