import { createConnection, createServer } from 'node:net'
import type { AddressInfo, Socket } from 'node:net'
import { createHash, randomBytes } from 'node:crypto'
import { hostname } from 'node:os'
import { addAlert, claimWatcher, killTree, processAlive, releaseWatcher, watchHolder } from '../watch/index'
import { appendEvent, behindOf, db, lastEventAt, markGap, markStage, openGap } from '../store/index'
import { HEARTBEAT_MS, MAX_BUFFERED_BYTES, STALE_MS } from './types'
import type { AttachResult, CatchUp, Relay, RelaySession, RelayStatus } from './types'

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
  let status: RelayStatus = 'connecting'
  let port = 0
  db().prepare('INSERT OR IGNORE INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(platform, account, process.pid, hostname(), startedAt, startedAt, status)
  const record = () => {
    db().prepare('UPDATE owners SET heartbeat = ?, status = ?, port = ?, token = ?, subscribers = ? WHERE platform = ? AND account = ? AND pid = ?').run(now().toISOString(), status, port, token, clients.size, platform, account, process.pid)
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

export async function ownOrAttach<R>(platform: string, account: string, options: { inbox: boolean; seconds?: number; run: (emit: (event: Record<string, unknown>) => void) => Promise<R>; onAttached: (event: Record<string, unknown>) => void; catchUp?: CatchUp; log?: (line: string) => void }): Promise<OwnOrAttach<R>> {
  const claim = claimWatcher(platform, account)
  if (!claim.ok) {
    if (options.inbox) return { owner: false, refused: `>>> ONE PROCESS PER ACCOUNT: pid ${claim.holder} already owns ${account}'s ${platform} connection and writes its inbox, so this one stopped before opening anything` }
    const session = readSession(platform, account)
    if (!session || !sessionLive(session) || session.pid !== claim.holder) return { owner: false, refused: `pid ${claim.holder} owns ${account}'s ${platform} connection but has no live relay to attach to (it runs code from before the relay); what it pushes reaches you through the inbox, ~/.logCli/inbox/pending.jsonl` }
    return { owner: false, attached: await attachRelay(session, options.onAttached, options.seconds) }
  }
  const relay = await openRelay(platform, account)
  const catching = catchUpRunner(platform, account, options.catchUp, options.log)
  void catching.run()
  const recheck = setInterval(() => void catching.run(), RECHECK_GAP_MS)
  try {
    const result = await options.run((event) => {
      relay.setStatus('streaming')
      const drop = socketChange(event)
      if (drop === 'dropped') openGap(platform, account, lastEventAt(platform, account) ?? new Date().toISOString(), 'socketDropped')
      if (drop === 'open') void catching.run()
      const type = pushedTypeOf(event)
      const stored = type === 'message' ? null : appendEvent({ platform, account, with: String(event.handle ?? event.from ?? ''), conversationId: String(event.conversationId ?? event.channelId ?? event.channel ?? event.thread ?? ''), type, payload: event, sourceAt: String(event.at ?? event.time ?? ''), eventId: createHash('sha1').update(`${platform}|${account}|${type}|${JSON.stringify(event)}`).digest('hex').slice(0, 12) })
      relay.broadcast(stored ? { ...event, seq: stored.seq } : event)
      if (stored) markStage(stored.eventId, 'relayed')
    })
    return { owner: true, result }
  } finally {
    clearInterval(recheck)
    await catching.settled()
    await relay.close()
    releaseWatcher(platform, account)
  }
}

export function replaceHungOwners(platform: string, accounts: readonly string[], now: number = Date.now(), alive: (pid: number) => boolean = processAlive, kill: (pid: number) => void = killTree): string[] {
  const replaced: string[] = []
  for (const account of accounts) {
    const session = readSession(platform, account)
    const holder = watchHolder(platform, account, alive)
    if (!session || !holder || session.pid !== holder) continue
    const quiet = now - Date.parse(session.lastHeartbeat)
    if (quiet < STALE_MS) continue
    kill(holder)
    db().prepare('DELETE FROM owners WHERE platform = ? AND account = ? AND pid = ?').run(platform, account, holder)
    addAlert({ platform, account, kind: 'hungOwner', detail: `the ${platform} owner (pid ${holder}) sent no heartbeat for ${Math.round(quiet / 1000)} s, so it was stopped and the next start becomes the one owner` })
    replaced.push(account)
  }
  return replaced
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

export function catchUpRunner(platform: string, account: string, catchUp: CatchUp | undefined, log: (line: string) => void = () => {}): { run: () => Promise<void>; settled: () => Promise<void> } {
  let running: Promise<void> | null = null
  const once = async () => {
    const gap = behindOf(platform, account)
    if (!gap || gap.status === 'refused') return
    if (!catchUp) {
      log(`${platform} ${account}: behind from ${gap.fromAt} (${gap.reason}), and this owner has no catch-up yet`)
      return
    }
    markGap(gap.id, 'catchingUp')
    log(`${platform} ${account}: catching up from ${gap.fromAt} (${gap.reason}) through its own session`)
    try {
      const got = await catchUp(gap)
      if (got.refused) {
        markGap(gap.id, 'refused', got.refused, got.appended)
        log(`${platform} ${account}: catch-up refused: ${got.refused}; it stays behind until matt says so (rule 94)`)
        return
      }
      markGap(gap.id, 'closed', got.detail ?? null, got.appended)
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
