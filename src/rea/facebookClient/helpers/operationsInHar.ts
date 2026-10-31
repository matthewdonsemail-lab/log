import type { OperationSighting } from '../types'

export interface RequestSeen extends OperationSighting {
  name: string
  docId: string | null
  path: string
  graphql: boolean
  variables: string[]
}

interface HarEntry {
  startedDateTime?: string
  time?: number
  request?: { method?: string; url?: string; headers?: { name: string; value: string }[]; postData?: { text?: string } }
  response?: { status?: number; content?: { text?: string; encoding?: string } }
}

export function formFields(body: string): URLSearchParams {
  if (!body.startsWith('--')) return new URLSearchParams(body)
  const fields = new URLSearchParams()
  for (const match of body.matchAll(/name="([^"]+)"\r?\n\r?\n([\s\S]*?)\r?\n--/g)) fields.append(match[1], match[2])
  return fields
}

const isFacebook = (host: string): boolean => host === 'facebook.com' || host.endsWith('.facebook.com')

export function endpointName(path: string): string {
  const words = path.split(/[^A-Za-z0-9]+/).filter(Boolean)
  return words.map((word, i) => (i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase())).join('') || 'root'
}

export function responseErrors(text: string | undefined): string[] {
  if (!text) return []
  const errors: string[] = []
  for (const line of text.replace(/^for \(;;\);/, '').split(/\r?\n/).slice(0, 20)) {
    let value: unknown
    try {
      value = JSON.parse(line)
    } catch {
      continue
    }
    if (!value || typeof value !== 'object') continue
    const record = value as Record<string, unknown>
    if (typeof record.error === 'number') errors.push(`error ${record.error}${typeof record.errorSummary === 'string' ? `: ${record.errorSummary}` : ''}`)
    if (Array.isArray(record.errors)) {
      for (const error of record.errors) {
        const e = (error ?? {}) as Record<string, unknown>
        const message = [e.code, e.summary ?? e.message].filter((part) => typeof part === 'string' || typeof part === 'number').join(': ')
        if (message) errors.push(message)
      }
    }
  }
  return [...new Set(errors.map((error) => error.slice(0, 160)))]
}

export function requestsInStep(har: { log?: { entries?: HarEntry[] } }, context: { run: string; action: string; step: string; stepAt: string }): RequestSeen[] {
  const stepStart = Date.parse(context.stepAt)
  const seen: RequestSeen[] = []
  for (const entry of har.log?.entries ?? []) {
    let url: URL
    try {
      url = new URL(entry.request?.url ?? '')
    } catch {
      continue
    }
    if (!isFacebook(url.hostname) || url.pathname.startsWith('/static_resources/')) continue
    const body = entry.request?.postData?.text ?? ''
    const form = formFields(body)
    const header = entry.request?.headers?.find((h) => h.name.toLowerCase() === 'x-fb-friendly-name')?.value
    const friendly = header ?? form.get('fb_api_req_friendly_name')
    const graphql = url.pathname.startsWith('/api/graphql')
    if (!graphql && entry.request?.method !== 'POST') continue
    const started = Date.parse(entry.startedDateTime ?? '')
    seen.push({
      name: graphql && friendly ? friendly : endpointName(url.pathname),
      docId: graphql ? form.get('doc_id') : null,
      path: url.pathname,
      graphql: graphql && !!friendly,
      variables: graphql ? variableNames(form) : [],
      run: context.run,
      action: context.action,
      step: context.step,
      status: entry.response?.status ?? 0,
      ms: Math.round(entry.time ?? 0),
      afterStepMs: Number.isNaN(started) || Number.isNaN(stepStart) ? 0 : started - stepStart,
      errors: entry.response?.content?.encoding === 'base64' ? [] : responseErrors(entry.response?.content?.text)
    })
  }
  return seen
}

export function variableNames(form: URLSearchParams): string[] {
  try {
    const value = JSON.parse(form.get('variables') ?? '{}') as unknown
    return value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : []
  } catch {
    return []
  }
}
