import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { serveLogMcpHttp } from "../server/index.ts";
import { challengeOf, CLAUDE_CALLBACK, createOAuthServer, listClients, readStore, revokeClients } from "./index.ts";

const PUBLIC = "https://mcp.test";
const TWENTY = "https://twenty.test";
const OWNER = "userOwner1";
const jwt = (claims: Record<string, unknown>) => `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;

const stops: (() => void)[] = [];
afterEach(() => stops.splice(0).forEach((stop) => stop()));

function setUp(signedInAs = OWNER) {
  const storePath = join(mkdtempSync(join(tmpdir(), "logOauth")), "oauth.json");
  const seen: { url: string; auth: string | null; body: string }[] = [];
  let clock = Date.parse("2026-10-22T12:00:00Z");
  const fakeTwenty = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    seen.push({ url, auth: headers.get("authorization"), body: String(init?.body ?? "") });
    if (url.endsWith("/.well-known/oauth-authorization-server")) return Response.json({ authorization_endpoint: `${TWENTY}/authorize`, token_endpoint: `${TWENTY}/oauth/token`, registration_endpoint: `${TWENTY}/oauth/register` });
    if (url.endsWith("/oauth/register")) return Response.json({ client_id: "twentyClientForLog" }, { status: 201 });
    if (url.endsWith("/oauth/token")) return Response.json({ access_token: jwt({ userId: signedInAs, workspaceId: "w1" }), token_type: "Bearer" });
    return new Response("not found", { status: 404 });
  }) as typeof fetch;
  const oauth = createOAuthServer({ publicUrl: PUBLIC, twenty: { baseUrl: TWENTY, basicUser: "guard", basicPassword: "wall" }, ownerUserId: () => OWNER, storePath, fetch: fakeTwenty, now: () => clock });
  const served = serveLogMcpHttp({ port: 0, token: "staticSecret", oauth, context: { twenty: marketplaceFixture() }, server: { logDir: null, watchFlows: false } });
  stops.push(served.stop);
  const base = served.url.replace(/\/mcp$/, "");
  return { oauth, base, mcp: served.url, storePath, seen, advance: (ms: number) => (clock += ms) };
}

async function signIn(env: ReturnType<typeof setUp>) {
  const registered = (await (await fetch(`${env.base}/oauth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_name: "Claude", redirect_uris: [CLAUDE_CALLBACK], token_endpoint_auth_method: "none" }) })).json()) as { client_id: string };
  const verifier = "v".repeat(50);
  const authorize = new URL(`${env.base}/oauth/authorize`);
  for (const [k, v] of Object.entries({ response_type: "code", client_id: registered.client_id, redirect_uri: CLAUDE_CALLBACK, state: "claudeState", code_challenge: challengeOf(verifier), code_challenge_method: "S256", resource: `${PUBLIC}/mcp`, scope: "log offline_access" })) authorize.searchParams.set(k, v);
  const toTwenty = await fetch(authorize, { redirect: "manual" });
  return { clientId: registered.client_id, verifier, toTwenty };
}

