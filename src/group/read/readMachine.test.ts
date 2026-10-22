import { describe, expect, test } from "bun:test";
import { createActor, fromPromise, toPromise } from "xstate";
import { createMemoryTwenty } from "../../twenty/graphql/helpers/memoryTwenty.ts";
import { commentTargets, COMMENT_QUERIES, FEED_QUERY, groupReadMachine, NEWEST_COMMENTS, readStateOf, saveRead } from "./index.ts";
import type { GroupPost, GroupReadInput, GroupReadOutput, ReadStepInput, ReadStepReply } from "./index.ts";

const GROUP = "4191018610937243";
const T = 1_792_500_000;

/** A feed unit in the recorded shape (run 20261020T143506), invented values. */
export function unit(postId: string, created: number, comments: number | null = 0) {
  return {
    __typename: "Story",
    post_id: postId,
    creation_time: created,
    comet_sections: {
      content: {
        story: {
          post_id: postId,
          actors: [{ id: `u${postId}`, name: `Author ${postId}`, url: `https://www.facebook.com/u${postId}` }],
          target_group: { id: GROUP },
          message: { text: `Post ${postId}` },
          wwwURL: `https://www.facebook.com/groups/${GROUP}/posts/${postId}/`,
          feedback: { id: `fb${postId}` },
        },
      },
      ...(comments === null ? {} : { feedback: { story: { story_ufi_container: { story: { feedback_context: { feedback_target_with_context: { comment_rendering_instance: { comments: { total_count: comments } } } } } } } } }),
    },
  };
}

/** A comment node in the recorded shape (run 20261020T151100), invented values. */
export function comment(postId: string, commentId: string, created: number) {
  return {
    __typename: "Comment",
    legacy_fbid: commentId,
    id: Buffer.from(`comment:${postId}_${commentId}`).toString("base64"),
    created_time: created,
    depth: 0,
    author: { id: `c${commentId}`, name: `Commenter ${commentId}`, url: "" },
    body: { text: `Comment ${commentId}` },
    group_comment_info: { group: { id: GROUP }, is_author_anonymous: false },
    feedback: { id: `cfb${commentId}`, url: `https://www.facebook.com/groups/${GROUP}/posts/${postId}/?comment_id=${commentId}`, replies_fields: { total_count: 0 } },
  };
}

const html = (data: unknown) => `<html><script type="application/json">${JSON.stringify({ require: [[{ __bbox: { result: { data } } }]] })}</script></html>`;
const documentEntry = (text: string) => ({ request: { method: "GET", url: "https://www.facebook.com/" }, response: { content: { mimeType: "text/html; charset=utf-8", text } } });
const queryEntry = (name: string, text: string) => ({ request: { postData: { params: [{ name: "fb_api_req_friendly_name", value: name }] } }, response: { content: { text } } });

/** The group page: the first post in its HTML. */
export const groupPage = (units: unknown[]) => ({ ok: true, url: `https://www.facebook.com/groups/${GROUP}/`, har: { log: { entries: [documentEntry(html({ group: { id: GROUP, group_feed: { edges: units.map((node) => ({ node })) } } }))] } } });
/** A scroll: one feed answer, its units under edges and page_info deferred last. */
export const feedScroll = (units: unknown[], hasNextPage: boolean) => ({
  ok: true,
  url: `https://www.facebook.com/groups/${GROUP}/`,
  har: { log: { entries: [queryEntry(FEED_QUERY, [JSON.stringify({ data: { node: { group_feed: { edges: units.map((node) => ({ node })) } } } }), JSON.stringify({ data: { page_info: { end_cursor: "C", has_next_page: hasNextPage } } })].join("\n"))] } },
});
/** A post's page: its first comments in its HTML. */
export const postPage = (nodes: unknown[]) => ({ ok: true, url: `https://www.facebook.com/groups/${GROUP}/permalink/x/`, har: { log: { entries: [documentEntry(html({ node: { comments: { edges: nodes.map((node) => ({ node })), page_info: { has_next_page: true } } } }))] } } });
/** A comment query's answer. */
export const commentAnswer = (nodes: unknown[], hasNextPage: boolean) => ({ ok: true, url: `https://www.facebook.com/groups/${GROUP}/permalink/x/`, har: { log: { entries: [queryEntry(COMMENT_QUERIES[2], JSON.stringify({ data: { node: { comments: { edges: nodes.map((node) => ({ node })), page_info: { has_next_page: hasNextPage } } } } }))] } } });

