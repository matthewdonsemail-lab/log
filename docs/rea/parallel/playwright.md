# Firefox Page Evidence for Offline Reverse Engineering

## Executive Summary

- **REA Attachment Boundary**: REA documents live attachment to a Chrome-family browser through CDP, not Firefox or Camoufox -> use its offline inputs for this scenario. [8]
- **Firefox Capture Bridge**: Playwright supplies HAR recording, while Camoufox launches through Playwright's Firefox implementation -> collect evidence through the controlling Playwright session. [5][3]
- **Portable Network Evidence**: HAR can embed response content and retain full capture metadata -> select these options when the analyzer needs bodies, not merely replay instructions. [5]
- **Separate Script Evidence**: REA exports captured scripts into an input for its JavaScript analyzer -> distinguish that documented pipeline from an arbitrary folder of Playwright downloads. [10]
- **Separate Trace Evidence**: Playwright tracing exposes screenshots, snapshots and sources -> do not confuse its trace archive with a HAR or an exported website source tree. [6]
- **Humanize Qualification**: Your boolean-hang warning conflicts with upstream's documented boolean-or-float API -> retain it as a setup-specific compatibility warning, not a universally verified requirement. [2]

## 1. REA: No Documented Firefox or Camoufox Attachment

**Answer: morluto/rea (`rea-agents`) does not document a supported live attachment to Firefox or Camoufox.** Its browser-observation guide explicitly describes attaching to a user-owned Chrome-family browser through CDP. That does not establish a Firefox Juggler or WebDriver BiDi connector. [8]

| Public item | Repository path and URL | What it establishes |
|---|---|---|
| Live browser observation | `docs/browser-observation.md` - https://github.com/morluto/rea/blob/main/docs/browser-observation.md | CDP attachment; tools include `list_browser_targets`, `inspect_web_page`, `analyze_web_bundle` and `observe_web_session`. [8] |
| Offline network inspection | `docs/web-network-captures.md` - https://github.com/morluto/rea/blob/main/docs/web-network-captures.md | `inspect_web_network_capture` / `inspect-web-network-capture` reads retained evidence without fetching recorded URLs or starting a browser or proxy listener. Supports HAR 1.2. [9] |
| Captured-script handoff | `docs/website-script-export.md` - https://github.com/morluto/rea/blob/main/docs/website-script-export.md | `export_web_scripts` produces scripts and a verified `manifest.json`; returned `analysis_input` feeds `analyze_javascript_application`. [10] |

**Practical consequence:** Firefox can remain under Playwright's control while REA analyzes the resulting HAR offline. No REA browser attachment is required for that network-inspection operation. [9]

REA's script-export case is narrower. Its documented input is a saved `inspect_web_page` or `capture_browser_scenario` capture, not any arbitrary Playwright trace ZIP. Export neither fetches URLs nor executes JavaScript, and the retained sources do not establish a complete website or prove execution. [10]

## 2. Verified Code and Docs: Firefox/Camoufox HAR Recording

| Public item | File or documentation URL | Relevant implementation |
|---|---|---|
| Playwright HAR options | https://playwright.dev/docs/api/class-browser | `browser.newContext()` accepts `recordHar`; `content: "embed"` stores content inline, and `mode: "full"` retains more than routing-only metadata. Await context closure to save the HAR. [5] |
| Shared HAR recorder | `packages/playwright-core/src/server/har/harRecorder.ts` - https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/har/harRecorder.ts | `HarRecorder` accepts a `BrowserContext` or `APIRequestContext`, starts `HarTracer`, and flushes recorded entries. Embedded content is the recorder default when no content option is supplied. [4] |
| Firefox browser implementation | `packages/playwright-core/src/server/firefox/ffBrowser.ts` - https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/firefox/ffBrowser.ts | `FFBrowser.connect()` creates an `FFConnection`; Firefox context and page creation use `Browser.createBrowserContext` and `Browser.newPage`. [7] |
| Camoufox Python integration | `pythonlib/camoufox/async_api.py` - https://github.com/daijro/camoufox/blob/main/pythonlib/camoufox/async_api.py | `AsyncNewBrowser` calls `playwright.firefox.launch`; persistent operation calls `launch_persistent_context`. `AsyncNewContext` passes context options to `browser.new_context(**opts)`. [3] |
| Camoufox compatibility documentation | https://camoufox.com/python/usage/ | Documents compatibility with Playwright Firefox launch options and distinguishes Camoufox initialization from subsequent Playwright use. [2] |

