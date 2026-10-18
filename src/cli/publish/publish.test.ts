import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import type { PublishSession, SessionConfig, SessionStep } from "../../camofox/session/index.ts";
import { readAttempts } from "../../captcha/router/index.ts";
import { runCli } from "../runner/index.ts";

const root = mkdtempSync(join(tmpdir(), "logCliPublish"));
const saved: Record<string, string | undefined> = {};
const ENV = {
  LOG_FB_STATE_DIR: join(root, "facebook"),
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
  require("node:fs").mkdirSync(ENV.LOG_FB_STATE_DIR, { recursive: true });
  writeFileSync(join(ENV.LOG_FB_STATE_DIR, "fbGalwayRubbish.json"), "{}");
  photo = join(root, "van.png");
  writeFileSync(photo, await sharp({ create: { width: 160, height: 120, channels: 3, background: "#3a7" } }).png().toBuffer());
});
afterAll(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

/** A fake browser session: scripted replies per step, records every call. */
function fakeSession(script: Partial<Record<SessionStep, Array<Record<string, unknown>>>> = {}) {
  const calls: Array<{ step: SessionStep; params: Record<string, unknown> }> = [];
  const configs: SessionConfig[] = [];
  let closed = 0;
  const defaults: Partial<Record<SessionStep, Record<string, unknown>>> = {
    open: { kind: "ready", url: "https://www.facebook.com/marketplace/create/item" },
    setCategory: { ok: true, value: "Miscellaneous" },
    uploadPhotos: { ok: true, count: 1 },
    fillFields: { ok: true, filled: { title: "Van clearance", price: "40" } },
    review: { ok: true, receipt: "/runs/review.png", photoCount: 1 },
    publish: { ok: true, audienceStep: false },
    confirm: { ok: true, how: "toast" },
    captureId: { listingId: "1583545526797714", listingUrl: "https://www.facebook.com/marketplace/item/1583545526797714/" },
  };
  const factory = (config: SessionConfig): PublishSession => {
    configs.push(config);
    return {
      async call<T>(step: SessionStep, params: Record<string, unknown> = {}) {
        calls.push({ step, params });
        const queue = script[step];
        return ((queue && queue.length ? queue.shift() : defaults[step]) ?? { ok: false, code: "unscripted" }) as T;
      },
      async close() {
        closed++;
      },
    };
  };
  return { factory, calls, configs, closedCount: () => closed };
}

async function run(argv: string[], session = fakeSession()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { session: session.factory, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), outLines: out, session };
}

const BASE = () => ["publish", "--account", "fbGalwayRubbish", "--title", "Van clearance", "--price", "40", "--category", "Miscellaneous", "--photo", photo];

describe("log publish", () => {
  test("dry run by default: fills, reviews, never clicks Publish, closes the browser", async () => {
    const { code, out, err, session } = await run(BASE());
    expect(code).toBe(0);
    expect(out).toContain("Dry run");
    expect(err).toContain("uploadingPhotos");
    const steps = session.calls.map((c) => c.step);
    expect(steps).toEqual(["open", "setCategory", "uploadPhotos", "fillFields", "review"]);
    expect(steps).not.toContain("publish");
    expect(session.closedCount()).toBe(1);
    // The photo was varied to a JPEG before upload.
    const paths = session.calls.find((c) => c.step === "uploadPhotos")!.params.paths as string[];
    expect(paths[0].endsWith(".jpg")).toBe(true);
  });

  test("--live publishes and reports the listing id", async () => {
    const { code, out, session } = await run([...BASE(), "--live"]);
    expect(code).toBe(0);
    expect(out).toContain("Published.");
    expect(out).toContain("1583545526797714");
    expect(session.calls.filter((c) => c.step === "publish")).toHaveLength(1);
  });

  test("a reCAPTCHA goes to CaptchaKraken, and the attempt lands in the ledger", async () => {
    const session = fakeSession({
      open: [{ kind: "captcha", detection: { kind: "recaptcha", enterprise: true } }, { kind: "ready", url: "x" }],
      solveCaptcha: [{ solved: true, detail: "verdicts=[]" }],
    });
    const { code, out } = await run(BASE(), session);
    expect(code).toBe(0);
    expect(session.calls.find((c) => c.step === "solveCaptcha")!.params.solver).toBe("captchaKraken");
    expect(session.calls.filter((c) => c.step === "open").map((c) => c.params.recheck)).toEqual([false, true]);
    expect(out).toContain("recaptcha via captchaKraken: solved, accepted");
    const ledger = readAttempts(ENV.LOG_CAPTCHA_LEDGER);
    expect(ledger.at(-1)).toMatchObject({ accountId: "fbGalwayRubbish", solver: "captchaKraken", accepted: true });
  });

  test("Arkose with no 2Captcha key stops for a person, without solving", async () => {
    const session = fakeSession({ open: [{ kind: "captcha", detection: { kind: "arkose" } }] });
    const { code, out } = await run(BASE(), session);
    expect(code).toBe(1);
    expect(out).toContain("needs a person");
    expect(out).toContain("noSolverConfigured");
    expect(session.calls.some((c) => c.step === "solveCaptcha")).toBe(false);
  });

  test("--json streams the trace then the output, and writes the run record", async () => {
    const { outLines } = await run([...BASE(), "--json"]);
    const parsed = outLines.map((l) => JSON.parse(l));
    expect(parsed.some((l) => l.kind === "state" && l.state === "reviewing")).toBe(true);
    const output = parsed.at(-1);
    expect(output).toMatchObject({ kind: "output", result: "dryRun", dryRun: true });
    const record = JSON.parse(readFileSync(join(output.runDir, "output.json"), "utf8"));
    expect(record.result).toBe("dryRun");
  });

  test("refuses before any browser opens: bad listing, unknown account, no session", async () => {
    const noPhoto = await run(["publish", "--account", "fbGalwayRubbish", "--title", "x", "--price", "40", "--category", "Misc"]);
    expect(noPhoto.code).toBe(1);
    expect(noPhoto.err).toContain("at least 1 photo");
    expect(noPhoto.session.calls).toHaveLength(0);

    const unknown = await run(["publish", "--account", "nobody", ...BASE().slice(3)]);
    expect(unknown.err).toContain('unknown account "nobody"');

    const noSession = await run(["publish", "--account", "fbPacer", ...BASE().slice(3)]);
    expect(noSession.code).toBe(1);
    expect(noSession.err).toContain("log connect --account fbPacer");
  });
});
