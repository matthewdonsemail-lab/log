/**
 * Facebook account types.
 *
 * Ported from listeningkit-hackathon (github.com/matthewdonsemail-lab/log):
 * `AccountIssue` / `RawSignal` from apps/web/src/lib/account-issues/types.ts
 * and `ConnectionRecord` from apps/web/src/lib/connections/types.ts, narrowed
 * to Facebook: X and Reddit are out of scope for the Marketplace CLI.
 */

import type { CodeOfLayer } from '../../errors/catalog/index'

/**
 * The normalized, platform-agnostic vocabulary of everything that can happen
 * to an account. Raw platform signals (HTTP status, `code`/`subcode`, page
 * markers) map onto these values. Defined once, with meanings and outcomes, in
 * the error catalog (`src/errors/catalog/types.ts`, layer `account`). The
 * hackathon's snake_case spelling is converted at its API boundary.
 */
export type AccountIssue = CodeOfLayer<'account'>

export interface RawSignal {
  /** HTTP status the client saw (200 for the false-success cases). */
  status?: number
  /** Platform error code, e.g. Facebook Graph `190`, Twitter GraphQL `88`. */
  code?: number
  /** Platform error subcode, e.g. Facebook `459` (checkpointed). */
  subcode?: number
  /** Machine name of the error type, e.g. X `rate-limit-exceeded`, `client-forbidden`. */
  type?: string
  /** A short lowercased phrase matched against the response body/URL. */
  marker?: string
  /** The URL that produced the response (for loginWall detection). */
  url?: string
}

/** A connected Facebook account. */
export interface ConnectionRecord {
  /** Stable unique id; NOT the platform, so multiple accounts per platform work. */
  id: string
  platform: 'facebook'
  /** Display label (defaults to the platform name when the account is added). */
  label: string
  /** ISO timestamp of the last successful connect; null = added but not connected yet. */
  connectedAt: string | null
  /** Last normalized issue the client observed on this account, if any. */
  lastIssue?: AccountIssue | null
  /** The raw platform signal behind `lastIssue`, preserved for display/debug. */
  rawSignal?: RawSignal | null
  /** ISO timestamp of the last health check / poll attempt. */
  lastCheckedAt?: string | null
  /** For transient issues (rate limit / backoff): seconds until the next safe attempt. */
  retryAfter?: number | null
}

