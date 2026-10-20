/**
 * The warm-up, by platform (rule 49): `log warmup <platform> <activity>`.
 * A warm-up is a process across many activities; each activity is a unit of
 * its own, defined here for its platform: its steps, what each step must
 * achieve, and what its recordings showed. `log warmup facebook reel` starts
 * the account's browser (a `log inspect` session, rule 29) primed with the
 * activity, runs its steps as a flow of events (each recorded, rule 22),
 * checks every step against what it should have done, and writes the outline:
 * each step passed or its issue, so the steps are fixed from the recording
 * (rule 25), never by guessing.
 *
 * The library is the warm-up and the domain is the platform (rules 2, 48);
 * Facebook's requests are documented in `docs/platforms/facebook/<domain>/`.
 */

/** The platforms a warm-up is defined for. */
export const WARMUP_PLATFORMS = ['facebook'] as const
export type WarmupPlatform = (typeof WARMUP_PLATFORMS)[number]

/** An inspect step, as the open session takes it. */
export type ActivityAction = 'goto' | 'dwell' | 'wait' | 'snapshot' | 'clickRole' | 'clickAny' | 'scrollIn' | 'scroll' | 'back' | 'openAny' | 'nextPost' | 'likePost'

/** What a step must achieve, checked against its reply (the page after it). */
export interface StepExpect {
  /** The URL after the step matches this (a RegExp source): `/reel/\d+`. */
  urlMatches?: string
  /** The URL is not the one before the step (a swipe moved on). */
  urlChanges?: boolean
  /** This element is on the page after the step. */
  shows?: { role: string; name: string }
  /** This element is gone after the step. */
  hides?: { role: string; name: string }
}

export interface ActivityStep {
  /** `swipe`, `openComments`: the step's name, what the session plan draws. */
  id: string
  action: ActivityAction
  args: string[]
  why: string
  expect?: StepExpect
  /** It clicks on the page: only with --live (rule 8's click gate in the inspect session). */
  clicks?: boolean
  /** It acts on Facebook (a like): only with --likes (rule 8). */
  likes?: boolean
  /** What the recordings showed for this step: the run, the step folder, the outcome. */
  recorded?: string
}

export interface PlatformActivity {
  platform: WarmupPlatform
  activity: string
  summary: string
  steps: ActivityStep[]
  /** What the recordings showed that is not right yet, to fix from them (rule 25). */
  knownIssues: string[]
}

/** One step's outcome in a run: done and as expected, or the issue. */
export interface StepOutcome {
  id: string
  ok: boolean
  /** The step ran but didn't do what it should (`the URL didn't change`). */
  issue?: string
  /** The step itself failed (no element, no reply). */
  error?: string
  url?: string
  folder?: string
  skipped?: string
}
