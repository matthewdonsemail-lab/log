export type NormalizedPost = {
  externalId: string
  authorName: string
  body: string[]
  title?: string
  url: string
  timestamp?: string
  likes: number
  comments: number
}

function count(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
}

function text(value: unknown, max: number): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined
}

/**
 * Validates one post pushed by an external client. Returns null for junk so a
 * batch skips and counts bad rows instead of failing halfway through.
 */
export function normalizePushedPost(raw: unknown): NormalizedPost | null {
  if (typeof raw !== 'object' || raw === null) return null
  const row = raw as Record<string, unknown>
  const externalId = text(row.externalId, 200)
  const rawUrl = text(row.url, 2000)
  if (!externalId || !rawUrl) return null
  let url: URL
  try { url = new URL(rawUrl) } catch { return null }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const parts = Array.isArray(row.body) ? row.body : typeof row.body === 'string' ? [row.body] : []
  const body = parts.slice(0, 20).map(part => text(part, 4000)).filter((part): part is string => part !== undefined)
  const title = text(row.title, 500)
  const stamp = typeof row.timestamp === 'string' ? Date.parse(row.timestamp) : Number.NaN
  return {
    externalId,
    authorName: text(row.authorName, 200) ?? 'unknown',
    body,
    ...(title === undefined ? {} : { title }),
    url: url.toString(),
    ...(Number.isFinite(stamp) ? { timestamp: new Date(stamp).toISOString() } : {}),
    likes: count(row.likes),
    comments: count(row.comments),
  }
}
