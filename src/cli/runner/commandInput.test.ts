import { describe, expect, test } from "bun:test";
import { commandTools, toolsFromCommands } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { argvOfInput, coerceInput, formToolName, inputSchemaOf, parseArgs, parserSpecOf } from "./helpers/index.ts";
import { COMMANDS } from "./index.ts";
import type { FlagSpec, InputForm, PositionalSpec } from "./types.ts";

const typed = COMMANDS.filter((c) => c.input);

const SHAPED: Readonly<Record<string, string>> = {
  tweet: "https://x.com/fakeBird/status/1900000000000000001",
  userId: "1234567",
  message: "1234567890123456789",
  window: "90m",
  target: "t3_abc123",
  post: "1900000000000000001",
  where: "isReply=false",
  homes: "US",
  home: "IE",
  name: "fakeFlow",
  reels: "8-20",
  watch: "4-25",
  posts: "8-15",
};

function sample(spec: FlagSpec | PositionalSpec): unknown {
  const flag = spec as FlagSpec;
  switch (spec.kind) {
    case "boolean":
    case "booleanValue":
      return true;
    case "integer":
    case "number":
      return flag.min ?? 7;
    case "enum":
      return spec.values![spec.values!.length - 1];
    case "pairs":
      return { "1": "two words = one value" };
    case "rest":
      return ["e12", "Bethlehem, Pennsylvania"];
    case "list":
      return [SHAPED[spec.name] ?? "first item", SHAPED[spec.name] ?? "second item"];
    default:
      if (SHAPED[spec.name]) return SHAPED[spec.name];
      if (flag.format === "date") return "2026-11-01";
      if (flag.format === "time") return "2026-11-01T09:00:00Z";
      if (flag.format === "dateOrSpan") return "7d";
      if (flag.format === "jsonObject") return '{"query":"two words"}';
      return `${spec.name} with "quotes" = and spaces`;
  }
}

function fullInput(form: InputForm): Record<string, unknown> {
  const left = new Set((form.groups ?? []).filter((g) => g.rule === "atMostOne").flatMap((g) => g.names.slice(1)));
  return Object.fromEntries([...form.positionals, ...form.flags].filter((s) => !left.has(s.name)).map((s) => [s.name, sample(s)]));
}

const form = (flags: FlagSpec[], extra: Partial<InputForm> = {}): InputForm => ({ words: [], summary: "test", positionals: [], flags, ...extra });

describe("one flag spec per command", () => {
  test("Duet's commands declare their input", () => {
    for (const name of ["accounts", "account", "check", "inspect", "listings", "listing", "publish", "conversations", "conversation", "host", "errors", "runs"]) {
      expect(COMMANDS.find((c) => c.name === name)?.input).toBeDefined();
    }
  });

  test("every form, filled in full, parses back through the command's own parser to the same words and typed values", () => {
    for (const command of typed) {
      for (const each of command.input!.forms) {
        const input = fullInput(each);
        const built = argvOfInput(each, input);
        if (!built.ok) throw new Error(`${formToolName(command, each)}: ${built.message}`);
        const parsed = parseArgs(built.argv, parserSpecOf(command.input!));
        if (!parsed.ok) throw new Error(`${formToolName(command, each)}: ${parsed.error}`);
        const positionals = each.positionals.flatMap((p) => (p.kind === "rest" ? (input[p.name] as string[]) : [input[p.name] as string]));
        expect(parsed.positionals).toEqual([...each.words, ...positionals]);
        for (const flag of each.flags) if (flag.name in input) expect(parsed.values[flag.name]).toEqual(input[flag.name] as never);
      }
    }
  });

  test("a form's schema lists every positional and flag, with the required ones", () => {
    for (const command of typed) {
      for (const each of command.input!.forms) {
        const { properties, required } = inputSchemaOf(each);
        expect(Object.keys(properties)).toEqual([...each.positionals, ...each.flags].map((s) => s.name));
        expect(required).toEqual([...each.positionals, ...each.flags].filter((s) => s.required).map((s) => s.name));
      }
    }
  });

  test("a form's tool name is the command and its words, and no two forms share one", () => {
    const names = typed.flatMap((c) => c.input!.forms.map((f) => formToolName(c, f)));
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(expect.arrayContaining(["inspectStart", "inspectDo", "facebookHostSend", "facebookConversationLead", "facebookAccountResetOpens", "runsSpace"]));
  });

  test("false booleans and unset fields add nothing", () => {
    const check = COMMANDS.find((c) => c.name === "check")!.input!.forms[0];
    expect(argvOfInput(check, { account: "a", bypass: false, json: false })).toEqual({ ok: true, argv: ["--account=a"], live: false, bypass: false });
  });

  test("a terminal-only form is parsed and documented but is never a tool", () => {
    const consoleCommand = COMMANDS.find((c) => c.name === "console")!;
    const web = consoleCommand.input!.forms.find((f) => f.terminalOnly)!;
    expect(web.flags.map((f) => f.name)).toEqual(["web", "port", "noOpen", "json"]);
    expect(commandTools(COMMANDS).some((t) => t.command === consoleCommand && t.form?.words.length === 0)).toBe(false);
    const parsed = parseArgs(["--web", "--port", "8080", "--noOpen"], parserSpecOf(consoleCommand.input!));
    expect(parsed.ok && parsed.values).toEqual({ web: true, port: 8080, noOpen: true });
  });
});