The code supports the **composition** needed here: Camoufox supplies a Firefox browser, and Playwright supplies the browser-context HAR recorder. This is not evidence of a separate Camoufox HAR parser or a REA-Camoufox attachment feature. [3][4]

For offline analysis, prefer a self-contained HAR with embedded bodies over a minimal replay-oriented artifact. Preserve the original capture: REA distinguishes missing text, producer-decoded text and explicit base64 body evidence; those forms do not all establish original response bytes. [5][9]

### Camoufox `humanize`: Keep the Warning Properly Qualified

**For the setup described in your question, use a float duration in seconds; treat boolean input as causing the reported mouse-movement hang.** That hang is user-reported here, not independently established by the public sources inspected.

Upstream documentation actually declares `Optional[Union[bool, float]]`, documents `True`, and describes a float as the maximum movement duration in seconds. The implementation explicitly excludes booleans from its numeric-duration conversion. Consequently, "must always be a float" would overstate the public API contract. [2][1]

File references:
- `pythonlib/camoufox/utils.py`: https://github.com/daijro/camoufox/blob/main/pythonlib/camoufox/utils.py
- Public option documentation: https://camoufox.com/python/usage/

## 3. HAR, Playwright Traces and Page Scripts Are Different Artifacts

| Artifact | Public reference | Offline value and limitation |
|---|---|---|
| HAR | `harRecorder.ts`: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/har/harRecorder.ts | Network-entry evidence, with configurable response-content retention. It is the documented input class for REA's offline network inspection. [4][9] |
| Playwright trace | https://playwright.dev/docs/api/class-tracing | `tracing.start()` options include screenshots, snapshots and sources; `tracing.stop({path})` saves a trace. These are separate controls from HAR recording. [6] |
| Collected page scripts | `docs/website-script-export.md`: https://github.com/morluto/rea/blob/main/docs/website-script-export.md | The guide discusses retained Debugger source and Playwright `Response.body()` evidence. Export does not itself fetch or reconstruct source maps. [8][10] |

For script collection, retain **response bodies and their URLs/provenance**, rather than treating script metadata as equivalent to source text. REA's own browser inspection omits source content unless explicitly requested, excludes URL-less script observations from its origin-qualified metadata, and does not fetch source maps during inspection. [8]

REA provides a useful evidence-quality case study: its guide warns that some scenario bytes can be loaded again when CDP lacks a response body. Such references do not prove that those bytes came from the original transaction. A saved body from the observed response and a later retrieval should therefore remain distinguishable. [10]

**Decision:** retain network evidence, script evidence and visual/action evidence separately. Do not assume that enabling trace `sources` alone exports all website JavaScript.

## 4. CDP, Firefox Juggler and WebDriver BiDi

| Interface or implementation | File-level/public URL | Meaning for this catalog |
|---|---|---|
| REA CDP connector contract | `docs/browser-observation.md`: https://github.com/morluto/rea/blob/main/docs/browser-observation.md | The documented target is a Chrome-family browser. REA accepts specified loopback CDP HTTP or browser-WebSocket endpoints. [8] |
| Playwright Firefox transport | `packages/playwright-core/src/server/firefox/ffBrowser.ts`: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/firefox/ffBrowser.ts | Firefox-specific `FFConnection` and `Browser.*` operations are visible in implementation. Do not interpret Playwright's Firefox control as evidence of a Chrome CDP endpoint. [7] |
| Juggler versus BiDi protocol discussion | https://github.com/microsoft/playwright/issues/37277 | Public issue titled "Allow to configure the protocol (`juggler` or `webDriverBiDi` ...)". Treat this as a protocol-selection discussion, not a REA compatibility announcement. |
| Playwright BiDi testing | `tests/bidi/README.md`: https://github.com/microsoft/playwright/blob/main/tests/bidi/README.md | Public instructions describe running Playwright tests with BiDi and a custom Firefox binary. This is a test-documentation reference, not proof that REA implements BiDi. |

The architectural distinction is the important one: **the browser-control protocol and the saved evidence format are separate interfaces**. A HAR can bridge the offline analysis boundary without making CDP, Juggler and BiDi interchangeable.

## 5. Verified Saved-Artifact Consumers Versus Announcements

