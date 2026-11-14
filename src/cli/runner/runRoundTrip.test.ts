import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commandLine } from "../../mcp/server/helpers/guardCall.ts";
import { commandTools, toolsFromCommands } from "../../mcp/server/helpers/toolsFromCommands.ts";
import type { CommandTool } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { instrumentFetch } from "../../observability/timing/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { tregDeps } from "../treg/index.ts";
import { argvOfInput, isPlatform } from "./helpers/index.ts";
import { COMMANDS, runCli } from "./index.ts";
import type { CommandContext, FlagSpec, InputForm, PositionalSpec } from "./types.ts";

const SKIP: Readonly<Record<string, string>> = {
  inspectStart: "opens the account's browser as its own process",
  facebookHostStart: "runs the host loop, which drives a browser for minutes",
  mediaDescriber: "starts the describer process",
  localAccountPull: "pulls every account from Twenty with its own client, not the context's",
  facebookWatch: "with checks 0 it watches until stopped",
};

const WRITES = new Set(["apply", "write", "docs"]);

const CONDITIONAL_BOUNDS: Readonly<Record<string, string>> = {
  "instagramDms.limit": "at most 100 threads, or 200 messages with --with: the schema states the larger bound and run refuses the rest",
};

const INPUT_REFUSAL = /inputInvalid|unknown option|needs a value|takes no value|was given more than once|is a whole number|is true or false|must be \d|limitInvalid|secondsInvalid|notificationQueryInvalid|userIdInvalid|tweetUrlInvalid|messageInvalid|tregParamsInvalid|tregTrimInvalid|textMissing|takes a day|needs \d+ argument|give --|is one of|unexpected argument|takes no words|are needed|is needed/;

const ACCOUNT: Readonly<Record<string, string>> = { facebook: "galwayOne" };
const accountOf = (platform: string): string => ACCOUNT[platform] ?? `fake${platform[0].toUpperCase()}${platform.slice(1)}`;

const SAMPLES: Readonly<Record<string, string>> = {
  tweet: "https://x.com/fakeBird/status/1900000000000000001",
  url: "https://www.reddit.com/r/fakeSub/comments/abc123/a_post/",
  userId: "1234567",
  cursor: "2",
  message: "1234567890123456789",
  text: "sounds good to me",
  window: "60m",
  target: "t3_abc123",
  post: "1900000000000000001",
  where: "isReply=false",
  source: "twitterDmsBySender",
  homes: "US",
  home: "IE",
  reels: "8-20",
  watch: "4-25",
  posts: "8-15",
};

function alone(form: InputForm, base: Record<string, unknown>, name: string): Record<string, unknown> {
  const others = new Set((form.groups ?? []).filter((g) => g.rule === "atMostOne" && g.names.includes(name)).flatMap((g) => g.names.filter((n) => n !== name)));
  return Object.fromEntries(Object.entries(base).filter(([key]) => !others.has(key)));
}

function sampleString(spec: FlagSpec | PositionalSpec, platform: string): string {
  if (spec.name === "account") return accountOf(platform);
  if (SAMPLES[spec.name]) return SAMPLES[spec.name];
  const format = (spec as FlagSpec).format;
  if (format === "date") return "2026-11-01";
  if (format === "dateOrSpan") return "7d";
  if (format === "time") return "2026-11-01T09:00:00Z";
  if (format === "jsonObject") return "{}";
  return `sample${spec.name[0].toUpperCase()}${spec.name.slice(1)}`;
}

function sampleValue(spec: FlagSpec | PositionalSpec, platform: string): unknown {
  switch (spec.kind) {
    case "boolean":
    case "booleanValue":
      return true;
    case "integer":
    case "number":
      return spec.min ?? 1;
    case "enum":
      return spec.values![0];
    case "pairs":
      return { one: "1" };
    case "rest":
    case "list":
      return [sampleString(spec, platform)];
    default:
      return sampleString(spec, platform);
  }
}

function minimalInput(form: InputForm, platform: string): Record<string, unknown> {
  const all = [...form.positionals, ...form.flags];
  const out: Record<string, unknown> = {};
  for (const spec of all) if (spec.required) out[spec.name] = sampleValue(spec, platform);
  for (const group of form.groups ?? []) {
    if (group.rule === "atLeastOne" && !group.names.some((n) => n in out)) out[group.names[0]] = sampleValue(all.find((s) => s.name === group.names[0])!, platform);
  }
  for (const rule of form.counts ?? []) {
    const when = out[rule.when.name];
    if (typeof when === "string" && rule.when.values.includes(when)) out[rule.name] = Array.from({ length: rule.min }, () => "https://x.com/fakeBird");
  }
  return out;
}

