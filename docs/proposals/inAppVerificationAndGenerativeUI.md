# In-app verification (computer use) and generative-UI data storage

14 November 2026.

Status: spec, nothing built. A read-only audit of `main` at `4f38eabb`, plus web research from mid-November 2026 on MCP Apps, elicitation and which hosts support them. This is the detail for slices 20 and 21 of [platformNeutralSurfaces.md](platformNeutralSurfaces.md). Every claim is marked **R** (read in code), **X** (run), **D** (documented elsewhere in this repo, not built), or **3P/1P** (external, third-party/first-party source, web research only, unverified against this codebase).

It covers two areas the other proposals leave out: signing an account in from inside any harness without leaving the chat, and where the people data that `report` draws is stored.

The sign-in tool is named `sessionsSignIn` here, the name [capabilitySchema.md](capabilitySchema.md) gives that capability. An earlier draft called it `accountConnect`; they are the same tool.

## Goals

- One model-visible way to start and finish an account's browser verification from inside any harness, with no required navigation out of the chat.
- A capability ladder that degrades gracefully: MCP Apps widget when the host draws them, URL elicitation to a console deep link when the host supports only that, plain text with the same link otherwise. No harness is left with a dead end.
- `report` can read more than one platform's sender data, and a person's rich profile fields (bio, avatar, follower counts) are captured once and rendered fast, without turning `identities` into a wide, platform-specific table.

## Non-goals

- Not building a generic plugin/widget marketplace or a new transport. This reuses the existing voxl/JPEG viewer, the existing `blobs` table, and the existing MCP Apps extension already wired for `browserView`.
- Not changing how any platform's engine authenticates (Python `*Api/engine.py`). Only how the human completes a step the engine can't.
- Not adding mentions NLP/entity resolution beyond storing the raw mention list already present in `events.payload`.

## Area 1: computer use and in-app verification

### How it works today (R)

