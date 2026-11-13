import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { processAlive, readCurrentInspect } from '../inspect/client'
import type { CurrentInspect } from '../inspect/types'
import { VIEWER_ERRORS, VIEWER_KEYS, ViewerError } from './types'
import type { ViewerDescriptor, ViewerErrorCode, ViewerEvent, ViewerFrame, ViewerLiveState, ViewerStream, ViewerView } from './types'

export const VIEWER_FILE = 'browserViewer.json'
export const MAX_FRAME_BYTES = 10_000_000
const LOOPBACK_HOSTS = ['127.0.0.1', 'localhost', '[::1]']

export const viewerDeps: { owner: (account: string) => CurrentInspect | null; alive: (pid: number) => boolean; fetch: (url: string, init: RequestInit) => Promise<Response> } = {
  owner: (account) => readCurrentInspect(undefined, account),
  alive: (pid) => Number.isSafeInteger(pid) && pid > 0 && processAlive(pid),
  fetch: (url, init) => fetch(url, init),
}

export function streamOf(value: unknown): ViewerStream | null {
  if (!value || typeof value !== 'object') return null
  const row = value as { kind?: unknown; url?: unknown; page?: unknown; window?: unknown }
  if (row.kind !== 'voxl' || typeof row.url !== 'string' || !row.page || !row.window) return null
  let address: URL
  try {
    address = new URL(row.url)
  } catch {
    return null
  }
  if (address.protocol !== 'https:' && !(address.protocol === 'http:' && LOOPBACK_HOSTS.includes(address.hostname))) return null
  const page = row.page as { width?: unknown; height?: unknown }
  const window = row.window as { left?: unknown; top?: unknown; width?: unknown; height?: unknown }
  const numbers = [page.width, page.height, window.left, window.top, window.width, window.height]
  if (!numbers.every((number) => Number.isSafeInteger(number) && (number as number) >= 0)) return null
  if ((page.width as number) <= 0 || (page.height as number) <= 0) return null
  if (window.width !== page.width || window.height !== page.height) return null
  return { kind: 'voxl', url: row.url, page: { width: page.width as number, height: page.height as number }, window: { left: window.left as number, top: window.top as number, width: window.width as number, height: window.height as number } }
}

export function voxlOrigins(url: string | undefined): string[] {
  if (!url) return []
  try {
    const address = new URL(url)
    if (address.protocol === 'https:') return [address.origin, `wss://${address.host}`]
    if (address.protocol === 'http:' && LOOPBACK_HOSTS.includes(address.hostname)) return [address.origin, `ws://${address.host}`]
  } catch {
  }
  return []
}

export function addressOf(url: string | undefined): string | null {
  if (!url) return null
  try {
    const address = new URL(url)
    if (address.protocol !== 'https:' && address.protocol !== 'http:') return null
    return `${address.origin}${address.pathname}`
  } catch {
    return null
  }
}

export function viewerOwner(account: string): CurrentInspect | null {
  const owner = viewerDeps.owner(account)
  if (!owner || owner.account !== account || typeof owner.runDir !== 'string') return null
  if (typeof owner.pid === 'number' && !viewerDeps.alive(owner.pid)) return null
  return owner
}

export function viewerDescriptor(owner: CurrentInspect): ViewerDescriptor | null {
  let descriptor: ViewerDescriptor
  try {
    descriptor = JSON.parse(readFileSync(join(owner.runDir, VIEWER_FILE), 'utf8')) as ViewerDescriptor
  } catch {
    return null
  }
  if (!descriptor || !Number.isInteger(descriptor.port) || descriptor.port < 1 || descriptor.port > 65535) return null
  if (typeof descriptor.generation !== 'string' || !/^[a-f0-9]{32}$/.test(descriptor.generation) || typeof descriptor.token !== 'string' || !descriptor.token) return null
  if (!viewerDeps.alive(descriptor.pid)) return null
  return descriptor
}

function attach(account: string): ViewerDescriptor {
  const owner = viewerOwner(account)
  if (!owner) throw new ViewerError('browserMissing')
  const descriptor = viewerDescriptor(owner)
  if (!descriptor) throw new ViewerError('browserViewerUnavailable')
  return descriptor
}

async function ownerRequest(descriptor: ViewerDescriptor, path: string, body?: unknown): Promise<Response> {
  try {
    return await viewerDeps.fetch(`http://127.0.0.1:${descriptor.port}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { authorization: `Bearer ${descriptor.token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      redirect: 'error',
      signal: AbortSignal.timeout(body ? 120_000 : 8_000),
    })
  } catch {
    throw new ViewerError('browserViewerUnavailable')
  }
}

