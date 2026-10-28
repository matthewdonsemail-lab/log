export type LoginState = 'loggedIn' | 'loggedOut' | 'checkpoint' | 'unknown' | 'shadowSuspect'

export type SessionState = LoginState | 'accountWarning'

export interface GovernorStatus {
  enabled: boolean
  hour_count: number
  hourly_cap: number
  day_count: number
  daily_cap: number
  mutation_count: number
  mutation_daily_cap: number
  soft_blocks_seen: number
  cooldown_active: boolean
  cooldown_remaining_s: number
  warmup_requests: number
}

export interface EngineAnswer<Row = unknown> {
  ok: boolean
  code?: string
  detail?: string
  loginState?: LoginState
  accountWarnings?: string[]
  governor?: GovernorStatus
  rows?: Row[]
  count?: number | null
}

export interface EngineSpec {
  surface: string
  method: string
  args: unknown[]
}

export type DirectGate = { ok: true } | { ok: false; detail: string }

export type DirectOutcome<Row> =
  | { ok: true; rows: Row[]; sessionState: SessionState; governor?: GovernorStatus }
  | { ok: false; code: string; detail: string; sessionState: SessionState | null; stop: boolean }

export type CommandEngine = 'directApiFirst' | 'directApiOnly' | 'browser' | 'none'

export interface DirectRoute {
  platform: string
  library: string
  only: boolean
  surface: string
  method: string
  when: string
  seam: string
}

export const WRITES_PER_DAY_DEFAULT = 40

export const WRITES_PER_DAY: Record<string, number> = { discord: 60 }

export function writesPerDayOf(platform: string): number {
  return WRITES_PER_DAY[platform] ?? WRITES_PER_DAY_DEFAULT
}

export interface LocalEngineState {
  account: string
  writesPerDay?: number
  sessionState: string | null
  checkedAt: string | null
  day: string | null
  today: number
  mutations: number
  cooldownSeconds: number
  softBlocks: number
}
