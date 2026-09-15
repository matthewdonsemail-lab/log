import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { REDDIT_MESSAGES, REDDIT_THREADS } from './mock'
import { ThreadsResponseJson, MessagesResponseJson, errorResponse } from '../../openapi'

export const redditMessagingApp = new Hono()
  .get('/threads', describeRoute({ operationId: 'listRedditThreads', tags: ['Messaging'], summary: 'List Reddit threads', description: 'Code: apps/web/src/lib/messaging/reddit/server.ts:5', responses: { 200: { description: 'Threads.', content: { 'application/json': { schema: ThreadsResponseJson } } } } }), (c) => c.json({ threads: REDDIT_THREADS }))
  .get('/threads/:threadId/messages', describeRoute({ operationId: 'listRedditMessages', tags: ['Messaging'], summary: 'List Reddit messages', description: 'Code: apps/web/src/lib/messaging/reddit/server.ts:6', parameters: [{ name: 'threadId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Messages.', content: { 'application/json': { schema: MessagesResponseJson } } }, 404: errorResponse('Thread not found') } }), (c) => {
    const threadId = c.req.param('threadId')
    const messages = REDDIT_MESSAGES[threadId]
    if (!messages) return c.json({ error: 'Thread not found' }, 404)
    return c.json({ threadId, messages })
  })
