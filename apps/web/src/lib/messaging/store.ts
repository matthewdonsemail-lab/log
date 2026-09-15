import { loadPersistedState, savePersistedState } from '../persist'
import { FACEBOOK_SEEDS } from './facebook/mock'
import { identityFor, MESSAGING_IDENTITIES } from './identities'
import { REDDIT_SEEDS } from './reddit/mock'
import { X_SEEDS } from './twitter/mock'
import type {
  AckResponse,
  ChatMessage,
  MessagingPlatform,
  SendInput,
  StartThreadInput,
  Thread,
  ThreadResult,
} from './types'

/**
 * In-memory multi-account messaging store.
 *
 * Layout: `store[platform][accountId]` — each account owns its threads and
 * its message lists, exactly like the platforms: no X DM is visible from a
 * Facebook session, two X accounts never see each other's inboxes, and a
 * thread only exists under the account that opened it.
 *
 * Reads and writes go through this store only; the Hono route layers in
 * `routes.ts` are a thin reference implementation over it (see
 * `API_ROUTES` in `lib/api/scopes.ts` for the live scope-gate mapping).
 *
 * An account with no seed is not an error — a fresh connection simply has an
 * empty inbox, so unknown account ids resolve to an empty slice on read and
 * are created lazily on write.
 */

export interface PlatformSeed {
  threads: Thread[]
  messages: Record<string, ChatMessage[]>
}

/** One account's slice: its threads plus each thread's ordered message list. */
export type AccountStore = PlatformSeed
export type StoreShape = Record<MessagingPlatform, Record<string, AccountStore>>

const PLATFORMS: readonly MessagingPlatform[] = ['facebook', 'x', 'reddit']

function emptyAccount(): AccountStore {
  return { threads: [], messages: {} }
}

function seedStore(): StoreShape {
  // Structural clone: seeds are imported module constants and the store mutates
  // them in place (preview/updatedAt/unread), so a reset would be a no-op
  // unless every re-seed starts from pristine copies.
  const raw = {
    facebook: buildPlatformStore(FACEBOOK_SEEDS),
    x: buildPlatformStore(X_SEEDS),
    reddit: buildPlatformStore(REDDIT_SEEDS),
  }
  return JSON.parse(JSON.stringify(raw)) as StoreShape
}

function buildPlatformStore(seeds: Record<string, PlatformSeed>): Record<string, AccountStore> {
  const out: Record<string, AccountStore> = {}
  for (const identity of MESSAGING_IDENTITIES) out[identity.accountId] = emptyAccount()
  for (const [accountId, seed] of Object.entries(seeds)) out[accountId] = seed
  return out
}

function isAccountStore(value: unknown): value is AccountStore {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (!Array.isArray(v.threads) || typeof v.messages !== 'object' || v.messages === null) return false
  return v.threads.every((t) => (typeof t === 'object' && t !== null && typeof (t as Thread).id === 'string'))
}

function isMessagingStore(value: unknown): value is StoreShape {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return PLATFORMS.every((platform) => {
    const slice = v[platform]
    if (typeof slice !== 'object' || slice === null) return false
    return Object.values(slice as Record<string, unknown>).every(isAccountStore)
  })
}

const KEY = 'messaging'

/** Seed on first load; localStorage afterwards (browser only — node/vitest run pure seeds). */
let store: StoreShape = (() => {
  const persisted = loadPersistedState(KEY, isMessagingStore)
  return persisted ?? seedStore()
})()
let saveSuspended = false

function persist(): void {
  if (!saveSuspended) savePersistedState(KEY, JSON.parse(JSON.stringify(store)))
}

/** Quietly reset to pristine seeds (used by tests between cases). */
export function resetMessagingStore(): void {
  saveSuspended = true
  try {
    store = seedStore()
  } finally {
    saveSuspended = false
  }
}

