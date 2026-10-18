import { describe, expect, test } from "bun:test";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import { runCli } from "../runner/index.ts";
import { toCheckOutcome } from "./index.ts";

async function run(argv: string[], reply: () => unknown) {
  const out: string[] = [];
  const err: string[] = [];
  const worker = (async () => reply()) as unknown as WorkerClient;
  const code = await runCli(argv, { worker, out: (line) => out.push(line), err: (line) => err.push(line) });
  return { code, out: out.join("\n"), err: err.join("\n"), outLines: out };
}

const SCAN = {
  ok: true,
  url: "https://www.facebook.com/marketplace/you/selling",
  listings: [{ listingId: "1583545526797714", title: "Junk Clearance — Salthill", health: "ACTIVE", clicks: 2, href: "/x" }],
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
    expect(toCheckOutcome({ ok: false, error: "no-session" })).toMatchObject({ kind: "issue", issue: "never_connected" });
    expect(toCheckOutcome({ ok: false, error: "login-wall", url: "https://www.facebook.com/checkpoint/1" })).toMatchObject({
      issue: "checkpointed",
    });
    expect(toCheckOutcome({ ok: false, error: "TimeoutError: nav" })).toMatchObject({
      kind: "error",
      code: "TimeoutError",
      retryable: true,
    });
  });
});

describe("log watch", () => {
  test("runs one check, prints the trace and the decisions", async () => {
    const { code, out, err } = await run(["watch", "--account", "fb-galway-rubbish"], () => SCAN);
    expect(code).toBe(0);
    expect(err).toContain("checking");
    expect(err).toContain("done");
    // 38629807913299080 is live in log but missing from this scan: DELETED_BY_FB, repost approved.
    expect(out).toContain("38629807913299080");
    expect(out).toContain("DELETED_BY_FB");
    expect(out).toContain("Nothing was posted.");
  });

  test("--json streams NDJSON trace lines, then the output", async () => {
    const { outLines } = await run(["watch", "--account", "fb-galway-rubbish", "--json"], () => SCAN);
    const parsed = outLines.map((line) => JSON.parse(line));
    expect(parsed.some((line) => line.kind === "state" && line.state === "checking")).toBe(true);
    expect(parsed.at(-1).kind).toBe("output");
    expect(parsed.at(-1).stopReason).toBe("checks done");
  });

  test("a missing session stops with code 1", async () => {
    const { code, out } = await run(["watch", "--account", "fb-pacer"], () => ({ ok: false, error: "no-session" }));
    expect(code).toBe(1);
    expect(out).toContain("never_connected");
  });

  test("validates flags", async () => {
    expect((await run(["watch"], () => SCAN)).code).toBe(1);
    expect((await run(["watch", "--account", "nope"], () => SCAN)).code).toBe(1);
    expect((await run(["watch", "--account", "fb-pacer", "--checks", "-1"], () => SCAN)).code).toBe(1);
    expect((await run(["watch", "--account", "fb-pacer", "--interval", "0"], () => SCAN)).code).toBe(1);
  });
});
