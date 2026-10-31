import { ERROR_CATALOG, toKnownCode } from '../../../errors/catalog/index'

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
