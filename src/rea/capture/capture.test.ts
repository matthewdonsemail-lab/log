import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseSteps, settleInBackground, settleRunCapture, splitHarBySteps, stepSlug } from "./index";
import { runCapture } from "../../cli/capture/index.ts";
import type { ReaRunner } from "./index";

const entry = (url: string, at: string) => ({ startedDateTime: at, request: { method: "GET", url }, response: { status: 200, content: { mimeType: "text/html", text: "" } } });
const HAR = {
  log: {
    version: "1.2",
    entries: [
      entry("https://www.facebook.com/marketplace/selling/", "2026-10-19T07:28:31.000Z"),
      entry("https://www.facebook.com/login/device-based/regular/login/", "2026-10-19T07:28:46.000Z"),
      entry("https://www.facebook.com/api/graphql/", "2026-10-19T07:28:47.000Z"),
      entry("https://www.facebook.com/checkpoint/", "2026-10-19T07:28:55.000Z"),
    ],
  },
};
const STEPS = [
  { at: "2026-10-19T07:28:30.000Z", step: "Waiting up to 600s for a logged-in Facebook page." },
  { at: "2026-10-19T07:28:40.000Z", step: "Auto-login: typing the email (try 1)." },
  { at: "2026-10-19T07:28:45.000Z", step: "Auto-login: submitting (Enter)." },
  { at: "2026-10-19T07:28:54.000Z", step: "Auto-login: typing the authenticator code (try 1)." },
];

describe("splitHarBySteps", () => {
  test("each request goes to the step it happened in; quiet steps are left out", () => {
    const parts = splitHarBySteps(HAR, STEPS);
    expect(parts.map((p) => [p.name, p.entries])).toEqual([
      ["01_waitingUpTo600sFor", 1],
      ["03_autoLoginSubmittingEnter", 2],
      ["04_autoLoginTypingTheAuthenticator", 1],
    ]);
    expect((parts[1].har as typeof HAR).log.version).toBe("1.2");
    expect((parts[1].har as typeof HAR).log.entries[0]).toEqual(HAR.log.entries[1]);
  });

  test("no steps, or not a HAR, gives nothing", () => {
    expect(splitHarBySteps(HAR, [])).toEqual([]);
    expect(splitHarBySteps({}, STEPS)).toEqual([]);
  });

  test("parseSteps sorts by time and skips a half-written line", () => {
    const text = `${JSON.stringify(STEPS[1])}\n${JSON.stringify(STEPS[0])}\n{"at":"2026-10-19T07:2`;
    expect(parseSteps(text).map((s) => s.step)).toEqual([STEPS[0].step, STEPS[1].step]);
  });

  test("a step's report lines are not steps: the requests after them stay the step's", () => {
    const line = (at: string, step: string) => JSON.stringify({ at: `2026-10-20T14:36:${at}Z`, step });
    const text = [
      line("04.322", "step 3: scroll 2 x 700px"),
      line("05.935", "  scroll: +700px in 16 wheel steps, 766 ms"),
      line("16.179", "  mouse: 4 flick, 3 wander; 4 idle drift move(s)"),
      line("16.189", "  now on https://www.facebook.com/groups/1/ \"Group\" after 11875 ms; 121 request(s)"),
      line("16.195", "    POST 200 GroupsCometFeedRegularStoriesPaginationQuery (1346 ms)"),
      line("19.563", "  rea read the step: exit 0, ev_1"),
      line("19.567", "  page has 810 interactive element(s), 40 new since the last step; snapshot: C:/runs/x"),
      line("23.494", "step 4: scroll 2 x 700px"),
    ].join("\n");
    expect(parseSteps(text).map((s) => s.step)).toEqual(["step 3: scroll 2 x 700px", "  scroll: +700px in 16 wheel steps, 766 ms", "step 4: scroll 2 x 700px"]);
  });

  test("stepSlug is camelCase and drops the [Ns] prefix", () => {
    expect(stepSlug("[12s] Page: https://www.facebook.com/marketplace/selling/ | dialog open")).toBe("pageHttpsWwwFacebookCom");
    expect(stepSlug("Logged in.")).toBe("loggedIn");
  });
});

