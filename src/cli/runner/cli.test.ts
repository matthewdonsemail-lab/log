import { describe, expect, test } from "bun:test";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "./index.ts";

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty: marketplaceFixture(), out: (line) => out.push(line), err: (line) => err.push(line) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("runCli", () => {
  test("no command prints usage for every command", async () => {
    const { code, out } = await run([]);
    expect(code).toBe(0);
    for (const name of ["launch", "listings", "listing", "accounts", "account", "doctor", "connect", "scan", "status", "watch", "proxy", "publish", "campaign", "login", "logout", "whoami"]) expect(out).toContain(`log ${name}`);
  });

  test("unknown command exits 2", async () => {
    expect((await run(["bogus"])).code).toBe(2);
  });

  test("listings --json returns every Twenty listing", async () => {
    const { code, out } = await run(["listings", "--json"]);
    expect(code).toBe(0);
    expect(JSON.parse(out).listings).toHaveLength(8);
  });

  test("listings filters by status, account and campaign, and validates", async () => {
    expect((await run(["listings", "--status", "SOLD"])).out).toContain("soldOne");
    const mine = JSON.parse((await run(["listings", "--account", "galwayOne", "--status", "ACTIVE", "--json"])).out).listings;
    expect(mine.map((l: { id: string }) => l.id)).toEqual(["liveOne"]);
    const campaign = JSON.parse((await run(["listings", "--campaign", "campaignGalway", "--json"])).out).listings;
    expect(campaign).toHaveLength(4);
    expect((await run(["listings", "--status", "bogus"])).code).toBe(1);
    expect((await run(["listings", "--account", "nope"])).code).toBe(1);
    expect((await run(["listings", "--wat"])).code).toBe(1);
  });

  test("listing shows one row with its account", async () => {
    const { code, out } = await run(["listing", "liveOne", "--json"]);
    expect(code).toBe(0);
    const parsed = JSON.parse(out);
    expect(parsed.listing).toMatchObject({ status: "active", listingId: "111", locationCountry: "IE" });
    expect(parsed.account).toMatchObject({ accountName: "galwayOne", homeCountry: "IE" });
    expect((await run(["listing"])).code).toBe(1);
    expect((await run(["listing", "000"])).code).toBe(1);
  });

  test("accounts --json lists the FACEBOOK accounts, never their proxy or cookies", async () => {
    const { out } = await run(["accounts", "--json"]);
    const accounts = JSON.parse(out).accounts as { accountName: string; hasProxy: boolean }[];
    expect(accounts.map((a) => a.accountName)).not.toContain("twitterOne");
    expect(accounts.find((a) => a.accountName === "noProxy")!.hasProxy).toBe(false);
    expect(out).not.toContain("secretPass");
    expect(out).not.toContain("c_user");
  });

  test("account status BANNED keeps the account and replaces its campaign listings", async () => {
    const twenty = marketplaceFixture();
    const out: string[] = [];
    const code = await runCli(["account", "status", "galwayTwo", "BANNED", "--reason", "accountDisabled"], { twenty, out: (l) => out.push(l), err: () => {} });
    expect(code).toBe(0);
    expect(out.join("\n")).toContain("galwayTwo is now BANNED");
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayTwo")).toMatchObject({ accountStatus: "BANNED", statusReason: "accountDisabled" });
    expect(twenty.rows.agencyListings.find((r) => r.id === "liveTwo")!.status).toBe("REPLACED");
    expect(twenty.rows.agencyListings.some((r) => r.replacesId === "liveTwo" && r.status === "READY")).toBe(true);
    expect((await runCli(["account", "status", "galwayTwo", "NOPE"], { twenty, out: () => {}, err: () => {} }))).toBe(1);
  });
});
