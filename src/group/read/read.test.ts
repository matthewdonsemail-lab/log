import { describe, expect, test } from "bun:test";
import { FEED_QUERY, feedResponses, newPosts, postOf, postsFromFeedResponse, postsFromGroupPage } from "./index.ts";

const GROUP = "4191018610937243";

/** A feed unit in the recorded shape (run 20261020T134155), invented values. */
function unit(postId: string, created: number | undefined, group: string | null = GROUP, text = "Anyone know a good junk removal company?") {
  return {
    __typename: "Story",
    post_id: postId,
    ...(created === undefined ? {} : { creation_time: created }),
    comet_sections: {
      content: {
        story: {
          post_id: postId,
          actors: [{ __typename: "User", id: `u${postId}`, name: "Pat Example", url: `https://www.facebook.com/u${postId}` }],
          ...(group === null ? {} : { target_group: { id: group } }),
          message: { __typename: "TextWithEntities", text },
          wwwURL: `https://www.facebook.com/groups/${GROUP}/posts/${postId}/`,
          feedback: { id: `fb${postId}` },
        },
      },
    },
  };
}

/** A streamed response: the first unit under edges, the rest as $stream chunks, page_info deferred last. */
function response(units: unknown[], endCursor = "CURSOR2", hasNextPage = true): string {
  const [first, ...rest] = units;
  const lines = [
    { data: { node: { __typename: "Group", group_feed: { edges: [{ node: first, cursor: "c0" }] } } }, extensions: {} },
    ...rest.map((node, i) => ({ label: "GroupsCometFeedRegularStories_paginationGroup$stream$GroupsCometFeedRegularStories_group_group_feed", path: ["node", "group_feed", "edges", i + 1], data: { node, cursor: `c${i + 1}` }, extensions: {} })),
    { label: "GroupsCometFeedRegularStories_paginationGroup$defer$GroupsCometFeedRegularStories_group_group_feed$page_info", path: ["node", "group_feed"], data: { page_info: { end_cursor: endCursor, has_next_page: hasNextPage } }, extensions: {} },
  ];
  return lines.map((l) => JSON.stringify(l)).join("\n");
}

