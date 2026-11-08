import { describe, expect, test } from "bun:test";

import {
  AuthenticatedRedditAuthenticationContext,
  parseRedditHomeFeed,
  RedditFeedChallengeRequiredError,
  RedditFeedClient,
  RedditFeedRequestError,
  type RedditFetchInit,
  type RedditFetchTransport,
} from "../src";

const FIXTURE_URL = new URL("./fixtures/home-feed.html", import.meta.url);
const HOME_URL = "https://www.reddit.com/svc/shreddit/feeds/home-feed?sort=BEST";

async function fixture(): Promise<string> {
  return Bun.file(FIXTURE_URL).text();
}

describe("Shreddit home feed", () => {
  test("parses posts and the opaque next-page URL", async () => {
    const page = parseRedditHomeFeed(await fixture(), HOME_URL);

    expect(page.requestUrl).toBe(HOME_URL);
    expect(page.posts).toHaveLength(2);
    expect(page.posts[0]).toEqual({
      author: "Zestyclose-Food4062",
      authorId: "t2_example1",
      body: null,
      bodyHtml: null,
      commentCount: 116,
      contentHref: "/r/CleanEating/comments/1vgiu2y/_/",
      createdUtc: null,
      domain: "self.CleanEating",
      id: "t3_1vgiu2y",
      permalink: "/r/CleanEating/comments/1vgiu2y/_/",
      score: 214,
      subredditId: "t5_example1",
      subredditName: "CleanEating",
      subredditPrefixedName: "r/CleanEating",
      title: "Finally found the sub & stayed",
    });
    expect(page.posts[1]?.authorId).toBeNull();
    expect(page.nextPageUrl).toBe(
      "https://www.reddit.com/svc/shreddit/feeds/home-feed?after=dDNfMXZkb3kzMA%3D%3D&distance=32&cursor=dDNfMXZkb3kzMA%3D%3D&sort=BEST",
    );
  });

  test("requests the partial endpoint through a pluggable transport", async () => {
    const calls: Array<{ url: string; init: RedditFetchInit | undefined }> = [];
    const html = await fixture();
    const transport: RedditFetchTransport = {
      async fetch(input, init) {
        const url = new URL(input).href;
        calls.push({ url, init });
        return response(200, url, html);
      },
    };
    const client = new RedditFeedClient(
      transport,
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    const page = await client.getHome();

    expect(page.posts).toHaveLength(2);
    expect(calls).toEqual([
      {
        url: HOME_URL,
        init: {
          headers: {
            accept: "text/vnd.reddit.partial+html",
            referer: "https://www.reddit.com/",
          },
        },
      },
    ]);
  });

  test("follows only opaque same-origin home-feed page URLs", async () => {
    const requested: string[] = [];
    const html = await fixture();
    const client = new RedditFeedClient(
      {
        async fetch(input) {
          const url = new URL(input).href;
          requested.push(url);
          return response(200, url, html);
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );
    const next =
      "/svc/shreddit/feeds/home-feed?after=opaque&cursor=opaque&sort=BEST";

    await client.getHome({ pageUrl: next });

    expect(requested).toEqual([`https://www.reddit.com${next}`]);
    expect(() =>
      client.getHome({ pageUrl: "https://example.com/steal-session" }),
    ).toThrow("configured home-feed endpoint");
    expect(() =>
      client.getHome({ pageUrl: next, sort: "NEW" }),
    ).toThrow("cannot be combined");
  });

  test("reports HTTP errors without parsing the response body", async () => {
    const client = new RedditFeedClient(
      {
        async fetch(input) {
          return response(429, new URL(input).href, "rate limited");
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    try {
      await client.getHome({ sort: "NEW" });
      throw new Error("expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(RedditFeedRequestError);
      expect(error).toMatchObject({ status: 429 });
    }
  });

  test("surfaces a Reddit edge challenge for the existing solver", async () => {
    const challengeHtml = `
      <script>await(async value=>value+value)("3ec5f4284515cb06")</script>
      <form hidden method="GET" action="/">
        <input name="solution" />
        <input name="js_challenge" value="1" />
        <input name="token" value="7afd7253fec22262ff1c52b1703fe9ecc121ed575f7576c7f8eae2aa41b34485" />
        <input name="jsc_orig_r" value="" />
      </form>
    `;
    const client = new RedditFeedClient(
      {
        async fetch(input) {
          return response(200, new URL(input).href, challengeHtml);
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    await expect(client.getHome()).rejects.toBeInstanceOf(
      RedditFeedChallengeRequiredError,
    );
  });
});

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
