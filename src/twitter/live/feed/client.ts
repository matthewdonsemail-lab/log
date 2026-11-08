import type { Database } from 'bun:sqlite'
import { pushedEventId } from '../../../inbox/relay/index'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SHARED_SESSION } from '../../../agentHooks/sessionOffsets/index'
import { db, latestSeq, readCursor, writeCursor } from '../../../inbox/store/index'
import { insertEventRow } from '../../../storage/platform/index'
import { BACKFILL_BATCH, inBatches } from '../../../storage/schema/helpers/backfill'
import { twitterStateRoot } from '../../../directApi/engine/client'
import { localTime } from '../../../inbox/watch/index'
import { activityLine } from '../../dm/person/client'
import type { AccountLive, LiveEvent } from './types'

export const LIVE_FILE = 'live.jsonl'

export const LIVE_TYPES: readonly string[] = ['badge', 'notification', 'notificationsRefused', 'pollRefused']

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

export function liveEventId(account: string, event: Record<string, unknown>): string {
  return pushedEventId('twitter', account, String(event.type ?? ''), event, String(event.seenAt ?? ''))
}

export function importLiveFiles(root: string = twitterStateRoot(), handle: Database = db()): { account: string; lines: number; added: number }[] {
  if (!existsSync(root)) return []
  const out: { account: string; lines: number; added: number }[] = []
  for (const account of readdirSync(root)) {
    const path = join(root, account, LIVE_FILE)
    if (!existsSync(path)) continue
    const store = `liveFeed:${account}`
    const done = handle.prepare('SELECT state FROM imports WHERE store = ?').get(store) as { state: string } | null
    if (done?.state === 'done') continue
    const events = eventsOf(readFileSync(path, 'utf8')) as unknown as Record<string, unknown>[]
    let added = 0
    inBatches(handle, events, BACKFILL_BATCH, (batch) => {
      for (const event of batch) {
        const type = String(event.type ?? '')
        if (!LIVE_TYPES.includes(type)) continue
        const { seenAt, ...rest } = event
        const at = typeof seenAt === 'string' ? seenAt : new Date().toISOString()
        if (insertEventRow(handle, { eventId: liveEventId(account, event), platform: 'twitter', account, conversationId: '', type, with: String(rest.handle ?? ''), text: '', box: '', payload: rest, sourceAt: String(rest.at ?? ''), receivedAt: at, source: 'import' })) added++
      }
    })
    handle.prepare("INSERT INTO imports (store, state, files, rows, detail, startedAt, endedAt) VALUES (?, 'done', 1, ?, ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = 'done', rows = excluded.rows, detail = excluded.detail, endedAt = excluded.endedAt").run(store, added, path, new Date().toISOString(), new Date().toISOString())
    out.push({ account, lines: events.length, added })
  }
  return out
}

function liveEventOf(row: { type: string; payload: string; receivedAt: string }): LiveEvent {
  let payload: Record<string, unknown> = {}
  try {
    payload = JSON.parse(row.payload) as Record<string, unknown>
  } catch {}
  return { ...payload, type: row.type, seenAt: row.receivedAt } as LiveEvent
}

export function latestBadgeOf(account: string, handle: Database = db()): AccountLive['latest'] {
  const row = handle.prepare("SELECT type, payload, receivedAt FROM events WHERE platform = 'twitter' AND account = ? AND type = 'badge' ORDER BY seq DESC LIMIT 1").get(account) as { type: string; payload: string; receivedAt: string } | null
  return row ? (liveEventOf(row) as AccountLive['latest']) : null
}

export const liveReader = (session: string) => `xLive:${session}`

export function newLiveEvents(root: string = twitterStateRoot(), session: string = SHARED_SESSION, handle: Database = db()): AccountLive[] {
  importLiveFiles(root, handle)
  const reader = liveReader(session)
  const cursor = readCursor(reader)
  const firstLook = cursor === null
  const last = latestSeq()
  const rows = firstLook ? [] : (handle.prepare(`SELECT seq, account, type, payload, receivedAt FROM events WHERE platform = 'twitter' AND seq > ? AND type IN (${LIVE_TYPES.map(() => '?').join(', ')}) ORDER BY seq`).all(cursor, ...LIVE_TYPES) as { seq: number; account: string; type: string; payload: string; receivedAt: string }[])
  writeCursor(reader, last)
  const byAccount = new Map<string, LiveEvent[]>()
  for (const row of rows) byAccount.set(row.account, [...(byAccount.get(row.account) ?? []), liveEventOf(row)])
  const accounts = firstLook ? (handle.prepare("SELECT DISTINCT account FROM events WHERE platform = 'twitter' AND type = 'badge'").all() as { account: string }[]).map((r) => r.account) : [...byAccount.keys()]
  return accounts.map((account) => ({ account, events: byAccount.get(account) ?? [], latest: latestBadgeOf(account, handle), firstLook }))
}

export function badgeLine(badge: NonNullable<AccountLive['latest']>): string {
  return `${badge.ntab_unread_count ?? 0} notifications, ${badge.dm_unread_count ?? 0} DMs and ${badge.xchat_unread_count ?? 0} X Chat unread (X's own count, ${localTime(badge.seenAt)})`
}

const NETWORK_ERROR = /curl: \(\d+\)|Connection (was )?reset|timed out|Recv failure|Could not resolve/i

export function networkError(text: string): boolean {
  return NETWORK_ERROR.test(text) && !/\b429\b/.test(text)
}

export function networkOnly(event: LiveEvent): boolean {
  return event.type === 'pollRefused' && networkError(event.error ?? '')
}

export function liveEventLine(event: LiveEvent): string | null {
  if (event.type === 'notification') return `@${event.handle ?? event.userId}: ${activityLine(event)}`
  if (networkOnly(event)) return `the connection dropped on one live read at ${localTime(event.seenAt)} (a network error, not X refusing; the poll goes on): ${(event as { error?: string }).error?.slice(0, 80) ?? ''}`
  if (event.type === 'notificationsRefused' || event.type === 'pollRefused') return `X refused the live read at ${localTime(event.seenAt)}: ${event.code ?? ''} ${event.detail ?? event.error ?? ''}`.trim()
  return null
}

export const LIVE_MONITOR = 'bun scripts/inbox/followEvents.ts --platform twitter --types notification,pollRefused,notificationsRefused'

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
    if (loud.some((a) => a.events.some((e) => (e.type === 'pollRefused' && !networkOnly(e)) || e.type === 'notificationsRefused'))) lines.push("  A refused read stops the live poll on that account: tell matt X's answer and the time, nothing resumes until he says (rule 94).")
  }
  if (first.length) {
    lines.push(">>> X LIVE: each X account's unread counts right now, from X's own ViewerBadgeCounts (rule 115):")
    for (const a of first) lines.push(`  @${a.account}: ${badgeLine(a.latest!)}`)
  }
  if (options.sessionStart) lines.push(`>>> X LIVE: start a Monitor now, for the whole session, so each like, retweet, reply, quote, mention or follow wakes you the moment it lands, even while idle, and say it to matt at once: Monitor { command: ${JSON.stringify(LIVE_MONITOR)}, timeout_ms: 1800000 }, re-armed when it expires (rule 115).`)
  return lines.join('\n')
}
