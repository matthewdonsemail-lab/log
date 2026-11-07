# Feeds

This document records Reddit web-feed behavior observed on August 6, 2026.
It is a reverse-engineered browser contract, not an official API.

## Authenticated home feed

The initial partial is requested with:

```text
GET /svc/shreddit/feeds/home-feed?sort=BEST
Accept: text/vnd.reddit.partial+html
```

The response is HTML rather than JSON. Each `shreddit-post` element exposes
the post's full `t3_` ID, author, community, permalink, score, and comment
count as attributes. The SDK's `RedditFeedClient` parses those elements into
`RedditFeedPost` objects.

The `faceplate-partial#feed-next-page-partial` element contains the next page
URL. Its cursor, distances, navigation session, and advertising parameters are
opaque. Callers should return the complete URL to `getHome({ pageUrl })`
instead of constructing or decoding it.

```ts
import { CapSolver, RedditClient } from "reversechud";

const reddit = await RedditClient.login({
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
  captchaSolver: new CapSolver({
    apiKey: process.env.CAPSOLVER_API_KEY!,
  }),
  getOtp: () => prompt("Fresh Reddit six-digit code:") ?? "",
});

const first = await reddit.feeds.getHome({ sort: "BEST" });
const second = first.nextPageUrl
  ? await reddit.feeds.getHome({ pageUrl: first.nextPageUrl })
  : null;

await reddit.close();
```

`pageUrl` is restricted to the configured Reddit origin and home-feed path so
a server-supplied or caller-supplied URL cannot forward the authenticated
session to another host.

## Sorted subreddit feeds

The browser's subreddit menu maps directly to these full-page routes:

```text
GET /r/{name}/best/
GET /r/{name}/hot/
GET /r/{name}/new/
GET /r/{name}/top/
GET /r/{name}/rising/
```

The `TOP` sort additionally accepts `HOUR`, `DAY`, `WEEK`, `MONTH`, `YEAR`, or
`ALL`. Reddit represents these as the lowercase `t` query parameter.

```ts
const newest = await reddit.feeds.getSubreddit("CharacterAIrunaways", {
  sort: "NEW",
});

console.log(newest.loaded);

for await (const post of newest) {
  console.log(post.title);
}

const weeklyTop = await reddit.feeds.getSubreddit("r/CharacterAIrunaways", {
  sort: "TOP",
  time: "WEEK",
});
const firstFifty = await weeklyTop.collect({ maxPosts: 50 });
```

Later pages use `/svc/shreddit/community-more-posts/{sort}/`. Their cursor,
navigation session, ad distance, and feed length are opaque. `RedditFeedListing`
validates and follows them lazily, deduplicating posts by `t3_` ID, so callers
never need to handle those URLs.