describe("OAuth on the HTTP server, signed in through Twenty (Duet plan step 5)", () => {
  test("an unauthenticated call is a 401 pointing at the protected resource metadata, whose resource is the MCP URL", async () => {
    const env = setUp();
    const answer = await fetch(env.mcp, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect(answer.status).toBe(401);
    expect(answer.headers.get("www-authenticate")).toBe(`Bearer resource_metadata="${PUBLIC}/.well-known/oauth-protected-resource/mcp", scope="log"`);
    const resource = (await (await fetch(`${env.base}/.well-known/oauth-protected-resource/mcp`)).json()) as Record<string, unknown>;
    expect(resource).toMatchObject({ resource: `${PUBLIC}/mcp`, authorization_servers: [PUBLIC] });
    const server = (await (await fetch(`${env.base}/.well-known/oauth-authorization-server`)).json()) as Record<string, unknown>;
    expect(server).toMatchObject({ issuer: PUBLIC, registration_endpoint: `${PUBLIC}/oauth/register`, code_challenge_methods_supported: ["S256"], token_endpoint_auth_methods_supported: ["none"] });
    expect(server.scopes_supported).toContain("offline_access");
  });

  test("register, authorize through Twenty as the owner, redeem with PKCE, use the MCP, refresh, revoke", async () => {
    const env = setUp();
    const { clientId, verifier, toTwenty } = await signIn(env);
    expect(toTwenty.status).toBe(302);
    const twentyUrl = new URL(toTwenty.headers.get("location")!);
    expect(twentyUrl.origin + twentyUrl.pathname).toBe(`${TWENTY}/authorize`);
    expect(twentyUrl.searchParams.get("client_id")).toBe("twentyClientForLog");
    expect(twentyUrl.searchParams.get("redirect_uri")).toBe(`${PUBLIC}/oauth/twenty/callback`);
    expect(twentyUrl.searchParams.get("code_challenge_method")).toBe("S256");
    expect(env.seen.filter((s) => s.url.startsWith(TWENTY)).every((s) => s.auth === `Basic ${Buffer.from("guard:wall").toString("base64")}`)).toBe(true);
    expect(JSON.parse(env.seen.find((s) => s.url.endsWith("/oauth/register"))!.body)).toMatchObject({ redirect_uris: [`${PUBLIC}/oauth/twenty/callback`], token_endpoint_auth_method: "none" });

    const back = await fetch(`${env.base}/oauth/twenty/callback?code=twentyCode&state=${twentyUrl.searchParams.get("state")}`, { redirect: "manual" });
    expect(back.status).toBe(302);
    const toClaude = new URL(back.headers.get("location")!);
    expect(toClaude.origin + toClaude.pathname).toBe(CLAUDE_CALLBACK);
    expect(toClaude.searchParams.get("state")).toBe("claudeState");
    const code = toClaude.searchParams.get("code")!;
    const twentyToken = new URLSearchParams(env.seen.find((s) => s.url.endsWith("/oauth/token"))!.body);
    expect(twentyToken.get("code_verifier")).toBeTruthy();
    expect(challengeOf(twentyToken.get("code_verifier")!)).toBe(twentyUrl.searchParams.get("code_challenge")!);

    const redeem = (params: Record<string, string>) => fetch(`${env.base}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params).toString() });
    expect((await redeem({ grant_type: "authorization_code", code, client_id: clientId, redirect_uri: CLAUDE_CALLBACK, code_verifier: "wrong".repeat(10) })).status).toBe(400);
    expect((await redeem({ grant_type: "authorization_code", code, client_id: clientId, redirect_uri: CLAUDE_CALLBACK, code_verifier: verifier })).status).toBe(400);

    const again = await signIn(env);
    const state2 = new URL(again.toTwenty.headers.get("location")!).searchParams.get("state");
    const code2 = new URL((await fetch(`${env.base}/oauth/twenty/callback?code=t2&state=${state2}`, { redirect: "manual" })).headers.get("location")!).searchParams.get("code")!;
    const tokens = (await (await redeem({ grant_type: "authorization_code", code: code2, client_id: again.clientId, redirect_uri: CLAUDE_CALLBACK, code_verifier: again.verifier })).json()) as { access_token: string; refresh_token: string; expires_in: number };
    expect(tokens.expires_in).toBe(3600);
    expect((await redeem({ grant_type: "authorization_code", code: code2, client_id: again.clientId, redirect_uri: CLAUDE_CALLBACK, code_verifier: again.verifier })).status).toBe(400);
    expect(JSON.stringify(readStore(env.storePath))).not.toContain(tokens.access_token);

    const client = new Client({ name: "claude-ai", version: "0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(env.mcp), { requestInit: { headers: { Authorization: `Bearer ${tokens.access_token}` } } }));
    stops.push(() => void client.close());
    expect((await client.listTools()).tools.some((t) => t.name === "accounts")).toBe(true);

    const rotated = (await (await redeem({ grant_type: "refresh_token", refresh_token: tokens.refresh_token, client_id: again.clientId })).json()) as { access_token: string };
    expect(rotated.access_token).toBeTruthy();
    expect((await redeem({ grant_type: "refresh_token", refresh_token: tokens.refresh_token })).status).toBe(400);
    expect(env.oauth.verifyBearer(rotated.access_token)).toBe(true);
    env.advance(3601_000);
    expect(env.oauth.verifyBearer(rotated.access_token)).toBe(false);

    expect(listClients(env.storePath).map((c) => c.clientId)).toContain(again.clientId);
    expect(revokeClients("all", env.storePath).length).toBe(2);
    expect(Object.keys(readStore(env.storePath).tokens)).toHaveLength(0);
  });

  test("anyone but the owner is refused at Twenty's callback, and no code is issued", async () => {
    const env = setUp("someoneElse");
    const { toTwenty } = await signIn(env);
    const state = new URL(toTwenty.headers.get("location")!).searchParams.get("state");
    const back = await fetch(`${env.base}/oauth/twenty/callback?code=x&state=${state}`, { redirect: "manual" });
    expect(back.status).toBe(403);
    expect(await back.text()).toContain("Not this server's owner");
  });

  test("a return address that isn't Claude's callback or loopback is refused at registration", async () => {
    const env = setUp();
    const answer = await fetch(`${env.base}/oauth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ redirect_uris: ["https://evil.test/cb"] }) });
    expect(answer.status).toBe(400);
    const loopback = await fetch(`${env.base}/oauth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ redirect_uris: ["http://localhost:51234/callback"] }) });
    expect(loopback.status).toBe(201);
  });

  test("the static bearer token still works beside OAuth", async () => {
    const env = setUp();
    const client = new Client({ name: "claude-code", version: "0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(env.mcp), { requestInit: { headers: { Authorization: "Bearer staticSecret" } } }));
    stops.push(() => void client.close());
    expect((await client.listTools()).tools.length).toBeGreaterThan(50);
  });
});
