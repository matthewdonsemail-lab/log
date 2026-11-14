import { sweepUntyped } from '../../storage/schema/helpers/backfill'
import { createConnection, createServer } from 'node:net'
import type { AddressInfo, Socket } from 'node:net'
import { createHash, randomBytes } from 'node:crypto'
import { hostname } from 'node:os'
import { addAlert, claimWatcher, killTree, processAlive, processStartedAt, releaseWatcher, sameProcess, watchHolder } from '../watch/index'
import { appendEvent, asOwner, behindOf, db, lastEventAt, markGap, markStage, openGap, OwnerFencedError } from '../store/index'
import { CHAT_ACCESS_REFUSAL, HEARTBEAT_MS, HEARTBEAT_RETRIES, HEARTBEAT_RETRY_MS, MAX_BUFFERED_BYTES, NETWORK_FAILURE, OWN_FAILURE, PLATFORM_REFUSAL, STALE_CONFIRM_MS, STALE_MS } from './types'
import type { AttachResult, CatchUp, Relay, RelaySession, RelayStatus } from './types'
import { recordWatcherEnd, startAccountWatcher, watchEndOf } from '../../platformKit/watcher/client.ts'
import type { WatcherEnd, WatcherEvent, WatcherState } from '../../platformKit/watcher/types.ts'

export function readSession(platform: string, account: string): RelaySession | null {
  const row = db().prepare('SELECT * FROM owners WHERE platform = ? AND account = ?').get(platform, account) as (Omit<RelaySession, 'lastHeartbeat'> & { heartbeat: string }) | null
  if (!row || !row.port) return null
  const { heartbeat, ...rest } = row
  return { ...rest, lastHeartbeat: heartbeat, status: rest.status as RelayStatus }
}

export function sessionLive(session: RelaySession | null, now: number = Date.now(), alive: (pid: number) => boolean = processAlive): boolean {
  return !!session && alive(session.pid) && now - Date.parse(session.lastHeartbeat) < STALE_MS
}

