import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { toListingStatus } from "../../camofox/worker/index.ts";
import type { WorkerClient, WorkerRequest } from "../../camofox/worker/index.ts";
import { FIXTURE_COOKIES, marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

/** Runs the CLI against an in-memory Twenty and a fake worker: no network, no python, no browser. */
async function run(argv: string[], reply: (request: WorkerRequest) => unknown, twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const requests: WorkerRequest[] = [];
  const files: { proxy?: unknown; state?: unknown } = {};
  const worker = (async (request: WorkerRequest) => {
    requests.push(request);
    // What the Python would read: the run's private files exist while it runs.
    if (request.proxy_path) files.proxy = JSON.parse(readFileSync(request.proxy_path, "utf8"));
    if (request.storage_state_path && existsSync(request.storage_state_path)) files.state = JSON.parse(readFileSync(request.storage_state_path, "utf8"));
    return reply(request);
  }) as WorkerClient;
  const code = await runCli(argv, { worker, twenty, out: (line) => out.push(line), err: (line) => err.push(line) });
  return { code, out: out.join("\n"), err: err.join("\n"), requests, files, twenty };
}

const SCAN = {
  ok: true,
  url: "https://www.facebook.com/marketplace/you/selling",
  listings: [
    { listingId: "111", title: "Rubbish Removal Galway", health: "DUPLICATE_TAKEDOWN", clicks: 4, href: "/marketplace/item/111/" },
    { listingId: "999", title: "Not in Twenty", health: "ACTIVE", clicks: 0, href: "/marketplace/item/999/" },
  ],
  needsAttention: ["Rubbish Removal Galway"],
  bodySample: "Your listings",
};

describe("toListingStatus", () => {
  test("maps dashboard badges onto listing statuses", () => {
    expect(toListingStatus("ACTIVE")).toEqual({ status: "active" });
    expect(toListingStatus("DUPLICATE_TAKEDOWN")).toEqual({ status: "underReviewDuplicate" });
    expect(toListingStatus("POLICY_VIOLATION")).toEqual({ status: "removed", removedBy: "platform" });
  });
});

describe("rule 12: no browser for an account that may not run", () => {
  const refusals: [string, string][] = [
    ["noProxy", "noProxy"],
    ["noCountry", "noHomeCountry"],
    ["noCookies", "neverConnected"],
    ["banned", "accountNotUsable"],
    ["unset", "accountNotUsable"],
    ["twitterOne", "accountNotFacebook"],
    ["nobody", "accountNotFound"],
  ];
  for (const [account, code] of refusals) {
    test(`scan --account ${account} → ${code}, worker never started`, async () => {
      const result = await run(["scan", "--account", account], () => SCAN);
      expect(result.code).toBe(1);
      expect(result.err).toContain(code);
      expect(result.requests).toHaveLength(0);
    });
  }

  test("connect refuses an account with no proxy too: signing in is no exception", async () => {
    const twenty = marketplaceFixture();
    await twenty.update("socialAccounts", "needsLogin", { proxy: null });
    const result = await run(["connect", "--account", "needsLogin"], () => ({ ok: true }), twenty);
    expect(result.code).toBe(1);
    expect(result.err).toContain("noProxy");
    expect(result.requests).toHaveLength(0);
  });
});

describe("live commands", () => {
  test("scan hands the worker file paths only, and the files carry the proxy and cookies from Twenty", async () => {
    const { code, requests, files } = await run(["scan", "--account", "galwayOne"], () => SCAN);
    expect(code).toBe(0);
    expect(JSON.stringify(requests[0])).not.toContain("secretPass");
    expect(files.proxy).toEqual({ server: "http://203.0.113.7:8080", username: "user", password: "secretPass", country: "IE" });
    expect((files.state as { cookies: unknown }).cookies).toEqual(FIXTURE_COOKIES);
    // The private run folder is gone afterwards.
    expect(existsSync(requests[0].proxy_path!)).toBe(false);
  });

  test("scan writes the dashboard back to the account's listings in Twenty", async () => {
    const { out, twenty } = await run(["scan", "--account", "galwayOne"], () => SCAN);
    expect(out).toContain("Updated 1 listing(s) in Twenty.");
    const row = twenty.rows.agencyListings.find((r) => r.id === "liveOne")!;
    expect(row.status).toBe("DUPLICATE_TAKEDOWN");
    expect(row.clicksCount).toBe(4);
  });

  test("a ban seen on the page makes the account RESTRICTED and replaces its campaign listings", async () => {
    const banned = { ...SCAN, bodySample: "You can't buy or sell on Facebook" };
    const { out, twenty } = await run(["scan", "--account", "galwayOne"], () => banned);
    expect(out).toContain("galwayOne is now RESTRICTED");
    const account = twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!;
    expect(account).toMatchObject({ accountStatus: "RESTRICTED", statusReason: "suspended" });
    // Kept, never deleted.
    expect(twenty.rows.socialAccounts.some((r) => r.id === "galwayOne")).toBe(true);
    expect(twenty.rows.agencyListings.find((r) => r.id === "readyOne")!.status).toBe("REPLACED");
  });

  test("a worker failure with an account code updates the account", async () => {
    const { code, err, twenty } = await run(["scan", "--account", "galwayOne"], () => ({ ok: false, code: "checkpointed", detail: "verify" }));
    expect(code).toBe(1);
    expect(err).toContain("checkpointed");
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.accountStatus).toBe("CHECKPOINT");
  });

  test("status opens one listing", async () => {
    const reply = { ok: true, listingId: "111", listingUrl: "https://x", status: "active", title: "Rubbish" };
    const { code, out, requests } = await run(["status", "111", "--account", "galwayOne"], () => reply);
    expect(code).toBe(0);
    expect(requests[0].params).toEqual({ listing_id: "111" });
    expect(out).toContain("Live status active");
  });

  test("connect signs in through the proxy and saves the cookies to Twenty", async () => {
    const twenty = marketplaceFixture();
    let interactive: boolean | undefined;
    const fresh = [{ name: "c_user", value: "2", domain: ".facebook.com", path: "/" }];
    const worker = (async (request: WorkerRequest, options?: { interactive?: boolean }) => {
      interactive = options?.interactive;
      // The browser leaves its storage_state where it was told to.
      require("node:fs").writeFileSync(request.storage_state_path!, JSON.stringify({ cookies: fresh, origins: [] }));
      return { ok: true, storageStatePath: request.storage_state_path, loggedIn: true, authFlags: {} };
    }) as WorkerClient;
    const out: string[] = [];
    const code = await runCli(["connect", "--account", "needsLogin"], { worker, twenty, out: (l) => out.push(l), err: () => {} });
    expect(code).toBe(0);
    expect(interactive).toBe(true);
    const account = twenty.rows.socialAccounts.find((r) => r.id === "needsLogin")!;
    expect(account.cookies).toEqual(fresh);
    expect(account.accountStatus).toBe("ACTIVE");
    expect(out.join("\n")).toContain("needsLogin is ACTIVE again");
  });

  test("doctor reports the setup and which Twenty accounts may run", async () => {
    const reply = { ok: true, checks: { python: "3.12.10", facebookCamofoxClient: "/fcc", camoufoxBrowser: "/camoufox.exe", camoufoxVersion: "152" } };
    const { code, out } = await run(["doctor", "--json"], () => reply);
    expect(code).toBe(0);
    const accounts = JSON.parse(out).accounts as { accountName: string; ready: boolean }[];
    expect(accounts.find((a) => a.accountName === "galwayOne")!.ready).toBe(true);
    expect(accounts.find((a) => a.accountName === "noProxy")!.ready).toBe(false);
    expect(accounts.some((a) => a.accountName === "twitterOne")).toBe(false);
  });
});
