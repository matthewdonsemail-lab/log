import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { listUseCases } from "../../mcp/server/helpers/guides.ts";
import {
  actingTools,
  argsTools,
  boilerplateShare,
  citationsOf,
  compareScorecard,
  deadCitations,
  flowToolsWithoutPlatform,
  hasMachine,
  hookHosts,
  measure,
  platformFallbacks,
  platformOfTopic,
  renderScorecard,
  sharedNamingPlatform,
  sharedToolsUnderPlatformGuide,
  sharedUnderPlatformGuide,
  toolsInNoUseCase,
  toolsPerPlatform,
  ungatedActingTools,
  useCaseCounts,
  useCasesWithoutAsks,
  useCasesWithoutSteps,
  writeBaseline,
} from "./index.ts";
import type { Metric, ScoredCommand, ScoredCommandTool, ScorecardInput } from "./index.ts";

const temp = mkdtempSync(join(tmpdir(), "scorecard-"));
afterAll(() => rmSync(temp, { recursive: true, force: true }));

const put = (path: string, text: string) => {
  mkdirSync(join(temp, path, ".."), { recursive: true });
  writeFileSync(join(temp, path), text);
};

const fakeInspect: ScoredCommand = { name: "inspect", platform: "any", summary: "Open the account's browser and inspect a page on Facebook", usage: "Usage: log inspect start --account <a>" };
const fakeGovernor: ScoredCommand = { name: "governor", platform: "any", summary: "Every account's governor on X, Discord, Slack, Instagram, Reddit, LinkedIn or Facebook", usage: "Usage: log governor show" };
const fakeWarmup: ScoredCommand = { name: "warmup", platform: "byArgument", summary: "Warm an account up", usage: "Usage: log <platform> warmup --account <a>" };
const fakeSend: ScoredCommand = { name: "send", platform: "discord", summary: "Send in a Discord chat", usage: "Usage: log discord send" };
const fakeDm: ScoredCommand = { name: "dm", platform: "twitter", summary: "Send a DM on X", usage: "Usage: log twitter dm" };
const commands = [fakeInspect, fakeGovernor, fakeWarmup, fakeSend, fakeDm];
const tools: ScoredCommandTool[] = [
  { tool: "inspectDo", command: fakeInspect, live: false, effect: "browser" },
  { tool: "inspectDoLive", command: fakeInspect, live: true, effect: "browser" },
  { tool: "governorShow", command: fakeGovernor, live: false, effect: "read" },
  { tool: "warmup", command: fakeWarmup, live: false, effect: "browser" },
  { tool: "warmupLive", command: fakeWarmup, live: true, effect: "browser" },
  { tool: "discordSend", command: fakeSend, live: false, effect: "write" },
  { tool: "discordSendLive", command: fakeSend, live: true, effect: "write" },
  { tool: "twitterDm", command: fakeDm, live: false, effect: "write" },
  { tool: "twitterDmLive", command: fakeDm, live: true, effect: "write" },
  { tool: "twitterLookupLive", command: fakeDm, live: true, effect: "spend" },
];
const fakeGuides: Record<string, string> = { inspect: "facebookBrowser", governor: "governor", warmup: "flows", send: "discord", dm: "xSending" };
const guideOf = (c: ScoredCommand) => fakeGuides[c.name] ?? null;
const flowTools = ["flowPostComment", "flowPostCommentLive", "flowFacebookLanguageEnglish", "flowFacebookLanguageEnglishLive"];

describe("guides and names", () => {
  test("a topic is named for a platform by its id or label, as a whole first word", () => {
    expect(platformOfTopic("facebookBrowser")).toBe("facebook");
    expect(platformOfTopic("xSending")).toBe("twitter");
    expect(platformOfTopic("discord")).toBe("discord");
    expect(platformOfTopic("accountBrowser")).toBeNull();
    expect(platformOfTopic("extensions")).toBeNull();
  });

  test("shared commands and their tools under a platform-named guide are counted, platform commands are not", () => {
    expect(sharedUnderPlatformGuide(commands, guideOf)).toEqual(["inspect (facebookBrowser)"]);
    expect(sharedToolsUnderPlatformGuide(tools, guideOf)).toEqual(["inspectDo (facebookBrowser)", "inspectDoLive (facebookBrowser)"]);
  });

  test("a shared command whose text or tool note names exactly one platform is counted", () => {
    expect(sharedNamingPlatform(commands, tools, {})).toEqual(["inspect (facebook)"]);
    expect(sharedNamingPlatform(commands, tools, { warmupLive: ["Runs in Facebook's feed"] })).toEqual(["inspect (facebook)", "warmup (facebook)"]);
  });

  test("tools are counted per platform, shared and flow apart, and flow tools need a platform in the name", () => {
    expect(toolsPerPlatform(tools, flowTools)).toMatchObject({ shared: 5, flow: 4, discord: 2, twitter: 3, facebook: 0 });
    expect(flowToolsWithoutPlatform(flowTools)).toEqual(["flowPostComment", "flowPostCommentLive"]);
  });
});

