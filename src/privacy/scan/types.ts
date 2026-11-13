import type { PrivacyRuleName } from '../rules/index.ts'

export interface PrivacyFinding {
  path: string
  line: number
  rule: PrivacyRuleName
  masked: string
  fingerprint: string
}

export interface PrivacyAllowEntry {
  path: string
  rule: string
  fingerprint?: string
  why: string
}

export interface PrivacyAllowlist {
  emails: string[]
  findings: PrivacyAllowEntry[]
}

export interface ScanOptions {
  denylist?: string[]
  allowlist?: PrivacyAllowlist
}
