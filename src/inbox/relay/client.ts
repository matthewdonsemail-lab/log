import { createConnection, createServer } from 'node:net'
import type { AddressInfo, Socket } from 'node:net'
import { randomBytes } from 'node:crypto'
import { hostname } from 'node:os'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { addAlert, claimWatcher, inboxRoot, killTree, processAlive, releaseWatcher, watchHolder } from '../watch/index'
import { HEARTBEAT_MS, STALE_MS } from './types'
import type { AttachResult, Relay, RelaySession, RelayStatus } from './types'

export const sessionPath = (platform: string, account: string) => join(inboxRoot(), platform, account, 'session.json')

export function readSession(platform: string, account: string): RelaySession | null {
  const path = sessionPath(platform, account)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as RelaySession
  } catch {
    return null
  }
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
  const path = sessionPath(platform, account)
  mkdirSync(join(path, '..'), { recursive: true })
  const record = () => {
    const session: RelaySession = { platform, account, pid: process.pid, hostname: hostname(), startedAt, lastHeartbeat: now().toISOString(), status, port, token, subscribers: clients.size }
    writeFileSync(path, JSON.stringify(session, null, 2))
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
      for (const client of clients) client.write(line)
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
      if (readSession(platform, account)?.pid === process.pid) rmSync(path, { force: true })
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
      relay.broadcast(event)
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
    rmSync(sessionPath(platform, account), { force: true })
    addAlert({ platform, account, kind: 'hungOwner', detail: `the ${platform} owner (pid ${holder}) sent no heartbeat for ${Math.round(quiet / 1000)} s, so it was stopped and the next start becomes the one owner` })
    replaced.push(account)
  }
  return replaced
}
