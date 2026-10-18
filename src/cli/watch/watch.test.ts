import { describe, expect, test } from "bun:test";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";
import { toCheckOutcome } from "./index.ts";

async function run(argv: string[], reply: () => unknown, twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const worker = (async () => reply()) as unknown as WorkerClient;
  const code = await runCli(argv, { worker, twenty, out: (line) => out.push(line), err: (line) => err.push(line) });
  return { code, out: out.join("\n"), err: err.join("\n"), outLines: out, twenty };
}

const SCAN = {
  ok: true,
  url: "https://www.facebook.com/marketplace/you/selling",
  listings: [{ listingId: "222", title: "Rubbish Removal Galway", health: "ACTIVE", clicks: 2, href: "/x" }],
  needsAttention: [],
  bodySample: "Your listings Junk Clearance — Salthill Active",
};

describe("toCheckOutcome", () => {
  test("classifies worker results", () => {
    expect(toCheckOutcome(SCAN as never).kind).toBe("ok");
    expect(toCheckOutcome({ ...SCAN, bodySample: "You can't buy or sell on Facebook" } as never)).toMatchObject({
      kind: "issue",
      issue: "suspended",
    });
    expect(toCheckOutcome({ ok: false, code: "neverConnected" })).toMatchObject({ kind: "issue", issue: "neverConnected" });
    expect(toCheckOutcome({ ok: false, code: "loginWall", url: "https://www.facebook.com/checkpoint/1" })).toMatchObject({
      issue: "checkpointed",
    });
    expect(toCheckOutcome({ ok: false, code: "crashed", detail: "TimeoutError: nav" })).toMatchObject({
      kind: "error",
      code: "crashed",
      detail: "TimeoutError: nav",
      retryable: true,
    });
    // Retryable comes from the catalog, not from parsing the message.
    expect(toCheckOutcome({ ok: false, code: "badRequest", detail: "params.listingId is required" })).toMatchObject({
      kind: "error",
      retryable: false,
    });
    expect(toCheckOutcome({ ok: false, code: "rateLimited" })).toMatchObject({ kind: "issue", issue: "rateLimited" });
  });
});

describe("log watch", () => {
  test("runs one check against the account's Twenty listings, prints the trace and the decisions", async () => {
    const { code, out, err, twenty } = await run(["watch", "--account", "galwayOne"], () => SCAN);
    expect(code).toBe(0);
    expect(err).toContain("checking");
    expect(err).toContain("done");
    // 111 (liveOne) is live in Twenty but missing from this scan: DELETED_BY_FB, repost approved.
    expect(out).toContain("111");
    expect(out).toContain("DELETED_BY_FB");
    expect(out).toContain("Nothing was posted.");
    // Only this account's rows are synced: card 222 belongs to galwayTwo, so its row is untouched.
    expect(twenty.rows.agencyListings.find((r) => r.id === "liveTwo")!.clicksCount).toBeUndefined();
  });

  test("--json streams NDJSON trace lines, then the output", async () => {
    const { outLines } = await run(["watch", "--account", "galwayOne", "--json"], () => SCAN);
    const parsed = outLines.map((line) => JSON.parse(line));
    expect(parsed.some((line) => line.kind === "state" && line.state === "checking")).toBe(true);
    expect(parsed.at(-1).kind).toBe("output");
    expect(parsed.at(-1).stopReason).toBe("checks done");
  });

  test("a login wall stops with code 1 and marks the account NEEDS_LOGIN in Twenty", async () => {
    const { code, out, twenty } = await run(["watch", "--account", "galwayOne"], () => ({ ok: false, code: "sessionExpired" }));
    expect(code).toBe(1);
    expect(out).toContain("sessionExpired");
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.accountStatus).toBe("NEEDS_LOGIN");
  });

  test("validates flags, and never starts for an account that may not run", async () => {
    expect((await run(["watch"], () => SCAN)).code).toBe(1);
    expect((await run(["watch", "--account", "nope"], () => SCAN)).code).toBe(1);
    expect((await run(["watch", "--account", "galwayOne", "--checks", "-1"], () => SCAN)).code).toBe(1);
    expect((await run(["watch", "--account", "galwayOne", "--interval", "0"], () => SCAN)).code).toBe(1);
    const noProxy = await run(["watch", "--account", "noProxy"], () => SCAN);
    expect(noProxy.code).toBe(1);
    expect(noProxy.err).toContain("noProxy");
  });
});

describe("log watch keeps to the account's local hours (rule 18)", () => {
  test("a check that falls outside the window stops the watch without opening a browser", async () => {
    const twenty = marketplaceFixture();
    await twenty.update("socialAccounts", "galwayOne", { activeHoursStart: null, activeHoursEnd: null });
    let started = 0;
    const worker = (async () => {
      started++;
      return SCAN;
    }) as unknown as WorkerClient;
    // 21:59 in Galway when the watch starts, 22:30 by the second check.
    const clock = [new Date("2026-10-18T20:59:00Z"), new Date("2026-10-18T20:59:30Z"), new Date("2026-10-18T21:30:00Z")];
    const now = () => clock.shift() ?? new Date("2026-10-18T21:30:00Z");
    const out: string[] = [];
    const err: string[] = [];
    await runCli(["watch", "--account", "galwayOne", "--checks", "2", "--interval", "0.0001"], { worker, twenty, now, out: (l) => out.push(l), err: (l) => err.push(l) });
    expect(started).toBe(1);
    expect(err.join("\n") + out.join("\n")).toContain("outsideActiveHours");
  });
});
