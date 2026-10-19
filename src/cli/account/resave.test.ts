import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
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

describe("log account resave", () => {
  test("saves a kept run's session to Twenty, then removes the folder", async () => {
    const dir = keptRun("needsLogin");
    const result = await run(["account", "resave", "needsLogin", "--from", dir]);
    expect(result.code).toBe(0);
    expect(result.out).toContain("Saved needsLogin's session (2 cookies) to Twenty.");
    expect(existsSync(dir)).toBe(false);
    const row = result.twenty.rows.socialAccounts.find((r) => r.id === "needsLogin")!;
    expect((row.cookies as { name: string }[]).map((c) => c.name).sort()).toEqual(["c_user", "xs"]);
  });

  test("refuses a folder that belongs to another account", async () => {
    const dir = keptRun("galwayTwo");
    const result = await run(["account", "resave", "galwayOne", "--from", dir]);
    expect(result.code).toBe(1);
    expect(result.out).toContain("belongs to another account");
    expect(existsSync(dir)).toBe(true);
  });
});
