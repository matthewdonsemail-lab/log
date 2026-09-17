import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { z } from 'zod'
import type { Backend } from './backend'

const platform = z.enum(['facebook', 'x', 'reddit'])
const accountInput = z.object({ platform, label: z.string().trim().min(1).max(120).optional() }).strict()
const filters = z.object({ platform: platform.optional(), search: z.string().max(500).optional() }).strict()
const syncInput = z.object({ subreddit: z.string().trim().regex(/^[A-Za-z0-9_]{1,21}$/), limit: z.number().int().min(1).max(25).default(25) }).strict()

type Dependencies = {
  verifyToken(token: string): Promise<void>
  backend(token: string): Backend
}

export function createApp(deps: Dependencies) {
  const app = new Hono<{ Variables: { backend: Backend } }>()
  app.get('/healthz', c => c.json({ ok: true }))
  app.use('/api/*', async (c, next) => {
    const header = c.req.header('Authorization')
    const match = header?.match(/^Bearer ([^\s]+)$/i)
    if (!match) return c.json({ error: 'Authentication required' }, 401)
    try { await deps.verifyToken(match[1]) } catch {
      return c.json({ error: 'Invalid or expired access token' }, 401)
    }
    c.set('backend', deps.backend(match[1]))
    c.header('Cache-Control', 'no-store')
    await next()
  })
  app.use('/api/*', bodyLimit({ maxSize: 16 * 1024, onError: c => c.json({ error: 'Request too large' }, 413) }))
  app.get('/api/accounts', async c => c.json(await c.get('backend').listAccounts()))
  app.post('/api/accounts', async c => {
    const input = accountInput.safeParse(await c.req.json().catch(() => null))
    if (!input.success) return c.json({ error: 'Expected platform and optional label; unknown fields are not allowed' }, 400)
    const labels = { facebook: 'Facebook', x: 'X', reddit: 'Reddit' }
    return c.json(await c.get('backend').createAccount({
      platform: input.data.platform, label: input.data.label ?? labels[input.data.platform],
    }), 201)
  })
  app.get('/api/feed', async c => {
    const input = filters.safeParse(c.req.query())
    if (!input.success) return c.json({ error: 'Invalid feed filters' }, 400)
    return c.json(await c.get('backend').feed(input.data))
  })
  app.get('/api/feed/:platform', async c => {
    const input = filters.safeParse({ ...c.req.query(), platform: c.req.param('platform') })
    if (!input.success) return c.json({ error: 'Invalid feed filters' }, 400)
    return c.json(await c.get('backend').feed(input.data))
  })
  app.post('/api/feed/sync', async c => {
    const input = syncInput.safeParse(await c.req.json().catch(() => null))
    if (!input.success) return c.json({ error: 'Expected a subreddit of 1-21 letters, numbers or underscores with limit 1-25' }, 400)
    return c.json(await c.get('backend').syncReddit(input.data))
  })
  // Never proxy unknown operations to platform services or browser mocks.
  app.all('/api/*', c => c.json({ error: 'This live API operation is not implemented yet' }, 501))
  app.onError((_error, c) => c.json({ error: 'Backend request failed' }, 502))
  return app
}
