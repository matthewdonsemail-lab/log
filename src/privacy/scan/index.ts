import { createHash } from 'node:crypto'
import { BINARY_EXTENSIONS, FORBIDDEN_PATHS, SCAN_RULES, SKIPPED_PATHS } from '../rules/index.ts'
import type { PrivacyRuleName } from '../rules/index.ts'
import type { PrivacyAllowEntry, PrivacyAllowlist, PrivacyFinding, ScanOptions } from './types.ts'

export type { PrivacyAllowEntry, PrivacyAllowlist, PrivacyFinding, ScanOptions } from './types.ts'

export const EMPTY_ALLOWLIST: PrivacyAllowlist = { emails: [], findings: [] }

export function maskValue(value: string): string {
  const shown = Math.min(4, Math.floor(value.length / 4))
  return `${value.slice(0, shown)}…(${value.length} chars)`
}

export function fingerprintOf(rule: string, value: string): string {
  return createHash('sha256').update(`${rule}\u0000${value}`).digest('hex').slice(0, 12)
}

export const normalisePath = (path: string): string => path.replace(/\\/g, '/').replace(/^\.\//, '')

export function isSkippedPath(path: string): boolean {
  const p = normalisePath(path)
  return SKIPPED_PATHS.test(p) || BINARY_EXTENSIONS.test(p)
}

export function forbiddenPrefixOf(path: string): string | null {
  const p = normalisePath(path)
  return FORBIDDEN_PATHS.find((prefix) => p.startsWith(prefix)) ?? null
}

export function looksBinary(bytes: Uint8Array): boolean {
  const end = Math.min(bytes.length, 8000)
  for (let i = 0; i < end; i++) if (bytes[i] === 0) return true
  return false
}

const finding = (path: string, line: number, rule: PrivacyRuleName, value: string): PrivacyFinding => ({
  path,
  line,
  rule,
  masked: maskValue(value),
  fingerprint: fingerprintOf(rule, value),
})

function pathMatches(entryPath: string, path: string): boolean {
  const e = normalisePath(entryPath)
  return e === path || (e.endsWith('/') && path.startsWith(e))
}

export function isAllowed(item: PrivacyFinding, entries: PrivacyAllowEntry[]): boolean {
  return entries.some((e) => e.rule === item.rule && pathMatches(e.path, item.path) && (!e.fingerprint || e.fingerprint === item.fingerprint))
}

export function scanPath(path: string, options: ScanOptions = {}): PrivacyFinding[] {
  const p = normalisePath(path)
  const prefix = forbiddenPrefixOf(p)
  if (!prefix) return []
  const found = finding(p, 0, 'forbiddenPath', prefix)
  return isAllowed(found, (options.allowlist ?? EMPTY_ALLOWLIST).findings) ? [] : [{ ...found, masked: `${prefix} is private` }]
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function denylistMatchers(denylist: string[]): { term: string; pattern: RegExp }[] {
  return denylist
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .map((term) => ({ term, pattern: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`, 'iu') }))
}

export function scanText(path: string, text: string, options: ScanOptions = {}): PrivacyFinding[] {
  const p = normalisePath(path)
  const allowlist = options.allowlist ?? EMPTY_ALLOWLIST
  const context = { allowedEmails: new Set(allowlist.emails.map((e) => e.toLowerCase())) }
  const terms = denylistMatchers(options.denylist ?? [])
  const out: PrivacyFinding[] = []
  const lines = text.split(/\r?\n/)
  lines.forEach((line, index) => {
    for (const rule of SCAN_RULES) {
      if (rule.lineMustMatch && !rule.lineMustMatch.test(line)) continue
      if (rule.lineSkip?.test(line)) continue
      for (const match of line.matchAll(rule.pattern)) {
        const value = match[rule.value ?? 0] ?? match[0]
        if (rule.allowed?.(value, context)) continue
        out.push(finding(p, index + 1, rule.name, value))
      }
    }
    if (terms.length) {
      const lower = line.toLowerCase()
      for (const { term, pattern } of terms) if (lower.includes(term) && pattern.test(line)) out.push(finding(p, index + 1, 'denylist', term))
    }
  })
  return out.filter((f) => !isAllowed(f, allowlist.findings))
}

export function formatFinding(f: PrivacyFinding): string {
  return `${f.path}:${f.line} ${f.rule} ${f.masked} [${f.fingerprint}]`
}

export function countByFolder(findings: PrivacyFinding[], depth = 2): Map<string, number> {
  const counts = new Map<string, number>()
  for (const f of findings) {
    const parts = f.path.split('/')
    const folder = parts.length > 1 ? parts.slice(0, Math.min(depth, parts.length - 1)).join('/') : '(root)'
    counts.set(folder, (counts.get(folder) ?? 0) + 1)
  }
  return new Map([...counts].sort((a, b) => b[1] - a[1]))
}
