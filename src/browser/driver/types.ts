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
