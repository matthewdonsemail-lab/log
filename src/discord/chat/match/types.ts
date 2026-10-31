export interface DiscordChat {
  id: string
  kind: string
  name: string | null
  members: string[]
}

export type ChatMatch =
  | { ok: true; chat: DiscordChat; label: string; how: 'id' | 'exact' | 'words' | 'prefix' }
  | { ok: false; code: 'chatNotFound' | 'chatAmbiguous'; detail: string; candidates: { id: string; label: string }[] }

export const FILLER_WORDS = ['the', 'a', 'my', 'our', 'group', 'groupchat', 'gc', 'chat', 'chats', 'dm', 'dms', 'with', 'community', 'server', 'channel', 'convo', 'conversation', 'thread', 'one', 'and', 'called', 'named', 'in', 'to', 'on', 'discord'] as const