function liveOf(descriptor: ViewerDescriptor, value: unknown): ViewerLiveState {
  const state = value as ViewerLiveState
  if (!state || state.generation !== descriptor.generation || typeof state.revision !== 'string' || !/^[a-f0-9]{64}$/.test(state.revision) || typeof state.state !== 'string' || typeof state.blocked !== 'boolean' || typeof state.inputAllowed !== 'boolean') throw new ViewerError('browserGenerationChanged')
  return state
}

async function live(descriptor: ViewerDescriptor): Promise<ViewerLiveState> {
  const response = await ownerRequest(descriptor, '/state')
  if (!response.ok) throw new ViewerError('browserViewerUnavailable')
  return liveOf(descriptor, await response.json().catch(() => null))
}

export function emptyView(account: string, phase: 'browserMissing' | 'viewerUnavailable'): ViewerView {
  return { account, phase, needsHuman: false, generation: null, revision: null, pageState: null, address: null, width: null, height: null, canInteract: false, stream: null }
}

export function viewOf(account: string, state: ViewerLiveState): ViewerView {
  const phase = state.blocked ? 'needsAttention' : state.busy ? 'busy' : state.inputAllowed ? 'signInRequired' : 'ready'
  return {
    account,
    phase,
    needsHuman: state.blocked || state.inputAllowed,
    generation: state.generation,
    revision: state.revision,
    pageState: state.state,
    address: addressOf(state.url),
    width: Number.isSafeInteger(state.width) ? (state.width as number) : null,
    height: Number.isSafeInteger(state.height) ? (state.height as number) : null,
    canInteract: phase === 'signInRequired',
    stream: streamOf(state.stream),
  }
}

export async function viewerState(account: string): Promise<ViewerView> {
  let descriptor: ViewerDescriptor
  try {
    descriptor = attach(account)
  } catch (error) {
    if (error instanceof ViewerError && error.code === 'browserMissing') return emptyView(account, 'browserMissing')
    return emptyView(account, 'viewerUnavailable')
  }
  try {
    return viewOf(account, await live(descriptor))
  } catch {
    return emptyView(account, 'viewerUnavailable')
  }
}

function sameGeneration(descriptor: ViewerDescriptor, generation: unknown): void {
  if (typeof generation !== 'string' || generation !== descriptor.generation) throw new ViewerError('browserGenerationChanged')
}

export async function viewerFrame(account: string, generation: unknown): Promise<ViewerFrame> {
  const descriptor = attach(account)
  sameGeneration(descriptor, generation)
  const response = await ownerRequest(descriptor, '/frame')
  if (!response.ok || response.headers.get('X-Log-Browser-Generation') !== descriptor.generation) throw new ViewerError('browserViewerUnavailable')
  const revision = response.headers.get('X-Log-Browser-Revision') ?? ''
  if (!/^[a-f0-9]{64}$/.test(revision)) throw new ViewerError('browserViewerUnavailable')
  const data = await response.arrayBuffer()
  if (data.byteLength > MAX_FRAME_BYTES) throw new ViewerError('browserViewerUnavailable')
  return { generation: descriptor.generation, revision, mimeType: 'image/jpeg', data: Buffer.from(data).toString('base64') }
}

export function eventOf(value: unknown): ViewerEvent {
  const row = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
  if (!row) throw new ViewerError('browserInputInvalid')
  if (row.type === 'click' && typeof row.x === 'number' && typeof row.y === 'number' && Number.isFinite(row.x) && Number.isFinite(row.y)) return { type: 'click', x: row.x, y: row.y }
  if (row.type === 'text' && typeof row.text === 'string' && row.text.length > 0 && row.text.length <= 2048) return { type: 'text', text: row.text }
  if (row.type === 'key' && typeof row.key === 'string' && (VIEWER_KEYS as readonly string[]).includes(row.key)) return { type: 'key', key: row.key }
  if (row.type === 'scroll' && typeof row.deltaY === 'number' && Number.isFinite(row.deltaY)) return { type: 'scroll', deltaY: Math.max(-600, Math.min(600, row.deltaY)) }
  throw new ViewerError('browserInputInvalid')
}

export async function viewerInput(account: string, input: { generation: unknown; revision: unknown; event: unknown }): Promise<ViewerView> {
  const event = eventOf(input.event)
  const descriptor = attach(account)
  sameGeneration(descriptor, input.generation)
  if (typeof input.revision !== 'string' || !/^[a-f0-9]{64}$/.test(input.revision)) throw new ViewerError('browserStateChanged')
  const response = await ownerRequest(descriptor, '/input', { ...event, generation: descriptor.generation, revision: input.revision })
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null
  if (!response.ok) {
    const code = body && typeof body.error === 'string' && (VIEWER_ERRORS as readonly string[]).includes(body.error) ? (body.error as ViewerErrorCode) : 'browserViewerUnavailable'
    throw new ViewerError(code)
  }
  return viewOf(account, liveOf(descriptor, body))
}
