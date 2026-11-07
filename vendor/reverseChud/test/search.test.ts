import { describe, expect, test } from "bun:test";

import {
  AuthenticatedRedditAuthenticationContext,
  parseRedditCommunitySearch,
  parseRedditSearchSuggestions,
  RedditSearchChallengeRequiredError,
  RedditSearchClient,
  RedditSearchRequestError,
  type RedditFetchInit,
  type RedditFetchTransport,
} from "../src";

const COMMUNITY_FIXTURE_URL = new URL(
  "./fixtures/community-search.html",
  import.meta.url,
);
const TYPEAHEAD_FIXTURE_URL = new URL(
  "./fixtures/search-typeahead.html",
  import.meta.url,
);
const SEARCH_URL =
  "https://www.reddit.com/search/?q=typescript&type=communities";
const MORE_URL =
  "https://www.reddit.com/svc/shreddit/search/?q=typescript&type=communities&cursor=opaque-cursor";
const SUGGEST_URL =
  "https://www.reddit.com/svc/shreddit/search-typeahead?query=typescript&recentSearchesCount=0";

async function communityFixture(): Promise<string> {
  return Bun.file(COMMUNITY_FIXTURE_URL).text();
}

async function typeaheadFixture(): Promise<string> {
  return Bun.file(TYPEAHEAD_FIXTURE_URL).text();
}

describe("Reddit search", () => {
  test("parses rich community results and their opaque continuation", async () => {
    const page = parseRedditCommunitySearch(
      await communityFixture(),
      SEARCH_URL,
    );

    expect(page.requestUrl).toBe(SEARCH_URL);
    expect(page.nextPageUrl).toBe(MORE_URL);
    expect(page.communities).toEqual([
      {
        description: "TypeScript is a typed superset of JavaScript.",
        iconUrl: "https://styles.redditmedia.com/typescript.png",
        id: "t5_2v6gg",
        isNsfw: false,
        isQuarantined: false,
        name: "typescript",
        permalink: "https://www.reddit.com/r/typescript/",
        prefixedName: "r/typescript",
        weeklyContributions: 912,
        weeklyVisitors: 23_307,
      },
      {
        description: "Small TypeScript examples.",
        iconUrl: null,
        id: "t5_example",
        isNsfw: true,
        isQuarantined: false,
        name: "typescript_examples",
        permalink: "https://www.reddit.com/r/typescript_examples/",
        prefixedName: "r/typescript_examples",
        weeklyContributions: 8,
        weeklyVisitors: 47,
      },
    ]);
  });

  test("parses query and community typeahead suggestions", async () => {
    const suggestions = parseRedditSearchSuggestions(
      await typeaheadFixture(),
      SUGGEST_URL,
    );

    expect(suggestions.queries).toEqual([
      {
        query: "typescript",
        searchUrl: "https://www.reddit.com/search/?q=typescript",
      },
      {
        query: "typescript enum",
        searchUrl: "https://www.reddit.com/search/?q=typescript+enum",
      },
    ]);
    expect(suggestions.communities).toEqual([
      {
        description: null,
        iconUrl: "https://styles.redditmedia.com/typescript.png",
        id: "t5_2v6gg",
        name: "typescript",
        permalink: "https://www.reddit.com/r/typescript/",
        prefixedName: "r/typescript",
        weeklyVisitors: 23_307,
      },
      {
        description: "Small TypeScript examples.",
        iconUrl: null,
        id: "t5_example",
        name: "typescript_examples",
        permalink: "https://www.reddit.com/r/typescript_examples/",
        prefixedName: "r/typescript_examples",
        weeklyVisitors: null,
      },
    ]);
  });

  test("hides community cursors behind a lazy async listing", async () => {
    const calls: Array<{ init: RedditFetchInit | undefined; url: string }> = [];
    const firstPage = await communityFixture();
    const secondPage = firstPage
      .replace(/<faceplate-partial[\s\S]*?<\/faceplate-partial>/, "")
      .replaceAll("t5_2v6gg", "t5_second")
      .replaceAll("typescript", "typescript_second");
    const transport: RedditFetchTransport = {
      async fetch(input, init) {
        const url = new URL(input).href;
        calls.push({ init, url });
        return response(200, url, url === MORE_URL ? secondPage : firstPage);
      },
    };
    const client = new RedditSearchClient(
      transport,
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    const communities = await client.communities("  typescript  ");
    expect(communities.loaded).toHaveLength(2);
    expect(await communities.collect({ maxCommunities: 3 })).toHaveLength(3);
    expect(calls).toEqual([
      {
        url: SEARCH_URL,
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

  test("requests lightweight suggestions through the bound transport", async () => {
    const calls: Array<{ init: RedditFetchInit | undefined; url: string }> = [];
    const client = new RedditSearchClient(
      {
        async fetch(input, init) {
          const url = new URL(input).href;
          calls.push({ init, url });
          return response(200, url, await typeaheadFixture());
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );

    const suggestions = await client.suggest("typescript");

    expect(suggestions.communities).toHaveLength(2);
    expect(calls).toEqual([
      {
        url: SUGGEST_URL,
        init: {
          headers: {
            accept: "text/vnd.reddit.partial+html",
            referer: "https://www.reddit.com/",
          },
        },
      },
    ]);
  });

  test("rejects empty queries and reports HTTP and edge failures", async () => {
    const failing = new RedditSearchClient(
      {
        async fetch(input) {
          return response(429, new URL(input).href, "rate limited");
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );
    await expect(failing.communities("typescript")).rejects.toBeInstanceOf(
      RedditSearchRequestError,
    );
    await expect(failing.suggest(" ")).rejects.toThrow("cannot be empty");

    const challenged = new RedditSearchClient(
      {
        async fetch(input) {
          return response(200, new URL(input).href, challengeHtml());
        },
      },
      new AuthenticatedRedditAuthenticationContext("example"),
    );
    await expect(challenged.suggest("typescript")).rejects.toBeInstanceOf(
      RedditSearchChallengeRequiredError,
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

function challengeHtml(): string {
  return `
    <script>await(async value=>value+value)("3ec5f4284515cb06")</script>
    <form hidden method="GET" action="/">
      <input name="solution" />
      <input name="js_challenge" value="1" />
      <input name="token" value="7afd7253fec22262ff1c52b1703fe9ecc121ed575f7576c7f8eae2aa41b34485" />
      <input name="jsc_orig_r" value="" />
    </form>
  `;
}
