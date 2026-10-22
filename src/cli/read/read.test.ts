import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearCurrentInspect, writeCurrentInspect } from "../../browser/inspect/index.ts";
import type { InspectAction, InspectStepResult } from "../../browser/inspect/index.ts";
import { comment, commentAnswer, feedScroll, groupPage, postPage, unit } from "../../group/read/readMachine.test.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";
import { DEFAULT_COMMENT_POSTS, DEFAULT_SCROLLS, parseReadArgs } from "./index.ts";

process.env.LOG_INSPECT_CURRENT = join(mkdtempSync(join(tmpdir(), "logReadCurrent")), "current.json");
afterEach(() => clearCurrentInspect(undefined, "galwayOne"));

const GROUP_ID = "4191018610937243";
const GROUP = `https://www.facebook.com/groups/${GROUP_ID}/`;
const T = 1_792_500_000;

/** A step as the open session answers it: its folder holds the step's network.har, which the command reads. */
function step(reply: { ok: boolean; url?: string; har?: unknown }): InspectStepResult {
  const folder = mkdtempSync(join(tmpdir(), "logReadStep"));
  if (reply.har) writeFileSync(join(folder, "network.har"), JSON.stringify(reply.har));
  return { ok: reply.ok, url: reply.url, folder };
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

describe("parseReadArgs", () => {
  test("takes group, --account, --group, --scrolls, --commentPosts, --live, --show", () => {
    expect(parseReadArgs(["group", "--account", "a", "--group", "1"])).toEqual({ ok: true, target: "group", account: "a", group: "1", scrolls: DEFAULT_SCROLLS, commentPosts: DEFAULT_COMMENT_POSTS, live: false, show: false, bypass: false, json: false, worker: null });
    expect(parseReadArgs(["group", "--scrolls", "2", "--commentPosts", "0"])).toMatchObject({ ok: true, scrolls: 2, commentPosts: 0 });
    expect(parseReadArgs(["group", "--scrolls", "x"])).toMatchObject({ ok: false });
    expect(parseReadArgs(["group", "--live", "--show"])).toMatchObject({ ok: false });
    expect(parseReadArgs(["page"])).toMatchObject({ ok: false });
  });
});

describe("log read group", () => {
  test("never launches a browser: without the account's open one it is refused", async () => {
    const { code, err, sent } = await run(["read", "group", "--account", "galwayOne", "--group", GROUP]);
    expect(code).toBe(1);
    expect(err).toContain("groupBrowserNotOpen");
    expect(sent).toEqual([]);
  });

  test("reads the new posts and comments in the open browser, saves them, and a second read adds nothing", async () => {
    writeCurrentInspect({ account: "galwayOne", runDir: "/runs/inspect/galwayOne", commandsPath: "/c", repliesPath: "/r", startedAt: "2026-10-22T10:00:00.000Z" });
    const replies = () => [step(groupPage([unit("2", T + 20, 1)])), step(feedScroll([unit("1", T + 10)], false)), step(postPage([comment("2", "21", T + 21)])), step(commentAnswer([], false))];
    const first = await run(["read", "group", "--account", "galwayOne", "--group", GROUP], replies());
    expect(first.code).toBe(0);
    expect(first.sent.map((s) => s.action)).toEqual(["goto", "scroll", "goto", "scrollIn"]);
    expect(first.out).toContain("2 new post(s) of 2");
    expect(first.out).toContain("2 post(s) added, 0 updated, 1 comment(s) added");
    expect(first.err).toContain("a first read");
    const twenty = first.twenty;
    expect(twenty.rows.agencyGroupPosts).toHaveLength(2);
    expect(twenty.rows.agencyGroups![0]).toMatchObject({ facebookGroupId: GROUP_ID, readCursor: { lastPostId: "2", watermark: T + 20 } });

    // The same feed again: the cursor is reached on the page itself, nothing is new, and post 2's comments didn't grow.
    const second = await run(["read", "group", "--account", "galwayOne", "--group", GROUP], [step(groupPage([unit("2", T + 20, 1), unit("1", T + 10)]))], twenty);
    expect(second.code).toBe(0);
    expect(second.sent.map((s) => s.action)).toEqual(["goto"]);
    expect(second.out).toContain("0 new post(s) of 2");
    expect(twenty.rows.agencyGroupPosts).toHaveLength(2);
    expect(twenty.rows.agencyGroupComments).toHaveLength(1);

    const shown = await run(["read", "group", "--account", "galwayOne", "--group", GROUP, "--show"], [], twenty);
    expect(shown.out).toContain("2 post(s) saved, 1 comment(s)");
    expect(shown.sent).toEqual([]);
  });

  test("--worker answers OpenMagpie's groups.search from the account in the group whose browser is open, posts only", async () => {
    writeCurrentInspect({ account: "galwayOne", runDir: "/runs/inspect/galwayOne", commandsPath: "/c", repliesPath: "/r", startedAt: "2026-10-22T10:00:00.000Z" });
    const twenty = marketplaceFixture();
    twenty.rows.agencyGroups = [{ id: "g1", name: "Recommendations of Bethlehem", socialAccountId: "galwayOne", facebookGroupId: GROUP_ID, groupUrl: GROUP, joinStatus: "MEMBER" }];
    const request = JSON.stringify({ action: "groups.search", params: { group_ids: [GROUP_ID], terms: ["trash"], limit: 3 } });
    const { code, out, err, sent } = await run(["read", "group", "--worker", request], [step(groupPage([unit("2", T + 20, 4), unit("1", T + 10)])), step(feedScroll([], false))], twenty);
    expect(code).toBe(0);
    // limit 3 → one scroll; no post is opened for its comments.
    expect(sent.map((s) => s.action)).toEqual(["goto", "scroll"]);
    const answer = JSON.parse(out);
    expect(answer.ok).toBe(true);
    expect(answer.result.errors).toEqual([]);
    expect(answer.result.results).toEqual([]);
    expect(err).toContain("OpenMagpie asks for 1 group(s), up to 3 post(s) each, matching trash");
    expect(twenty.rows.agencyGroupPosts).toHaveLength(2);

    // Without terms, both saved posts answer, newest first.
    const again = await run(["read", "group", "--worker", JSON.stringify({ action: "groups.search", params: { group_ids: [GROUP_ID] } })], [step(groupPage([unit("2", T + 20, 4), unit("1", T + 10)]))], twenty);
    expect(JSON.parse(again.out).result.results.map((r: { external_id: string; metrics: { comments: number | null } }) => [r.external_id, r.metrics.comments])).toEqual([
      ["2", 4],
      ["1", 0],
    ]);
  });

  test("--worker says why when no account can read the group, as OpenMagpie's error", async () => {
    const none = await run(["read", "group", "--worker", JSON.stringify({ action: "groups.search", params: { group_ids: [GROUP_ID] } })]);
    expect(JSON.parse(none.out)).toMatchObject({ ok: false, code: "groupNoAccount" });
    const twenty = marketplaceFixture();
    twenty.rows.agencyGroups = [{ id: "g1", socialAccountId: "galwayOne", facebookGroupId: GROUP_ID, joinStatus: "MEMBER" }];
    const closed = await run(["read", "group", "--worker", JSON.stringify({ action: "groups.search", params: { group_ids: [GROUP_ID] } })], [], twenty);
    expect(JSON.parse(closed.out)).toMatchObject({ ok: false, code: "groupBrowserNotOpen" });
    expect(closed.sent).toEqual([]);
    expect(parseReadArgs(["group", "--worker", "{}", "--live"])).toMatchObject({ ok: false });
  });
});
