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

const galwayDescription = (opening: string) => `${opening}\n\nWhat we take:\n• Furniture, mattresses and appliances\n• Bags, boxes and garden waste\n\nSmall load: €99\n\nSend a photo here and get your price.`;

const GALWAY_VERSIONS = [
  { id: "rubbishRemoval", title: "Rubbish Removal Galway - Free Quote From a Photo", description: galwayDescription("A pile you want gone this week?") },
  { id: "garageClearance", title: "Garage Clearance Galway - Same Week Collection", description: galwayDescription("Garage too full to park in?") },
  { id: "houseClearance", title: "House Clearance in Galway - Load, Haul and Sweep", description: galwayDescription("A whole house to clear?") },
  { id: "movingOut", title: "Moving Out of Galway? We Take What You Leave", description: galwayDescription("Keys due back and the place still full?") },
  { id: "sofaMattress", title: "Old Sofa or Mattress Collected in Galway", description: galwayDescription("One big thing that won't fit in the car?") },
  { id: "atticShed", title: "Attic and Shed Clearouts Galway - Fixed Prices", description: galwayDescription("Attic or shed full of things you never use?") },
  { id: "skipAlternative", title: "Galway Skip Alternative - We Load It For You", description: galwayDescription("No room or time for a skip?") },
  { id: "estateClearance", title: "Estate Clearance Galway - Respectful, Thorough Crew", description: galwayDescription("Clearing a family home?") },
  { id: "gardenWaste", title: "Garden Waste Taken Away in Galway - Bags or Loads", description: galwayDescription("Hedge cuttings piling up by the shed?") },
  { id: "officeClearout", title: "Office Clearouts Galway - Desks, Chairs and Boxes", description: galwayDescription("Moving office and the old desks can't come?") },
];

async function run(argv: string[], twenty = marketplaceFixture(photo), session = okSession()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty, session: session.factory as never, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), twenty, session };
}

describe("log facebook campaign", () => {
  test("fill refuses an ad without enough copy versions for the listings it would have live in its city", async () => {
    const { code, err, twenty } = await run(["facebook", "campaign", "fill", "--campaign", "campaignNew", "--from", "adTemplate", "--accounts", "5"]);
    expect(code).toBe(1);
    expect(err).toContain("notEnoughCopyVersions");
    expect(err).toContain("0 copy version(s) for 10 listing(s) live in Galway: write at least 10");
    expect(twenty.rows.agencyListings.filter((r) => r.campaignId === "campaignNew")).toHaveLength(0);
  });

  test("fill puts the ad on every eligible account in its country, each copy with the version least like what's live, and says how many it couldn't", async () => {
    const twenty = marketplaceFixture(photo);
    const ad = twenty.rows.agencyListings.find((r) => r.id === "adTemplate")!;
    ad.copyVersions = GALWAY_VERSIONS;
    const { code, out } = await run(["facebook", "campaign", "fill", "--campaign", "campaignNew", "--from", "adTemplate", "--accounts", "5"], twenty);
    expect(code).toBe(1);
    expect(out).toContain("Created 4 of 5 listing(s)");
    expect(out).toContain("1 short");
    const created = twenty.rows.agencyListings.filter((r) => r.campaignId === "campaignNew" && r.status === "READY");
    expect(created).toHaveLength(4);
    const used = created.map((r) => r.copyVersionId as string);
    expect(new Set(used).size).toBe(4);
    for (const row of created) {
      const version = GALWAY_VERSIONS.find((v) => v.id === row.copyVersionId)!;
      expect(row.title).toBe(version.title);
      expect(row.description).toBe(version.description);
    }
    expect(used[0]).not.toBe("rubbishRemoval");
    expect(out).toContain(`version ${used[0]}`);
  });

  test("a version that breaks a copy rule stops the fill", async () => {
    const twenty = marketplaceFixture(photo);
    const ad = twenty.rows.agencyListings.find((r) => r.id === "adTemplate")!;
    ad.copyVersions = GALWAY_VERSIONS.map((v, i) => (i === 2 ? { ...v, title: "CHEAP Rubbish Galway!!!" } : v));
    const { code, err } = await run(["facebook", "campaign", "fill", "--campaign", "campaignNew", "--from", "adTemplate", "--accounts", "1"], twenty);
    expect(code).toBe(1);
    expect(err).toContain("notEnoughCopyVersions");
    expect(err).toContain("houseClearance");
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
