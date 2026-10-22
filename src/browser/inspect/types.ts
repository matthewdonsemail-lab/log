import type { BrowserDriverName } from '../driver/types'
/**
 * `log inspect` (rule 29): the account's browser (AdsPower or Camoufox, rule 44) kept open and driven a
 * step at a time, each step recorded and read by rea as it happens
 * (`python/session/inspectSession.py`). Commands go to the session as JSON lines in a
 * file it watches; replies come back the same way, so the session can be
 * driven from a second terminal, a script or an agent.
 */

export type InspectAction = 'goto' | 'snapshot' | 'click' | 'type' | 'press' | 'solve' | 'upload' | 'signIn' | 'code' | 'back' | 'wait' | 'stop'
  /** Messenger's PIN from Twenty (`log facebook messenger pin`) typed into the page's PIN field: never in a command or a log. */
  | 'pin'
  /** Flow steps (`log flow run`): an element by role and accessible name, not a one-session ref. */
  | 'clickRole' | 'fillRole' | 'uploadRole' | 'waitRole'
  /** The cursor circles an element (the Robotic VSL engine's highlight, rule 32): movement only, no click. */
  | 'highlight'
  /** Warm-up (rule 35): `scroll 4-7 300-600` (wheel), `openAny <hrefPattern> 2-4` (read some listings), `clickAny <role> <namePattern> 2-3` (live). */
  | 'scroll' | 'scrollIn' | 'openAny' | 'clickAny'
  /** Closes the tab a click opened (Reels' creator profile) and brings the session's tab back to the front. */
  | 'closeTab'
  /** Feed: the next unread post into view, with its heading, text and image descriptions; its Like. */
  | 'nextPost' | 'likePost' | 'postButton'
  /** `dwell 2-4`: stays on the page that long, the cursor moving (a recorded pause; `wait` is only for a page to settle). */
  | 'dwell'
  /** The host (rule 35): keep the session now, read the page's text, read and set the Marketplace location. */
  | 'saveState' | 'pageText' | 'sellLocation' | 'setLocation'

/** What `inspectSession.py` is started with (argv[1]). */
export interface InspectSessionConfig {
  accountId: string
  storageStatePath: string
  /** The account's proxy file. No browser opens without it (rule 12). */
  proxyPath: string
  devicePath: string | null
  /** The run's capture folder (`.../firefox`); steps go next to it in `steps/`. */
  captureDir: string
  commandsPath: string
  repliesPath: string
  /** The run's private login.json (rule 21) for signIn and code, or null. */
  loginPath: string | null
  /** false (`--noIdleMouse`): our cursor never drifts, for a person driving the window. */
  idleMouse?: boolean
  /** Opened as step 1, or null. */
  startUrl: string | null
  /** The account's browser (rule 44): python/browser/browserDriver.py opens it. Absent: Camoufox. */
  browser?: { driver: BrowserDriverName; profileId: string | null }
}

/** `~/.logCli/runs/inspect/current.json`: the open session `log inspect do` talks to. */
export interface CurrentInspect {
  account: string
  runDir: string
  commandsPath: string
  repliesPath: string
  startedAt: string
}

export interface InspectCommand {
  id: string
  action: InspectAction
  args: string[]
  /** The request that confirms the step (`ProfileCometProfilePictureSetMutation`): the step waits for it. */
  expect?: string
  expectMs?: number
}

/**
 * How one step records, beyond the defaults. `reaLater`: rea starts reading the
 * step's HAR at once but the reply doesn't wait for it (its reading lands in
 * the step's `rea.json`). `quietMs`/`settleMaxMs`: how long the network must be
 * quiet before the step's recording, and the cap (a reel streams video, so it
 * is never quiet). A dwell doesn't wait for quiet at all.
 */
export interface InspectStepOptions {
  reaLater?: boolean
  quietMs?: number
  settleMaxMs?: number
  /** Settled once the page's URL changed (a swipe to the next reel), up to `settleMaxMs`; no quiet wait after. */
  urlChange?: boolean
  /** The cursor rests where the step leaves it (a few pixels' tremor, no flicks) until a step without it. */
  rest?: boolean
  /** clickRole: what shows when the click isn't needed (["button", "Mute"] for Unmute); the step then passes without clicking. */
  already?: [string, string]
  /** clickRole: how long to look for the element (default 15 s): an optional prompt's button is given up on quickly. */
  findMs?: number
}

/** A feed post as `nextPost` read it: its heading (author or group), text, Facebook's image descriptions. */
export interface FeedPost {
  heading: string
  text: string
  images: string[]
  words: number
  liked: boolean
}

/** One step's reply, as `inspectSession.py` writes it. */
export interface InspectStepResult {
  ok: boolean
  error?: string
  code?: string
  detail?: string
  step?: string
  url?: string
  title?: string
  requests?: number
  notable?: string[]
  rea?: { code: number; evidenceId: string | null; records?: number }
  /** Up to 80 interactive lines: the ones new since the last step first, then the rest in page order. */
  interactive?: string[]
  /** Every interactive line on the page, and how many of them the step brought. */
  interactiveTotal?: number
  interactiveNew?: number
  folder?: string
  /** When the page landed (with `urlChange`, the new URL), in ms from the step's start. */
  landedMs?: number
  /** The step's whole time in the browser, ms (action, settle, recording). */
  ms?: number
  /** A tab the step's click opened, and its URL: it stays in front until `closeTab`. */
  openedTab?: string
  /** `nextPost`: the post brought into view (null when none was left on the page and it scrolled for more). */
  post?: FeedPost | null
  expect?: { name: string; seen: boolean }
  /** The step's cursor: humanized legs it drove (approach, circle, wander) and idle drift moves (rule 32). */
  mouse?: { legs: number; idleMoves: number }
  stopped?: boolean
  steps?: number
}

/** Runs the session process to its end; resolves with its exit code. Injected so tests never launch one. */
export type InspectSessionRunner = (config: InspectSessionConfig) => Promise<number>
