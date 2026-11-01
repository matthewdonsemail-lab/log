import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { readSessionOffsets, SHARED_SESSION, writeSessionOffsets } from '../../../agentHooks/sessionOffsets/index'
import { twitterStateRoot } from '../../../directApi/engine/client'
import { localTime } from '../../../inbox/watch/index'
import { activityLine } from '../../dm/person/client'
import type { AccountLive, LiveEvent } from './types'

export const LIVE_FILE = 'live.jsonl'

export function eventsOf(text: string): LiveEvent[] {
  const events: LiveEvent[] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      events.push(JSON.parse(line) as LiveEvent)
    } catch {}
  }
  return events
}

export function latestBadge(path: string): AccountLive['latest'] {
  const events = eventsOf(readFileSync(path, 'utf8').slice(-20_000))
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i]!
    if (event.type === 'badge') return event
  }
  return null
}

export function newLiveEvents(root: string = twitterStateRoot(), session: string = SHARED_SESSION): AccountLive[] {
  if (!existsSync(root)) return []
  const { offsets, firstLook } = readSessionOffsets(root, session)
  const accounts: AccountLive[] = []
  for (const account of readdirSync(root)) {
    const path = join(root, account, LIVE_FILE)
    if (!existsSync(path)) continue
    const size = statSync(path).size
    const from = offsets[account] ?? (firstLook ? size : 0)
    const events = size > from ? eventsOf(readFileSync(path, 'utf8').slice(from)) : []
    offsets[account] = size
    if (events.length || firstLook) accounts.push({ account, events, latest: latestBadge(path), firstLook })
  }
  writeSessionOffsets(root, session, offsets)
  return accounts
}

export function badgeLine(badge: NonNullable<AccountLive['latest']>): string {
  return `${badge.ntab_unread_count ?? 0} notifications, ${badge.dm_unread_count ?? 0} DMs and ${badge.xchat_unread_count ?? 0} X Chat unread (X's own count, ${localTime(badge.seenAt)})`
}

export function liveEventLine(event: LiveEvent): string | null {
  if (event.type === 'notification') return `@${event.handle ?? event.userId}: ${activityLine(event)}`
  if (event.type === 'notificationsRefused' || event.type === 'pollRefused') return `X refused the live read at ${localTime(event.seenAt)}: ${event.code ?? ''} ${event.detail ?? event.error ?? ''}`.trim()
  return null
}

export const LIVE_MONITOR = `tail -n 0 -F ~/.logCli/twitter/*/live.jsonl | grep --line-buffered -E '"type": "(notification|pollRefused|notificationsRefused)"'`

const sayingOf = (a: AccountLive) => a.events.map(liveEventLine).filter((l): l is string => l !== null)

export function xLiveContext(accounts: readonly AccountLive[], options: { sessionStart?: boolean } = {}): string | null {
  const loud = accounts.filter((a) => sayingOf(a).length)
  const first = accounts.filter((a) => a.firstLook && a.latest)
  if (!loud.length && !first.length && !options.sessionStart) return null
  const lines: string[] = []
  if (loud.length) {
    lines.push(">>> X LIVE, NEW ACTIVITY: tell matt now, first thing in your reply, every line below in plain words (who did what on which post), before anything else you were doing. Read through each account's one session the way x.com does (rule 115).")
    for (const a of loud) {
      const said = sayingOf(a)
      lines.push(`  @${a.account}${a.latest ? ` (${badgeLine(a.latest)})` : ''}:`)
      for (const line of said.slice(-15)) lines.push(`    ${line}`)
      if (said.length > 15) lines.push(`    (${said.length - 15} more earlier)`)
    }
    if (loud.some((a) => a.events.some((e) => e.type === 'notification' && (e.kind === 'reply' || e.kind === 'quote' || e.kind === 'mention')))) lines.push('  A reply, quote or mention is someone talking to matt: read them (`twitterDms` { with }) and answer when it fits (rules 108, 109).')
    if (loud.some((a) => a.events.some((e) => e.type === 'pollRefused' || e.type === 'notificationsRefused'))) lines.push("  A refused read stops the live poll on that account: tell matt X's answer and the time, nothing resumes until he says (rule 94).")
  }
  if (first.length) {
    lines.push(">>> X LIVE: each X account's unread counts right now, from X's own ViewerBadgeCounts (rule 115):")
    for (const a of first) lines.push(`  @${a.account}: ${badgeLine(a.latest!)}`)
  }
  if (options.sessionStart) lines.push(`>>> X LIVE: start a Monitor now, for the whole session, so each like, retweet, reply, quote, mention or follow wakes you the moment it lands, even while idle, and say it to matt at once: Monitor { command: ${JSON.stringify(LIVE_MONITOR)}, timeout_ms: 1800000 }, re-armed when it expires (rule 115).`)
  return lines.join('\n')
}
