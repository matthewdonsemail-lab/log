export interface Who {
  userId?: string | null
  handle?: string | null
  conversationId?: string | null
}

export interface ContextMessage {
  id: string
  conversationId: string
  senderId: string
  text: string
  time: string
  fromMe: boolean
  source: string
}

export interface ChatContext {
  messages: ContextMessage[]
  activity: Record<string, unknown>[]
}
