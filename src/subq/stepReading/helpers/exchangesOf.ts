import { endpointName, responseErrors } from '../../../rea/facebookClient/helpers/operationsInHar'
import { ANSWER_SECRETS, CODE_LOADING_PATHS, MAX_DEPTH, MAX_DOCUMENT_FIELD_CHARS, MAX_LIST_ITEMS, MAX_STRING_CHARS, SECRET_PARAMS } from '../types'
import type { StepExchange } from '../types'

interface HarHeader {
  name: string
  value: string
}

interface HarEntry {
  startedDateTime: string
  time: number
  request: { method: string; url: string; headers: HarHeader[]; postData?: { mimeType?: string; text?: string } }
  response: { status: number; content: { mimeType?: string; text?: string } }
  _webSocketMessages?: SocketFrame[]
}

interface SocketFrame {
  type: 'send' | 'receive'
  time: number
  opcode: number
  data: string
  _encoding?: string
}

const SKIPPED_DESTS = new Set(['image', 'script', 'style', 'font', 'video', 'audio', 'track', 'worker', 'sharedworker', 'serviceworker', 'manifest', 'object', 'embed'])
const SKIPPED_MIME = /^(image|video|audio|font)\/|css|javascript|wasm|octet-stream/i

export function trimValue(value: unknown, depth = 0, secret: RegExp = ANSWER_SECRETS): unknown {
  if (depth >= MAX_DEPTH) return '…'
  if (typeof value === 'string') return value.length > MAX_STRING_CHARS ? `${value.slice(0, MAX_STRING_CHARS)}… (${value.length} chars)` : value
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_LIST_ITEMS).map((v) => trimValue(v, depth + 1, secret))
    return value.length > MAX_LIST_ITEMS ? [...items, `… ${value.length - MAX_LIST_ITEMS} more`] : items
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([k]) => !secret.test(k)).map(([k, v]) => [k, trimValue(v, depth + 1, secret)]))
  }
  return value
}

function header(entry: HarEntry, name: string): string | null {
  return entry.request.headers.find((h) => h.name.toLowerCase() === name)?.value ?? null
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function paramsOf(text: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of new URLSearchParams(text)) {
    if (SECRET_PARAMS.test(key)) continue
    out[key] = /^[[{]/.test(value) ? (parseJson(value) ?? value) : value
  }
  return out
}

export function sentOf(entry: HarEntry): unknown {
  const url = new URL(entry.request.url)
  const query = paramsOf(url.search.slice(1))
  const body = entry.request.postData?.text ?? ''
  const type = entry.request.postData?.mimeType ?? header(entry, 'content-type') ?? ''
  let sent: unknown = null
  if (body) sent = /json/i.test(type) ? (parseJson(body) ?? body) : /urlencoded/i.test(type) || /=/.test(body) ? paramsOf(body) : body
  const merged = Object.keys(query).length ? { query, body: sent } : sent
  return trimValue(merged, 0, SECRET_PARAMS)
}

export function answerOf(text: string | undefined): unknown {
  if (!text) return null
  const clean = text.replace(/^for \(;;\);/, '').trim()
  const lines = clean.split('\n').filter((l) => l.trim())
  const first = parseJson(lines[0] ?? '')
  if (first === null) return trimValue(clean)
  if (lines.length === 1) return trimValue(first)
  return trimValue({ first, followingParts: lines.length - 1, parts: lines.slice(1, 4).map((l) => parseJson(l) ?? l) })
}

export function jsonFieldAt(text: string, key: string): unknown {
  const marker = `"${key}":`
  const at = text.indexOf(marker)
  if (at < 0) return undefined
  let i = at + marker.length
  const open = text[i]
  if (open !== '{' && open !== '[') {
    const end = text.slice(i).search(/[,}\]]/)
    return parseJson(text.slice(i, end < 0 ? undefined : i + end)) ?? text.slice(i, i + 80)
  }
  const close = open === '{' ? '}' : ']'
  let level = 0
  let inString = false
  for (; i < text.length && i - at < MAX_DOCUMENT_FIELD_CHARS * 4; i++) {
    const c = text[i]
    if (inString) {
      if (c === '\\') i++
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') inString = true
    else if (c === open) level++
    else if (c === close && --level === 0) return parseJson(text.slice(at + marker.length, i + 1)) ?? undefined
  }
  return undefined
}

export function documentAnswerOf(text: string | undefined, fields: readonly string[]): unknown {
  if (!text) return null
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(text)?.[1]?.trim() ?? null
  const found: Record<string, unknown> = {}
  for (const field of fields) {
    const value = jsonFieldAt(text, field)
    if (value !== undefined) found[field] = trimValue(value)
  }
  return { title, bytes: text.length, fields: found }
}

export function nameOf(entry: HarEntry): string {
  const friendly = header(entry, 'x-fb-friendly-name')
  if (friendly) return friendly
  const fromBody = /(?:^|&)fb_api_req_friendly_name=([A-Za-z0-9_]+)/.exec(entry.request.postData?.text ?? '')?.[1]
  if (fromBody) return fromBody
  const sent = parseJson(entry.request.postData?.text ?? '')
  const operation = sent && typeof sent === 'object' && !Array.isArray(sent) ? ((sent as Record<string, unknown>).operationName ?? (sent as Record<string, unknown>).operation) : null
  if (typeof operation === 'string' && /^[A-Za-z0-9_]+$/.test(operation)) return operation
  return endpointName(new URL(entry.request.url).pathname)
}

export function kindOf(entry: HarEntry): 'api' | 'document' | null {
  const dest = (header(entry, 'sec-fetch-dest') ?? '').toLowerCase()
  const site = (header(entry, 'sec-fetch-site') ?? '').toLowerCase()
  const mime = entry.response.content.mimeType ?? ''
  if (CODE_LOADING_PATHS.test(new URL(entry.request.url).pathname)) return null
  if (site === 'cross-site' && dest !== 'document') return null
  if (dest === 'document' || dest === 'iframe') return 'document'
  if (SKIPPED_DESTS.has(dest)) return null
  if (dest === 'empty') return 'api'
  if (SKIPPED_MIME.test(mime)) return null
  return /json/i.test(mime) ? 'api' : null
}

export function frameNameOf(data: unknown, host: string): string {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const frame = data as Record<string, unknown>
    if (typeof frame.t === 'string' && frame.t) return `ws ${frame.t}`
    if (typeof frame.type === 'string' && frame.type) return `ws ${frame.type}`
    if (typeof frame.op === 'number' || typeof frame.op === 'string') return `ws op${frame.op}`
  }
  return `ws ${host}`
}

