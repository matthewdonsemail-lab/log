export const BROWSER_DRIVERS = ['camoufox', 'adsPower'] as const
export type BrowserDriverName = (typeof BROWSER_DRIVERS)[number]
export const DEFAULT_BROWSER_DRIVER: BrowserDriverName = 'camoufox'

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
export type BrowserCapabilities = Record<BrowserCapability, { status: CapabilityStatus; how: string }>

export interface BrowserSessionInput {
  driver: BrowserDriverName
  accountId: string
  accountName: string
}

export interface DriverFailure {
  code: string
  detail: string
}

export interface BrowserEndpoint {
  cdpUrl: string | null
  handle: string
}

export interface GateResult {
  ok: boolean
  exitIp: string | null
  exitCountry: string | null
  failure: DriverFailure | null
}

export type CloseReason = 'endOfHours' | 'shutdown' | 'checkpoint' | 'restricted' | 'accountLost' | 'crashed' | 'selfCheckFailed' | 'done'

export interface BrowserDriver {
  name: BrowserDriverName
  prepare(input: BrowserSessionInput): Promise<string>
  gate(input: BrowserSessionInput, handle: string): Promise<GateResult>
  start(input: BrowserSessionInput, handle: string, gate: GateResult): Promise<BrowserEndpoint>
  selfCheck(input: BrowserSessionInput, endpoint: BrowserEndpoint, gate: GateResult): Promise<{ ok: boolean; failure: DriverFailure | null }>
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
  ended: BrowserSessionOutput['state'] | null
}

export interface BrowserSessionOutput {
  state: 'closed' | 'refused' | 'failed'
  closeReason: CloseReason | null
  failure: DriverFailure | null
}

export const CAPTURE_FOLDERS: readonly string[] = [...BROWSER_DRIVERS, 'firefox']
