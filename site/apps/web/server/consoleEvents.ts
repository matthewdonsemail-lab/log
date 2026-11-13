import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { projectConsoleEvents } from '../../../../src/observability/console/helpers/projection'
import type { ConsoleDatabase } from '../../../../src/observability/console/types'
import { consoleRequestAllowed } from '../../../../src/console/web/helpers/guard'

type ReadDatabase = ConsoleDatabase & { close: () => void; exec: (sql: string) => void }

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
          const fetchSite = request.headers['sec-fetch-site']
          if (!consoleRequestAllowed({ host: request.headers.host, remote: request.socket.remoteAddress, origin: request.headers.origin, fetchSite: Array.isArray(fetchSite) ? fetchSite[0] : fetchSite })) {
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