/** The account's slice, creating an empty inbox on first sight. */
function accountOrEmpty(platform: MessagingPlatform, accountId: string): AccountStore {
  let slice = store[platform][accountId]
  if (!slice) {
    slice = emptyAccount()
    store[platform][accountId] = slice
  }
  return slice
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Newest first. */
export function listThreads(platform: MessagingPlatform, accountId: string): Thread[] {
  return [...accountOrEmpty(platform, accountId).threads].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function getThread(platform: MessagingPlatform, accountId: string, threadId: string): Thread | undefined {
  return accountOrEmpty(platform, accountId).threads.find((t) => t.id === threadId)
}

export function getThreadMessages(platform: MessagingPlatform, accountId: string, threadId: string): ChatMessage[] | undefined {
  const slice = accountOrEmpty(platform, accountId)
  if (!slice.threads.some((t) => t.id === threadId)) return undefined
  return slice.messages[threadId] ?? []
}

// ---------------------------------------------------------------------------
// Native id synthesis
// ---------------------------------------------------------------------------

function rand36(len: number): string {
  let out = ''
  while (out.length < len) out += Math.random().toString(36).slice(2)
  return out.slice(0, len)
}

/** A plausible platform-native message id for the platform. */
function synthesizeMessageId(platform: MessagingPlatform): string {
  switch (platform) {
    case 'x':
      // dm event id — 19 digits, in the seeded era
      return String(1_585_000_000_000_000_000n + BigInt(Math.floor(Math.random() * 100_000_000_000_000)))
    case 'facebook':
      return `fbm_${rand36(8)}`
    case 'reddit':
      return `t4_${rand36(9)}`
  }
}

function synthesizeThreadId(platform: MessagingPlatform, accountId: string, participantId: string, firstMessageId: string): string {
  switch (platform) {
    case 'x': {
      // dm_conversation_id for a 1:1 conversation: senderId-participantId
      const selfId = identityFor(accountId)?.platformUserId ?? accountId
      return `${selfId}-${participantId}`
    }
    case 'facebook':
      // numeric conversation id (the thread_key)
      return String(3_430_000_000_000_000 + Math.floor(Math.random() * 999_999_999))
    case 'reddit':
      // first_message_name — the t4_ fullname of the thread's first message
      return firstMessageId
  }
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export class StoreError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

function buildMessage(platform: MessagingPlatform, threadId: string, input: SendInput, localSeq: number): ChatMessage {
  return {
    id: `${threadId}-m${localSeq}`,
    threadId,
    from: 'me',
    platformMessageId: synthesizeMessageId(platform),
    body: input.body,
    sentAt: new Date().toISOString(),
    ...(input.image ? { image: input.image } : {}),
    ...(input.replyToPlatformMessageId
      ? { replyTo: { platformMessageId: input.replyToPlatformMessageId } }
      : {}),
  }
}

/**
 * Send into an existing thread. The thread must exist under the calling
 * account (404 otherwise — never leaking cross-account thread existence);
 * body must be non-empty (400); a reply target must resolve within the
 * thread (400).
 */
export function sendMessage(platform: MessagingPlatform, accountId: string, threadId: string, input: SendInput): ThreadResult {
  const slice = accountOrEmpty(platform, accountId)
  const thread = slice.threads.find((t) => t.id === threadId)
  if (!thread) throw new StoreError(404, 'thread_not_found', 'Thread not found for this account.')
  if (!input.body.trim()) throw new StoreError(400, 'empty_message', 'A message needs text.')
  if (
    input.replyToPlatformMessageId &&
    !(slice.messages[threadId] ?? []).some((m) => m.platformMessageId === input.replyToPlatformMessageId)
  ) {
    throw new StoreError(400, 'reply_target_missing', 'Reply target is not in this thread.')
  }
  const message = buildMessage(platform, threadId, input, (slice.messages[threadId] ?? []).length + 1)
  slice.messages[threadId] = [...(slice.messages[threadId] ?? []), message]
  thread.preview = input.body || 'Photo'
  thread.updatedAt = message.sentAt
  persist()
  return { message, thread }
}

/**
 * Start a new conversation. Mirrors what every platform's compose does
 * natively: X `POST /2/dm_conversations/with/:participant_id/messages`,
 * Facebook send-to-user with no existing thread, Reddit compose-to-username.
 * None of the platforms allow an empty conversation, so the first message is
 * the compose body.
 */
export function startThread(platform: MessagingPlatform, accountId: string, input: StartThreadInput): ThreadResult {
  const slice = accountOrEmpty(platform, accountId)
  if (!input.platformParticipantId.trim()) throw new StoreError(400, 'empty_message', 'A thread needs a recipient id.')
  if (!input.body.trim()) throw new StoreError(400, 'empty_message', 'A thread starts with a message.')
  if (slice.threads.some((t) => t.platformParticipantId === input.platformParticipantId)) {
    throw new StoreError(409, 'thread_already_exists', 'A thread with that participant already exists for this account.')
  }
  const identity = identityFor(accountId)
  // The native client already carries the participant profile when composing,
  // so start accepts display hints; the mock falls back to the id itself.
  const name = input.name ?? (platform === 'x' ? `@${input.handle ?? input.platformParticipantId}` : input.handle ?? input.platformParticipantId)
  const threadId = `gen-${rand36(8)}`
  const message = buildMessage(platform, threadId, input, 1)
  const thread: Thread = {
    id: threadId,
    platform,
    accountId,
    platformThreadId: synthesizeThreadId(platform, accountId, input.platformParticipantId, message.platformMessageId),
    platformParticipantId: input.platformParticipantId,
    participant: {
      name,
      ...(input.handle ? { handle: input.handle } : {}),
      initials: name.replace(/^[@u/]+/, '').slice(0, 2).toUpperCase() || '?',
      color: identity?.self.color ?? '#6B7280',
    },
    ...(platform === 'reddit' && input.subject ? { subject: input.subject } : {}),
    preview: input.body,
    updatedAt: message.sentAt,
    unread: 0,
  }
  slice.threads.push(thread)
  slice.messages[threadId] = [message]
  persist()
  return { message, thread }
}

/**
 * Mark a thread read for the account's session — what opening a
 * conversation does in each native client.
 */
export function acknowledgeThread(platform: MessagingPlatform, accountId: string, threadId: string): AckResponse {
  const slice = accountOrEmpty(platform, accountId)
  const thread = slice.threads.find((t) => t.id === threadId)
  if (!thread) throw new StoreError(404, 'thread_not_found', 'Thread not found for this account.')
  const acknowledged = thread.unread
  thread.unread = 0
  persist()
  return { threadId, acknowledged }
}