export type FlowAction = 'goto' | 'click' | 'fill' | 'upload' | 'signIn' | 'code' | 'pin' | 'solve'
  | 'setLocation'
  | 'scroll' | 'openAny' | 'clickAny' | 'dwell'
  | 'press' | 'scrollIn'

export interface AnswerCheck {
  answer: string
  sent?: string
  is?: string | number | boolean | null
  present?: boolean
  home?: 'city' | 'country' | 'uid'
  code?: import('../../errors/catalog/index').ErrorCode
}

export interface AnswerExpect {
  call: string
  says: AnswerCheck[]
  waitMs?: number
  ifSent?: boolean
}

export interface AnswerAccount {
  uid?: string | null
  homeCity?: string | null
  homeCountry?: string | null
}

export interface AnswerIssue {
  code: import('../../errors/catalog/index').ErrorCode
  text: string
}

export interface FlowStep {
  id: string
  action: FlowAction
  url?: string
  role?: string
  name?: string
  within?: string
  value?: string
  expect?: string
  answers?: AnswerExpect[]
  args?: string[]
  recorded: { step: string; ms: number | null; reaEvidenceId: string | null; requests: string[] }
}

export interface FlowParam {
  name: string
  kind: 'text' | 'file'
  description: string
}

export interface FlowDefinition {
  name: string
  summary: string
  params: FlowParam[]
  steps: FlowStep[]
  source: { runDir: string; account: string; builtAt: string }
}

export interface FlowStepResult {
  id: string
  ok: boolean
  error?: string
  issue?: import('../../errors/catalog/index').ErrorCode
  expectSeen?: boolean
  ms?: number
  folder?: string
}

export interface FlowRunOutput {
  flow: string
  result: 'done' | 'failed'
  steps: FlowStepResult[]
  failedAt: string | null
}

export interface FlowActInput {
  step: FlowStep
}
