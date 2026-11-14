import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runConsoleOperation } from "../../console/operations/index.ts";
import { commandTools } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { COMMANDS } from "../runner/index.ts";
import type { CommandResult } from "../runner/types.ts";
import { credentialsCommand, credentialsDeps } from "./index.ts";

const KEYS = ["LOG_USER_ENV", "JINA_API_KEY", "PARALLEL_API_KEY", "ADSPOWER_API_KEY", "ADSPOWER_HOST", "LOG_ADSPOWER_HOMES"] as const;
const before: Record<string, string | undefined> = {};
const saved = { ...credentialsDeps };
const OLD = "sk-fakeOldSecretValueForTwins0001";
const NEW = "sk-fakeNewSecretValueForTwins0002";
const STARTING = `JINA_API_KEY="${OLD}"\nADSPOWER_HOST="http://127.0.0.1:50325"\nLOG_ADSPOWER_HOMES="US,CA"\n`;
let dir = "";
let answers: string[] = [];

const accepting = async () => Response.json({ monitors: [], wallet: { id: 1 } });
const refusing = async () => new Response("{}", { status: 401 });
const okStatus = async () => Response.json({ code: 0 });
const quiet = { out: () => {}, err: () => {} } as never;
const run = (argv: string[]): Promise<CommandResult> => Promise.resolve(credentialsCommand.run(quiet, argv));
const file = () => readFileSync(process.env.LOG_USER_ENV!, "utf8");
const consoleCode = (promise: Promise<unknown>) => promise.then(() => null, (error: Error) => error.message);

beforeAll(() => {
  for (const key of KEYS) before[key] = process.env[key];
  for (const key of KEYS) delete process.env[key];
  dir = mkdtempSync(join(tmpdir(), "consoleTwinsCredentials"));
  process.env.LOG_USER_ENV = join(dir, ".env");
});

beforeEach(() => {
  writeFileSync(process.env.LOG_USER_ENV!, STARTING);
  answers = [];
  credentialsDeps.prompts = { intro: () => {}, outro: () => {}, cancel: () => {}, password: async () => answers.shift() ?? "" };
  credentialsDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  credentialsDeps.env = process.env;
});

afterAll(() => {
  Object.assign(credentialsDeps, saved);
  for (const key of KEYS) {
    if (before[key] === undefined) delete process.env[key];
    else process.env[key] = before[key];
  }
  rmSync(dir, { recursive: true, force: true });
});

describe("credentialsRead is the console's read", () => {
  test("it answers the same values that are not secret, and refuses the same providers with the same code", async () => {
    const console = (await runConsoleOperation("credentialsRead", { provider: "adsPower" })) as { values: Record<string, string> };
    const twin = await run(["read", "--provider", "adsPower", "--json"]);
    expect(twin.code).toBe(0);
    expect(JSON.parse(String(twin.stdout))).toEqual({ provider: "adsPower", values: console.values });
    expect(console.values).toEqual({ LOG_ADSPOWER_HOMES: "US,CA", ADSPOWER_HOST: "http://127.0.0.1:50325" });
    expect(await consoleCode(runConsoleOperation("credentialsRead", { provider: "jina" }))).toBe("credentialInputInvalid");
    const refused = await run(["read", "--provider", "jina"]);
    expect(refused.code).toBe(1);
    expect(refused.error).toBe("credentialInputInvalid");
    expect(String(refused.stderr)).not.toContain(OLD);
  });
});

describe("credentialsSave is the console's save, typed in a masked prompt", () => {
  test("a key the provider accepts is saved the same from both, and never printed", async () => {
    await runConsoleOperation("credentialsSave", { provider: "parallel", values: { PARALLEL_API_KEY: NEW } }, { fetcher: accepting });
    const fromConsole = file();
    writeFileSync(process.env.LOG_USER_ENV!, STARTING);
    delete process.env.PARALLEL_API_KEY;
    credentialsDeps.fetcher = accepting;
    answers = [NEW];
    const twin = await run(["save", "--provider", "parallel"]);
    expect(twin.code).toBe(0);
    expect(file()).toBe(fromConsole);
    expect(file()).toContain(`PARALLEL_API_KEY="${NEW}"`);
    expect(JSON.stringify(twin)).not.toContain(NEW);
  });

  test("a key the provider refuses is refused with the console's code, and nothing is written", async () => {
    expect(await consoleCode(runConsoleOperation("credentialsSave", { provider: "jina", values: { JINA_API_KEY: "skWrongKey" } }, { fetcher: refusing }))).toBe("credentialRejected");
    expect(file()).toBe(STARTING);
    credentialsDeps.fetcher = refusing;
    answers = ["skWrongKey"];
    const twin = await run(["save", "--provider", "jina"]);
    expect(twin.error).toBe("credentialRejected");
    expect(file()).toBe(STARTING);
  });

  test("a value the console refuses is refused by the twin with the same code", async () => {
    credentialsDeps.fetcher = okStatus;
    expect(await consoleCode(runConsoleOperation("credentialsSave", { provider: "adsPower", values: { LOG_ADSPOWER_HOMES: "GBR", ADSPOWER_HOST: "http://127.0.0.1:50325" } }, { fetcher: okStatus }))).toBe("credentialInputInvalid");
    const homes = await run(["save", "--provider", "adsPower", "--homes", "GBR"]);
    expect(homes.error).toBe("credentialInputInvalid");
    expect(await consoleCode(runConsoleOperation("credentialsSave", { provider: "jina", values: { JINA_API_KEY: 'with"quote' } }))).toBe("credentialInputInvalid");
    answers = ['with"quote'];
    expect((await run(["save", "--provider", "jina"])).error).toBe("credentialInputInvalid");
    expect((await run(["save", "--provider", "jina", "--host", "http://127.0.0.1:1"])).error).toBe("credentialInputInvalid");
    expect((await run(["save", "--provider", "madeUp"])).error).toBe("credentialInputInvalid");
    expect(file()).toBe(STARTING);
  });

  test("adsPower keeps its saved URL and countries when no flag names them, as the console's form starts from them", async () => {
    credentialsDeps.fetcher = okStatus;
    answers = [""];
    const twin = await run(["save", "--provider", "adsPower", "--homes", "gb,us"]);
    expect(twin.code).toBe(0);
    expect(file()).toContain('LOG_ADSPOWER_HOMES="GB,US"');
    expect(file()).toContain('ADSPOWER_HOST="http://127.0.0.1:50325"');
  });

  test("with no terminal it is refused as terminal-only and asks nothing; MCP lists credentialsRead and not credentialsSave", async () => {
    credentialsDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    let asked = false;
    credentialsDeps.prompts = { ...credentialsDeps.prompts, password: async () => ((asked = true), NEW) };
    const twin = await run(["save", "--provider", "jina"]);
    expect(twin.error).toBe("terminalOnly");
    expect(asked).toBe(false);
    const names = commandTools(COMMANDS).map((entry) => entry.tool);
    expect(names).toContain("credentialsRead");
    expect(names).not.toContain("credentialsSave");
  });
});
