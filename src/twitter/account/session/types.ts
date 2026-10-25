export type TwitterLoginState = 'loggedIn' | 'loggedOut' | 'restricted' | 'unknown'

export interface TwitterGovernor {
  hour_count: number
  day_count: number
  daily_cap: number
  mutation_count: number
  cooldown_active: boolean
  cooldown_remaining_s: number
}

export type TwitterAction = 'ping' | 'follows' | 'reply' | 'quote' | 'like' | 'dm'

export const TWITTER_WRITES: readonly TwitterAction[] = ['reply', 'quote', 'like', 'dm']

export type TwitterEvent = 'sent' | 'dropped' | 'throttled' | 'dailyLimit' | 'gone' | 'automated' | 'duplicate' | 'sessionDead' | 'restricted' | 'failed'

export interface TwitterEngineSpec {
  action: TwitterAction
  live?: boolean
  approvedBy?: string
  text?: string
  tweetUrl?: string
  userId?: string
  handles?: string[]
}

export interface TwitterFollow {
  handle: string
  followsYou?: boolean
  youFollow?: boolean
  error?: string
  event?: TwitterEvent
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
  event?: TwitterEvent
  checked?: TwitterFollow[]
  tweetId?: string
  conversationId?: string
  messageId?: string
  mode?: string
  liked?: boolean
  already?: boolean
  limits?: Record<string, string>
}

export interface TwitterEngineRun {
  answer: TwitterSessionAnswer
  refreshed: Record<string, string> | null
}

export type TwitterGate = { ok: true } | { ok: false; code: 'accountNotTwitter' | 'accountDeactivated' | 'noTwitterSession'; detail: string }
