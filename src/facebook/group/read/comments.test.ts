import { describe, expect, test } from "bun:test";
import { COMMENT_QUERIES, commentIdsOf, commentOf, commentResponses, commentsFromPostPage, commentsFromResponse } from "./index.ts";

const GROUP = "4191018610937243";
const POST = "29139998268945932";
const relay = (commentId: string) => Buffer.from(`comment:${POST}_${commentId}`).toString("base64");

function comment(commentId: string, created: number | undefined, options: { group?: string | null; parent?: string; depth?: number; text?: string; replies?: unknown[]; anonymous?: boolean } = {}) {
  const { group = GROUP, parent, depth = parent ? 1 : 0, text = "I can do it, sent you a message", replies = [], anonymous = false } = options;
  return {
    __typename: "Comment",
    id: relay(commentId),
    legacy_fbid: commentId,
    depth,
    body: { text, ranges: [] },
    author: { __typename: "User", id: `u${commentId}`, name: "Pat Example", url: `https://www.facebook.com/u${commentId}` },
    ...(created === undefined ? {} : { created_time: created }),
    ...(group === null ? {} : { group_comment_info: { group: { id: group, __typename: "Group" }, is_author_anonymous: anonymous } }),
    comment_direct_parent: parent ? { id: relay(parent), author: { id: "u0", name: "Pat Example" } } : null,
    feedback: {
      id: `fb${commentId}`,
      url: `https://www.facebook.com/groups/${GROUP}/posts/${POST}/?comment_id=${parent ?? commentId}${parent ? `&reply_comment_id=${commentId}` : ""}`,
      replies_fields: { count: replies.length, total_count: replies.length },
      parent_object_ent: { __typename: "Comment", id: relay(commentId), feedback: { id: `fb${commentId}` } },
      replies_connection: { edges: replies.map((node) => ({ node })), page_info: { end_cursor: null, has_next_page: false } },
    },
  };
}

function answer(nodes: unknown[], endCursor: string | null = "NEXT", hasNextPage = true): string {
  const data = { node: { comment_rendering_instance_for_feed_location: { comments: { edges: nodes.map((node) => ({ node })), page_info: { end_cursor: endCursor, has_next_page: hasNextPage } } } } };
  return `for (;;);${JSON.stringify({ data, extensions: {} })}`;
}

describe("group read: comments", () => {
  test("a comment's relay id carries its post", () => {
    expect(commentIdsOf(relay("701"))).toEqual({ postId: POST, commentId: "701" });
    expect(commentIdsOf("not base64 of a comment")).toBeNull();
  });

  test("every comment and reply of an answer, each with its post, parent, author, text and link, and the list's paging", () => {
    const reply = comment("702", 1_792_500_100, { parent: "701", text: "How much?" });
    const page = commentsFromResponse(answer([comment("701", 1_792_500_000, { replies: [reply] }), comment("703", 1_792_499_000, { anonymous: true, text: "" })]), GROUP);
    expect(page.comments.map((c) => c.commentId)).toEqual(["701", "702", "703"]);
    expect(page.comments[1]).toEqual({
      commentId: "702",
      postId: POST,
      groupId: GROUP,
      parentCommentId: "701",
      depth: 1,
      createdTime: 1_792_500_100,
      createdAt: new Date(1_792_500_100 * 1000).toISOString(),
      author: { id: "u702", name: "Pat Example", url: "https://www.facebook.com/u702", anonymous: false },
      text: "How much?",
      permalink: `https://www.facebook.com/groups/${GROUP}/posts/${POST}/?comment_id=701&reply_comment_id=702`,
      feedbackId: "fb702",
      replyCount: 0,
    });
    expect(page.comments[0]).toMatchObject({ parentCommentId: null, depth: 0, replyCount: 1 });
    expect(page.comments[2]?.author.anonymous).toBe(true);
    expect(page).toMatchObject({ endCursor: "NEXT", hasNextPage: true, rejected: {} });
  });

  test("a comment without its id's post, its group or its time, or from another group, is counted and dropped", () => {
    const noPost = { ...comment("804", 4), id: "Zm9v" };
    const page = commentsFromResponse(answer([comment("801", 1), comment("802", 2, { group: null }), comment("803", 3, { group: "999" }), noPost, comment("805", undefined)], null, false), GROUP);
    expect(page.comments.map((c) => c.commentId)).toEqual(["801"]);
    expect(page.rejected).toEqual({ missingGroup: 1, wrongGroup: 1, missingPost: 1, missingCreationTime: 1 });
    expect(commentOf({ __typename: "Comment", id: relay("806") }, GROUP)).toBe("missingCommentId");
    expect(page).toMatchObject({ endCursor: null, hasNextPage: false });
  });

  test("the first comments in a post page's own HTML", () => {
    const block = (result: unknown) => `<script type="application/json" data-sjs>${JSON.stringify({ require: [["ScheduledServerJS", "handle", null, [{ __bbox: { require: [["RelayPrefetchedStreamCache", "next", [], ["adp_1", { __bbox: { complete: true, result } }]]] } }]]] })}</script>`;
    const html = `<html>${block(JSON.parse(answer([comment("901", 10), comment("902", 9)]).slice(9)))}<script type="application/json">{</script></html>`;
    expect(commentsFromPostPage(html, GROUP).comments.map((c) => c.commentId)).toEqual(["901", "902"]);
  });

  test("the comment answers of a recorded step, by the three queries' names", () => {
    const entry = (name: string, text: string) => ({ request: { postData: { params: [{ name: "fb_api_req_friendly_name", value: name }] } }, response: { content: { text } } });
    const har = { log: { entries: [entry("CometHovercardQueryRendererQuery", "x"), ...COMMENT_QUERIES.map((q, i) => entry(q, `c${i}`))] } };
    expect(commentResponses(har)).toEqual(["c0", "c1", "c2"]);
  });
});
