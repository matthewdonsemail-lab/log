# REA research sources

These are the sources behind the REA research in this folder: REA's own repository and docs, the local code that was read, the web research runs, and the SubQ ranking. Use it to check where a claim came from. Everything was fetched on 2026-10-18, and the figures are from that day.

## REA

- **Repository:** <https://github.com/morluto/rea> (`main`). Created 2026-04-14, last pushed 2026-10-18, MIT licence. Homepage <https://rea.tools/>.
- **GitHub API** (`repos/morluto/rea`): TypeScript; release `rea-agents` 6.7.0 published 2026-10-18; `open_issues_count` 1222. The search API the same day gave 666 open issues and 556 open pull requests (the repo's issue count includes pull requests).
- **README** on `main` (blob `31238bae529b49f6068361e6efa3c120bcc28d80`): local analysis, MCP plus CLI, Node 22.19+ / 24.11+ / 26+.
- **Install:** `docs/installation.md` on `main`. The global command is `npm install --global rea-agents`.
- **Browser contract:** `docs/browser-observation.md` on `main`, and <https://rea.tools/guides/browser/>.
- **Command names:** `src/cliCommandNames.ts` on `main`. `search` maps to `search_strings` and `search_procedures`.
- **Roadmap:** `docs/roadmap.md` on `main`, with tracking issues [#32](https://github.com/morluto/rea/issues/32), [#39](https://github.com/morluto/rea/issues/39) and [#48](https://github.com/morluto/rea/issues/48). No web-search milestone.
- **Package:** npm `rea-agents` 6.7.0, with the commands `rea` and `rea-agents`.
- A GitHub code search for `webSearch` in `morluto/rea` returned 0 results.
- `docs/web-network-captures.md` on `main`, lines 1–8: `inspect-web-network-capture` works offline, recorded URLs are never fetched, and no browser or proxy listener is started.

## log and the two earlier drivers

- **log:** `python/session/publishSession.py`, `src/marketplace/publish/machine.ts`, `src/marketplace/socialAccount/helpers/checkRunnable.ts`, `src/cli/runner/index.ts`.
- **The earlier Camoufox client:** `domain_camofox/session_manager.py` (`AsyncCamoufox`), `domain_marketplace/form_driver.py`, `domain_marketplace/create.py`, `domain_extraction/response_capture.py`.
- **The earlier production poster:** `agent/src/adspower.ts` line 210 (`chromium.connectOverCDP`), `agent/src/poster.ts` (the create URL and `setInputFiles`), `src/lib/poster/facebook-poster.ts` (`postToFacebookMarketplace`).
- **Local studies:** [Sources](../listingPublish/sources.md), `docs/identityLeaks/README.md`, `docs/deviceIsolation/README.md`, `docs/scaleArchitecture/README.md`.

## Web research (Parallel)

Calls went to `https://api.parallel.ai` with a `PARALLEL_API_KEY` kept outside this repo.

| Call | Result |
| --- | --- |
| `POST /v1/search` | HTTP 200. Three searches: what REA is, its browser tools, and the search API docs. |
| `POST /v1/tasks/runs` | HTTP 202, then completed. Processor `pro-fast`, text output, 22 citations: a survey of public REA examples from 2026-04-14 to 2026-10-18, written up in [Public REA examples](publicExamples.md). |
| `POST /v1/tasks/runs` | Three more `pro-fast` runs, stored as returned: [meta](parallel/meta.md), [playwright](parallel/playwright.md), [humanize](parallel/humanize.md). |

Both use the `x-api-key` header. Creating a task returns a `run_id` while the run is still queued; the report is at `GET /v1/tasks/runs/{run_id}/result`. Contracts: <https://docs.parallel.ai/search/search-quickstart>, <https://docs.parallel.ai/task-api/examples/task-deep-research>.

## SubQ

SubQ's Decisions API, the same day: `POST https://api.subq.ai/v1/systemone`, model `subq-snap-preview`, 279,432 input tokens, with a `SUBQ_API_KEY` kept outside this repo. Contract: <https://docs.subq.ai/markdown/endpoints/decisions-api.md>. The result is `matrix/subqResults.json`, explained in [the ranking](matrix/README.md).
