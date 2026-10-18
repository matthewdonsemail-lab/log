import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import type { PublishSession, SessionConfig, SessionStep } from "../../camofox/session/index.ts";
import { readAttempts } from "../../captcha/router/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

const root = mkdtempSync(join(tmpdir(), "logCliPublish"));
const saved: Record<string, string | undefined> = {};
const ENV = {
  LOG_PUBLISH_DIR: join(root, "publish"),
  LOG_CAPTCHA_LEDGER: join(root, "attempts.jsonl"),
  CAPTCHA_KRAKEN_API_KEY: "ck_live_test",
  TWOCAPTCHA_API_KEY: "",
  CAPTCHA_KRAKEN_STATE_DIR: join(root, "noCredentials"),
};
let photo = "";

beforeAll(async () => {
  for (const [k, v] of Object.entries(ENV)) {
    saved[k] = process.env[k];
    process.env[k] = v;
  }
  // The `2CAPTCHA_API_KEY` alias must not leak a real key into these tests either.
  saved["2CAPTCHA_API_KEY"] = process.env["2CAPTCHA_API_KEY"];
  process.env["2CAPTCHA_API_KEY"] = "";
  mkdirSync(root, { recursive: true });
  photo = join(root, "van.png");
  writeFileSync(photo, await sharp({ create: { width: 160, height: 120, channels: 3, background: "#3a7" } }).png().toBuffer());
});
afterAll(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

/** A fake browser session: scripted replies per step, records every call and what its run files held. */
function fakeSession(script: Partial<Record<SessionStep, Array<Record<string, unknown>>>> = {}) {
  const calls: Array<{ step: SessionStep; params: Record<string, unknown> }> = [];
  const configs: SessionConfig[] = [];
  const proxyFiles: unknown[] = [];
  let closed = 0;
  const defaults: Partial<Record<SessionStep, Record<string, unknown>>> = {
    open: { kind: "ready", url: "https://www.facebook.com/marketplace/create/item" },
    setCategory: { ok: true, value: "Miscellaneous" },
    uploadPhotos: { ok: true, count: 1 },
    fillFields: { ok: true, filled: { title: "Rubbish Removal Galway", price: "50" } },
    review: { ok: true, receipt: "/runs/review.png", photoCount: 1 },
    publish: { ok: true, audienceStep: false },
    confirm: { ok: true, how: "toast" },
    captureId: { listingId: "1583545526797714", listingUrl: "https://www.facebook.com/marketplace/item/1583545526797714/" },
  };
  const factory = (config: SessionConfig): PublishSession => {
    configs.push(config);
    proxyFiles.push(JSON.parse(readFileSync(config.proxyPath, "utf8")));
    return {
      async call<T>(step: SessionStep, params: Record<string, unknown> = {}) {
        calls.push({ step, params });
        const queue = script[step];
        return ((queue && queue.length ? queue.shift() : defaults[step]) ?? { ok: false, code: "badReply", detail: `unscripted ${step}` }) as T;
      },
      async close() {
        closed++;
      },
    };
  };
  return { factory, calls, configs, proxyFiles, closedCount: () => closed };
}

async function run(argv: string[], session = fakeSession(), twenty = marketplaceFixture(photo)) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { session: session.factory, twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), outLines: out, session, twenty };
}

const row = (twenty: ReturnType<typeof marketplaceFixture>, object: string, id: string) => twenty.rows[object].find((r) => r.id === id)!;

