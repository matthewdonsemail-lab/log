import { describe, expect, test } from "bun:test";

import {
  AuthenticatedRedditAuthenticationContext,
  parseRedditComments,
  parseRedditPost,
  RedditCommentCaptchaRequiredError,
  RedditPostClient,
  RedditPostCaptchaRequiredError,
  RedditPostCreateContractError,
  RedditPostCreateRequestError,
  RedditPostContractError,
  RedditPostFlairContractError,
  RedditPostFlairRequestError,
  RedditPostRequestError,
  RedditVoteContractError,
  RedditVoteRequestError,
  type RedditFetchInit,
  type RedditFetchTransport,
} from "../src";

const FIXTURE_URL = new URL("./fixtures/post.html", import.meta.url);
const SUBMIT_FIXTURE_URL = new URL(
  "./fixtures/post-submit.html",
  import.meta.url,
);
const FLAIRS_FIXTURE_URL = new URL(
  "./fixtures/post-flairs.json",
  import.meta.url,
);
const POST_URL = "https://www.reddit.com/r/typescript/comments/example/a_post/";
const MORE_URL =
  "https://www.reddit.com/svc/shreddit/more-comments/r/typescript/t3_example?top-level=1&comments-remaining=150&commentPositionOffset=2";

async function fixture(): Promise<string> {
  return Bun.file(FIXTURE_URL).text();
}

async function submitFixture(): Promise<string> {
  return Bun.file(SUBMIT_FIXTURE_URL).text();
}

async function flairsFixture(): Promise<string> {
  return Bun.file(FLAIRS_FIXTURE_URL).text();
}

