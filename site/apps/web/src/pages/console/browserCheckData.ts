import { browserPhases, type BrowserCheckView, type BrowserInput, type BrowserStream } from './browserCheckTypes'

export class BrowserRequestError extends Error {
  constructor(code: string) { super(code); this.name = 'BrowserRequestError' }
}

const codeOf = (body: unknown) => {
  const error = body && typeof body === 'object' ? (body as { error?: unknown }).error : null
  return typeof error === 'string' && /^[a-zA-Z]+$/.test(error) ? error : 'browserOperationUnconfirmed'
}

function streamOf(value: unknown): BrowserStream | null {
  if (!value || typeof value !== 'object') return null
  const row = value as BrowserStream
  if (row.kind !== 'voxl' || typeof row.url !== 'string' || !row.page || !row.window) return null
  try { const url = new URL(row.url); if (url.protocol !== 'https:' && url.protocol !== 'http:') return null } catch { return null }
  return row
}

export function parseView(value: unknown): BrowserCheckView {
  if (!value || typeof value !== 'object') throw new BrowserRequestError('browserResponseInvalid')
  const row = value as Record<string, unknown>
  if (!browserPhases.includes(row.phase as BrowserCheckView['phase']) || typeof row.account !== 'string' || !['generation', 'revision', 'pageState', 'address'].every((key) => row[key] === null || typeof row[key] === 'string')) throw new BrowserRequestError('browserResponseInvalid')
  const size = (key: string) => (Number.isSafeInteger(row[key]) && (row[key] as number) > 0 ? (row[key] as number) : null)
  return { account: row.account, phase: row.phase as BrowserCheckView['phase'], needsHuman: row.needsHuman === true, generation: row.generation as string | null, revision: row.revision as string | null, pageState: row.pageState as string | null, address: typeof row.address === 'string' && row.address.length <= 2048 ? row.address : null, width: size('width'), height: size('height'), canInteract: row.canInteract === true && row.phase === 'signInRequired', stream: streamOf(row.stream) }
}

export async function browserStatus(account: string, signal?: AbortSignal): Promise<BrowserCheckView> {
  const response = await fetch(`/api/console/browser?${new URLSearchParams({ account })}`, { signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(12000)]), credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' } })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new BrowserRequestError(codeOf(body))
  return parseView(body?.view)
}

export async function browserInput(view: BrowserCheckView, event: BrowserInput, signal?: AbortSignal): Promise<BrowserCheckView> {
  const response = await fetch('/api/console/browser/input', { method: 'POST', signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(130000)]), credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ account: view.account, generation: view.generation, revision: view.revision, event }) })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new BrowserRequestError(codeOf(body))
  return parseView(body?.view)
}

export async function browserFrame(account: string, generation: string, signal: AbortSignal): Promise<{ blob: Blob; revision: string | null }> {
  const response = await fetch(`/api/console/browser/frame?${new URLSearchParams({ account, generation })}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]), credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/jpeg')) throw new BrowserRequestError(codeOf(await response.json().catch(() => null)))
  return { blob: await response.blob(), revision: response.headers.get('x-log-browser-revision') }
}
