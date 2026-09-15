import type { Context } from 'hono'
import { describeRoute } from 'hono-openapi'
import { Hono } from 'hono'
import {
  AckJson,
  errorResponse,
  FacebookMessagesJson,
  FacebookSendResultJson,
  FacebookThreadsJson,
  RedditMessagesJson,
  RedditSendResultJson,
  RedditThreadsJson,
  SendMessageInputJson,
  SendMessageInputSchema,
  StartThreadInputJson,
  StartThreadInputSchema,
  XMessagesJson,
  XSendResultJson,
  XThreadsJson
} from '../openapi'
import { acknowledgeThread, getThread, getThreadMessages, listThreads, sendMessage, startThread, StoreError } from './store'
import type { MessagingPlatform, ThreadResult } from './types'

/**
 * The shared messaging route factory.
 *
 * One implementation serves all three platforms — the per-platform
 * difference is the native id shape, which lives in the OpenAPI schemas
 * (the literal platform + described `platformThreadId`/`platformMessageId`),
 * not in the handler logic. Each platform file mounts this factory at its
 * canonical prefix (`/messaging/x` etc.).
 *
 * Every route takes `?accountId=` (FK to /accounts, required): an inbox
 * belongs to one connected account, and threads never cross accounts. Live
 * authorization runs through `API_ROUTES` in `lib/api/scopes.ts` — these
 * handlers are the reference implementation those scopes gate.
 */

const ACCOUNT_PARAM = {
  name: 'accountId',
  in: 'query' as const,
  required: true,
  schema: { type: 'string' as const },
  description: 'FK to /accounts — whose inbox this. Required: an inbox belongs to one connected account.'
}

const CODE = 'Code: apps/web/src/lib/messaging/routes.ts'

