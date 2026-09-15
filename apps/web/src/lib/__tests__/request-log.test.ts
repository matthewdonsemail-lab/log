import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { connectionsApp } from '../connections/server'
import { mockApiApp } from '../mock-api'
import { redactForLog, requestLogger } from '../request-log'

describe('redactForLog', () => {
  it('strips secret-bearing fields by name, including nested ones', () => {
    expect(
      redactForLog({
        apiKey: { id: 'key-1', secretHash: 'deadbeef' },
        key: 'lk_live_full-plaintext',
        nested: [{ deviceKey: 'bark-key', cookie: 'pasted-cookie', label: 'Bark push' }]
      })
    ).toEqual({
      apiKey: { id: 'key-1', secretHash: '[redacted]' },
      key: '[redacted]',
      nested: [{ deviceKey: '[redacted]', cookie: '[redacted]', label: 'Bark push' }]
    })
  })
})

describe('requestLogger', () => {
  it('logs method, path, status, and redacted bodies when enabled', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      const app = new Hono()
        .use('*', requestLogger({ enabled: true }))
        .post('/api-keys', (c) =>
          c.json({ apiKey: { id: 'key-1', secretHash: 'deadbeef' }, key: 'lk_live_full-plaintext' }, 201)
        )
      const res = await app.request('/api-keys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cookie: 'pasted-cookie' })
      })
      // The middleware reads clones — the real response still arrives intact.
      expect(res.status).toBe(201)
      expect(await res.json()).toEqual({
        apiKey: { id: 'key-1', secretHash: 'deadbeef' },
        key: 'lk_live_full-plaintext'
      })
      expect(log).toHaveBeenCalledTimes(1)
      const line = String(log.mock.calls[0]?.[0] ?? '')
      expect(line).toContain('[mock-api:api-keys]')
      expect(line).toContain('POST /api-keys')
      expect(line).toContain('201')
      expect(line).toContain('[redacted]')
      expect(line).not.toContain('lk_live_full-plaintext')
      expect(line).not.toContain('deadbeef')
      expect(line).not.toContain('pasted-cookie')
    } finally {
      log.mockRestore()
    }
  })

  it('stays silent when disabled', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      const app = new Hono()
        .use('*', requestLogger({ enabled: false }))
        .get('/ping', (c) => c.json({ ok: true }))
      const res = await app.request('/ping')
      expect(res.status).toBe(200)
      expect(log).not.toHaveBeenCalled()
    } finally {
      log.mockRestore()
    }
  })

  it('logs exactly once per request arriving through the mounted root, labeled by domain', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.stubEnv('MOCK_API_LOG_REQUESTS', '1')
    try {
      const res = await mockApiApp.request('/accounts')
      expect(res.status).toBe(200)
      await res.json()
      const lines = log.mock.calls.map((call) => String(call[0] ?? ''))
      expect(lines).toHaveLength(1)
      expect(lines[0]).toContain('[mock-api:accounts]')
      expect(lines[0]).toContain('GET /accounts')
    } finally {
      vi.unstubAllEnvs()
      log.mockRestore()
    }
  })

  it('labels messaging traffic per platform', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.stubEnv('MOCK_API_LOG_REQUESTS', '1')
    try {
      const res = await mockApiApp.request('/messaging/x/threads?accountId=probe')
      expect(res.status).toBe(200)
      await res.json()
      const lines = log.mock.calls.map((call) => String(call[0] ?? ''))
      expect(lines).toHaveLength(1)
      expect(lines[0]).toContain('[mock-api:messaging/x]')
    } finally {
      vi.unstubAllEnvs()
      log.mockRestore()
    }
  })

  it('logs direct leaf-app calls the way dashboard clients invoke them', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.stubEnv('MOCK_API_LOG_REQUESTS', '1')
    try {
      const res = await connectionsApp.request('/accounts')
      expect(res.status).toBe(200)
      await res.json()
      const lines = log.mock.calls.map((call) => String(call[0] ?? ''))
      expect(lines).toHaveLength(1)
      expect(lines[0]).toContain('[mock-api:accounts]')
      expect(lines[0]).toContain('GET /accounts')
    } finally {
      vi.unstubAllEnvs()
      log.mockRestore()
    }
  })
})
