# Public REA examples since 14 April 2026

Compiled 2026-10-18 from a Parallel Task run,
`trun_6f9557d890fe4c5ba675c7ad9c0199e6` (processor `pro-fast`, text output).
The run searched public pages. It did not execute REA against a target, and
this session did not re-run the showcases.

Two grades of claim:

- **Read here.** The REA README, `docs/browser-observation.md`,
  `docs/web-network-captures.md`, `src/cliCommandNames.ts`, the GitHub repo
  object and npm `rea-agents@6.7.0` were fetched directly.
- **From the Task run.** Showcase write-ups, third-party posts and the issue
  index. Each is cited. Where the run says the page does not print the exact
  command, that limit is kept.

No public example in the run attaches REA to Firefox or Camoufox. That
matches the browser contract read here: page tools use the Chrome DevTools
Protocol. The Facebook window we open is Camoufox, so the examples that
transfer are the offline ones.

## What transfers to the create page

The create page is a website, not a native binary. The examples that match
are the ones that read scripts and a saved capture. The native showcases
(DX-Ball, Calculator, TH04) show how REA reports evidence. They are not a
template for Marketplace.

| Need | Example that shows the shape | Command we would use | Why it fits |
| --- | --- | --- | --- |
| Which script the page actually loaded | Dinosaur game on [rea.tools](https://rea.tools/): loaded `index.js`, source and digest. The run says the exact invocation is not printed on that page. | Save the scripts from our gated run, then static JavaScript analysis (`analyze-javascript-application` on a directory is in the REA README). | Same class of target: a page's own script, not a repo. |
| Which request a click produced | Notes export guide, [rea.tools/guides/browser](https://rea.tools/guides/browser/). A person clicks. REA connects the click, the request and the script. | Not on the live Camoufox window. A HAR from the dry run, then `rea inspect-web-network-capture`. | The guide is observation. It does not drive the page. |
| Read a HAR without calling the site | [docs/web-network-captures.md](https://github.com/morluto/rea/blob/main/docs/web-network-captures.md) lines 1–5, read here: recorded URLs are never fetched, and no browser or proxy listener is started. | `rea inspect-web-network-capture /absolute/session.har har --json` | Playwright can write a HAR. REA then reads the file. Facebook is not contacted again. |
| How an Electron app reaches a native API | [Notion clipboard](https://rea.tools/showcase/notion/). The run says the exact invocation is not in the summary. | Not used for Facebook. The create page is not Electron. | Shows the evidence style: a path through modules, not the original source tree. |

`analyze-web-bundle` parses script artifacts from a browser capture. The
Task run did not establish that it accepts an arbitrary local file. Do not
point it at `python/fixtures/createItem.html` and expect Facebook's scripts.
That file is our fixture.

HAR limits, from the 6.5.0 notes as reported by the run and from the capture
doc read here: the derived API surface can keep method, origin and path
template, and can omit query values, headers and bodies. A missing body is
not proof the page never sent one. Cookies must be stripped before the file
is written, not after REA has read them.

## Investigations the run treated as demonstrated

These are the project's own pages. Dates are the run's, not guessed.

| Example | Target | What the page shows | What it does not show |
| --- | --- | --- | --- |
| [DX-Ball](https://rea.tools/showcase/dx-ball/), checkpoint 7 October 2026 | `DXBALL.EXE` 1.07, Windows i386 | `analyze_function` and `read_bytes`. 3,205 behaviour cases and 63 matching function bytes. Those two numbers are also in the README read here. | The rest of the game. Sound-backend integration is unfinished. |
| [Dinosaur](https://rea.tools/) | wayou's Chromium dinosaur page | Loaded `index.js`, source, digest, speed constants. A separate check, not REA driving the page, reports speed 10.0 after 4,000 updates and 13.0 after 10,000. | Drawing, jumping and collision. Not a Facebook-class app. |
| Windows Calculator, REA 4.1.0, on the same homepage | Calculator 11.2508.4.0 x64 | One percentage handler, constant `100`. Names checked against Microsoft's public source. | The rest of Calculator. The exact CLI line is not on the page. |
| [Notion](https://rea.tools/showcase/notion/) | Notion Desktop 7.6.1 | `clipboard.write` through preload into the main process. | Notion's source tree. |
| [Browser guide](https://rea.tools/guides/browser/) | A supplied Notes page | Export click, its request, the script that builds the download. | That REA can log in, solve a challenge, or drive an arbitrary site. |

The [showcase index](https://rea.tools/showcase/) also links Aegis (Android
login-code generation), a [CTF flag checker](https://rea.tools/showcase/ctf/),
and [TH04](https://rea.tools/showcase/th04/) (a DOS bullet ring). The README
read here describes TH04 the same way. The index does not print the commands.
None of these are a Marketplace client.

## Write-ups that did not run REA

The run separated these from the showcases. They are adoption posts.

| Source | Date in the run | Use it for | Do not use it for |
| --- | --- | --- | --- |
| [ArshTechPro on DEV](https://dev.to/arshtechpro/rea-let-your-ai-agent-reverse-engineer-the-app-features-you-wish-you-had-3en7) | 8 October 2026 | Setup and the words `analyze`, `search`, `trace` | A finished investigation. `search` here is the binary command. |
| [Eigent](https://www.eigent.ai/blog/rea-reverse-engineer-anything) | 12 October 2026 | Chrome-family website analysis, evidence-shaped workflows | A completed target with original output. |
| [OpenAgentSkill](https://www.openagentskill.com/blog/rea-reverse-engineering-skill-guide) | sources checked 12 October 2026 | The CLI spelling `analyze-javascript-application` | Validation. The post says it did not execute REA. |
| [reverseengineeranything.app](https://reverseengineeranything.app/) | undated | A restatement of the dinosaur and Calculator examples | A second, independent result. |
| [MindStudio](https://www.mindstudio.ai/blog/reverse-engineer-anything-mcp) | cited, not dated in the summary | Another overview | A case study. |

Issue [#4229](https://github.com/morluto/rea/issues) (coygeek, 15 October
2026, "Loader-alias getter replacement leaves false Electron BrowserWindow
evidence") is a failure report. The run did not treat the title as a
reproduction. It is a reminder that JavaScript identity evidence can be
wrong, which is why a create-page report has to keep REA's unknowns.

Release `rea-agents` 6.7.0 is the npm record and the GitHub release
published 2026-10-18. The run did not find a 6.7.0 change narrative. The
HAR and SAZ behaviour it quotes is from the 6.5.0 notes of 14 October 2026
(<https://github.com/morluto/rea/releases>).

## What this does not justify

The examples never show REA posting, logging in, or attaching to Firefox.
Copying the dinosaur workflow onto facebook.com inside Camoufox is the
mistake the browser contract rules out. The path that matches the examples
we can actually reuse is in [roadmap.md](roadmap.md): a gated run saves
scripts and a HAR, REA reads the files, the publish machine stays the
thing that touches the form.