- One long-lived browser per account, served by `python/browser/browserViewer.py` on a loopback port with a bearer token: `/state`, `/frame` (JPEG), `/input`.
- Input reaches the page only while `viewerState` classifies it as a sign-in state that is not blocked and the request's revision matches the live one (`browserViewer.py:49-92`).
- MCP surface: one model-visible tool `browserView { account }`, four app-only tools (`browserViewStream`, `browserViewFrame`, `browserViewInput`, `browserViewDone`, `_meta.ui.visibility:["app"]`) and one resource `ui://log/browserView` (`src/mcp/apps/browserView/types.ts`, `client.ts`).
- The UI tools/resource are listed only when the client advertises `capabilities.extensions["io.modelcontextprotocol/ui"] = { mimeTypes: ["text/html;profile=mcp-app"] }` — `uiCapable()` in `client.ts:16-20`, gated in `src/mcp/server/index.ts:305-314`.
- `httpLocation()`/`browserViewLocation()` distinguish "local" (stdio: always local) from "remote" (hosted bridge, or an HTTP server with auth). Local always refuses frames/input with `browserViewLocal`, showing only "finish in the window on this machine" (`client.ts:90`, `src/cli/browser/index.ts:51-60`).
- Voxl H.264 stream when `LOG_VOXL_URL` is set, else JPEG at roughly 2 polls/second (unverified cadence beyond the one example in the SDK's own docs — see host research below).
- Hosted relay: `POST /mcp` → OAuth → Ed25519-signed request over the workspace's outbound WebSocket → `runToolCall` on the runtime (`python/controlService/dispatcher.py:118-131`, `src/runtime/bridge/client.ts:83-213`). Every call through this path is journaled into the `operations` table (see Area 2, item 8) regardless of whether it is an app-only widget call.

### Host support matrix

From web research in mid-November 2026, marked 1P or 3P by source. None of it was verified by running the harness, so treat each cell as a claim to test.

```
Host                    MCP Apps render   Form elicit     URL elicit        In-app webview for URL elicit
Claude web/Desktop      yes (1P)          no* (3P)        no* (3P)          no host does this (no source found)
Claude Code CLI         no (3P)           yes (1P)        conditional (1P)  -
ChatGPT                 yes (1P)          yes (1P)        yes* (3P)         -
Codex CLI/TUI           no (1P)           yes (1P)        yes (1P)          -
Codex desktop app       partial (1P)      yes (1P)        yes (1P)          -
Cursor                  yes (1P)          yes (1P)        undocumented      -
VS Code Copilot         yes (1P)          yes (1P)        yes (1P/3P)       -
Goose                   yes, buggy* (1P/3P) yes (1P)      no* (3P)          -
Hermes Agent            not confirmed     unknown          unknown          -
Grok                    not confirmed*    conflicting*     conflicting*     -
```

- `log`'s own current state: `uiCapable()` only checks for the MCP Apps extension. It has no fallback branch for form/URL elicitation at all — a host with elicitation but no MCP Apps (Claude Code, Codex CLI, VS Code before Apps landed) gets plain text only, even though the spec gives it a sanctioned in-chat path (**gap**).
- Spec version drift (1P, modelcontextprotocol.io): the latest core spec is `2026-07-28`, which removed server-initiated `elicitation/create` in favour of `InputRequiredResult`/`tools/call` retries, and moved client UI-capability advertisement from `initialize` to per-request `_meta`. `log`'s server (`src/mcp/server/index.ts`) only reads `capabilities.extensions` at `initialize` time (the 2025-11-25 and earlier shape) — unverified whether this still works against a 2026-07-28 client; worth a compatibility test.
- Security rule from the spec (1P): servers MUST NOT request passwords/API keys/tokens via form elicitation and MUST use URL mode for them; the URL must not be pre-authenticated or carry secrets, and the client must show the full URL and get consent before opening it. This directly bears on item 3 below: a voxl/JPEG stream URL carrying a password must never be the thing handed to URL elicitation — it already isn't (it stays inside the app-only tool's structured content), but a future URL-elicitation fallback must deep-link to an authenticated console page, never to the raw stream URL.
- No host is documented opening a URL-elicitation link in an in-app webview; the spec itself discourages it ("SFSafariViewController is good, WkWebView is not"). This caps what "never leave the application" can mean for a harness without MCP Apps: the best available is a one-tap system-browser link back to the console, not an iframe.

### Gaps found in the current code (R)

1. **Hosted cannot open the browser from chat.** `inspectStart`/`sessionsCheck` are not in the hosted allowlist (`python/controlService/tools.py`); `browserView`'s own text tells the model to call `inspectStart`, which the hosted model cannot. Only the console's `browserOpen` operation does this today.
2. **Local hosts that can draw MCP Apps are deliberately refused inline frames.** `browserViewLocal` treats every stdio connection as local regardless of what the client advertises.
3. **Sign-in page-state classification is Facebook-shaped.** `viewerState`'s states (checkpoint, video selfie, `loginForm`) come from Facebook's auto-login flow; whether a generic two-factor page on another platform classifies as input-allowed is unverified.
4. **Every app-tool poll is journaled on hosted**, at up to ~2/s, even though its payload is redacted — this is unbounded write volume into `operations` for the lifetime of a verification (ties into Area 2 item 8).
5. **No structured "not configured" answer.** A missing platform account refuses with plain text; a UI host has nothing to key a connect-card off.
6. **No elicitation fallback at all**, structured above.

### Decision: how uniform in-app rendering should work

Three designs were considered.

**A — Always render an iframe via `frameDomains`.** Rejected: `frameDomains` is honoured only by Claude (and then only for Verified directory listings — custom/local servers are blocked) and VS Code; ChatGPT blocks it by default; ports/IPs are refused outright. This would work for zero self-hosted deployments today.

