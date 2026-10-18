/**
 * Facebook account types.
 *
 * Ported from listeningkit-hackathon (github.com/matthewdonsemail-lab/log):
 * `AccountIssue` / `RawSignal` from apps/web/src/lib/account-issues/types.ts
 * and `ConnectionRecord` from apps/web/src/lib/connections/types.ts, narrowed
 * to Facebook: X and Reddit are out of scope for the Marketplace CLI.
 */

/**
 * The normalized, platform-agnostic vocabulary of everything that can happen
 * to an account. Raw platform signals (HTTP status, `code`/`subcode`, page
 * markers) map onto these values.
 */
export type AccountIssue =
  // Lifecycle — from our connection model, not the platform.
  | 'never_connected'
  | 'disconnected'
  | 'stale'
  // Session / credential.
  | 'session_expired'
  | 'session_invalidated_changed'
  | 'checkpointed'
  | 'unconfirmed_user'
  | 'cookie_invalid'
  // Suspended / banned.
  | 'suspended'
  | 'read_only_limited'
  | 'automated_flagged'
  // Rate / limit (transient).
  | 'rate_limited'
  | 'proxy_rate_limited'
  // Blocked / challenged.
  | 'challenge_interstitial'
  | 'ip_or_account_blocked'
  // Policy / permission / group.
  | 'restricted_policy'
  | 'permission_denied'
  | 'join_gate'
  | 'removed_from_group'
  // Transport (proxy).
  | 'proxy_unreachable'
  | 'proxy_auth_failed'
  | 'proxy_malformed'
  // False success — HTTP 200 whose body is not data.
  | 'login_wall'
  | 'captcha_html'
  // Roster.
  | 'unknown_platform'
  // Catch-all — the client saw a failure it could not map.
  | 'unknown'


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
  /** The URL that produced the response (for login-wall detection). */
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

