# Sessions

An open `RedditClient` already reuses its connection pool, TLS identity, and
cookie jar. Keep the client open while work remains and call `close()` when it
is finished.

For reuse across process restarts, export the normalized session state and
store it securely:

```ts
const state = reddit.exportSession();
await encryptedStore.save(JSON.stringify(state));
await reddit.close();
```

Restore and verify it later without repeating password, CAPTCHA, or OTP:

```ts
import { RedditClient, RedditSessionState } from "reversechud";

const state = RedditSessionState.fromJSON(
  await encryptedStore.load(),
);
const reddit = await RedditClient.resume({ state });
```

`RedditSessionState.from()` detects the SDK snapshot format, browser-export
JSON, cookie maps, and Cookie header strings. Raw cookies need a username
because Reddit's authentication cookie does not safely expose it:

```ts
const fromHeader = RedditSessionState.from(
  "reddit_session=...; csrf_token=...",
  { username: "example_user" },
);

const fromMap = RedditSessionState.from(
  { reddit_session: "...", csrf_token: "..." },
  { username: "example_user" },
);

const fromBrowserJSON = RedditSessionState.fromJSON(cookieExportJSON, {
  username: "example_user",
});
```

Browser arrays may contain `domain`, `path`, `secure`, `httpOnly`, `sameSite`,
`expirationDate`, `expires`, or `expiresAtMs`. Expired cookies are discarded.
Firefox Cookie Quick Manager JSON exports using fields such as `Name raw`,
`Content raw`, and `Host raw` are normalized as well.
During resume, cookies for unrelated domains are ignored and the restored
session must pass a live authenticated-page check before a client is returned.

Session JSON contains bearer credentials for the Reddit account. Never log it,
commit it, or store it unencrypted.
