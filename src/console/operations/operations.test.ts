import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { generateKeyPairSync, sign } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonical, connectOnce, requestHash } from "../../runtime/bridge/index.ts";
import type { Authority, Binding } from "../../runtime/bridge/index.ts";
import { migrate } from "../../storage/schema/index.ts";
import { consoleOperation, isolationRefusal } from "../../cli/runtime/index.ts";
import { CREDENTIAL_MASK } from "../../auth/credentials/index.ts";
import { checkStateOf, createAccountChecker } from "../accountCheck/index.ts";
import { connectionIdOf } from "../connections/index.ts";
import type { ConnectionsView } from "../connections/index.ts";
import { parseCookies, signInDeps } from "../signIn/index.ts";
import { consoleMutationAnswer } from "../web/index.ts";
import { consoleErrorCode, redactConsoleArgs, runConsoleOperation } from "./index.ts";

const KEYS = ["LOG_INBOX_STATE", "LOG_DB", "LOG_LOCAL_ACCOUNTS", "LOG_USER_ENV", "LOG_PLATFORM_STATE", "LOG_TWITTER_STATE", "LOG_FBK_STATE", "JINA_API_KEY", "PARALLEL_API_KEY"] as const;
const before: Record<string, string | undefined> = {};
const SECRET = "sk-fakeSecretValueForMaskingTest0001";
const NEW_SECRET = "sk-fakeNewSecretValueForSaving00002";
let dir = "";

const accepting = async () => Response.json({ monitors: [] });
const okStatus = async () => Response.json({ code: 0 });

beforeAll(() => {
  for (const key of KEYS) before[key] = process.env[key];
  dir = mkdtempSync(join(tmpdir(), "consoleOperations"));
  process.env.LOG_INBOX_STATE = join(dir, "state");
  delete process.env.LOG_DB;
  delete process.env.JINA_API_KEY;
  delete process.env.PARALLEL_API_KEY;
  process.env.LOG_LOCAL_ACCOUNTS = join(dir, "localAccounts.json");
  process.env.LOG_USER_ENV = join(dir, ".env");
  process.env.LOG_PLATFORM_STATE = join(dir, "platforms");
  process.env.LOG_TWITTER_STATE = join(dir, "twitter");
  process.env.LOG_FBK_STATE = join(dir, "fbk");
  writeFileSync(process.env.LOG_USER_ENV, `JINA_API_KEY="${SECRET}"\nADSPOWER_HOST="http://127.0.0.1:50325"\nLOG_ADSPOWER_HOMES="US,CA"\nADSPOWER_API_KEY="${SECRET}"\n`);
  writeFileSync(process.env.LOG_LOCAL_ACCOUNTS, JSON.stringify({ socialAccounts: [
    { id: "local:twitter:fakeBird", platform: "TWITTER", accountName: "fakeBird", sessionState: "loggedIn", sessionCheckedAt: "2026-11-12T10:00:00Z", homeCountry: "us", proxy: "http://user:pass@proxy.2captcha.com:8080" },
    { id: "local:facebook:fakeSeller", platform: "FACEBOOK", accountName: "fakeSeller", accountStatus: "ACTIVE", email: "old@example.com", password: SECRET },
  ] }));
  mkdirSync(join(process.env.LOG_PLATFORM_STATE, "discord", "fakeGuild"), { recursive: true });
  writeFileSync(join(process.env.LOG_PLATFORM_STATE, "discord", "fakeGuild", "session.json"), JSON.stringify({ sessionState: "loggedOut", checkedAt: "2026-11-11T09:00:00Z" }));
});

afterAll(() => {
  for (const key of KEYS) {
    if (before[key] === undefined) delete process.env[key];
    else process.env[key] = before[key];
  }
});

