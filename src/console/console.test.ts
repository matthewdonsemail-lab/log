import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendEvent, db } from "../inbox/store/index.ts";
import { loadConsoleAiClients, shellWord } from "./aiClients/index.ts";
import { loadConsoleConnections } from "./connections/index.ts";
import { filterConsoleEvents, loadConsoleEvents } from "./events/index.ts";
import { CONSOLE_SCREENS } from "./screens/index.ts";
import { loadConsoleSettings } from "./settings/index.ts";
import { loadConsoleStart } from "./start/index.ts";
import { loadConsoleUsage } from "./usage/index.ts";
import { consoleApiAnswer, consoleRequestAllowed, serveConsoleWeb, siteFileOf, withLocalMode } from "./web/index.ts";

const KEYS = ["LOG_INBOX_STATE", "LOG_DB", "LOG_LOCAL_ACCOUNTS", "LOG_RUNS_DIR", "LOG_USER_ENV", "LOG_PLATFORM_STATE", "LOG_TWITTER_STATE", "LOG_FBK_STATE", "LOG_MCP_STAMP_FILE", "LOG_MCP_RELOAD_FILE", "LOG_OPENCODE_DIR"] as const;
const before: Record<string, string | undefined> = {};
let home = "";

function useHome(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), name));
  process.env.LOG_INBOX_STATE = join(dir, "state");
  delete process.env.LOG_DB;
  process.env.LOG_LOCAL_ACCOUNTS = join(dir, "localAccounts.json");
  process.env.LOG_RUNS_DIR = join(dir, "runs");
  process.env.LOG_USER_ENV = join(dir, ".env");
  process.env.LOG_PLATFORM_STATE = join(dir, "platforms");
  process.env.LOG_TWITTER_STATE = join(dir, "twitter");
  process.env.LOG_FBK_STATE = join(dir, "fbk");
  process.env.LOG_MCP_STAMP_FILE = join(dir, "server.json");
  process.env.LOG_MCP_RELOAD_FILE = join(dir, "reload.json");
  process.env.LOG_OPENCODE_DIR = join(dir, "opencode");
  return dir;
}

beforeAll(() => {
  for (const key of KEYS) before[key] = process.env[key];
  home = useHome("consoleLoaders");
});

afterAll(() => {
  for (const key of KEYS) {
    if (before[key] === undefined) delete process.env[key];
    else process.env[key] = before[key];
  }
});

describe("console loaders on a machine with nothing yet", () => {
  test("start says log.db is missing and doesn't create it", () => {
    const fresh = useHome("consoleEmpty");
    const start = loadConsoleStart();
    expect(start.database).toEqual({ path: join(fresh, "state", "log.db"), found: false });
    expect(start.mcp.running).toBe(false);
    expect(start.accounts).toBe(0);
    expect(start.lastEventAt).toBeNull();
    expect(loadConsoleStart().database.found).toBe(false);
    expect(loadConsoleEvents().total).toBe(0);
    expect(loadConsoleUsage(1).totals.calls).toBe(0);
    home = useHome("consoleLoadersAgain");
  });
});

