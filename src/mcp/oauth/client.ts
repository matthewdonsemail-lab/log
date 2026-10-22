import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { loadSessionHome } from "../../auth/session/index.ts";
import { basicAuthHeader, challengeOf, hashToken, randomToken, userIdOf } from "./helpers/index.ts";
import type { IssuedCode, OAuthClient, OAuthDeps, OAuthServer, OAuthStore, PendingAuthorization, TwentyOAuthConfig } from "./types.ts";
import { ACCESS_TTL_S, CLAUDE_CALLBACK, CODE_TTL_MS, LOOPBACK_CALLBACK, PENDING_TTL_MS, REFRESH_TTL_S, SCOPES, TWENTY_SCOPE } from "./types.ts";

export function oauthStorePath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_MCP_OAUTH_FILE || join(homedir(), ".logCli", "mcp", "oauth.json");
}

export function readStore(path: string): OAuthStore {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<OAuthStore>;
    return { twentyClients: parsed.twentyClients ?? {}, clients: parsed.clients ?? {}, tokens: parsed.tokens ?? {} };
  } catch {
    return { twentyClients: {}, clients: {}, tokens: {} };
  }
}

export function writeStore(path: string, store: OAuthStore): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(store, null, 2), { mode: 0o600 });
  try {
    chmodSync(path, 0o600);
  } catch {
  }
}

export function allowedRedirect(uri: string): boolean {
  return uri === CLAUDE_CALLBACK || LOOPBACK_CALLBACK.test(uri);
}

export function localOwnerUserId(): string | null {
  for (const session of Object.values(loadSessionHome().sessions)) {
    const id = userIdOf(session.accessToken);
    if (id) return id;
  }
  return null;
}

