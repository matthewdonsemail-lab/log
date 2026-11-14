import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { InspectSessionConfig } from "../../browser/inspect/index.ts";
import { findAccount } from "../../platformKit/socialAccount/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { openInspectSession } from "./helpers/index.ts";

describe("openInspectSession", () => {
  test("a host, flow or warm-up browser sent to a checkpoint sets the account to DEACTIVATED in Twenty", async () => {
    const twenty = marketplaceFixture();
    const account = await findAccount(twenty, "galwayOne");
    const captureDir = join(mkdtempSync(join(tmpdir(), "flowCheckpoint")), "run", "camoufox");
    const errors: string[] = [];
    const context = {
      twenty,
      err: (line: string) => errors.push(line),
      inspectSession: async (config: InspectSessionConfig) => {
        mkdirSync(dirname(config.captureDir), { recursive: true });
        writeFileSync(join(dirname(config.captureDir), "navigations.jsonl"), JSON.stringify({ url: "https://www.facebook.com/checkpoint/1501092823525282/", at: "2026-10-24T06:51:09.000Z" }) + "\n");
        writeFileSync(config.repliesPath, '{"id": "ready"}\n');
        return 0;
      },
    } as unknown as CommandContext;
    const opened = await openInspectSession(context, account, { statePath: "", proxyPath: "", devicePath: null, captureDir, loginPath: null });
    expect("session" in opened).toBe(true);
    if ("session" in opened) await opened.session;
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")).toMatchObject({ accountStatus: "DEACTIVATED", statusReason: "checkpointed" });
    expect(errors.join("\n")).toContain("galwayOne is checkpointed, so it is DEACTIVATED in Twenty");
  });
});
