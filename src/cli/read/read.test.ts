import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearCurrentInspect, writeCurrentInspect } from "../../browser/inspect/index.ts";
import type { InspectAction, InspectStepResult } from "../../browser/inspect/index.ts";
import { comment, commentAnswer, feedScroll, groupPage, postPage, unit } from "../../facebook/group/read/readMachine.test.ts";
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
    expect(parseReadArgs(["group", "--account", "a", "--group", "1"])).toEqual({ ok: true, target: "group", account: "a", group: "1", scrolls: DEFAULT_SCROLLS, commentPosts: DEFAULT_COMMENT_POSTS, live: false, show: false, bypass: false, json: false });
    expect(parseReadArgs(["group", "--scrolls", "2", "--commentPosts", "0"])).toMatchObject({ ok: true, scrolls: 2, commentPosts: 0 });
    expect(parseReadArgs(["group", "--scrolls", "x"])).toMatchObject({ ok: false });
    expect(parseReadArgs(["group", "--live", "--show"])).toMatchObject({ ok: false });
    expect(parseReadArgs(["page"])).toMatchObject({ ok: false });
  });
});

describe("log facebook read group", () => {
  test("never launches a browser: without the account's open one it is refused", async () => {
    const { code, err, sent } = await run(["facebook", "read", "group", "--account", "galwayOne", "--group", GROUP]);
    expect(code).toBe(1);
    expect(err).toContain("groupBrowserNotOpen");
    expect(sent).toEqual([]);
  });

  test("reads the new posts and comments in the open browser, keeps only the cursor in Twenty, and a second read finds nothing new", async () => {
    writeCurrentInspect({ account: "galwayOne", runDir: "/runs/inspect/galwayOne", commandsPath: "/c", repliesPath: "/r", startedAt: "2026-10-22T10:00:00.000Z" });
    const replies = () => [step(groupPage([unit("2", T + 20, 1)])), step(feedScroll([unit("1", T + 10)], false)), step(postPage([comment("2", "21", T + 21)])), step(commentAnswer([], false))];
    const first = await run(["facebook", "read", "group", "--account", "galwayOne", "--group", GROUP], replies());
    expect(first.code).toBe(0);
    expect(first.sent.map((s) => s.action)).toEqual(["goto", "scroll", "goto", "scrollIn"]);
    expect(first.out).toContain("2 new post(s) of 2");
    expect(first.out).toContain("comments on 2: 1 of 1");
    expect(first.out).toContain("Twenty: the cursor moved; no post or comment is saved there (rule 65)");
    expect(first.err).toContain("a first read");
    const twenty = first.twenty;
    expect(twenty.rows.agencyGroupPosts).toBeUndefined();
    expect(twenty.rows.agencyGroups![0]).toMatchObject({ facebookGroupId: GROUP_ID, readCursor: { lastPostId: "2", watermark: T + 20 } });

    // The same feed again: the cursor is reached on the page itself, nothing is new, so no post is opened for its comments.
    const second = await run(["facebook", "read", "group", "--account", "galwayOne", "--group", GROUP], [step(groupPage([unit("2", T + 20, 1), unit("1", T + 10)]))], twenty);
    expect(second.code).toBe(0);
    expect(second.sent.map((s) => s.action)).toEqual(["goto"]);
    expect(second.out).toContain("0 new post(s) of 2");
    expect(twenty.rows.agencyGroupComments).toBeUndefined();

    const shown = await run(["facebook", "read", "group", "--account", "galwayOne", "--group", GROUP, "--show"], [], twenty);
    expect(shown.out).toContain("Cursor: newest post 2");
    expect(shown.out).toContain("2 post id(s) already seen");
    expect(shown.sent).toEqual([]);
  });

  test("--worker became its own command: log facebook poll --request", async () => {
    const result = await run(["facebook", "read", "group", "--worker", "{}"]);
    expect(result.code).toBe(1);
    expect(result.err).toContain("--worker became its own command: log facebook poll --request <request json>");
  });
});