export function buildMessagingRoutes(platform: MessagingPlatform): Hono {
  const capital = platform === 'x' ? 'X' : platform[0].toUpperCase() + platform.slice(1)
  const article = capital === 'X' ? 'an' : 'a'
  const [threadsJson, messagesJson, resultJson] =
    platform === 'facebook'
      ? [FacebookThreadsJson, FacebookMessagesJson, FacebookSendResultJson]
      : platform === 'x'
        ? [XThreadsJson, XMessagesJson, XSendResultJson]
        : [RedditThreadsJson, RedditMessagesJson, RedditSendResultJson]

  /** Missing `?accountId=` → 400; otherwise run the store call, mapping StoreError → status. */
  function guard(c: Context, run: (accountId: string) => unknown): Response {
    const accountId = c.req.query('accountId')
    if (!accountId) return c.json({ error: 'Missing ?accountId= — an inbox belongs to a connected account.' }, 400)
    try {
      return c.json(run(accountId) as never)
    } catch (err) {
      if (err instanceof StoreError) return c.json({ error: err.message }, err.status as 400 | 404 | 409)
      throw err
    }
  }

  return new Hono()
    .get(
      '/threads',
      describeRoute({
        operationId: `list${capital}Threads`,
        tags: ['Messaging'],
        summary: `List ${capital} threads`,
        description: `The connected account's inbox, newest first. Every thread carries the platform-native ids the unofficial browser client sees (${
          platform === 'x'
            ? 'dm_conversation_id — for 1:1 DMs the two participant user ids joined with a dash, on each dm_event'
            : platform === 'facebook'
              ? 'the numeric conversation id (thread_key) of the Messenger conversation object'
              : 'first_message_name — inbox and outbox message listings grouped by the t4_ id of the thread first message'
        }). ${CODE}.`,
        parameters: [ACCOUNT_PARAM],
        responses: {
          200: { description: 'Threads.', content: { 'application/json': { schema: threadsJson } } },
          400: errorResponse('Missing ?accountId=')
        }
      }),
      (c) => guard(c, (accountId) => ({ threads: listThreads(platform, accountId) }))
    )
    .post(
      '/threads',
      describeRoute({
        operationId: `start${capital}Thread`,
        tags: ['Messaging'],
        summary: `Start ${article} ${capital} conversation`,
        description: `The normalized compose: ${
          platform === 'x'
            ? 'stands in for POST /2/dm_conversations/with/:participant_id/messages — the conversation is created and the first message lands in one call'
            : platform === 'facebook'
              ? 'stands in for send-to-user with no existing thread — the first message creates the conversation'
              : 'stands in for Reddit compose-to-username, which opens a private-message thread by its first message'
        }. None of the three platforms allow an empty conversation, so composing always sends the first message. Media is uploaded through the platform first (see body.image). Starting a thread a participant already has is 409. ${CODE}.`,
        parameters: [ACCOUNT_PARAM],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: StartThreadInputJson }
          }
        },
        responses: {
          201: { description: 'The created thread plus its first message.', content: { 'application/json': { schema: resultJson } } },
          400: errorResponse('Malformed body, missing ?accountId=, or empty compose.'),
          409: errorResponse('A thread with that participant already exists for this account.')
        }
      }),
      async (c) => {
        const accountId = c.req.query('accountId')
        if (!accountId) return c.json({ error: 'Missing ?accountId= — an inbox belongs to a connected account.' }, 400)
        const body: unknown = await c.req.json().catch(() => null)
        const parsed = StartThreadInputSchema.safeParse(body)
        if (!parsed.success) {
          return c.json({ error: `Invalid request body: ${parsed.error.issues[0]?.message ?? 'malformed JSON'}.` }, 400)
        }
        try {
          const result: ThreadResult = startThread(platform, accountId, parsed.data)
          return c.json(result, 201)
        } catch (err) {
          if (err instanceof StoreError) return c.json({ error: err.message }, err.status as 400 | 409)
          throw err
        }
      }
    )
    .get(
      '/threads/:threadId/messages',
      describeRoute({
        operationId: `list${capital}Messages`,
        tags: ['Messaging'],
        summary: `List ${capital} messages`,
        description: `The thread plus its full message list, oldest first — the normalized view of ${
          platform === 'x'
            ? 'the dm_events stream filtered by dm_conversation_id (event_type MessageCreate)'
            : platform === 'facebook'
              ? 'the conversation'
              : 'the inbox + outbox children sharing this first_message_name'
        } message set. A thread only resolves under the account that owns it: any other account gets 404, never a leak. ${CODE}.`,
        parameters: [
          { name: 'threadId', in: 'path', required: true, schema: { type: 'string' } },
          ACCOUNT_PARAM
        ],
        responses: {
          200: { description: 'Thread + messages.', content: { 'application/json': { schema: messagesJson } } },
          400: errorResponse('Missing ?accountId='),
          404: errorResponse('Thread not found for this account')
        }
      }),
      (c) =>
        guard(c, (accountId) => {
          const threadId = c.req.param('threadId')
          const thread = getThread(platform, accountId, threadId)
          if (!thread) throw new StoreError(404, 'thread_not_found', 'Thread not found for this account.')
          return {
            threadId,
            accountId,
            thread,
            messages: getThreadMessages(platform, accountId, threadId) ?? []
          }
        })
    )
    .post(
      '/threads/:threadId/messages',
      describeRoute({
        operationId: `send${capital}Message`,
        tags: ['Messaging'],
        summary: `Send ${article} ${capital} message`,
        description: `Send into an existing thread as the calling account — normalized from ${
          platform === 'x'
            ? 'the dm_event MessageCreate write; the created event comes back with its 19-digit event id'
            : platform === 'facebook'
              ? 'the POSTed conversation message; it comes back with its mid'
              : 'the posted inbox message; it comes back with its t4_ id'
        }. The response echoes the created message plus the thread with preview/updatedAt in sync, so a client can reconcile its optimistic bubble. ${CODE}.`,
        parameters: [
          { name: 'threadId', in: 'path', required: true, schema: { type: 'string' } },
          ACCOUNT_PARAM
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: SendMessageInputJson }
          }
        },
        responses: {
          201: { description: 'The created message plus the updated thread.', content: { 'application/json': { schema: resultJson } } },
          400: errorResponse('Malformed body, missing ?accountId=, empty message, or unknown reply target.'),
          404: errorResponse('Thread not found for this account')
        }
      }),
      async (c) => {
        const accountId = c.req.query('accountId')
        if (!accountId) return c.json({ error: 'Missing ?accountId= — an inbox belongs to a connected account.' }, 400)
        const body: unknown = await c.req.json().catch(() => null)
        const parsed = SendMessageInputSchema.safeParse(body)
        if (!parsed.success) {
          return c.json({ error: `Invalid request body: ${parsed.error.issues[0]?.message ?? 'malformed JSON'}.` }, 400)
        }
        try {
          const result: ThreadResult = sendMessage(platform, accountId, c.req.param('threadId'), parsed.data)
          return c.json(result, 201)
        } catch (err) {
          if (err instanceof StoreError) return c.json({ error: err.message }, err.status as 400 | 404)
          throw err
        }
      }
    )
    .post(
      '/threads/:threadId/ack',
      describeRoute({
        operationId: `ack${capital}Threads`,
        tags: ['Messaging'],
        summary: `Mark ${article} ${capital} thread read`,
        description: `Clears the thread's unread count for the calling account — what opening a conversation does in each native client. Idempotent: acking an already-read thread is a 200 with acknowledged: 0. ${CODE}.`,
        parameters: [
          { name: 'threadId', in: 'path', required: true, schema: { type: 'string' } },
          ACCOUNT_PARAM
        ],
        responses: {
          200: { description: 'Read state cleared.', content: { 'application/json': { schema: AckJson } } },
          400: errorResponse('Missing ?accountId='),
          404: errorResponse('Thread not found for this account')
        }
      }),
      (c) => guard(c, (accountId) => acknowledgeThread(platform, accountId, c.req.param('threadId')))
    )
}