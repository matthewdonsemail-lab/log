/**
 * A flow: a Facebook procedure recorded once with `log inspect` (rule 29) and
 * then run on any account by `log flow run`, as an XState machine generated
 * from it, and as an MCP tool of its own (rule 31). The definition is built
 * from the recording, not written by hand: each step's element comes from the
 * snapshot the step acted on (role and accessible name, which outlive the
 * session's refs), and each step's confirming request comes from what the
 * step sent to Facebook (rea read every step's HAR).
 */

export type FlowAction = 'goto' | 'click' | 'fill' | 'upload' | 'signIn' | 'code' | 'solve'
  /** Warm-up steps (rule 35): their ranges are drawn on every run, so the flow never repeats itself exactly. */
  | 'scroll' | 'openAny' | 'clickAny' | 'dwell'

export interface FlowStep {
  /** `s03_clickChooseProfilePicture`: stable, camelCase. */
  id: string
  action: FlowAction
  /** goto: the URL, `{uid}` for the account's Facebook id. */
  url?: string
  /** click, fill, upload: the element as the snapshot names it. */
  role?: string
  name?: string
  /** fill, upload: a `{param}` the run supplies (`--set firstName=…`). */
  value?: string
  /** The request that confirms the step (`ProfileCometProfilePictureSetMutation`); the run waits for it. */
  expect?: string
  /** scroll, openAny, clickAny, dwell: the recorded arguments (`["4-7", "300-600"]`, `["/marketplace/item/", "2-4"]`). */
  args?: string[]
  /** What the recording saw: the step it came from, its time, its rea Evidence. */
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

/** One executed step, as the run machine records it. */
export interface FlowStepResult {
  id: string
  ok: boolean
  error?: string
  /** The page went somewhere it shouldn't (`pageProblem`): checkpointed, loginWall, pageNotReached. */
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

/** What the run machine's `act` actor is given: the step with its params filled in. */
export interface FlowActInput {
  step: FlowStep
}
