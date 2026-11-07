export interface AndroidConnection {
  serial: string
  provider: 'usb' | 'geelark'
  steps: string[]
}

export type ConnectAnswer = { ok: true; connection: AndroidConnection } | { ok: false; code: string; error: string; steps: string[] }

export interface InspectResult {
  serial: string
  folder: string
  hierarchy: string
  screenshot: string
  currentApp: string
  elements: number
  opened: string | null
}

export type InspectAnswer = { ok: true; result: InspectResult } | { ok: false; code: string; error: string }

export const DRIVER = 'python/mobile/androidDriver.py'
