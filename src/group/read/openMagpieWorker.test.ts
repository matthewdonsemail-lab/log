import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseWorkerRequest, recordsOf, scrollsFor, workerCodeOf } from "./index.ts";
import type { GroupPost } from "./index.ts";

const GROUP = "4191018610937243";

/** A post as a read saw it, invented values. */
const post = (id: string, createdAt: string, text: string, commentCount: number | null = 0): GroupPost => ({
  postId: id,
  groupId: GROUP,
  createdTime: Date.parse(createdAt) / 1000,
  createdAt,
  author: { id: `u${id}`, name: `Author ${id}`, url: "" },
  text,
  permalink: `https://www.facebook.com/groups/${GROUP}/posts/${id}/`,
  feedbackId: `fb${id}`,
  commentCount,
});

describe("OpenMagpie's facebook_group worker contract", () => {
  test("takes groups.search with its group ids, terms and limit; refuses anything else", () => {
    expect(parseWorkerRequest(JSON.stringify({ action: "groups.search", account_id: "openmagpie", cookies: [{ name: "c_user", value: "x" }], proxy: "p", params: { group_ids: [GROUP, ` ${GROUP} `], terms: [" trash ", ""], limit: 5 } }))).toEqual({ groupIds: [GROUP], terms: ["trash"], limit: 5 });
    expect(parseWorkerRequest(JSON.stringify({ action: "groups.search", params: { group_ids: [GROUP] } }))).toEqual({ groupIds: [GROUP], terms: [], limit: 20 });
    expect(parseWorkerRequest(JSON.stringify({ action: "groups.search", params: { group_ids: [GROUP], limit: 1000 } }))).toMatchObject({ limit: 100 });
    expect(parseWorkerRequest("{")).toMatchObject({ code: "bad_request" });
    expect(parseWorkerRequest(JSON.stringify({ action: "posts.like", params: {} }))).toMatchObject({ code: "unsupported_action" });
    expect(parseWorkerRequest(JSON.stringify({ action: "groups.search", params: { group_ids: [] } }))).toMatchObject({ code: "bad_request" });
    expect(parseWorkerRequest(JSON.stringify({ action: "groups.search", params: { group_ids: ["recommendationsOfBethlehem"] } }))).toMatchObject({ code: "bad_request" });
  });

  test("answers with the posts the poll's read saw, in from_record's shape, only those matching a term", () => {
    const posts = [post("1", "2026-10-21T21:05:00.000Z", "Trash company recommendations?", 16), post("2", "2026-10-21T22:28:00.000Z", ""), post("3", "2026-10-21T21:07:00.000Z", "Fresh mozzarella")];
    const all = recordsOf(posts, [], 20);
    expect(all.map((r) => r.external_id)).toEqual(["2", "3", "1"]);
    expect(all[2]).toEqual({
      record_id: "1",
      external_id: "1",
      group_id: GROUP,
      content: "Trash company recommendations?",
      url: `https://www.facebook.com/groups/${GROUP}/posts/1/`,
      author: { name: "Author 1", id: "u1", url: "" },
      occurred_at: "2026-10-21T21:05:00.000Z",
      metrics: { likes: null, comments: 16, shares: null },
      matched_terms: [],
    });
    expect(recordsOf(posts, ["TRASH", "pizza"], 20).map((r) => [r.external_id, r.matched_terms])).toEqual([["1", ["TRASH"]]]);
    expect(recordsOf(posts, [], 1).map((r) => r.external_id)).toEqual(["2"]);
  });

  test("a checkpoint, a login wall or a video selfie is auth_required; the rest keep log-cli's code", () => {
    expect(["checkpointed", "loginWall", "videoSelfieRequired"].map(workerCodeOf)).toEqual(["auth_required", "auth_required", "auth_required"]);
    expect(workerCodeOf("outsideActiveHours")).toBe("outsideActiveHours");
  });

  test("about three posts a scroll, from 1 to 6", () => {
    expect([1, 3, 4, 20, 100].map(scrollsFor)).toEqual([1, 1, 2, 6, 6]);
  });
});

describe("python/openMagpie/facebookWorker.py", () => {
  // A stand-in for bin/log.ts that answers with the arguments it was given, so nothing reaches Twenty or a browser.
  const entry = join(mkdtempSync(join(tmpdir(), "logWorkerEntry")), "fakeLog.ts");
  writeFileSync(entry, 'console.error("a progress line"); console.log(JSON.stringify({ ok: true, result: { results: [], errors: [], args: process.argv.slice(2) }, new_cookies: [] }));\n');
  const python = process.env.LOG_PYTHON || "python";

  function worker(stdin: string) {
    const proc = Bun.spawnSync([python, join(import.meta.dir, "..", "..", "..", "python", "openMagpie", "facebookWorker.py")], { stdin: Buffer.from(stdin), env: { ...process.env, LOG_BUN: process.execPath, LOG_WORKER_ENTRY: entry } });
    return { code: proc.exitCode, out: JSON.parse(proc.stdout.toString().trim()), err: proc.stderr.toString() };
  }

  test("passes only the action and params on: OpenMagpie's cookies, proxy and account never reach log-cli", () => {
    const { code, out, err } = worker(JSON.stringify({ account_id: "openmagpie", action: "groups.search", cookies: [{ name: "xs", value: "secret" }], proxy: "http://u:p@h:1", params: { group_ids: [GROUP], terms: [], limit: 20 } }));
    expect(code).toBe(0);
    expect(out.result.args.slice(0, 3)).toEqual(["facebook", "poll", "--request"]);
    expect(JSON.parse(out.result.args[3])).toEqual({ action: "groups.search", params: { group_ids: [GROUP], terms: [], limit: 20 } });
    expect(JSON.stringify(out)).not.toContain("secret");
    expect(err).toContain("a progress line");
  }, 30_000);

  test("a request that isn't JSON is answered, not crashed on", () => {
    const { code, out } = worker("not json");
    expect(code).toBe(1);
    expect(out).toEqual({ ok: false, code: "bad_request", error: "the request is not a JSON object" });
  }, 30_000);
});
