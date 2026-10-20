# Sources

Fetched 2026-10-18. Figures are from that day's responses, not a later
recount.

## REA

- Repository: <https://github.com/morluto/rea> (`main`). Created
  2026-04-14. Pushed 2026-10-18. MIT. Homepage <https://rea.tools/>.
- GitHub API `repos/morluto/rea`: language TypeScript, release
  `rea-agents` 6.7.0 published 2026-10-18, `open_issues_count` 1222.
  Search API the same day: 666 open issues and 556 open pull requests.
  The issues count on the repo object includes pull requests.
- README on `main` (blob `31238bae529b49f6068361e6efa3c120bcc28d80`):
  local analysis, MCP plus CLI, Node 22.19+ / 24.11+ / 26+.
- Install: `docs/installation.md` on `main`. Global command is
  `npm install --global rea-agents`. Node on this machine: 24.18.1.
- Browser contract: `docs/browser-observation.md` on `main`, and
  <https://rea.tools/guides/browser/>.
- Command names: `src/cliCommandNames.ts` on `main`. `search` maps to
  `search_strings` and `search_procedures`.
- Roadmap: `docs/roadmap.md` on `main`. Trackers
  [#32](https://github.com/morluto/rea/issues/32),
  [#39](https://github.com/morluto/rea/issues/39),
  [#48](https://github.com/morluto/rea/issues/48). No web-search milestone.
- Package: npm `rea-agents` 6.7.0, bins `rea` and `rea-agents`.
- GitHub code search for `webSearch` in `morluto/rea` returned
  `total_count` 0.

## This repo and the two drivers

- log-cli: <https://github.com/matthewdonsemail-lab/log-cli>. PR #6:
  <https://github.com/matthewdonsemail-lab/log-cli/pull/6>. Head
  `b607b33`, base `feat/captchaKrakenAndPublishFlow`. Mergeable, no
  reviews, no status checks, 223 files, +311441/−558. No issue comments
  and no review comments. Open issues on the repo: 0.
- PR #5: <https://github.com/matthewdonsemail-lab/log-cli/pull/5>, still
  open onto `main`.
- `python/session/publishSession.py`, `src/marketplace/publish/machine.ts`,
  `src/marketplace/socialAccount/helpers/checkRunnable.ts`,
  `src/cli/runner/index.ts`.
- facebook-camofox-client:
  `domain_camofox/session_manager.py` (`AsyncCamoufox`),
  `domain_marketplace/form_driver.py`, `domain_marketplace/create.py`,
  `domain_extraction/response_capture.py`.
- Listaro: `agent/src/adspower.ts` line 210 (`chromium.connectOverCDP`),
  `agent/src/poster.ts` (create URL and `setInputFiles`),
  `src/lib/poster/facebook-poster.ts` (`postToFacebookMarketplace`).
- Local studies: `docs/listingPublish/sources.md`,
  `docs/identityLeaks/README.md`, `docs/deviceIsolation/README.md`,
  `docs/scaleArchitecture/README.md`.

## Parallel

The `parallel-cli` install on this machine returned insufficient credit.
The calls below used `PARALLEL_API_KEY` from `C:\Users\0\.buzz\.env.local`
against `https://api.parallel.ai`. The key is not in log-cli's
`.env.local` and is not copied into this repo.

| Call | Result |
| --- | --- |
| `POST /v1/search` | HTTP 200. `search_b32a6ac879fdd243c5614ea90e8662e8` (what REA is), `search_4036d55e5c09c34e326a23ead38db2b9` (browser tools), `search_07b90afec5933a8fdf966dc3b3be3bad` (Search API docs). |
| `POST /v1/tasks/runs` | HTTP 202, then completed. Run `trun_6f9557d890fe4c5ba675c7ad9c0199e6`, processor `pro-fast`, text output, 22 citations. Survey of public REA examples from 2026-04-14 to 2026-10-18. Written up in `publicExamples.md`. |
| `POST /v1/tasks/runs` | Three more `pro-fast` runs, stored as returned: `parallel/meta.md` (`trun_95b43607c5a64df482cdcd13bfc14fa0`), `parallel/playwright.md` (`trun_95b43607c5a64df4b1dfcebcb1162815`), `parallel/humanize.md` (`trun_95b43607c5a64df480d64b6bd7477a60`). |

SubQ Decisions API, same day, key `SUBQ_API_KEY` from `.buzz/.env.local`:
`POST https://api.subq.ai/v1/systemone`, model `subq-snap-preview`,
279,432 input tokens. Contract:
<https://docs.subq.ai/markdown/endpoints/decisions-api.md>.
Result: `matrix/subqResults.json`, read in `matrix/README.md`.

`docs/web-network-captures.md` on `main`, lines 1–8: `inspect-web-network-capture`
is offline, recorded URLs are never fetched, and no browser or proxy
listener is started.

Search and Task contracts:
<https://docs.parallel.ai/search/search-quickstart>,
<https://docs.parallel.ai/task-api/examples/task-deep-research>.

Auth header for both is `x-api-key`. Task creation returns a `run_id`
while the run is still queued. The report is `GET /v1/tasks/runs/{run_id}/result`.
