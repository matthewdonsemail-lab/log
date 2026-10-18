import { afterEach, describe, expect, test } from "bun:test";
import { listAccounts } from "../../marketplace/account/index.ts";
import { listListings } from "../../marketplace/listing/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { launchDeps, parseLaunchArgs, runLaunch, shouldPrompt } from "./index.ts";

const real = { prompts: launchDeps.prompts, tty: launchDeps.tty, run: launchDeps.run };
afterEach(() => Object.assign(launchDeps, real));

function capture() {
  const out: string[] = [];
  const err: string[] = [];
  const context: CommandContext = {
    load: () => ({ listings: listListings(), accounts: listAccounts() }),
    worker: async () => ({ ok: false, error: "worker not stubbed" }),
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  return { context, out, err };
}

function stubPrompts(answers: unknown[]) {
  const calls: string[] = [];
  launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  launchDeps.prompts = {
    intro: () => void calls.push("intro"),
    outro: () => void calls.push("outro"),
    cancel: () => void calls.push("cancel"),
    select: async () => {
      calls.push("select");
      if (answers.length === 0) throw new Error("prompt-stub: unexpected select");
      return answers.shift();
    },
  };
  return calls;
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
    const calls = stubPrompts([]);
    const result = await runLaunch(capture().context, ["--json"]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout!).actions).toEqual(["browse", "status", "account", "accounts", "scan", "watch", "login", "doctor"]);
    expect(calls).toEqual([]);
  });

  test("no TTY exits 2 without prompting", async () => {
    const calls = stubPrompts([]);
    launchDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    expect((await runLaunch(capture().context, [])).code).toBe(2);
    expect(calls).toEqual([]);
  });

  test("browse delegates to `listing <listingId>`", async () => {
    const calls = stubPrompts(["browse", "1583545526797714"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, context, argv) => {
      delegated.push([command.name, ...argv]);
      return real.run(command, context, argv);
    };
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated).toEqual([["listing", "1583545526797714"]]);
    expect(out.join("\n")).toContain("Junk Clearance — Salthill");
    expect(calls).toEqual(["intro", "select", "select", "outro"]);
  });

  test("status delegates to `listings --status`", async () => {
    stubPrompts(["status", "sold"]);
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(out.join("\n")).toContain("Garden Waste Hauling");
  });

  test("scan delegates to `scan --account <id>`", async () => {
    stubPrompts(["scan", "fb-pacer"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "scanned" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(delegated).toEqual([["scan", "--account", "fb-pacer"]]);
  });

  test("cancel exits 1", async () => {
    const calls = stubPrompts([Symbol("clack:cancel")]);
    expect((await runLaunch(capture().context, [])).code).toBe(1);
    expect(calls).toContain("cancel");
  });
});
