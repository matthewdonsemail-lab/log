import { consoleRequest, type ConsoleTarget } from './consoleClient'
import { browserPhases, type BrowserCheckView, type BrowserInput, type BrowserOperation, type BrowserStream } from './browserCheckTypes'

export class BrowserRequestError extends Error {
  constructor(code: string) { super(code); this.name = 'BrowserRequestError' }
}

const ROUTES: Record<BrowserOperation, { path: string; action?: string }> = {
  status: { path: 'state' },
  open: { path: 'open' },
  linkProfile: { path: 'action', action: 'linkProfile' },
  verify: { path: 'action', action: 'verify' },
  resolve: { path: 'action', action: 'resolve' },
  back: { path: 'action', action: 'back' },
  reload: { path: 'action', action: 'reload' },
  input: { path: 'input' },
  complete: { path: 'saveState' },
  close: { path: 'close' },
}

const text = (value: unknown, max: number) => typeof value === 'string' && value.length <= max ? value : null

function streamOf(value: unknown): BrowserStream | null {
  if (!value || typeof value !== 'object') return null
  const row = value as BrowserStream
  if (row.kind !== 'voxl' || typeof row.url !== 'string' || !row.page || !row.window || !(row.page.width > 0) || !(row.page.height > 0)) return null
  try { const url = new URL(row.url); if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) return null } catch { return null }
  return row
}

export function parseView(value: unknown): BrowserCheckView {
  if (!value || typeof value !== 'object') throw new BrowserRequestError('browserResponseInvalid')
  const row = value as Record<string, unknown>
  if (!browserPhases.includes(row.phase as BrowserCheckView['phase']) || typeof row.accountId !== 'string' || typeof row.account !== 'string' || !['viewerId', 'generation', 'revision', 'pageState', 'address'].every((key) => row[key] === null || typeof row[key] === 'string')) throw new BrowserRequestError('browserResponseInvalid')
  const size = (key: string) => (Number.isSafeInteger(row[key]) && (row[key] as number) > 0 ? (row[key] as number) : null)
  const reason = row.reason && typeof row.reason === 'object' ? row.reason as Record<string, unknown> : null
  const phase = row.phase as BrowserCheckView['phase']
  return {
    accountId: row.accountId, account: row.account, phase, location: row.location === 'remote' ? 'remote' : 'local',
    viewerId: row.viewerId as string | null, generation: row.generation as string | null, revision: row.revision as string | null, pageState: row.pageState as string | null, address: text(row.address, 2048),
    width: size('width'), height: size('height'),
    canInteract: row.canInteract === true && phase === 'signInRequired', canResolve: row.canResolve === true && ['signInRequired', 'needsResolution'].includes(phase), canComplete: row.canComplete === true && phase === 'verified', canNavigate: row.canNavigate === true, canGoBack: row.canGoBack === true,
    stream: streamOf(row.stream),
    reason: reason && typeof reason.code === 'string' && /^[a-zA-Z]+$/.test(reason.code) && typeof reason.message === 'string' && reason.message.length <= 800 ? { code: reason.code, message: reason.message } : null,
  }
}

function codeOf(error: unknown): string {
  const code = error instanceof Error ? (error as Error & { code?: string }).code ?? error.message : ''
  return /^[a-zA-Z]+$/.test(code) ? code : 'browserOperationUnconfirmed'
}

export async function requestBrowser(target: ConsoleTarget, accountId: string, operation: BrowserOperation, view?: BrowserCheckView | null, event?: BrowserInput | null, signal?: AbortSignal): Promise<BrowserCheckView> {
  const route = ROUTES[operation]
  const body = { accountId, ...(route.action ? { action: route.action } : {}), ...(view?.generation ? { generation: view.generation } : {}), ...(view?.revision && operation !== 'status' ? { revision: view.revision } : {}), ...(event ? { event } : {}) }
  try {
    const answer = await consoleRequest(target, { local: `/api/console/browserCheck/${route.path}`, hosted: `/console/browser/${route.path}`, method: 'POST' }, { body, signal })
    return parseView((answer as { view?: unknown } | null)?.view)
  } catch (error) {
    if (signal?.aborted) throw error
    throw new BrowserRequestError(codeOf(error))
  }
}

export async function browserFrame(target: ConsoleTarget, accountId: string, generation: string, signal: AbortSignal): Promise<Blob> {
  try {
    const answer = await consoleRequest(target, { local: '/api/console/browserCheck/frame', hosted: '/console/browser/frame', method: 'POST' }, { body: { accountId, generation }, signal })
    const frame = (answer as { frame?: { mimeType?: unknown; data?: unknown } } | null)?.frame
    if (frame?.mimeType !== 'image/jpeg' || typeof frame.data !== 'string') throw new BrowserRequestError('browserViewerUnavailable')
    const bytes = Uint8Array.from(atob(frame.data), (character) => character.charCodeAt(0))
    return new Blob([bytes], { type: 'image/jpeg' })
  } catch (error) {
    if (signal.aborted) throw error
    throw new BrowserRequestError(codeOf(error))
  }
}
