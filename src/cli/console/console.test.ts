import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { consoleParityProblems } from "../../../scripts/checks/checkConsoleParity.ts";
import { CONSOLE_SCREENS, LOCAL_NO_TEAM } from "../../console/screens/index.ts";
import { COMMAND_INDEX } from "../runner/helpers/commandIndex.ts";
import { COMMANDS } from "../runner/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { launchDeps, runLaunch } from "../launch/index.ts";
import { consoleCommand, consoleDeps, runConsole } from "./index.ts";

const KEYS = ["LOG_INBOX_STATE", "LOG_DB", "LOG_LOCAL_ACCOUNTS", "LOG_RUNS_DIR", "LOG_USER_ENV", "LOG_PLATFORM_STATE", "LOG_TWITTER_STATE", "LOG_FBK_STATE", "LOG_MCP_STAMP_FILE", "LOG_MCP_RELOAD_FILE"] as const;
const before: Record<string, string | undefined> = {};
const real = { ...consoleDeps };
const realLaunch = { ...launchDeps, prompts: { ...launchDeps.prompts } };
const root = join(import.meta.dir, "..", "..", "..");

beforeAll(() => {
  for (const key of KEYS) before[key] = process.env[key];
  const dir = mkdtempSync(join(tmpdir(), "consoleCommand"));
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
  writeFileSync(process.env.LOG_LOCAL_ACCOUNTS, JSON.stringify({ socialAccounts: [{ id: "local:twitter:fakeBird", platform: "TWITTER", accountName: "fakeBird", sessionState: "loggedIn" }] }));
});

afterAll(() => {
  for (const key of KEYS) {
    if (before[key] === undefined) delete process.env[key];
    else process.env[key] = before[key];
  }
});

afterEach(() => {
  Object.assign(consoleDeps, real);
  Object.assign(launchDeps, realLaunch);
});

function capture() {
  const out: string[] = [];
  const err: string[] = [];
  const context = { out: (line: string) => out.push(line), err: (line: string) => err.push(line) } as unknown as CommandContext;
  return { context, out, err };
}

describe("log console screens", () => {
  test("is registered like every other command, with one MCP form per screen", () => {
    expect(COMMANDS).toContain(consoleCommand);
    expect(COMMAND_INDEX.find((entry) => entry.name === "console")).toEqual({ name: "console", platform: "any", module: "src/cli/console/index.ts", exportName: "consoleCommand" });
    expect(consoleCommand.input?.forms.filter((form) => !form.terminalOnly).map((form) => form.words[0])).toEqual(CONSOLE_SCREENS.map((screen) => screen.domain));
    expect(consoleCommand.input?.forms.every((form) => form.effect === "read")).toBe(true);
  });

  test("each screen answers --json with its loader's data", async () => {
    const { context } = capture();
    for (const screen of CONSOLE_SCREENS) {
      const result = await runConsole(context, [screen.domain, "--json"]);
      expect(result.code).toBe(0);
      const body = JSON.parse(result.stdout!) as { schemaVersion: number };
      expect(body.schemaVersion).toBe(1);
    }
    const start = JSON.parse((await runConsole(context, ["start", "--json"])).stdout!);
    expect(start).toMatchObject({ source: "local", accounts: 1, database: { found: false }, mcp: { running: false } });
    const connections = JSON.parse((await runConsole(context, ["connections", "--platform", "twitter", "--json"])).stdout!);
    expect(connections.platforms[0].accounts[0].accountName).toBe("fakeBird");
    const events = JSON.parse((await runConsole(context, ["events", "--status", "failed", "--page", "0", "--pageSize", "5", "--json"])).stdout!);
    expect(events).toMatchObject({ total: 0, page: 0, pageSize: 5 });
    const codex = JSON.parse((await runConsole(context, ["aiClients", "--client", "codex", "--json"])).stdout!);
    expect(codex.clients.map((client: { id: string }) => client.id)).toEqual(["codex"]);
    expect(existsSync(join(process.env.LOG_INBOX_STATE!, "log.db"))).toBe(false);
  });

  test("each screen also reads as text", async () => {
    const { context } = capture();
    expect((await runConsole(context, ["start"])).stdout).toContain("log.db      not found");
    expect((await runConsole(context, ["connections"])).stdout).toContain("fakeBird  loggedIn");
    expect((await runConsole(context, ["usage", "--days", "30"])).stdout).toBe("No calls in the last 30 day(s).");
    expect((await runConsole(context, ["events"])).stdout).toBe("No events in log.db yet.");
    expect((await runConsole(context, ["aiClients"])).stdout).toContain("claude mcp add log -- bun --cwd");
    expect((await runConsole(context, ["settings"])).stdout).toContain("Web console: log console --web");
  });

  test("bad input is refused with the usage", async () => {
    const { context } = capture();
    expect((await runConsole(context, ["teams"])).code).toBe(1);
    expect((await runConsole(context, ["usage", "--days", "3"])).stderr).toContain("inputInvalid: --days got \"3\"; it takes one of 1, 7, 30");
    expect((await runConsole(context, ["events", "--status", "odd"])).code).toBe(1);
    expect((await runConsole(context, ["events", "--page", "-1"])).code).toBe(1);
    expect((await runConsole(context, ["connections", "--platform", "myspace"])).code).toBe(1);
    expect((await runConsole(context, ["start", "--web"])).code).toBe(1);
    expect((await runConsole(context, ["--web", "--port", "abc"])).code).toBe(1);
  });
});