**B — One capability ladder, decided per session at `initialize`, with three rungs.** **Recommended.**
   1. MCP Apps (`uiCapable()` true): render `browserView`'s widget inline, exactly as today.
   2. No MCP Apps, but the client declares `elicitation.url` (Codex, VS Code, Claude Code on a 2026-07-28 connection): answer the connect/verify step with a `tools/call` `InputRequiredResult` (or the 2025-11-25 `elicitation/create` for older clients) pointing at a signed, short-lived console deep link (`/console/verify/<token>`), never the raw stream URL. The user leaves the chat surface but stays inside a page branded and owned by the product, and returns with one click; this is the documented, sanctioned pattern, not a workaround.
   3. Neither (Claude web/Desktop chat today, Hermes, Grok, unconfirmed hosts): plain text with the same console link. This is what happens today; keep it, but make the structured error (item 5 above) carry the link so every harness, including ones added later, gets it without new code in the tool layer.

**C — Negotiate a dedicated WebSocket client for streaming instead of polling.** Deferred, not rejected: `connectDomains` with `wss://` is spec-legal and Claude confirms support, but ChatGPT's docs don't mention WebSocket and VS Code support is third-party-only. Keep JPEG/voxl polling as the universal path; add a `wss://` rung only behind the same capability check once more hosts are confirmed, since a WebSocket actor is strictly additive to the ladder in B.

Design B wins because it needs no new transport, reuses the existing `browserView` widget and the existing console, and degrades to exactly today's behavior for hosts B's new branches don't match.

### Tool and schema definitions (new/changed)

`sessionsSignIn` — new, model-visible on both local and hosted servers.

```
input:  { platform: string, account?: string }
output (success, MCP Apps): CallToolResult with structuredContent.view = browserView's ViewerView, _meta.ui.resourceUri = "ui://log/browserView"
output (success, URL elicitation): InputRequiredResult-shaped tools/call response naming the one input request
          { inputRequests: [{ type: "url", url: "<signed console deep link>", message: "Finish verifying <platform> here." }] }
        (2025-11-25 clients instead get elicitation/create with mode:"url")
output (success, text-only fallback): { content: [{ type: "text", text: "Open <link> to finish signing in to <platform>." }] }
error:  { error: "accountNotConfigured", platform, next: "<how to configure>" }
        { error: "accountPlatformMissing", platform }
_meta:  { ui: { resourceUri: "ui://log/browserView", visibility: ["model","app"] } } (same CSP as browserView)
```

- Hosted allowlist (`python/controlService/tools.py`) gains `sessionsSignIn`, reusing the console's `browserOpen` operation server-side instead of requiring `inspectStart`.
- `browserView`'s refusal text changes from "call inspectStart" to "call sessionsSignIn", so the model path is the same on local and hosted.
- `sessionsCheck`'s not-configured result becomes the structured `accountNotConfigured` shape (above) instead of prose, everywhere it's returned (`src/platformKit/sessionCheck/client.ts`).

### Security requirements

- A console deep link used for URL elicitation must be single-use, short-TTL (≤10 minutes), scoped to one account/platform, and must verify the requester matches the session that triggered it (spec requirement, "the user who opens the URL is the user who triggered the request").
- The stream/frame URL (voxl password, viewer bearer token) must never appear in `inputRequests[].url`, in hosted `operations.result`, or in any text content — only inside the app-only tool's `structuredContent`, as today.
- `sessionsSignIn`'s hosted path must add itself to `STREAM_TOOLS`/`FRAME_TOOLS`-equivalent redaction (`src/console/operations/types.ts`) before going into the hosted allowlist, or its structured content leaks into the journal unredacted the same way `report`'s does (Area 2, item 8).

### Phased work

