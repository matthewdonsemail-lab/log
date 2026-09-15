import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { FACEBOOK_MESSAGES, FACEBOOK_THREADS } from './mock'
import { ThreadsResponseJson, MessagesResponseJson, errorResponse } from '../../openapi'

export const facebookMessagingApp = new Hono()
  .get('/threads', describeRoute({ operationId: 'listFacebookThreads', tags: ['Messaging'], summary: 'List Facebook threads', description: 'Code: apps/web/src/lib/messaging/facebook/server.ts:5', responses: { 200: { description: 'Threads.', content: { 'application/json': { schema: ThreadsResponseJson } } } } }), (c) => c.json({ threads: FACEBOOK_THREADS }))
  .get('/threads/:threadId/messages', describeRoute({ operationId: 'listFacebookMessages', tags: ['Messaging'], summary: 'List Facebook messages', description: 'Code: apps/web/src/lib/messaging/facebook/server.ts:6', parameters: [{ name: 'threadId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Messages.', content: { 'application/json': { schema: MessagesResponseJson } } }, 404: errorResponse('Thread not found') } }), (c) => {
    const threadId = c.req.param('threadId')
    const messages = FACEBOOK_MESSAGES[threadId]
    if (!messages) return c.json({ error: 'Thread not found' }, 404)
    return c.json({ threadId, messages })
  })
