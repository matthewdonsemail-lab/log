import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearCurrentInspect, writeCurrentInspect } from "../../browser/inspect/index.ts";
import type { InspectAction, InspectStepResult } from "../../browser/inspect/index.ts";
import { feedScroll, groupPage, unit } from "../../group/read/readMachine.test.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";
import { durationMs, parsePollArgs, POLL_EVERY_MS, pollDeps } from "./index.ts";

process.env.LOG_INSPECT_CURRENT = join(mkdtempSync(join(tmpdir(), "logPollCurrent")), "current.json");
const realSleep = pollDeps.sleep;
afterEach(() => {
  clearCurrentInspect(undefined, "galwayOne");
  pollDeps.sleep = realSleep;
});

const GROUP_ID = "4191018610937243";
const GROUP = `https://www.facebook.com/groups/${GROUP_ID}/`;
const T = 1_792_500_000;

/** A step as the open session answers it: its folder holds the step's network.har. */
function step(reply: { ok: boolean; url?: string; har?: unknown }): InspectStepResult {
  const folder = mkdtempSync(join(tmpdir(), "logPollStep"));
  if (reply.har) writeFileSync(join(folder, "network.har"), JSON.stringify(reply.har));
  return { ok: reply.ok, url: reply.url, folder };
}

async function run(argv: string[], replies: InspectStepResult[] = [], twenty = marketplaceFixture(), now?: () => Date) {
  const out: string[] = [];
  const err: string[] = [];
  const sent: { action: InspectAction; args: string[] }[] = [];
  const sendInspect = async (_current: unknown, action: InspectAction, args: string[]) => {
    sent.push({ action, args });
    return replies.shift() ?? null;
  };
  const code = await runCli(argv, { twenty, sendInspect, out: (l) => out.push(l), err: (l) => err.push(l), ...(now ? { now } : {}) });
  return { code, out, err: err.join("\n"), sent, twenty };
}

const openBrowser = () => writeCurrentInspect({ account: "galwayOne", runDir: "/runs/inspect/galwayOne", commandsPath: "/c", repliesPath: "/r", startedAt: "2026-10-22T10:00:00.000Z" });

describe("parsePollArgs", () => {
  test("<group> <account> [<how long to poll>], or --request alone", () => {
    expect(parsePollArgs([GROUP_ID, "galwayOne"])).toEqual({ ok: true, mode: "group", group: GROUP_ID, account: "galwayOne", forMs: null, bypass: false });
    expect(parsePollArgs([GROUP_ID, "galwayOne", "2h"])).toMatchObject({ ok: true, forMs: 2 * 3_600_000 });
    expect(parsePollArgs([GROUP_ID, "galwayOne", "soon"])).toMatchObject({ ok: false });
    expect(parsePollArgs([GROUP_ID])).toMatchObject({ ok: false });
    expect(parsePollArgs(["--request", "{}"])).toEqual({ ok: true, mode: "request", request: "{}" });
    expect(parsePollArgs(["--request", "{}", GROUP_ID])).toMatchObject({ ok: false });
    expect([durationMs("30s"), durationMs("45m"), durationMs("25h"), durationMs("0m")]).toEqual([30_000, 2_700_000, null, null]);
  });
});

describe("log facebook poll", () => {
  test("the platform comes first: log poll is refused with the form it became (rule 63)", async () => {
    const { code, err } = await run(["poll", GROUP_ID, "galwayOne"]);
    expect(code).toBe(1);
    expect(err).toContain(`the platform comes first (rule 63): log facebook poll ${GROUP_ID} galwayOne`);
  });

  test("never launches a browser: without the account's open one the poll answers why", async () => {
    const { code, out, sent } = await run(["facebook", "poll", GROUP, "galwayOne"]);
    expect(code).toBe(1);
    expect(JSON.parse(out[0]!)).toMatchObject({ ok: false, code: "groupBrowserNotOpen" });
    expect(sent).toEqual([]);
  });

  test("one poll reads the group in the open browser, posts only, and answers one JSON line of records", async () => {
    openBrowser();
    const { code, out, sent } = await run(["facebook", "poll", GROUP, "galwayOne"], [step(groupPage([unit("2", T + 20, 4), unit("1", T + 10)])), step(feedScroll([], false))]);
    expect(code).toBe(0);
    expect(sent.map((s) => s.action)).toEqual(["goto", "scroll"]);
    const answer = JSON.parse(out[0]!);
    expect(answer).toMatchObject({ ok: true, new_cookies: [] });
    expect(answer.result.results.map((r: { external_id: string; metrics: { comments: number } }) => [r.external_id, r.metrics.comments])).toEqual([
      ["2", 4],
      ["1", 0],
    ]);
  });

  test("with a time it polls every 5 minutes until the time is up, a line each", async () => {
    openBrowser();
    let clock = Date.parse("2026-10-22T14:00:00.000Z");
    pollDeps.sleep = async (ms) => {
      clock += ms;
    };
    const replies = [step(groupPage([unit("2", T + 20)])), step(feedScroll([], false)), step(groupPage([unit("3", T + 30), unit("2", T + 20)])), step(feedScroll([], false))];
    const { code, out, err } = await run(["facebook", "poll", GROUP, "galwayOne", "6m"], replies, marketplaceFixture(), () => new Date(clock));
    expect(code).toBe(0);
    expect(out).toHaveLength(2);
    expect(JSON.parse(out[1]!).result.results.map((r: { external_id: string }) => r.external_id)).toEqual(["3", "2"]);
    expect(err).toContain(`every ${POLL_EVERY_MS / 60_000} min`);
    expect(err).toContain("2 poll(s), done.");
  });

  test("--request answers OpenMagpie's groups.search from an account in the group with its browser open", async () => {
    openBrowser();
    const twenty = marketplaceFixture();
    twenty.rows.agencyGroups = [{ id: "g1", name: "Recommendations of Bethlehem", socialAccountId: "galwayOne", facebookGroupId: GROUP_ID, groupUrl: GROUP, joinStatus: "MEMBER" }];
    const request = JSON.stringify({ action: "groups.search", params: { group_ids: [GROUP_ID, "123"], terms: ["post 2"], limit: 3 } });
    const { code, out, sent } = await run(["facebook", "poll", "--request", request], [step(groupPage([unit("2", T + 20), unit("1", T + 10)])), step(feedScroll([], false))], twenty);
    expect(code).toBe(0);
    // limit 3 → one scroll; no post is opened for its comments.
    expect(sent.map((s) => s.action)).toEqual(["goto", "scroll"]);
    const answer = JSON.parse(out[0]!);
    expect(answer.result.results.map((r: { external_id: string; matched_terms: string[] }) => [r.external_id, r.matched_terms])).toEqual([["2", ["post 2"]]]);
    expect(answer.result.errors).toEqual([{ group_id: "123", code: "groupNoAccount", error: "no account in Twenty is in group 123: join it first (log facebook join group)" }]);
  });
});