export function socketExchangesOf(entry: HarEntry, t0: number, known: ReadonlySet<string>): StepExchange[] {
  const url = new URL(entry.request.url)
  return (entry._webSocketMessages ?? []).map((frame) => {
    const data = frame._encoding ? null : parseJson(frame.data)
    const name = frameNameOf(data, url.host)
    const value = data ?? (frame._encoding ? `(${frame._encoding} frame, ${frame.data.length} chars)` : frame.data)
    return {
      offsetMs: Math.round(frame.time * 1000) - t0,
      kind: 'socket' as const,
      name,
      method: frame.type === 'send' ? 'SEND' : 'RECV',
      host: url.host,
      path: url.pathname,
      status: 101,
      ms: 0,
      sent: frame.type === 'send' ? trimValue(value) : null,
      answer: frame.type === 'receive' ? trimValue(value) : null,
      errors: [],
      known: known.has(name),
    }
  })
}

export function exchangesOf(har: unknown, known: ReadonlySet<string>, documentFields: readonly string[]): StepExchange[] {
  const entries = ((har as { log?: { entries?: HarEntry[] } })?.log?.entries ?? []).slice().sort((a, b) => Date.parse(a.startedDateTime) - Date.parse(b.startedDateTime))
  if (!entries.length) return []
  const t0 = Date.parse(entries[0].startedDateTime)
  const out: StepExchange[] = []
  for (const entry of entries) {
    if (entry._webSocketMessages?.length) {
      out.push(...socketExchangesOf(entry, t0, known))
      continue
    }
    const kind = kindOf(entry)
    if (!kind) continue
    const url = new URL(entry.request.url)
    const name = kind === 'document' ? `page ${url.pathname}` : nameOf(entry)
    out.push({
      offsetMs: Date.parse(entry.startedDateTime) - t0,
      kind,
      name,
      method: entry.request.method,
      host: url.host,
      path: url.pathname,
      status: entry.response.status,
      ms: Math.round(entry.time),
      sent: kind === 'document' ? null : sentOf(entry),
      answer: kind === 'document' ? documentAnswerOf(entry.response.content.text, documentFields) : answerOf(entry.response.content.text),
      errors: kind === 'document' ? [] : responseErrors(entry.response.content.text),
      known: kind === 'document' || known.has(name)
    })
  }
  return out.sort((a, b) => a.offsetMs - b.offsetMs)
}