function twentyFixture() {
  const twenty = marketplaceFixture();
  for (const platform of ["twitter", "discord", "slack", "instagram", "reddit", "linkedin"]) {
    twenty.rows.socialAccounts!.push({ id: accountOf(platform), accountName: accountOf(platform), platform: platform.toUpperCase(), cookies: {}, proxy: null, activeHoursStart: 0, activeHoursEnd: 24 });
  }
  return twenty;
}

function stubContext(err: string[]): Partial<CommandContext> {
  const refused = { answer: { ok: false, code: "stubEngine", detail: "stubbed" }, refreshed: null } as never;
  const fail = () => {
    throw Object.assign(new Error("stubbed"), { code: "stubEngine" });
  };
  return {
    twenty: twentyFixture() as never,
    out: () => {},
    err: (line) => err.push(line),
    now: () => new Date("2026-11-14T12:00:00Z"),
    sleep: async () => {},
    cancelled: () => true,
    worker: fail as never,
    session: fail as never,
    connectSession: fail as never,
    profileSession: fail as never,
    inspectSession: fail as never,
    sendInspect: async () => null,
    directRead: (() => ({ ok: false, code: "stubEngine" })) as never,
    directTwitter: () => refused,
    directTwitterLive: async () => refused,
    directReddit: () => refused,
    directDiscord: () => refused,
    directDiscordLive: async () => refused,
    directLinkedin: () => refused,
    directSlack: () => refused,
    directSlackLive: async () => refused,
    directInstagram: () => refused,
    directInstagramLive: async () => refused,
  };
}

const platformOf = (tool: CommandTool): string => (isPlatform(tool.command.platform) ? tool.command.platform : "twitter");

async function run(tool: CommandTool, input: Record<string, unknown>): Promise<{ built: boolean; code: number; err: string; message?: string }> {
  const built = argvOfInput(tool.form!, input);
  if (!built.ok) return { built: false, code: -1, err: "", message: built.message };
  const err: string[] = [];
  try {
    const code = await runCli(commandLine(tool.command, built.argv), stubContext(err));
    return { built: true, code, err: err.join("\n") };
  } catch (error) {
    return { built: true, code: -2, err: [...err, `threw: ${String(error)}`].join("\n") };
  }
}

const formTools = commandTools(COMMANDS).filter((t) => t.form && !t.live);
const driven = formTools.filter((t) => !(t.tool in SKIP));
const saved: Record<string, string | undefined> = {};
let fetchBefore: typeof fetch;
let cwdBefore: string;
let clientBefore: typeof tregDeps.client;

beforeAll(() => {
  const home = mkdtempSync(join(tmpdir(), "logRoundTrip"));
  for (const key of ["USERPROFILE", "HOME", "LOG_HOME", "LOG_PYTHON", "KB_TWENTY_URL", "MEMELORD_API_KEY"]) saved[key] = process.env[key];
  cwdBefore = process.cwd();
  process.chdir(home);
  process.env.USERPROFILE = home;
  process.env.HOME = home;
  process.env.LOG_HOME = join(home, ".logCli");
  process.env.LOG_PYTHON = join(home, "noPython.exe");
  delete process.env.KB_TWENTY_URL;
  delete process.env.MEMELORD_API_KEY;
  instrumentFetch();
  fetchBefore = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw Object.assign(new Error("the network is blocked in this test"), { code: "stubEngine" });
  }) as unknown as typeof fetch;
  clientBefore = tregDeps.client;
  const none = async () => ({ ok: false, code: 1, stdout: "", stderr: "stubbed" });
  tregDeps.client = () => ({ search: none, get: none, call: none });
});

afterAll(() => {
  process.chdir(cwdBefore);
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = fetchBefore;
  tregDeps.client = clientBefore;
});

