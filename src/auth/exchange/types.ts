import type { ErrorCode } from "../../errors/catalog/index.ts";
import type { SessionRecord } from "../session/index.ts";

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
  url: Promise<string>;
  result: Promise<ExchangeResult>;
  close: () => void;
}

export const EXCHANGE_TIMEOUT_MS = 120_000;
