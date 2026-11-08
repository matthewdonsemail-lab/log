import { describe, expect, test } from "bun:test";
import { RedditLoginError } from "../../../vendor/reverseChud/src/index.ts";
import type { RedditClient, RedditFeedPost } from "../../../vendor/reverseChud/src/index.ts";
import { transportProblems } from "../../../scripts/checks/checkReverseChudTransport.ts";
import { linksOf, postOf, refusalOf, runRedditBridge } from "./index.ts";
import type { RedditBridgeDeps, RedditBridgeRequest } from "./index.ts";

const NOW = Date.UTC(2026, 10, 8);
const DAY = 86400;

function feedPost(id: string, daysAgo: number, body: string | null = null, bodyHtml: string | null = null): RedditFeedPost {
  return {
    author: `u${id}`,
    authorId: null,
    body,
    bodyHtml,
    commentCount: 2,
    contentHref: `/r/gtmengineering/comments/${id}/x/`,
    createdUtc: NOW / 1000 - daysAgo * DAY,
    domain: "self.gtmengineering",
    id: `t3_${id}`,
    permalink: `/r/gtmengineering/comments/${id}/x/`,
    score: 5,
    subredditId: null,
    subredditName: "gtmengineering",
    subredditPrefixedName: "r/gtmengineering",
    title: `post ${id}`,
  };
}

function fakeClient(pages: Array<RedditFeedPost[] | Error>, cookies: Record<string, string> = { reddit_session: "s" }): RedditClient {
  return {
    username: "acct",
    feeds: {
      getSubreddit: async () => ({
        pages: async function* () {
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (page instanceof Error) throw page;
            yield { posts: page, nextPageUrl: i < pages.length - 1 ? `next${i}` : null, requestUrl: "u" };
          }
        },
      }),
    },
    search: {
      communities: async () => ({
        collect: async () => [{ name: "gtmengineering", prefixedName: "r/gtmengineering", weeklyVisitors: 1200, weeklyContributions: 40, description: " GTM builders ", isNsfw: false, permalink: "/r/gtmengineering/" }],
      }),
    },
    posts: {
      get: async (url: string) => ({
        post: { ...feedPost("p", 1, "see https://github.com/x/y"), createdAt: "2026-11-07T00:00:00Z", upvoteRatio: 0.9, permalink: url.replace("https://www.reddit.com", "") },
        comments: { collect: async () => [COMMENT] },
      }),
      create: async (request: { subreddit: string; title: string }) => {
        writes.push(["create", request]);
        return { id: "t3_new", permalink: `/r/${request.subreddit}/comments/new/x/` };
      },
      reply: async (target: { id?: string; post?: { id: string } }, request: { text: string }) => {
        writes.push(["reply", target.id ?? target.post?.id, request.text]);
        return { ...COMMENT, id: "t1_mine", body: request.text, parentId: target.id ?? null };
      },
      vote: async (target: string, state: string) => {
        writes.push(["vote", target, state]);
      },
    },
    exportSession: () => ({ cookies: Object.entries(cookies).map(([name, value]) => ({ name, value })) }),
    close: async () => undefined,
  } as unknown as RedditClient;
}

const writes: unknown[][] = [];

const COMMENT = { id: "t1_c1", author: "someone", body: "nice repo", bodyHtml: null, createdAt: "2026-11-07T01:00:00Z", depth: 0, parentId: null, score: 3, permalink: "/r/gtmengineering/comments/p/x/c1/", postId: "t3_p" };

function deps(client: RedditClient | Error): RedditBridgeDeps {
  return {
    resume: async () => {
      if (client instanceof Error) throw client;
      return client;
    },
    sleep: async () => undefined,
    now: () => NOW,
  };
}

const BASE: RedditBridgeRequest = { action: "posts", account: "acct", cookies: { reddit_session: "s" }, subreddit: "r/gtmengineering", days: 7 };

