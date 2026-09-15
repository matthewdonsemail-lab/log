import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { MOCK_CONNECTIONS } from './mock'
import type { ConnectionPlatform, ConnectionRecord } from './types'
import { AccountsResponseJson, AccountCreateResponseJson, errorResponse } from '../openapi'

/**
 * Hono-shaped connections API. In-memory mock backed by MOCK_CONNECTIONS —
 * the real endpoints come from the camoufox clients (facebook-camofox-client
 * & co.) and the accounts service; when that backend lands, point the client
 * at it. Routes and response shapes stay the same, and this is the only
 * place account CRUD is allowed to flow.
 */
const accounts: ConnectionRecord[] = [...MOCK_CONNECTIONS]

export const connectionsApp = new Hono()
  .get('/accounts', describeRoute({ operationId: 'listAccounts', tags: ['Accounts'], summary: 'List accounts', description: 'Returns all connected platform accounts (`ConnectionRecord[]` with `id`, `platform` facebook/x/reddit, `label`, and `connectedAt`). This is the roster the dashboard\'s Accounts table and every group/listings scope picker reads. No parameters. Code: apps/web/src/lib/connections/server.ts:15', responses: { 200: { description: 'Account list.', content: { 'application/json': { schema: AccountsResponseJson } } } } }), (c) => c.json({ accounts: [...accounts] }))
  .post('/accounts', describeRoute({ operationId: 'createAccount', tags: ['Accounts'], summary: 'Create account', description: 'Creates a new `ConnectionRecord` for `platform` facebook/x/reddit. Generates a stable `id` (`account-<timestamp>-<rand>`), sets `label` from the platform name, and `connectedAt: null` until the extension verifies the session. Returns `201` with the created record and the full list. Rejects unknown platforms with `400 platform must be facebook, x, or reddit`. Code: apps/web/src/lib/connections/server.ts:16', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { platform: { type: 'string', enum: ['facebook','x','reddit'], description: 'Platform to connect.' } }, required: ['platform'] } } } }, responses: { 201: { description: 'Created.', content: { 'application/json': { schema: AccountCreateResponseJson } } }, 400: errorResponse('platform must be facebook, x, or reddit') } }), async (c) => {
    const body = await c.req.json<{ platform?: string }>().catch(() => null)
    const platform = body?.platform
    if (platform !== 'facebook' && platform !== 'x' && platform !== 'reddit') {
      return c.json({ error: 'platform must be facebook, x, or reddit' }, 400)
    }
    const record: ConnectionRecord = {
      id: `account-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      platform: platform as ConnectionPlatform,
      label: platform === 'facebook' ? 'Facebook' : platform === 'x' ? 'X' : 'Reddit',
      viaProxy: false,
      connectedAt: null
    }
    accounts.push(record)
    return c.json({ account: record, accounts: [...accounts] }, 201)
  })
  .patch('/accounts/:accountId', describeRoute({ operationId: 'updateAccount', tags: ['Accounts'], summary: 'Update account', description: 'Patches the `ConnectionRecord` for `:accountId` — merges the JSON body over the stored record but keeps `id` immutable (`id` from the path always wins). Used by the dashboard to toggle `viaProxy`, update labels, or stamp `connectedAt` after extension verification. Returns `404 Account not found` if the id is unknown. Code: apps/web/src/lib/connections/server.ts:32', parameters: [{ name: 'accountId', in: 'path', required: true, schema: { type: 'string', description: 'Account id.' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', description: 'Partial ConnectionRecord patch (id is ignored).' } } } }, responses: { 200: { description: 'Updated list.', content: { 'application/json': { schema: AccountsResponseJson } } }, 404: errorResponse('Account not found') } }), async (c) => {
    const body = await c.req.json<ConnectionRecord>().catch(() => null)
    const index = accounts.findIndex((a) => a.id === c.req.param('accountId'))
    if (index === -1 || !body) return c.json({ error: 'Account not found' }, 404)
    accounts[index] = {
      ...accounts[index],
      ...body,
      id: accounts[index].id
    }
    return c.json({ accounts: [...accounts] })
  })
  .delete('/accounts/:accountId', describeRoute({ operationId: 'deleteAccount', tags: ['Accounts'], summary: 'Delete account', description: 'Hard-deletes the account row by `accountId`. The row leaves the store entirely and is removed from any community join relations on next read. Returns `404 Account not found` for unknown ids. Code: apps/web/src/lib/connections/server.ts:43', parameters: [{ name: 'accountId', in: 'path', required: true, schema: { type: 'string', description: 'Account id.' } }], responses: { 200: { description: 'Remaining list.', content: { 'application/json': { schema: AccountsResponseJson } } }, 404: errorResponse('Account not found') } }), (c) => {
    const index = accounts.findIndex((a) => a.id === c.req.param('accountId'))
    if (index === -1) return c.json({ error: 'Account not found' }, 404)
    accounts.splice(index, 1)
    return c.json({ accounts: [...accounts] })
  })

export type ConnectionsApp = typeof connectionsApp