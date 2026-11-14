import type { InboxMessage } from '../watch/types'

export interface PendingRead {
  reader: string
  messages: InboxMessage[]
  alerts: string[]
  text: string | null
}
