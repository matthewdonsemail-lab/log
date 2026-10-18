# SubQ matrix: how REA meets this Camoufox session

Run 2026-10-18. Model `subq-snap-preview`, `POST https://api.subq.ai/v1/systemone`.
State was 83,051 characters: `spec.md`, the three Parallel reports, the
client and comparison notes, the identity-leak status table, and
`python/visibleBrowser.py`. 279,432 input tokens. Both repeats of the
choice pass and both repeats of the claim pass returned the same answer.
Raw output: `subqResults.json`. Rerun: `node docs/rea/matrix/runMatrix.mjs`.

The Decisions API allows 1–16 questions. This run used 16 criteria, 8
options and 10 claims. Docs read the same day:
<https://docs.subq.ai/markdown/endpoints/decisions-api.md>.

## Winner

**`harAndScripts`.** The gated Camoufox session writes a HAR and the
script bodies. Stock `rea-agents` reads the files offline. It won every
criterion on both passes.

Mean score 3.59 of 4. The next options were scripts only (3.34), HAR only
(3.25), and doing nothing (2.66). Forking REA for Juggler (1.88), switching
to Chrome (1.82), exposing CDP on Camoufox (1.63) and copying Listaro's
AdsPower attach (1.58) lost.

The close calls, still won by `harAndScripts`:

| Criterion | Probability | Next |
| --- | --- | --- |
| effort | 0.42 | HAR only, 0.37 |
| reversible | 0.61 | do nothing, 0.21 |
| public evidence | 0.73 | (still first) |

Lowest scores for the winner: secret safety 2.74, effort 2.96, testability
3.15. A HAR can hold cookies. The capture has to strip them before the file
is written. That is not done yet. Nothing in this run records a HAR.

## Claims (probability true, both passes)

| Claim | p |
| --- | --- |
| REA page tools are Chrome CDP, not Firefox | 0.984 |
| HAR inspection never fetches URLs | 0.983 |
| Listaro's poster is AdsPower CDP, not Camoufox | 0.982 |
| `NativeResponseAdapter` does not call Facebook | 0.982 |
| Canvas hash and shared GPU pixels are still open | 0.978 |
| No public Juggler or Camoufox provider in REA | 0.970 |
| No verified public REA investigation of a Meta product | 0.967 |
| CDP disconnect can clear `navigator.platform` | 0.943 |
| `humanize` must be a float because a boolean hangs | 0.860 |
| A Playwright HAR is a documented REA input | 0.624 |

The last two are the ones not to over-read.

Upstream Camoufox documents `humanize` as `True` or a float
(<https://camoufox.com/python/usage/>). Pull request 682 on
`daijro/camoufox` says `True` turns humanize on without setting
`humanize:maxTime`, and a number sets that maximum. Our client still
passes `1.5` because facebook-camofox-client records that a boolean hangs
`mouse.move` on the build we run (`session_manager.py`). The 0.86 is that
split: local bug note versus the public signature. Do not change
`HUMANIZE_MAX_SECONDS` on the back of this matrix.

0.624 on the HAR claim means SubQ would not treat "Playwright's HAR is
exactly what REA accepts" as shown. REA's own doc says HAR 1.2, and it
notes Playwright can emit `postData.text: null`. The next proof is one
fixture HAR through `rea inspect-web-network-capture`, not a live account.

## What was not found

The meta report's own line: no verified public REA command against
Facebook, Instagram, WhatsApp, Messenger, Marketplace, or the Graph API
in the window 14 April 2026 to 18 October 2026. Issue search hits
([#3667](https://github.com/morluto/rea/issues/3667),
[#2238](https://github.com/morluto/rea/issues/2238),
[#4004](https://github.com/morluto/rea/issues/4004)) are leads, not
implementations. A Facebook group post about REA is an announcement
hosted on Facebook, not an analysis of Facebook.

Marketplace scrapers turned up as separate Playwright projects
(`passivebot/facebook-marketplace-scraper`, `SPolton/fb-marketplace-scraper`,
and others). The report did not verify their launch files, and none of
them use REA. They are not a template for this client.
