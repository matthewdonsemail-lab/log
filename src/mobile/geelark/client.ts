import { randomUUID } from 'node:crypto'
import { envValue } from '../../extensions/voiceClone/helpers/provider'
import { GEELARK_API, GEELARK_ENDPOINTS, GEELARK_KEY_NAME, GEELARK_STATUS } from './types'
import type { GeeLarkAdb, GeeLarkAnswer, GeeLarkFetch, GeeLarkPhone } from './types'

export function geeLarkKey(env: Record<string, string | undefined> = process.env): string | null {
  return envValue(GEELARK_KEY_NAME, env)
}

type Envelope = { code?: number; msg?: string; data?: unknown }

function phoneOf(item: Record<string, unknown>): GeeLarkPhone {
  const status = typeof item.status === 'number' ? (GEELARK_STATUS[item.status] ?? String(item.status)) : String(item.status ?? item.openStatus ?? '')
  const equipment = item.equipmentInfo as Record<string, unknown> | undefined
  const detail = [equipment?.osVersion, equipment?.deviceBrand, equipment?.deviceModel].filter((x) => typeof x === 'string' && x).join(' ')
  return { id: String(item.id ?? ''), serialName: String(item.serialName ?? ''), status, detail }
}

export function createGeeLarkClient(key: string | null = geeLarkKey(), fetcher: GeeLarkFetch = fetch as unknown as GeeLarkFetch) {
  async function call(path: string, body: object): Promise<GeeLarkAnswer<unknown>> {
    if (!key) return { ok: false, code: 'geelarkKeyMissing', status: 0, error: `${GEELARK_KEY_NAME} is not set (.env.local or ~/.buzz/.env.local): make one in GeeLark under API, on a plan that includes API and ADB` }
    const answer = await fetcher(`${GEELARK_API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', traceId: randomUUID().toUpperCase(), Authorization: `Bearer ${key}` }, body: JSON.stringify(body) })
    const read = (await answer.json().catch(() => null)) as Envelope | null
    if (answer.status !== 200 || !read || read.code !== 0) return { ok: false, code: `geelark${read?.code ?? answer.status}`, status: answer.status, error: read?.msg ?? `GeeLark answered ${answer.status}` }
    return { ok: true, data: read.data ?? null }
  }
  return {
    async list(page = 1, pageSize = 100): Promise<GeeLarkAnswer<GeeLarkPhone[]>> {
      const answer = await call(GEELARK_ENDPOINTS.list, { page, pageSize })
      if (!answer.ok) return answer
      const items = ((answer.data as { items?: Record<string, unknown>[] } | null)?.items ?? []).map(phoneOf)
      return { ok: true, data: items }
    },
    async status(ids: string[]): Promise<GeeLarkAnswer<GeeLarkPhone[]>> {
      const answer = await call(GEELARK_ENDPOINTS.status, { ids })
      if (!answer.ok) return answer
      const data = answer.data as { successDetails?: Record<string, unknown>[]; failDetails?: Record<string, unknown>[] } | null
      const found = (data?.successDetails ?? []).map(phoneOf)
      const missing = (data?.failDetails ?? []).map((f) => ({ id: String(f.id ?? ''), serialName: '', status: 'missing', detail: String(f.msg ?? f.code ?? '') }))
      return { ok: true, data: [...found, ...missing] }
    },
    async start(ids: string[]): Promise<GeeLarkAnswer<unknown>> {
      return call(GEELARK_ENDPOINTS.start, { ids })
    },
    async stop(ids: string[]): Promise<GeeLarkAnswer<unknown>> {
      return call(GEELARK_ENDPOINTS.stop, { ids })
    },
    async setAdb(ids: string[], open: boolean): Promise<GeeLarkAnswer<unknown>> {
      return call(GEELARK_ENDPOINTS.adbStatus, { ids, open })
    },
    async adbInfo(ids: string[]): Promise<GeeLarkAnswer<GeeLarkAdb[]>> {
      const answer = await call(GEELARK_ENDPOINTS.adbInfo, { ids })
      if (!answer.ok) return answer
      const items = ((answer.data as { items?: Record<string, unknown>[] } | null)?.items ?? []).map((i) => ({ id: String(i.id ?? ''), ip: String(i.ip ?? ''), port: String(i.port ?? ''), pwd: String(i.pwd ?? ''), code: Number(i.code ?? -1) }))
      return { ok: true, data: items }
    },
  }
}

export type GeeLarkClient = ReturnType<typeof createGeeLarkClient>