describe("settleRunCapture", () => {
  test("reads the whole session, then writes and reads one HAR per step", async () => {
    const dir = mkdtempSync(join(tmpdir(), "logCapture"));
    try {
      writeFileSync(join(dir, "session.har"), JSON.stringify(HAR));
      writeFileSync(join(dir, "steps.jsonl"), STEPS.map((s) => JSON.stringify(s)).join("\n"));
      const calls: string[] = [];
      const runner: ReaRunner = async (args) => {
        calls.push(args[1].split(/[\\/]/).pop()!);
        return { code: 0, stdout: "{}", stderr: "" };
      };
      const note = await settleRunCapture(dir, runner);
      expect(note).toContain("4 requests");
      expect(note).toContain("3 step HARs read by rea");
      expect(calls).toEqual(["session.har", "01_waitingUpTo600sFor.har", "03_autoLoginSubmittingEnter.har", "04_autoLoginTypingTheAuthenticator.har"]);
      const index = JSON.parse(readFileSync(join(dir, "steps", "index.json"), "utf8")).steps;
      expect(index[1]).toMatchObject({ index: 3, step: STEPS[2].step, entries: 2, reaExit: 0 });
      expect(existsSync(join(dir, "steps", "03_autoLoginSubmittingEnter.rea.json"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("no HAR (the browser never opened) is nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "logCapture"));
    try {
      expect(await settleRunCapture(dir, async () => ({ code: 0, stdout: "", stderr: "" }))).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("the gate makes the HAR mandatory (python/browser/proxyGate.py)", () => {
  test("no capture folder refuses the context; one is injected, a caller's kept, more contexts numbered", () => {
    const dir = mkdtempSync(join(tmpdir(), "logGate"));
    try {
      const script = [
        "import sys, json; sys.path.insert(0, 'python'); from browser import proxyGate as g",
        "g._armed.update({'timezone': 'America/New_York', 'geolocation': {'latitude': 1, 'longitude': 2}})",
        "out = {}",
        "try:\n    g._force_context({})\n    out['bare'] = 'opened'\nexcept g.GateError as e:\n    out['bare'] = e.code",
        `g._armed['captureDir'] = ${JSON.stringify(dir)}`,
        "a = {}; g._force_context(a); out['injected'] = [a['recordHarPath'].replace('\\\\', '/').split('/')[-1], a['recordHarContent'], a['recordHarMode']]",
        "open(a['recordHarPath'], 'w').write('{}')",
        "b = {}; g._force_context(b); out['second'] = b['recordHarPath'].replace('\\\\', '/').split('/')[-1]",
        "c = {'recordHarPath': 'mine.har'}; g._force_context(c); out['caller'] = c['recordHarPath']",
        "g.log('Auto-login: typing the email (try 1).')",
        "print(json.dumps(out))",
      ].join("\n");
      const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8" });
      expect(JSON.parse(run.stdout.trim())).toEqual({
        bare: "captureMissing",
        injected: ["session.har", "embed", "full"],
        second: "session2.har",
        caller: "mine.har",
      });
      const step = JSON.parse(readFileSync(join(dir, "steps.jsonl"), "utf8").trim());
      expect(step.step).toBe("Auto-login: typing the email (try 1).");
      expect(Number.isNaN(Date.parse(step.at))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("settleInBackground", () => {
  test("a run returns without waiting on rea; with nothing captured nothing starts", async () => {
    const dir = mkdtempSync(join(tmpdir(), "logSettle"));
    try {
      expect(settleInBackground(dir)).toBeNull();
      const result = await runCapture(["--settle", dir], async () => ({ code: 0, stdout: "", stderr: "" }));
      expect(result.code).toBe(0);
      expect(JSON.parse(readFileSync(join(dir, "settle.json"), "utf8"))).toMatchObject({ note: null });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

