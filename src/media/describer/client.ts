import { existsSync, readFileSync, rmSync } from 'node:fs'
import { extname } from 'node:path'
import { addAlertRow, db, eventIdOf, immediate, saveVectors } from '../../inbox/store/index'
import { claimWatcher, releaseWatcher } from '../../inbox/watch/index'
import { hashOf } from '../voiceNotes/client'
import { DEFAULT_TOOLS, frameAt, previewOf, probeOf, sceneCutsOf, sheetOf, soundtrackOf } from './helpers/ffmpeg'
import { clock, describeWith, spansOf, speechIn, timelineOf } from './helpers/scenes'
import { transcriptOfHash } from './helpers/speech'
import type { Tools } from './helpers/ffmpeg'
import { DESCRIBER_HEARTBEAT_MS, LINE_LIMIT, MEMORY_CEILING_MB, QUEUE_FULL_DETAIL, QUEUE_LIMIT, SCENE_PROMPT, VISUAL_KINDS } from './types'
import type { Describer, MediaKind, MediaRow, Scene, Speech, Transcriber } from './types'

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
    const detail = !item.path ? 'no local copy of the file yet' : kind === 'audio' ? 'audio is transcribed by AssemblyAI (rule 126), not described' : kind === 'file' ? 'not an image or a video' : waiting >= QUEUE_LIMIT ? `${QUEUE_FULL_DETAIL} (${QUEUE_LIMIT} waiting); it is described when the queue has room` : null
    const audio = kind === 'audio' && item.path && existsSync(item.path) ? readFileSync(item.path) : null
    const result = handle.prepare('INSERT OR IGNORE INTO media (eventId, platform, account, conversationId, kind, name, path, status, detail, createdAt, sha256, sizeBytes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(item.eventId, item.platform, item.account, item.conversationId ?? '', kind, item.name, item.path ?? null, status, detail, now.toISOString(), audio ? hashOf(audio) : null, audio ? audio.length : null)
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

function capped(text: string): string {
  return text.length > LINE_LIMIT ? `${text.slice(0, LINE_LIMIT - 1)}…` : text
}

export function mediaByPath(paths: readonly string[]): Map<string, MediaRow> {
  const out = new Map<string, MediaRow>()
  const read = db().prepare('SELECT * FROM media WHERE path = ? ORDER BY id DESC LIMIT 1')
  for (const path of new Set(paths.filter(Boolean))) {
    const row = read.get(path) as MediaRow | null
    if (row) out.set(path, row)
  }
  return out
}

export function mediaLine(row: MediaRow): string {
  const view = row.preview ? ` (picture: media view ${row.id})` : ''
  if (row.status === 'described' && row.description) return capped(`[${row.kind} ${row.name}: ${row.description}]`) + view
  if (row.kind === 'audio') {
    const heard = transcriptOfHash(row.sha256)
    if (heard?.text) return capped(`[audio ${row.name}${heard.seconds ? ` ${clock(heard.seconds)}` : ''}: "${heard.text}"]`)
  }
  return `[${row.kind} ${row.name} not described yet${row.detail ? `: ${row.detail}` : ''}]${view}`
}

export function nextMedia(handle = db()): MediaRow | null {
  return immediate(() => {
    const row = ((handle.prepare("SELECT * FROM media WHERE status = 'pending' ORDER BY id LIMIT 1").get() as MediaRow | null) ?? (handle.prepare("SELECT * FROM media WHERE status = 'notDescribed' AND detail LIKE ? AND (path IS NOT NULL OR preview IS NOT NULL) ORDER BY id LIMIT 1").get(`${QUEUE_FULL_DETAIL}%`) as MediaRow | null)) ?? null
    if (row) handle.prepare("UPDATE media SET status = 'describing' WHERE id = ?").run(row.id)
    return row
  })
}

export function isVisual(row: Pick<MediaRow, 'kind'>): boolean {
  return VISUAL_KINDS.includes(row.kind)
}

function movingPicture(row: Pick<MediaRow, 'kind' | 'path' | 'name'>): boolean {
  return row.kind === 'video' || (row.kind === 'gif' && extname(row.path ?? row.name).toLowerCase() !== '.gif')
}

export function ingestRow(row: MediaRow, tools: Tools = DEFAULT_TOOLS): MediaRow {
  if (!row.path || !existsSync(row.path) || row.preview) return row
  const bytes = readFileSync(row.path)
  const probe = probeOf(row.path, tools)
  const moving = movingPicture(row)
  const preview = isVisual(row) ? (moving && probe.durationMs ? sheetOf(row.path, probe.durationMs, tools) : previewOf(row.path, tools)) : null
  db().prepare('UPDATE media SET sha256 = ?, sizeBytes = ?, durationMs = ?, width = ?, height = ?, preview = ?, previewMime = ? WHERE id = ?').run(hashOf(bytes), bytes.length, probe.durationMs, probe.width, probe.height, preview, preview ? 'image/jpeg' : null, row.id)
  return db().prepare('SELECT * FROM media WHERE id = ?').get(row.id) as MediaRow
}

export function removeSpoolFile(row: MediaRow, now: Date = new Date()): boolean {
  if (!row.path || row.platform === 'local' || !isVisual(row) || !row.preview) return false
  if (!row.path.split(/[\\/]/).includes('media') || !existsSync(row.path)) return false
  rmSync(row.path, { force: true })
  db().prepare('UPDATE media SET fileRemovedAt = ? WHERE id = ?').run(now.toISOString(), row.id)
  return true
}

export interface Understanding {
  describers: readonly Describer[]
  transcriber?: Transcriber | null
  tools?: Tools
}

async function understandVideo(row: MediaRow, path: string, deps: Understanding): Promise<{ description: string; scenes: Scene[]; transcript: string | null; models: string[] }> {
  const tools = deps.tools ?? DEFAULT_TOOLS
  const probe = probeOf(path, tools)
  const seconds = (probe.durationMs ?? 0) / 1000
  const spans = spansOf(sceneCutsOf(path, tools), seconds)
  const models = new Set<string>()
  let speech: Speech | null = null
  if (probe.hasAudio && deps.transcriber) {
    const sound = soundtrackOf(path, tools)
    if (sound) {
      try {
        speech = await deps.transcriber.transcribe(sound, `${row.name}.wav`)
        models.add(speech.model)
      } catch (error) {
        models.add(`${deps.transcriber.model}: ${error instanceof Error ? error.message : String(error)}`.slice(0, 200))
      }
    }
  }
  const scenes: Scene[] = []
  for (const [i, span] of spans.entries()) {
    const frame = frameAt(path, seconds > 0 ? (span.start + span.end) / 2 : 0, tools)
    const screen = frame ? await describeWith(deps.describers, frame, SCENE_PROMPT) : null
    if (screen) models.add(screen.model)
    scenes.push({ start: span.start, end: span.end, screen: screen?.text ?? '', speech: speech ? speechIn(speech.words, span, i === spans.length - 1) : '' })
  }
  if (!scenes.some((s) => s.screen)) throw new Error('ffmpeg took no frames out of the video')
  const said = speech?.text ? 'speech' : probe.hasAudio ? (deps.transcriber ? 'sound with no words heard' : 'sound not transcribed (no transcriber)') : 'no sound'
  return { description: `${row.kind} ${clock(seconds)}, ${scenes.length} scene${scenes.length === 1 ? '' : 's'}, ${said}: ${timelineOf(scenes)}`, scenes, transcript: speech?.text || null, models: [...models] }
}

export async function describeRow(row: MediaRow, describer: Describer | Understanding, embed?: (texts: string[]) => Promise<ArrayLike<number>[]>, embedModel?: { model: string; dimensions: number }): Promise<string> {
  const deps: Understanding = 'describers' in describer ? describer : { describers: [describer] }
  const current = ingestRow(row, deps.tools)
  const onDisk = !!current.path && existsSync(current.path)
  let description: string
  let scenes: Scene[] | null = null
  let transcript: string | null = null
  let models: string[]
  if (onDisk && movingPicture(current)) {
    const video = await understandVideo(current, current.path!, deps)
    description = video.description
    scenes = video.scenes
    transcript = video.transcript
    models = video.models
  } else if (onDisk || current.preview) {
    const seen = await describeWith(deps.describers, onDisk ? current.path! : new Uint8Array(current.preview!))
    description = `${current.kind}: ${seen.text}${onDisk ? '' : ' (described from its kept preview)'}`
    models = [seen.model]
  } else throw new Error(`the file isn't on disk at ${current.path ?? '(none)'} and no preview was kept`)
  const labelled = description
  db().prepare("UPDATE media SET status = 'described', description = ?, scenes = ?, transcript = ?, model = ?, providers = ?, describedAt = ?, detail = NULL WHERE id = ?").run(labelled, scenes ? JSON.stringify(scenes) : null, transcript, models.find((m) => !m.includes(':')) ?? models[0] ?? null, JSON.stringify(models), new Date().toISOString(), current.id)
  if (embed && embedModel) {
    const [vector] = await embed([labelled])
    saveVectors(embedModel.model, embedModel.dimensions, [{ text: labelled, vector, kind: current.kind }])
  }
  removeSpoolFile(db().prepare('SELECT * FROM media WHERE id = ?').get(current.id) as MediaRow)
  return labelled
}

export function mediaView(id: number): { row: MediaRow; line: string; image: { data: string; mimeType: string } | null } | null {
  const row = (db().prepare('SELECT * FROM media WHERE id = ?').get(id) as MediaRow | null) ?? null
  if (!row) return null
  return { row, line: mediaLine(row), image: row.preview ? { data: Buffer.from(row.preview).toString('base64'), mimeType: row.previewMime ?? 'image/jpeg' } : null }
}

export async function runDescriber(options: { load: () => Promise<Describer | Describer[]>; transcriber?: Transcriber | null; tools?: Tools; embed?: (texts: string[]) => Promise<ArrayLike<number>[]>; embedModel?: { model: string; dimensions: number }; log?: (line: string) => void; sleep?: (ms: number) => Promise<void>; stopped?: () => boolean; memoryMb?: () => number; ceilingMb?: number }): Promise<{ ok: true; described: number } | { ok: false; reason: string }> {
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
    const loaded = await options.load()
    const describers = Array.isArray(loaded) ? loaded : [loaded]
    const understanding: Understanding = { describers, transcriber: options.transcriber ?? null, ...(options.tools ? { tools: options.tools } : {}) }
    beat()
    log(`media describer: ${describers.map((d) => d.model).join(', then ')} ready; video sound ${options.transcriber ? `through ${options.transcriber.model}` : 'not transcribed (no transcriber)'}`)
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
        const labelled = await describeRow(row, understanding, options.embed, options.embedModel)
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
