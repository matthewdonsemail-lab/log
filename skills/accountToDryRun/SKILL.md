---
name: accountToDryRun
description: Take one Facebook account from imported (NEEDSLOGIN) to ACTIVE and run a full publish dry run, through the `log` MCP tools. Proxy, sign-in, a Twenty listing, then the publish machine all the way to the filled create form, stopping before Publish. Use when a new or vendor account has to start working, or to prove an account can post before going live.
---

# accountToDryRun

Every step is an `mcp__log__*` tool (the `log` MCP server, `bun run mcp`).
The same thing works in a terminal as `bun bin/log.ts <command> <args>`.
Nothing here posts to Facebook. Going live is the last step, and only when
matt says so.

## Hard boundaries

1. **Waking hours (rule 18).** Steps 3 to 6 open the browser, so they only run
   between 08:00 and 22:00 in the account's home timezone. For Pennsylvania
   that's 12:00-02:00 GMT (EDT, until 1 Nov) or 19:00-09:00 in Vietnam. Outside
   that, every step returns `outsideActiveHours`. When matt asks for a run
   outside those hours, add `"--bypass"` to the args (rule 20). It skips only
   the hours; the proxy gate and self-check still run.
2. **No browser without the proxy (rule 12).** Step 1 must pass first.
3. **Someone watches the window (rule 11).** Camoufox is always visible. If
   the cookies don't hold, matt signs in in that window during step 3.
4. **`checkpointed` or `suspended`: stop.** Tell matt and don't retry.
5. **Dry run only.** `publish` without `--live` stops before the Publish
   button. `--live` needs `confirmLive: true` and matt's go (rule 10).

## The steps

`<a>` is the account's name (the Facebook id, e.g. `61594387282311`).

### 1. Proxy (no browser)

```text
mcp__log__account   args ["show", "<a>"]                  Proxy set? Exit checked?
mcp__log__proxy     args ["check", "--account", "<a>"]    exit IP in the home country
```

If no proxy: `["assign", "--account", "<a>", "--region", "<state>"]`. It
retries until the exit is within 100 km of the home city, or says
`proxyTooFar` and saves nothing.

### 2. Setup (no Facebook)

```text
mcp__log__doctor    args ["--json"]    Python, Camoufox and Twenty OK
```

### 3. Sign in: NEEDSLOGIN → ACTIVE

```text
mcp__log__connect   args ["--account", "<a>"]
```

The tool always runs `--noPrompt`. Camoufox opens through the proxy on the
account's device. If the vendor cookies are still logged in, it saves them
and ends within seconds. If not, Facebook shows a login page and matt signs
in in the window (2FA, any checkpoint). The tool watches for up to 600 s
(`--wait <s>` to change it). The fresh session is saved to Twenty, and a
logged-in result sets the account **ACTIVE**. Check it:

```text
mcp__log__account   args ["show", "<a>"]    Status ACTIVE, May run yes
```

"Facebook still showed login markers" means the wait ran out before a login.
Run step 3 again with someone at the window.

### 4. Read the account (read-only)

```text
mcp__log__scan      args ["--account", "<a>"]    Marketplace > Selling loads
```

### 5. The listing row in Twenty

Write the ad as JSON. Photos are local paths or URLs, and the first one is
the cover:

```json
{ "title": "...", "description": "...", "price": 99, "priceCurrency": "USD",
  "category": "Miscellaneous", "condition": "new", "photos": ["C:/.../1.jpg"],
  "locationQuery": "Philadelphia, PA", "locationCity": "philadelphia", "locationCountry": "US" }
```

```text
mcp__log__listing   args ["create", "--account", "<a>", "--file", "<path.json>"]
mcp__log__listing   args ["<listingId>"]
```

`create` checks the ad the way `publish` will (price, category, photos,
location) and refuses one that can't post.

### 6. Dry run

```text
mcp__log__publish   args ["--listing", "<listingId>", "--formUrl", "file:///<repo>/python/fixtures/createItem.html"]
mcp__log__publish   args ["--listing", "<listingId>"]
```

The first run fills the saved copy of the form and never touches Facebook. The
second goes to the real create page and runs every machine step (proxy gate,
self-check, session, photos varied and attached, title, price, category,
condition, description, location picked in the home country), then stops
before Publish. Each step is printed. Look for `dryRun` at the end. Any other
ending is a code: `mcp__log__errors args ["--code", "<code>"]`.

### 7. Live (only on matt's go)

```text
mcp__log__publish   args ["--listing", "<listingId>", "--live"]   confirmLive: true
mcp__log__scan      args ["--account", "<a>"]
```

Once Publish is clicked nothing is retried (rule 10).
