import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { TWITTER_MESSAGES, TWITTER_THREADS } from './mock'
import { ThreadsResponseJson, MessagesResponseJson, errorResponse } from '../../openapi'

export const twitterMessagingApp = new Hono()
  .get('/threads', describeRoute({ operationId: 'listXThreads', tags: ['Messaging'], summary: 'List X threads', description: 'Also served at legacy /twitter alias. Code: apps/web/src/lib/messaging/twitter/server.ts:5', responses: { 200: { description: 'Threads.', content: { 'application/json': { schema: ThreadsResponseJson } } } } }), (c) => c.json({ threads: TWITTER_THREADS }))
  .get('/threads/:threadId/messages', describeRoute({ operationId: 'listXMessages', tags: ['Messaging'], summary: 'List X messages', description: 'Also at /twitter alias. Code: apps/web/src/lib/messaging/twitter/server.ts:6', parameters: [{ name: 'threadId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Messages.', content: { 'application/json': { schema: MessagesResponseJson } } }, 404: errorResponse('Thread not found') } }), (c) => {
    const threadId = c.req.param('threadId')
    const messages = TWITTER_MESSAGES[threadId]
    if (!messages) return c.json({ error: 'Thread not found' }, 404)
    return c.json({ threadId, messages })
  })