describe("reddit bridge on reverseChud", () => {
  test("pages back to the cutoff and keeps every link", async () => {
    const answer = await runRedditBridge(BASE, deps(fakeClient([
      [feedPost("a", 1, "Repo: github.com/x/y", '<a href="https://github.com/x/y">repo</a>'), feedPost("b", 3)],
      [feedPost("c", 6), feedPost("d", 9)],
      [feedPost("e", 10)],
    ])));
    expect(answer.ok).toBe(true);
    expect(answer.pages).toBe(2);
    expect(answer.complete).toBe(true);
    const posts = answer.posts as Array<{ id: string; links: string[] }>;
    expect(posts.map((p) => p.id)).toEqual(["a", "b", "c"]);
    expect(posts[0].links).toEqual(["https://github.com/x/y"]);
  });

  test("a 429 mid-read keeps what was read and says what stopped it", async () => {
    const limited = Object.assign(new Error("rate limited"), { status: 429 });
    const answer = await runRedditBridge(BASE, deps(fakeClient([[feedPost("a", 1)], limited])));
    expect(answer.ok).toBe(true);
    expect(answer.complete).toBe(false);
    expect(answer.event).toBe("throttled");
    expect((answer.stoppedBy as { code: string }).code).toBe("rateLimited");
  });

  test("a session Reddit won't resume is sessionDead", async () => {
    const answer = await runRedditBridge({ ...BASE, action: "ping" }, deps(new RedditLoginError("no auth", "verification")));
    expect(answer).toMatchObject({ ok: false, code: "sessionDead", loginState: "loggedOut" });
  });

  test("ping answers the account and the cookies Reddit refreshed", async () => {
    const answer = await runRedditBridge({ ...BASE, action: "ping" }, deps(fakeClient([], { reddit_session: "new", token_v2: "t" })));
    expect(answer).toMatchObject({ ok: true, loginState: "loggedIn", screenName: "acct", refreshedCookies: { reddit_session: "new", token_v2: "t" } });
  });

  test("subreddits keep today's answer shape", async () => {
    const answer = await runRedditBridge({ ...BASE, action: "subreddits", query: "gtm engineering" }, deps(fakeClient([])));
    expect(answer.subreddits).toEqual([{ name: "gtmengineering", title: "r/gtmengineering", subscribers: 1200, activeUsers: 40, created: null, about: "GTM builders", over18: false, url: "https://www.reddit.com/r/gtmengineering/" }]);
  });

  test("refusals map to log's codes", () => {
    expect(refusalOf(Object.assign(new Error("x"), { status: 403 })).code).toBe("forbidden");
    expect(refusalOf(Object.assign(new Error("x"), { name: "RedditFeedChallengeRequiredError" })).code).toBe("challengeRequired");
    expect(refusalOf(new Error("socket reset")).code).toBe("networkDropped");
  });

  test("one post reads with its comments, ids kept for a reply", async () => {
    const answer = await runRedditBridge({ ...BASE, action: "post", url: "/r/gtmengineering/comments/p/x/" }, deps(fakeClient([])));
    expect(answer.ok).toBe(true);
    expect((answer.post as { links: string[]; upvoteRatio: number }).links).toEqual(["https://github.com/x/y"]);
    expect(answer.comments).toEqual([{ id: "t1_c1", author: "someone", created: Date.UTC(2026, 10, 7, 1) / 1000, depth: 0, parentId: null, score: 3, permalink: "https://www.reddit.com/r/gtmengineering/comments/p/x/c1/", text: "nice repo" }]);
  });

  test("post, reply and vote each call reverseChud once with what was asked", async () => {
    writes.length = 0;
    const made = await runRedditBridge({ ...BASE, action: "create", subreddit: "r/test", title: "hello" }, deps(fakeClient([])));
    expect(made.posted).toEqual({ id: "t3_new", permalink: "https://www.reddit.com/r/test/comments/new/x/", subreddit: "test", title: "hello" });
    const replied = await runRedditBridge({ ...BASE, action: "reply", url: "https://www.reddit.com/r/gtmengineering/comments/p/x/", commentId: "c1", text: "thanks" }, deps(fakeClient([])));
    expect(replied).toMatchObject({ ok: true, to: "t1_c1", replied: { id: "t1_mine", text: "thanks" } });
    const missing = await runRedditBridge({ ...BASE, action: "reply", url: "/r/gtmengineering/comments/p/x/", commentId: "t1_nope", text: "x" }, deps(fakeClient([])));
    expect(missing.code).toBe("commentNotFound");
    const voted = await runRedditBridge({ ...BASE, action: "vote", target: "t3_abc", direction: "none" }, deps(fakeClient([])));
    expect(voted.voted).toEqual({ target: "t3_abc", direction: "none" });
    expect(writes).toEqual([["create", { subreddit: "test", title: "hello" }], ["reply", "t1_c1", "thanks"], ["vote", "t3_abc", "none"]]);
  });

  test("the transport gate passes reverseChud as vendored and refuses a second network path", () => {
    const session = 'export const DEFAULT_REDDIT_BROWSER_PROFILE = "chrome_140" as const;\nimport { Session } from "wreq-js";';
    expect(transportProblems({ "session.ts": session, "feed.ts": "await session.fetch(url)" }, { "client.ts": 'import { RedditClient } from "../../../vendor/reverseChud/src/index.ts";' })).toEqual([]);
    expect(transportProblems({ "session.ts": session, "feed.ts": 'import https from "node:https";\nconst r = await fetch(url);' }, {})).toEqual([
      "vendor/reverseChud/src/feed.ts imports a network module of its own",
      "vendor/reverseChud/src/feed.ts calls the global fetch instead of its session",
    ]);
    expect(transportProblems({ "session.ts": "" }, { "client.ts": 'import { x } from "../../../vendor/reverseChud/src/feed.ts";' })).toEqual([
      "vendor/reverseChud/src/session.ts doesn't pin one browser profile",
      "src/reddit/engine/client.ts reaches into reverseChud past its index",
    ]);
  });

  test("links skip reddit permalinks and trailing punctuation", () => {
    expect(linksOf("see https://github.com/a/b. and https://www.reddit.com/r/x/comments/1/")).toEqual(["https://github.com/a/b", "https://www.reddit.com/r/x/comments/1/"]);
    expect(postOf(feedPost("z", 0, "https://github.com/a/b")).links).toEqual(["https://github.com/a/b"]);
  });
});