const input = (over: Partial<GroupReadInput> = {}): GroupReadInput => ({
  account: "bethlehem",
  group: { key: GROUP, url: `https://www.facebook.com/groups/${GROUP}/`, facebookGroupId: null },
  cursor: { lastPostId: null, watermark: null, idsAtWatermark: [] },
  commentsRead: {},
  maxScrolls: 5,
  maxCommentPosts: 5,
  live: false,
  ...over,
});

/** Runs the machine with scripted replies, one per step, in order; returns the output and the steps it sent. */
async function run(replies: ReadStepReply[], over: Partial<GroupReadInput> = {}): Promise<{ output: GroupReadOutput; sent: ReadStepInput[] }> {
  const sent: ReadStepInput[] = [];
  const machine = groupReadMachine.provide({
    actors: {
      step: fromPromise<ReadStepReply, ReadStepInput>(async ({ input: step }) => {
        sent.push(step);
        const reply = replies.shift();
        if (!reply) throw new Error(`no scripted reply for ${step.action} ${step.args.join(" ")}`);
        return reply;
      }),
    },
  });
  const output = await toPromise(createActor(machine, { input: input(over) }).start());
  return { output, sent };
}

describe("group read machine", () => {
  test("a first read: the page's posts, scrolls to the feed's end, then the comments of the post that has some", async () => {
    const { output, sent } = await run([
      groupPage([unit("4", T + 40)]),
      feedScroll([unit("3", T + 30, 2), unit("2", T + 20)], true),
      feedScroll([unit("1", T + 10)], false),
      postPage([comment("3", "31", T + 31)]),
      commentAnswer([comment("3", "32", T + 32)], false),
    ]);
    expect(sent.map((s) => s.action)).toEqual(["goto", "scroll", "scroll", "goto", "scrollIn"]);
    expect(sent[3]!.args[0]).toBe(`https://www.facebook.com/groups/${GROUP}/permalink/3/`);
    expect(sent[4]!.args.slice(0, 2)).toEqual(["dialog", "Author 3's post"]);
    expect(output.result).toBe("read");
    expect(output.groupId).toBe(GROUP);
    expect(output.posts.map((p) => p.postId)).toEqual(["4", "3", "2", "1"]);
    expect(output.comments.map((c) => c.commentId)).toEqual(["31", "32"]);
    expect(output.commentReads).toEqual([{ postId: "3", commentCount: 2, comments: 2, problem: null }]);
    expect(output.cursor).toEqual({ lastPostId: "4", watermark: T + 40, idsAtWatermark: ["4"] });
    expect(output.feedDone).toBe(true);
    // Nothing clicked without --live (rule 8).
    expect(sent.some((s) => s.action === "clickRole")).toBe(false);
  });

  test("stops scrolling once the last read's posts show, and keeps only what is newer", async () => {
    const { output, sent } = await run([groupPage([unit("4", T + 40)]), feedScroll([unit("3", T + 30), unit("2", T + 20)], true)], {
      cursor: { lastPostId: "3", watermark: T + 30, idsAtWatermark: ["3"] },
    });
    expect(sent.map((s) => s.action)).toEqual(["goto", "scroll"]);
    expect(output.reachedCursor).toBe(true);
    expect(output.gap).toBe(false);
    expect(output.posts.map((p) => p.postId)).toEqual(["4"]);
    expect(output.seen.map((p) => p.postId)).toEqual(["4", "3", "2"]);
  });

  test("says when the scrolls ran out before the last read's posts showed", async () => {
    const { output } = await run([groupPage([unit("9", T + 90)]), feedScroll([unit("8", T + 80)], true)], { maxScrolls: 1, cursor: { lastPostId: "3", watermark: T + 30, idsAtWatermark: ["3"] } });
    expect(output.gap).toBe(true);
    expect(output.posts.map((p) => p.postId)).toEqual(["9", "8"]);
  });

  test("a checkpoint on a scroll stops the read and leaves the cursor where it was", async () => {
    const cursor = { lastPostId: "1", watermark: T + 10, idsAtWatermark: ["1"] };
    const { output } = await run([groupPage([unit("4", T + 40)]), { ok: true, url: "https://www.facebook.com/checkpoint/1501092823525282/" }], { cursor });
    expect(output.result).toBe("stopped");
    expect(output.problem?.code).toBe("checkpointed");
    expect(output.feedDone).toBe(false);
    expect(output.cursor).toEqual(cursor);
  });

  test("--live sorts each post's comments to Newest, and a post whose comments fail doesn't stop the read", async () => {
    const { output, sent } = await run(
      [
        groupPage([unit("5", T + 50, 1), unit("4", T + 40, 3)]),
        feedScroll([], false),
        postPage([comment("5", "51", T + 51)]),
        { ok: true, url: "x" },
        commentAnswer([comment("5", "51", T + 51)], false),
        { ok: false, error: "no dialog \"Author 5's post\"", url: "x" },
        postPage([comment("4", "41", T + 41)]),
        { ok: true, url: "x" },
        commentAnswer([comment("4", "42", T + 42), comment("4", "43", T + 43)], false),
        commentAnswer([], false),
      ],
      { live: true },
    );
    expect(sent.filter((s) => s.action === "clickRole").map((s) => s.args[1])).toEqual(["Most relevant", NEWEST_COMMENTS, "Most relevant", NEWEST_COMMENTS]);
    expect(output.result).toBe("read");
    expect(output.commentReads.map((r) => [r.postId, r.comments, r.problem !== null])).toEqual([
      ["5", 1, true],
      ["4", 3, false],
    ]);
  });

  test("a post is opened only when its comments grew since they were last read", () => {
    const post = (postId: string, commentCount: number | null) => ({ postId, commentCount }) as GroupPost;
    const seen = [post("4", 2), post("3", 5), post("2", 0), post("1", null)];
    expect(commentTargets(seen, [post("1", null)], { "4": 2, "3": 4 }, 5).map((p) => p.postId)).toEqual(["3", "1"]);
    expect(commentTargets(seen, [], {}, 1).map((p) => p.postId)).toEqual(["4"]);
  });
});

