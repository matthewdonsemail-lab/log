# Usage summaries

## Implemented

- `src/observability/usage/client.ts` reads root `call` spans from the selected workspace's existing SQLite store, for a maximum range of 31 days. Internal stages are excluded from call counts.
- `src/observability/usage/types.ts` defines the aggregate boundary: UTC daily counts, recorded success/failure totals, duration percentiles and fixed generic event categories.
- Classification happens inside the workspace. Tool labels, arguments, account identifiers, messages, URLs, attributes and error text are not returned. Unknown platform actions are categorized as other.
- `site/apps/web/src/pages/console/UsagePage.tsx` reads `/api/console/usage?days=30`. The Dither Kit chart renders cumulative recorded root call counts; its seven-day forecast uses the preceding seven completed UTC days. It does not claim a plan percentage or limit date because that metadata is absent. The earlier extra charts, source controls and metric cards remain removed.
- `src/observability/usage/helpers/projection.ts` is shared by the read-only development adapter and the runtime endpoint. It returns 30 daily buckets, totals and at most 40 recent root calls with only generic category, outcome, timestamp and duration. Internal stages are not counted as separate requests. The browser validates and reconstructs this fixed response; no samples are substituted. Logs bar heights reflect actual duration, and row ages use the response timestamp. First-token timing, token counts and costs are omitted from this root-call view when not recorded.

## Pending integration

Local development and workspace-owner runtime endpoints for Events and Usage are implemented. The hosted team gateway and authorized paired workspace transport remain pending; they must enforce team authorization and selected workspace ownership before invoking either reader. The browser must never receive direct SQLite access. This work does not create a durable central execution catalog.

Recorded root call status describes whether execution returned successfully. It does not independently prove delivery or acceptance of a platform action. Local detailed evidence remains governed by the existing private runtime contracts.

## Events interface

`site/apps/web/src/pages/console/EventsPage.tsx` reads `/api/console/events` and provides a Firehose of recent events and an Inference tab restricted to recorded SubQ and Jev calls, Floating UI filters, pagination and a keyboard accessible call details dialog. Inference usage is either recorded balance or tokens per call, represented as a discriminated union. Missing metadata displays an em dash. Typography follows the 14px console information size and uses solid white surfaces.

Historical design evidence: `DashboardApiKeyConsole.tsx` and `DashboardApiActivityInspectForm.tsx`, before removal in commit `c1659cad70be013d89df1031157ee11413b0e1cf`. GitHub commit lookup confirmed these paths. The scope activity table, outcome filtering and selected-call inspection were recovered as interface patterns; their retired backend dependencies were not restored.

`eventsData.ts` validates and reconstructs the fixed response; there are no Events fixtures or fabricated harness/user identities. Loading and failure states do not substitute sample rows. Refresh reads only the SQLite projection and does not request platform inbox catch-up.

`src/observability/console/helpers/projection.ts` reads up to 500 recent rows from each source: the event journal, dedicated inference spans and historical provider-answer ledger entries. Event types map to fixed generic labels; unknown types remain other events. Journal observations are recorded, not presumed successful platform actions. Inference spans contain provider, duration and numeric usage attributes only. Provider-answer entries inside a corresponding recorded inference span are excluded to avoid counting that answer twice. Historical ledger entries without usage/duration retain null fields. The combined response is limited to 1000 recent records, not a claim to contain all retained history.

`src/subq/decisions/client.ts` now records a dedicated inference span and the actual returned input/output token counts within existing call timing scopes. No request/answer content is copied into this span. No Jev calls or balances are invented; the projection accepts recorded Jev metadata when present.

`site/apps/web/server/consoleEvents.ts` serves the same projection in Vite development from a read-only SQLite connection with a read transaction. It follows `LOG_DB`, `LOG_INBOX_STATE/log.db`, then `~/.logCli/log.db`. Requests require a loopback socket/host and reject cross-origin access; responses are not cached. This local development adapter is not a hosted team authentication service. `vite.config.js` is regenerated from `vite.config.ts` because Vite resolves the tracked JavaScript config first.

`src/mcp/server/index.ts` exposes the projections on `/api/console/events` and `/api/console/usage` under the existing runtime HTTP server, requiring its workspace-owner static bearer token. It does not accept the legacy OAuth token as team authorization for this route. Production hosted team/session validation and selected workspace pairing remain pending; the browser must never receive the owner token or a database path. A hosted gateway must authorize and proxy the selected runtime rather than persist this response centrally.

### Point / Evidence / Explain

Point: the old Events table showed invented rows and mislabeled decision providers as event types. Evidence: its former `eventsData.ts` generated rows with `Array.from`; the actual schema has event types in `events` and provider answers in `ledger`, while `spans` records call durations. Explain: these are distinct sources. The replacement projects their metadata on the server, renders journal event labels in Firehose, filters recorded inference records separately, and preserves unavailable values instead of guessing.

## Platform context

Firehose receives an allowlisted platform from each journal event. X is normalized to twitter at the storage boundary and shown as X. Inference records without a recorded platform retain null rather than guessing one. The Platform column and call details show this context; search includes the platform label. `EventLogo.tsx` uses current-color platform glyphs and masks of the existing SubQ/TypeSafe logo assets so model logos match adjacent text.