1. **Structured not-configured/connect errors.** Files: `src/platformKit/sessionCheck/client.ts`, `src/mcp/apps/browserView/client.ts`. Acceptance: every refusal path returns `{error, platform, next}`; a snapshot test asserts the shape for each of the 6+ platforms. Test: unit test per platform with the account unconfigured.
2. **`sessionsSignIn` tool, local + hosted.** Files: new `src/mcp/apps/browserView/connect.ts` (or extend `client.ts`), `python/controlService/tools.py`, `python/controlService/dispatcher.py`. Acceptance: calling `sessionsSignIn` on an MCP-Apps host returns the same widget `browserView` does today; calling it hosted reuses `browserOpen` and returns a result, not a refusal.
3. **Elicitation rung.** Files: `src/mcp/server/index.ts` (capability detection needs an `elicitationCapable()` alongside `uiCapable()`), new console route `/console/verify/:token` with token issuance + TTL + one-time use, `src/console/` wiring. Acceptance: a client with no MCP Apps but `elicitation.url` gets an `inputRequests` payload; the link verifies once and expires.
4. **Local inline streaming, as a setting.** Files: `src/cli/browser/index.ts` (`browserViewLocation`), a new env/config flag. Acceptance: with the flag on, a local MCP-Apps host (e.g. a future desktop Cursor-over-stdio integration) gets live frames instead of `browserViewLocal`.
5. **Platform-generic page-state classifier.** Files: `python/browser/browserViewer.py`/`login.autoLogin.classify` equivalent. Acceptance: a fixture login page per platform classifies to an input-allowed state; this needs real-ish HTML fixtures per platform, not Facebook-only ones.
6. **Journal exemption for app-only polling.** Files: `src/runtime/bridge/client.ts` (`journalAccept`/`journalState`). Acceptance: a `browserViewFrame`/`browserViewInput` burst of N calls produces at most one `operations` row (or none), proven by a test counting rows before/after a simulated poll loop.

### Open questions

- Whether the 2026-07-28 client-capability shape (`_meta["io.modelcontextprotocol/clientCapabilities"]`) needs to be read per-request rather than once at `initialize`, given the server currently only reads it at `initialize` — unverified against a real 2026-07-28 client.
- Whether Hermes/Grok support either elicitation mode at all; both are "unknown" in sourced research. Until confirmed, they stay on rung 3 (text fallback), which is safe but not an upgrade.
- Whether any host actually rate-limits or size-caps app-initiated `tools/call` beyond Claude's documented ~150k-character/25k-token result cap; no measurement exists for the assumed ~2 frames/second cadence.

## Area 2: generative UI (`report`) data storage

### How it is built today (R)

- `report { title, subtitle?, code?, data?, blocks? }` (`src/mcp/apps/report/client.ts:39-52`). `data` is `Record<name, dataSource>` where `dataSource = { source: enum(SENDER_SOURCES), account?, since?, limit? }`.
- `SENDER_SOURCES` has exactly one entry, `"twitterDmsBySender"` (`src/inbox/senders/types.ts:1`); the fetch loop calls `deps.readSenders` unconditionally for every named data entry — `source` is accepted in the schema but never actually dispatched on (`client.ts:113-116`).
- The model writes JSX against a small kit (`view/kit.tsx`); sucrase compiles it (`view/server.tsx:18-28`), restricting static imports to `"log"`/`"react"`/`"react/jsx-runtime"`. A UI host evaluates the compiled module client-side (`view/widget.tsx`); a non-UI host gets it evaluated server-side via `new Function` and flattened to text.
- The compile-time import guard does not cover a dynamic `await import(...)` inside agent-authored code — confirmed up to the point that a dynamic import of a disallowed module compiles cleanly and the guard only fires if that import is actually invoked at runtime (not exercised, to avoid side effects). **This is a sandboxing gap, not a storage gap, but it sits in the same tool and should be closed in the same pass** (see item below).
- `report`'s own CSP is `{ connectDomains: [], resourceDomains: [] }` — no network access from the widget, so a generative-UI view cannot itself fetch rich profile data; it can only render what the server handed it in `data`.

### Where people data is, and isn't, stored (R)

