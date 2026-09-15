import type { Platform } from '../platform'

/** Canonical platform — X is always `x`, never `twitter`. */
export type MessagingPlatform = Platform

/**
 * How the other participant of a thread appears in the UI. The native
 * account behind it varies by platform (X user, Facebook user/page, Reddit
 * username); the mock resolves it to a name + handle + avatar styling.
 */
export interface Participant {
  name: string
  /** Platform handle when the platform has one: `@…` (X), `u/…` (Reddit); absent for Facebook. */
  handle?: string
  initials: string
  color: string
}

/**
 * Normalized thread — one per (account, other participant) pair.
 *
 * Every thread carries the platform-native ids from the object the
 * unofficial browser client actually sees, so the API stands in 1:1 with
 * the real transport:
 *
 *  - X: no conversation object in the shipped payloads — a DM conversation
 *    is identified by `dm_conversation_id` (`senderId-participantId`, the two
 *    user ids joined) carried on each dm_event.
 *  - Facebook: explicit conversation object with a numeric conversation id
 *    (the `thread_key` in UI payloads); messages carry `from`/`to`
 *    participant objects.
 *  - Reddit: no conversation object at all — inbox and outbox listings are
 *    flattened messages, and the client groups them by `first_message_name`
 *    (the `t4_` fullname of the thread's first message) to form threads.
 *
 * The mock synthesizes those native ids per platform so downstream code
 * treats all three the same.
 */
export interface Thread {
  id: string
  platform: MessagingPlatform
  /** Connected account that owns this thread — the "me" side of every message in it. */
  accountId: string
  /** Platform-native thread id: `dm_conversation_id` (X) / conversation id (Facebook) / `first_message_name` (Reddit). */
  platformThreadId: string
  /** Platform-native id of the other participant: X user id / Facebook user id / Reddit username. */
  platformParticipantId: string
  participant: Participant
  /** Reddit only: the PM subject line. Absent on X and Facebook. */
  subject?: string
  /** Latest message body (or `Photo` when the tail is an image). */
  preview: string
  /** ISO 8601 — normalized from the native clock (X `created_at` / FB `created_time` / Reddit `created_utc` × 1000). The client formats it. */
  updatedAt: string
  /** Messages from the other participant not yet read. */
  unread: number
}

/**
 * Normalized chat message.
 *
 * Shapes being normalized:
 *
 *  - X dm_event: `{ id, event_type: "MessageCreate", text, sender_id,
 *    created_at (ISO), dm_conversation_id, attachments[] }`
 *  - Facebook message: `{ id, message, created_time, from {id, name},
 *    to {id}, reply_to { message_id, is_self_reply } }`
 *  - Reddit listing child: `{ data: { id, name ("t4_…"), author, dest,
 *    subject, body, created_utc (unix seconds), new, was_comment } }`
 */
export interface ChatMessage {
  id: string
  threadId: string
  from: 'me' | 'them'
  /** Platform-native message id: dm event id (X) / `mid` (Facebook) / `t4_` fullname (Reddit). */
  platformMessageId: string
  body: string
  /** ISO 8601, normalized from the native clock (see {@link Thread.updatedAt}). */
  sentAt: string
  image?: string
  /** Reply to an earlier message in this thread (Facebook `reply_to` / X `reply_to_event_id` / Reddit thread chain). */
  replyTo?: {
    platformMessageId: string
    /** Facebook `is_self_reply`: this message replies to one of my own. */
    isSelfReply?: boolean
  }
}

/** GET /threads → `{ threads }` — every thread for the selected account (or all accounts when none is selected). */
export interface ThreadsResponse {
  threads: Thread[]
}

/** GET /threads/:threadId/messages → the thread plus its full message list. */
export interface MessagesResponse {
  threadId: string
  accountId: string
  thread: Thread
  messages: ChatMessage[]
}

/**
 * POST body for sending into an existing thread.
 *
 * The browser client composes in the platform's native UI; when the
 * normalized API is driven directly, media is uploaded through the platform's
 * own upload flow first (X `direct_messages_events` with
 * `attachments[].media_id`, Facebook attachment upload) and the URL/id is
 * passed back here — the API stays a chat-message endpoint, not an upload
 * endpoint.
 */
export interface SendInput {
  /** Plain text. Whitespace-only is rejected (400). */
  body: string
  /** Image URL from a prior native upload. */
  image?: string
  /** Reply to a message in the thread by its platform-native id; unknown ids are rejected (400). */
  replyToPlatformMessageId?: string
}

/**
 * POST /threads body — start a fresh conversation with a participant.
 *
 * This is what every platform's "compose" does natively: X
 * `POST /2/dm_conversations/with/:participant_id/messages`, Facebook send
 * with no existing thread, Reddit compose to a username. Sending starts the
 * thread — none of the platforms allow an empty conversation — so `body`
 * is the first message.
 */
export interface StartThreadInput {
  /** The recipient's platform-native id: X user id / Facebook user id / Reddit username (no `u/` prefix). */
  platformParticipantId: string
  /** First message — the compose body. Whitespace-only is rejected (400). */
  body: string
  image?: string
  /**
   * Display hints the native client already has open when composing (the
   * DM list, the member profile, the comment page). The mock accepts them
   * and falls back to rendering the id itself when absent.
   */
  name?: string
  handle?: string
  /** Reddit PM subject line; ignored on X and Facebook (they have none). */
  subject?: string
}

/** 201 for both send and start: the created message plus the thread with its preview/updatedAt in sync. */
export interface ThreadResult {
  message: ChatMessage
  thread: Thread
}

/** POST /threads/:threadId/ack → read state cleared for the account's session. */
export interface AckResponse {
  threadId: string
  /** Unread messages that were cleared. */
  acknowledged: number
}