export type TwitterLoginState = 'loggedIn' | 'loggedOut' | 'restricted' | 'unknown'

export interface TwitterGovernor {
  hour_count: number
  day_count: number
  daily_cap: number
  mutation_count: number
  cooldown_active: boolean
  cooldown_remaining_s: number
}

export interface TwitterSessionAnswer {
  ok: boolean
  code?: string
  detail?: string
  loginState?: TwitterLoginState
  httpStatus?: number
  userId?: string
  screenName?: string | null
  name?: string | null
  rateLimitReset?: number | null
  governor?: TwitterGovernor
}

export interface TwitterEngineRun {
  answer: TwitterSessionAnswer
  refreshed: Record<string, string> | null
}

export type TwitterGate = { ok: true } | { ok: false; code: 'accountNotTwitter' | 'accountDeactivated' | 'noTwitterSession'; detail: string }