describe("console loaders", () => {
  beforeAll(() => {
    writeFileSync(process.env.LOG_LOCAL_ACCOUNTS!, JSON.stringify({ socialAccounts: [
      { id: "local:twitter:fakeBird", platform: "TWITTER", accountName: "fakeBird", sessionState: "loggedIn" },
      { id: "local:discord:fakeGuild", platform: "DISCORD", accountName: "fakeGuild", adsPowerProfileId: "profileOne" },
      { id: "local:reddit:noName", platform: "REDDIT" },
    ] }));
    appendEvent({ platform: "discord", account: "fakeGuild", conversationId: "c1", type: "message", with: "someone", text: "hello", payload: { id: "1" }, sourceAt: "2026-11-10T10:00:00Z", receivedAt: "2026-11-10T10:00:01Z" });
    appendEvent({ platform: "discord", account: "fakeGuild", conversationId: "c1", type: "reaction", with: "someone", payload: { id: "2" }, sourceAt: "2026-11-10T10:01:00Z", receivedAt: "2026-11-10T10:01:01Z" });
    const now = Date.now();
    const span = db().prepare("INSERT INTO spans (spanId, traceId, callId, parentId, tool, name, source, pid, startedAt, ms, ok, attrs) VALUES (?, ?, ?, NULL, ?, 'call', 'cli', 1, ?, ?, ?, '{}')");
    span.run("s1", "s1", "c1", "cli twitter post", now - 3600000, 900, 1);
    span.run("s2", "s2", "c2", "cli twitter read", now - 7200000, 300, 0);
    span.run("s3", "s3", "c3", "cli governor show", now - 3 * 86400000, 50, 1);
    mkdirSync(join(process.env.LOG_TWITTER_STATE!, "fakeBird"), { recursive: true });
    writeFileSync(join(process.env.LOG_TWITTER_STATE!, "fakeBird", "governor_state.json"), JSON.stringify({ day: "2026-11-13", day_count: 12, mutation_count: 3, hour_count: 2 }));
  });

  test("start counts accounts and finds the newest event", () => {
    const start = loadConsoleStart();
    expect(start.database.found).toBe(true);
    expect(start.accounts).toBe(2);
    expect(start.lastEventAt).toBe("2026-11-10T10:01:01.000Z");
  });

  test("connections groups accounts by platform with their session state", () => {
    const data = loadConsoleConnections();
    expect(data.total).toBe(2);
    expect(data.platforms.map((group) => group.label)).toEqual(["X", "Discord"]);
    expect(data.platforms[0].accounts[0]).toMatchObject({ accountName: "fakeBird", sessionState: "loggedIn", browserProfile: false, signIn: "cookies" });
    expect(data.platforms[1].accounts[0]).toMatchObject({ accountName: "fakeGuild", sessionState: null, browserProfile: true, signIn: "browser" });
    expect(loadConsoleConnections({ platform: "discord" }).total).toBe(1);
    expect(() => loadConsoleConnections({ platform: "myspace" })).toThrow("consolePlatformInvalid");
  });

  test("usage totals calls by kind for 1, 7 and 30 days", () => {
    const today = loadConsoleUsage(1);
    expect(today.totals).toMatchObject({ calls: 2, succeeded: 1, failed: 1 });
    expect(Object.fromEntries(today.kinds.map((kind) => [kind.kind, kind.calls]))).toEqual({ platformWrite: 1, platformRead: 1 });
    expect(loadConsoleUsage(7).totals.calls).toBe(3);
    expect(loadConsoleUsage(30).buckets.length).toBeGreaterThanOrEqual(30);
    expect(() => loadConsoleUsage(2 as never)).toThrow("usageRangeInvalid");
  });

  test("events filter by kind and status and page", () => {
    const all = loadConsoleEvents({ pageSize: 1 });
    expect(all.total).toBe(2);
    expect(all.pageCount).toBe(2);
    expect(all.events[0].kind).toBe("Reaction");
    expect(all.kinds).toEqual(["Message received", "Reaction"]);
    expect(loadConsoleEvents({ pageSize: 1, page: 1 }).events[0].kind).toBe("Message received");
    expect(loadConsoleEvents({ kind: "message received" }).total).toBe(1);
    expect(loadConsoleEvents({ status: "failed" }).total).toBe(0);
    expect(loadConsoleEvents({ page: 99 }).page).toBe(0);
    expect(() => filterConsoleEvents({ schemaVersion: 1, source: "workspace", generatedAt: "", events: [] }, { status: "odd" as never })).toThrow("consoleEventStatusInvalid");
  });

  test("ai clients print this machine's MCP config for Claude Code, Codex and opencode", () => {
    const data = loadConsoleAiClients({ root: join(home, "log checkout") });
    expect(data.server).toEqual(["bun", "--cwd", join(home, "log checkout"), "bin", "logMcp.ts"]);
    expect(data.clients.map((client) => client.id)).toEqual(["claudeCode", "codex", "opencode"]);
    expect(data.clients[0].command).toBe(`claude mcp add log -- bun --cwd ${shellWord(join(home, "log checkout"))} bin logMcp.ts`);
    expect(JSON.parse(data.clients[0].config)).toEqual({ mcpServers: { log: { command: "bun", args: ["--cwd", join(home, "log checkout"), "bin", "logMcp.ts"] } } });
    expect(data.clients[1].config).toContain("[mcp_servers.log]");
    expect(JSON.parse(data.clients[2].config).mcp.servers.log).toEqual({ type: "local", command: data.server, codemode: false });
    expect(loadConsoleAiClients({ client: "codex" }).clients.map((client) => client.id)).toEqual(["codex"]);
    expect(() => loadConsoleAiClients({ client: "nope" })).toThrow("consoleAiClientInvalid");
  });

  test("settings name the paths, each governor and the web console", () => {
    const data = loadConsoleSettings(7400);
    expect(data.paths).toEqual({ database: join(home, "state", "log.db"), runs: join(home, "runs"), accounts: join(home, "localAccounts.json"), env: join(home, ".env") });
    expect(data.governors).toEqual([{ platform: "twitter", account: "fakeBird", day: "2026-11-13", requests: 12, writes: 3, writesPerDay: data.governors[0].writesPerDay, hourRequests: 2, cooldownSeconds: 0 }]);
    expect(data.webConsole).toEqual({ command: "log console --web", url: "http://127.0.0.1:7400/console/start" });
  });

  test("every api path answers from its loader, the same data the screens read", async () => {
    for (const screen of CONSOLE_SCREENS) {
      const answer = consoleApiAnswer(new URL(`http://127.0.0.1:7338${screen.api}`), "GET", 7338);
      expect(answer?.status).toBe(200);
      expect(((await answer!.json()) as { schemaVersion: number }).schemaVersion).toBe(1);
    }
    const events = (await consoleApiAnswer(new URL("http://127.0.0.1:7338/api/console/events"), "GET", 7338)!.json()) as { events: unknown[] };
    expect(events.events.length).toBe(2);
    expect(consoleApiAnswer(new URL("http://127.0.0.1:7338/api/console/usage?days=3"), "GET", 7338)?.status).toBe(400);
    expect(consoleApiAnswer(new URL("http://127.0.0.1:7338/api/console/start"), "POST", 7338)?.status).toBe(405);
    expect(consoleApiAnswer(new URL("http://127.0.0.1:7338/api/console/nothing"), "GET", 7338)?.status).toBe(404);
    expect(consoleApiAnswer(new URL("http://127.0.0.1:7338/api/v1/session"), "GET", 7338)?.status).toBe(401);
    expect(await consoleApiAnswer(new URL("http://127.0.0.1:7338/api/console/mode"), "GET", 7338)!.json()).toEqual({ mode: "local", team: null, billing: null });
    expect(consoleApiAnswer(new URL("http://127.0.0.1:7338/console/start"), "GET", 7338)).toBeNull();
  });
});