- `identities(platform, userId, handle, displayName, personId, firstSeenAt, lastSeenAt)` is the only durable per-person row. `personId` is declared and indexed but never written by any code path — there is no `persons`/`identityLinks` table.
- Per-platform profile-shaped fields exist in the engines but are dropped before they reach storage: X followers' bio/location/follower counts (`python/twitterApi/engine.py:1094-1107`), Discord's `globalName`/`verified`/`mfaEnabled` (`engine.py:60`), Slack's `display_name`/`real_name` (`slackApi/engine.py:165-169`), LinkedIn's `premiumSubscriber` (`linkedinApi/engine.py:37-66`). All of these are either printed/returned transiently or survive only inside `events.payload` JSON (and, once over 20,000 characters, inside the `blobs` table via `putBlob`).
- Mentions are not a stored entity: Discord/Slack reduce a raw mentions array to a boolean (`to_me`/`mentionsMe`); the raw array exists only inside `events.payload`.
- Avatars are not fetched or stored anywhere; the widget's CSP (`resourceDomains: []`) blocks loading one from an external host even if a URL were available.

### The blob store that already exists (R)

- `blobs(hash PK, kind, codec, size, storedSize, chunks, bytes, createdAt) WITHOUT ROWID` + `blobChunks(hash, n, bytes)`, content-addressed by sha256. `chunks`/`blobChunks` are declared but never written. `putBlob` always gzips text; there is no raw-bytes or zstd codec path despite the `codec` column being general. The only caller today is `insertEventRow`, storing oversized JSON payloads.
- `media(... sha256, preview BLOB, previewMime ...)` (migration 17) is the closest existing precedent for a person-keyed blob — but it's keyed to a message event, not a person, so reusing it for avatars needs a new join table, not a change to `media` itself.
- Three prior docs already propose exactly this gap's fix, unbuilt:
  - `docs/storageReadPath.md:31-36,47` — an `extra` JSONB column on `identities` naming bio/follower count/verified/picture link, LinkedIn headline/positions/schools. **Not implemented**, no `extra` column exists.
  - `docs/storageAgainstTheBook.md:188-195` — `persons`, `identityLinks(personId, platform, userId, evidence, confidence, linkedBy, atMs, revokedAtMs)`, `interactions.targetUserId`. **Not implemented.**
  - `docs/unifyStorage.md:103-125` — the blob spec itself (sha256, codec raw/zstd/gzip, 64MB chunking). **Partially implemented**: hash+gzip only; raw/zstd codecs and chunking from that spec were never built.
  - `docs/proposals/listeningKitNativeData.md:34` — an explicit rule against "a generic request/result JSON column 'for convenience'", which argues against just widening `events.payload` further and for the typed-row-plus-blob split proposed below.

### Decision: how to store rich person data for fast rendering

Three designs considered.

**A — Widen `identities` with named columns per field (bio, avatarUrl, followerCount, verified, ...).** Rejected: fields differ per platform (LinkedIn headline/positions vs. X bio/followers), so this becomes an ever-growing, mostly-null table, and contradicts the "no generic convenience column" rule only by inverting it into "one column per platform's quirk" instead.

