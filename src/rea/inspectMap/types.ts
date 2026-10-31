export interface ScreenElement {
  role: string
  name: string
  ref: string | null
  disabled: boolean
}

export interface FlowState {
  id: string
  path: string
  heading: string | null
  elements: ScreenElement[]
  firstStep: string
}

export interface FlowTransition {
  from: string
  to: string
  event: string
  step: string
  requests: string[]
  ms: number | null
  reaEvidenceId: string | null
}

export interface Flow {
  runDir: string
  initial: string | null
  states: FlowState[]
  transitions: FlowTransition[]
}

export interface RecordedStep {
  name: string
  action: string
  args: string[]
  url: string
  snapshot: string
  requests: string[]
  ms: number | null
  reaEvidenceId: string | null
}
