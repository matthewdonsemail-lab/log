import { closeSync, existsSync, openSync, readSync, statSync } from 'node:fs'
import { stepsOf } from '../../mcp/server/helpers/activePlay.ts'
import { LOG_TOOL_PREFIX, TRANSCRIPT_TAIL_BYTES } from './types'
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

export function sessionPlayOf(transcript: string): SessionPlay | null {
  let id: string | null = null
  let lastTool: string | null = null
  for (const line of transcript.split('\n')) {
    if (!line.includes(LOG_TOOL_PREFIX)) continue
    let entry: { type?: string; message?: { content?: unknown } }
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }
    if (entry.type !== 'assistant' || !Array.isArray(entry.message?.content)) continue
    for (const part of entry.message.content as { type?: string; name?: string; input?: { useCase?: string } }[]) {
      if (part.type !== 'tool_use' || !part.name?.startsWith(LOG_TOOL_PREFIX)) continue
      const tool = part.name.slice(LOG_TOOL_PREFIX.length)
      if (tool === 'getGuide' && part.input?.useCase) {
        id = part.input.useCase
        lastTool = null
      } else if (tool !== 'getGuide') lastTool = tool
    }
  }
  return id ? { id, lastTool } : null
}

export function playReminder(play: SessionPlay, page: string): string {
  const steps = stepsOf(page)
  const title = (/^# (.+)$/m.exec(page)?.[1] ?? play.id).trim()
  const at = play.lastTool ? steps.findIndex((s) => s.tools.includes(play.lastTool as string)) : -1
  const lines = [`>>> ACTIVE PLAY (this session loaded it before the context was summarised): ${play.id}, ${title}.`]
  lines.push(at >= 0 ? `The last log call was ${play.lastTool}, step ${steps[at].n}. Carry on from step ${steps[at + 1]?.n ?? steps[at].n}.` : 'No step of it has run yet, or the last call was not one of its steps.')
  for (const [i, s] of steps.entries()) lines.push(`  ${i <= at ? 'done' : 'todo'} ${s.n}. ${s.step.replace(/\*\*/g, '').slice(0, 140)} (${s.tools.join(', ') || 'the agent'})`)
  lines.push(`Load it in full again before the next step with getGuide({ useCase: "${play.id}" }).`)
  return lines.join('\n')
}
