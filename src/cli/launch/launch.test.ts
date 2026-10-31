import { afterEach, describe, expect, test } from "bun:test";
import { listAccounts } from "../../marketplace/account/index.ts";
import { listListings } from "../../marketplace/listing/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { launchDeps, parseLaunchArgs, runLaunch, shouldPrompt } from "./index.ts";

const real = { prompts: launchDeps.prompts, tty: launchDeps.tty, run: launchDeps.run };
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
    const { calls } = stubPrompts(["browse", "readyOne"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, context, argv) => {
      delegated.push([command.name, ...argv]);
      return real.run(command, context, argv);
    };
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated).toEqual([["listing", "readyOne"]]);
    expect(out.join("\n")).toContain("Rubbish Removal Galway");
    expect(calls).toEqual(["intro", "select", "select", "outro"]);
  });

  test("status offers the statuses in Twenty and delegates to `listings --status`", async () => {
    const { offered } = stubPrompts(["status", "SOLD"]);
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[1]).toEqual(expect.arrayContaining(["DRAFT", "READY", "ACTIVE", "SOLD"]));
    expect(out.join("\n")).toContain("soldOne");
  });

  test("scan offers only accounts that may run (rule 12) and delegates to `scan --account <name>`", async () => {
    const { offered } = stubPrompts(["scan", "galwayOne"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "scanned" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(delegated).toEqual([["scan", "--account", "galwayOne"]]);
    expect(offered[1]).toEqual(expect.arrayContaining(["galwayOne", "galwayTwo", "vietnam"]));
    for (const refused of ["noProxy", "noCountry", "banned", "unset", "twitterOne"]) expect(offered[1]).not.toContain(refused);
  });

  test("join offers only accounts that may run, asks for the group, and delegates a dry run to `join group`", async () => {
    const { calls, offered } = stubPrompts(["join", "galwayOne", "https://www.facebook.com/groups/4191018610937243/"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "read" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(offered[0]).toContain("join");
    expect(offered[1]).not.toContain("banned");
    expect(calls).toEqual(["intro", "select", "select", "text", "outro"]);
    expect(delegated).toEqual([["join", "group", "--account", "galwayOne", "--group", "https://www.facebook.com/groups/4191018610937243/"]]);
    expect(delegated[0]).not.toContain("--live");
  });

  test("Warm up Facebook Reels: the stepper asks the session's shape, likes default no, and plans it", async () => {
    const { calls } = stubPrompts(["reels", "8-20", "4-25", "0.6", "0.3", "0.15", "no", "no"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "planned" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(calls.filter((c) => c === "select")).toHaveLength(8);
    expect(delegated).toEqual([["warmup", "facebook", "reel", "plan", "--reels", "8-20", "--watch", "4-25", "--skip", "0.6", "--comments", "0.3", "--profile", "0.15"]]);
  });

  test("cancel exits 1", async () => {
    const { calls } = stubPrompts([Symbol("clack:cancel")]);
    expect((await runLaunch(capture().context, [])).code).toBe(1);
    expect(calls).toContain("cancel");
  });
});