| Project | Repository/file URL | Verified handoff and scope |
|---|---|---|
| REA network inspection | `docs/web-network-captures.md`: https://github.com/morluto/rea/blob/main/docs/web-network-captures.md | Saved HAR -> offline request/response evidence inspection. Recorded URLs are not fetched. [9] |
| REA JavaScript analysis | `docs/website-script-export.md`: https://github.com/morluto/rea/blob/main/docs/website-script-export.md | Saved REA browser capture -> `export_web_scripts` -> `analysis_input` -> `analyze_javascript_application`. This is an explicitly documented integrated pipeline. [10] |
| webcrack | https://github.com/j4k0xb/webcrack | Saved JavaScript -> unminification, deobfuscation and webpack/browserify unpacking. Its README documents file input and output-directory usage. It is a script consumer, not a verified HAR importer. [13] |
| js-demini | `demini-trace.js`, `demini-split.js`: https://github.com/cversek/js-demini | Saved JavaScript -> module-boundary/dependency tracing -> individual module files. Splitting uses AST ranges and checks independent parsing. It is not established here as a HAR importer. [14] |

The distinction prevents an integration overclaim: REA documents complete artifact-to-analyzer handoffs; webcrack and js-demini document file-based analysis stages that can consume saved scripts, but the evidence does not establish a built-in Firefox capture connector for either.

**Announcements and discussions, separately:** REA's release page is https://github.com/morluto/rea/releases/tag/rea-agents-6.5.0; Playwright's protocol-selection discussion is https://github.com/microsoft/playwright/issues/37277. Neither should substitute for the implementation and input contracts cataloged above.

## Synthesis

Compare the choices along three dimensions: **transport**, **artifact** and **analysis scope**. REA live observation targets CDP/Chrome-family browsers; Playwright/Camoufox supplies Firefox control; saved HAR provides a transport-independent network handoff. REA's script export is an integrated static-analysis bridge, while webcrack and js-demini are downstream saved-script tools. [8][3][9][10][13][14]

The recommended boundary is therefore **Playwright-driven Firefox/Camoufox -> retained HAR and script evidence -> offline analysis**, without claiming a live REA Firefox attachment. Preserve provenance and keep the setup-specific `humanize` warning separate from upstream's broader API contract.

## References

1. *camoufox/pythonlib/camoufox/utils.py at main · daijro/camoufox · GitHub*. https://github.com/daijro/camoufox/blob/main/pythonlib/camoufox/utils.py
2. *Usage | Camoufox*. https://camoufox.com/python/usage/
3. *camoufox/pythonlib/camoufox/async_api.py at main · daijro/camoufox · GitHub*. https://github.com/daijro/camoufox/blob/main/pythonlib/camoufox/async_api.py
4. *playwright/packages/playwright-core/src/server/har/harRecorder.ts at main · microsoft/playwright · GitHub*. https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/har/harRecorder.ts
5. *Browser | Playwright*. https://playwright.dev/docs/api/class-browser
6. *Tracing | Playwright*. https://playwright.dev/docs/api/class-tracing
7. *playwright/packages/playwright-core/src/server/firefox/ffBrowser.ts at main · microsoft/playwright · GitHub*. https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/firefox/ffBrowser.ts
8. *rea/docs/browser-observation.md at main · morluto/rea · GitHub*. https://github.com/morluto/rea/blob/main/docs/browser-observation.md
9. *rea/docs/web-network-captures.md at main · morluto/rea · GitHub*. https://github.com/morluto/rea/blob/main/docs/web-network-captures.md
10. *rea/docs/website-script-export.md at main · morluto/rea · GitHub*. https://github.com/morluto/rea/blob/main/docs/website-script-export.md
11. *playwright/tests/library/browsercontext-har.spec.ts at main · microsoft/playwright · GitHub*. https://github.com/microsoft/playwright/blob/main/tests/library/browsercontext-har.spec.ts
12. *BrowserType | Playwright*. https://playwright.dev/docs/api/class-browsertype
13. *GitHub - j4k0xb/webcrack: Deobfuscate obfuscator.io, unminify and unpack bundled javascript · GitHub*. https://github.com/j4k0xb/webcrack
14. *GitHub - cversek/js-demini: JavaScript bundle reverse engineering toolkit — de-minify, annotate, split · GitHub*. https://github.com/cversek/js-demini
