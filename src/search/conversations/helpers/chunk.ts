import { CHUNK_MESSAGES, CHUNK_OVERLAP } from '../types'
import type { Chunk, Conversation } from '../types'

export function speakerOf(conversation: Conversation, fromMe: boolean, from: string | null): string {
  if (fromMe) return conversation.account
  return from ?? conversation.with[0] ?? 'them'
}

export function chunksOf(conversation: Conversation, size = CHUNK_MESSAGES, overlap = CHUNK_OVERLAP): Chunk[] {
  const said = conversation.messages.filter((m) => m.text.trim())
  const step = Math.max(1, size - overlap)
  const out: Chunk[] = []
  for (let start = 0; start < said.length; start += step) {
    const window = said.slice(start, start + size)
    out.push({
      id: `${conversation.platform}:${conversation.account}:${conversation.conversationId}:${start}`,
      platform: conversation.platform,
      account: conversation.account,
      conversationId: conversation.conversationId,
      with: conversation.with,
      at: window[window.length - 1].at,
      messageIds: window.map((m) => m.id),
      text: window.map((m) => `@${speakerOf(conversation, m.fromMe, m.from)}: ${m.text.replace(/\s+/g, ' ').trim()}`).join('\n'),
    })
    if (start + size >= said.length) break
  }
  return out
}
