import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearCurrentInspect, writeCurrentInspect } from "../../browser/inspect/index.ts";
import type { InspectAction, InspectStepResult } from "../../browser/inspect/index.ts";
import { readJoinOptions } from "../../group/join/index.ts";
import { recordedAfterJoin, recordedGroupPage, recordedJoinHar } from "../../group/join/join.test.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";
import { joinDeps, parseJoinArgs } from "./index.ts";

process.env.LOG_INSPECT_CURRENT = join(mkdtempSync(join(tmpdir(), "logJoinCurrent")), "current.json");

const real = { prompts: joinDeps.prompts, tty: joinDeps.tty };
afterEach(() => {
  Object.assign(joinDeps, real);
  clearCurrentInspect(undefined, "galwayOne");
});
beforeEach(() => {
  joinDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
});

const GROUP = "https://www.facebook.com/groups/4191018610937243/";

function openBrowser() {
  writeCurrentInspect({ account: "galwayOne", runDir: "/runs/inspect/galwayOne", commandsPath: "/c", repliesPath: "/r", startedAt: "2026-10-20T10:00:00.000Z" });
}

async function run(argv: string[], replies: InspectStepResult[] = [], twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const sent: { action: InspectAction; args: string[] }[] = [];
  const sendInspect = async (_current: unknown, action: InspectAction, args: string[]) => {
    sent.push({ action, args });
    return replies.shift() ?? null;
  };
  const code = await runCli(argv, { twenty, sendInspect, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), sent, twenty };
}

describe("parseJoinArgs", () => {
  test("takes group, --account, --group, --live, --show", () => {
    expect(parseJoinArgs(["group", "--account", "galwayOne", "--group", "123"])).toEqual({ ok: true, target: "group", account: "galwayOne", group: "123", live: false, show: false, answer: false, agree: false, fill: false, submit: false, bypass: false, json: false });
    expect(parseJoinArgs(["group", "--live"])).toMatchObject({ ok: true, live: true });
    expect(parseJoinArgs(["group", "--live", "--show"])).toMatchObject({ ok: false });
    expect(parseJoinArgs(["group", "--live", "--answer"])).toMatchObject({ ok: false });
    expect(parseJoinArgs([])).toMatchObject({ ok: false });
    expect(parseJoinArgs(["page"])).toMatchObject({ ok: false });
    expect(parseJoinArgs(["group", "--nope"])).toMatchObject({ ok: false });
  });
});