export function twentyConfigFromEnv(env: Record<string, string | undefined> = process.env): TwentyOAuthConfig | null {
  if (!env.TWENTY_BASE_URL) return null;
  return { baseUrl: new URL(env.TWENTY_BASE_URL).origin, basicUser: env.TWENTY_BASIC_USER || null, basicPassword: env.TWENTY_BASIC_PASSWORD || null };
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
const oauthError = (status: number, error: string, description: string) => json(status, { error, error_description: description });
const page = (status: number, title: string, text: string) =>
  new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="font-family:system-ui;max-width:32rem;margin:3rem auto;padding:0 1rem"><h1 style="font-size:1.3rem">${title}</h1><p>${text}</p></body>`, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
const redirect = (location: string) => new Response(null, { status: 302, headers: { Location: location, "Cache-Control": "no-store" } });

async function formOf(request: Request): Promise<URLSearchParams> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return new URLSearchParams(Object.entries(body).flatMap(([k, v]): [string, string][] => (typeof v === "string" ? [[k, v]] : [])));
  }
  return new URLSearchParams(await request.text());
}

export function createOAuthServer(deps: OAuthDeps): OAuthServer {
  const origin = new URL(deps.publicUrl).origin;
  const resource = `${origin}/mcp`;
  const resourceMetadata = `${origin}/.well-known/oauth-protected-resource/mcp`;
  const twentyRedirect = `${origin}/oauth/twenty/callback`;
  const pending = new Map<string, PendingAuthorization>();
  const codes = new Map<string, IssuedCode>();
  const guard: Record<string, string> = deps.twenty.basicUser && deps.twenty.basicPassword ? { Authorization: basicAuthHeader(deps.twenty.basicUser, deps.twenty.basicPassword) } : {};
  const twentyFetch = (url: string, init: RequestInit = {}) => deps.fetch(url, { ...init, headers: { ...(init.headers as Record<string, string> | undefined), ...guard } });

  const store = () => readStore(deps.storePath);
  const save = (s: OAuthStore) => writeStore(deps.storePath, s);
  const nowIso = (ms = deps.now()) => new Date(ms).toISOString();

  async function twentyEndpoints(): Promise<{ authorize: string; token: string; register: string | null }> {
    const response = await twentyFetch(`${deps.twenty.baseUrl}/.well-known/oauth-authorization-server`);
    if (!response.ok) throw new Error(`Twenty's sign-in isn't reachable from this server (discovery answered ${response.status})`);
    const doc = (await response.json()) as Record<string, unknown>;
    const url = (name: string) => (typeof doc[name] === "string" ? new URL(doc[name] as string, deps.twenty.baseUrl).toString() : null);
    const authorize = url("authorization_endpoint");
    const token = url("token_endpoint");
    if (!authorize || !token) throw new Error("Twenty's discovery document has no authorize or token endpoint");
    return { authorize, token, register: url("registration_endpoint") };
  }

  async function twentyClientId(register: string | null): Promise<string> {
    const known = store().twentyClients[twentyRedirect];
    if (known) return known;
    if (!register) throw new Error("Twenty offers no client registration, so this server can't sign anyone in through it");
    const response = await twentyFetch(register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "log-cli MCP", redirect_uris: [twentyRedirect], grant_types: ["authorization_code", "refresh_token"], token_endpoint_auth_method: "none" }),
    });
    if (!response.ok) throw new Error(`Twenty refused to register this server as a sign-in client (${response.status})`);
    const clientId = ((await response.json()) as { client_id?: unknown }).client_id;
    if (typeof clientId !== "string" || !clientId) throw new Error("Twenty's registration returned no client id");
    const s = store();
    s.twentyClients[twentyRedirect] = clientId;
    save(s);
    return clientId;
  }

  function issueTokens(clientId: string, scope: string): Record<string, unknown> {
    const s = store();
    const access = randomToken();
    const refresh = randomToken();
    const now = deps.now();
    for (const [hash, token] of Object.entries(s.tokens)) if (Date.parse(token.expiresAt) <= now) delete s.tokens[hash];
    s.tokens[hashToken(access)] = { clientId, kind: "access", expiresAt: nowIso(now + ACCESS_TTL_S * 1000) };
    s.tokens[hashToken(refresh)] = { clientId, kind: "refresh", expiresAt: nowIso(now + REFRESH_TTL_S * 1000) };
    if (s.clients[clientId]) s.clients[clientId].lastUsedAt = nowIso(now);
    save(s);
    return { access_token: access, token_type: "Bearer", expires_in: ACCESS_TTL_S, refresh_token: refresh, scope };
  }

  function liveClient(s: OAuthStore, clientId: string | null): OAuthClient | null {
    const client = clientId ? s.clients[clientId] : undefined;
    return client && !client.revoked ? client : null;
  }

  async function register(request: Request): Promise<Response> {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const uris = Array.isArray(body?.redirect_uris) ? (body!.redirect_uris as unknown[]).filter((u): u is string => typeof u === "string") : [];
    if (!uris.length) return oauthError(400, "invalid_redirect_uri", "redirect_uris is needed");
    const bad = uris.find((u) => !allowedRedirect(u));
    if (bad) return oauthError(400, "invalid_redirect_uri", `${bad} isn't Claude's callback or a loopback address`);
    if (body?.token_endpoint_auth_method !== undefined && body.token_endpoint_auth_method !== "none") return oauthError(400, "invalid_client_metadata", "only public clients (token_endpoint_auth_method none) are accepted");
    const client: OAuthClient = { clientId: `mcp_${randomToken(16)}`, name: typeof body?.client_name === "string" ? body.client_name.slice(0, 120) : "MCP client", redirectUris: uris, createdAt: nowIso(), lastUsedAt: null, revoked: false };
    const s = store();
    s.clients[client.clientId] = client;
    save(s);
    return json(201, { client_id: client.clientId, client_name: client.name, redirect_uris: uris, grant_types: ["authorization_code", "refresh_token"], response_types: ["code"], token_endpoint_auth_method: "none", client_id_issued_at: Math.floor(deps.now() / 1000) });
  }

  async function authorize(url: URL): Promise<Response> {
    const p = url.searchParams;
    const client = liveClient(store(), p.get("client_id"));
    if (!client) return page(400, "Unknown client", "This sign-in link names a client this server doesn't know. Add the connector again.");
    const redirectUri = p.get("redirect_uri") ?? "";
    if (!client.redirectUris.includes(redirectUri)) return page(400, "Wrong return address", "The return address doesn't match the one this client registered.");
    const back = (error: string) => redirect(`${redirectUri}${redirectUri.includes("?") ? "&" : "?"}${new URLSearchParams({ error, ...(p.get("state") ? { state: p.get("state")! } : {}) })}`);
    if (p.get("response_type") !== "code") return back("unsupported_response_type");
    if (p.get("code_challenge_method") !== "S256" || !p.get("code_challenge")) return back("invalid_request");
    const asked = p.get("resource");
    if (asked && asked !== resource) return back("invalid_target");
    if (!deps.ownerUserId()) return page(503, "No owner on this server", "Run <code>log login</code> on this server first: the Twenty user it signs in is the only one who may connect.");
    let endpoints;
    let twentyClient;
    try {
      endpoints = await twentyEndpoints();
      twentyClient = await twentyClientId(endpoints.register);
    } catch (error) {
      return page(502, "Twenty's sign-in isn't reachable", (error as Error).message);
    }
    for (const [id, item] of pending) if (deps.now() - item.createdAtMs > PENDING_TTL_MS) pending.delete(id);
    const item: PendingAuthorization = { id: randomToken(24), clientId: client.clientId, redirectUri, state: p.get("state"), challenge: p.get("code_challenge")!, scope: SCOPES.join(" "), twentyVerifier: randomToken(48), twentyRedirect, createdAtMs: deps.now() };
    pending.set(item.id, item);
    const to = new URL(endpoints.authorize);
    to.searchParams.set("response_type", "code");
    to.searchParams.set("client_id", twentyClient);
    to.searchParams.set("redirect_uri", twentyRedirect);
    to.searchParams.set("scope", TWENTY_SCOPE);
    to.searchParams.set("state", item.id);
    to.searchParams.set("code_challenge", challengeOf(item.twentyVerifier));
    to.searchParams.set("code_challenge_method", "S256");
    return redirect(to.toString());
  }

  async function twentyCallback(url: URL): Promise<Response> {
    const item = pending.get(url.searchParams.get("state") ?? "");
    if (!item || deps.now() - item.createdAtMs > PENDING_TTL_MS) return page(400, "Sign-in expired", "Start again from the connector.");
    pending.delete(item.id);
    const back = (params: Record<string, string>) => redirect(`${item.redirectUri}${item.redirectUri.includes("?") ? "&" : "?"}${new URLSearchParams({ ...params, ...(item.state ? { state: item.state } : {}) })}`);
    const code = url.searchParams.get("code");
    if (!code) return back({ error: "access_denied" });
    let userId: string | null = null;
    try {
      const endpoints = await twentyEndpoints();
      const response = await twentyFetch(endpoints.token, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: item.twentyRedirect, code_verifier: item.twentyVerifier, client_id: store().twentyClients[item.twentyRedirect] ?? "" }).toString(),
      });
      if (!response.ok) return page(502, "Twenty didn't finish the sign-in", `Its token endpoint answered ${response.status}.`);
      const token = ((await response.json()) as { access_token?: unknown }).access_token;
      userId = typeof token === "string" ? userIdOf(token) : null;
    } catch (error) {
      return page(502, "Twenty's sign-in isn't reachable", (error as Error).message);
    }
    if (!userId || userId !== deps.ownerUserId()) return page(403, "Not this server's owner", "Only the Twenty user who ran <code>log login</code> on this server may connect to it.");
    const ours = randomToken();
    codes.set(hashToken(ours), { clientId: item.clientId, redirectUri: item.redirectUri, challenge: item.challenge, scope: item.scope, expiresAtMs: deps.now() + CODE_TTL_MS });
    return back({ code: ours });
  }

  async function token(request: Request): Promise<Response> {
    const p = await formOf(request);
    const grant = p.get("grant_type");
    if (grant === "authorization_code") {
      const key = hashToken(p.get("code") ?? "");
      const issued = codes.get(key);
      codes.delete(key);
      if (!issued || issued.expiresAtMs < deps.now()) return oauthError(400, "invalid_grant", "the code is unknown, used or expired");
      if (p.get("client_id") !== issued.clientId || p.get("redirect_uri") !== issued.redirectUri) return oauthError(400, "invalid_grant", "the code was issued to another client or return address");
      if (challengeOf(p.get("code_verifier") ?? "") !== issued.challenge) return oauthError(400, "invalid_grant", "the code verifier doesn't match the challenge");
      if (!liveClient(store(), issued.clientId)) return oauthError(400, "invalid_client", "the client was revoked");
      return json(200, issueTokens(issued.clientId, issued.scope));
    }
    if (grant === "refresh_token") {
      const s = store();
      const key = hashToken(p.get("refresh_token") ?? "");
      const stored = s.tokens[key];
      if (!stored || stored.kind !== "refresh" || Date.parse(stored.expiresAt) <= deps.now() || !liveClient(s, stored.clientId)) return oauthError(400, "invalid_grant", "the refresh token is unknown, expired or revoked");
      if (p.get("client_id") && p.get("client_id") !== stored.clientId) return oauthError(400, "invalid_grant", "the refresh token belongs to another client");
      delete s.tokens[key];
      save(s);
      return json(200, issueTokens(stored.clientId, SCOPES.join(" ")));
    }
    return oauthError(400, "unsupported_grant_type", "authorization_code or refresh_token");
  }

  const protectedResource = () => json(200, { resource, authorization_servers: [origin], scopes_supported: [...SCOPES], bearer_methods_supported: ["header"], resource_name: "logCli" });
  const authorizationServer = () =>
    json(200, {
      issuer: origin,
      authorization_endpoint: `${origin}/oauth/authorize`,
      token_endpoint: `${origin}/oauth/token`,
      registration_endpoint: `${origin}/oauth/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      scopes_supported: [...SCOPES],
    });

  return {
    resource,
    publicHost: new URL(origin).host,
    async handle(request) {
      const url = new URL(request.url);
      const path = url.pathname;
      if (request.method === "GET" && (path === "/.well-known/oauth-protected-resource" || path === "/.well-known/oauth-protected-resource/mcp")) return protectedResource();
      if (request.method === "GET" && path === "/.well-known/oauth-authorization-server") return authorizationServer();
      if (request.method === "POST" && path === "/oauth/register") return register(request);
      if (request.method === "GET" && path === "/oauth/authorize") return authorize(url);
      if (request.method === "GET" && path === "/oauth/twenty/callback") return twentyCallback(url);
      if (request.method === "POST" && path === "/oauth/token") return token(request);
      return null;
    },
    verifyBearer(bearer) {
      const s = store();
      const stored = s.tokens[hashToken(bearer)];
      return Boolean(stored && stored.kind === "access" && Date.parse(stored.expiresAt) > deps.now() && liveClient(s, stored.clientId));
    },
    unauthorized() {
      return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": `Bearer resource_metadata="${resourceMetadata}", scope="log"` } });
    },
  };
}

