# Search and community discovery

`reddit.search` uses the authenticated session owned by `RedditClient`. It
supports Reddit's rich community results and its lighter search typeahead.

## Community search

```ts
const communities = await reddit.search.communities("typescript");

// Results already returned by the first request.
console.log(communities.loaded);

// Fetch opaque continuation pages only as they are needed.
for await (const community of communities) {
  console.log(community.prefixedName, community.weeklyVisitors);
}

// Or stop after a fixed number of unique communities.
const firstTwenty = await communities.collect({ maxCommunities: 20 });
```

Each result includes its fullname (`t5_...`), name, permalink, description,
icon, NSFW/quarantine flags when Reddit exposes them, and exact weekly visitor
and contribution counts. The cursor is intentionally managed by the listing;
callers do not need to inspect or replay Reddit's continuation URL.

## Typeahead

```ts
const suggestions = await reddit.search.suggest("typescript");

console.log(suggestions.queries);
console.log(suggestions.communities);
```

Typeahead returns query completions and compact community suggestions in one
request. Community suggestions contain the same stable fullname/name/permalink
identity plus any icon, description, or visitor count present in the fragment.

Both APIs accept `{ signal }` for cancellation. An empty query throws a
`TypeError`; HTTP failures and edge challenges use
`RedditSearchRequestError` and `RedditSearchChallengeRequiredError`.
