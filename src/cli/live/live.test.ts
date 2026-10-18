import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { storageStatePath, toListingStatus } from "../../camofox/worker/index.ts";
import type { WorkerClient, WorkerRequest } from "../../camofox/worker/index.ts";
import { runCli } from "../runner/index.ts";

/** Runs the CLI with a fake worker: no python, no browser. */
async function run(argv: string[], reply: (request: WorkerRequest) => unknown) {
  const out: string[] = [];
  const err: string[] = [];
  const requests: WorkerRequest[] = [];
  const worker = (async (request: WorkerRequest) => {
    requests.push(request);
    return reply(request);
  }) as WorkerClient;
  const code = await runCli(argv, { worker, out: (line) => out.push(line), err: (line) => err.push(line) });
  return { code, out: out.join("\n"), err: err.join("\n"), requests };
}

// Every account but fbPersonal gets a proxy file (rule 12).
const proxyDir = mkdtempSync(join(tmpdir(), "logCliProxies"));
const savedProxyDir = process.env.LOG_PROXY_DIR;
beforeAll(() => {
  process.env.LOG_PROXY_DIR = proxyDir;
  mkdirSync(proxyDir, { recursive: true });
  for (const id of ["fbGalwayRubbish", "fbPacer"]) {
    writeFileSync(join(proxyDir, `${id}.json`), JSON.stringify({ server: "http://203.0.113.7:8080", country: "IE" }));
  }
});
afterAll(() => {
  if (savedProxyDir === undefined) delete process.env.LOG_PROXY_DIR;
  else process.env.LOG_PROXY_DIR = savedProxyDir;
});

const SCAN = {
  ok: true,
  url: "https://www.facebook.com/marketplace/you/selling",
  listings: [
    { listingId: "1583545526797714", title: "Junk Clearance — Salthill", health: "DUPLICATE_TAKEDOWN", clicks: 4, href: "/marketplace/item/1583545526797714/" },
    { listingId: "999", title: "New thing", health: "ACTIVE", clicks: 0, href: "/marketplace/item/999/" },
  ],
  needsAttention: ["Junk Clearance — Salthill"],
};

describe("toListingStatus", () => {
  test("maps dashboard badges onto listing statuses", () => {
    expect(toListingStatus("ACTIVE")).toEqual({ status: "active" });
    expect(toListingStatus("DUPLICATE_TAKEDOWN")).toEqual({ status: "underReviewDuplicate" });
    expect(toListingStatus("POLICY_VIOLATION")).toEqual({ status: "removed", removedBy: "platform" });
    expect(toListingStatus("CHECKPOINT_REQUIRED")).toEqual({ status: "loginWall" });
    expect(toListingStatus("RETRY_EXHAUSTED")).toEqual({ status: "unknown" });
  });
});

describe("storageStatePath", () => {
  test("one file per account, overridable", () => {
    expect(storageStatePath("fbPacer", { LOG_FB_STATE_DIR: "/tmp/fb" }).replaceAll("\\", "/")).toBe("/tmp/fb/fbPacer.json");
  });
});

describe("live commands", () => {
  test("rule 12: scan and status refuse an account with no proxy, without starting the worker", async () => {
    const scan = await run(["scan", "--account", "fbPersonal"], () => SCAN);
    expect(scan.code).toBe(1);
    expect(scan.err).toContain("noProxy");
    expect(scan.requests).toHaveLength(0);
    const status = await run(["status", "1", "--account", "fbPersonal"], () => SCAN);
    expect(status.requests).toHaveLength(0);
  });

  test("the worker gets the proxy file path, never the credentials", async () => {
    const { requests } = await run(["scan", "--account", "fbPacer"], () => SCAN);
    expect(requests[0].proxy_path).toBe(join(proxyDir, "fbPacer.json"));
    expect(JSON.stringify(requests[0])).not.toContain("203.0.113.7");
  });

  test("scan sends the account's session and compares with log", async () => {
    const { code, out, requests } = await run(["scan", "--account", "fbGalwayRubbish"], () => SCAN);
    expect(code).toBe(0);
    expect(requests[0].action).toBe("marketplace.scan");
    expect(requests[0].storage_state_path).toBe(storageStatePath("fbGalwayRubbish"));
    expect(out).toContain("Duplicate hold");
    expect(out).toContain("Active");
    expect(out).toContain("not in log");
    expect(out).toContain("Needs attention:");
  });

  test("scan --json passes the worker result through", async () => {
    const { out } = await run(["scan", "--account", "fbPacer", "--json"], () => SCAN);
    expect(JSON.parse(out).listings).toHaveLength(2);
  });

  test("scan needs a known account and explains a missing session", async () => {
    expect((await run(["scan"], () => SCAN)).code).toBe(1);
    expect((await run(["scan", "--account", "nope"], () => SCAN)).code).toBe(1);
    const missing = await run(["scan", "--account", "fbPacer"], () => ({ ok: false, code: "neverConnected" }));
    expect(missing.code).toBe(1);
    expect(missing.err).toContain("log connect --account fbPacer");
    const wall = await run(["scan", "--account", "fbPacer"], () => ({ ok: false, code: "loginWall" }));
    expect(wall.err).toContain("log in again");
  });

  test("status opens one listing", async () => {
    const reply = { ok: true, listingId: "1583545526797714", listingUrl: "https://x", status: "active", title: "Junk" };
    const { code, out, requests } = await run(["status", "1583545526797714", "--account", "fbGalwayRubbish"], () => reply);
    expect(code).toBe(0);
    expect(requests[0].params).toEqual({ listing_id: "1583545526797714" });
    expect(out).toContain("Live status active");
    expect((await run(["status", "--account", "fbPacer"], () => reply)).code).toBe(1);
  });

  test("connect hands the terminal to the worker", async () => {
    let interactive: boolean | undefined;
    const out: string[] = [];
    const worker = (async (_request: WorkerRequest, options?: { interactive?: boolean }) => {
      interactive = options?.interactive;
      return { ok: true, storageStatePath: "/tmp/fbPacer.json", loggedIn: true, authFlags: {} };
    }) as WorkerClient;
    const code = await runCli(["connect", "--account", "fbPacer"], { worker, out: (l) => out.push(l), err: () => {} });
    expect(code).toBe(0);
    expect(interactive).toBe(true);
    expect(out.join("\n")).toContain("Saved the fbPacer session");
  });

  test("doctor reports checks and per-account sessions", async () => {
    const reply = { ok: true, checks: { python: "3.12.10", facebookCamofoxClient: "/fcc", camoufoxBrowser: "/camoufox.exe", camoufoxVersion: "152" } };
    const { code, out } = await run(["doctor", "--json"], () => reply);
    expect(code).toBe(0);
    expect(JSON.parse(out).sessions.map((s: { accountId: string }) => s.accountId)).toEqual(["fbGalwayRubbish", "fbPacer", "fbPersonal"]);
    expect((await run(["doctor"], () => ({ ok: false, checks: { python: "3", facebookCamofoxClient: null, camoufoxBrowser: null } }))).code).toBe(1);
  });
});
