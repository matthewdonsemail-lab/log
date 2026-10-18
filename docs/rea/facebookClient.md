# The Facebook client we already open

The client is the Marketplace create page,
`https://www.facebook.com/marketplace/create/item`, as loaded inside a
browser we control. Three local codebases drive it. REA is a fourth tool,
and it does not drive it.

## log-cli

`python/publishSession.py` is the only publish browser. The module docstring
states the split: `src/marketplace/publish/machine.ts` decides, the Python
only acts. One Camoufox process stays up. TypeScript sends a JSON line per
step and reads one JSON line back.

Before `open`, `checkRunnable` in
`src/marketplace/socialAccount/helpers/checkRunnable.ts` refuses anything
that is not a FACEBOOK account with a usable status, a readable proxy and a
home country. Sign-in is included. `prepareRun` in `src/camofox/run/client.ts`
then refuses `outsideActiveHours`. `python/proxyGate.py` checks the exit
country, and the launch self-check compares timezone, locale and exit IP
before Facebook is loaded.

The machine starts at `preparingPhotos` and ends a failure in `stopping`,
which reads the catalog's `publish` end (`src/marketplace/publish/machine.ts`).
Publish is a dry run unless `--live`. After Publish is clicked, nothing is
retried. Photos wait on Facebook's own `N/10` counter.

What this path does not do: it does not save the page's scripts, and it does
not record a HAR. The selectors it trusts are the ones written up in
`docs/listingPublish/formFill.md`.

`log scan`, `log status` and `log watch` go through `python/logWorker.py`
into facebook-camofox-client. They read. They do not post. `log watch` only
decides a relist. Nothing in the monitor posts.

## facebook-camofox-client

Checkout: `C:\Users\0\.buzz\REPOS\facebook-camofox-client`.

`CamofoxSessionManager.acquire` launches `AsyncCamoufox` with `humanize=1.5`
and `geoip=True`
(`src/facebook_camofox_client/domain_camofox/session_manager.py`). That
launcher is the client's own. log-cli's publish path does not call it.
log-cli's worker does, and then forces the headed settings itself.

`domain_marketplace/form_driver.py` is the DOM driver for
`/marketplace/create/item`: combobox portals, `aria-disabled` polling, and
`keyboard.type` for Location. `MarketplaceCreateAction` in `create.py`
acquires a session, checks auth, fills, and writes a receipt. The live
publish that this repo records is the spike, not this action. The bugs not
to copy are listed in `docs/listingPublish/sources.md` (the first
`/marketplace/item/` link on the page, `published=True` with no id).

`NativeResponseAdapter` in
`domain_extraction/response_capture.py` is the closest thing we have to a
client capture. Its docstring limits it on purpose: it listens to response
bodies the page requests while scrolling, and it does not construct
requests, replay GraphQL, or call an endpoint. It was built for group
posts, not for the create form. Headers, cookies and raw bodies are not
logged. That rule is the one to keep if log-cli grows a capture step.

## Listaro

Checkout: `C:\Users\0\.buzz\REPOS\Listaro_backup`.

The production browser is not Camoufox. `agent/src/adspower.ts` starts an
AdsPower profile and attaches Playwright with `chromium.connectOverCDP` on
the local debug port (line 210). `agent/test-reply.ts` uses the same
pattern. The live poster is `agent/src/poster.ts`: it opens
`/marketplace/create/item?locale=en_US`, sleeps, and attaches one image
with `setInputFiles` (around lines 388 and 491). The server poster is
`src/lib/poster/facebook-poster.ts` (`postToFacebookMarketplace`). Both
treat a sleep as the upload, and the server path can report success with
no listing URL. log-cli already rejected those two shortcuts. The record
is `docs/listingPublish/`.

Listaro is where the monitor rules came from (empty scan, one queued
repost, rate-limit rest). Those rules are already in
`src/marketplace/monitor/machine.ts`. REA is not needed to re-derive them.

## What REA can and cannot attach to

REA 6.7.0 (`morluto/rea`, npm `rea-agents`) analyses a target on this
machine and returns evidence. The browser surfaces are listed in
`docs/browser-observation.md` on `main`, and on
[rea.tools/guides/browser](https://rea.tools/guides/browser/).

Shipped names, CLI and MCP together:

| CLI | MCP | What it returns |
| --- | --- | --- |
| `rea list-browser-targets` | `list_browser_targets` | Page targets on a CDP endpoint |
| `rea inspect-web-page` | `inspect_web_page` | DOM, scripts, resources, a bounded network window |
| `rea analyze-web-bundle` | `analyze_web_bundle` | Chunks, routes and endpoint candidates, no execution |
| `rea observe-web-session` | `observe_web_session` | An observation window while a person uses the page |
| `rea discover-webmcp-tools` | `discover_webmcp_tools` | Declared WebMCP tools. REA does not call them |
| `rea export-web-scripts` | `export_web_scripts` | Saved scripts for the static JavaScript pipeline |
| `rea inspect-web-network-capture` | `inspect_web_network_capture` | A HAR or a Fiddler SAZ, offline |

The same document says this is passive reverse engineering, not a general
browser automation surface. CDP capture attaches to a browser that is
already running. It does not launch that browser, drive its actions, or
evaluate the page's code. Playwright scenario capture is a separate
provider, and it is a Chrome-family browser.

`rea search` is not web search. In `src/cliCommandNames.ts`, the `search`
command is aliased to `search_strings` and `search_procedures`. Those look
through a native binary. `search-bytes` and `search-android-classes` are
the same kind of tool.

Camoufox is Firefox. REA's page tools speak the Chrome DevTools Protocol.
There is no supported attach from `rea inspect-web-page` to the window
`publishSession.py` opens. Listaro's AdsPower port is Chromium CDP, so REA
could attach there. We do not do that for a Facebook account. A second
debugger on the live page sits outside the proxy gate, the device pin and
the self-check. REA's own note on CDP says Chromium can clear another
client's `navigator.platform` emulation when REA's session disconnects,
even if REA sent no emulation commands. That is a fingerprint change on a
live account. It is out.

The capture we can feed REA is offline, and it comes from a run that
already passed the gates:

1. The create-page scripts, saved from that Camoufox session.
2. A HAR of responses the page itself made. Built the way
   `NativeResponseAdapter` already behaves: listen, do not call.
3. The local fixture `python/fixtures/createItem.html` for selector checks
   only. It is not the Facebook client. REA will not find Facebook's
   scripts in it.

`rea analyze-web-bundle` and `rea inspect-web-network-capture` are the two
commands that match those files. `rea inspect-web-page` is not used on
Facebook.
