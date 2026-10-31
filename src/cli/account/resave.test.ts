import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

async function run(argv: string[], twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), twenty };
}

function keptRun(accountName: string) {
  const dir = join(mkdtempSync(join(tmpdir(), "logUnsaved")), `20261019T160116_${accountName}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "device.json"), JSON.stringify({ accountName, profile: null }));
  writeFileSync(join(dir, "state.json"), JSON.stringify({ cookies: [{ name: "c_user", value: "9", domain: ".facebook.com", path: "/" }, { name: "xs", value: "s", domain: ".facebook.com", path: "/" }], origins: [] }));
  return dir;
}

describe("log facebook account resave", () => {
  test("saves a kept run's session to Twenty, then removes the folder", async () => {
    const dir = keptRun("needsLogin");
    const result = await run(["facebook", "account", "resave", "needsLogin", "--from", dir]);
    expect(result.code).toBe(0);
    expect(result.out).toContain("Saved needsLogin's session (2 cookies) to Twenty.");
    expect(existsSync(dir)).toBe(false);
    const row = result.twenty.rows.socialAccounts.find((r) => r.id === "needsLogin")!;
    expect((row.cookies as { name: string }[]).map((c) => c.name).sort()).toEqual(["c_user", "xs"]);
  });

  test("refuses a folder that belongs to another account", async () => {
    const dir = keptRun("galwayTwo");
    const result = await run(["facebook", "account", "resave", "galwayOne", "--from", dir]);
    expect(result.code).toBe(1);
    expect(result.out).toContain("belongs to another account");
    expect(existsSync(dir)).toBe(true);
  });
});

describe("log facebook account resetOpens", () => {
  test("writes one dated reset per account and puts the host's opens back to 0, deleting nothing", async () => {
    const root = mkdtempSync(join(tmpdir(), "logReset"));
    process.env.LOG_LAUNCH_RESETS = join(root, "launchResets.jsonl");
    process.env.LOG_HOST_DIR = join(root, "host");
    try {
      mkdirSync(join(root, "host", "needsLogin"), { recursive: true });
      const progress = { account: "needsLogin", accountId: "needsLogin", state: "stopped", savedAt: "2026-10-19T16:35:00Z", day: "2026-10-19", resume: { warmupDone: [], warmupStartedAt: null, opensToday: 2 }, issue: null, lastError: null, closes: [], snapshot: null };
      writeFileSync(join(root, "host", "needsLogin", "progress.json"), JSON.stringify(progress));
      const result = await run(["facebook", "account", "resetOpens", "needsLogin", "--reason", "dev day"]);
      expect(result.code).toBe(0);
      expect(result.out).toContain("needsLogin: opens reset at");
      expect(result.out).toContain("launch budget and host opens count from now");
      const line = JSON.parse(readFileSync(join(root, "launchResets.jsonl"), "utf8").trim());
      expect(line).toMatchObject({ account: "needsLogin", reason: "dev day" });
      expect(JSON.parse(readFileSync(join(root, "host", "needsLogin", "progress.json"), "utf8")).resume.opensToday).toBe(0);
    } finally {
      delete process.env.LOG_LAUNCH_RESETS;
      delete process.env.LOG_HOST_DIR;
    }
  });
});
