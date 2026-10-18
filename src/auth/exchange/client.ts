/**
 * One-shot loopback exchange server, ported from blaster
 * `packages/blaster-cli/src/cli/login.ts` (`runExchangeServer`).
 *
 * Binds 127.0.0.1 only and accepts a single valid POST to /exchange. The POST
 * must echo this run's state and PKCE challenge, which ties it to the terminal
 * that opened the browser. The tokens themselves were minted by Twenty.
 */
import http from "node:http";
import { EXCHANGE_TIMEOUT_MS } from "./types.ts";
import type { ExchangeResult, ExchangeServer } from "./types.ts";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_TOKEN_LENGTH = 16_384;
const CORS = {
  // blaster's web app posts cross-origin, from its origin to 127.0.0.1.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const isTokenField = (value: unknown): value is string =>
  typeof value === "string" && value !== "" && value.length <= MAX_TOKEN_LENGTH;

/** True when the POST body is a valid exchange for this run. Pure. */
export function isValidExchange(payload: Record<string, unknown>, state: string, challenge: string): boolean {
  if (payload.state !== state || payload.code_challenge !== challenge) return false;
  if (!isTokenField(payload.access_token)) return false;
  const refresh = payload.refresh_token;
  if (refresh !== null && refresh !== undefined && !isTokenField(refresh)) return false;
  const expires = payload.expires_in;
  return expires === null || expires === undefined || typeof expires === "number";
}

export function runExchangeServer(options: { state: string; challenge: string; timeoutMs?: number }): ExchangeServer {
  let server: http.Server | undefined;
  let finished = false;
  let resolveResult: ((result: ExchangeResult) => void) | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const finish = (result: ExchangeResult) => {
    if (finished) return;
    finished = true;
    if (timer) clearTimeout(timer);
    resolveResult?.(result);
    server?.removeAllListeners("request");
    server?.closeAllConnections?.();
    server?.close();
  };

  const url = new Promise<string>((resolve, reject) => {
    server = http.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server?.address();
      resolve(`http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`);
    });
    server.on("error", reject);
  });

  const result = new Promise<ExchangeResult>((resolve) => {
    resolveResult = resolve;
    timer = setTimeout(() => finish({ ok: false, error: "timedOut" }), options.timeoutMs ?? EXCHANGE_TIMEOUT_MS);
    timer.unref?.();

    server?.on("request", (req, res) => {
      const send = (status: number, body: object) => {
        if (res.writableEnded) return;
        const text = JSON.stringify(body);
        res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(text), ...CORS });
        res.end(text);
      };
      if (req.method === "OPTIONS" && req.url === "/exchange") {
        res.writeHead(204, CORS);
        res.end();
        return;
      }
      if (finished) return send(409, { ok: false, error: "login already complete" });
      if (req.method !== "POST" || req.url !== "/exchange") return send(404, { ok: false, error: "not found" });

      let size = 0;
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          send(413, { ok: false, error: "payload too large" });
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on("end", () => {
        if (finished) return;
        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        } catch {
          return send(400, { ok: false, error: "invalidExchange" });
        }
        if (!isValidExchange(payload, options.state, options.challenge)) return send(400, { ok: false, error: "invalidExchange" });
        send(200, { ok: true });
        finish({
          ok: true,
          session: {
            accessToken: payload.access_token as string,
            refreshToken: (payload.refresh_token as string | null | undefined) ?? null,
            expiresIn: (payload.expires_in as number | null | undefined) ?? null,
            obtainedAtMs: Date.now(),
          },
        });
      });
      req.on("error", () => undefined);
    });
  });

  return { url, result, close: () => finish({ ok: false, error: "timedOut" }) };
}
