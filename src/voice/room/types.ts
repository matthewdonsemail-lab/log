export type RoomKind = 'dm' | 'group' | 'channel' | 'unknown'

export interface RoomMessage {
  from: string
  fromMe: boolean
  at: string
  bot?: boolean
}

export interface Room {
  chat: string
  kind: RoomKind
  othersActiveLately: string[]
  lastFromOthers: { who: string; at: string; daysAgo: number } | null
  mattsInARowAtTheEnd: number
  nobodyElseLately: boolean
  addressTo: string
}

export const LATELY_HOURS = 24
