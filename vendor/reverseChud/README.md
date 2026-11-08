# reversechud

A headless TypeScript SDK for Reddit's web API.

Protocol notes: [authentication](./docs/authentication.md),
[feeds](./docs/feeds.md), [posts and comments](./docs/posts.md),
[search](./docs/search.md), [sessions](./docs/sessions.md)

CAPTCHA solving is provider-neutral through the `CaptchaSolver` interface. A
CapSolver adapter is included, while callers can supply any structurally
compatible implementation.

HTTP state is carried by a persistent `wreq-js` session so Reddit sees one
Windows Chrome TLS/HTTP2 identity and one cookie jar across its edge challenge,
password login, and two-factor stage.

Authenticated Shreddit feeds are parsed into typed posts while pagination URLs
remain opaque. `RedditClient.login()` owns the session and exposes authenticated
features without requiring callers to construct transport or auth-state objects.

```ts
import { CapSolver, RedditClient } from "reversechud";

const reddit = await RedditClient.login({
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
  // Curl-style `user:pass@host:port` values work too. The same exit is used
  // by Reddit and proxy-aware CAPTCHA solvers.
  ...(process.env.REDDIT_PROXY_URL === undefined
    ? {}
    : { proxy: process.env.REDDIT_PROXY_URL }),
  captchaSolver: new CapSolver({
    apiKey: process.env.CAPSOLVER_API_KEY!,
  }),
  getOtp: () => prompt("Fresh Reddit six-digit code:") ?? "",
});

try {
  const feed = await reddit.feeds.getHome();
  console.log(feed.posts);

  const communities = await reddit.search.communities("typescript");
  console.log(await communities.collect({ maxCommunities: 20 }));
  console.log(await reddit.search.suggest("typescript"));

  const newest = await reddit.feeds.getSubreddit("CharacterAIrunaways", {
    sort: "NEW",
  });
  console.log(await newest.collect({ maxPosts: 20 }));

  const created = await reddit.posts.create({
    subreddit: "CharacterAIrunaways",
    title: "A new thread",
    text: "An optional Markdown body.",
    flair: "Searching for Alternatives",
  });
  console.log(created.permalink);

  const thread = await reddit.posts.get(feed.posts[0]!.permalink);
  await reddit.posts.upvote(thread);
  const comment = await reddit.posts.reply(thread, {
    text: "A top-level comment",
  });
  await reddit.posts.reply(comment, { text: "A nested reply" });
  await reddit.posts.unvote(thread); // Removes either vote direction.

  // JSON.stringify() creates a versioned snapshot for encrypted persistence.
  const savedSession = JSON.stringify(reddit.exportSession());
} finally {
  await reddit.close();
}
```

## Development

```sh
bun install
bun test
bun run check
bun run build
```

The CapSolver integration test is opt-in because it makes a paid live request.
Copy `.env.example` to the ignored `.env.local`, add `CAPSOLVER_API_KEY` and the
current public `REDDIT_CAPTCHA_SITE_KEY` from the page, then run:

```sh
bun test test/capsolver.integration.test.ts
```
