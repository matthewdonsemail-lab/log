import type { TwitterDmThread } from '../../account/session/index'
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

export function mergeThreads(threads: readonly TwitterDmThread[]): TwitterDmThread[] {
  const byPerson = new Map<string, TwitterDmThread[]>()
  for (const t of threads) {
    const key = personKeyOf(t.conversationId)
    byPerson.set(key, [...(byPerson.get(key) ?? []), t])
  }
  return [...byPerson.values()]
    .map((group) => {
      const newest = [...group].sort((x, y) => (y.lastAt ?? '').localeCompare(x.lastAt ?? ''))[0]
      if (group.length === 1) return newest
      return {
        ...newest,
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