export async function openRelay(platform: string, account: string, now: () => Date = () => new Date()): Promise<Relay> {
  const token = randomBytes(24).toString('base64url')
  const clients = new Set<Socket>()
  const startedAt = now().toISOString()
  let status: RelayStatus = 'starting'
  let port = 0
  db().prepare('INSERT OR IGNORE INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(platform, account, process.pid, hostname(), startedAt, startedAt, status)
  const record = (tries = 0) => {
    try {
      db().prepare('UPDATE owners SET heartbeat = ?, status = ?, port = ?, token = ?, subscribers = ?, staleSeenAt = NULL WHERE platform = ? AND account = ? AND pid = ?').run(now().toISOString(), status, port, token, clients.size, platform, account, process.pid)
    } catch (error) {
      if (tries < HEARTBEAT_RETRIES && /SQLITE_BUSY|database is locked/i.test(String((error as { code?: string; message?: string }).code ?? (error as Error).message))) setTimeout(() => record(tries + 1), HEARTBEAT_RETRY_MS).unref?.()
    }
  }
  const server = createServer((socket) => {
    let heard = ''
    let joined = false
    socket.setEncoding('utf8')
    socket.on('data', (chunk: string) => {
      if (joined) return
      heard += chunk
      const end = heard.indexOf('\n')
      if (end < 0) return
      if (heard.slice(0, end).trim() !== token) {
        socket.destroy()
        return
      }
      joined = true
      clients.add(socket)
      socket.write(JSON.stringify({ type: 'relayJoined', platform, account, status, subscribers: clients.size }) + '\n')
      record()
    })
    socket.on('close', () => {
      if (clients.delete(socket)) record()
    })
    socket.on('error', () => clients.delete(socket))
  })
  await new Promise<void>((done, failed) => {
    server.once('error', failed)
    server.listen(0, '127.0.0.1', () => done())
  })
  port = (server.address() as AddressInfo).port
  record()
  const beat = setInterval(record, HEARTBEAT_MS)
  beat.unref?.()
  return {
    port,
    broadcast: (event) => {
      const line = JSON.stringify(event) + '\n'
      for (const client of clients) {
        if (client.writableLength > MAX_BUFFERED_BYTES) {
          clients.delete(client)
          client.destroy()
          record()
          continue
        }
        client.write(line)
      }
    },
    setStatus: (next) => {
      if (next === status) return
      status = next
      record()
    },
    subscribers: () => clients.size,
    close: async () => {
      clearInterval(beat)
      for (const client of clients) client.end()
      await new Promise<void>((done) => server.close(() => done()))
      db().prepare("UPDATE owners SET port = 0, token = '', subscribers = 0, status = 'error' WHERE platform = ? AND account = ? AND pid = ?").run(platform, account, process.pid)
    },
  }
}

export function attachRelay(session: RelaySession, onEvent: (event: Record<string, unknown>) => void, seconds?: number): Promise<AttachResult> {
  return new Promise((done) => {
    let events = 0
    let heard = ''
    let finished = false
    const finish = (ok: boolean, reason: string) => {
      if (finished) return
      finished = true
      if (timer) clearTimeout(timer)
      socket.destroy()
      done({ ok, reason, events })
    }
    const socket = createConnection({ host: '127.0.0.1', port: session.port }, () => socket.write(session.token + '\n'))
    socket.setEncoding('utf8')
    socket.on('data', (chunk: string) => {
      heard += chunk
      let end = heard.indexOf('\n')
      while (end >= 0) {
        const line = heard.slice(0, end).trim()
        heard = heard.slice(end + 1)
        end = heard.indexOf('\n')
        if (!line) continue
        try {
          const event = JSON.parse(line) as Record<string, unknown>
          if (event.type !== 'relayJoined') events++
          onEvent(event)
        } catch {}
      }
    })
    socket.on('close', () => finish(true, 'the owner closed the stream'))
    socket.on('error', (error) => finish(false, `couldn't reach the owner's relay on port ${session.port}: ${error.message}`))
    const timer = seconds ? setTimeout(() => finish(true, `stopped after ${seconds} s`), seconds * 1000) : null
  })
}

export const RECHECK_GAP_MS = 30_000

export type OwnOrAttach<R> = { owner: true; result: R } | { owner: false; attached: AttachResult } | { owner: false; refused: string }

export type OwnOrAttachOptions<R> = { inbox: boolean; seconds?: number; run: (emit: (event: Record<string, unknown>) => void) => Promise<R>; onAttached: (event: Record<string, unknown>) => void; catchUp?: CatchUp; log?: (line: string) => void; decode?: (event: Record<string, unknown>) => WatcherEvent | null; endOf?: (result: R) => { end: WatcherEnd; code: string | null }; onState?: (state: WatcherState) => void }

export function socketEventOf(event: Record<string, unknown>): WatcherEvent | null {
  const change = socketChange(event)
  if (change === 'dropped') return { type: 'dropped' }
  if (change === 'open') return { type: 'opened' }
  return { type: 'heard' }
}

export function needsCatchUp(platform: string, account: string): boolean {
  const gap = behindOf(platform, account)
  return !!gap && (gap.status !== 'refused' || notThePlatform(gap.detail))
}

export async function ownOrAttach<R>(platform: string, account: string, options: OwnOrAttachOptions<R>): Promise<OwnOrAttach<R>> {
  let relay: Relay | null = null
  let current: WatcherState = 'starting'
  let fenced = false
  let recheck: ReturnType<typeof setInterval> | null = null
  const catching = catchUpRunner(platform, account, options.catchUp, options.log)
  const catchUpAsOwner = () => asOwner(platform, account, () => catching.run()).catch((error: unknown) => {
    if (!(error instanceof OwnerFencedError)) throw error
    fenced = true
  })
  const decode = options.decode ?? socketEventOf
  const watcher = startAccountWatcher<R>(
    {
      claim: () => claimWatcher(platform, account),
      connect: async () => {
        relay = await openRelay(platform, account)
        relay.setStatus(current)
        recheck = setInterval(() => {
          watcher.send({ type: 'recheck' })
          try {
            sweepUntyped(db())
          } catch {}
        }, RECHECK_GAP_MS)
        return options.run(ownerEmit)
      },
      catchUp: () => catchUpAsOwner(),
      release: async (end, code) => {
        if (recheck) clearInterval(recheck)
        await catching.settled()
        const open = relay
        relay = null
        if (open) await open.close()
        releaseWatcher(platform, account)
        recordWatcherEnd(platform, account, end, code)
      },
      endOf: options.endOf ?? watchEndOf,
      behind: () => needsCatchUp(platform, account),
    },
    {
      onState: (state) => {
        current = state
        relay?.setStatus(state)
        options.onState?.(state)
      },
    },
  )
  const ran = await watcher.done
  if (ran.state === 'busy') {
    const holder = ran.holder ?? 0
    if (options.inbox) return { owner: false, refused: `>>> ONE PROCESS PER ACCOUNT: pid ${holder} already owns ${account}'s ${platform} connection and writes its inbox, so this one stopped before opening anything` }
    const session = readSession(platform, account)
    if (!session || !sessionLive(session) || session.pid !== holder) return { owner: false, refused: `pid ${holder} owns ${account}'s ${platform} connection but has no live relay to attach to (it runs code from before the relay); what it pushes reaches you through the inbox, ~/.logCli/inbox/pending.jsonl` }
    return { owner: false, attached: await attachRelay(session, options.onAttached, options.seconds) }
  }
  if (ran.error !== undefined) throw ran.error
  return { owner: true, result: ran.result as R }

  function ownerEmit(event: Record<string, unknown>): void {
    if (fenced) return
    try {
      asOwner(platform, account, () => stored(event))
    } catch (error) {
      if (!(error instanceof OwnerFencedError)) throw error
      fenced = true
      addAlert({ platform, account, kind: 'ownerFenced', detail: error.message })
      options.log?.(`${platform} ${account}: ${error.message}; it writes nothing more`)
    }
    const change = decode(event)
    if (change) watcher.send(change)
  }

  function stored(event: Record<string, unknown>): void {
    if (!relay) return
    if (socketChange(event) === 'dropped') openGap(platform, account, lastEventAt(platform, account) ?? new Date().toISOString(), 'socketDropped')
    const type = pushedTypeOf(event)
    const kept = type === 'message' ? null : appendEvent({ platform, account, with: String(event.handle ?? event.from ?? ''), conversationId: String(event.conversationId ?? event.channelId ?? event.channel ?? event.thread ?? ''), type, payload: event, sourceAt: String(event.at ?? event.time ?? ''), eventId: pushedEventId(platform, account, type, event, new Date().toISOString()) })
    relay.broadcast(kept ? { ...event, seq: kept.seq } : event)
    if (kept) markStage(kept.eventId, 'relayed')
  }
}

export function replaceHungOwners(platform: string, accounts: readonly string[], now: number = Date.now(), alive: (pid: number) => boolean = processAlive, kill: (pid: number) => void = killTree, startedOf: (pid: number) => string | null = processStartedAt): string[] {
  const replaced: string[] = []
  for (const account of accounts) {
    const session = readSession(platform, account)
    const holder = watchHolder(platform, account, alive)
    if (!session || !holder || session.pid !== holder) continue
    const quiet = now - Date.parse(session.lastHeartbeat)
    if (quiet < STALE_MS) continue
    const row = db().prepare('SELECT staleSeenAt, pidStartedAt FROM owners WHERE platform = ? AND account = ? AND pid = ?').get(platform, account, holder) as { staleSeenAt: string | null; pidStartedAt: string | null } | null
    if (!row?.staleSeenAt) {
      db().prepare('UPDATE owners SET staleSeenAt = ? WHERE platform = ? AND account = ? AND pid = ?').run(new Date(now).toISOString(), platform, account, holder)
      continue
    }
    if (now - Date.parse(row.staleSeenAt) < STALE_CONFIRM_MS) continue
    db().prepare('DELETE FROM owners WHERE platform = ? AND account = ? AND pid = ?').run(platform, account, holder)
    if (!sameProcess(row.pidStartedAt, startedOf(holder))) {
      addAlert({ platform, account, kind: 'ownerPidReused', detail: `the ${platform} owner (pid ${holder}) is gone and its pid now belongs to another process, so nothing was killed and the next start becomes the one owner` })
      replaced.push(account)
      continue
    }
    kill(holder)
    addAlert({ platform, account, kind: 'hungOwner', detail: `the ${platform} owner (pid ${holder}) sent no heartbeat for ${Math.round(quiet / 1000)} s, two readings apart, so it was stopped and the next start becomes the one owner` })
    replaced.push(account)
  }
  return replaced
}

export const TIMED_TYPES: readonly string[] = ['badge']

export function pushedEventId(platform: string, account: string, type: string, event: Record<string, unknown>, at: string): string {
  const { seenAt: _seen, ...rest } = event
  return createHash('sha1').update(`${platform}|${account}|${type}|${JSON.stringify(rest)}${TIMED_TYPES.includes(type) ? `|${at}` : ''}`).digest('hex').slice(0, 12)
}

export function pushedTypeOf(event: Record<string, unknown>): string {
  const named = event.type ?? event.kind
  if (named) return String(named)
  return typeof event.text === 'string' && (event.conversationId || event.channelId || event.thread) ? 'message' : 'unknown'
}

export function socketChange(event: Record<string, unknown>): 'dropped' | 'open' | null {
  const kind = String(event.type ?? event.kind ?? '')
  if (kind === 'closed') return 'dropped'
  if (kind === 'open') return 'open'
  if (kind !== 'socket') return null
  const state = String(event.state ?? '')
  if (/^(open|opened|connected|resumed|ready)$/i.test(state)) return 'open'
  if (/clos|drop|disconnect|reconnect|error|lost/i.test(state) || event.error) return 'dropped'
  return null
}

export function networkFailure(detail: string): boolean {
  return NETWORK_FAILURE.test(detail) && !PLATFORM_REFUSAL.test(detail)
}

export function notThePlatform(detail: string | null | undefined): boolean {
  if (!detail || PLATFORM_REFUSAL.test(detail)) return false
  return NETWORK_FAILURE.test(detail) || OWN_FAILURE.test(detail) || CHAT_ACCESS_REFUSAL.test(detail)
}

export function catchUpRunner(platform: string, account: string, catchUp: CatchUp | undefined, log: (line: string) => void = () => {}): { run: () => Promise<void>; settled: () => Promise<void> } {
  let running: Promise<void> | null = null
  const once = async () => {
    let gap = behindOf(platform, account)
    if (gap?.status === 'refused' && notThePlatform(gap.detail)) {
      markGap(gap.id, 'open', `reopened: the platform never refused it (${gap.detail})`)
      log(`${platform} ${account}: the gap from ${gap.fromAt} was stopped by a network failure or our own error, not by the platform, so it is caught up again`)
      gap = behindOf(platform, account)
    }
    if (!gap || gap.status === 'refused') return
    if (!catchUp) {
      log(`${platform} ${account}: behind from ${gap.fromAt} (${gap.reason}), and this owner has no catch-up yet`)
      return
    }
    const drops = gap.drops ?? 0
    markGap(gap.id, 'catchingUp')
    log(`${platform} ${account}: catching up from ${gap.fromAt} (${gap.reason}) through its own session`)
    try {
      const got = await catchUp(gap)
      if (got.refused && notThePlatform(got.refused)) {
        markGap(gap.id, 'open', `the platform didn't refuse it (a network failure or our own error), so it is tried again at the next check: ${got.refused}`, got.appended)
        log(`${platform} ${account}: catch-up failed without the platform refusing (${got.refused}); still behind, tried again at the next check`)
        return
      }
      if (got.refused) {
        markGap(gap.id, 'refused', got.refused, got.appended)
        log(`${platform} ${account}: catch-up refused: ${got.refused}; it stays behind until matt says so (rule 94)`)
        return
      }
      if (!markGap(gap.id, 'closed', got.detail ?? null, got.appended, new Date(), drops)) {
        markGap(gap.id, 'open', 'the socket dropped again while catching up, so the gap stays open and is caught up again')
        log(`${platform} ${account}: dropped again while catching up, ${got.appended} event(s) added; catching up again`)
        return
      }
      log(`${platform} ${account}: caught up, ${got.appended} event(s) added from the gap`)
    } catch (error) {
      markGap(gap.id, 'open', error instanceof Error ? error.message : String(error))
      log(`${platform} ${account}: catch-up failed (${error instanceof Error ? error.message : String(error)}), still behind`)
    }
  }
  return {
    run: () => {
      if (!running) running = once().finally(() => (running = null))
      return running
    },
    settled: async () => {
      if (running) await running
    },
  }
}
