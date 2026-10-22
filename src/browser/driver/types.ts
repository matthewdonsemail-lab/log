/**
 * The browser is a driver (rule 42, matt 2026-10-19): one account's browser session is the
 * same XState machine whichever browser runs it (AdsPower now, Camoufox kept, another later).
 * A driver only supplies the steps; the order and the gates are the machine's, so a new
 * browser can't skip the proxy gate (rule 12) or the launch self-check (rule 17).
 */

export const BROWSER_DRIVERS = ['camoufox', 'adsPower'] as const
export type BrowserDriverName = (typeof BROWSER_DRIVERS)[number]
/** An account with no `browserDriver` in Twenty keeps today's browser. */
export const DEFAULT_BROWSER_DRIVER: BrowserDriverName = 'camoufox'

/**
 * What every browser must do, the same way (rule 44). Each browser domain (`src/browser/<name>`)
 * declares its row; `bun run check:browsers` refuses a browser missing from the parity table
 * (docs/browsers.md, generated from these rows) or from python/browser/browserDriver.py's OPENERS.
 * `notBuilt` is allowed, and listed on every commit so it stays visible.
 */
export const BROWSER_CAPABILITIES = {
  headedWindow: 'A visible window you can watch, never headless (rule 11)',
  proxyGate: "The account's proxy, exit IP in its country and speed checked before the browser starts (rule 12)",
  selfCheck: 'Timezone, language, Intl and exit IP agree in a page and a worker before Facebook loads (rule 17)',
  sessionHar: 'The raw session HAR of every request (rules 19, 22)',
  stepHar: "Each inspect or flow step's own HAR, from the context's events (rule 29)",
  humanMouse: "Every cursor move is HumanMouse's measured trajectory, nothing injected (rule 32)",
  scrollMotion: 'Every scroll is scrollMotion\'s wheel trajectory',
  devicePinned: 'One fixed device per account, the same every open (rule 15)',
  localePinned: "navigator, Accept-Language and Intl in the home country's locale (rule 16)",
  sessionCarried: "The account's signed-in session carries over from one open to the next",
  sessionSaved: 'The session is saved back to Twenty (saveState)',
  inspectSession: 'log inspect, the flows, the warm-up and log facebook host run in it (python/session/inspectSession.py)',
  syncSessions: 'publishSession, connectSession and profileSession (the sync sessions) run in it',
  oneMachineAtATime: 'It refuses to open where another machine already has the account open'
} as const

export type BrowserCapability = keyof typeof BROWSER_CAPABILITIES
export type CapabilityStatus = 'built' | 'notBuilt' | 'notApplicable'
/** One browser's row of the parity table: every capability, its status and how it is met. */
export type BrowserCapabilities = Record<BrowserCapability, { status: CapabilityStatus; how: string }>

export interface BrowserSessionInput {
  driver: BrowserDriverName
  accountId: string
  accountName: string
}

/** A step that couldn't be done: a catalog code (`log errors`) and what happened. */
export interface DriverFailure {
  code: string
  detail: string
}

/** What a driver's open browser exposes: where Playwright attaches, or the driver's own handle. */
export interface BrowserEndpoint {
  /** The CDP websocket (Chromium drivers), or null when the driver drives its browser itself (Camoufox). */
  cdpUrl: string | null
  /** The driver's id for this browser (an AdsPower profile id, a Camoufox run folder). */
  handle: string
}

/** The gate's answer (rule 12): the proxy attached and its exit IP in the account's country. */
export interface GateResult {
  ok: boolean
  exitIp: string | null
  exitCountry: string | null
  failure: DriverFailure | null
}

/** Why an open browser closes (rule 35: every close has a logged reason). */
export type CloseReason = 'endOfHours' | 'shutdown' | 'checkpoint' | 'restricted' | 'accountLost' | 'crashed' | 'selfCheckFailed' | 'done'

/**
 * The steps a browser supplies. Each is a promise the machine invokes; a rejection with a
 * `DriverFailure`-shaped error ends the session in `failed` (or `refused` at the gate).
 */
export interface BrowserDriver {
  name: BrowserDriverName
  /** Make sure the account has its browser identity (an AdsPower profile, a Camoufox device) and return its handle. */
  prepare(input: BrowserSessionInput): Promise<string>
  /** Rule 12: the account's proxy checked, before anything opens. */
  gate(input: BrowserSessionInput, handle: string): Promise<GateResult>
  /** Open the browser on the checked proxy, headed. */
  start(input: BrowserSessionInput, handle: string, gate: GateResult): Promise<BrowserEndpoint>
  /** Rule 17: timezone, language, Intl and exit IP agree inside the page, before Facebook loads. */
  selfCheck(input: BrowserSessionInput, endpoint: BrowserEndpoint, gate: GateResult): Promise<{ ok: boolean; failure: DriverFailure | null }>
  /** Close it (only its own browser). */
  stop(input: BrowserSessionInput, endpoint: BrowserEndpoint): Promise<void>
}

export type BrowserSessionEvent = { type: 'CLOSE'; reason: CloseReason } | { type: 'CRASHED'; detail: string }

export interface BrowserSessionContext {
  input: BrowserSessionInput
  handle: string | null
  gate: GateResult | null
  endpoint: BrowserEndpoint | null
  failure: DriverFailure | null
  closeReason: CloseReason | null
  /** Set on entering a final state, for the output. */
  ended: BrowserSessionOutput['state'] | null
}

export interface BrowserSessionOutput {
  state: 'closed' | 'refused' | 'failed'
  closeReason: CloseReason | null
  failure: DriverFailure | null
}

/** A run's capture folder is named after its browser; runs from before 2026-10-20 used `firefox`. Every reader takes all three. */
export const CAPTURE_FOLDERS: readonly string[] = [...BROWSER_DRIVERS, 'firefox']
