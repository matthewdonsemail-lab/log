export type FlowAction = 'goto' | 'click' | 'fill' | 'upload' | 'signIn' | 'code' | 'pin' | 'solve'
  | 'setLocation'
  | 'scroll' | 'openAny' | 'clickAny' | 'dwell'
  | 'press' | 'scrollIn'

export interface FlowStep {
  id: string
  action: FlowAction
  url?: string
  role?: string
  name?: string
  value?: string
  expect?: string
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