**B — Raw-bytes blob (avatar image) + a typed `identityProfiles` row (the structured fields), both keyed `(platform, userId)`, with the row's data duplicated from `events.payload`/engine responses at ingest time, not derived lazily.** **Recommended.**
   - `identityProfiles(platform TEXT, userId TEXT, bio TEXT, avatarHash TEXT, followerCount INT, verified INT, extra TEXT, fetchedAt TEXT, PRIMARY KEY(platform, userId)) WITHOUT ROWID`. `extra` is a narrow, documented escape hatch for fields that don't deserve a column yet (LinkedIn headline, positions) — matching `storageReadPath.md`'s original proposal, kept narrow per `listeningKitNativeData.md`'s rule by only ever holding fields already named in a doc, not arbitrary JSON.
   - `avatarHash` references a `blobs` row of `kind='avatar'`, written through an extended `putBlob` that accepts a `raw` codec (images shouldn't be gzipped) instead of always gzipping text.
   - Writers: the same extenders that populate `identities` today (`twitterExtender.toIdentities`, the Discord/Slack/LinkedIn session callers) additionally call `upsertIdentityProfile` when the engine response already carries these fields — no new network calls, just stop discarding data already fetched.
   - `report`'s `dataSource` gains a `source` option (e.g. `"identityProfile"`) that reads this table directly, so the widget renders a person card without the server doing a live platform fetch.

**C — Derive profile data on demand from `events.payload` at render time.** Rejected as the primary path (kept as a fallback for rows ingested before this ships): requires scanning JSON blobs for every render, defeats "quickly rendered without extra changes," and `events.payload` isn't indexed by person.

B wins because it's additive (new table, new blob kind, no migration of existing tables), matches the escape-hatch rule already on record in this repo's own docs, and the "fast render" requirement is satisfied by a straight primary-key lookup instead of a JSON scan.

### Storage schema and migration

New migration (schema version 19):

```sql
CREATE TABLE identityProfiles (
  platform TEXT NOT NULL,
  userId TEXT NOT NULL,
  bio TEXT,
  avatarHash TEXT REFERENCES blobs(hash),
  followerCount INTEGER,
  verified INTEGER,
  extra TEXT,            -- JSON, only fields already named in storageReadPath.md
  fetchedAt TEXT NOT NULL,
  PRIMARY KEY (platform, userId)
) WITHOUT ROWID;
CREATE INDEX identityProfiles_fetchedAt ON identityProfiles(fetchedAt);
```

- `putBlob`/`readBlob` (`src/storage/platform/client.ts:104-124`) gain a `raw` codec path: skip `gzipSync` when `kind==='avatar'` (or any caller-declared raw kind), store bytes as-is, `readBlob` returns them unmodified when `codec==='raw'`.
- Add `identityProfiles` to `rebuildDerived`'s `DERIVED_TABLES` (`src/storage/platform/types.ts:122`) only if it should be wiped and replayed from `events` — recommended, since it keeps the "derived, not a second source of truth" property every other identity-shaped table has.
- No change to `blobChunks`/`chunks` (still unused); avatars are small enough not to need chunking, so this spec does not build the chunking half of `unifyStorage.md`.

### Sandbox fix (bundled with this work since it touches the same tool)

- Close the dynamic-import gap in `view/run.ts`'s `moduleRequire`: block `import()` the same way static imports are blocked, not just at parse time. Add a test that an agent-authored view calling `await import("node:fs")` throws, not just that a static `import "node:fs"` fails to compile.

### Hosted vs self-hosted differences

- **Execution:** identical — `runCli`/`runToolCall` run in the same process on both paths (R, `src/mcp/server/index.ts:154`), so the schema and storage layer need no hosted-specific branch.
- **Storage location:** self-hosted keeps one SQLite file per account (`~/.logCli/log.db` or `$LOG_DB`); hosted keeps the same per-workspace SQLite plus a separate control-plane journal (`operations`, Postgres-backed control service). `docs/proposals/listeningKitInstanceContracts.md:29,31` explicitly forbids adding a second writable copy of platform data centrally — `identityProfiles` must live in the workspace's own SQLite, not in the hosted control DB. This spec follows that rule.
- **Journal leak (R, confirmed in code):** `report`'s tool name is absent from `SECRET_ARGS`/stream-redaction lists (`src/console/operations/types.ts`), so when `report` runs through the hosted bridge its `{text, spec}` result — which can now include rendered `identityProfiles` data, bios included — is journaled into `operations.result` **unredacted**. This is the sharpest hosted/self-hosted discrepancy found: self-hosted has no such journal at all; hosted has one with no retention/purge code and no redaction for this specific tool. Fix: add `report` and `sessionsSignIn` to the redaction configuration before `identityProfiles` data starts flowing through it.
- **Allowlist drift:** the hosted tool allowlist (`python/controlService/tools.py`) is hand-maintained and already diverges from the local tool set (missing `sessionsSignIn`, `inspectStart`, several `*SessionCheck` tools, per the original Area 1 audit). Any new tool from this spec (`sessionsSignIn`) needs an explicit, reviewed addition there — it will not appear automatically.

### Security requirements

- `identityProfiles.bio`/`extra` must go through the same redaction path as any other free-text platform content before being journaled hosted-side (the fix above).
- Avatar blobs are content-addressed by image bytes; no PII beyond what the platform already serves publicly through its own profile API is introduced.
- `report`'s CSP stays `resourceDomains: []`; avatars render as data the server already resolved into a blob and handed to the view as a data URI or similar, not as a live fetch from an external host.

### Phased work

1. **`identityProfiles` table + raw blob codec.** Files: `src/storage/schema/helpers/migrations.ts` (version 19), `src/storage/schema/helpers/platformTables.ts`, `src/storage/platform/client.ts` (`putBlob`/`readBlob` raw codec), `src/storage/platform/types.ts` (`DERIVED_TABLES`). Acceptance: migration applies cleanly on a fresh and an existing v18 DB; a round-trip test stores and reads back a raw (non-gzipped) blob unchanged.
2. **Extender writers stop discarding profile fields.** Files: `src/twitter/notification/helpers/extenders.ts`, Discord/Slack/LinkedIn session callers under `src/discord/account/`, `src/slack/`, `src/linkedin/` (per-platform `PlatformAnswer` builders). Acceptance: a fixture engine response with bio/avatar/follower fields produces an `identityProfiles` row after ingest, proven per platform.
3. **`report` gains an `identityProfile` data source.** Files: `src/inbox/senders/types.ts` (or a sibling registry), `src/mcp/apps/report/client.ts` (dispatch on `source`, not just `twitterDmsBySender` unconditionally — this also fixes the existing dead `source` field). Acceptance: `report { data: { person: { source: "identityProfile", account, ... } } }` renders a person card from the stored row with no live platform call.
4. **Hosted redaction for `report`/`sessionsSignIn`.** Files: `src/console/operations/types.ts`, `src/runtime/bridge/client.ts`. Acceptance: a journaled `report` call's `operations.result` row contains redacted content, proven by a test asserting the stored row excludes bio/avatar text present in the tool's actual result.
5. **Dynamic-import sandbox fix.** Files: `src/mcp/apps/report/view/run.ts`. Acceptance: a view calling `await import("node:fs")` (or any non-allowlisted module) throws at call time, with a test for both static and dynamic forms.

### Acceptance criteria and test plan, overall

- A fixture per platform's engine response feeds the extender; `identityProfiles` ends up populated without a second network call.
- `rebuildDerived` wipes and replays `identityProfiles` from `events` and produces byte-identical rows to a fresh ingest (mirrors the existing test for other derived tables).
- `report` renders a person card purely from `identityProfiles` + its avatar blob, measured as zero platform-engine calls during the render.
- A hosted `report`/`sessionsSignIn` call's journal row, inspected directly, contains no bio/avatar text, no stream URL, and no auth token.
- Migration 19 round-trips on both a fresh DB and the existing v18 test fixture DBs used in `src/storage/schema/schema.test.ts`/`compat.test.ts`.

### Open questions

- Whether `extra` on `identityProfiles` should be typed per platform via a discriminated union at the TypeScript layer, or stay a loosely-typed JSON column with only documented keys — leaning toward the latter to match the existing `listeningKitNativeData.md` rule, but not decided.
- Whether `personId`/`identityLinks` (cross-platform identity merging, `storageAgainstTheBook.md:188-195`) should ship in the same pass or a later one; this spec treats it as a later pass since `identityProfiles` is useful per-platform without it.
- Garbage collection for `blobs`/`identityProfiles` (avatars go stale, accounts get removed) — no retention policy exists for `blobs` today and none is proposed here beyond flagging it as a gap.
