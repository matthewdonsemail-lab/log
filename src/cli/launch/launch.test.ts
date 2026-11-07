import { afterEach, describe, expect, test } from "bun:test";
import { listAccounts } from "../../marketplace/account/index.ts";
import { listListings } from "../../marketplace/listing/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { launchDeps, parseLaunchArgs, runLaunch, shouldPrompt } from "./index.ts";

const real = { prompts: launchDeps.prompts, tty: launchDeps.tty, run: launchDeps.run, twentyReady: launchDeps.twentyReady };
afterEach(() => Object.assign(launchDeps, real));

function capture() {
  const out: string[] = [];
  const err: string[] = [];
  const context: CommandContext = {
    load: () => ({ listings: listListings(), accounts: listAccounts() }),
    twenty: marketplaceFixture(),
    worker: async () => ({ ok: false, code: "crashed", detail: "worker not stubbed" }),
    session: () => {
      throw new Error("session not stubbed");
    },
    connectSession: () => {
      throw new Error("connectSession not stubbed");
    },
    profileSession: () => {
      throw new Error("profileSession not stubbed");
    },
    inspectSession: async () => {
      throw new Error("inspectSession not stubbed");
    },
    sendInspect: async () => null,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  return { context, out, err };
}

function stubPrompts(answers: unknown[]) {
  const calls: string[] = [];
  const offered: string[][] = [];
  launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  launchDeps.twentyReady = () => true;
  launchDeps.prompts = {
    intro: () => void calls.push("intro"),
    outro: () => void calls.push("outro"),
    cancel: () => void calls.push("cancel"),
    select: async (options) => {
      calls.push("select");
      offered.push(((options as { options?: { value: string }[] }).options ?? []).map((o) => o.value));
      if (answers.length === 0) throw new Error("prompt-stub: unexpected select");
      return answers.shift();
    },
    text: async () => {
      calls.push("text");
      if (answers.length === 0) throw new Error("prompt-stub: unexpected text");
      return answers.shift();
    },
  };
  return { calls, offered };
}

describe("parseLaunchArgs / shouldPrompt", () => {
  test("accepts empty and --json, rejects the rest", () => {
    expect(parseLaunchArgs([])).toEqual({ ok: true, json: false });
    expect(parseLaunchArgs(["--json"])).toEqual({ ok: true, json: true });
    expect(parseLaunchArgs(["--json=1"]).ok).toBe(false);
    expect(parseLaunchArgs(["listings"]).ok).toBe(false);
  });

  test("never prompts for --json or without both TTYs", () => {
    expect(shouldPrompt(true, { stdinTTY: true, stdoutTTY: true })).toBe(false);
    expect(shouldPrompt(false, { stdinTTY: true, stdoutTTY: false })).toBe(false);
    expect(shouldPrompt(false, { stdinTTY: true, stdoutTTY: true })).toBe(true);
  });
});

describe("runLaunch", () => {
  test("--json lists actions without prompting", async () => {
    const { calls } = stubPrompts([]);
    const result = await runLaunch(capture().context, ["--json"]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout!).start).toEqual(["add", "signIn", "check", "agent"]);
    expect(JSON.parse(result.stdout!).actions).toEqual(["browse", "status", "account", "accounts", "scan", "watch", "connect", "join", "answer", "fill", "reels", "doctor"]);
    expect(calls).toEqual([]);
  });

  test("no TTY exits 2 without prompting", async () => {
    const { calls } = stubPrompts([]);
    launchDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    expect((await runLaunch(capture().context, [])).code).toBe(2);
    expect(calls).toEqual([]);
  });

  test("browse delegates to `listing <id>`, with the listings from Twenty", async () => {
    const { calls } = stubPrompts(["marketplace", "browse", "readyOne"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, context, argv) => {
      delegated.push([command.name, ...argv]);
      return real.run(command, context, argv);
    };
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated).toEqual([["listing", "readyOne"]]);
    expect(out.join("\n")).toContain("Rubbish Removal Galway");
    expect(calls).toEqual(["intro", "select", "select", "select", "outro"]);
  });

  test("status offers the statuses in Twenty and delegates to `listings --status`", async () => {
    const { offered } = stubPrompts(["marketplace", "status", "SOLD"]);
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[2]).toEqual(expect.arrayContaining(["DRAFT", "READY", "ACTIVE", "SOLD"]));
    expect(out.join("\n")).toContain("soldOne");
  });

  test("scan offers only accounts that may run (rule 12) and delegates to `scan --account <name>`", async () => {
    const { offered } = stubPrompts(["marketplace", "scan", "galwayOne"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "scanned" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(delegated).toEqual([["scan", "--account", "galwayOne"]]);
    expect(offered[2]).toEqual(expect.arrayContaining(["galwayOne", "galwayTwo", "vietnam"]));
    for (const refused of ["noProxy", "noCountry", "banned", "unset", "twitterOne"]) expect(offered[2]).not.toContain(refused);
  });

  test("join offers only accounts that may run, asks for the group, and delegates a dry run to `join group`", async () => {
    const { calls, offered } = stubPrompts(["marketplace", "join", "galwayOne", "https://www.facebook.com/groups/4191018610937243/"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "read" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(offered[1]).toContain("join");
    expect(offered[2]).not.toContain("banned");
    expect(calls).toEqual(["intro", "select", "select", "select", "text", "outro"]);
    expect(delegated).toEqual([["join", "group", "--account", "galwayOne", "--group", "https://www.facebook.com/groups/4191018610937243/"]]);
    expect(delegated[0]).not.toContain("--live");
  });

  test("Warm up Facebook Reels: the stepper asks the session's shape, likes default no, and plans it", async () => {
    const { calls } = stubPrompts(["marketplace", "reels", "8-20", "4-25", "0.6", "0.3", "0.15", "no", "no"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "planned" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(calls.filter((c) => c === "select")).toHaveLength(9);
    expect(delegated).toEqual([["warmup", "facebook", "reel", "plan", "--reels", "8-20", "--watch", "4-25", "--skip", "0.6", "--comments", "0.3", "--profile", "0.15"]]);
  });

  test("cancel exits 1", async () => {
    const { calls } = stubPrompts([Symbol("clack:cancel")]);
    expect((await runLaunch(capture().context, [])).code).toBe(1);
    expect(calls).toContain("cancel");
  });
});

describe("runLaunch: start here, no Twenty", () => {
  function recordRuns(answer: (name: string) => { code: number; stdout?: string } = () => ({ code: 0, stdout: "ok" })) {
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return answer(command.name);
    };
    return delegated;
  }

  test("the start menu leads with adding an account and hides Facebook Marketplace without Twenty", async () => {
    const { offered } = stubPrompts(["agent"]);
    launchDeps.twentyReady = () => false;
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[0]).toEqual(["add", "signIn", "check", "agent"]);
    expect(out.join("\n")).toContain("claude mcp add log -- logMcp");
  });

  test("Twenty set up adds the Facebook Marketplace menu", async () => {
    const { offered } = stubPrompts(["agent"]);
    await runLaunch(capture().context, []);
    expect(offered[0]).toEqual(["add", "signIn", "check", "agent", "marketplace"]);
  });

  test("add an X account goes straight to the masked cookie prompt", async () => {
    const { calls, offered } = stubPrompts(["add", "twitter", "@someHandle"]);
    launchDeps.twentyReady = () => false;
    const delegated = recordRuns();
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[1]).toEqual(["twitter", "linkedin", "slack", "reddit", "discord", "instagram", "facebook"]);
    expect(delegated).toEqual([["cookies", "save", "--account", "someHandle"]]);
    expect(out.join("\n")).toContain("auth_token, ct0 and twid");
    expect(calls).toEqual(["intro", "select", "select", "text", "outro"]);
  });

  test("add a Reddit account saves it locally, then shows how to sign in in its browser", async () => {
    stubPrompts(["add", "reddit", "redditName", "k1abc"]);
    const delegated = recordRuns();
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated).toEqual([["localAccount", "add", "--platform", "reddit", "--account", "redditName", "--adsPower", "k1abc"]]);
    expect(out.join("\n")).toContain("log inspect start --account redditName");
    expect(out.join("\n")).not.toContain("--adsPower <profileId>");
  });

  test("add a Facebook account asks its proxy, home and city, and connecting can wait", async () => {
    stubPrompts(["add", "facebook", "fbName", "", "http://u:p@host:1", "us", "Bethlehem", "no"]);
    const delegated = recordRuns();
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated).toEqual([["localAccount", "add", "--platform", "facebook", "--account", "fbName", "--proxy", "http://u:p@host:1", "--home", "US", "--city", "Bethlehem"]]);
    expect(out.join("\n")).toContain("log facebook connect --account fbName");
  });

  test("a failed add stops before signing in", async () => {
    stubPrompts(["add", "discord", "dcName", ""]);
    const delegated = recordRuns(() => ({ code: 1 }));
    expect((await runLaunch(capture().context, [])).code).toBe(1);
    expect(delegated).toEqual([["localAccount", "add", "--platform", "discord", "--account", "dcName"]]);
  });

  test("check offers every account but Facebook and runs its platform's session check", async () => {
    const { offered } = stubPrompts(["check", "0"]);
    const delegated = recordRuns();
    const { context } = capture();
    const accounts = (await context.twenty.list("socialAccounts")) as unknown as { platform?: string }[];
    expect(accounts.some((a) => a.platform === "TWITTER")).toBe(true);
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[1]).toEqual(["0"]);
    expect(delegated).toEqual([["session", "check", "--account", "twitterOne"]]);
  });

  test("sign in a Facebook account offers to connect it", async () => {
    stubPrompts(["signIn", "0", "yes"]);
    const delegated = recordRuns();
    const { context } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated[0][0]).toBe("connect");
  });
});
