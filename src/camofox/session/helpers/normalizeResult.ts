import { ERROR_CATALOG, toKnownCode } from '../../../errors/catalog/index'

/**
 * A step result from `publishSession.py` with its codes checked against the
 * error catalog, so the machine only ever sees catalog codes. An unknown
 * `code` becomes `uncatalogued`; an `issue` that isn't an account code
 * becomes an `error` with that code. Everything else passes through. Pure.
 */
export function normalizeResult(result: Record<string, unknown>): Record<string, unknown> {
  if (result.kind === 'issue') {
    const known = toKnownCode(result.issue, result.detail)
    if (ERROR_CATALOG[known.code].layer === 'account') return { ...result, issue: known.code }
    return { kind: 'error', ...known }
  }
  if ('code' in result && result.code !== undefined) {
    const { detail: _drop, ...rest } = result
    return { ...rest, ...toKnownCode(result.code, result.detail) }
  }
  return result
}
