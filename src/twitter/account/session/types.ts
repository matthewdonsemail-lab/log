export type TwitterLoginState = 'loggedIn' | 'loggedOut' | 'restricted' | 'unknown'

export interface TwitterGovernor {
  hour_count: number
  day_count: number
  daily_cap: number
  mutation_count: number
  cooldown_active: boolean
  cooldown_remaining_s: number
}

export type TwitterAction = 'ping' | 'follows' | 'inbox' | 'followers' | 'xchatContacts' | 'xchatUnlock' | 'reply' | 'quote' | 'like' | 'dm'

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
  limit?: number
  conversationId?: string
  force?: boolean
  chatPin?: string
  export?: boolean
}

export interface TwitterFollow {
  handle: string
  followsYou?: boolean
  youFollow?: boolean
  error?: string
  event?: TwitterEvent
}

export interface TwitterDmPerson {
  userId: string
  handle?: string | null
  name?: string | null
  followsYou?: boolean | null
  youFollow?: boolean | null
}

export interface TwitterDmThread {
  conversationId: string
  box: 'inbox' | 'request' | 'xchat'
  type: 'oneToOne' | 'group'
  name?: string | null
  with: TwitterDmPerson[]
  lastAt?: string | null
  lastFromMe: boolean
  lastText?: string | null
  unread: boolean
  messagesLoaded: number
  conversationIds?: string[]
  boxes?: TwitterDmThread['box'][]
}

export interface TwitterDmConversation {
  conversationId: string
  box: TwitterDmThread['box']
  with: TwitterDmThread['with']
  messages: TwitterDmMessage[]
}

export interface TwitterDmMessage {
  id: string
  conversationId: string
  time?: string | null
  senderId: string
  recipientId?: string | null
  text: string
  fromMe?: boolean
  from?: string | null
}

export interface TwitterFollower {
  userId: string
  handle?: string | null
  name?: string | null
  bio: string
  location: string
  followers: number
  following: number
  posts: number
  canDm: boolean
  protected: boolean
  createdAt?: string | null
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
  pages?: number
  threads?: TwitterDmThread[]
  waitingOnYou?: number
  messages?: TwitterDmMessage[]
  conversations?: TwitterDmConversation[]
  forcedPast?: string
  followers?: TwitterFollower[]
  complete?: boolean
  contacts?: string[]
}

export interface TwitterEngineRun {
  answer: TwitterSessionAnswer
  refreshed: Record<string, string> | null
}

export type TwitterGate = { ok: true } | { ok: false; code: 'accountNotTwitter' | 'accountDeactivated' | 'noTwitterSession'; detail: string }
