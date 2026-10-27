import { createHash } from 'node:crypto'
import { KB_CHUNK_CHARS, KB_CHUNK_OVERLAP } from '../types'
import type { KbArticle, KbChunk } from '../types'

export function articleHash(article: KbArticle): string {
  return createHash('sha256').update(JSON.stringify([article.kind, article.title, article.body, article.source, article.tags])).digest('hex').slice(0, 16)
}

export function chunkKey(key: string): string {
  return createHash('sha256').update(key).digest('hex').slice(0, 20)
}

export function splitText(text: string, size = KB_CHUNK_CHARS, overlap = KB_CHUNK_OVERLAP): string[] {
  const clean = text.replace(/\r\n/g, '\n').trim()
  if (clean.length <= size) return clean ? [clean] : []
  const parts: string[] = []
  let start = 0
  while (start < clean.length) {
    let end = Math.min(clean.length, start + size)
    if (end < clean.length) {
      const breakAt = Math.max(clean.lastIndexOf('\n\n', end), clean.lastIndexOf('\n', end), clean.lastIndexOf('. ', end))
      if (breakAt > start + size / 2) end = breakAt + 1
    }
    parts.push(clean.slice(start, end).trim())
    if (end >= clean.length) break
    start = Math.max(end - overlap, start + 1)
  }
  return parts.filter(Boolean)
}

export function chunksOf(article: KbArticle): KbChunk[] {
  const base = chunkKey(article.key)
  return splitText(article.body).map((text, i) => ({ id: `${base}:${i}`, key: article.key, kind: article.kind, title: article.title, source: article.source, text }))
}
