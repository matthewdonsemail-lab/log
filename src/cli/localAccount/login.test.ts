import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runConsoleOperation } from "../../console/operations/index.ts";
import { commandTools } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { COMMANDS } from "../runner/index.ts";
import type { CommandResult } from "../runner/types.ts";
import { localAccountCommand, localAccountDeps } from "./index.ts";

const KEYS = ["LOG_LOCAL_ACCOUNTS", "LOG_INBOX_STATE", "LOG_DB"] as const;
const before: Record<string, string | undefined> = {};
const saved = { ...localAccountDeps };
const SECRET = "fakePasswordForTwins0001";
const ROWS = { socialAccounts: [
  { id: "local:facebook:fakeSeller", platform: "FACEBOOK", accountName: "fakeSeller" },
  { id: "local:twitter:fakeBird", platform: "TWITTER", accountName: "fakeBird" },
] };
let dir = "";
let answers: string[] = [];

const quiet = { out: () => {}, err: () => {} } as never;
const run = (argv: string[]): Promise<CommandResult> => Promise.resolve(localAccountCommand.run(quiet, argv));
const rows = () => (JSON.parse(readFileSync(process.env.LOG_LOCAL_ACCOUNTS!, "utf8")) as { socialAccounts: Record<string, unknown>[] }).socialAccounts;
const withoutTime = (list: Record<string, unknown>[]) => list.map(({ updatedAt: _updatedAt, ...row }) => row);
const consoleCode = (promise: Promise<unknown>) => promise.then(() => null, (error: Error) => error.message);
const password = (platform: string, account: string, username = "seller@example.com", secret = SECRET) => runConsoleOperation("accountSignIn", { platform, method: "password", account, username, password: secret });

beforeAll(() => {
  for (const key of KEYS) before[key] = process.env[key];
  dir = mkdtempSync(join(tmpdir(), "consoleTwinsLogin"));
  process.env.LOG_LOCAL_ACCOUNTS = join(dir, "localAccounts.json");
  process.env.LOG_INBOX_STATE = join(dir, "state");
  delete process.env.LOG_DB;
});

beforeEach(() => {
  writeFileSync(process.env.LOG_LOCAL_ACCOUNTS!, JSON.stringify(ROWS));
  answers = [];
  localAccountDeps.prompts = { intro: () => {}, outro: () => {}, cancel: () => {}, password: async () => answers.shift() ?? "" };
  localAccountDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  localAccountDeps.env = process.env;
});

afterAll(() => {
  Object.assign(localAccountDeps, saved);
  for (const key of KEYS) {
    if (before[key] === undefined) delete process.env[key];
    else process.env[key] = before[key];
  }
  rmSync(dir, { recursive: true, force: true });
});

describe("localAccount login is the console's password sign-in", () => {
  test("it saves the same email and password to the same row, and never prints them", async () => {
    await password("facebook", "fakeSeller");
    const fromConsole = withoutTime(rows());
    writeFileSync(process.env.LOG_LOCAL_ACCOUNTS!, JSON.stringify(ROWS));
    answers = ["seller@example.com", SECRET];
    const twin = await run(["login", "--platform", "facebook", "--account", "fakeSeller"]);
    expect(twin.code).toBe(0);
    expect(withoutTime(rows())).toEqual(fromConsole);
    expect(rows()[0]).toMatchObject({ email: "seller@example.com", password: SECRET });
    expect(JSON.stringify(twin)).not.toContain(SECRET);
    expect(JSON.stringify(twin)).not.toContain("seller@example.com");
  });

  test("a platform with no password sign-in, an account not in the file and a bad value are refused with the console's codes, and nothing is written", async () => {
    const cases: [string, string, string[]][] = [
      ["twitter", "fakeBird", ["bird@example.com", SECRET]],
      ["facebook", "fakeNobody", ["nobody@example.com", SECRET]],
      ["facebook", "fakeSeller", ["seller@example.com", "x".repeat(1025)]],
    ];
    for (const [platform, account, [username, secret]] of cases) {
      const fromConsole = await consoleCode(password(platform, account, username, secret));
      answers = [username, secret];
      const twin = await run(["login", "--platform", platform, "--account", account]);
      expect(fromConsole).not.toBeNull();
      expect(twin.error).toBe(fromConsole as never);
      expect(rows()).toEqual(ROWS.socialAccounts);
    }
    expect(await consoleCode(password("twitter", "fakeBird"))).toBe("passwordSignInUnavailable");
    expect(await consoleCode(password("facebook", "fakeNobody"))).toBe("accountNotFound");
  });

  test("with no terminal it is refused as terminal-only and asks nothing; MCP lists no localAccountLogin tool", async () => {
    localAccountDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    let asked = false;
    localAccountDeps.prompts = { ...localAccountDeps.prompts, password: async () => ((asked = true), SECRET) };
    const twin = await run(["login", "--platform", "facebook", "--account", "fakeSeller"]);
    expect(twin.error).toBe("terminalOnly");
    expect(asked).toBe(false);
    expect(commandTools(COMMANDS).map((entry) => entry.tool)).not.toContain("localAccountLogin");
  });
});
