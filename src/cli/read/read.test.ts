import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearCurrentInspect, writeCurrentInspect } from "../../browser/inspect/index.ts";
import type { InspectAction, InspectStepResult } from "../../browser/inspect/index.ts";
import scrollOneHar from "../../facebook/group/members/fixtures/membersScrollOne.json";
import scrollTwoHar from "../../facebook/group/members/fixtures/membersScrollTwo.json";
import { membersGoto, membersScroll } from "../../facebook/group/members/membersMachine.test.ts";
import { comment, commentAnswer, feedScroll, groupPage, postPage, unit } from "../../facebook/group/read/readMachine.test.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";
import { DEFAULT_COMMENT_POSTS, DEFAULT_SCROLLS, parseReadArgs } from "./index.ts";

process.env.LOG_INSPECT_CURRENT = join(mkdtempSync(join(tmpdir(), "logReadCurrent")), "current.json");
afterEach(() => clearCurrentInspect(undefined, "galwayOne"));

const GROUP_ID = "4191018610937243";
const GROUP = `https://www.facebook.com/groups/${GROUP_ID}/`;
const T = 1_792_500_000;

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

  test("members takes --count, --secondsPerScroll (default 15), --maxScrolls, --owners, and refuses the group read's flags", () => {
    expect(parseReadArgs(["members", "--account", "a", "--group", "g", "--count", "30"])).toEqual({ ok: true, target: "members", account: "a", group: "g", count: 30, secondsPerScroll: 15, maxScrolls: null, owners: false, bypass: false, json: false });
    expect(parseReadArgs(["members", "--count", "30", "--secondsPerScroll", "10", "--maxScrolls", "4", "--owners", "--bypass"])).toMatchObject({ ok: true, secondsPerScroll: 10, maxScrolls: 4, owners: true, bypass: true });
    expect(parseReadArgs(["members", "--count", "0"])).toMatchObject({ ok: false });
    expect(parseReadArgs(["members", "--count", "30", "--secondsPerScroll", "x"])).toMatchObject({ ok: false });
    expect(parseReadArgs(["members", "--count", "30", "--live"])).toMatchObject({ ok: false, error: "--live is for read group, not read members" });
    expect(parseReadArgs(["group", "--count", "30"])).toMatchObject({ ok: false, error: "--count is for read members, not read group" });
  });
});

describe("log facebook read members", () => {
  test("reads the members in the open browser, never clicks, says the plan up front and writes the TSV and JSON", async () => {
    process.env.LOG_MEMBERS_DIR = mkdtempSync(join(tmpdir(), "logReadMembers"));
    writeCurrentInspect({ account: "galwayOne", runDir: "/runs/inspect/galwayOne", commandsPath: "/c", repliesPath: "/r", startedAt: "2026-10-22T10:00:00.000Z" });
    const replies = [step(membersGoto()), step(membersScroll(scrollOneHar)), step(membersScroll(scrollTwoHar))];
    const { code, out, err, sent } = await run(["facebook", "read", "members", "--account", "galwayOne", "--group", "junkremovalwinners", "--count", "30", "--secondsPerScroll", "0", "--bypass"], replies);
    expect(code).toBe(0);
    expect(sent).toEqual([{ action: "goto", args: ["https://www.facebook.com/groups/junkremovalwinners/members"] }, { action: "scroll", args: [] }, { action: "scroll", args: [] }]);
    expect(err).toContain("count 30 → ~1 scrolls, ~0 min at 0s per scroll");
    expect(out).toContain("30 member(s) of 30 asked, reached --count");
    expect(out).toMatch(/members 30, with a bio \d+, owners \d+ \(\d+ by bio, \d+ as a page only\), pages \d+/);
    const tsv = /kept all 30: (.+\.tsv)/.exec(out)![1]!;
    expect(readFileSync(tsv, "utf8").trim().split("\n")).toHaveLength(31);
  });

  test("--owners keeps only owners; --json gives them", async () => {
    process.env.LOG_MEMBERS_DIR = mkdtempSync(join(tmpdir(), "logReadMembers"));
    writeCurrentInspect({ account: "galwayOne", runDir: "/runs/inspect/galwayOne", commandsPath: "/c", repliesPath: "/r", startedAt: "2026-10-22T10:00:00.000Z" });
    const { code, out } = await run(["facebook", "read", "members", "--account", "galwayOne", "--group", "junkremovalwinners", "--count", "10", "--owners", "--bypass", "--json"], [step(membersGoto())]);
    expect(code).toBe(0);
    const json = JSON.parse(out);
    expect(json.owners).toBe(true);
    expect(json.summary.members).toBe(10);
    expect(json.members.length).toBe(json.summary.owners);
    expect(json.members.every((m: { bio: string; category: string | null }) => m.category || /owner|founder|ceo|president|proprietor|self-employed/i.test(m.bio))).toBe(true);
  });

  test("never launches a browser: without the account's open one it is refused", async () => {
    const { code, err, sent } = await run(["facebook", "read", "members", "--account", "galwayOne", "--group", "junkremovalwinners", "--count", "30", "--bypass"]);
    expect(code).toBe(1);
    expect(err).toContain("groupBrowserNotOpen");
    expect(sent).toEqual([]);
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