describe("typed flag kinds", () => {
  const limit: FlagSpec = { name: "limit", kind: "integer", min: 1, max: 200, description: "How many" };
  const files: FlagSpec = { name: "file", kind: "list", description: "Files" };
  const archived: FlagSpec = { name: "archived", kind: "booleanValue", description: "Closed ones" };
  const since: FlagSpec = { name: "since", kind: "string", format: "date", description: "From" };
  const seconds: FlagSpec = { name: "seconds", kind: "number", min: 5, refusal: "secondsInvalid", description: "For" };
  const spec = parserSpecOf({ forms: [form([limit, files, archived, since, seconds])] });

  test("the CLI parses each kind once into its typed value, and keeps the raw text in flags", () => {
    const parsed = parseArgs(["--limit", "20", "--file", "a.png,b.png", "--file=c.png", "--archived", "false", "--since=2026-11-01", "--seconds", "7.5"], spec);
    expect(parsed).toEqual({ ok: true, positionals: [], flags: { limit: "20", file: "a.png,b.png,c.png", archived: "false", since: "2026-11-01", seconds: "7.5" }, values: { limit: 20, file: ["a.png", "b.png", "c.png"], archived: false, since: "2026-11-01", seconds: 7.5 } });
  });

  test("a bad value is one coded refusal that names the flag, what it got and what it takes", () => {
    expect(parseArgs(["--limit", "ten"], spec)).toEqual({ ok: false, error: 'inputInvalid: --limit got "ten"; it takes a whole number from 1 to 200' });
    expect(parseArgs(["--limit", "201"], spec)).toEqual({ ok: false, error: 'inputInvalid: --limit got "201"; it takes a whole number from 1 to 200' });
    expect(parseArgs(["--archived", "yes"], spec)).toEqual({ ok: false, error: 'inputInvalid: --archived got "yes"; it takes true or false' });
    expect(parseArgs(["--since", "last week"], spec)).toEqual({ ok: false, error: 'inputInvalid: --since got "last week"; it takes a day, YYYY-MM-DD' });
    expect(parseArgs(["--seconds", "2"], spec)).toEqual({ ok: false, error: 'secondsInvalid: --seconds got "2"; it takes a number of at least 5' });
  });

  test("a repeated scalar flag is refused instead of the last one winning; a list flag may repeat", () => {
    expect(parseArgs(["--limit", "5", "--limit", "6"], spec)).toEqual({ ok: false, error: "inputInvalid: --limit was given more than once; it takes one value" });
    expect(parseArgs(["--valued", "a", "--valued", "b"], { valued: ["valued"] })).toEqual({ ok: false, error: "inputInvalid: --valued was given more than once; it takes one value" });
    expect(parseArgs(["--file", "a", "--file", "b"], spec).ok).toBe(true);
  });

  test("pairs and global flags are in the parser spec", () => {
    const pairs: FlagSpec = { name: "set", kind: "pairs", description: "Answers" };
    const proxyMs: FlagSpec = { name: "proxyMs", kind: "integer", min: 500, max: 60_000, global: true, description: "Speed" };
    const both = parserSpecOf({ forms: [form([pairs, proxyMs])] });
    expect(both.valued).toEqual(["set", "proxyMs"]);
    expect(parseArgs(["--set", "1=yes please", "--set", "2=no", "--proxyMs", "4000"], both)).toMatchObject({ ok: true, values: { set: { "1": "yes please", "2": "no" }, proxyMs: 4000 } });
    expect(parseArgs(["--set", "nokey"], both)).toEqual({ ok: false, error: 'inputInvalid: --set got "nokey"; it takes key=value' });
  });

  test("the schema states the kind, range, list, pattern and format", () => {
    const tweet: FlagSpec = { name: "tweet", kind: "string", pattern: "^https://x\\.com/", takes: "an x.com url", description: "The post" };
    const { properties } = inputSchemaOf(form([limit, files, archived, since, tweet]));
    expect(properties).toEqual({
      limit: { type: "integer", minimum: 1, maximum: 200, description: "How many" },
      file: { type: "array", items: { type: "string" }, minItems: 1, description: "Files" },
      archived: { type: "boolean", description: "Closed ones" },
      since: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", format: "date", description: "From" },
      tweet: { type: "string", pattern: "^https://x\\.com/", description: "The post" },
    });
  });

  test("argvOfInput turns numbers, lists and true-or-false values back into argv the parser reads the same", () => {
    const one = form([limit, files, archived]);
    const built = argvOfInput(one, { limit: 30, file: ["a b.png", "c.png"], archived: false });
    expect(built).toEqual({ ok: true, argv: ["--limit=30", "--file=a b.png", "--file=c.png", "--archived=false"], live: false, bypass: false });
    expect(argvOfInput(one, { limit: 0 })).toEqual({ ok: false, message: "limit must be a whole number from 1 to 200" });
  });

  test("for one release a numeric string, a comma string and a true-or-false string are coerced at the MCP boundary", () => {
    const one = form([limit, files, archived]);
    expect(coerceInput(one, { limit: "20", file: "a.png, b.png", archived: "true" })).toEqual({ limit: 20, file: ["a.png", "b.png"], archived: true });
    expect(argvOfInput(one, { limit: "20" })).toEqual({ ok: true, argv: ["--limit=20"], live: false, bypass: false });
    expect(argvOfInput(one, { limit: "twenty" }).ok).toBe(false);
  });
});

