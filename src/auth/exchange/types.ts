import type { ErrorCode } from "../../errors/catalog/index.ts";
import type { SessionRecord } from "../session/index.ts";

/** What blaster's web app POSTs to the loopback once the operator signed in to Twenty. */
export interface ExchangeRequest {
  state: string;
  code_challenge: string;
  access_token: string;
  refresh_token: string | null;
  expires_in: number | null;
}

export type ExchangeResult =
  | { ok: true; session: Pick<SessionRecord, "accessToken" | "refreshToken" | "expiresIn" | "obtainedAtMs"> }
  | { ok: false; error: Extract<ErrorCode, "timedOut" | "invalidExchange"> };

export interface ExchangeServer {
  /** `http://127.0.0.1:<port>` once listening. */
  url: Promise<string>;
  result: Promise<ExchangeResult>;
  close: () => void;
}

/** How long the browser has to finish sign-in (blaster: 30s; log-cli gives 2 minutes). */
export const EXCHANGE_TIMEOUT_MS = 120_000;
