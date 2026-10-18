import { describe, expect, test } from "bun:test";
import { runCli } from "./index.ts";

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { out: (line) => out.push(line), err: (line) => err.push(line) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("runCli", () => {
  test("no command prints usage for every command", async () => {
    const { code, out } = await run([]);
    expect(code).toBe(0);
    for (const name of ["launch", "listings", "listing", "accounts", "doctor", "login", "scan", "status"]) expect(out).toContain(`log ${name}`);
  });

  test("unknown command exits 2", async () => {
    expect((await run(["bogus"])).code).toBe(2);
  });

  test("listings --json returns every listing", async () => {
    const { code, out } = await run(["listings", "--json"]);
    expect(code).toBe(0);
    expect(JSON.parse(out).listings).toHaveLength(6);
  });

  test("listings filters and validates", async () => {
    expect((await run(["listings", "--status", "sold"])).out).toContain("Garden Waste Hauling");
    expect((await run(["listings", "--status", "bogus"])).code).toBe(1);
    expect((await run(["listings", "--account", "nope"])).code).toBe(1);
    expect((await run(["listings", "--wat"])).code).toBe(1);
  });

  test("listing shows detail and actions", async () => {
    const { code, out } = await run(["listing", "1583545526797714", "--json"]);
    expect(code).toBe(0);
    const parsed = JSON.parse(out);
    expect(parsed.listing.status).toBe("active");
    expect(parsed.actions.markSold).toBe(true);
    expect((await run(["listing"])).code).toBe(1);
    expect((await run(["listing", "000"])).code).toBe(1);
  });

  test("accounts --json lists the three Facebook accounts", async () => {
    const parsed = JSON.parse((await run(["accounts", "--json"])).out);
    expect(parsed.accounts.map((a: { id: string }) => a.id)).toEqual(["fb-galway-rubbish", "fb-pacer", "fb-personal"]);
    expect(parsed.accounts.every((a: { writeBlocked: boolean }) => a.writeBlocked === false)).toBe(true);
  });
});
