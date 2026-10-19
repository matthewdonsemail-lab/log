import type { SessionReply } from '../types'

/**
 * Feed stdout chunks in, get whole reply lines out. Pure apart from the
 * buffer it returns: `{ replies, rest }`, where `rest` is the unfinished line.
 * Lines that aren't JSON replies are ignored (they shouldn't happen: the
 * session moves library prints to stderr).
 */
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
      // not a reply line
    }
  }
  return { replies, rest }
}
