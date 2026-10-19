/**
 * `log inspect` (rule 29): one Camoufox kept open for an account and driven a
 * step at a time, each step recorded and read by rea as it happens
 * (`python/inspectSession.py`). Commands go to the session as JSON lines in a
 * file it watches; replies come back the same way, so the session can be
 * driven from a second terminal, a script or an agent.
 */

export type InspectAction = 'goto' | 'snapshot' | 'click' | 'type' | 'press' | 'solve' | 'upload' | 'signIn' | 'code' | 'back' | 'wait' | 'stop'
  /** Flow steps (`log flow run`): an element by role and accessible name, not a one-session ref. */
  | 'clickRole' | 'fillRole' | 'uploadRole' | 'waitRole'
  /** The cursor circles an element (the Robotic VSL engine's highlight, rule 32): movement only, no click. */
  | 'highlight'

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
  interactive?: string[]
  folder?: string
  expect?: { name: string; seen: boolean }
  /** The step's cursor: humanized legs it drove (approach, circle, wander) and idle drift moves (rule 32). */
  mouse?: { legs: number; idleMoves: number }
  stopped?: boolean
  steps?: number
}

/** Runs the session process to its end; resolves with its exit code. Injected so tests never launch one. */
export type InspectSessionRunner = (config: InspectSessionConfig) => Promise<number>
