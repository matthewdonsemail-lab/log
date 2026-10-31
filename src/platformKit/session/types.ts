export type PlatformLoginState = 'loggedIn' | 'loggedOut' | 'restricted' | 'unknown'

export interface PlatformGovernor {
  hour_count: number
  day_count: number
  daily_cap: number
  mutation_count: number
  cooldown_active: boolean
  cooldown_remaining_s: number
}

export interface PlatformEngineSpec {
  action: string
  live?: boolean
  approvedBy?: string
  [field: string]: unknown
}

export interface PlatformAnswer {
  ok: boolean
  code?: string
  detail?: string
  event?: string
  loginState?: PlatformLoginState
  userId?: string
  screenName?: string | null
  governor?: PlatformGovernor
  [field: string]: unknown
}

export interface PlatformEngineRun {
  answer: PlatformAnswer
  refreshed: Record<string, string> | null
}

export interface PlatformShape {
  platform: string
  twentyPlatform: string
  label: string
  engine: string
  sessionCookies: readonly string[]
  sessionStorage?: { origin: string; keys: readonly string[] }
}

export type PlatformGate = { ok: true } | { ok: false; code: 'accountNotOnPlatform' | 'accountDeactivated' | 'noPlatformSession'; detail: string }