describe("group read: posts from the feed query", () => {
  test("every post of a streamed response, with its author, text, permalink and feedback id, and the page's cursor", () => {
    const page = postsFromFeedResponse(response([unit("101", 1_792_500_000), unit("102", 1_792_499_000), unit("103", 1_792_498_000)]), GROUP);
    expect(page.posts.map((p) => p.postId)).toEqual(["101", "102", "103"]);
    expect(page.posts[0]).toEqual({
      postId: "101",
      groupId: GROUP,
      createdTime: 1_792_500_000,
      createdAt: new Date(1_792_500_000 * 1000).toISOString(),
      author: { id: "u101", name: "Pat Example", url: "https://www.facebook.com/u101" },
      text: "Anyone know a good junk removal company?",
      permalink: `https://www.facebook.com/groups/${GROUP}/posts/101/`,
      feedbackId: "fb101",
    });
    expect(page).toMatchObject({ endCursor: "CURSOR2", hasNextPage: true, rejected: {} });
  });

  test("a post without its id, group or time, or from another group, is counted and dropped, never filled in", () => {
    const page = postsFromFeedResponse(response([unit("201", 1), unit("", 2), unit("203", 3, null), unit("204", 4, "999"), unit("205", undefined)]), GROUP);
    expect(page.posts.map((p) => p.postId)).toEqual(["201"]);
    expect(page.rejected).toEqual({ missingPostId: 1, missingGroup: 1, wrongGroup: 1, missingCreationTime: 1 });
    expect(postOf(unit("206", undefined), GROUP)).toBe("missingCreationTime");
  });

  test("a post seen twice in one response is kept once; a line cut short is skipped, the rest still read", () => {
    const text = response([unit("301", 5), unit("301", 5), unit("302", 4)]) + "\n{\"data\": {\"node\"";
    expect(postsFromFeedResponse(`for (;;);${text}`, GROUP).posts.map((p) => p.postId)).toEqual(["301", "302"]);
  });

  test("the first posts, from the group page's own HTML: the feed under data.group, the header unit skipped, not rejected", () => {
    const bbox = (result: unknown) => `<script type="application/json" data-sjs>${JSON.stringify({ require: [["ScheduledServerJS", "handle", null, [{ __bbox: { require: [["RelayPrefetchedStreamCache", "next", [], ["adp_CometGroupDiscussionRootSuccessQueryRelayPreloader_1", { __bbox: { complete: false, result } }]]] } }]]] })}</script>`;
    const header = { __typename: "GroupsSectionHeaderUnit", title: { text: "New posts" }, target_group: { id: GROUP } };
    const html = [
      "<html><body>",
      bbox({ data: { group: { id: GROUP, group_feed: { edges: [{ node: header, cursor: "h" }] } } }, extensions: {} }),
      `<script type="application/json" data-sjs>not json</script>`,
      bbox({ label: "GroupsCometFeedRegularStories_paginationGroup$stream$GroupsCometFeedRegularStories_group_group_feed", path: ["group", "group_feed", "edges", 1], data: { node: unit("501", 900), cursor: "c1" } }),
      bbox({ label: "GroupsCometFeedRegularStories_paginationGroup$defer$GroupsCometFeedRegularStories_group_group_feed$page_info", path: ["group", "group_feed"], data: { page_info: { end_cursor: "PAGE1", has_next_page: true } } }),
      "</body></html>",
    ].join("");
    const page = postsFromGroupPage(html, GROUP);
    expect(page.posts.map((p) => p.postId)).toEqual(["501"]);
    expect(page).toMatchObject({ rejected: {}, skipped: { GroupsSectionHeaderUnit: 1 }, endCursor: "PAGE1", hasNextPage: true });
  });

  test("the feed responses of a recorded step, by the query's name", () => {
    const entry = (name: string, text: string) => ({ request: { postData: { params: [{ name: "fb_api_req_friendly_name", value: name }] } }, response: { content: { text } } });
    const har = { log: { entries: [entry("CometHovercardQueryRendererQuery", "x"), entry(FEED_QUERY, "feed1"), { request: { postData: { text: `fb_api_req_friendly_name=${FEED_QUERY}&doc_id=1` } }, response: { content: { text: "feed2" } } }] } };
    expect(feedResponses(har)).toEqual(["feed1", "feed2"]);
  });
});

describe("group read: the cursor (facebook-camofox-client's listen.py)", () => {
  const posts = postsFromFeedResponse(response([unit("401", 300), unit("402", 200), unit("403", 100)]), GROUP).posts;

  test("a first read keeps everything, newest first, and the cursor moves to the newest", () => {
    expect(newPosts(posts, { lastPostId: null, watermark: null })).toEqual({ posts: [posts[0], posts[1], posts[2]], cursor: { lastPostId: "401", watermark: 300, idsAtWatermark: ["401"] } });
  });

  test("posts that share the watermark's second are each read once, never lost", () => {
    const same = postsFromFeedResponse(response([unit("601", 500), unit("602", 500), unit("603", 400)]), GROUP).posts;
    const first = newPosts(same.filter((p) => p.postId !== "602"), { lastPostId: null, watermark: null });
    expect(first.cursor).toEqual({ lastPostId: "601", watermark: 500, idsAtWatermark: ["601"] });
    const later = newPosts(same, first.cursor);
    expect(later.posts.map((p) => p.postId)).toEqual(["602"]);
    expect(later.cursor.idsAtWatermark).toEqual(["601", "602"]);
    expect(newPosts(same, later.cursor).posts).toEqual([]);
  });

  test("a later read keeps only what is newer; with nothing new the cursor stays", () => {
    expect(newPosts(posts, { lastPostId: "402", watermark: 200 }).posts.map((p) => p.postId)).toEqual(["401"]);
    expect(newPosts(posts, { lastPostId: "401", watermark: 300 })).toEqual({ posts: [], cursor: { lastPostId: "401", watermark: 300 } });
  });
});