describe("log console, interactive and web", () => {
  test("the interactive console needs a terminal", async () => {
    consoleDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    const { context } = capture();
    const result = await runConsole(context, []);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("log console <start|connections|usage|events|aiClients|settings> [--json]");
  });

  test("the menu offers one screen per web nav item, then teams and the web console", async () => {
    const offered: string[][] = [];
    const answers = ["start", "teams", "settings", "back", "quit"];
    consoleDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    consoleDeps.intro = () => {};
    consoleDeps.outro = () => {};
    consoleDeps.select = async (options) => {
      offered.push((options as { options: { value: string }[] }).options.map((option) => option.value));
      return answers.shift();
    };
    const { context, out } = capture();
    expect((await runConsole(context, [])).code).toBe(0);
    expect(offered[0]).toEqual([...CONSOLE_SCREENS.map((screen) => screen.domain), "teams", "web", "quit"]);
    expect(out.join("\n")).toContain("Accounts    1");
    expect(out).toContain(LOCAL_NO_TEAM);
    expect(out.join("\n")).toContain("Governor (today, per account)");
  });

  test("log launch has a Console entry that opens the console menu", async () => {
    launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    launchDeps.twentyReady = () => false;
    launchDeps.prompts = { ...launchDeps.prompts, intro: () => {}, outro: () => {}, cancel: () => {}, select: async () => "console" };
    const menus: string[][] = [];
    consoleDeps.select = async (options) => {
      menus.push((options as { options: { value: string }[] }).options.map((option) => option.value));
      return "quit";
    };
    const { context } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(menus[0][0]).toBe("start");
  });

  test("--web serves on loopback, opens /console/start and stops when done", async () => {
    const opened: string[] = [];
    let stopped = false;
    consoleDeps.serve = (options) => {
      expect(options.port).toBe(7401);
      return { url: "http://127.0.0.1:7401", port: 7401, stop: () => { stopped = true; } };
    };
    consoleDeps.openUrl = (url) => {
      opened.push(url);
      return true;
    };
    consoleDeps.wait = async () => {};
    const { context, out } = capture();
    expect((await runConsole(context, ["--web", "--port", "7401"])).code).toBe(0);
    expect(opened).toEqual(["http://127.0.0.1:7401/console/start"]);
    expect(out[0]).toContain("local mode at http://127.0.0.1:7401/console/start");
    expect(stopped).toBe(true);
  });

  test("--web without a built site prints the build command", async () => {
    consoleDeps.serve = () => {
      throw new Error("the web console isn't built (no index.html in dist): run pnpm --dir site install && pnpm --dir site --filter web build");
    };
    const { context, err } = capture();
    expect((await runConsole(context, ["--web", "--noOpen"])).code).toBe(1);
    expect(err[0]).toContain("pnpm --dir site --filter web build");
  });
});

describe("console parity check", () => {
  const read = (rel: string) => (existsSync(join(root, rel)) ? readFileSync(join(root, rel), "utf8").replace(/\r\n/g, "\n") : null);

  test("passes on the repo as it is", () => {
    expect(consoleParityProblems({ read })).toEqual([]);
  });

  test("fails when a web page has no clack screen", () => {
    const layout = "site/apps/web/src/pages/console/ConsoleLayout.tsx";
    const files = { read: (rel: string) => (rel === layout ? read(rel)!.replace("  { to: '/console/settings'", "  { to: '/console/billing', label: 'Billing', icon: faGear },\n  { to: '/console/settings'") : read(rel)) };
    expect(consoleParityProblems(files).join("\n")).toContain("every web page needs its clack screen");
  });

  test("fails when the clack screen or the web page reads another loader", () => {
    const files = {
      read: (rel: string) => {
        if (rel === "src/cli/console/helpers/usageScreen.ts") return read(rel)!.replaceAll('from "../../../console/usage/index.ts"', 'from "../../../observability/usage/index.ts"');
        if (rel === "site/apps/web/src/pages/console/usageData.ts") return read(rel)!.replace("/api/console/usage", "/api/other/usage");
        return read(rel);
      },
    };
    const problems = consoleParityProblems(files).join("\n");
    expect(problems).toContain("usageScreen.ts doesn't read src/console/usage");
    expect(problems).toContain("doesn't fetch /api/console/usage");
  });
});
