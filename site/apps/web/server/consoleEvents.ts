import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'
import { projectConsoleEvents } from '../../../../src/observability/console/helpers/projection'
import { readConsoleConnections, readConsoleCredentials } from '../../../../src/observability/console/helpers/connections'
import { projectUsageSummary } from '../../../../src/observability/usage/helpers/projection'
import { saveProviderCredentials } from '../../../../src/auth/credentials'
import { createAccountChecker } from './accountChecker'
import { validateProviderCredentials } from './credentialValidation'
import { createBrowserCheck } from './browserCheck'
import { launchOutcome } from './browserLaunch'
import { saveBrowserProvider } from './browserProvider'
import type { BrowserOperation } from '../shared/browserCheck'

type ReadDatabase = { close: () => void; exec: (sql: string) => void; prepare: (sql: string) => { all: (...params: (string | number)[]) => unknown[]; run: (...params: (string | number)[]) => unknown } }
const loopback = new Set(['localhost', '127.0.0.1', '[::1]'])

function openDatabase(readOnly: boolean) {
  const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as { DatabaseSync: new (path: string, options: { readOnly: boolean }) => ReadDatabase }
  const path = process.env.LOG_DB || join(process.env.LOG_INBOX_STATE || join(homedir(), '.logCli'), 'log.db')
  return new DatabaseSync(path, { readOnly })
}

async function bodyOf(request: IncomingMessage): Promise<Record<string, unknown>> {
  let text = ''
  for await (const chunk of request) {
    text += chunk.toString()
    if (text.length > 32768) throw new Error('consoleInputInvalid')
  }
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('consoleInputInvalid')
  return value
}

function checkRows(): Map<string, { state: string; checkedAt: string; launchOutcome?: ReturnType<typeof import('./browserLaunch').launchOutcome> }> {
  let database: ReadDatabase | undefined
  try {
    database = openDatabase(true)
    const rows = database.prepare("SELECT key, body, updatedAt FROM state WHERE scope = 'consoleAccountCheck'").all() as { key: string; body: string; updatedAt: number }[]
    return new Map(rows.map((row) => { const value = JSON.parse(row.body); return [row.key, { state: String(value.state), checkedAt: new Date(row.updatedAt).toISOString(), launchOutcome: value.launchOutcome }] }))
  } catch { return new Map() }
  finally { database?.close() }
}

function snapshot(activeAccountId: string | null) {
  const value = readConsoleConnections()
  const checks = checkRows()
  return { ...value, accounts: value.accounts.map((account) => {
    const held = checks.get(account.id)
    let outcome = held?.launchOutcome
    if (held && (!outcome || outcome.phase === 'launchUncertain' || outcome.reason.code === 'launchTooSoon')) {
      let database: ReadDatabase | undefined
      try {
        database = openDatabase(true)
        const rows = database.prepare("SELECT result, endedAt FROM jobs WHERE account = ? AND tool = 'inspectStart' AND status = 'failed' AND endedAt >= ? AND endedAt <= ? ORDER BY endedAt DESC LIMIT 1").all(account.name, new Date(Date.parse(held.checkedAt) - 2000).toISOString(), held.checkedAt) as { result: string; endedAt: string }[]
        if (rows[0]?.result) {
          const recorded = launchOutcome(JSON.parse(rows[0].result), rows[0].endedAt)
          if (recorded.phase !== 'launchUncertain') outcome = { ...recorded, reason: { ...recorded.reason, recordedAt: rows[0].endedAt } }
        }
      } catch {}
      finally { database?.close() }
    }
    return { ...account, lastCheck: held ? { ...held, launchOutcome: outcome, ...(held.state === 'running' && account.id !== activeAccountId ? { state: 'unknown' } : {}) } : null }
  }) }

}

