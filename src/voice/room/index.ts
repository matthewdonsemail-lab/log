import { LATELY_HOURS } from './types'
import type { Room, RoomKind, RoomMessage } from './types'

export * from './types'

export function roomOf(chat: string, kind: RoomKind, messages: readonly RoomMessage[], now: Date = new Date()): Room {
  const sorted = messages.filter((m) => !m.bot && m.at).sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  const others = sorted.filter((m) => !m.fromMe)
  const last = others[others.length - 1] ?? null
  const lately = now.getTime() - LATELY_HOURS * 3600_000
  const othersActiveLately = [...new Set(others.filter((m) => Date.parse(m.at) >= lately).map((m) => m.from))]
  let mattsInARowAtTheEnd = 0
  for (let i = sorted.length - 1; i >= 0 && sorted[i]!.fromMe; i--) mattsInARowAtTheEnd++
  const nobodyElseLately = othersActiveLately.length === 0
  const lastFromOthers = last ? { who: last.from, at: last.at, daysAgo: Math.floor((now.getTime() - Date.parse(last.at)) / 86_400_000) } : null
  const ago = lastFromOthers ? ` (the last was ${lastFromOthers.who}, ${lastFromOthers.daysAgo} day(s) ago)` : ''
  const addressTo = kind === 'dm'
    ? `the one person in this DM (${others[0]?.from ?? chat})`
    : nobodyElseLately
      ? `the ${kind === 'channel' ? 'channel' : 'group'} as a whole: nobody else has spoken here in the last ${LATELY_HOURS} hours${ago}, so it must not talk to anyone as if they were in a live conversation with matt, or answer something they did not just say`
      : `the people talking here now: ${othersActiveLately.join(', ')}`
  return { chat, kind, othersActiveLately, lastFromOthers, mattsInARowAtTheEnd, nobodyElseLately, addressTo }
}

export function roomFromRead(chat: string, kind: string, answer: { ok?: boolean; messages?: unknown }, now: Date = new Date()): Room | undefined {
  if (!answer.ok) return undefined
  const known: RoomKind = kind === 'dm' || kind === 'group' || kind === 'channel' ? kind : 'unknown'
  const messages = ((answer.messages as { from?: string; fromMe?: boolean; at?: string; bot?: boolean }[] | undefined) ?? []).map((m) => ({ from: String(m.from ?? 'someone'), fromMe: !!m.fromMe, at: String(m.at ?? ''), bot: !!m.bot }))
  return roomOf(chat, known, messages, now)
}