describe("console operations on the runtime", () => {
  test("connectionsList shows accounts and key states, never a key", async () => {
    const view = (await runConsoleOperation("connectionsList", {})) as ConnectionsView;
    const text = JSON.stringify(view);
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain("user:pass");
    expect(view.accounts.map((account) => `${account.platform}:${account.name}:${account.state}`)).toEqual(["discord:fakeGuild:loggedOut", "facebook:fakeSeller:unknown", "twitter:fakeBird:loggedIn"]);
    expect(view.accounts.find((account) => account.name === "fakeBird")).toMatchObject({ id: connectionIdOf("twitter", "fakeBird"), homeCountry: "US", proxyProvider: "twoCaptcha" });
    const jina = view.extensions.find((extension) => extension.key === "jina")!;
    expect(jina).toMatchObject({ state: "configured", persisted: true });
    expect(jina.fields).toEqual([{ id: "JINA_API_KEY", label: "API key", secret: true, required: true, inputType: "password", hasValue: true, masked: CREDENTIAL_MASK }]);
    const adsPower = view.extensions.find((extension) => extension.key === "adsPower")!;
    expect(adsPower.fields.find((field) => field.id === "ADSPOWER_API_KEY")?.masked).toBe(CREDENTIAL_MASK);
    expect(adsPower.fields.find((field) => field.id === "ADSPOWER_HOST")?.masked).toBeNull();
  });

  test("credentialsRead answers AdsPower's countries and URL only, never its key, and nothing for other providers", async () => {
    expect(await runConsoleOperation("credentialsRead", { provider: "adsPower" })).toEqual({ values: { LOG_ADSPOWER_HOMES: "US,CA", ADSPOWER_HOST: "http://127.0.0.1:50325" } });
    await expect(runConsoleOperation("credentialsRead", { provider: "jina" })).rejects.toThrow("credentialInputInvalid");
  });

  test("credentialsSave checks the key with its provider, saves it, and answers without it", async () => {
    let probed = "";
    const saved = await runConsoleOperation("credentialsSave", { provider: "parallel", values: { PARALLEL_API_KEY: NEW_SECRET } }, { fetcher: async (url, init) => { probed = `${url} ${JSON.stringify(init?.headers)}`; return accepting(); } });
    expect(probed).toContain("api.parallel.ai");
    expect(probed).toContain(NEW_SECRET);
    expect(JSON.stringify(saved)).not.toContain(NEW_SECRET);
    expect(saved).toMatchObject({ saved: true, changed: true });
    expect(readFileSync(process.env.LOG_USER_ENV!, "utf8")).toContain(`PARALLEL_API_KEY="${NEW_SECRET}"`);
    const rejected = runConsoleOperation("credentialsSave", { provider: "jina", values: { JINA_API_KEY: "skWrong" } }, { fetcher: async () => new Response("{}", { status: 401 }) });
    await expect(rejected).rejects.toThrow("credentialRejected");
    expect(readFileSync(process.env.LOG_USER_ENV!, "utf8")).toContain(`JINA_API_KEY="${SECRET}"`);
    await expect(runConsoleOperation("credentialsSave", { provider: "jina", values: { JINA_API_KEY: 'with"quote' } })).rejects.toThrow("credentialInputInvalid");
    await expect(runConsoleOperation("credentialsSave", { provider: "jina", values: { OTHER_KEY: "x" } })).rejects.toThrow("credentialInputInvalid");
  });

  test("AdsPower saves countries and URL and keeps the held key when none is typed", async () => {
    let auth = "";
    await runConsoleOperation("credentialsSave", { provider: "adsPower", values: { LOG_ADSPOWER_HOMES: "gb, us, gb", ADSPOWER_HOST: "http://127.0.0.1:50325/" } }, { fetcher: async (_url, init) => { auth = JSON.stringify(init?.headers); return okStatus(); } });
    expect(auth).toContain(SECRET);
    const file = readFileSync(process.env.LOG_USER_ENV!, "utf8");
    expect(file).toContain('LOG_ADSPOWER_HOMES="GB,US"');
    expect(file).toContain(`ADSPOWER_API_KEY="${SECRET}"`);
    await expect(runConsoleOperation("credentialsSave", { provider: "adsPower", values: { LOG_ADSPOWER_HOMES: "GBR", ADSPOWER_HOST: "http://127.0.0.1:50325" } }, { fetcher: okStatus })).rejects.toThrow("credentialInputInvalid");
  });

  test("accountCheck runs the platform's session check through log and records its outcome", async () => {
    const calls: string[] = [];
    const id = connectionIdOf("twitter", "fakeBird");
    const answer = (await runConsoleOperation("accountCheck", { accountId: id }, { callTool: async (name, input) => { calls.push(`${name} ${JSON.stringify(input)}`); return { structuredContent: { ok: true } }; } })) as { state: string; connections: { accounts: { id: string; lastCheck: { state: string } | null }[] } };
    expect(calls).toEqual(['twitterSessionCheck {"account":"fakeBird","json":true}']);
    expect(answer.state).toBe("succeeded");
    expect(answer.connections.accounts.find((account) => account.id === id)?.lastCheck?.state).toBe("succeeded");
    await expect(runConsoleOperation("accountCheck", { accountId: connectionIdOf("facebook", "fakeSeller") })).rejects.toThrow("browserCheckRequired");
    await expect(runConsoleOperation("accountCheck", { accountId: "0".repeat(24) })).rejects.toThrow("accountNotFound");
  });

  test("the checker runs one check at a time and reads a refusal as stopped", async () => {
    let release: () => void = () => {};
    const recorded: string[] = [];
    const checker = createAccountChecker(() => new Promise((resolve) => { release = () => resolve({ isError: true }); }), (id, state) => recorded.push(`${id}:${state}`));
    const first = checker.check({ id: "a", name: "fakeBird", platform: "twitter" });
    await expect(checker.check({ id: "b", name: "other", platform: "reddit" })).rejects.toThrow("accountCheckBusy");
    expect(checker.activeAccountId()).toBe("a");
    release();
    expect(await first).toEqual({ state: "stopped" });
    expect(recorded).toEqual(["a:running", "a:stopped"]);
    expect(checkStateOf({ structuredContent: { job: { id: "j" } } })).toBe("unknown");
    checker.stop();
  });

  test("accountSignIn pastes cookies into the platform's own cookie save, and refuses platforms without one", async () => {
    const held = signInDeps.route;
    const asked: string[] = [];
    const deps = { prompts: { intro() {}, outro() {}, cancel() {}, password: async (_option: { message: string }) => "" as unknown }, tty: () => ({ stdinTTY: false as boolean | undefined, stdoutTTY: false as boolean | undefined }) };
    const command = { name: "cookies", platform: "twitter", usage: "", summary: "", args: "", async run(_context: unknown, argv: string[]) {
      for (const message of ["auth_token", "ct0", "twid"]) asked.push(String(await deps.prompts.password({ message })));
      return argv[2] === "fakeBird" && deps.tty().stdinTTY ? { code: 0, stdout: "saved" } : { code: 1, stderr: "twitterCookiesRefused: notLoggedIn" };
    } };
    signInDeps.route = (async (platform: string) => (platform === "twitter" ? { deps, command } : null)) as unknown as typeof held;
    try {
      const cookies = JSON.stringify([{ name: "auth_token", value: "a".repeat(40) }, { name: "ct0", value: "c".repeat(40) }, { name: "twid", value: "u%3D123456789" }, { name: "other", value: "x" }]);
      const result = (await runConsoleOperation("accountSignIn", { platform: "twitter", method: "cookies", account: "fakeBird", cookies })) as Record<string, unknown>;
      expect(result).toMatchObject({ signedIn: true, accountId: connectionIdOf("twitter", "fakeBird") });
      expect(asked).toEqual(["a".repeat(40), "c".repeat(40), "u%3D123456789"]);
      expect(JSON.stringify(result)).not.toContain("a".repeat(40));
      await expect(runConsoleOperation("accountSignIn", { platform: "discord", method: "cookies", account: "fakeGuild", cookies })).rejects.toThrow("cookieSignInUnavailable");
      await expect(runConsoleOperation("accountSignIn", { platform: "twitter", method: "cookies", account: "fakeBird", cookies: "ct0=only" })).rejects.toThrow("cookiesIncomplete");
      await expect(runConsoleOperation("accountSignIn", { platform: "twitter", method: "password", account: "fakeBird", username: "u", password: "p" })).rejects.toThrow("passwordSignInUnavailable");
    } finally {
      signInDeps.route = held;
    }
  });

  test("a Facebook password is saved where facebook connect reads it, then the browser check signs in", async () => {
    const result = (await runConsoleOperation("accountSignIn", { platform: "facebook", method: "password", account: "fakeSeller", username: "seller@example.com", password: NEW_SECRET })) as Record<string, unknown>;
    expect(result).toMatchObject({ signedIn: false, next: "browserCheck", accountId: connectionIdOf("facebook", "fakeSeller") });
    expect(JSON.stringify(result)).not.toContain(NEW_SECRET);
    const row = JSON.parse(readFileSync(process.env.LOG_LOCAL_ACCOUNTS!, "utf8")).socialAccounts.find((item: { accountName: string }) => item.accountName === "fakeSeller");
    expect(row).toMatchObject({ email: "seller@example.com", password: NEW_SECRET });
  });

  test("cookies parse from a header, a JSON export or Netscape lines", () => {
    expect(parseCookies("li_at=AQEDAT; JSESSIONID=\"ajax:1234567890123\"; lang=en", ["li_at", "JSESSIONID"])).toEqual({ li_at: "AQEDAT", JSESSIONID: "\"ajax:1234567890123\"" });
    expect(parseCookies(JSON.stringify({ d: "xoxdAbc" }), ["d"])).toEqual({ d: "xoxdAbc" });
    expect(parseCookies(".example.com\tTRUE\t/\tTRUE\t0\tlang\ten", ["lang"])).toEqual({ lang: "en" });
    expect(() => parseCookies("", ["d"])).toThrow("cookiesIncomplete");
  });

  test("errors leave as safe codes only, and secret arguments are redacted before the journal", () => {
    expect(consoleErrorCode(new Error(`provider said ${SECRET}`))).toBe("consoleWorkspaceUnavailable");
    expect(consoleErrorCode(new Error("credentialRejected"))).toBe("credentialRejected");
    expect(redactConsoleArgs("credentialsSave", { provider: "jina", values: { JINA_API_KEY: SECRET } })).toEqual({ provider: "jina", values: "<redacted>" });
    expect(redactConsoleArgs("accountSignIn", { platform: "x", cookies: SECRET, password: SECRET, account: "a" })).toEqual({ platform: "x", cookies: "<redacted>", password: "<redacted>", account: "a" });
    expect(redactConsoleArgs("connectionsList", { a: 1 })).toEqual({ a: 1 });
  });

  test("the local web console takes mutations only as same-origin JSON posts", async () => {
    const request = (headers: Record<string, string>, body: unknown) => ({ header: (name: string) => headers[name] ?? null, json: async () => body });
    expect((await consoleMutationAnswer("/api/console/credentials/read", "GET", request({}, {}))).status).toBe(405);
    expect((await consoleMutationAnswer("/api/console/credentials/read", "POST", request({ "content-type": "application/json" }, { provider: "adsPower" }))).status).toBe(405);
    const read = await consoleMutationAnswer("/api/console/credentials/read", "POST", request({ "content-type": "application/json", "x-log-console": "1" }, { provider: "adsPower" }));
    expect(read.status).toBe(200);
    expect(await read.text()).not.toContain(SECRET);
    expect((await consoleMutationAnswer("/api/console/connections/check", "POST", request({ "content-type": "application/json", "x-log-console": "1" }, { accountId: "0".repeat(24) }))).status).toBe(404);
  });
});