describe("local web mode", () => {
  test("the guard lets only this machine in", () => {
    const ok = { host: "127.0.0.1:7338", remote: "127.0.0.1", origin: null, fetchSite: "same-origin" };
    expect(consoleRequestAllowed(ok)).toBe(true);
    expect(consoleRequestAllowed({ ...ok, host: "localhost:7338", remote: "::1", origin: "http://localhost:7338" })).toBe(true);
    expect(consoleRequestAllowed({ ...ok, host: "evil.example:7338" })).toBe(false);
    expect(consoleRequestAllowed({ ...ok, remote: "203.0.113.9" })).toBe(false);
    expect(consoleRequestAllowed({ ...ok, origin: "http://evil.example" })).toBe(false);
    expect(consoleRequestAllowed({ ...ok, fetchSite: "cross-site" })).toBe(false);
    expect(consoleRequestAllowed({ ...ok, host: null })).toBe(false);
  });

  test("the page is told it is local, and files stay inside the site", () => {
    expect(withLocalMode("<html><head></head></html>")).toBe('<html><head><script>window.logConsoleMode="local"</script></head></html>');
    const site = mkdtempSync(join(tmpdir(), "consoleSite"));
    writeFileSync(join(site, "index.html"), "<html><head></head><body></body></html>");
    expect(siteFileOf(site, "/index.html")).toBe(join(site, "index.html"));
    expect(siteFileOf(site, "/../secret.txt")).toBeNull();
    expect(siteFileOf(site, "/%2e%2e/secret.txt")).toBeNull();
  });

  test("serves the console on loopback in local mode and refuses other origins", async () => {
    const site = mkdtempSync(join(tmpdir(), "consoleServe"));
    mkdirSync(join(site, "assets"));
    writeFileSync(join(site, "index.html"), "<html><head><title>log</title></head><body></body></html>");
    writeFileSync(join(site, "assets", "app.js"), "console.log(1)");
    const server = serveConsoleWeb({ port: 0, siteDir: site });
    try {
      expect(server.url).toStartWith("http://127.0.0.1:");
      const page = await fetch(`${server.url}/console/start`);
      expect(page.status).toBe(200);
      expect(await page.text()).toContain('window.logConsoleMode="local"');
      expect(await (await fetch(`${server.url}/assets/app.js`)).text()).toBe("console.log(1)");
      expect((await fetch(`${server.url}/assets/missing.js`)).status).toBe(404);
      const start = await fetch(`${server.url}/api/console/start`);
      expect(((await start.json()) as { source: string }).source).toBe("local");
      expect((await fetch(`${server.url}/api/console/start`, { headers: { origin: "http://evil.example" } })).status).toBe(403);
      expect((await fetch(`${server.url}/api/console/start`, { headers: { "sec-fetch-site": "cross-site" } })).status).toBe(403);
    } finally {
      server.stop();
    }
    expect(() => serveConsoleWeb({ host: "0.0.0.0", siteDir: site })).toThrow("loopback only");
    expect(() => serveConsoleWeb({ port: 0, siteDir: join(site, "nothing") })).toThrow("isn't built");
  });
});
