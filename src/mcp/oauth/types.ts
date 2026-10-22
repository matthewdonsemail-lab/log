export const CLAUDE_CALLBACK = "https://claude.ai/api/mcp/auth_callback";
export const LOOPBACK_CALLBACK = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/[^\s]*$/;
export const SCOPES = ["log", "offline_access"] as const;
export const ACCESS_TTL_S = 3600;
export const REFRESH_TTL_S = 30 * 24 * 3600;
export const CODE_TTL_MS = 60_000;
export const PENDING_TTL_MS = 10 * 60_000;
export const TWENTY_SCOPE = "profile";

export interface OAuthClient {
  clientId: string;
  name: string;
  redirectUris: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

export interface StoredToken {
  clientId: string;
  kind: "access" | "refresh";
  expiresAt: string;
}

export interface OAuthStore {
  twentyClients: Record<string, string>;
  clients: Record<string, OAuthClient>;
  tokens: Record<string, StoredToken>;
}

export interface PendingAuthorization {
  id: string;
  clientId: string;
  redirectUri: string;
  state: string | null;
  challenge: string;
  scope: string;
  twentyVerifier: string;
  twentyRedirect: string;
  createdAtMs: number;
}

export interface IssuedCode {
  clientId: string;
  redirectUri: string;
  challenge: string;
  scope: string;
  expiresAtMs: number;
}

export interface TwentyOAuthConfig {
  baseUrl: string;
  basicUser: string | null;
  basicPassword: string | null;
}

export interface OAuthDeps {
  publicUrl: string;
  twenty: TwentyOAuthConfig;
  ownerUserId: () => string | null;
  storePath: string;
  fetch: typeof fetch;
  now: () => number;
}

export interface OAuthServer {
  handle(request: Request): Promise<Response | null>;
  verifyBearer(token: string): boolean;
  unauthorized(): Response;
  resource: string;
  publicHost: string;
}
