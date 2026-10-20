import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
    for (const name of ["launch", "listings", "listing", "accounts", "account", "doctor", "connect", "scan", "status", "watch", "proxy", "publish", "campaign", "login", "logout", "whoami", "capture"]) expect(out).toContain(`log ${name}`);
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

  test("listing create adds a READY row for the account from a JSON file, and refuses one that can't post", async () => {
    const dir = mkdtempSync(join(tmpdir(), "logListing"));
    try {
      const good = join(dir, "good.json");
      writeFileSync(good, JSON.stringify({ title: "Junk removal", description: "We haul it", price: 99, priceCurrency: "EUR", category: "Miscellaneous", condition: "new", photos: ["a.jpg"], locationQuery: "Galway, Ireland", locationCity: "galway", locationCountry: "ie" }));
      const twenty = marketplaceFixture();
      const out: string[] = [];
      const code = await runCli(["listing", "create", "--account", "galwayOne", "--file", good, "--json"], { twenty, out: (l) => out.push(l), err: () => {} });
      expect(code).toBe(0);
      const created = JSON.parse(out.join("\n")).listing;
      expect(created).toMatchObject({ title: "Junk removal", status: "ready", price: 99, locationCountry: "IE", photos: ["a.jpg"], generation: 0 });
      expect(twenty.rows.agencyListings.some((r) => r.id === created.id)).toBe(true);

      const bad = join(dir, "bad.json");
      writeFileSync(bad, JSON.stringify({ title: "No price", category: "Miscellaneous", photos: [] }));
      const refused = await run(["listing", "create", "--account", "galwayOne", "--file", bad]);
      expect(refused.code).toBe(1);
      expect(refused.err).toContain("price must be 1 or more");
      expect((await run(["listing", "create", "--file", good])).code).toBe(1);
      // The same country check publish runs (rule 12): a row that can never post is never written.
      const abroad = join(dir, "abroad.json");
      writeFileSync(abroad, JSON.stringify({ title: "Junk removal", description: "We haul it", price: 99, priceCurrency: "USD", category: "Miscellaneous", condition: "new", photos: ["a.jpg"], locationQuery: "Philadelphia, PA", locationCity: "philadelphia", locationCountry: "US" }));
      const before = twenty.rows.agencyListings.length;
      const elsewhere = await runCli(["listing", "create", "--account", "galwayOne", "--file", abroad], { twenty, out: () => {}, err: () => {} });
      expect(elsewhere).toBe(1);
      expect(twenty.rows.agencyListings.length).toBe(before);
      expect((await run(["listing", "liveOne", "--account", "galwayOne"])).code).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
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

describe("--proxyMs (rule 33)", () => {
  test("is taken off any command and checked", async () => {
    const { takeProxyMs } = await import("./index.ts");
    expect(takeProxyMs(["inspect", "start", "--proxyMs", "6000", "--account", "a"])).toEqual({ argv: ["inspect", "start", "--account", "a"], proxyMs: 6000, error: null });
    expect(takeProxyMs(["scan", "--proxyMs=4000"]).proxyMs).toBe(4000);
    expect(takeProxyMs(["scan", "--proxyMs", "50"]).error).toContain("500 to 60000");
    expect(takeProxyMs(["scan"]).proxyMs).toBeNull();
  });

  test("sets the run's limit and restores it afterwards", async () => {
    const { slowFacebookMs } = await import("../../camofox/proxy/index.ts");
    expect(slowFacebookMs({})).toBe(2500);
    expect(slowFacebookMs({ LOG_PROXY_MAX_MS: "6000" })).toBe(6000);
    delete process.env.LOG_PROXY_MAX_MS;
    const err: string[] = [];
    await runCli(["errors", "--proxyMs", "7000"], { out: () => {}, err: (l) => err.push(l) });
    expect(err.join("\n")).toContain("7000 ms");
    expect(process.env.LOG_PROXY_MAX_MS).toBeUndefined();
  });
});
