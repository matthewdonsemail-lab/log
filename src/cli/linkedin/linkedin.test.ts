import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { LINKEDIN_PLATFORM } from "../../linkedin/account/session/index.ts";
import { runCli } from "../runner/index.ts";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "linkedinOne", accountName: "linkedinOne", platform: "LINKEDIN", cookies: { "li_at": "x".repeat(20), "JSESSIONID": "x".repeat(20) }, proxy: null } as never);
  return twenty;
}

async function run(argv: string[], engine?: PlatformEngineRun, twenty = fixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const calls: string[] = [];
  const code = await runCli(argv, {
    twenty,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    directLinkedin: (account, spec) => {
      calls.push(`${account.accountName}:${spec.action}`);
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  const row = twenty.rows.socialAccounts!.find((r) => r.accountName === "linkedinOne")!;
  return { code, out: out.join("\n"), err: err.join("\n"), calls, row };
}

describe("log linkedin session check", () => {
  test("loggedIn: the engine's answer goes to Twenty", async () => {
    const r = await run(["linkedin", "session", "check", "--account", "linkedinOne"], { answer: { ok: true, loginState: "loggedIn", screenName: "linkedinOne" }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["linkedinOne:ping"]);
    expect(r.row.sessionState).toBe("loggedIn");
  });

  test("an account of another platform is refused before the engine is called", async () => {
    const r = await run(["linkedin", "session", "check", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("accountNotFound");
    expect(r.calls).toEqual([]);
  });

  test("the engine refuses cookies without li_at and JSESSIONID before calling LinkedIn", () => {
    const dir = mkdtempSync(join(tmpdir(), "linkedinEngine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({ session: "x" }));
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ action: "ping", account: "linkedinOne", platform: "linkedin", stateRoot: join(dir, "state"), cookiesPath }));
    const engine = spawnSync(process.env.LOG_PYTHON || "python", [LINKEDIN_PLATFORM.engine, spec], { encoding: "utf8" });
    if (engine.error) return;
    expect(JSON.parse(engine.stdout.trim().split(/\r?\n/).pop()!)).toMatchObject({ ok: false, code: "sessionDead", loginState: "loggedOut" });
  });
});