export function oauthFromEnv(env: Record<string, string | undefined> = process.env): OAuthServer | null {
  const publicUrl = env.LOG_MCP_PUBLIC_URL;
  const twenty = twentyConfigFromEnv(env);
  if (!publicUrl || !twenty) return null;
  return createOAuthServer({ publicUrl, twenty, ownerUserId: () => env.LOG_MCP_OWNER_USER_ID || localOwnerUserId(), storePath: oauthStorePath(env), fetch: ((...args: Parameters<typeof fetch>) => fetch(...args)) as typeof fetch, now: () => Date.now() });
}

export function listClients(path = oauthStorePath()): (OAuthClient & { liveTokens: number })[] {
  const s = readStore(path);
  const now = Date.now();
  return Object.values(s.clients).map((c) => ({ ...c, liveTokens: Object.values(s.tokens).filter((t) => t.clientId === c.clientId && Date.parse(t.expiresAt) > now).length }));
}

export function revokeClients(which: string, path = oauthStorePath()): string[] {
  const s = readStore(path);
  const ids = which === "all" ? Object.keys(s.clients) : Object.keys(s.clients).filter((id) => id === which);
  for (const id of ids) s.clients[id].revoked = true;
  for (const [hash, t] of Object.entries(s.tokens)) if (ids.includes(t.clientId)) delete s.tokens[hash];
  if (ids.length) writeStore(path, s);
  return ids;
}

