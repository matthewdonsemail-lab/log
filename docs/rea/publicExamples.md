# Public REA examples

This page surveys public REA investigations published since 14 April 2026, and asks which of them carry over to reading Facebook's create page. The short answer: only the offline ones, where REA reads saved scripts or a saved network recording (HAR). No public example attaches REA to Firefox or Camoufox, and none of them posts, signs in or drives a site. Read it if you want precedent for how log uses REA.

It was compiled on 2026-10-18 from a web research run (processor `pro-fast`, text output). The run searched public pages; it didn't run REA against anything, and the showcases weren't re-run for this page.

Claims come in two grades:

- **Read directly:** the REA README, `docs/browser-observation.md`, `docs/web-network-captures.md`, `src/cliCommandNames.ts`, the GitHub repo record and npm `rea-agents@6.7.0`.
- **From the research run:** showcase write-ups, third-party posts and the issue index, each cited. Where the run says a page doesn't print the exact command, that limit is kept.

REA's page tools use the Chrome DevTools Protocol, and log's Facebook window is Camoufox (Firefox). So the examples that carry over are the offline ones.

## What carries over to the create page

The create page is a website, not a native binary. The examples that fit are the ones that read scripts and a saved capture. The native showcases (DX-Ball, Calculator, TH04) show how REA reports evidence, but they aren't a template for Marketplace.

| Need | Example that shows the shape | Command log would use | Why it fits |
| --- | --- | --- | --- |
| Which script the page actually loaded | The dinosaur game on [rea.tools](https://rea.tools/): the loaded `index.js`, its source and digest. The exact command isn't printed on that page. | Save the scripts from a gated run, then run static JavaScript analysis (`analyze-javascript-application` on a folder, per the REA README). | The same kind of target: a page's own script, not a repo. |
| Which request a click produced | The Notes export guide, [rea.tools/guides/browser](https://rea.tools/guides/browser/): a person clicks, and REA connects the click, the request and the script. | Not on the live Camoufox window. A HAR from a dry run, then `rea inspect-web-network-capture`. | The guide only observes; it doesn't drive the page. |
| Read a HAR without calling the site | [docs/web-network-captures.md](https://github.com/morluto/rea/blob/main/docs/web-network-captures.md), lines 1–5: recorded URLs are never fetched, and no browser or proxy listener is started. | `rea inspect-web-network-capture /absolute/session.har har --json` | Playwright can write a HAR; REA then reads the file. Facebook isn't contacted again. |
| How an Electron app reaches a native API | [Notion clipboard](https://rea.tools/showcase/notion/). The exact command isn't in the summary. | Not used for Facebook; the create page isn't Electron. | Shows the evidence style: a path through modules, not the original source tree. |

Two cautions:

- `analyze-web-bundle` parses script files from a browser capture. The research didn't establish that it accepts any local file, so don't point it at `python/fixtures/createItem.html` and expect Facebook's scripts. That file is log's own fixture.
- **HAR limits:** the derived API surface can keep the method, origin and path template while leaving out query values, headers and bodies. A missing body isn't proof the page never sent one. REA's capture doc advises stripping cookies before the file is written, not after REA has read it.

## Investigations treated as demonstrated

These are the REA project's own pages. Dates are the research run's.

| Example | Target | What the page shows | What it doesn't show |
| --- | --- | --- | --- |
| [DX-Ball](https://rea.tools/showcase/dx-ball/), checkpoint 7 October 2026 | `DXBALL.EXE` 1.07, Windows i386 | `analyze_function` and `read_bytes`: 3,205 behaviour cases and 63 matching function bytes (also in the README). | The rest of the game; sound is unfinished. |
| [Dinosaur](https://rea.tools/) | A Chromium dinosaur game page | The loaded `index.js`, its source, digest and speed constants. A separate check (not REA driving the page) reports speed 10.0 after 4,000 updates and 13.0 after 10,000. | Drawing, jumping and collision. Not an app like Facebook. |
| Windows Calculator, REA 4.1.0, on the same homepage | Calculator 11.2508.4.0 x64 | One percentage handler, constant `100`, with names checked against Microsoft's public source. | The rest of Calculator; the exact command isn't on the page. |
| [Notion](https://rea.tools/showcase/notion/) | Notion Desktop 7.6.1 | `clipboard.write` through preload into the main process. | Notion's source tree. |
| [Browser guide](https://rea.tools/guides/browser/) | A supplied Notes page | The export click, its request, and the script that builds the download. | That REA can sign in, solve a challenge, or drive any site. |

The [showcase index](https://rea.tools/showcase/) also links Aegis (Android login-code generation), a [CTF flag checker](https://rea.tools/showcase/ctf/) and [TH04](https://rea.tools/showcase/th04/) (a DOS bullet ring). The index doesn't print their commands. None is a Marketplace client.

## Write-ups that didn't run REA

The research run kept these apart from the showcases. They're adoption posts.

| Source | Date | Use it for | Don't use it for |
| --- | --- | --- | --- |
| [ArshTechPro on DEV](https://dev.to/arshtechpro/rea-let-your-ai-agent-reverse-engineer-the-app-features-you-wish-you-had-3en7) | 8 October 2026 | Setup, and the words `analyze`, `search`, `trace` | A finished investigation. `search` here is the binary command. |
| [Eigent](https://www.eigent.ai/blog/rea-reverse-engineer-anything) | 12 October 2026 | Chrome-family website analysis, evidence-shaped workflows | A completed target with original output |
| [OpenAgentSkill](https://www.openagentskill.com/blog/rea-reverse-engineering-skill-guide) | sources checked 12 October 2026 | The CLI spelling `analyze-javascript-application` | Validation; the post says it didn't run REA |
| [reverseengineeranything.app](https://reverseengineeranything.app/) | undated | A restatement of the dinosaur and Calculator examples | A second, independent result |
| [MindStudio](https://www.mindstudio.ai/blog/reverse-engineer-anything-mcp) | undated | Another overview | A case study |

One open REA issue ("Loader-alias getter replacement leaves false Electron BrowserWindow evidence", 15 October 2026, in [REA's issues](https://github.com/morluto/rea/issues)) is a failure report. The run didn't treat the title as a reproduction, but it's a reminder that JavaScript identity evidence can be wrong, which is why a create-page report has to keep REA's unknowns.

`rea-agents` 6.7.0 was published on npm and GitHub on 2026-10-18. The run found no change notes for 6.7.0; the HAR and SAZ behaviour it quotes comes from the 6.5.0 notes of 14 October 2026 (<https://github.com/morluto/rea/releases>).

## What this doesn't justify

The examples never show REA posting, signing in, or attaching to Firefox. Copying the dinosaur workflow onto facebook.com inside Camoufox is exactly what REA's browser contract rules out. The path that matches the reusable examples is in the [roadmap](roadmap.md): a gated run saves the scripts and a HAR, REA reads the files, and the publish machine stays the only thing that touches the form.