describe("group read in Twenty", () => {
  test("saves the posts, then the comments, then moves the cursor; a second save adds nothing", async () => {
    const twenty = createMemoryTwenty({ agencyGroups: [{ id: "g1", facebookGroupId: GROUP }] });
    const { output } = await run([groupPage([unit("4", T + 40, 1)]), feedScroll([unit("3", T + 30)], false), postPage([comment("4", "41", T + 41)]), commentAnswer([], false)]);
    const now = new Date("2026-10-22T10:00:00Z");
    expect(await saveRead(twenty, "g1", output, "read", now)).toEqual({ postsAdded: 2, postsUpdated: 0, commentsAdded: 1, commentsUpdated: 0, cursorMoved: true });
    expect(twenty.rows.agencyGroupPosts!.map((r) => [r.facebookPostId, r.agencyGroupId, r.commentsReadCount ?? null])).toEqual([
      ["3", "g1", null],
      ["4", "g1", 1],
    ]);
    expect(twenty.rows.agencyGroupComments!.map((r) => [r.facebookCommentId, r.agencyGroupPostId])).toEqual([["41", twenty.rows.agencyGroupPosts![1]!.id]]);
    expect(twenty.rows.agencyGroups![0]!.readCursor).toEqual({ lastPostId: "4", watermark: T + 40, idsAtWatermark: ["4"] });

    const state = await readStateOf(twenty, "g1");
    expect(state).toEqual({ cursor: { lastPostId: "4", watermark: T + 40, idsAtWatermark: ["4"] }, commentsRead: { "4": 1 } });
    expect(await saveRead(twenty, "g1", output, "read", now)).toEqual({ postsAdded: 0, postsUpdated: 0, commentsAdded: 0, commentsUpdated: 0, cursorMoved: true });
  });

  test("a read stopped before its feed settled saves what it saw and leaves the cursor", async () => {
    const twenty = createMemoryTwenty({ agencyGroups: [{ id: "g1", facebookGroupId: GROUP, readCursor: { lastPostId: "1", watermark: T + 10, idsAtWatermark: ["1"] } }] });
    const { output } = await run([groupPage([unit("4", T + 40)]), { ok: true, url: "https://www.facebook.com/login/" }], { cursor: { lastPostId: "1", watermark: T + 10, idsAtWatermark: ["1"] } });
    const saved = await saveRead(twenty, "g1", output, "stopped", new Date());
    expect(saved.postsAdded).toBe(1);
    expect(saved.cursorMoved).toBe(false);
    expect(twenty.rows.agencyGroups![0]!.readCursor).toEqual({ lastPostId: "1", watermark: T + 10, idsAtWatermark: ["1"] });
  });
});
