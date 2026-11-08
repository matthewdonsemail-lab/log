# Posts and comments

Load a post and its initial flat comment page through the authenticated client:

```ts
const thread = await reddit.posts.get(
  "/r/typescript/comments/example/a_post/",
  { sort: "best" },
);

console.log(thread.post);
console.log(thread.comments.loaded);
```

Comments include `id`, `parentId`, `depth`, `parentPositions`, body text and
HTML, score, author, and timestamps. The flat representation preserves Reddit's
response order while allowing callers to build any tree shape they prefer.

Normal pagination is cursor-free. Iterate comments directly, iterate pages when
batch boundaries matter, or collect an explicitly bounded number:

```ts
for await (const comment of thread.comments) {
  console.log(comment);
}

for await (const page of thread.comments.pages()) {
  console.log(page.comments);
}

const firstFiveHundred = await thread.comments.collect({
  maxComments: 500,
});
```

Reply subtrees use the same interface:

```ts
const comment = thread.comments.loaded[0];
if (comment !== undefined) {
  for await (const reply of thread.comments.repliesOf(comment)) {
    console.log(reply);
  }
}
```

Internally, Reddit embeds opaque positional cursors for the next batch of
top-level comments and omitted replies. The listing accepts only same-origin
Reddit `more-comments` URLs and never decodes or constructs their query tokens.
Raw `nextPageUrl`, `nextCommentsPageUrl`, and `moreRepliesUrl` fields remain
available for protocol debugging and advanced workflows.

## Creating text posts

Create a new thread with the same authenticated client:

```ts
const created = await reddit.posts.create({
  subreddit: "CharacterAIrunaways", // `r/...` is accepted too
  title: "A new thread",
  text: "The optional **Markdown** body.",
  flair: "Searching for Alternatives",
});

console.log(created.id, created.permalink);
```

Flair may be an exact display name, a flair id, or an object returned by
`getFlairs()`. This keeps subreddit-specific ids out of application code:

```ts
const flairs = await reddit.posts.getFlairs("CharacterAIrunaways");
const recommendation = flairs.find(
  ({ text }) => text === "Making a Recommendation",
);

if (recommendation !== undefined) {
  await reddit.posts.create({
    subreddit: "CharacterAIrunaways",
    title: "A recommendation",
    flair: recommendation,
  });
}
```

The SDK resolves the selection against Reddit's authenticated post-flair API
before paying for a CAPTCHA solve, then sends Reddit's required
`flair: { id, text }` pair.
Unavailable or stale selections fail locally. `nsfw` and `spoiler` are optional
booleans. The result contains the stable post id and permalink returned by
Reddit; pass the permalink to `posts.get()` when the complete post and its
comment listing are needed.

`getFlairs()` requests `/r/{subreddit}/api/link_flair_v2.json` through the
authenticated Reddit session. This matters for communities whose post-flair
picker is loaded by JavaScript and is absent from the static composer HTML.
The composer's separate `flairTemplateId` controls belong to community
author/user flair and are not used for posts.

The SDK also loads `/r/{subreddit}/submit/?type=TEXT` to discover the current
reCAPTCHA Enterprise site key. It solves the `post_submit` action through the
same provider-neutral `CaptchaSolver` used by login and comments, then sends
Reddit's `CreatePost` operation to `POST /svc/shreddit/graphql`. CAPTCHA cookies,
headers, user agent, proxy, CSRF token, and persistent session cookies all stay
on the existing session path.

## Voting

Posts, threads, comments, and raw `t3_`/`t1_` ids use the same API:

```ts
await reddit.posts.upvote(thread);
await reddit.posts.downvote(comment);

// Clears whichever direction is currently set, so this is both
// “un-upvote” and “un-downvote”.
await reddit.posts.unvote(comment);
```

For state-driven code, `vote()` accepts `"up"`, `"down"`, or `"none"` and
returns the state confirmed by Reddit:

```ts
const state = await reddit.posts.vote(comment, "none");
```

Reddit sends these through `POST /svc/shreddit/graphql`. Posts use the
`UpdatePostVoteState` operation with `postId`; comments use
`UpdateCommentVoteState` with `commentId`. The wire states are `UP`, `DOWN`,
and `NONE`, but the SDK keeps those protocol spellings internal.

## Creating comments and replies

The same method handles both targets:

```ts
const comment = await reddit.posts.reply(thread, {
  text: "A top-level comment",
});

const nestedReply = await reddit.posts.reply(comment, {
  text: "A reply to that comment",
});
```

The browser uses one endpoint for both operations:

```text
POST /svc/shreddit/{postId}/create-comment
Content-Type: application/x-www-form-urlencoded
```

`content` is a Reddit RTJSON document. A nested reply additionally supplies
`parentId` and `commentDepth`. The SDK derives those values from the typed
comment rather than exposing the form fields to callers.

Before submission, Reddit requests a reCAPTCHA Enterprise token with action
`comment_submit`. The site key is discovered from the post page instead of
being hard-coded. `RedditClient.login()` retains its provider-neutral
`CaptchaSolver`; a client restored with `RedditClient.resume()` can receive the
same optional `captchaSolver` setting when it needs to create comments.
