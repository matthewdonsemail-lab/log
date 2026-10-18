import { ERROR_CATALOG } from '../types'
import type { ErrorCode, ErrorEntry } from '../types'

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && Object.hasOwn(ERROR_CATALOG, value)
}

export function errorEntry(code: ErrorCode): ErrorEntry {
  return ERROR_CATALOG[code]
}

/**
 * A code from outside TypeScript (the Python processes) → a catalog code.
 * A code the catalog doesn't have becomes `uncatalogued`, with the code it
 * sent kept at the front of the detail, so nothing unknown passes as known. Pure.
 */
export function toKnownCode(code: unknown, detail?: unknown): { code: ErrorCode; detail?: string } {
  const text = typeof detail === 'string' && detail ? detail : undefined
  if (isErrorCode(code)) return text === undefined ? { code } : { code, detail: text }
  const sent = typeof code === 'string' && code ? code : String(code)
  return { code: 'uncatalogued', detail: text ? `${sent}: ${text}` : sent }
}

/** The codes whose solver is skipped for the rest of the run (`captcha: 'skipSolver'`). */
export function solverDeadCodes(): Set<ErrorCode> {
  return new Set(
    (Object.keys(ERROR_CATALOG) as ErrorCode[]).filter((code) => (ERROR_CATALOG[code] as ErrorEntry).captcha === 'skipSolver')
  )
}