describe("console operations over the bridge", () => {
  test("a credentialsSave dispatch leaves the runtime without the key: not in the answer, not in the journal", async () => {
    const keys = generateKeyPairSync("ed25519");
    const publicKey = Buffer.from((keys.publicKey.export({ format: "jwk" }) as { x: string }).x, "base64url").toString("base64");
    const binding: Binding = { origin: "https://app.example", workspaceId: "w1", installationId: "i1", credential: "c", generation: 1, expiresAt: "2099-01-01T00:00:00Z", dispatchPublicKey: publicKey, bridgeUrl: "wss://app.example/bridge", pairedAt: "2026-11-10T00:00:00Z" };
    const args = { provider: "parallel", values: { PARALLEL_API_KEY: SECRET } };
    const unsigned: Omit<Authority, "signature"> = { teamId: "t1", workspaceId: "w1", actorUserId: "u1", grantId: null, tool: "credentialsSave", requestHash: requestHash("credentialsSave", args), routeGeneration: 3, authzVersion: 1, issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString() };
    const authority = { ...unsigned, signature: sign(null, Buffer.from(canonical(unsigned)), keys.privateKey).toString("base64") };
    const db = new Database(":memory:");
    migrate(db);
    const sent: string[] = [];
    const listeners: Record<string, ((event: { data?: string; code?: number; reason?: string }) => void)[]> = {};
    const socket = { readyState: 1, send: (text: string) => sent.push(text), close: () => listeners.close?.forEach((listener) => listener({ code: 1000, reason: "stopped" })), addEventListener: (name: string, listener: (event: { data?: string }) => void) => { (listeners[name] ??= []).push(listener); } };
    const done = connectOnce({ binding, db, runTool: (tool, input) => consoleOperation(tool, input, async () => ({}), { fetcher: accepting }), isLive: () => false, hello: () => ({ runtimeVersion: "test", schemaVersion: 1, capabilities: {} }), onLine: () => {}, redact: redactConsoleArgs, socket: () => socket as unknown as WebSocket });
    const message = async (envelope: unknown) => { for (const listener of listeners.message ?? []) await listener({ data: JSON.stringify(envelope) }); };
    listeners.open?.forEach((listener) => listener({}));
    await message({ protocolVersion: 1, kind: "heartbeat", workspaceId: "w1", routeGeneration: 3, payload: { heartbeatSeconds: 3600 } });
    await message({ protocolVersion: 1, kind: "dispatch", workspaceId: "w1", routeGeneration: 3, operationId: "op1", authority, payload: { tool: "credentialsSave", args } });
    socket.close();
    await done;
    const result = sent.map((text) => JSON.parse(text)).find((envelope) => envelope.kind === "result");
    expect(result.payload).toMatchObject({ state: "succeeded", result: { saved: true } });
    expect(sent.join("\n")).not.toContain(SECRET);
    const rows = db.query("SELECT args, result, error FROM operations").all();
    expect(JSON.stringify(rows)).not.toContain(SECRET);
    expect(JSON.stringify(rows)).toContain("<redacted>");
  });
});

describe("test runtimes", () => {
  test("a runtime paired under its own LOG_RUNTIME_DIR must keep its own log.db", () => {
    expect(isolationRefusal({ LOG_RUNTIME_DIR: "/tmp/runtime" })).toContain("LOG_DB");
    expect(isolationRefusal({ LOG_RUNTIME_DIR: "/tmp/runtime", LOG_DB: "/tmp/runtime/log.db" })).toBeNull();
    expect(isolationRefusal({})).toBeNull();
  });
});
