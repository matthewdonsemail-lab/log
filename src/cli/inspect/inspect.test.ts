import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { InspectSessionConfig } from "../../camofox/inspect/index.ts";
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
    const { writeCurrentInspect, clearCurrentInspect, openInspects } = await import("../../camofox/inspect/index.ts");
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
