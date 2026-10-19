/**
 * An inspect recording (`log inspect`, rule 29) read back as a state machine:
 * every distinct screen the steps landed on is a state, every step that moved
 * from one screen to another is a transition with the requests it made and
 * rea's Evidence. The result is mapped into the machine that will drive that
 * flow (`marketplace/connect`), so its states come from what Facebook showed,
 * not from guesses (rules 25, 29).
 */

/** One element a screen offers, from its accessibility snapshot. */
export interface ScreenElement {
  role: string
  name: string
  ref: string | null
  disabled: boolean
}

/** A distinct screen. */
export interface FlowState {
  /** camelCase from the heading (or the path): `confirmThatYoureHuman`. */
  id: string
  path: string
  heading: string | null
  elements: ScreenElement[]
  /** The first step that landed on it (`03_clickE66`). */
  firstStep: string
}

export interface FlowTransition {
  from: string
  to: string
  /** `click "Continue"`, `solve textCaptcha`, `goto /me`. */
  event: string
  step: string
  /** Facebook's own requests in the step, by name and status (`POST 200 useUFACSubmitActionMutation`). */
  requests: string[]
  /** The step's wall time, settle included. */
  ms: number | null
  reaEvidenceId: string | null
}

export interface Flow {
  runDir: string
  initial: string | null
  states: FlowState[]
  transitions: FlowTransition[]
}

/** What one recorded step folder holds, as `inspectSession.py` wrote it. */
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
