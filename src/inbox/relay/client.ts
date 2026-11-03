import { createConnection, createServer } from 'node:net'
import type { AddressInfo, Socket } from 'node:net'
import { createHash, randomBytes } from 'node:crypto'
import { hostname } from 'node:os'
import { addAlert, claimWatcher, killTree, processAlive, releaseWatcher, watchHolder } from '../watch/index'
import { appendEvent, db, markStage } from '../store/index'
import { HEARTBEAT_MS, MAX_BUFFERED_BYTES, STALE_MS } from './types'
import type { AttachResult, Relay, RelaySession, RelayStatus } from './types'

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

export type OwnOrAttach<R> = { owner: true; result: R } | { owner: false; attached: AttachResult } | { owner: false; refused: string }

export async function ownOrAttach<R>(platform: string, account: string, options: { inbox: boolean; seconds?: number; run: (emit: (event: Record<string, unknown>) => void) => Promise<R>; onAttached: (event: Record<string, unknown>) => void }): Promise<OwnOrAttach<R>> {
  const claim = claimWatcher(platform, account)
  if (!claim.ok) {
    if (options.inbox) return { owner: false, refused: `>>> ONE PROCESS PER ACCOUNT: pid ${claim.holder} already owns ${account}'s ${platform} connection and writes its inbox, so this one stopped before opening anything` }
    const session = readSession(platform, account)
    if (!session || !sessionLive(session) || session.pid !== claim.holder) return { owner: false, refused: `pid ${claim.holder} owns ${account}'s ${platform} connection but has no live relay to attach to (it runs code from before the relay); what it pushes reaches you through the inbox, ~/.logCli/inbox/pending.jsonl` }
    return { owner: false, attached: await attachRelay(session, options.onAttached, options.seconds) }
  }
  const relay = await openRelay(platform, account)
  try {
    const result = await options.run((event) => {
      relay.setStatus('streaming')
      const type = String(event.type ?? event.kind ?? 'unknown')
      const stored = type === 'message' ? null : appendEvent({ platform, account, conversationId: String(event.conversationId ?? event.channelId ?? event.channel ?? event.thread ?? ''), type, payload: event, sourceAt: String(event.at ?? event.time ?? ''), eventId: createHash('sha1').update(`${platform}|${account}|${type}|${JSON.stringify(event)}`).digest('hex').slice(0, 12) })
      relay.broadcast(stored ? { ...event, seq: stored.seq } : event)
      if (stored) markStage(stored.eventId, 'relayed')
    })
    return { owner: true, result }
  } finally {
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
