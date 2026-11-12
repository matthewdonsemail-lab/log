export const CARD_STARTED_WITH = 3
export const CARD_MATT_SAID = 5
export const CARD_LAST = 8
export const CARD_LINE_CHARS = 280
export const CARD_WINDOW = 400
export const OWN_CHAT_MESSAGES = 5

export interface CardWho {
  conversationId?: string | null
  userId?: string | null
  handle?: string | null
}

export interface CardLine {
  from: string
  fromMatt: boolean
  text: string
  at: string
}

export interface ConversationCard {
  key: string
  platform: string
  account: string
  kind: string
  with: string
  conversationIds: string[]
  messages: number
  fromMatt: number
  firstAt: string | null
  lastAt: string | null
  waitingOn: 'matt' | 'them' | null
  startedWith: CardLine[]
  theyAskedOpen: CardLine[]
  mattAskedOpen: CardLine[]
  mattSaid: CardLine[]
  last: CardLine[]
  throughSeq: number
  builtAt: string
}
