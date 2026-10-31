import type { SessionReply } from '../types'

export function splitReplies(buffer: string, chunk: string): { replies: SessionReply[]; rest: string } {
  const lines = (buffer + chunk).split('\n')
  const rest = lines.pop() ?? ''
  const replies: SessionReply[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const parsed = JSON.parse(trimmed) as SessionReply
      if (parsed && typeof parsed === 'object' && 'result' in parsed) replies.push(parsed)
    } catch {
    }
  }
  return { replies, rest }
}
