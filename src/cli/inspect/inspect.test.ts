import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { InspectSessionConfig } from "../../browser/inspect/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

process.env.LOG_INSPECT_CURRENT = join(mkdtempSync(join(tmpdir(), "logInspectCurrent")), "current.json");

async function run(argv: string[], overrides: Record<string, unknown> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty: marketplaceFixture(), out: (l) => out.push(l), err: (l) => err.push(l), ...overrides });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log inspect", () => {
  test("start opens one gated session for the account and ends when it does", async () => {
    const configs: InspectSessionConfig[] = [];
    const result = await run(["inspect", "start", "--account", "galwayOne", "--url", "https://www.facebook.com/me"], {
      inspectSession: async (config: InspectSessionConfig) => {
        configs.push(config);
        return 0;
      },
    });
    expect(result.code).toBe(0);
    expect(configs[0].startUrl).toBe("https://www.facebook.com/me");
    expect(configs[0].captureDir.replaceAll("\\", "/")).toMatch(/\/inspect\/\d{8}T\d{6}_galwayOne\/camoufox$/);
    expect(configs[0].commandsPath.endsWith("commands.jsonl")).toBe(true);
    expect(result.out).toContain("ended (exit 0)");
  });

  test("start goes through the same gates: an account with no proxy opens nothing", async () => {
    let started = false;
    const result = await run(["inspect", "start", "--account", "noProxy"], { inspectSession: async () => ((started = true), 0) });
    expect(result.code).toBe(1);
    expect(started).toBe(false);
  });

  test("click without --live is refused before anything is sent (rule 8)", async () => {
    let sent = false;
    const result = await run(["inspect", "do", "click", "e5"], { sendInspect: async () => ((sent = true), null) });
    expect(result.code).toBe(1);
    expect(result.err).toContain("--live");
    expect(sent).toBe(false);
  });

  test("do with no open session says to start one", async () => {
    const result = await run(["inspect", "do", "snapshot"]);
    expect(result.code).toBe(1);
    expect(result.err).toContain("no session is open");
  });

  test("two accounts' sessions are open at once; do picks one by --account and refuses to guess", async () => {
    const { writeCurrentInspect, clearCurrentInspect, openInspects } = await import("../../browser/inspect/index.ts");
    const base = { commandsPath: "c", repliesPath: "r", startedAt: "2026-10-19T00:00:00.000Z" };
    writeCurrentInspect({ ...base, account: "galwayOne", runDir: "/runs/one" });
    writeCurrentInspect({ ...base, account: "galwayTwo", runDir: "/runs/two" });
    try {
      expect(openInspects().map((s) => s.account).sort()).toEqual(["galwayOne", "galwayTwo"]);
      const sent: string[] = [];
      const sendInspect = async (current: { runDir: string }) => (sent.push(current.runDir), { ok: true, step: "01_snapshot" });
      const guess = await run(["inspect", "do", "snapshot"], { sendInspect });
      expect(guess.code).toBe(1);
      expect(guess.err).toContain("2 sessions are open (galwayOne, galwayTwo): add --account <name>");
      expect((await run(["inspect", "do", "snapshot", "--account", "galwayTwo"], { sendInspect })).code).toBe(0);
      expect(sent).toEqual(["/runs/two"]);
      const again = await run(["inspect", "start", "--account", "galwayOne"], { inspectSession: async () => 0 });
      expect(again.err).toContain("a session is already open for galwayOne");
      expect((await run(["inspect", "sessions"])).out).toContain("galwayTwo");
    } finally {
      clearCurrentInspect(undefined, "galwayOne");
      clearCurrentInspect(undefined, "galwayTwo");
    }
    expect(openInspects()).toEqual([]);
  });
});

describe("log inspect start --detach (how an MCP agent opens the account's browser)", () => {
  test("starts the session as its own process and returns once its browser is ready", async () => {
    const { inspectDetachDeps } = await import("./index.ts");
    const { writeCurrentInspect, clearCurrentInspect } = await import("../../browser/inspect/index.ts");
    const { writeFileSync } = await import("node:fs");
    const real = { ...inspectDetachDeps };
    const started: string[][] = [];
    const runDir = mkdtempSync(join(tmpdir(), "logDetachRun"));
    inspectDetachDeps.start = (argv) => {
      started.push(argv);
      // What the real session writes once its gate and self-check passed.
      writeCurrentInspect({ account: "galwayOne", runDir, commandsPath: join(runDir, "commands.jsonl"), repliesPath: join(runDir, "replies.jsonl"), startedAt: "2026-10-20T00:00:00.000Z" });
      writeFileSync(join(runDir, "replies.jsonl"), '{"id": "ready", "result": {"ok": true}}\n');
      return { exited: () => null };
    };
    try {
      const out: string[] = [];
      const code = await runCli(["inspect", "start", "--account", "galwayOne", "--detach"], { twenty: marketplaceFixture(), out: (l) => out.push(l), err: () => {} });
      expect(code).toBe(0);
      expect(started).toEqual([["inspect", "start", "--account", "galwayOne"]]);
      expect(out.join("\n")).toContain("is open, as its own process");
    } finally {
      Object.assign(inspectDetachDeps, real);
      clearCurrentInspect(undefined, "galwayOne");
    }
  });

  test("a session that ends before it is ready returns its log's reason", async () => {
    const { inspectDetachDeps } = await import("./index.ts");
    const real = { ...inspectDetachDeps };
    inspectDetachDeps.start = () => ({ exited: () => 1 });
    try {
      const err: string[] = [];
      const code = await runCli(["inspect", "start", "--account", "galwayOne", "--detach"], { twenty: marketplaceFixture(), out: () => {}, err: (l) => err.push(l) });
      expect(code).toBe(1);
      expect(err.join("\n")).toContain("ended before its browser was ready");
    } finally {
      Object.assign(inspectDetachDeps, real);
    }
  });
});
