export interface SessionRecord {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
  obtainedAtMs: number;
  username: string | null;
  apiUrl: string;
  loggedInAt: string;
}

export interface SessionConfig {
  apiUrl?: string;
  webUrl?: string;
}

export interface SessionHome {
  config: SessionConfig;
  sessions: Record<string, SessionRecord>;
}

export interface OperatorIdentity {
  username: string | null;
  scope: string | null;
}

export type ValidationResult =
  | { ok: true; identity: OperatorIdentity }
  | { ok: false; kind: "config" | "auth" | "transport"; message: string };

export const DEFAULT_WEB_URL = "https://blaster.listeningkit.com";
export const DEFAULT_API_URL = "https://blaster.listeningkit.com";
