import type { NotificationKind, TwitterNotification } from '../../notification/feed/types'
import type { TwitterDmMessage, TwitterDmThread } from '../../account/session/index'
import { MIRROR_SECONDS } from './types'
import type { MirrorMessage } from './types'

const URL = /https?:\/\/\S+/g

export function personKeyOf(conversationId: string): string {
  const pair = conversationId.match(/^(\d+)[-:](\d+)$/)
  if (!pair) return conversationId
  return [pair[1], pair[2]].sort().join('-')
}

const timeOf = (m: MirrorMessage): string | null => m.time ?? m.at ?? null

const said = (text: string | null | undefined): string => (text ?? '').replace(URL, ' ').replace(/\s+/g, ' ').trim().toLowerCase()

export function isMirror(a: MirrorMessage, b: MirrorMessage, seconds = MIRROR_SECONDS): boolean {
  if (Boolean(a.fromMe) !== Boolean(b.fromMe)) return false
  if (!a.fromMe && (a.from ?? '') !== (b.from ?? '')) return false
  if (said(a.text) !== said(b.text)) return false
  const at = timeOf(a)
  const bt = timeOf(b)
  if (!at || !bt) return at === bt
  return Math.abs(Date.parse(at) - Date.parse(bt)) <= seconds * 1000
}

const myReaction = (t: Pick<TwitterDmThread, 'lastFromMe' | 'lastText'>): boolean => t.lastFromMe && /^\(reacted/.test(t.lastText ?? '')

export function mergeThreads(threads: readonly TwitterDmThread[]): TwitterDmThread[] {
  const byPerson = new Map<string, TwitterDmThread[]>()
  for (const t of threads) {
    const key = personKeyOf(t.conversationId)
    byPerson.set(key, [...(byPerson.get(key) ?? []), t])
  }
  return [...byPerson.values()]
    .map((group) => {
      const sorted = [...group].sort((x, y) => (y.lastAt ?? '').localeCompare(x.lastAt ?? ''))
      const worded = sorted.find((t) => !myReaction(t))
      const newest = worded ?? sorted[0]
      const youReactedOnly = Boolean(worded && !worded.lastFromMe && myReaction(sorted[0]))
      if (group.length === 1) return newest
      const named = newest.with.some((p) => p.handle) ? newest.with : (group.find((t) => t.with.some((p) => p.handle))?.with ?? newest.with)
      return {
        ...newest,
        ...(youReactedOnly ? { youReactedOnly } : {}),
        with: named,
        unread: group.some((t) => t.unread),
        openedByThem: newest.lastFromMe && group.some((t) => t.lastFromMe && t.openedByThem),
        messagesLoaded: group.reduce((n, t) => n + t.messagesLoaded, 0),
        conversationIds: group.map((t) => t.conversationId),
        boxes: [...new Set(group.map((t) => t.box))],
      }
    })
    .sort((x, y) => (y.lastAt ?? '').localeCompare(x.lastAt ?? ''))
}

export function dropMirrors<T extends MirrorMessage>(messages: readonly T[], seconds = MIRROR_SECONDS): T[] {
  const sorted = [...messages].sort((x, y) => (timeOf(x) ?? '').localeCompare(timeOf(y) ?? ''))
  const kept: T[] = []
  for (const m of sorted) {
    if (kept.some((k) => isMirror(k, m, seconds))) continue
    kept.push(m)
  }
  return kept
}

export function reactedOnly(thread: Pick<TwitterDmThread, 'lastFromMe' | 'lastText'>): boolean {
  return !thread.lastFromMe && /^\(reacted [^)]*\)$/.test((thread.lastText ?? '').trim())
}

export function waitingOnYou(thread: Pick<TwitterDmThread, 'lastFromMe' | 'lastText'>): boolean {
  return !thread.lastFromMe && !reactedOnly(thread)
}

export function openedNoReply(thread: Pick<TwitterDmThread, 'lastFromMe' | 'openedByThem'>): boolean {
  return thread.lastFromMe && Boolean(thread.openedByThem)
}

export function followUpDue(thread: Pick<TwitterDmThread, 'lastFromMe' | 'lastText' | 'openedByThem'>): boolean {
  return reactedOnly(thread) || openedNoReply(thread)
}

const ACTIVITY_WORDS: Record<NotificationKind, string> = { like: 'liked your post', repost: 'retweeted your post', reply: 'replied to your post', quote: 'quoted your post', follow: 'followed you', mention: 'mentioned you', other: 'did something on your account' }

const short = (text: string | null | undefined, max = 120) => {
  const one = (text ?? '').replace(/\s+/g, ' ').trim()
  return one.length > max ? `${one.slice(0, max - 1)}…` : one
}

export function activityOf(rows: readonly TwitterNotification[], who: { userId?: string | null; handle?: string | null }, since?: string | null): TwitterNotification[] {
  const handle = who.handle?.replace(/^@/, '').toLowerCase() ?? null
  const after = since ? Date.parse(since) : null
  return rows
    .filter((r) => (who.userId && r.userId === who.userId) || (handle && r.handle?.toLowerCase() === handle))
    .filter((r) => after === null || (r.at !== null && Date.parse(r.at) > after))
    .sort((a, b) => Date.parse(b.at ?? '') - Date.parse(a.at ?? ''))
}

export function activityLine(row: TwitterNotification): string {
  const said = row.text ? `: "${short(row.text)}"` : ''
  const on = row.postText ? ` ("${short(row.postText, 60)}")` : ''
  return `${row.at ?? 'unknown time'} they ${ACTIVITY_WORDS[row.kind]}${on}${said}`
}

export function contextChangesSince(messages: readonly TwitterDmMessage[], activity: readonly TwitterNotification[], since: string): string[] {
  const after = Date.parse(since)
  const said = messages
    .filter((m) => m.time && Date.parse(m.time) > after)
    .map((m) => `${m.time} ${m.fromMe ? 'you messaged them outside this draft' : 'they messaged you'}: "${short(m.text)}"`)
  return [...said, ...activity.filter((r) => r.at && Date.parse(r.at) > after).map(activityLine)]
}

export const NOT_A_MESSAGE = /^\((reacted|read|could not open|encrypted X Chat message)/

export interface StoredChat {
  conversationId: string
  box: string
  with: string[]
  messages: { at: string | null; fromMe: boolean; text: string }[]
}

export function storedThreads(chats: readonly StoredChat[]): TwitterDmThread[] {
  const byPerson = new Map<string, StoredChat[]>()
  for (const c of chats) {
    const key = c.with.length === 1 ? `@${c.with[0].toLowerCase()}` : personKeyOf(c.conversationId)
    byPerson.set(key, [...(byPerson.get(key) ?? []), c])
  }
  const out: TwitterDmThread[] = []
  for (const group of byPerson.values()) {
    const said = group.flatMap((c) => c.messages).filter((m) => m.text && !NOT_A_MESSAGE.test(m.text)).sort((a, b) => (a.at ?? '').localeCompare(b.at ?? ''))
    const last = said.at(-1)
    if (!last) continue
    const first = group[0]
    const box = (['inbox', 'request', 'xchat'] as const).find((b) => group.some((c) => c.box === b)) ?? 'inbox'
    out.push({
      conversationId: first.conversationId,
      conversationIds: group.map((c) => c.conversationId),
      box,
      type: first.with.length > 1 ? 'group' : 'oneToOne',
      with: first.with.map((handle) => ({ handle, userId: '' })),
      lastAt: last.at,
      lastFromMe: last.fromMe,
      lastText: last.text,
      unread: false,
      messagesLoaded: said.length,
    })
  }
  return out.sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''))
}
