import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
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

  test("a browser Facebook sends to a checkpoint while it is open sets the account to DEACTIVATED in Twenty", async () => {
    const twenty = marketplaceFixture();
    const result = await run(["inspect", "start", "--account", "galwayOne"], {
      twenty,
      inspectSession: async (config: InspectSessionConfig) => {
        const navigations = [
          { url: "https://www.facebook.com/groups/123/members", at: "2026-10-24T06:42:06.000Z" },
          { url: "https://www.facebook.com/checkpoint/1501092823525282/?next=https%3A%2F%2Fwww.facebook.com%2F", at: "2026-10-24T06:51:09.000Z" },
        ];
        mkdirSync(dirname(config.captureDir), { recursive: true });
        writeFileSync(join(dirname(config.captureDir), "navigations.jsonl"), navigations.map((n) => JSON.stringify(n)).join("\n") + "\n");
        return 0;
      },
    });
    expect(result.code).toBe(0);
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")).toMatchObject({ accountStatus: "DEACTIVATED", statusReason: "checkpointed" });
    expect(result.err).toContain("galwayOne is checkpointed, so it is DEACTIVATED in Twenty and its listings are marked lost: Facebook sent the page to /checkpoint/1501092823525282/ (a checkpoint) at 2026-10-24T06:51:09.000Z");
  });

  test("a browser that never lands on a checkpoint leaves the account's status as it was", async () => {
    const twenty = marketplaceFixture();
    await run(["inspect", "start", "--account", "galwayOne"], {
      twenty,
      inspectSession: async (config: InspectSessionConfig) => {
        mkdirSync(dirname(config.captureDir), { recursive: true });
        writeFileSync(join(dirname(config.captureDir), "navigations.jsonl"), JSON.stringify({ url: "https://www.facebook.com/groups/123/members", at: "2026-10-24T06:42:06.000Z" }) + "\n");
        return 0;
      },
    });
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.accountStatus).toBe("ACTIVE");
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

  test("a refusal shows only this start's lines, never the previous session's (Bethlehem 2026-10-20)", async () => {
    const { inspectDetachDeps } = await import("./index.ts");
    const { appendFileSync, mkdirSync } = await import("node:fs");
    const { dirname } = await import("node:path");
    const real = { ...inspectDetachDeps };
    inspectDetachDeps.start = (_argv, logPath) => {
      appendFileSync(logPath, "log inspect: launchBudgetSpent: nothing opened\n");
      return { exited: () => 1 };
    };
    try {
      const logPath = join(homedir(), ".logCli", "runs", "inspect", "galwayOne.start.log");
      mkdirSync(dirname(logPath), { recursive: true });
      appendFileSync(logPath, "AdsPower profile k1 stopped\nInspect session for galwayOne ended (exit 0).\n");
      const err: string[] = [];
      const code = await runCli(["inspect", "start", "--account", "galwayOne", "--detach"], { twenty: marketplaceFixture(), out: () => {}, err: (l) => err.push(l) });
      expect(code).toBe(1);
      expect(err.join("\n")).toContain("launchBudgetSpent");
      expect(err.join("\n")).not.toContain("AdsPower profile k1 stopped");
    } finally {
      Object.assign(inspectDetachDeps, real);
    }
  });
});

describe("the session's Messenger PIN flag (rule 67)", () => {
  test("only whether login.json holds a 6-digit PIN leaves it, never the PIN", async () => {
    const { writeFileSync } = await import("node:fs");
    const { hasMessengerPin } = await import("./index.ts");
    const dir = mkdtempSync(join(tmpdir(), "logPinFlag"));
    const write = (body: unknown) => (writeFileSync(join(dir, "login.json"), JSON.stringify(body)), join(dir, "login.json"));
    expect(hasMessengerPin(null)).toBe(false);
    expect(hasMessengerPin(write({ email: "e", messengerPin: "482913" }))).toBe(true);
    expect(hasMessengerPin(write({ email: "e", messengerPin: null }))).toBe(false);
    expect(hasMessengerPin(write({ messengerPin: "12ab56" }))).toBe(false);
  });
});