export function consoleEvents(): Plugin {
  const keepOutcome = (id: string, state: string, launchOutcome?: ReturnType<typeof import('./browserLaunch').launchOutcome>) => {
    const database = openDatabase(false)
    try { database.prepare("INSERT INTO state (scope, key, body, updatedAt) VALUES ('consoleAccountCheck', ?, ?, ?) ON CONFLICT(scope, key) DO UPDATE SET body = excluded.body, updatedAt = excluded.updatedAt").run(id, JSON.stringify({ state, ...(launchOutcome ? { launchOutcome } : {}) }), Date.now()) }
    finally { database.close() }
  }
  const checker = createAccountChecker(fileURLToPath(new URL('../../../../', import.meta.url)), keepOutcome)
  const browser = createBrowserCheck(checker, keepOutcome)
  return {
    name: 'logConsoleEvents', apply: 'serve',
    configureServer(server) {
      server.httpServer?.once('close', () => { void checker.close() })
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost')
        const paths = ['/api/console/events', '/api/console/usage', '/api/console/connections', '/api/console/credentials', '/api/console/credentials/read', '/api/console/connections/check', '/api/console/browser', '/api/console/browser/frame']
        if (!paths.includes(url.pathname)) { next(); return }
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
            response.end(JSON.stringify({ error: 'consoleWorkspaceAccessDenied' })); return
          }
          const mutation = url.pathname === '/api/console/browser' || url.pathname.startsWith('/api/console/credentials') || url.pathname.endsWith('/check')
          if (request.method !== (mutation ? 'POST' : 'GET') || (mutation && (request.headers['x-log-console'] !== '1' || !request.headers['content-type']?.startsWith('application/json')))) {
            response.statusCode = 405
            response.setHeader('Allow', mutation ? 'POST' : 'GET')
            response.end(JSON.stringify({ error: 'consoleMethodNotAllowed' })); return
          }
          if (url.pathname === '/api/console/browser/frame') {
            const account = snapshot(checker.activeAccountId()).accounts.find((item) => item.id === url.searchParams.get('accountId'))
            if (!account) { response.statusCode = 404; response.end(JSON.stringify({ error: 'accountNotFound' })); return }
            const frame = await browser.frame(account, url.searchParams.get('viewerId') ?? '')
            response.setHeader('Content-Type', 'image/jpeg'); response.end(Buffer.from(frame)); return
          }
          if (mutation) {
            const body = await bodyOf(request)
            if (url.pathname === '/api/console/browser') {
              const account = snapshot(checker.activeAccountId()).accounts.find((item) => item.id === body.accountId)
              if (!account) { response.statusCode = 404; response.end(JSON.stringify({ error: 'accountNotFound' })); return }
              if (account.platform !== 'facebook' || typeof body.operation !== 'string' || !['status', 'open', 'linkProfile', 'verify', 'resolve', 'complete', 'input', 'back', 'reload', 'close'].includes(body.operation)) throw new Error('consoleInputInvalid')
              const operation = body.operation as BrowserOperation
              try { response.end(JSON.stringify({ view: await browser.operate(account, operation, body) })) }
              catch (error) {
                const latest = snapshot(checker.activeAccountId()).accounts.find((item) => item.id === account.id) ?? account
                const view = await browser.rejected(latest, operation, error)
                response.statusCode = 409
                response.end(JSON.stringify({ error: view.reason?.code ?? 'browserOperationUnconfirmed', view }))
              }
              return
            }
            if (url.pathname === '/api/console/credentials/read') {
              if (typeof body.provider !== 'string') throw new Error('credentialInputInvalid')
              response.end(JSON.stringify({ values: readConsoleCredentials(body.provider) })); return
            }
            if (url.pathname === '/api/console/credentials') {
              if (typeof body.provider !== 'string') throw new Error('credentialInputInvalid')
              if (body.provider === 'adsPower') {
                const values = body.values as Record<string, unknown> | undefined
                await saveBrowserProvider({ driver: 'adsPower', apiUrl: values?.ADSPOWER_HOST, key: values?.ADSPOWER_API_KEY ?? '', homes: values?.LOG_ADSPOWER_HOMES })
                response.end(JSON.stringify({ saved: true, connections: snapshot(checker.activeAccountId()) })); return
              }
              const values = await validateProviderCredentials(body.provider, body.values)
              const result = saveProviderCredentials(body.provider, values)
              response.end(JSON.stringify({ ...result, connections: snapshot(checker.activeAccountId()) })); return
            }
            const account = snapshot(checker.activeAccountId()).accounts.find((item) => item.id === body.accountId)
            if (!account) { response.statusCode = 404; response.end(JSON.stringify({ error: 'accountNotFound' })); return }
            if (account.platform === 'facebook') { response.statusCode = 409; response.end(JSON.stringify({ error: 'browserCheckRequired' })); return }
            if (account.status === 'deactivated') { response.statusCode = 409; response.end(JSON.stringify({ error: 'accountDeactivated' })); return }
            const stopped = ['checkpoint', 'restricted', 'shadowSuspect', 'accountWarning'].includes(account.state) || (account.lastCheck && ['stopped', 'unknown'].includes(account.lastCheck.state) && (!account.checkedAt || Date.parse(account.checkedAt) <= Date.parse(account.lastCheck.checkedAt)))
            if (stopped) { response.statusCode = 409; response.end(JSON.stringify({ error: 'accountCheckStopped' })); return }
            const result = await checker.check(account)
            response.end(JSON.stringify({ ...result, connections: snapshot(checker.activeAccountId()) })); return
          }
          if (url.pathname === '/api/console/connections') { response.end(JSON.stringify(snapshot(checker.activeAccountId()))); return }
          const days = Number(url.searchParams.get('days') ?? 30)
          if (!Number.isInteger(days) || days < 1 || days > 30) { response.statusCode = 400; response.end(JSON.stringify({ error: 'usageRangeInvalid' })); return }
          database = openDatabase(true)
          database.exec('BEGIN')
          const to = Date.now()
          const from = Math.floor(to / 86400000) * 86400000 - (days - 1) * 86400000
          const page = url.pathname === '/api/console/usage' ? projectUsageSummary(database, from, to) : projectConsoleEvents(database)
          database.exec('COMMIT')
          response.end(JSON.stringify(page))
        } catch (error) {
          const code = error instanceof Error ? error.message : ''
          const safeCodes = ['browserCloseUnconfirmed', 'browserProfileHomeExcluded', 'credentialInputInvalid', 'consoleInputInvalid', 'accountCheckBusy', 'credentialRejected', 'credentialRateLimited', 'credentialValidationUnavailable', 'browserGenerationChanged', 'browserStateChanged', 'browserBusy', 'browserCheckStopped', 'browserCheckUnresolved', 'browserInputStopped', 'browserViewerUnavailable', 'browserProviderUnavailable', 'browserProviderKeyRequired', 'browserProviderInvalid']
          response.statusCode = ['credentialInputInvalid', 'consoleInputInvalid'].includes(code) ? 400 : code === 'credentialRejected' ? 422 : code === 'credentialRateLimited' ? 429 : code === 'accountCheckBusy' || code.startsWith('browser') ? 409 : 503
          response.end(JSON.stringify({ error: safeCodes.includes(code) ? code : 'consoleWorkspaceUnavailable' }))
        } finally { database?.close() }
      })
    },
  }
}