describe("groups, value counts and approval", () => {
  const text: FlagSpec = { name: "text", kind: "string", description: "The message." };
  const photo: FlagSpec = { name: "photo", kind: "string", description: "A picture." };
  const either = form([text, photo], { groups: [{ rule: "atLeastOne", names: ["text", "photo"] }] });

  test("an at-least-one group is a sentence on each member, never a top-level combinator, and is enforced on both paths", () => {
    const { properties } = inputSchemaOf(either);
    expect((properties.text as { description: string }).description).toBe("The message. Give at least one of text, photo.");
    expect(argvOfInput(either, {})).toEqual({ ok: false, message: "inputInvalid: --text or --photo is needed" });
    expect(parseArgs([], parserSpecOf({ forms: [either] }))).toEqual({ ok: false, error: "inputInvalid: --text or --photo is needed" });
    expect(parseArgs(["--photo", "a.png"], parserSpecOf({ forms: [either] })).ok).toBe(true);
    const tool = toolsFromCommands(COMMANDS).find((t) => t.name === "instagramSend")!;
    expect(Object.keys(tool.inputSchema)).toEqual(["type", "properties", "required", "additionalProperties"]);
  });

  test("an at-most-one group refuses both", () => {
    const one = form([text, photo], { groups: [{ rule: "atMostOne", names: ["text", "photo"], refusal: "listInvalid" }] });
    expect(parseArgs(["--text", "a", "--photo", "b"], parserSpecOf({ forms: [one] }))).toEqual({ ok: false, error: "listInvalid: --text and --photo exclude each other" });
  });

  test("inspect do needs as many values as its action takes", () => {
    const inspect = COMMANDS.find((c) => c.name === "inspect")!;
    const doForm = inspect.input!.forms.find((f) => f.words[0] === "do")!;
    expect(argvOfInput(doForm, { action: "goto" })).toEqual({ ok: false, message: "inputInvalid: action goto needs at least 1 entry in values, got 0" });
    expect(argvOfInput(doForm, { action: "type", values: ["e12"] }).ok).toBe(false);
    expect(argvOfInput(doForm, { action: "type", values: ["e12", "hello"] }).ok).toBe(true);
    expect(argvOfInput(doForm, { action: "snapshot" }).ok).toBe(true);
    expect(parseArgs(["do", "goto"], parserSpecOf(inspect.input!))).toEqual({ ok: false, error: "inputInvalid: action goto needs at least 1 entry in values, got 0" });
  });

  test("approvedBy is required in a live schema whose command refuses --live without it, and only there", () => {
    const tools = toolsFromCommands(COMMANDS);
    const required = (name: string) => (tools.find((t) => t.name === name)!.inputSchema as { required?: string[] }).required ?? [];
    expect(required("discordSendLive")).toContain("approvedBy");
    expect(required("discordSend")).not.toContain("approvedBy");
    expect(required("twitterLikeLive")).toContain("approvedBy");
    expect(required("tregCallLive")).not.toContain("approvedBy");
  });
});