describe("Shreddit posts and comments", () => {
  test("parses a post, flat comments, and both cursor kinds", async () => {
    const thread = parseRedditPost(await fixture(), POST_URL);

    expect(thread.post).toMatchObject({
      author: "poster",
      body: "Post body.",
      commentCount: 250,
      id: "t3_example",
      score: 42,
      title: "A post title",
      upvoteRatio: 0.95,
    });
    expect(thread.commentCaptcha).toEqual({
      type: "recaptcha-enterprise-v3",
      websiteUrl: POST_URL,
      websiteKey: "comment-site-key",
      pageAction: "comment_submit",
    });
    expect(thread.comments).toHaveLength(2);
    expect(thread.comments[0]).toMatchObject({
      author: "commenter",
      body: "Root comment.",
      depth: 0,
      id: "t1_root",
      moreRepliesCount: 12,
      moreRepliesUrl:
        "https://www.reddit.com/svc/shreddit/more-comments/r/typescript/t3_example?sort=CONFIDENCE&startingDepth=1&commentParentPositions=0",
      parentId: null,
      parentPositions: [],
    });
    expect(thread.comments[1]).toMatchObject({
      body: "Child reply.",
      depth: 1,
      id: "t1_child",
      parentId: "t1_root",
      parentPositions: [0],
    });
    expect(thread.nextCommentsPageUrl).toBe(MORE_URL);
  });

  test("requests post pages and opaque comment pages", async () => {
    const calls: Array<{ init: RedditFetchInit | undefined; url: string }> = [];
    const html = await fixture();
    const transport: RedditFetchTransport = {
      async fetch(input, init) {
        const url = new URL(input).href;
        calls.push({ init, url });
        return response(200, url, html);
      },
    };
    const client = new RedditPostClient(
      transport,
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    const thread = await client.get(POST_URL, { sort: "top" });
    const page = await client.getMoreComments(MORE_URL);

    expect(thread.comments.loaded).toHaveLength(2);
    expect(page.comments).toHaveLength(2);
    expect(calls).toEqual([
      {
        url: `${POST_URL}?sort=top`,
        init: {
          headers: { accept: "text/html", referer: "https://www.reddit.com/" },
        },
      },
      {
        url: MORE_URL,
        init: {
          method: "POST",
          headers: {
            accept: "text/vnd.reddit.partial+html",
            referer: "https://www.reddit.com/",
          },
        },
      },
    ]);
  });

  test("accepts post ids but rejects cross-origin cursors", async () => {
    const requested: string[] = [];
    const client = new RedditPostClient(
      {
        async fetch(input) {
          const url = new URL(input).href;
          requested.push(url);
          return response(200, url, await fixture());
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    await client.get("t3_example");
    expect(requested).toEqual(["https://www.reddit.com/comments/example/"]);
    expect(() =>
      client.getMoreComments(
        "https://example.com/svc/shreddit/more-comments/r/x/t3_x",
      ),
    ).toThrow("configured more-comments endpoint");
  });

  test("reports HTTP and changed post contracts", async () => {
    const failing = new RedditPostClient(
      {
        async fetch(input) {
          return response(429, new URL(input).href, "rate limited");
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    await expect(failing.get(POST_URL)).rejects.toBeInstanceOf(
      RedditPostRequestError,
    );
    expect(() => parseRedditPost("<main></main>", POST_URL)).toThrow(
      RedditPostContractError,
    );
  });

  test("parses standalone comment fragments", async () => {
    const page = parseRedditComments(await fixture(), MORE_URL);
    expect(page.comments.map(({ id }) => id)).toEqual(["t1_root", "t1_child"]);
    expect(page.nextPageUrl).toBe(MORE_URL);
  });

  test("hides cursors behind async comment and reply pagination", async () => {
    const html = await fixture();
    let partialRequests = 0;
    const client = new RedditPostClient(
      {
        async fetch(input, init) {
          const url = new URL(input).href;
          if (init?.method === "POST") partialRequests += 1;
          return response(200, url, html);
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );
    const thread = await client.get(POST_URL);

    const comments = await thread.comments.collect({ maxComments: 10 });
    expect(comments.map(({ id }) => id)).toEqual(["t1_root", "t1_child"]);
    expect(partialRequests).toBe(1);

    const root = thread.comments.loaded[0]!;
    const replies = await thread.comments
      .repliesOf(root)
      .collect({ maxComments: 10 });
    expect(replies.some(({ id }) => id === "t1_child")).toBe(true);
    expect(() => thread.comments.collect({ maxComments: 0 })).toThrow(
      "positive safe integer",
    );
  });

  test("discovers post flair ids and display text from the authenticated API", async () => {
    const requested: Array<{
      headers: Readonly<Record<string, string>>;
      url: string;
    }> = [];
    const client = new RedditPostClient(
      {
        async fetch(input, init) {
          const url = new URL(input).href;
          requested.push({ headers: init?.headers ?? {}, url });
          return response(200, url, await flairsFixture());
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    expect(await client.getFlairs("r/CharacterAIrunaways")).toEqual([
      {
        id: "9db8d3f2-7590-11ef-9354-3ada40f3344f",
        text: "C.AI complaint",
      },
      {
        id: "555d3a74-f007-11f0-bcf0-9e242efd211e",
        text: "Searching for Alternatives",
      },
      {
        id: "71336372-f007-11f0-a068-da335058ca6e",
        text: "Making a Recommendation",
      },
    ]);
    expect(requested).toEqual([
      {
        headers: {
          accept: "application/json",
          referer:
            "https://www.reddit.com/r/CharacterAIrunaways/submit/?type=TEXT",
        },
        url:
          "https://www.reddit.com/r/CharacterAIrunaways/api/link_flair_v2.json",
      },
    ]);
  });

  test("reports post-flair request and JSON contract errors", async () => {
    const client = (body: string, status = 200) =>
      new RedditPostClient(
        {
          async fetch(input) {
            return response(status, new URL(input).href, body);
          },
        },
        new AuthenticatedRedditAuthenticationContext("example"),
      );

    await expect(client("denied", 403).getFlairs("test")).rejects
      .toBeInstanceOf(RedditPostFlairRequestError);
    await expect(client("{}").getFlairs("test")).rejects
      .toBeInstanceOf(RedditPostFlairContractError);
  });

  test("creates text posts through the live Shreddit composer contract", async () => {
    const calls: Array<{
      body: Record<string, unknown> | null;
      headers: Readonly<Record<string, string>>;
      method: string | undefined;
      url: string;
    }> = [];
    const solved: Array<{
      action: string;
      key: string;
      proxy: string | undefined;
      url: string;
    }> = [];
    const cookies: Record<string, string> = { csrf_token: "csrf" };
    const transport = {
      async fetch(input: string | URL, init: RedditFetchInit = {}) {
        const url = new URL(input).href;
        calls.push({
          body: typeof init.body === "string"
            ? JSON.parse(init.body) as Record<string, unknown>
            : null,
          headers: init.headers ?? {},
          method: init.method,
          url,
        });
        if (url.endsWith("/svc/shreddit/graphql")) {
          return response(
            200,
            url,
            JSON.stringify({
              operation: "CreatePost",
              data: {
                createSubredditPost: {
                  ok: true,
                  errors: [],
                  fieldErrors: [],
                  post: {
                    id: "t3_created",
                    permalink: "/r/test/comments/created/sdk_post/",
                  },
                },
              },
            }),
          );
        }
        if (url.endsWith("/api/link_flair_v2.json")) {
          return response(200, url, await flairsFixture());
        }
        return response(200, url, await submitFixture());
      },
      getCookies() {
        return { ...cookies };
      },
      setCookie(name: string, value: string) {
        cookies[name] = value;
      },
    };
    const client = new RedditPostClient(
      transport,
      new AuthenticatedRedditAuthenticationContext("example"),
      {
        captchaSolver: {
          async solve(challenge, options) {
            solved.push({
              action: challenge.pageAction,
              key: challenge.websiteKey,
              proxy: options?.proxy,
              url: challenge.websiteUrl,
            });
            return {
              token: "post-captcha",
              userAgent: "solver-agent",
              cookies: { captcha_cookie: "applied" },
            };
          },
        },
        proxy: "proxy-user:proxy-pass@proxy.test:8000",
      },
    );

    const created = await client.create({
      subreddit: "r/test",
      title: " SDK contract test ",
      text: "First line\r\nSecond line",
      flair: "Searching for Alternatives",
      spoiler: true,
    });

    expect(created).toEqual({
      id: "t3_created",
      permalink: "/r/test/comments/created/sdk_post/",
    });
    expect(solved).toEqual([{
      action: "post_submit",
      key: "post-site-key",
      proxy: "http://proxy-user:proxy-pass@proxy.test:8000/",
      url: "https://www.reddit.com/r/test/submit/?type=TEXT",
    }]);
    expect(cookies.captcha_cookie).toBe("applied");
    expect(calls).toHaveLength(3);
    expect(calls[0]).toEqual({
      body: null,
      headers: {
        accept: "text/html",
        referer: "https://www.reddit.com/",
      },
      method: undefined,
      url: "https://www.reddit.com/r/test/submit/?type=TEXT",
    });
    expect(calls[1]).toEqual({
      body: null,
      headers: {
        accept: "application/json",
        referer: "https://www.reddit.com/r/test/submit/?type=TEXT",
      },
      method: undefined,
      url: "https://www.reddit.com/r/test/api/link_flair_v2.json",
    });
    expect(calls[2]).toEqual({
      body: {
        operation: "CreatePost",
        variables: {
          input: {
            isNsfw: false,
            isSpoiler: true,
            title: "SDK contract test",
            isCommercialCommunication: false,
            targetLanguage: "",
            recaptchaToken: "post-captcha",
            content: { markdown: "First line\nSecond line" },
            flair: {
              id: "555d3a74-f007-11f0-bcf0-9e242efd211e",
              text: "Searching for Alternatives",
            },
            subredditName: "test",
            correlationId: "",
          },
        },
        csrf_token: "csrf",
      },
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        origin: "https://www.reddit.com",
        referer: "https://www.reddit.com/r/test/submit/?type=TEXT",
        "user-agent": "solver-agent",
      },
      method: "POST",
      url: "https://www.reddit.com/svc/shreddit/graphql",
    });
  });

  test("reports text-post validation, CAPTCHA, request, and contract errors", async () => {
    const withoutSolver = new RedditPostClient(
      {
        async fetch(input) {
          return response(200, new URL(input).href, await submitFixture());
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );
    await expect(withoutSolver.create({
      subreddit: "test",
      title: "Hello",
    })).rejects.toBeInstanceOf(RedditPostCaptchaRequiredError);
    await expect(withoutSolver.create({
      subreddit: "bad/name",
      title: "Hello",
    })).rejects.toThrow("valid community name");
    await expect(withoutSolver.create({
      subreddit: "test",
      title: " ",
    })).rejects.toThrow("title cannot be empty");

    const client = (body: string, status = 200) =>
      new RedditPostClient(
        {
          async fetch(input, init) {
            const url = new URL(input).href;
            if (url.endsWith("/api/link_flair_v2.json")) {
              return response(200, url, await flairsFixture());
            }
            return init?.method === "POST"
              ? response(status, url, body)
              : response(200, url, await submitFixture());
          },
          getCookies() {
            return { csrf_token: "csrf" };
          },
          setCookie() {},
        },
        new AuthenticatedRedditAuthenticationContext("example"),
        {
          captchaSolver: {
            async solve() {
              return { token: "captcha" };
            },
          },
        },
      );

    await expect(client("rate limited", 429).create({
      subreddit: "test",
      title: "Hello",
    })).rejects.toBeInstanceOf(RedditPostCreateRequestError);
    await expect(client("not json").create({
      subreddit: "test",
      title: "Hello",
    })).rejects.toBeInstanceOf(RedditPostCreateContractError);
    await expect(client(JSON.stringify({
      data: {
        createSubredditPost: {
          ok: false,
          errors: [{ message: "Posting is unavailable" }],
        },
      },
    })).create({
      subreddit: "test",
      title: "Hello",
    })).rejects.toThrow("Posting is unavailable");
    await expect(client("{}").create({
      subreddit: "CharacterAIrunaways",
      title: "Hello",
      flair: "Not a real flair",
    })).rejects.toThrow("not available in r/CharacterAIrunaways");
  });

  test("creates top-level comments and nested replies with one API", async () => {
    const calls: Array<{
      body: Record<string, string>;
      headers: Readonly<Record<string, string>>;
      url: string;
    }> = [];
    const solved: string[] = [];
    const solverProxies: Array<string | undefined> = [];
    const cookies: Record<string, string> = { csrf_token: "csrf" };
    const html = await fixture();
    const transport = {
      async fetch(input: string | URL, init: RedditFetchInit = {}) {
        const url = new URL(input).href;
        if (url.endsWith("/create-comment")) {
          const body = Object.fromEntries(init.body as URLSearchParams);
          calls.push({ body, headers: init.headers ?? {}, url });
          return response(
            200,
            url,
            createdComment(body.parentId, Number(body.commentDepth ?? 0)),
          );
        }
        return response(200, url, html);
      },
      getCookies() {
        return { ...cookies };
      },
      setCookie(name: string, value: string) {
        cookies[name] = value;
      },
    };
    const client = new RedditPostClient(
      transport,
      new AuthenticatedRedditAuthenticationContext("example"),
      {
        captchaSolver: {
          async solve(challenge, options) {
            solved.push(challenge.pageAction);
            solverProxies.push(options?.proxy);
            return {
              token: `captcha-${solved.length}`,
              userAgent: "solver-agent",
              cookies: { solver_cookie: "applied" },
            };
          },
        },
        proxy: "proxy-user:proxy-pass@proxy.test:8000",
      },
    );
    const thread = await client.get(POST_URL);

    const comment = await client.reply(thread, { text: "First line\nSecond line" });
    const nested = await client.reply(thread.comments.loaded[0]!, {
      text: "Nested reply",
    });

    expect(comment).toMatchObject({ id: "t1_created", parentId: null });
    expect(nested).toMatchObject({
      id: "t1_created",
      parentId: "t1_root",
      depth: 1,
    });
    expect(solved).toEqual(["comment_submit", "comment_submit"]);
    expect(solverProxies).toEqual([
      "http://proxy-user:proxy-pass@proxy.test:8000/",
      "http://proxy-user:proxy-pass@proxy.test:8000/",
    ]);
    expect(cookies.solver_cookie).toBe("applied");
    expect(calls).toHaveLength(2);
    expect(calls[0]?.url).toBe(
      "https://www.reddit.com/svc/shreddit/t3_example/create-comment",
    );
    expect(calls[0]?.body).toEqual({
      csrf_token: "csrf",
      content: JSON.stringify({
        document: [
          { e: "par", c: [{ e: "text", t: "First line" }] },
          { e: "par", c: [{ e: "text", t: "Second line" }] },
        ],
      }),
      recaptchaToken: "captcha-1",
    });
    expect(calls[1]?.body).toMatchObject({
      parentId: "t1_root",
      commentDepth: "1",
      recaptchaToken: "captcha-2",
    });
    expect(calls[0]?.headers).toMatchObject({
      accept: "text/vnd.reddit.partial+html",
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://www.reddit.com",
      referer: POST_URL,
      "user-agent": "solver-agent",
    });
  });

  test("votes and clears votes on posts and comments", async () => {
    const calls: Array<{
      body: Record<string, unknown>;
      headers: Readonly<Record<string, string>>;
      url: string;
    }> = [];
    const html = await fixture();
    const transport = {
      async fetch(input: string | URL, init: RedditFetchInit = {}) {
        const url = new URL(input).href;
        if (url.endsWith("/svc/shreddit/graphql")) {
          const body = JSON.parse(String(init.body)) as {
            operation: string;
            variables: { input: { voteState: string } };
          };
          calls.push({ body, headers: init.headers ?? {}, url });
          const mutation = body.operation === "UpdatePostVoteState"
            ? "updatePostVoteState"
            : "updateCommentVoteState";
          return response(
            200,
            url,
            JSON.stringify({
              data: {
                [mutation]: {
                  ok: true,
                  errors: [],
                  voteState: body.variables.input.voteState,
                },
              },
            }),
          );
        }
        return response(200, url, html);
      },
      getCookies() {
        return { csrf_token: "csrf" };
      },
      setCookie() {},
    };
    const client = new RedditPostClient(
      transport,
      new AuthenticatedRedditAuthenticationContext("example"),
    );
    const thread = await client.get(POST_URL);
    const comment = thread.comments.loaded[0]!;

    expect(await client.upvote(thread)).toBe("up");
    expect(await client.downvote(comment)).toBe("down");
    expect(await client.unvote(thread.post)).toBe("none");
    expect(await client.unvote(comment.id)).toBe("none");

    expect(calls).toHaveLength(4);
    expect(calls[0]).toEqual({
      url: "https://www.reddit.com/svc/shreddit/graphql",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        origin: "https://www.reddit.com",
        referer: "https://www.reddit.com/",
      },
      body: {
        operation: "UpdatePostVoteState",
        variables: {
          input: { postId: "t3_example", voteState: "UP" },
        },
        csrf_token: "csrf",
      },
    });
    expect(calls[1]?.body).toEqual({
      operation: "UpdateCommentVoteState",
      variables: {
        input: { commentId: "t1_root", voteState: "DOWN" },
      },
      csrf_token: "csrf",
    });
    expect(calls.slice(2).map(({ body }) => body)).toEqual([
      {
        operation: "UpdatePostVoteState",
        variables: {
          input: { postId: "t3_example", voteState: "NONE" },
        },
        csrf_token: "csrf",
      },
      {
        operation: "UpdateCommentVoteState",
        variables: {
          input: { commentId: "t1_root", voteState: "NONE" },
        },
        csrf_token: "csrf",
      },
    ]);
    await expect(client.vote("t2_user" as "t3_user", "up")).rejects.toThrow(
      "t1_ comment or t3_ post id",
    );
  });

  test("reports missing CSRF, GraphQL errors, and changed vote contracts", async () => {
    const client = (body: string, withCsrf = true) =>
      new RedditPostClient(
        {
          async fetch(input) {
            return response(200, new URL(input).href, body);
          },
          getCookies() {
            return withCsrf ? { csrf_token: "csrf" } : {};
          },
          setCookie() {},
        },
        new AuthenticatedRedditAuthenticationContext("example"),
      );

    await expect(client("{}", false).upvote("t3_post")).rejects.toBeInstanceOf(
      RedditVoteRequestError,
    );
    await expect(client("not json").upvote("t3_post")).rejects.toBeInstanceOf(
      RedditVoteContractError,
    );
    await expect(
      client(
        JSON.stringify({
          data: {
            updateCommentVoteState: {
              ok: false,
              errors: [{ message: "Voting is unavailable" }],
            },
          },
        }),
      ).downvote("t1_comment"),
    ).rejects.toThrow("Voting is unavailable");
  });

  test("requires non-empty text and a configured comment solver", async () => {
    const client = new RedditPostClient(
      {
        async fetch(input) {
          return response(200, new URL(input).href, await fixture());
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );
    const thread = await client.get(POST_URL);

    await expect(client.reply(thread, { text: " " })).rejects.toThrow(
      "cannot be empty",
    );
    await expect(client.reply(thread, { text: "Hello" })).rejects.toBeInstanceOf(
      RedditCommentCaptchaRequiredError,
    );
  });
});

function createdComment(parentId?: string, depth = 0): string {
  return `
    <shreddit-comment
      thingid="t1_created"
      postid="t3_example"
      ${parentId === undefined ? "" : `parentid="${parentId}"`}
      author="example"
      content-type="text"
      depth="${depth}"
      permalink="/r/typescript/comments/example/comment/created/"
      score="1"
    >
      <div id="t1_created-comment-rtjson-content"><p>Created reply.</p></div>
    </shreddit-comment>
  `;
}

function response(status: number, url: string, body: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    url,
    async text() {
      return body;
    },
  };
}
