import { browserPhases, type BrowserCheckView, type BrowserOperation } from './browserCheckTypes'

function parseView(value: unknown): BrowserCheckView {
  if (!value || typeof value !== 'object') throw new Error('browserResponseInvalid')
  const row = value as Record<string, unknown>
  if (!browserPhases.includes(row.phase as BrowserCheckView['phase']) || !['viewerId', 'generation', 'revision', 'pageState'].every((key) => row[key] === null || typeof row[key] === 'string') || !['canInteract', 'canResolve', 'canComplete'].every((key) => typeof row[key] === 'boolean')) throw new Error('browserResponseInvalid')
  const detail = row.reason && typeof row.reason === 'object' ? row.reason as Record<string, unknown> : null
  const reason = detail && typeof detail.code === 'string' && /^[a-zA-Z]+$/.test(detail.code) && typeof detail.message === 'string' && detail.message.length <= 800 ? { code: detail.code, message: detail.message, recordedAt: typeof detail.recordedAt === 'string' && Number.isFinite(Date.parse(detail.recordedAt)) ? detail.recordedAt : null } : undefined
  return { address: typeof row.address === 'string' && row.address.length <= 2048 ? row.address : null, canGoBack: row.canGoBack === true, canNavigate: row.canNavigate === true, reason, retryAt: typeof row.retryAt === 'string' && Number.isFinite(Date.parse(row.retryAt)) ? row.retryAt : null, phase: row.phase as BrowserCheckView['phase'], viewerId: row.viewerId as string | null, generation: row.generation as string | null, revision: row.revision as string | null, pageState: row.pageState as string | null, canInteract: row.canInteract === true && row.phase === 'signInRequired', canResolve: row.canResolve === true && ['signInRequired', 'needsResolution'].includes(String(row.phase)), canComplete: row.canComplete === true && row.phase === 'verified' }
}
export class BrowserRequestError extends Error {
  constructor(readonly view: BrowserCheckView) { super(view.reason?.code ?? 'browserOperationUnconfirmed'); this.name = 'BrowserRequestError' }
}

export async function requestBrowser(accountId: string, operation: BrowserOperation, view?: BrowserCheckView | null, event?: Record<string, unknown> | null, signal?: AbortSignal): Promise<BrowserCheckView> {
  const startedAt = performance.now()
  const requestSignal = AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(operation === 'status' ? 12000 : 310000)])
  console.info('[browserCheck] request started', { operation })
  const heartbeat = operation === 'status' ? null : setInterval(() => console.info(`[browserCheck] ${operation} still pending (${Math.round((performance.now() - startedAt) / 1000)}s); waiting for the runtime result`), 5000)
  try {
  const response = await fetch('/api/console/browser', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: requestSignal, headers: { 'content-type': 'application/json', 'x-log-console': '1' }, body: JSON.stringify({ accountId, operation, ...(view ? { viewerId: view.viewerId, generation: view.generation, revision: view.revision } : {}), ...(event ? { event } : {}) }) })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    if (body?.view) {
      const rejected = parseView(body.view)
      console.warn(`[browserCheck] ${operation} HTTP ${response.status} → ${rejected.phase}${rejected.reason ? ` | ${rejected.reason.code}: ${rejected.reason.message}` : ''}`)
      if (operation === 'close' || operation === 'complete') throw new BrowserRequestError(rejected)
      return rejected
    }
    const code = typeof body?.error === 'string' && /^[a-zA-Z]+$/.test(body.error) ? body.error : 'browserOperationUnconfirmed'
    const rejected: BrowserCheckView = { phase: operation === 'status' ? 'serviceUnavailable' : 'operationUncertain', viewerId: null, generation: null, revision: null, pageState: null, canInteract: false, canResolve: false, canComplete: false, reason: { code, message: 'The server rejected the request without a current browser state. No action retry was dispatched.', recordedAt: null } }
    console.warn(`[browserCheck] ${operation} HTTP ${response.status} → ${rejected.phase} | ${code}: ${rejected.reason!.message}`)
    if (operation === 'close' || operation === 'complete') throw new BrowserRequestError(rejected)
    return rejected
  }
  const next = parseView(body?.view)
  if ((operation === 'complete' && (next.phase !== 'verified' || !next.canComplete)) || (operation === 'close' && (next.phase !== 'browserMissing' || next.viewerId))) throw new BrowserRequestError(next)
  console.info(`[browserCheck] ${operation} HTTP ${response.status} → ${next.phase}${next.reason ? ` | ${next.reason.code}: ${next.reason.message}` : ''}${next.retryAt ? ` | next eligible ${next.retryAt}` : ''}`)
  console.info('[browserCheck] request completed', { operation, status: response.status, phase: next.phase, reason: next.reason ?? null, hasViewer: Boolean(next.viewerId), durationMs: Math.round(performance.now() - startedAt) })
  return next
  } catch (error) {
    if (!signal?.aborted) console.warn(`[browserCheck] ${operation} request ended after ${Math.round((performance.now() - startedAt) / 1000)}s`, { code: error instanceof Error ? error.message : 'unknown' })
    if (error instanceof BrowserRequestError || operation === 'status' || signal?.aborted) throw error
    throw new BrowserRequestError({ phase: 'operationUncertain', viewerId: null, generation: null, revision: null, pageState: null, canInteract: false, canResolve: false, canComplete: false, reason: { code: 'browserOperationUnconfirmed', message: 'The request ended before its result was confirmed. The operation may still be running. No action retry was dispatched.', recordedAt: null } })
  } finally { if (heartbeat !== null) clearInterval(heartbeat) }
}
export async function browserFrame(accountId: string, viewerId: string, signal: AbortSignal) {
  const response = await fetch(`/api/console/browser/frame?${new URLSearchParams({ accountId, viewerId })}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]), credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/jpeg')) throw new Error('browserViewerUnavailable')
  return response.blob()
}
