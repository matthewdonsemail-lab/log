# Spec: REA on our Playwright Camoufox session

Written 2026-10-18. This is the ask, stated so the research and the SubQ
matrix have one target. It is not a change to the publish machine.

## The ask

Make REA usable on the Facebook client we already open, which is Playwright
driving Camoufox. Then use that evidence to check two bodies of work we
already have:

- the humanize launch in `python/browser/visibleBrowser.py`
- the 22 identity-leak vectors in `docs/identityLeaks/`

The way there is public evidence, not a new browser. Parallel searches for
every public REA use against a Meta product, and for the public code that
records a Playwright Firefox page. SubQ's Decisions API ranks the ways to
connect those findings to this client. The winner has to keep the gate.

## What "work with Playwright and Camoufox" means

A run that already passed `checkRunnable`, the proxy gate, the device pin,
the locale pin and the launch self-check may save two artifacts from the
page the session is already showing:

1. The scripts the page loaded.
2. A HAR of responses the page itself requested.

REA then reads those files on disk. It does not launch Camoufox, it does
not attach to the window, and it does not click.

These are not acceptable readings of the ask:

- Expose Chrome DevTools Protocol from Camoufox. REA's page tools speak
  CDP. Camoufox is Firefox. No public REA document describes that attach.
- Point REA at an AdsPower Chromium session. That is Listaro's browser
  (`agent/src/adspower.ts` line 210). It is outside this gate.
- Replace Camoufox with Chrome so REA can attach. Rule 11 is Camoufox,
  headed, `humanize` set, cursor shown.
- Call the Graph API, or replay a captured request. The listener we would
  copy, `NativeResponseAdapter`, does not construct requests.

## Humanize, the part already in the client

`python/browser/visibleBrowser.py` is the only launch. `HUMANIZE_MAX_SECONDS` is
`1.5`. The comment records the bug: `humanize` must be a float, because a
boolean hangs `mouse.move` on current Camoufox builds. The same note is in
facebook-camofox-client `session_manager.py` (`humanize=1.5`). `showcursor`
is true. `headless` is false. `launch_kwargs` merges that with the proxy
gate. There is no flag to turn it off.

A finding is useful here only if it cites a Camoufox or Playwright file and
says whether our float, our cursor flag, or our headed launch is wrong.
A finding that tells us to turn humanize off is out.

## The 22 vectors

They are the rows in `docs/identityLeaks/README.md`. Status is at
`2de5ff5`. Still open after that commit: canvas hash changes every launch,
WebGL pixels are this PC's GPU, Camoufox detectability was not re-measured
on 156.0.1-beta.39, a person at the keyboard during sign-in, and listing
text. The others are fixed or not leaking, on the evidence in that folder.

REA does not close those rows. A saved script can show whether the create
page's own code reads a surface. That is a check on the study. It is not a
new countermeasure, and a script that never touches a surface does not
prove Facebook's servers ignore it.

## What Parallel is asked for

Three Task runs, processor `pro-fast`, text output, key from
`.buzz/.env.local` (`PARALLEL_API_KEY`), `POST https://api.parallel.ai/v1/tasks/runs`:

| File | Run | Question |
| --- | --- | --- |
| `parallel/meta.md` | `trun_95b43607c5a64df482cdcd13bfc14fa0` | Every public REA use against a Meta product since 14 April 2026. If none, say none. |
| `parallel/playwright.md` | `trun_95b43607c5a64df4b1dfcebcb1162815` | Public code for observing Playwright Firefox or Camoufox: HAR, scripts, Juggler, BiDi. |
| `parallel/humanize.md` | `trun_95b43607c5a64df480d64b6bd7477a60` | Public code for Camoufox `humanize`, and primary sources for the 22 surfaces. |

Each report is stored as returned. A thin result is a result. It is not
filled in with guesses.

## What SubQ is asked for

Decisions API, read from
<https://docs.subq.ai/markdown/endpoints/decisions-api.md> on 2026-10-18.
`POST https://api.subq.ai/v1/systemone`, model `subq-snap-preview`,
`Authorization: Bearer` the `SUBQ_API_KEY` in `.buzz/.env.local`. One to
sixteen questions per call. The state must fit 384K tokens.

The state is this spec, the three Parallel reports, `visibleBrowser.py`,
and the identity-leak status table. The questions are in `matrix/`. The
script is `matrix/runMatrix.mjs`. It follows
`docs/scaleArchitecture/runSubqScaleMatrix.mjs`: choice, then score, then
true/false claims. Output is `matrix/subqResults.json` and
`matrix/README.md`.

## Done when

- The three reports are on disk and cited from `sources.md`.
- The matrix names one option, and the claims that the evidence supports.
- The recommended option still enters through `launch_kwargs`.
- `log.md` records the doc change on the commit that adds it.
- No Facebook session was opened for this work, and no cookie or proxy was written into the repo.
