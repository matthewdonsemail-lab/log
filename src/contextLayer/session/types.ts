export const TRANSCRIPT_TAIL_BYTES = 4_000_000

export const LOG_TOOL_PREFIX = 'mcp__log__'

export interface SessionPlay {
  id: string
  lastTool: string | null
}
