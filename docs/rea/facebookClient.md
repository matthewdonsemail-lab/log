# The Facebook client log already opens

"The client" here is Facebook's Marketplace create page, `https://www.facebook.com/marketplace/create/item`, as loaded inside a browser log controls. Three codebases drive it: log and two earlier projects. REA is a fourth tool that reads it but never drives it. This page describes each driver and explains why REA can only read saved files from a run, never attach to the live page.

## log

`python/session/publishSession.py` is log's only publish browser. The split is simple: `src/marketplace/publish/machine.ts` decides, and the Python only acts. One Camoufox process stays up; TypeScript sends one JSON line per step and reads one JSON line back.

Before anything opens:

1. `checkRunnable` (`src/marketplace/socialAccount/helpers/checkRunnable.ts`) refuses anything that isn't a FACEBOOK account with a usable status, a readable proxy and a home country. Sign-in is included.
2. `prepareRun` (`src/browser/run/client.ts`) refuses with `outsideActiveHours` outside the account's hours.
3. `python/browser/proxyGate.py` checks the exit country.
4. The launch self-check compares timezone, locale and exit IP before Facebook loads.

The machine starts at `preparingPhotos`, and a failure ends in `stopping`, which reads the error catalog's `publish` end. Publish is a dry run unless `--live`. Once Publish is clicked, nothing is retried. Photos wait on Facebook's own `N/10` counter.

At the time of this study, this path didn't save the page's scripts or record a HAR. The selectors it trusts are in [The create form](../listingPublish/formFill.md).

`log facebook scan`, `log facebook status` and `log facebook watch` go through `python/session/logWorker.py` into the earlier Camoufox client. They read; they don't post. `log facebook watch` only decides on a relist.

## The earlier Camoufox client

`CamofoxSessionManager.acquire` launches `AsyncCamoufox` with `humanize=1.5` and `geoip=True` (`domain_camofox/session_manager.py`). That launcher is the client's own. log's publish path doesn't call it; log's worker does, and then forces its own visible-window settings.

- `domain_marketplace/form_driver.py` is the page driver for `/marketplace/create/item`: combobox popups, polling `aria-disabled`, and `keyboard.type` for Location.
- `MarketplaceCreateAction` in `create.py` gets a session, checks sign-in, fills the form, and writes a receipt. The live publish this project records came from its spike script, not this action. Its bugs are listed in [Sources](../listingPublish/sources.md).
- `NativeResponseAdapter` in `domain_extraction/response_capture.py` is the closest thing to a client capture. It's limited on purpose: it listens to response bodies the page requests while scrolling, and never constructs requests, replays GraphQL or calls an endpoint. It was built for group posts, not the create form. It doesn't log headers, cookies or raw bodies.

## The earlier production poster

Its production browser isn't Camoufox. `agent/src/adspower.ts` starts an AdsPower profile and attaches Playwright with `chromium.connectOverCDP` on the local debug port (line 210).

- The live poster, `agent/src/poster.ts`, opens `/marketplace/create/item?locale=en_US`, waits, and attaches one image with `setInputFiles` (around lines 388 and 491).
- The server poster is `src/lib/poster/facebook-poster.ts` (`postToFacebookMarketplace`).
- Both treat a fixed wait as proof of upload, and the server path can report success with no listing URL. log rejected both shortcuts (see [How a Marketplace listing gets posted](../listingPublish/README.md)).

The listing monitor's rules came from this project (an empty scan, one queued repost, resting when rate-limited). They're already in `src/marketplace/monitor/machine.ts`, so REA isn't needed to work them out again.

## What REA can and can't attach to

REA 6.7.0 (`morluto/rea`, npm `rea-agents`) analyses a target on the local machine and returns evidence. Its browser tools are described in `docs/browser-observation.md` in its repo and at [rea.tools/guides/browser](https://rea.tools/guides/browser/).

| CLI | MCP | What it returns |
| --- | --- | --- |
| `rea list-browser-targets` | `list_browser_targets` | Page targets on a CDP endpoint |
| `rea inspect-web-page` | `inspect_web_page` | DOM, scripts, resources, a short network window |
| `rea analyze-web-bundle` | `analyze_web_bundle` | Chunks, routes and endpoint candidates, without running anything |
| `rea observe-web-session` | `observe_web_session` | An observation window while a person uses the page |
| `rea discover-webmcp-tools` | `discover_webmcp_tools` | Declared WebMCP tools (REA doesn't call them) |
| `rea export-web-scripts` | `export_web_scripts` | Saved scripts for the static JavaScript pipeline |
| `rea inspect-web-network-capture` | `inspect_web_network_capture` | A HAR or a Fiddler SAZ file, offline |

The same document says this is passive reverse engineering, not general browser automation. CDP capture attaches to a browser that's already running; it doesn't launch it, drive it or run the page's code. Playwright scenario capture is separate and uses a Chrome-family browser.

**`rea search` isn't web search.** In `src/cliCommandNames.ts`, `search` is an alias for `search_strings` and `search_procedures`, which look through a native binary. `search-bytes` and `search-android-classes` are the same kind of tool.

### Why REA doesn't attach to the live page

- **Camoufox is Firefox; REA's page tools speak the Chrome DevTools Protocol.** There's no supported way to attach `rea inspect-web-page` to the window `publishSession.py` opens.
- **AdsPower is Chromium, so REA could attach there, but log doesn't do that for a Facebook account.** A second debugger on the live page sits outside the proxy gate, the device pin and the self-check. REA's own note on CDP says Chromium can clear another client's `navigator.platform` emulation when REA's session disconnects, even if REA sent no emulation commands. That's a fingerprint change on a live account, so it's ruled out.

### What REA reads instead

Files saved offline from a run that already passed every gate:

1. **The create page's scripts,** saved from that Camoufox session.
2. **A HAR of the responses the page itself made,** recorded the way `NativeResponseAdapter` behaves: listen, never call.
3. **The local fixture `python/fixtures/createItem.html`,** for selector checks only. It isn't Facebook's client, and REA won't find Facebook's scripts in it.

The matching commands are `rea analyze-web-bundle` and `rea inspect-web-network-capture`. `rea inspect-web-page` isn't used on Facebook.
