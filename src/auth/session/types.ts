/**
 * The operator session: Twenty OAuth tokens obtained through blaster's web app.
 * Same record shape as blaster's `@blaster/core` session store
 * (`packages/core/src/platform/session/helpers/store.ts`), so one sign-in means
 * the same thing in both tools.
 */

export interface SessionRecord {
  accessToken: string;
  refreshToken: string | null;
  /** Seconds the access token lives, from `obtainedAtMs`. null = no expiry given. */
  expiresIn: number | null;
  obtainedAtMs: number;
  username: string | null;
  /** The API that validates and refreshes this session. */
  apiUrl: string;
  loggedInAt: string;
}

export interface SessionConfig {
  apiUrl?: string;
  webUrl?: string;
}

export interface SessionHome {
  config: SessionConfig;
  /** Keyed by API origin, like blaster. */
  sessions: Record<string, SessionRecord>;
}

export interface OperatorIdentity {
  username: string | null;
  scope: string | null;
}

export type ValidationResult =
  | { ok: true; identity: OperatorIdentity }
  | { ok: false; kind: "config" | "auth" | "transport"; message: string };

/**
 * Hosted blaster is the default sign-in path. Local dev passes --webUrl/--apiUrl,
 * or sets LOG_WEB_URL / LOG_API_URL.
 */
export const DEFAULT_WEB_URL = "https://blaster.listeningkit.com";
export const DEFAULT_API_URL = "https://blaster.listeningkit.com";