describe("log publish", () => {
  test("dry run by default: fills, reviews, never clicks Publish, records the run in Twenty", async () => {
    const { code, out, err, session, twenty } = await run(["publish", "--listing", "readyOne"]);
    expect(code).toBe(0);
    expect(out).toContain("Dry run");
    expect(err).toContain("uploadingPhotos");
    const steps = session.calls.map((c) => c.step);
    expect(steps).toEqual(["open", "setCategory", "uploadPhotos", "fillFields", "review"]);
    expect(session.closedCount()).toBe(1);
    // The proxy came from the account in Twenty, as a file, and the file is gone afterwards.
    expect(session.proxyFiles[0]).toEqual({ server: "http://203.0.113.7:8080", username: "user", password: "secretPass", country: "IE" });
    expect(existsSync(session.configs[0].proxyPath)).toBe(false);
    const listing = row(twenty, "agencyListings", "readyOne");
    expect(listing).toMatchObject({ status: "READY", lastRunResult: "DRY_RUN", lastErrorCode: null });
    expect((listing.photoHashes as string[]).length).toBe(1);
  });

  test("--live publishes, and the listing and account are updated in Twenty", async () => {
    const { code, out, session, twenty } = await run(["publish", "--listing", "readyOne", "--live"]);
    expect(code).toBe(0);
    expect(out).toContain("Published.");
    expect(session.calls.filter((c) => c.step === "publish")).toHaveLength(1);
    expect(row(twenty, "agencyListings", "readyOne")).toMatchObject({ status: "ACTIVE", lastRunResult: "PUBLISHED", listingId: "1583545526797714" });
    expect(row(twenty, "socialAccounts", "galwayOne").lastPostedAt).toBeTruthy();
  });

  test("a reCAPTCHA goes to CaptchaKraken, and the attempt lands in the ledger", async () => {
    const session = fakeSession({
      open: [{ kind: "captcha", detection: { kind: "recaptcha", enterprise: true } }, { kind: "ready", url: "x" }],
      solveCaptcha: [{ solved: true, detail: "verdicts=[]" }],
    });
    const { code, out } = await run(["publish", "--listing", "readyOne"], session);
    expect(code).toBe(0);
    expect(session.calls.find((c) => c.step === "solveCaptcha")!.params.solver).toBe("captchaKraken");
    expect(out).toContain("recaptcha via captchaKraken: solved, accepted");
    expect(readAttempts(ENV.LOG_CAPTCHA_LEDGER).at(-1)).toMatchObject({ accountId: "galwayOne", solver: "captchaKraken", accepted: true });
  });

  test("Arkose with no 2Captcha key stops for a person, without solving", async () => {
    const session = fakeSession({ open: [{ kind: "captcha", detection: { kind: "arkose" } }] });
    const { code, out, twenty } = await run(["publish", "--listing", "readyOne"], session);
    expect(code).toBe(1);
    expect(out).toContain("needs a person");
    expect(session.calls.some((c) => c.step === "solveCaptcha")).toBe(false);
    expect(row(twenty, "agencyListings", "readyOne")).toMatchObject({ lastRunResult: "NEEDS_PERSON", lastErrorCode: "noSolverConfigured" });
  });

  test("Facebook disabling the account mid-run makes it BANNED and replaces its campaign listings", async () => {
    const session = fakeSession({ open: [{ kind: "issue", issue: "accountDisabled", detail: "Your account has been disabled" }] });
    const { code, out, twenty } = await run(["publish", "--listing", "readyOne", "--live"], session);
    expect(code).toBe(1);
    expect(out).toContain("galwayOne is now BANNED");
    expect(row(twenty, "socialAccounts", "galwayOne")).toMatchObject({ accountStatus: "BANNED", statusReason: "accountDisabled" });
    // Its campaign listings are kept and each gets a new row on another Irish account.
    expect(row(twenty, "agencyListings", "liveOne").status).toBe("REPLACED");
    const replacements = twenty.rows.agencyListings.filter((r) => r.replacesId === "liveOne");
    expect(replacements).toHaveLength(1);
    expect(replacements[0]).toMatchObject({ status: "READY", generation: 1, campaignId: "campaignGalway" });
    expect(["galwayThree", "dublinOne"]).toContain(replacements[0].socialAccountId as string);
  });

  test("--json streams the trace then the output, and writes the run record", async () => {
    const { outLines } = await run(["publish", "--listing", "readyOne", "--json"]);
    const parsed = outLines.map((l) => JSON.parse(l));
    expect(parsed.some((l) => l.kind === "state" && l.state === "reviewing")).toBe(true);
    const output = parsed.at(-1);
    expect(output).toMatchObject({ kind: "output", result: "dryRun", dryRun: true, agencyListingId: "readyOne" });
    expect(JSON.parse(readFileSync(join(output.runDir, "output.json"), "utf8")).result).toBe("dryRun");
  });
});

describe("log publish refuses before any browser opens", () => {
  const cases: [string, string[], string][] = [
    ["an unknown listing", ["--listing", "nope"], "listingNotFound"],
    ["a listing with no account", ["--listing", "adTemplate"], "listingNoAccount"],
    ["a live listing (would duplicate)", ["--listing", "liveOne"], "listingNotPublishable"],
    ["a listing in another country", ["--listing", "abroad"], "listingCountryMismatch"],
    ["an account with no proxy", ["--listing", "onNoProxy"], "noProxy"],
    ["an Irish listing on a Vietnamese account", ["--listing", "onVietnam"], "listingCountryMismatch"],
  ];
  for (const [what, args, code] of cases) {
    for (const live of [false, true]) {
      test(`${what} (${live ? "live" : "dry run"}) → ${code}`, async () => {
        const result = await run(["publish", ...args, ...(live ? ["--live"] : [])]);
        expect(result.code).toBe(1);
        expect(result.err).toContain(code);
        expect(result.session.calls).toHaveLength(0);
        expect(result.session.configs).toHaveLength(0);
      });
    }
  }

  test("the refusal is written to the listing row", async () => {
    const { twenty } = await run(["publish", "--listing", "onNoProxy"]);
    expect(row(twenty, "agencyListings", "onNoProxy")).toMatchObject({ lastRunResult: "BLOCKED", lastErrorCode: "noProxy" });
  });

  test("--live stops at the account's daily cap", async () => {
    const twenty = marketplaceFixture(photo);
    await twenty.update("socialAccounts", "galwayOne", { dailyListingCap: 1 });
    await twenty.update("agencyListings", "liveOne", { publishedAt: new Date().toISOString() });
    const live = await run(["publish", "--listing", "readyOne", "--live"], fakeSession(), twenty);
    expect(live.code).toBe(1);
    expect(live.err).toContain("dailyCapReached");
    // A dry run doesn't post, so it isn't capped.
    expect((await run(["publish", "--listing", "readyOne"], fakeSession(), twenty)).code).toBe(0);
  });
});