describe("use cases", () => {
  put("useCases/discord/fakeGuildReply.md", "# Reply in fakeGuild\n\nHow the owner asks for it: \"reply in fakeGuild\"\n\n| # | Step | Tool | Done when |\n|---|---|---|---|\n| 1 | Read | `discordRead` | read |\n| 2 | Send | `discordSendLive` | sent |\n");
  put("useCases/facebook/fakeGroups.md", "# Groups\n\n| Step | Command | MCP tool | What decides it |\n| --- | --- | --- | --- |\n| Join | `log facebook join` | `facebookJoin` | the join state |\n");
  put("useCases/twitter/fakeBird.md", "# Reply to fakeBird\n\n| 1 | Read | `twitterDms` | read |\n");
  put("useCases/twitter/README.md", "# Not a use case\n");
  const useCases = listUseCases(["discordRead", "discordSendLive", "facebookJoin", "twitterDms", "twitterDmLive"], `${join(temp, "useCases")}${sep}`);

  test("use cases are counted per folder, without the README", () => {
    expect(useCaseCounts(useCases)).toEqual({ discord: 1, facebook: 1, twitter: 1 });
  });

  test("a missing asks line and a step table stepsOf can't read are both found", () => {
    expect(useCasesWithoutAsks(useCases)).toEqual(["facebook/fakeGroups", "twitter/fakeBird"]);
    expect(useCasesWithoutSteps(useCases)).toEqual(["facebook/fakeGroups"]);
  });

  test("a tool no use case names is counted", () => {
    expect(toolsInNoUseCase(["discordRead", "discordSendLive", "twitterDmLive"], useCases)).toEqual(["twitterDmLive"]);
  });
});

describe("tools", () => {
  test("a raw args list is found in the input schema", () => {
    expect(argsTools([{ name: "flow", description: "", inputSchema: { properties: { args: {} } } }, { name: "discordSend", description: "", inputSchema: { properties: { account: {} } } }])).toEqual(["flow"]);
  });

  test("acting tools are live tools that do not only spend, plus live flows, and PLAY_REQUIRED covers some", () => {
    const acting = actingTools(tools, flowTools);
    expect(acting).toEqual(["inspectDoLive", "warmupLive", "discordSendLive", "twitterDmLive", "flowPostCommentLive", "flowFacebookLanguageEnglishLive"]);
    expect(ungatedActingTools(acting, new Set(["twitterDmLive", "discordSendLive"]))).toEqual(["inspectDoLive", "warmupLive", "flowPostCommentLive", "flowFacebookLanguageEnglishLive"]);
  });

  test("hook hosts come from the HookHost union", () => {
    expect(hookHosts('export type HookEvent = "Stop";\n\nexport type HookHost = "claudeCode" | "codex";\n')).toEqual(["claudeCode", "codex"]);
  });

  test("the boilerplate share is the guide and rules lines over all description text", () => {
    const lines = ["Send one.", "Before first using this tool, load its guide.", "AGENTS.md (log://agents): rules 8, 30."];
    const description = lines.join("\n");
    expect(boilerplateShare([{ name: "a", description }])).toBe(Math.round(((lines[1].length + lines[2].length) / description.length) * 1000) / 10);
  });
});

describe("rule citations", () => {
  test("single rules, lists, and ranges are read", () => {
    expect(citationsOf("rule 30, then rules 8, 10 and 94, and Rules 26-28.")).toEqual([30, 8, 10, 94, 26, 27, 28]);
    expect(citationsOf("Rule one is not a number")).toEqual([]);
  });

  test("a citation to a rule AGENTS.md no longer has is dead", () => {
    const found = deadCitations([{ path: "a.md", text: "rules 8, 10" }, { path: "b.md", text: "rule 10 and rule 12" }], new Set([8]));
    expect(found).toEqual({ citations: 4, dead: 3, worst: [{ path: "b.md", dead: 2 }, { path: "a.md", dead: 1 }] });
  });
});

describe("fallbacks and machines", () => {
  test("a hard-coded Facebook default is found by file and line", () => {
    const q = "??";
    const files = [
      { path: "src/a.ts", text: `const p = x ${q} 'facebook'\nconst y = 1` },
      { path: "src/b.ts", text: `ok\nconst p = x ${q} "FACEBOOK"\nconst first = PLATFORMS${"[0]"}` },
      { path: "src/c.ts", text: `const p = x ${q} "twitter"` },
    ];
    expect(platformFallbacks(files)).toEqual(["src/a.ts:1", "src/b.ts:2", "src/b.ts:3"]);
  });

  test("a command has a machine when its declaring file imports a folder with a machine", () => {
    put("repo/src/fake/run/machine.ts", "export const m = setup({}).createMachine({});\n");
    put("repo/src/fake/run/index.ts", "export * from './machine'\n");
    put("repo/src/fake/plain/index.ts", "export const x = 1\n");
    put("repo/src/cli/fake/index.ts", 'export { sendCommand } from "./helpers/send.ts";\nimport { x } from "../../fake/plain/index.ts";\nexport const readCommand = { x };\n');
    put("repo/src/cli/fake/helpers/send.ts", 'import { m } from "../../../fake/run/index.ts";\nexport const sendCommand = { m };\n');
    const root = join(temp, "repo");
    expect(hasMachine(root, "src/cli/fake/index.ts", "sendCommand")).toBe(true);
    expect(hasMachine(root, "src/cli/fake/index.ts", "readCommand")).toBe(false);
  });
});

