import { ERROR_CATALOG } from '../types'
import type { ErrorCode, ErrorEntry } from '../types'

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && Object.hasOwn(ERROR_CATALOG, value)
}

export function errorEntry(code: ErrorCode): ErrorEntry {
  return ERROR_CATALOG[code]
}

export function toKnownCode(code: unknown, detail?: unknown): { code: ErrorCode; detail?: string } {
  const text = typeof detail === 'string' && detail ? detail : undefined
  if (isErrorCode(code)) return text === undefined ? { code } : { code, detail: text }
  const sent = typeof code === 'string' && code ? code : String(code)
  return { code: 'uncatalogued', detail: text ? `${sent}: ${text}` : sent }
}

export function solverDeadCodes(): Set<ErrorCode> {
  return new Set(
    (Object.keys(ERROR_CATALOG) as ErrorCode[]).filter((code) => (ERROR_CATALOG[code] as ErrorEntry).captcha === 'skipSolver')
  )
}
