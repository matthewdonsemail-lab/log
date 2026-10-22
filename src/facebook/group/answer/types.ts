import type { ErrorCode } from '../../../errors/catalog/index'
import type { GroupRef, GroupStepReply, JoinDraft, JoinOptions } from '../join/types'

export const APPLICATION_STATUSES = ['notStarted', 'drafting', 'ready', 'filling', 'filled', 'submitted', 'cannotReopen'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export interface Application {
  status: ApplicationStatus
  answerState?: string | null
  filled: string[]
  submittedAt: string | null
  updatedAt: string
  detail: string
}

export interface FillStep {
  stepperStep: string
  label: string
  action: 'click' | 'type'
  ref: string
  text?: string
}

export interface FillPlan {
  steps: FillStep[]
  missing: string[]
  submit: { ref: string; enabled: boolean } | null
}

export interface GroupAnswerInput {
  account: string
  group: GroupRef
  options: JoinOptions
  draft: JoinDraft
  live: boolean
  submit: boolean
}

export interface GroupAnswerContext extends GroupAnswerInput {
  page: GroupStepReply | null
  dialog: GroupStepReply | null
  plan: FillPlan | null
  index: number
  reopenTries: number
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
