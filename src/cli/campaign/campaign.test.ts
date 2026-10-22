import { beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import type { PublishSession, SessionStep } from "../../camofox/session/index.ts";
import { FIXTURE_CAMPAIGN, marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

let photo = "";
beforeAll(async () => {
  const dir = mkdtempSync(join(tmpdir(), "logCliCampaign"));
  process.env.LOG_PUBLISH_DIR = join(dir, "publish");
  process.env.LOG_CAPTCHA_LEDGER = join(dir, "attempts.jsonl");
  photo = join(dir, "van.png");
  writeFileSync(photo, await sharp({ create: { width: 160, height: 120, channels: 3, background: "#37a" } }).png().toBuffer());
});

function okSession() {
  const opened: string[] = [];
  const replies: Partial<Record<SessionStep, Record<string, unknown>>> = {
    open: { kind: "ready", url: "x" },
    setCategory: { ok: true, value: "Miscellaneous" },
    uploadPhotos: { ok: true, count: 1 },
    fillFields: { ok: true, filled: {} },
    review: { ok: true, receipt: null, photoCount: 1 },
  };
  const factory = (config: { accountId: string }): PublishSession => {
    opened.push(config.accountId);
    return { call: async <T>(step: SessionStep) => (replies[step] ?? { ok: false, code: "badReply" }) as T, close: async () => {} };
  };
  return { factory, opened };
}

async function run(argv: string[], twenty = marketplaceFixture(photo), session = okSession()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty, session: session.factory as never, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), twenty, session };
}

describe("log facebook campaign", () => {
  test("fill puts the ad on every eligible account in its country, and says how many it couldn't", async () => {
    const { code, out, twenty } = await run(["facebook", "campaign", "fill", "--campaign", "campaignNew", "--from", "adTemplate", "--accounts", "5"]);
    expect(code).toBe(1);
    expect(out).toContain("Created 4 of 5 listing(s)");
    expect(out).toContain("1 short");
    expect(twenty.rows.agencyListings.filter((r) => r.campaignId === "campaignNew" && r.status === "READY")).toHaveLength(4);
  });

  test("run dry-runs every READY listing in the campaign, each through the account check", async () => {
    const { code, out, session } = await run(["facebook", "campaign", "run", "--campaign", FIXTURE_CAMPAIGN]);
    expect(code).toBe(0);
    expect(out).toContain("1/1 dry-run ok");
    expect(session.opened).toEqual(["galwayOne"]);
  });

  test("heal reports when nothing is lost", async () => {
    expect((await run(["facebook", "campaign", "heal", "--campaign", FIXTURE_CAMPAIGN])).out).toContain("No ACCOUNT_LOST listings");
  });

  test("needs an action and --campaign", async () => {
    expect((await run(["facebook", "campaign"])).code).toBe(1);
    expect((await run(["facebook", "campaign", "fill", "--campaign", "x"])).code).toBe(1);
  });
});
