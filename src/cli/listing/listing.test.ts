import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../runner/index.ts";
import { listingFromJson } from "./helpers/index.ts";

const desc = (opening: string) => `${opening}\n\nWhat we take:\n• Furniture, mattresses and appliances\n• Boxes, bags and clutter\n\nSmall load: $99\n\nSend a photo here and get your price.`;

const base = {
  price: 99,
  priceCurrency: "USD",
  category: "Miscellaneous",
  condition: "new",
  photos: ["before.png"],
  locationQuery: "Bethlehem, Pennsylvania",
  locationCity: "bethlehem",
  locationCountry: "US",
};

const versions = [
  { id: "photoQuote", title: "Junk Removal Bethlehem PA – Free Quote From a Photo", description: desc("Garage you can't park in?") },
  { id: "garageCleanout", title: "Garage & Basement Cleanouts Bethlehem – Same-Day Pickup", description: desc("A garage you can park in again.") },
  { id: "movingOut", title: "Moving Out of Bethlehem? We Take What You Leave Behind", description: desc("Keys due back and the place still full?") },
];

async function lint(json: unknown) {
  const file = join(mkdtempSync(join(tmpdir(), "logListingLint")), "listing.json");
  writeFileSync(file, JSON.stringify(json));
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(["facebook", "listing", "lint", "--file", file], { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("copy versions in listing.json", () => {
  test("the first version is the ad's own title and description", () => {
    const parsed = listingFromJson({ ...base, copyVersions: versions });
    expect(parsed.ok && parsed.ad.title).toBe(versions[0].title);
    expect(parsed.ok && parsed.ad.description).toBe(versions[0].description);
    expect(parsed.ok && parsed.ad.copyVersions.map((v) => v.id)).toEqual(["photoQuote", "garageCleanout", "movingOut"]);
  });

  test("a title that isn't the first version's is refused", () => {
    expect(listingFromJson({ ...base, title: "Something else", copyVersions: versions })).toMatchObject({ ok: false });
  });

  test("a version that breaks a copy rule is refused, naming it", () => {
    const parsed = listingFromJson({ ...base, copyVersions: [...versions, { id: "hype", title: "CHEAP Junk Removal Bethlehem!!!", description: desc("Best deal!") }] });
    expect(parsed.ok).toBe(false);
    expect(!parsed.ok && parsed.problems.join("\n")).toContain("copy version hype");
  });

  test("log facebook listing lint passes good versions and lists what's wrong with bad ones, saving nothing", async () => {
    const good = await lint({ ...base, copyVersions: versions });
    expect(good.code).toBe(0);
    expect(good.out).toContain("passes, 3 copy version(s)");
    const bad = await lint({ ...base, copyVersions: [versions[0], { ...versions[1], title: versions[0].title.replace("Photo", "Pic") }] });
    expect(bad.code).toBe(1);
    expect(bad.out).toContain("shares too many words");
  });
});
