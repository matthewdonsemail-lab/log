import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { addAlertRow, db, eventIdOf, immediate, saveVectors } from '../../inbox/store/index'
import { claimWatcher, releaseWatcher } from '../../inbox/watch/index'
import { DESCRIBER_HEARTBEAT_MS, MEMORY_CEILING_MB, QUEUE_LIMIT, VIDEO_FRAMES } from './types'
import type { Describer, MediaKind, MediaRow } from './types'

const IMAGE = /\.(png|jpe?g|webp|bmp|gif)$/i
const VIDEO = /\.(mp4|mov|webm|mkv|m4v)$/i

export function kindOf(name: string, type = ''): MediaKind {
  if (/^audio\//.test(type) || /\.(ogg|oga|opus|m4a|mp3|wav|aac)$/i.test(name)) return 'audio'
  if (/gif/i.test(type) || /\.gif$/i.test(name)) return 'gif'
  if (/^video\//.test(type) || VIDEO.test(name)) return 'video'
  if (/^image\//.test(type) || IMAGE.test(name)) return 'image'
  return 'file'
}

export function enqueueMedia(item: { eventId: string; platform: string; account: string; conversationId?: string; name: string; type?: string; path?: string | null }, now: Date = new Date()): MediaRow | null {
  const kind = kindOf(item.name, item.type)
  return immediate((handle) => {
    const waiting = (handle.prepare("SELECT COUNT(*) AS n FROM media WHERE status IN ('pending', 'describing')").get() as { n: number }).n
    const describable = kind !== 'audio' && kind !== 'file' && !!item.path
    const status = !describable ? 'notDescribed' : waiting >= QUEUE_LIMIT ? 'notDescribed' : 'pending'
    const detail = !item.path ? 'no local copy of the file yet' : kind === 'audio' ? 'audio is transcribed by AssemblyAI (rule 126), not described' : kind === 'file' ? 'not an image or a video' : waiting >= QUEUE_LIMIT ? `the describer queue was full (${QUEUE_LIMIT} waiting)` : null
    const result = handle.prepare('INSERT OR IGNORE INTO media (eventId, platform, account, conversationId, kind, name, path, status, detail, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(item.eventId, item.platform, item.account, item.conversationId ?? '', kind, item.name, item.path ?? null, status, detail, now.toISOString())
    if (status === 'notDescribed' && waiting >= QUEUE_LIMIT && describable) addAlertRow({ platform: item.platform, account: item.account, kind: 'mediaQueueFull', detail: `${kind} ${item.name} wasn't queued for a description because ${QUEUE_LIMIT} are already waiting; it shows as not described yet in every context` }, now, handle)
    if (!result.changes) return (handle.prepare('SELECT * FROM media WHERE eventId = ? AND name = ?').get(item.eventId, item.name) as MediaRow | null) ?? null
    return handle.prepare('SELECT * FROM media WHERE id = ?').get(Number(result.lastInsertRowid)) as MediaRow
  })
}

export function mediaOf(eventIds: readonly string[]): Map<string, MediaRow[]> {
  const out = new Map<string, MediaRow[]>()
  if (!eventIds.length) return out
  const read = db().prepare('SELECT * FROM media WHERE eventId = ? ORDER BY id')
  for (const id of new Set(eventIds)) {
    const rows = read.all(id) as MediaRow[]
    if (rows.length) out.set(id, rows)
  }
  return out
}

export function mediaLine(row: MediaRow): string {
  if (row.status === 'described' && row.description) return `[${row.kind} ${row.name}: ${row.description}]`
  return `[${row.kind} ${row.name} not described yet${row.detail ? `: ${row.detail}` : ''}]`
}

export function nextMedia(handle = db()): MediaRow | null {
  return immediate(() => {
    const row = (handle.prepare("SELECT * FROM media WHERE status = 'pending' ORDER BY id LIMIT 1").get() as MediaRow | null) ?? null
    if (row) handle.prepare("UPDATE media SET status = 'describing' WHERE id = ?").run(row.id)
    return row
  })
}

export function framesOf(path: string, out: string, ffmpeg = 'ffmpeg', ffprobe = 'ffprobe'): string[] {
  const probe = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], { encoding: 'utf8', windowsHide: true })
  const seconds = Number(probe.stdout.trim()) || 0
  mkdirSync(out, { recursive: true })
  return VIDEO_FRAMES.map((at, i) => {
    const frame = join(out, `frame${i + 1}.png`)
    spawnSync(ffmpeg, ['-v', 'error', '-y', '-ss', String((seconds * at).toFixed(2)), '-i', path, '-frames:v', '1', frame], { windowsHide: true })
    return frame
  }).filter((f) => existsSync(f))
}

export async function describeRow(row: MediaRow, describer: Describer, embed?: (texts: string[]) => Promise<ArrayLike<number>[]>, embedModel?: { model: string; dimensions: number }): Promise<string> {
  if (!row.path || !existsSync(row.path)) throw new Error(`the file isn't on disk at ${row.path ?? '(none)'}`)
  let description: string
  if (row.kind === 'video' || (row.kind === 'gif' && extname(row.path).toLowerCase() !== '.gif')) {
    const dir = mkdtempSync(join(tmpdir(), 'frames'))
    try {
      const frames = framesOf(row.path, dir)
      if (!frames.length) throw new Error('ffmpeg took no frames out of the video')
      const parts: string[] = []
      for (const [i, frame] of frames.entries()) parts.push(`frame ${i + 1} of ${frames.length}: ${await describer.describe(frame)}`)
      description = parts.join(' ')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  } else description = await describer.describe(row.path)
  const labelled = `${row.kind}: ${description}`
  db().prepare("UPDATE media SET status = 'described', description = ?, model = ?, describedAt = ?, detail = NULL WHERE id = ?").run(labelled, describer.model, new Date().toISOString(), row.id)
  if (embed && embedModel) {
    const [vector] = await embed([labelled])
    saveVectors(embedModel.model, embedModel.dimensions, [{ text: labelled, vector, kind: row.kind }])
  }
  return labelled
}

export async function runDescriber(options: { load: () => Promise<Describer>; embed?: (texts: string[]) => Promise<ArrayLike<number>[]>; embedModel?: { model: string; dimensions: number }; log?: (line: string) => void; sleep?: (ms: number) => Promise<void>; stopped?: () => boolean; memoryMb?: () => number; ceilingMb?: number }): Promise<{ ok: true; described: number } | { ok: false; reason: string }> {
  const log = options.log ?? (() => {})
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)))
  const memory = options.memoryMb ?? (() => process.memoryUsage().rss / 1e6)
  const ceiling = options.ceilingMb ?? MEMORY_CEILING_MB
  const claim = claimWatcher('model', 'describer')
  if (!claim.ok) return { ok: false, reason: `pid ${claim.holder} is already the one media describer on this machine` }
  const beat = () => db().prepare("UPDATE owners SET heartbeat = ?, status = 'streaming' WHERE platform = 'model' AND account = 'describer' AND pid = ?").run(new Date().toISOString(), process.pid)
  const timer = setInterval(beat, DESCRIBER_HEARTBEAT_MS)
  timer.unref?.()
  db().prepare("UPDATE media SET status = 'pending' WHERE status = 'describing'").run()
  let described = 0
  try {
    log('media describer: loading the vision model once, kept warm for every item')
    const describer = await options.load()
    beat()
    log(`media describer: ${describer.model} ready`)
    while (!options.stopped?.()) {
      if (memory() > ceiling) {
        addAlertRow({ platform: 'model', account: 'describer', kind: 'describerMemory', detail: `the media describer used ${Math.round(memory())} MB, over its ${ceiling} MB ceiling, so it stopped; the next session start brings it back` })
        return { ok: false, reason: `memory over ${ceiling} MB` }
      }
      const row = nextMedia()
      if (!row) {
        await sleep(1000)
        continue
      }
      try {
        const labelled = await describeRow(row, describer, options.embed, options.embedModel)
        described++
        log(`media describer: #${row.id} ${row.platform} ${row.name}: ${labelled.slice(0, 160)}`)
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        db().prepare("UPDATE media SET status = 'failed', detail = ? WHERE id = ?").run(reason.slice(0, 300), row.id)
        log(`media describer: #${row.id} ${row.name} failed: ${reason}`)
      }
    }
    return { ok: true, described }
  } finally {
    clearInterval(timer)
    releaseWatcher('model', 'describer')
  }
}

export function enqueueAttachments(message: { platform: string; account: string; conversationId: string; at: string; text: string }, attachments: readonly { name?: string; type?: string; path?: string | null }[] | undefined, now: Date = new Date()): MediaRow[] {
  const eventId = eventIdOf(message)
  return (attachments ?? []).filter((a) => a.name).map((a) => enqueueMedia({ eventId, platform: message.platform, account: message.account, conversationId: message.conversationId, name: String(a.name), type: a.type ?? '', path: a.path ?? null }, now)).filter((r): r is MediaRow => !!r)
}
