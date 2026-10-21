#!/usr/bin/env node

import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const DEFAULT_PORT = 8787;
const MAX_BODY_BYTES = 8 * 1024;
const MAX_EMAIL_LENGTH = 320;
const MAX_FIRST_NAME_LENGTH = 100;
const REQUESTS_PER_MINUTE = 60;
const TWENTY_TIMEOUT_MS = 5_000;
const SUBSCRIBE_PATH = "/v1/newsletter/subscribe";
const HEALTH_PATH = "/healthz";

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function secureEqual(left, right) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (
    email.length === 0 ||
    email.length > MAX_EMAIL_LENGTH ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return null;
  }
  return email;
}

function normalizeFirstName(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return null;
  const firstName = value.trim();
  if (firstName.length === 0) return undefined;
  if (firstName.length > MAX_FIRST_NAME_LENGTH || /[\u0000-\u001f\u007f]/.test(firstName)) {
    return null;
  }
  return firstName;
}

async function twentyRequest(config, path, init = {}) {
  const response = await config.fetchImpl(`${config.twentyBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.twentyApiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(TWENTY_TIMEOUT_MS),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Twenty ${init.method ?? "GET"} failed with HTTP ${response.status}`);
  }
  return text.trim() ? JSON.parse(text) : {};
}

function memberIdFromList(result) {
  const rows = result?.data?.newsletterMembers;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return typeof rows[0]?.id === "string" ? rows[0].id : null;
}

async function upsertMember(config, member) {
  const params = new URLSearchParams({
    limit: "1",
    filter: `email[eq]:${JSON.stringify(member.email)}`,
  });
  const listed = await twentyRequest(config, `/newsletterMembers?${params.toString()}`);
  const id = memberIdFromList(listed);
  const payload = JSON.stringify({
    email: member.email,
    ...(member.firstName ? { firstName: member.firstName } : {}),
    source: "listeningkit-website",
    status: "ACTIVE",
    consentAt: config.now().toISOString(),
  });
  if (id) {
    await twentyRequest(config, `/newsletterMembers/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: payload,
    });
    return;
  }
  await twentyRequest(config, "/newsletterMembers", { method: "POST", body: payload });
}

function createRateLimiter() {
  let windowStartedAt = Date.now();
  let count = 0;
  return () => {
    const now = Date.now();
    if (now - windowStartedAt >= 60_000) {
      windowStartedAt = now;
      count = 0;
    }
    count += 1;
    return count <= REQUESTS_PER_MINUTE;
  };
}

/** Creates the relay's web-standard request handler for production and tests. */
export function createRelayHandler(options) {
  const config = {
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    now: options.now ?? (() => new Date()),
    relayToken: options.relayToken,
    twentyApiKey: options.twentyApiKey,
    twentyBaseUrl: options.twentyBaseUrl.replace(/\/+$/, ""),
  };
  const allowRequest = options.allowRequest ?? createRateLimiter();
  const inFlight = new Map();

  return async (request) => {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === HEALTH_PATH) {
      return jsonResponse(200, { ok: true });
    }
    if (url.pathname !== SUBSCRIBE_PATH) return jsonResponse(404, { error: "not_found" });
    if (request.method !== "POST") return jsonResponse(405, { error: "method_not_allowed" });
    if (!allowRequest()) return jsonResponse(429, { error: "rate_limited" });

    const authorization = request.headers.get("authorization") ?? "";
    const suppliedToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!secureEqual(suppliedToken, config.relayToken)) {
      return jsonResponse(401, { error: "unauthorized" });
    }
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) return jsonResponse(413, { error: "body_too_large" });

    let body;
    try {
      const text = await request.text();
      if (Buffer.byteLength(text) > MAX_BODY_BYTES) {
        return jsonResponse(413, { error: "body_too_large" });
      }
      body = JSON.parse(text);
    } catch {
      return jsonResponse(400, { error: "invalid_json" });
    }

    const email = normalizeEmail(body?.email);
    const firstName = normalizeFirstName(body?.firstName);
    if (!email || firstName === null) return jsonResponse(400, { error: "invalid_input" });

    const previous = inFlight.get(email) ?? Promise.resolve();
    const operation = previous.then(() => upsertMember(config, { email, firstName }));
    inFlight.set(email, operation);
    try {
      await operation;
      return jsonResponse(200, { ok: true });
    } catch (error) {
      console.error(`[newsletter-relay] Twenty sync failed: ${error instanceof Error ? error.message : "unknown error"}`);
      return jsonResponse(502, { error: "sync_failed" });
    } finally {
      if (inFlight.get(email) === operation) inFlight.delete(email);
    }
  };
}

async function readNodeRequest(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new RangeError("body_too_large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** Starts the localhost relay HTTP server. */
export function startRelayServer(options) {
  const handler = createRelayHandler(options);
  const server = createServer(async (request, response) => {
    try {
      const body = await readNodeRequest(request);
      const webRequest = new Request(`http://localhost${request.url ?? "/"}`, {
        method: request.method,
        headers: request.headers,
        body: body.length > 0 ? body : undefined,
      });
      const result = await handler(webRequest);
      response.writeHead(result.status, Object.fromEntries(result.headers.entries()));
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch (error) {
      const status = error instanceof RangeError ? 413 : 500;
      const result = jsonResponse(status, { error: status === 413 ? "body_too_large" : "internal_error" });
      response.writeHead(result.status, Object.fromEntries(result.headers.entries()));
      response.end(Buffer.from(await result.arrayBuffer()));
    }
  });
  server.requestTimeout = 10_000;
  server.headersTimeout = 5_000;
  server.listen(options.port ?? DEFAULT_PORT, "0.0.0.0");
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const relayToken = process.env.NEWSLETTER_RELAY_TOKEN?.trim() ?? "";
  const twentyApiKey = process.env.TWENTY_API_KEY?.trim() ?? "";
  const twentyBaseUrl = process.env.TWENTY_BASE_URL?.trim() ?? "";
  if (relayToken.length < 32 || !twentyApiKey || !twentyBaseUrl) {
    console.error("Newsletter relay configuration is missing or invalid.");
    process.exit(1);
  }
  const server = startRelayServer({ relayToken, twentyApiKey, twentyBaseUrl });
  server.on("listening", () => console.log(`[newsletter-relay] listening on port ${DEFAULT_PORT}`));
}