describe("every form tool, driven through its command's own run", () => {
  test("the skip list is small and names forms that exist", () => {
    expect(Object.keys(SKIP).length).toBeLessThanOrEqual(5);
    for (const name of Object.keys(SKIP)) expect(formTools.some((t) => t.tool === name)).toBe(true);
  });

  test("a minimal schema-valid input is never refused for a parse or input reason", async () => {
    const refused: string[] = [];
    for (const tool of driven) {
      const result = await run(tool, minimalInput(tool.form!, platformOf(tool)));
      if (!result.built) refused.push(`${tool.tool}: the schema's own input did not build: ${result.message}`);
      else if (result.code !== 0 && INPUT_REFUSAL.test(result.err)) refused.push(`${tool.tool}: ${result.err.split("\n").find((l) => INPUT_REFUSAL.test(l))}`);
    }
    expect(refused).toEqual([]);
  }, 60_000);

  test("each optional field, given a schema-valid value on its own, is never refused for a parse or input reason", async () => {
    const refused: string[] = [];
    for (const tool of driven) {
      const base = minimalInput(tool.form!, platformOf(tool));
      for (const spec of [...tool.form!.positionals, ...tool.form!.flags].filter((s) => !(s.name in base) && !WRITES.has(s.name))) {
        const result = await run(tool, { ...alone(tool.form!, base, spec.name), [spec.name]: sampleValue(spec, platformOf(tool)) });
        if (!result.built) refused.push(`${tool.tool}.${spec.name}: the schema's own value did not build: ${result.message}`);
        else if (result.code !== 0 && INPUT_REFUSAL.test(result.err)) refused.push(`${tool.tool}.${spec.name}: ${result.err.split("\n").find((l) => INPUT_REFUSAL.test(l))}`);
      }
    }
    expect(refused).toEqual([]);
  }, 120_000);

  test("at each bound the schema and run agree: the minimum and maximum run, one past refuses on both paths", async () => {
    const disagree: string[] = [];
    for (const tool of driven) {
      const base = minimalInput(tool.form!, platformOf(tool));
      for (const flag of tool.form!.flags.filter((f) => f.min !== undefined || f.max !== undefined)) {
        if (`${tool.tool}.${flag.name}` in CONDITIONAL_BOUNDS) continue;
        for (const value of [flag.min, flag.max].filter((v): v is number => v !== undefined)) {
          const result = await run(tool, { ...base, [flag.name]: value });
          if (!result.built || (result.code !== 0 && INPUT_REFUSAL.test(result.err))) disagree.push(`${tool.tool}.${flag.name}=${value} is in range but was refused: ${result.message ?? result.err.split("\n")[0]}`);
        }
        const outside = [flag.min !== undefined ? flag.min - 1 : undefined, flag.max !== undefined ? flag.max + 1 : undefined].filter((v): v is number => v !== undefined);
        for (const value of outside) {
          const schema = argvOfInput(tool.form!, { ...base, [flag.name]: value });
          if (schema.ok) disagree.push(`${tool.tool}.${flag.name}=${value} is out of range but the schema took it`);
          const built = argvOfInput(tool.form!, base);
          if (!built.ok) continue;
          const err: string[] = [];
          const code = await runCli(commandLine(tool.command, [...built.argv, `--${flag.name}=${value}`]), stubContext(err)).catch(() => -2);
          if (code === 0 || !INPUT_REFUSAL.test(err.join("\n"))) disagree.push(`${tool.tool}.${flag.name}=${value} is out of range but run did not refuse it as input`);
        }
      }
    }
    expect(disagree).toEqual([]);
  }, 60_000);

  test("every live tool whose command refuses --live without approvedBy requires it in its schema", () => {
    const live = toolsFromCommands(COMMANDS).filter((t) => t.name.endsWith("Live"));
    const entries = commandTools(COMMANDS).filter((t) => t.live && t.form);
    const approving = entries.filter((t) => t.form!.flags.some((f) => f.approval));
    expect(approving.length).toBe(24);
    for (const entry of approving) {
      const schema = live.find((t) => t.name === entry.tool)!.inputSchema as { required: string[] };
      expect(schema.required).toContain("approvedBy");
      const input = minimalInput(entry.form!, platformOf(entry));
      expect(argvOfInput(entry.form!, input, { live: true })).toEqual({ ok: false, message: "approvedBy is needed on a live run (rule 8)" });
    }
    const treg = live.find((t) => t.name === "tregCallLive")!.inputSchema as { required: string[] };
    expect(treg.required).not.toContain("approvedBy");
  });
});
