import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { projectConsoleEvents } from '../../../../src/observability/console/helpers/projection'
import type { ConsoleDatabase } from '../../../../src/observability/console/types'

type ReadDatabase = ConsoleDatabase & { close: () => void; exec: (sql: string) => void }
const loopback = new Set(['localhost', '127.0.0.1', '[::1]'])

export function consoleEvents(): Plugin {
  return {
    name: 'logConsoleEvents',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/console/events', (request, response) => {
        response.setHeader('Cache-Control', 'no-store')
        response.setHeader('Content-Type', 'application/json')
        response.setHeader('X-Content-Type-Options', 'nosniff')
        let database: ReadDatabase | undefined
        try {
          const host = new URL(`http://${request.headers.host ?? ''}`)
          const remote = request.socket.remoteAddress ?? ''
          const origin = request.headers.origin ? new URL(request.headers.origin) : null
          if (!loopback.has(host.hostname) || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote) || (origin && origin.host !== host.host) || request.headers['sec-fetch-site'] === 'cross-site') {
            response.statusCode = 403
            response.end(JSON.stringify({ error: 'consoleWorkspaceAccessDenied' }))
            return
          }
          if (request.method !== 'GET') {
            response.statusCode = 405
            response.setHeader('Allow', 'GET')
            response.end(JSON.stringify({ error: 'consoleMethodNotAllowed' }))
            return
          }
          const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as { DatabaseSync: new (path: string, options: { readOnly: boolean }) => ReadDatabase }
          const path = process.env.LOG_DB || join(process.env.LOG_INBOX_STATE || join(homedir(), '.logCli'), 'log.db')
          database = new DatabaseSync(path, { readOnly: true })
          database.exec('BEGIN')
          const page = projectConsoleEvents(database)
          database.exec('COMMIT')
          response.end(JSON.stringify(page))
        } catch {
          response.statusCode = 503
          response.end(JSON.stringify({ error: 'consoleWorkspaceUnavailable' }))
        } finally {
          database?.close()
        }
      })
    },
  }
}
