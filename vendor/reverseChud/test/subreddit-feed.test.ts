import { describe, expect, test } from "bun:test";

import {
  AuthenticatedRedditAuthenticationContext,
  parseRedditSubredditFeed,
  RedditFeedClient,
  type RedditFetchInit,
  type RedditFetchTransport,
  type RedditSubredditFeedSort,
  type RedditSubredditTopTime,
} from "../src";

const FIXTURE_URL = new URL("./fixtures/subreddit-feed.html", import.meta.url);
const INITIAL_URL = "https://www.reddit.com/r/CharacterAIrunaways/new/";
const MORE_URL =
  "https://www.reddit.com/svc/shreddit/community-more-posts/new/?after=opaque&t=DAY&name=CharacterAIrunaways&navigationSessionId=opaque-session&feedLength=4";

async function fixture(): Promise<string> {
  return Bun.file(FIXTURE_URL).text();
}

describe("sorted subreddit feeds", () => {
  test("parses subreddit posts and the observed opaque continuation", async () => {
    const page = parseRedditSubredditFeed(await fixture(), INITIAL_URL);

    expect(page.requestUrl).toBe(INITIAL_URL);
    expect(page.nextPageUrl).toBe(MORE_URL);
    expect(page.posts.map(({ id, title }) => ({ id, title }))).toEqual([
      { id: "t3_first", title: "First sorted post" },
      { id: "t3_second", title: "Second sorted post" },
    ]);
  });

  test("reads when each post was made and its text", async () => {
    const [first, second] = parseRedditSubredditFeed(await fixture(), INITIAL_URL).posts;

    expect(first?.createdUtc).toBe(Date.UTC(2026, 10, 1, 12) / 1000);
    expect(first?.body).toBe("Repo: github.com/example/tool");
    expect(first?.bodyHtml).toContain('href="https://github.com/example/tool"');
    expect(second?.createdUtc).toBeNull();
    expect(second?.body).toBeNull();
  });

  test("maps every browser sort choice to its subreddit route", async () => {
    const cases: ReadonlyArray<{
      expected: string;
      sort: RedditSubredditFeedSort;
      time?: RedditSubredditTopTime;
    }> = [
      {
        sort: "BEST",
        expected: "https://www.reddit.com/r/CharacterAIrunaways/best/",
      },
      {
        sort: "HOT",
        expected: "https://www.reddit.com/r/CharacterAIrunaways/hot/",
      },
      {
        sort: "NEW",
        expected: "https://www.reddit.com/r/CharacterAIrunaways/new/",
      },
      {
        sort: "TOP",
        expected: "https://www.reddit.com/r/CharacterAIrunaways/top/",
      },
      {
        sort: "TOP",
        time: "WEEK",
        expected: "https://www.reddit.com/r/CharacterAIrunaways/top/?t=week",
      },
      {
        sort: "RISING",
        expected: "https://www.reddit.com/r/CharacterAIrunaways/rising/",
      },
    ];

    for (const { expected, sort, time } of cases) {
      const requested: string[] = [];
      const client = createClient({
        async fetch(input) {
          const url = new URL(input).href;
          requested.push(url);
          return response(200, url, "<shreddit-feed></shreddit-feed>");
        },
      });

      await client.getSubreddit("r/CharacterAIrunaways", {
        sort,
        ...(time === undefined ? {} : { time }),
      });
      expect(requested).toEqual([expected]);
    }
  });

  test("hides subreddit cursors behind a lazy deduplicated listing", async () => {
    const calls: Array<{ init: RedditFetchInit | undefined; url: string }> = [];
    const firstPage = await fixture();
    const secondPage = firstPage
      .replace(/<faceplate-partial[\s\S]*?<\/faceplate-partial>/, "")
      .replaceAll("t3_first", "t3_third")
      .replaceAll("First sorted post", "Third sorted post");
    const client = createClient({
      async fetch(input, init) {
        const url = new URL(input).href;
        calls.push({ init, url });
        return response(200, url, url === MORE_URL ? secondPage : firstPage);
      },
    });

    const posts = await client.getSubreddit("CharacterAIrunaways", {
      sort: "NEW",
    });

    expect(posts.loaded).toHaveLength(2);
    expect((await posts.collect({ maxPosts: 3 })).map(({ id }) => id)).toEqual([
      "t3_first",
      "t3_second",
      "t3_third",
    ]);
    expect(calls).toEqual([
      {
        url: INITIAL_URL,
        init: {
          headers: {
            accept: "text/html",
            referer: "https://www.reddit.com/",
          },
        },
      },
      {
        url: MORE_URL,
        init: {
          headers: {
            accept: "text/vnd.reddit.partial+html",
            referer: "https://www.reddit.com/",
          },
        },
      },
    ]);
  });

  test("validates subreddit names, TOP windows, and cursor ownership", async () => {
    const client = createClient({
      async fetch(input) {
        const url = new URL(input).href;
        return response(
          200,
          url,
          (await fixture()).replace(
            "name=CharacterAIrunaways",
            "name=AnotherCommunity",
          ),
        );
      },
    });

    await expect(client.getSubreddit("not a subreddit")).rejects.toThrow(
      "valid name",
    );
    await expect(
      client.getSubreddit("CharacterAIrunaways", {
        sort: "NEW",
        time: "WEEK",
      }),
    ).rejects.toThrow("requires the TOP sort");

    const posts = await client.getSubreddit("CharacterAIrunaways", {
      sort: "NEW",
    });
    await expect(posts.collect({ maxPosts: 3 })).rejects.toThrow(
      "configured subreddit endpoint",
    );
    await expect(posts.collect({ maxPosts: 0 })).rejects.toThrow(
      "positive safe integer",
    );
  });
});

function createClient(transport: RedditFetchTransport): RedditFeedClient {
  return new RedditFeedClient(
    transport,
    new AuthenticatedRedditAuthenticationContext("example"),
  );
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
