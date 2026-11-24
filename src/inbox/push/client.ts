import { existsSync, watch } from 'node:fs'
import { readPending } from '../pending/index'
import { deleteState, getState, putState } from '../../storage/state/index'
import { harnessOff } from '../../agentHooks/harness/off/client'
import { db } from '../store/index'
import { inboxRoot } from '../watch/index'
import { PUSH_FALLBACK_MS, PUSH_LABEL_WAIT_MS, PUSH_MARK_MS, PUSH_SETTLE_MS, type InboxMark, type InboxWait, type PendingReader, type PushBatch, type PushLabel, type PushQuiet, type QuietUntil } from './types'

export function batchOf(reader: string, host: string, read: PendingReader = readPending): PushBatch | null {
  const pending = read(reader)
  if (!pending.messages.length && !pending.alerts.length) return null
  if (!pending.text) return null
  return { reader, host, count: pending.messages.length, context: pending.text }
}

export const quietUntil: QuietUntil = (now) => {
  const row = getState<PushQuiet>('pushQuiet', 'all')
  const at = row ? Date.parse(row.body.until) : Number.NaN
  return at > now ? at : 0
}

export function setQuiet(minutes: number, by: string, now: number = Date.now()): string | null {
  if (minutes <= 0) {
    deleteState('pushQuiet', 'all')
    return null
  }
  const until = new Date(now + minutes * 60000).toISOString()
  putState('pushQuiet', 'all', { until, by } satisfies PushQuiet, now)
  return until
}

export const inboxMark: InboxMark = () => {
  try {
    const events = db().prepare('SELECT COALESCE(MAX(seq), 0) AS n FROM events').get() as { n: number }
    const alerts = db().prepare('SELECT COALESCE(MAX(id), 0) AS n FROM alerts').get() as { n: number }
    return `${events.n}:${alerts.n}`
  } catch {
    return ''
  }
}

export const inboxWaitOf =
  (mark: InboxMark = inboxMark): InboxWait =>
  (root, ms, since) =>
    new Promise((resolve) => {
      let done = false
      let poll: ReturnType<typeof setInterval> | null = null
      let watcher: ReturnType<typeof watch> | null = null
      const finish = () => {
        if (done) return
        done = true
        clearTimeout(timer)
        if (poll) clearInterval(poll)
        try {
          watcher?.close()
        } catch {}
        setTimeout(resolve, PUSH_SETTLE_MS)
      }
      const timer = setTimeout(finish, ms)
      if (since !== undefined) {
        const moved = () => {
          if (mark() !== since) finish()
        }
        poll = setInterval(moved, PUSH_MARK_MS)
        moved()
      }
      try {
        if (!done && existsSync(root)) watcher = watch(root, { recursive: true }, (_event, name) => {
          if (!name || String(name).endsWith('watch.log')) finish()
        })
      } catch {}
    })

export const waitForInbox: InboxWait = inboxWaitOf()

export async function pushLoop(
  reader: string,
  host: string,
  emit: (batch: PushBatch) => void,
  options: { root?: string; fallbackMs?: number; read?: PendingReader; wait?: InboxWait; mark?: InboxMark | null; rounds?: number; quiet?: QuietUntil; now?: () => number; label?: PushLabel } = {},
): Promise<number> {
  const root = options.root ?? inboxRoot()
  const wait = options.wait ?? waitForInbox
  let sent = 0
  const now = options.now ?? Date.now
  const quiet = options.quiet ?? quietUntil
  const mark = options.mark === undefined ? (options.read ? null : inboxMark) : options.mark
  for (let round = 0; options.rounds === undefined || round < options.rounds; round++) {
    if (harnessOff()) {
      await wait(root, Math.min(5000, options.fallbackMs ?? PUSH_FALLBACK_MS))
      continue
    }
    const until = quiet(now())
    if (until) {
      await wait(root, Math.max(1000, Math.min(until - now(), options.fallbackMs ?? PUSH_FALLBACK_MS)))
      continue
    }
    const since = mark ? mark() : undefined
    if (options.label) await Promise.race([options.label().catch(() => 0), new Promise((resolve) => setTimeout(resolve, PUSH_LABEL_WAIT_MS))])
    const batch = batchOf(reader, host, options.read)
    if (batch) {
      emit(batch)
      sent++
    }
    await wait(root, options.fallbackMs ?? PUSH_FALLBACK_MS, since)
  }
  return sent
}
