# The REA spec

This is the question the REA research set out to answer, written down so the web research and the SubQ ranking had one target. The question: how can REA be used on the Facebook client log already opens (Playwright driving Camoufox) without weakening any of log's launch gates, and can its evidence check the humanize setting and the identity-leak study? It wasn't a change to the publish machine. Read it to understand the limits every option had to respect.

## The question

Make REA usable on the Facebook client log already opens, which is Playwright driving Camoufox. Then use that evidence to check two pieces of existing work:

- the humanize setting at launch, in `python/browser/visibleBrowser.py`;
- the 22 identity-leak surfaces in `docs/identityLeaks/`.

The way there is public evidence, not a new browser. Web research looks for every public REA use against a Meta product, and for public code that records a Playwright Firefox page. SubQ's Decisions API ranks the ways to connect those findings to this client. The winner has to keep the gate.

## What "works with Playwright and Camoufox" means

A run that has already passed `checkRunnable`, the proxy gate, the device pin, the locale pin and the launch self-check may save two files from the page it's showing:

1. the scripts the page loaded;
2. a HAR of the responses the page itself requested.

REA then reads those files from disk. It doesn't launch Camoufox, attach to the window, or click.

These don't count as answers:

- **Exposing the Chrome DevTools Protocol from Camoufox.** REA's page tools speak CDP, but Camoufox is Firefox, and no public REA document describes that attach.
- **Pointing REA at an AdsPower Chromium session.** That's the earlier production poster's browser (`agent/src/adspower.ts` line 210), outside log's gate.
- **Replacing Camoufox with Chrome so REA can attach.** log's browser for this path is Camoufox, visible, with humanize set and the cursor shown.
- **Calling the Graph API, or replaying a captured request.** The listener log would copy, `NativeResponseAdapter`, never constructs requests.

## Humanize, already in the client

`python/browser/visibleBrowser.py` is the only launch.

- `HUMANIZE_MAX_SECONDS` is `1.5`. It must be a float: a comment records that a boolean hangs `mouse.move` on current Camoufox builds. The earlier Camoufox client's `session_manager.py` notes the same (`humanize=1.5`).
- `showcursor` is true and `headless` is false.
- `launch_kwargs` merges these with the proxy gate. There's no flag to turn them off.

A finding is useful here only if it cites a Camoufox or Playwright file and says whether the float, the cursor flag or the visible launch is wrong. A finding that says to turn humanize off is out.

## The 22 surfaces

They're the rows in `docs/identityLeaks/README.md`. At the time, these were still open: the canvas hash changes every launch, WebGL pixels come from the machine's GPU, Camoufox detectability wasn't re-measured on 156.0.1-beta.39, a person at the keyboard during sign-in, and listing text. The others were fixed or not leaking, on the evidence in that folder.

REA doesn't close those rows. A saved script can show whether the create page's own code reads a surface. That's a check on the study, not a new countermeasure, and a script that never touches a surface doesn't prove Facebook's servers ignore it.

## What the web research was asked

Three research runs (processor `pro-fast`, text output, `POST https://api.parallel.ai/v1/tasks/runs`):

| Report | Question |
| --- | --- |
| [meta](parallel/meta.md) | Every public REA use against a Meta product since 14 April 2026. If none, say none. |
| [playwright](parallel/playwright.md) | Public code for observing Playwright Firefox or Camoufox: HAR, scripts, Juggler, BiDi. |
| [humanize](parallel/humanize.md) | Public code for Camoufox `humanize`, and primary sources for the 22 surfaces. |

Each report is stored as returned. A thin result is still a result; it isn't filled in with guesses.

## What SubQ was asked

SubQ's Decisions API (<https://docs.subq.ai/markdown/endpoints/decisions-api.md>, read on 2026-10-18): `POST https://api.subq.ai/v1/systemone`, model `subq-snap-preview`, `Authorization: Bearer <SUBQ_API_KEY>`. One to sixteen questions per call, with the whole context fitting in 384K tokens.

- **Context:** this spec, the three research reports, `visibleBrowser.py`, and the identity-leak status table.
- **Questions:** in `matrix/`. The script is `matrix/runMatrix.mjs`, which follows `docs/scaleArchitecture/runSubqScaleMatrix.mjs`: a choice, then scores, then true/false claims.
- **Output:** `matrix/subqResults.json`, explained in [the ranking](matrix/README.md).

## Done when

- The three reports are saved and cited from [Sources](sources.md).
- The ranking names one option, and the claims the evidence supports.
- The recommended option still goes through `launch_kwargs`.
- `log.md` records the doc change in the commit that adds it.
- No Facebook session was opened for this work, and no cookie or proxy was written into the repo.
