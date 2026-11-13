import { closeSync, existsSync, openSync, readSync, statSync } from 'node:fs'
import { stepsOf } from '../../mcp/server/helpers/activePlay.ts'
import { LOG_TOOL_PREFIX, PLAY_LOADED, TRANSCRIPT_TAIL_BYTES } from './types'
import type { SessionPlay } from './types'

export function transcriptTail(path: string, bytes: number = TRANSCRIPT_TAIL_BYTES): string {
  if (!path || !existsSync(path)) return ''
  const size = statSync(path).size
  const start = Math.max(0, size - bytes)
  const buffer = Buffer.alloc(size - start)
  const fd = openSync(path, 'r')
  try {
    readSync(fd, buffer, 0, buffer.length, start)
  } finally {
    closeSync(fd)
  }
  return buffer.toString('utf8')
}

interface TranscriptPart {
  type?: string
  id?: string
  name?: string
  input?: { useCase?: string; ask?: string; clearPlay?: boolean }
  tool_use_id?: string
  content?: unknown
}

function resultText(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map((c) => (c && typeof c === 'object' && typeof (c as { text?: unknown }).text === 'string' ? (c as { text: string }).text : '')).join('\n')
}

export function sessionPlayOf(transcript: string): SessionPlay | null {
  let id: string | null = null
  let lastTool: string | null = null
  const asks = new Set<string>()
  for (const line of transcript.split('\n')) {
    const asked = line.includes(LOG_TOOL_PREFIX)
    if (!asked && !(asks.size && line.includes('tool_result'))) continue
    let entry: { type?: string; message?: { content?: unknown } }
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }
    if (!Array.isArray(entry.message?.content)) continue
    for (const part of entry.message.content as TranscriptPart[]) {
      if (entry.type === 'user' && part.type === 'tool_result' && part.tool_use_id && asks.has(part.tool_use_id)) {
        asks.delete(part.tool_use_id)
        const loaded = PLAY_LOADED.exec(resultText(part.content))?.[1]
        if (loaded) {
          id = loaded
          lastTool = null
        }
        continue
      }
      if (entry.type !== 'assistant' || part.type !== 'tool_use' || !part.name?.startsWith(LOG_TOOL_PREFIX)) continue
      const tool = part.name.slice(LOG_TOOL_PREFIX.length)
      if (tool !== 'getGuide') lastTool = tool
      else if (part.input?.clearPlay === true) {
        id = null
        lastTool = null
      } else if (part.input?.ask && part.id) asks.add(part.id)
      else if (part.input?.useCase) {
        id = part.input.useCase
        lastTool = null
      }
    }
  }
  return id ? { id, lastTool } : null
}

export function playReminder(play: SessionPlay, page: string): string {
  const steps = stepsOf(page)
  const title = (/^# (.+)$/m.exec(page)?.[1] ?? play.id).trim()
  const at = play.lastTool ? steps.findIndex((s) => s.tools.includes(play.lastTool as string)) : -1
  const lines = [`>>> ACTIVE PLAY: this session loaded ${play.id} (${title}) before the context was summarised.`]
  lines.push(at >= 0 ? `The last log call was ${play.lastTool}, step ${steps[at].n}; the next is step ${steps[at + 1]?.n ?? steps[at].n}.` : 'No step of it has run yet, or the last call was not one of its steps.')
  for (const [i, s] of steps.entries()) lines.push(`  ${i <= at ? 'done' : 'todo'} ${s.n}. ${s.step.replace(/\*\*/g, '').slice(0, 140)} (${s.tools.join(', ') || 'the agent'})`)
  lines.push(`Its full page loads again with getGuide({ useCase: "${play.id}" }).`)
  return lines.join('\n')
}