const input = (overrides: Partial<ScorecardInput> = {}): ScorecardInput => ({
  commands,
  commandTools: tools,
  flowTools,
  listedTools: [{ name: "discordSend", description: "Send.\nBefore first using this tool, load it.\nAGENTS.md (log://agents): rules 8, 99." }],
  guideOf,
  notes: {},
  playRequired: new Set(["twitterDmLive"]),
  useCases: [],
  guides: { xSending: "x".repeat(60_000), discord: "d".repeat(10) },
  serverInstructions: "Load the guide.",
  hookTypes: 'export type HookHost = "claudeCode" | "codex";',
  ruleIds: new Set([8]),
  useCaseFiles: [],
  skillFiles: [{ path: "skills/fake/SKILL.md", text: "rule 8 and rule 7" }],
  codeFiles: [],
  hasMachine: (c) => c.name === "dm",
  ...overrides,
});

describe("measure", () => {
  test("every number is computed from the input alone", () => {
    const byKey = Object.fromEntries(measure(input()).map((m) => [m.key, m.value]));
    expect(byKey).toMatchObject({
      sharedCommandsUnderPlatformGuide: 1,
      "toolsPerPlatform.shared": 5,
      liveCommands: 4,
      liveCommandsWithoutMachine: 3,
      hookHosts: 2,
      guidesOverLimit: 1,
      "guideChars.xSending": 60_000,
      "deadRuleCitations.skills": 1,
      "deadRuleCitations.toolDescriptions": 1,
      serverInstructionsChars: 15,
    });
  });
});

const m = (key: string, value: number, better: Metric["better"] = "lower"): Metric => ({ key, label: key, value, better });

describe("compare with the baseline", () => {
  test("a number worse than its baseline fails and is named", () => {
    const result = compareScorecard([m("argsTools", 26), m("hookHosts", 1, "higher")], { argsTools: 25, hookHosts: 2 });
    expect(result.ok).toBe(false);
    expect(result.worse.map((r) => r.key)).toEqual(["argsTools", "hookHosts"]);
    expect(renderScorecard(result, "rule")).toContain("WORSE: argsTools (argsTools) is 26, the baseline is 25.");
  });

  test("a better number passes and says to move the baseline", () => {
    const result = compareScorecard([m("argsTools", 20), m("hookHosts", 3, "higher"), m("toolsListed", 300, "info")], { argsTools: 25, hookHosts: 2, toolsListed: 250 });
    expect(result.ok).toBe(true);
    expect(result.toLower.map((r) => r.key)).toEqual(["argsTools", "hookHosts"]);
    expect(result.rows.find((r) => r.key === "toolsListed")?.verdict).toBe("changed");
    expect(renderScorecard(result, "rule")).toContain("Move the baseline to them in this change");
  });

  test("a number missing from the baseline fails until it is written; one no longer measured passes", () => {
    const result = compareScorecard([m("argsTools", 25), m("guideChars.accountBrowser", 900)], { argsTools: 25, "guideChars.facebookBrowser": 68_000 });
    expect(result.ok).toBe(false);
    expect(result.missing.map((r) => r.key)).toEqual(["guideChars.accountBrowser"]);
    expect(result.gone.map((r) => r.key)).toEqual(["guideChars.facebookBrowser"]);
  });

  test("--write refuses to raise a number unless --allowWorse", () => {
    const refused = writeBaseline([m("argsTools", 26), m("hookHosts", 2, "higher")], { argsTools: 25, hookHosts: 2 }, false);
    expect(refused).toEqual({ ok: false, refused: [expect.objectContaining({ key: "argsTools", value: 26, baseline: 25 })] });
    const raised = writeBaseline([m("argsTools", 26), m("hookHosts", 2, "higher")], { argsTools: 25, hookHosts: 2 }, true);
    expect(raised).toMatchObject({ ok: true, metrics: { argsTools: 26, hookHosts: 2 } });
  });

  test("--write lowers, adds new numbers and drops gone ones without --allowWorse", () => {
    const written = writeBaseline([m("argsTools", 20), m("guideChars.accountBrowser", 900)], { argsTools: 25, "guideChars.facebookBrowser": 68_000 }, false);
    expect(written).toEqual({ ok: true, metrics: { argsTools: 20, "guideChars.accountBrowser": 900 }, raised: [] });
  });
});
