export const GEELARK_API = 'https://openapi.geelark.com'

export const GEELARK_ENDPOINTS = {
  list: '/open/v1/phone/list',
  status: '/open/v1/phone/status',
  start: '/open/v1/phone/start',
  stop: '/open/v1/phone/stop',
  adbStatus: '/open/v1/adb/setStatus',
  adbInfo: '/open/v1/adb/getData',
} as const

export const GEELARK_KEY_NAME = 'GEELARK_API_TOKEN'

export const GEELARK_STATUS: Record<number, string> = { 0: 'started', 1: 'starting', 2: 'shutDown', 3: 'expired' }

export interface GeeLarkPhone {
  id: string
  serialName: string
  status: string
  detail: string
}

export interface GeeLarkAdb {
  id: string
  ip: string
  port: string
  pwd: string
  code: number
}

export type GeeLarkAnswer<T> = { ok: true; data: T } | { ok: false; code: string; status: number; error: string }

export type GeeLarkFetch = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ status: number; json(): Promise<unknown> }>