describe("log join group", () => {
  test("never launches a browser: without the account's open one it is refused", async () => {
    const { code, err, sent } = await run(["join", "group", "--account", "galwayOne", "--group", GROUP]);
    expect(code).toBe(1);
    expect(err).toContain("groupBrowserNotOpen");
    expect(sent).toEqual([]);
  });

  test("a dry run in the open browser reads the gate, clicks nothing, and patches joinSubmission per step", async () => {
    openBrowser();
    const { code, out, err, sent, twenty } = await run(["join", "group", "--account", "galwayOne", "--group", GROUP], [recordedGroupPage() as InspectStepResult]);
    expect(code).toBe(0);
    expect(sent.map((s) => s.action)).toEqual(["goto"]);
    expect(out).toContain("dry run, nothing clicked");
    expect(err).toContain("joinSubmission idle");
    const row = twenty.rows.agencyGroups[0];
    expect(row).toMatchObject({ socialAccountId: "galwayOne", facebookGroupId: "4191018610937243", joinStatus: "NOT_MEMBER", membersLabel: "17.3K members" });
    expect((row.joinSubmission as { history: unknown[] }).history).toHaveLength(1);
  });

  test("--live as on Bethlehem: a member, the Participant questions dialog kept in joinSubmission and read back by --show", async () => {
    openBrowser();
    // The step folder the session wrote, with its snapshot.yml (the CLI reads it whole).
    const folder = mkdtempSync(join(tmpdir(), "logJoinStep"));
    writeFileSync(join(folder, "snapshot.yml"), recordedAfterJoin);
    const asked = { ok: true, url: GROUP, interactive: [], folder } as InspectStepResult;
    const live = await run(["join", "group", "--account", "galwayOne", "--group", GROUP, "--live"], [recordedGroupPage() as InspectStepResult, { ok: true, url: GROUP }, asked]);
    expect(live.code).toBe(0);
    expect(live.sent.map((s) => s.action)).toEqual(["goto", "clickRole", "snapshot"]);
    expect(live.out).toContain('the group then asked "Participant questions"');
    const shown = await run(["join", "group", "--account", "galwayOne", "--group", "4191018610937243", "--show"], [], live.twenty);
    expect(shown.code).toBe(0);
    expect(shown.sent).toEqual([]);
    expect(shown.out).toContain("member");
    expect(shown.out).toContain('dialog "Participant questions"');
    expect(shown.out).toContain("to agree: I agree to the group rules");
    expect(shown.out).toContain("rule 1. Be kind and courteous");
    expect(shown.out).toContain("Submit disabled");
  });

  test("a bad --group is refused before anything", async () => {
    const { code, err } = await run(["join", "group", "--account", "galwayOne", "--group", "https://example.com/x"]);
    expect(code).toBe(1);
    expect(err).toContain("groupRefInvalid");
  });

  test("never prompts without a terminal", async () => {
    const { code, err } = await run(["join", "group", "--account", "galwayOne"]);
    expect(code).toBe(1);
    expect(err).toContain("--account and --group are both needed");
  });

  test("Clack asks for what is missing", async () => {
    joinDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    const asked: string[] = [];
    joinDeps.prompts = {
      intro: () => {},
      outro: () => {},
      cancel: () => {},
      select: async (option) => {
        asked.push(option.message);
        return option.options[0].value;
      },
      text: async (option) => {
        asked.push(option.message);
        return GROUP;
      },
      multiselect: async () => [],
      confirm: async () => false,
      note: () => {},
    };
    const { code } = await run(["join", "group", "--show"]);
    expect(code).toBe(0);
    expect(asked).toEqual(["Which account joins?", "Which group? (its URL or id)"]);
  });

  test("--answer: the Clack stepper over a private group's recorded questions, saved to Twenty as the draft, nothing sent", async () => {
    // The --live join first, as Complainers of Bethlehem answered it (its click HAR, cut).
    openBrowser();
    const folder = mkdtempSync(join(tmpdir(), "logJoinClick"));
    const click = { ok: true, url: GROUP, folder } as InspectStepResult;
    const twenty = marketplaceFixture();
    const joined = await run(["join", "group", "--account", "galwayOne", "--group", GROUP, "--live"], [recordedGroupPage() as InspectStepResult, click, { ok: true, url: GROUP } as InspectStepResult], twenty);
    expect(joined.code).toBe(0);
    // The click HAR is read by the CLI from the step folder: write the recorded one there and patch it in as a run would.
    const row = twenty.rows.agencyGroups[0] as unknown as { joinSubmission: Record<string, unknown> };
    row.joinSubmission = { ...row.joinSubmission, options: readJoinOptions(recordedJoinHar("complainersOfBethlehem")) };

    joinDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    const asked: string[] = [];
    joinDeps.prompts = {
      intro: () => {},
      outro: (m) => void asked.push(`outro ${m}`),
      cancel: () => {},
      select: async () => "",
      note: (_m, title) => void asked.push(`note ${title}`),
      multiselect: async (option) => {
        asked.push(`multiselect ${option.options.map((o) => o.label).join("/")}`);
        return ["2345806655660910"];
      },
      text: async (option) => {
        asked.push(`text ${option.message}`);
        return "Parking on Main Street";
      },
      confirm: async (option) => {
        asked.push(`confirm ${option.message}`);
        return true;
      },
    };
    const answered = await run(["join", "group", "--account", "galwayOne", "--group", "4191018610937243", "--answer"], [], twenty);
    expect(answered.code).toBe(0);
    expect(answered.sent).toEqual([]);
    expect(asked).toEqual([
      "note What the group asks",
      "multiselect Yes/No",
      "text 2/2 (membership) What is a general complaint you have about Bethlehem?",
      "note Group rules from the admins",
      "confirm I agree to the group rules",
      "outro Saved to Twenty. Not sent to Facebook.",
    ]);
    const saved = (twenty.rows.agencyGroups[0] as unknown as { joinSubmission: { formPhase: string; draft: { answers: Record<string, unknown>; rulesAgreed: boolean } } }).joinSubmission;
    expect(saved.formPhase).toBe("incomplete");
    expect(saved.draft).toMatchObject({ answers: { "2345806658994243": ["2345806655660910"], "2345807182327524": "Parking on Main Street" }, rulesAgreed: true });
    expect(answered.out).toContain("→ Yes");
  });

  test("--answer without join options says how to get them", async () => {
    const { code, err } = await run(["join", "group", "--account", "galwayOne", "--group", GROUP, "--answer"]);
    expect(code).toBe(1);
    expect(err).toContain("--live join");
  });

  test("outside the account's hours a step in the browser is refused, even with the browser open (rule 18); --bypass runs it (rule 20)", async () => {
    openBrowser();
    const twenty = marketplaceFixture();
    const row = twenty.rows.socialAccounts.find((r) => r.id === "galwayOne")!;
    Object.assign(row, { activeHoursStart: 8, activeHoursEnd: 22 });
    // 23:30 in Galway (IE, UTC+1 in October): outside 08:00-22:00.
    const late = () => new Date("2026-10-20T22:30:00Z");
    const refused = await runCli(["join", "group", "--account", "galwayOne", "--group", GROUP], { twenty, now: late, sendInspect: async () => null, out: () => {}, err: () => {} });
    expect(refused).toBe(1);
    const err: string[] = [];
    const sent: string[] = [];
    const code = await runCli(["join", "group", "--account", "galwayOne", "--group", GROUP, "--bypass"], {
      twenty,
      now: late,
      sendInspect: async (_c, action) => (sent.push(action), recordedGroupPage() as InspectStepResult),
      out: () => {},
      err: (l) => err.push(l),
    });
    expect(code).toBe(0);
    expect(sent).toEqual(["goto"]);
    expect(err.join("\n")).toContain("--bypass: the waking-hours gate is skipped for this run only");
    // --show only reads Twenty: never gated.
    expect(await runCli(["join", "group", "--account", "galwayOne", "--group", GROUP, "--show"], { twenty, now: late, out: () => {}, err: () => {} })).toBe(0);
  });

  test("an unknown account is refused", async () => {
    const { code, err } = await run(["join", "group", "--account", "nobody", "--group", GROUP]);
    expect(code).toBe(1);
    expect(err).toContain("accountNotFound");
  });
});
