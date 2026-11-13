export const TRANSCRIPT_TAIL_BYTES = 4_000_000

export const LOG_TOOL_PREFIX = 'mcp__log__'

export const PLAY_LOADED = />>> PLAY (\w+\/\w+) is now this session's play/

export interface SessionPlay {
  id: string
  lastTool: string | null
}
