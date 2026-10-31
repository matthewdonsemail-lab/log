import { describe, expect, test } from "bun:test";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

async function run(argv: string[], twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log facebook lifecycle", () => {
  test("every account: its status, the machine's state, and what onboarding has left", async () => {
    const result = await run(["facebook", "lifecycle"]);
    expect(result.code).toBe(0);
    expect(result.out).toMatch(/galwayOne\s+active\s+onboarding\.opening\.launch\.run\s+profile, location, warm-up \(a day\)/);
    expect(result.out).toMatch(/banned\s+banned\s+banned\s+-/);
    expect(result.out).toMatch(/noProxy\s+active\s+onboarding\.proxying\.run/);
  });

  test("the state tree comes from the machine itself", async () => {
    const result = await run(["facebook", "lifecycle", "states"]);
    expect(result.out).toContain("- **warming**");
    expect(result.out).toContain("runs `warmupActivity`");
    expect(result.out).toContain("ACT → host.acting");
    expect(result.out).toContain("PERSON_DONE → onboarding.checkingAccount");
  });
});
