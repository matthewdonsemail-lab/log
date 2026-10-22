import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { toListingStatus } from "../../camofox/worker/index.ts";
import type { WorkerClient, WorkerRequest } from "../../camofox/worker/index.ts";
import type { ConnectSessionConfig } from "../../camofox/session/index.ts";
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
      const result = await run(["facebook", "scan", "--account", account], () => SCAN);
      expect(result.code).toBe(1);
      expect(result.err).toContain(code);
      expect(result.requests).toHaveLength(0);
    });
  }

  test("connect refuses an account with no proxy too: signing in is no exception", async () => {
    const twenty = marketplaceFixture();
    await twenty.update("socialAccounts", "needsLogin", { proxy: null });
    const result = await run(["facebook", "connect", "--account", "needsLogin"], () => ({ ok: true }), twenty);
    expect(result.code).toBe(1);
    expect(result.err).toContain("noProxy");
    expect(result.requests).toHaveLength(0);
  });
});

describe("live commands", () => {
  test("scan hands the worker file paths only, and the files carry the proxy and cookies from Twenty", async () => {
    const { code, requests, files } = await run(["facebook", "scan", "--account", "galwayOne"], () => SCAN);
    expect(code).toBe(0);
    expect(JSON.stringify(requests[0])).not.toContain("secretPass");
    expect(files.proxy).toEqual({ server: "http://203.0.113.7:8080", username: "user", password: "secretPass", country: "IE" });
    expect((files.state as { cookies: unknown }).cookies).toEqual(FIXTURE_COOKIES);
    // The private run folder is gone afterwards.
    expect(existsSync(requests[0].proxy_path!)).toBe(false);
  });

  test("scan writes the dashboard back to the account's listings in Twenty", async () => {
    const { out, twenty } = await run(["facebook", "scan", "--account", "galwayOne"], () => SCAN);
    expect(out).toContain("Updated 1 listing(s) in Twenty.");
    const row = twenty.rows.agencyListings.find((r) => r.id === "liveOne")!;
    expect(row.status).toBe("DUPLICATE_TAKEDOWN");
    expect(row.clicksCount).toBe(4);
  });

  test("a ban seen on the page makes the account RESTRICTED and replaces its campaign listings", async () => {
    const banned = { ...SCAN, bodySample: "You can't buy or sell on Facebook" };
    const { out, twenty } = await run(["facebook", "scan", "--account", "galwayOne"], () => banned);
    expect(out).toContain("galwayOne is now RESTRICTED");
    const account = twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!;
    expect(account).toMatchObject({ accountStatus: "RESTRICTED", statusReason: "suspended" });
    // Kept, never deleted.
    expect(twenty.rows.socialAccounts.some((r) => r.id === "galwayOne")).toBe(true);
    expect(twenty.rows.agencyListings.find((r) => r.id === "readyOne")!.status).toBe("REPLACED");
  });

  test("a worker failure with an account code updates the account", async () => {
    const { code, err, twenty } = await run(["facebook", "scan", "--account", "galwayOne"], () => ({ ok: false, code: "checkpointed", detail: "verify" }));
    expect(code).toBe(1);
    expect(err).toContain("checkpointed");
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.accountStatus).toBe("CHECKPOINT");
  });

  test("status opens one listing", async () => {
    const reply = { ok: true, listingId: "111", listingUrl: "https://x", status: "active", title: "Rubbish" };
    const { code, out, requests } = await run(["facebook", "status", "111", "--account", "galwayOne"], () => reply);
    expect(code).toBe(0);
    expect(requests[0].params).toEqual({ listing_id: "111" });
    expect(out).toContain("Live status active");
  });

  /** A connect session that shows `pages` in turn (the last repeats) and records every step. */
  function scriptedConnect(pages: string[], cookies = [{ name: "c_user", value: "2", domain: ".facebook.com", path: "/" }], bodySample = "Your listings") {
    const steps: string[] = [];
    const configs: ConnectSessionConfig[] = [];
    let handed: unknown = null;
    let closed = 0;
    const factory = (config: ConnectSessionConfig) => {
      configs.push(config);
      if (config.loginPath) handed = JSON.parse(require("node:fs").readFileSync(config.loginPath, "utf8"));
      let current = pages[0];
      return {
        async call<T>(step: string): Promise<T> {
          steps.push(step);
          if (step === "read") current = pages.length > 1 ? pages.shift()! : pages[0];
          if (step === "read") return { ok: true, kind: current, path: "/x", heading: current === "checkpoint" ? "Confirm your identity" : "" } as T;
          if (step === "save") {
            // The browser leaves its storage_state where it was told to.
            require("node:fs").writeFileSync(config.storageStatePath, JSON.stringify({ cookies, origins: [] }));
            return { ok: true, loggedIn: current === "loggedIn", bodySample } as T;
          }
          return { ok: true } as T;
        },
        async close() {
          closed++;
        },
      };
    };
    return { factory, steps, configs, handed: () => handed, closed: () => closed };
  }
  const FAST_CONNECT = { pollMs: 1, codeWindowMs: 1 };

  test("connect runs the connect machine through the proxy and saves the cookies to Twenty", async () => {
    const twenty = marketplaceFixture();
    const session = scriptedConnect(["loggedIn"]);
    const out: string[] = [];
    const err: string[] = [];
    const code = await runCli(["facebook", "connect", "--account", "needsLogin"], { connectSession: session.factory, connectTiming: FAST_CONNECT, twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
    expect(code).toBe(0);
    const account = twenty.rows.socialAccounts.find((r) => r.id === "needsLogin")!;
    expect(account.cookies).toEqual([{ name: "c_user", value: "2", domain: ".facebook.com", path: "/" }]);
    expect(account.accountStatus).toBe("ACTIVE");
    expect(out.join("\n")).toContain("needsLogin is ACTIVE again");
    expect(session.steps).toEqual(["open", "read", "save"]);
    expect(session.closed()).toBe(1);
    // Every state is printed (rule 6), and rule 22's HAR folder comes with the run.
    expect(err.join("\n")).toContain("signingIn.reading");
    expect(session.configs[0].captureDir.replaceAll("\\", "/")).toMatch(/\/connect\/\d{8}T\d{6}_needsLogin\/camoufox$/);
    expect(await runCli(["facebook", "connect", "--account", "needsLogin", "--wait", "5"], { connectSession: session.factory, twenty, out: () => {}, err: () => {} })).toBe(1);
  });

  test("connect --noPrompt types Twenty's details from a private file, deleted after the run, through two-step", async () => {
    const twenty = marketplaceFixture();
    await twenty.update("socialAccounts", "needsLogin", { email: "fixture@example.com", password: "fixturePass", totpSecret: "GEZDGNBVGY3TQOJQ" } as never);
    const session = scriptedConnect(["loginForm", "twoStepMethod", "twoStepCode", "trustDevice", "loggedIn"]);
    const out: string[] = [];
    const code = await runCli(["facebook", "connect", "--account", "needsLogin", "--noPrompt"], { connectSession: session.factory, connectTiming: FAST_CONNECT, twenty, out: (l) => out.push(l), err: (l) => out.push(l) });
    expect(code).toBe(0);
    expect(session.handed()).toEqual({ email: "fixture@example.com", password: "fixturePass", totpSecret: "GEZDGNBVGY3TQOJQ", messengerPin: null });
    expect(require("node:fs").existsSync(session.configs[0].loginPath!)).toBe(false);
    expect(session.steps.filter((s) => s !== "read")).toEqual(["open", "submitCredentials", "chooseAuthApp", "submitCode", "dismiss", "save"]);
    expect(out.join("\n")).toContain("Pages: loginForm → twoStepMethod → twoStepCode → trustDevice → loggedIn");
    expect(out.join("\n")).not.toContain("fixturePass");

    // A hand sign-in (no --noPrompt) never reads them, and types nothing.
    const plain = scriptedConnect(["loginForm", "loggedIn"]);
    await runCli(["facebook", "connect", "--account", "needsLogin"], { connectSession: plain.factory, connectTiming: FAST_CONNECT, twenty, out: () => {}, err: () => {} });
    expect(plain.configs[0].loginPath).toBeNull();
    expect(plain.steps).not.toContain("submitCredentials");
  });

  test("connect stuck on Facebook's checkpoint ends checkpointed: status CHECKPOINT, cookies left as they were", async () => {
    const twenty = marketplaceFixture();
    await twenty.update("socialAccounts", "galwayOne", { email: "fixture@example.com", password: "fixturePass" } as never);
    const before = twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.cookies;
    const session = scriptedConnect(["loginForm", "checkpoint"]);
    const out: string[] = [];
    const err: string[] = [];
    const code = await runCli(["facebook", "connect", "--account", "galwayOne", "--noPrompt", "--wait", "10"], { connectSession: session.factory, connectTiming: { ...FAST_CONNECT, deadlineMs: 50 }, twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
    expect(code).toBe(1);
    expect(err.join("\n")).toContain("checkpointed");
    expect(out.join("\n")).toContain('Checkpoint: "Confirm your identity"');
    expect(session.steps.filter((s) => s !== "read")).toEqual(["open", "submitCredentials"]);
    const account = twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!;
    expect(account.accountStatus).toBe("CHECKPOINT");
    expect(account.cookies).toEqual(before);
  });

  test("signed in but restricted account-wide (Pittsburgh's notice) is RESTRICTED, never ACTIVE", async () => {
    const twenty = marketplaceFixture();
    const session = scriptedConnect(["loggedIn"], undefined, "Marketplace What happened 9 Sep 2026 You can no longer request a review");
    const code = await runCli(["facebook", "connect", "--account", "needsLogin"], { connectSession: session.factory, connectTiming: FAST_CONNECT, twenty, out: () => {}, err: () => {} });
    expect(code).toBe(1);
    expect(twenty.rows.socialAccounts.find((r) => r.id === "needsLogin")).toMatchObject({ accountStatus: "RESTRICTED", statusReason: "restrictedPolicy" });
  });

  test("Listaro's post-login check: signed in but unable to buy or sell is recorded, cookies kept", async () => {
    const twenty = marketplaceFixture();
    const session = scriptedConnect(["loggedIn"], undefined, "You can't buy or sell on Facebook");
    const err: string[] = [];
    const code = await runCli(["facebook", "connect", "--account", "needsLogin"], { connectSession: session.factory, connectTiming: FAST_CONNECT, twenty, out: () => {}, err: (l) => err.push(l) });
    expect(code).toBe(1);
    expect(err.join("\n")).toContain("suspended");
    const account = twenty.rows.socialAccounts.find((r) => r.id === "needsLogin")!;
    expect(account.accountStatus).toBe("RESTRICTED");
    expect(account.cookies).toEqual([{ name: "c_user", value: "2", domain: ".facebook.com", path: "/" }]);
  });

  test("auto-login reads each sign-in page as its kind", () => {
    const cases: [string, string, string, Record<string, boolean>, string][] = [
      ["https://www.facebook.com/marketplace/you/selling", "Marketplace", "Your listings", { login_markers: false }, "loggedIn"],
      ["https://www.facebook.com/login/", "Log in", "The password that you've entered is incorrect.", { password_field: true }, "wrongPassword"],
      ["https://www.facebook.com/checkpoint/1501092823525282/", "Check your notifications on another device", "Try another way", {}, "twoStepMethod"],
      ["https://www.facebook.com/two_step_verification/authentication/", "Go to your authentication app", "Enter the 6-digit code", { code_field: true }, "twoStepCode"],
      ["https://www.facebook.com/checkpoint/1501092823525282/", "We suspect automated behaviour on your account", "Dismiss", {}, "automatedBehaviour"],
      ["https://www.facebook.com/login/", "Find your account", "Search", {}, "findAccount"],
      ["https://www.facebook.com/", "", "Allow the use of cookies", { cookie_banner: true }, "cookieBanner"],
      ["https://www.facebook.com/marketplace/you/selling", "Marketplace", "Your listings", { login_markers: false, session_cookies: false }, "unknown"],
      ["https://www.facebook.com/checkpoint/828281030927956/", "Confirm your identity", "Upload a photo of yourself", {}, "checkpoint"],
      // The 2026-10-19 page after the text captcha.
      ["https://www.facebook.com/checkpoint/1501092823525282/", "Confirm your identity", "Confirm that you're a real person with a video selfie We need more info to make sure that you're human. Start video selfie", {}, "videoSelfie"],
      ["https://www.facebook.com/checkpoint/x/", "Enter the code we sent to +353", "Try another way", { code_field: true }, "twoStepMethod"],
      ["https://www.facebook.com/checkpoint/x/", "Add your phone number", "", {}, "checkpoint"],
      ["https://www.facebook.com/checkpoint/x/", "Trust this device?", "Trust this device", {}, "trustDevice"],
      ["https://www.facebook.com/", "", "Your account has been locked", {}, "disabled"],
    ];
    const script = `import sys, json; sys.path.insert(0, 'python'); from login import autoLogin as a
cases = json.loads(sys.stdin.read())
print(json.dumps([a.classify(u, h, t, **{"password_field": False, "code_field": False, "captcha": False, "login_markers": True, **f}) for u, h, t, f, _ in cases]))`;
    const run = require("node:child_process").spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8", input: JSON.stringify(cases) });
    expect(JSON.parse(run.stdout.trim())).toEqual(cases.map((c) => c[4]));
  });

  test("auto-login hands Facebook's own checkpoints to a person and types codes only on two-step pages", () => {
    const headings = ["We suspect automated behaviour on your account", "Confirm your identity", "Your account has been locked", "Check your notifications on another device", "Go to your authentication app", "Enter the 6-digit code"];
    const script = `import sys, json; sys.path.insert(0, 'python'); from login import autoLogin as a; print(json.dumps([bool(a.TWO_STEP.search(h)) for h in ${JSON.stringify(headings)}]))`;
    const run = require("node:child_process").spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8" });
    expect(JSON.parse(run.stdout.trim())).toEqual([false, false, false, true, true, true]);
  });

  test("auto-login's TOTP matches RFC 6238", () => {
    const script = "import sys; sys.path.insert(0, 'python'); from login import autoLogin as a; s = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'; print(a.totp(s, 59, 8), a.totp(s, 1111111109, 8), a.totp(s, 59), a.totp('gezd gnbv gy3t qojq gezd gnbv gy3t qojq', 59))";
    const run = require("node:child_process").spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8" });
    expect(run.stdout.trim()).toBe("94287082 07081804 287082 287082");
  });

  test("doctor reports the setup and which Twenty accounts may run", async () => {
    const reply = { ok: true, checks: { python: "3.12.10", facebookCamofoxClient: "/fcc", camoufoxBrowser: "/camoufox.exe", camoufoxVersion: "152" } };
    const { code, out } = await run(["facebook", "doctor", "--json"], () => reply);
    expect(code).toBe(0);
    const accounts = JSON.parse(out).accounts as { accountName: string; ready: boolean }[];
    expect(accounts.find((a) => a.accountName === "galwayOne")!.ready).toBe(true);
    expect(accounts.find((a) => a.accountName === "noProxy")!.ready).toBe(false);
    expect(accounts.some((a) => a.accountName === "twitterOne")).toBe(false);
  });
});

describe("rules 15 and 18: the device and the local hours", () => {
  const NIGHT = () => new Date("2026-10-18T02:00:00Z"); // 03:00 in Galway
  const DAY = () => new Date("2026-10-18T10:00:00Z");
  const DEVICE = {
    version: 1,
    createdAt: "2026-10-18T10:00:00+00:00",
    os: "windows",
    camoufoxVersion: "0.5.5",
    browserVersion: "152.0.4-beta.30",
    config: { "navigator.userAgent": "ua", "canvas:seed": 7 },
    firefoxUserPrefs: {},
    geolocation: { latitude: 53.28, longitude: -9.06, accuracy: 420, source: "geoLite2City" },
    home: { city: "Galway", country: "IE", timezone: "Europe/Dublin" },
  };

  async function runAt(argv: string[], now: () => Date, worker: WorkerClient, twenty = marketplaceFixture()) {
    await twenty.update("socialAccounts", "galwayOne", { activeHoursStart: null, activeHoursEnd: null });
    const out: string[] = [];
    const err: string[] = [];
    const code = await runCli(argv, { worker, twenty, now, out: (l) => out.push(l), err: (l) => err.push(l) });
    return { code, out: out.join("\n"), err: err.join("\n"), twenty };
  }

  test("scan at 03:00 Galway time is refused with the local time; no worker starts", async () => {
    let started = 0;
    const worker = (async () => {
      started++;
      return SCAN;
    }) as WorkerClient;
    const result = await runAt(["facebook", "scan", "--account", "galwayOne"], NIGHT, worker);
    expect(result.code).toBe(1);
    expect(result.err).toContain("outsideActiveHours");
    expect(result.err).toContain("it is 03:00 in Galway (Europe/Dublin)");
    expect(started).toBe(0);
  });

  test("scan --bypass at 03:00 runs anyway (rule 18 skipped, the proxy gate still in the worker)", async () => {
    let started = 0;
    const worker = (async () => {
      started++;
      return SCAN;
    }) as WorkerClient;
    const result = await runAt(["facebook", "scan", "--account", "galwayOne", "--bypass"], NIGHT, worker);
    expect(result.err).not.toContain("outsideActiveHours");
    expect(started).toBe(1);
  });

  test("the first launch's device is saved to Twenty once and never printed", async () => {
    const worker = (async (request: WorkerRequest) => {
      const file = JSON.parse(readFileSync(request.device_path!, "utf8"));
      expect(file).toMatchObject({ locale: "en-IE", languages: ["en-IE", "en"], homeTimezone: "Europe/Dublin", profile: null });
      // What python/browser/proxyGate.py does on a first launch.
      require("node:fs").writeFileSync(request.device_path!, JSON.stringify({ ...file, profile: DEVICE, created: true }));
      return SCAN;
    }) as WorkerClient;
    const result = await runAt(["facebook", "scan", "--account", "galwayOne", "--json"], DAY, worker);
    expect(result.code).toBe(0);
    expect(result.err).toContain("Pinned a new device for galwayOne");
    expect(result.out + result.err).not.toContain("canvas:seed");
    expect(result.twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.deviceProfile).toEqual(DEVICE);
    // --json stdout is still one JSON document.
    expect(() => JSON.parse(result.out)).not.toThrow();
  });

  test("an account that has a device keeps it: it goes to Python and is never overwritten", async () => {
    const twenty = marketplaceFixture();
    await twenty.update("socialAccounts", "galwayOne", { deviceProfile: DEVICE });
    const worker = (async (request: WorkerRequest) => {
      const file = JSON.parse(readFileSync(request.device_path!, "utf8"));
      expect(file.profile).toEqual(DEVICE);
      require("node:fs").writeFileSync(request.device_path!, JSON.stringify({ ...file, profile: { ...DEVICE, createdAt: "other" }, created: true }));
      return SCAN;
    }) as WorkerClient;
    const result = await runAt(["facebook", "scan", "--account", "galwayOne"], DAY, worker, twenty);
    expect(result.code).toBe(0);
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.deviceProfile).toEqual(DEVICE);
  });

  test("accounts --json and account show never include the device", async () => {
    const twenty = marketplaceFixture();
    await twenty.update("socialAccounts", "galwayOne", { deviceProfile: DEVICE, storageOrigins: [{ origin: "https://www.facebook.com", localStorage: [{ name: "k", value: "storedSecret" }] }] as never });
    for (const argv of [["accounts", "--json"], ["account", "show", "galwayOne", "--json"], ["account", "show", "galwayOne"]]) {
      const out: string[] = [];
      await runCli(argv, { twenty, out: (l) => out.push(l), err: () => {} });
      expect(out.join("\n")).not.toContain("canvas:seed");
      expect(out.join("\n")).not.toContain("secretPass");
    }
  });
});

describe("the session continues from run to run", () => {
  const origins = [{ origin: "https://www.facebook.com", localStorage: [{ name: "hb_timestamp", value: "1" }] }];

  test("scan saves the cookies and localStorage the browser left, and the next run starts from them", async () => {
    const twenty = marketplaceFixture();
    const fresh = [
      { name: "c_user", value: "1000", domain: ".facebook.com", path: "/" },
      { name: "xs", value: "rotated", domain: ".facebook.com", path: "/" },
    ];
    const worker = (async (request: WorkerRequest) => {
      require("node:fs").writeFileSync(request.storage_state_path!, JSON.stringify({ cookies: fresh, origins }));
      return SCAN;
    }) as WorkerClient;
    const err: string[] = [];
    expect(await runCli(["facebook", "scan", "--account", "galwayOne"], { worker, twenty, out: () => {}, err: (l) => err.push(l) })).toBe(0);
    const row = twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!;
    expect(row.cookies).toEqual(fresh);
    expect(row.storageOrigins).toEqual(origins);
    expect(err.join("\n")).toContain("Saved galwayOne's browser session (2 cookies, 1 origin(s))");
    expect(err.join("\n")).not.toContain("rotated");

    // The next run's state file carries both.
    let seen: unknown = null;
    const next = (async (request: WorkerRequest) => {
      seen = JSON.parse(readFileSync(request.storage_state_path!, "utf8"));
      return SCAN;
    }) as WorkerClient;
    await runCli(["facebook", "scan", "--account", "galwayOne"], { worker: next, twenty, out: () => {}, err: () => {} });
    expect(seen).toEqual({ cookies: fresh, origins });
  });

  test("a logged-out jar never replaces the stored session", async () => {
    const twenty = marketplaceFixture();
    const worker = (async (request: WorkerRequest) => {
      require("node:fs").writeFileSync(request.storage_state_path!, JSON.stringify({ cookies: [{ name: "datr", value: "x", domain: ".facebook.com", path: "/" }], origins: [] }));
      return SCAN;
    }) as WorkerClient;
    await runCli(["facebook", "scan", "--account", "galwayOne"], { worker, twenty, out: () => {}, err: () => {} });
    expect(twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!.cookies).toEqual(FIXTURE_COOKIES);
  });
});
