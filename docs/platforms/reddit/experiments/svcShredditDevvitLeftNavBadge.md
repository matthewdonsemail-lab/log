# svcShredditDevvitLeftNavBadge

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | experiments |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/devvit-left-nav-badge` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_f322b36dde9e0c8ddebceccd0a0499cc36b348e013d73890e4b742bdcb6f3863` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 990 ms | 2768 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 626 ms | 4598 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 370 ms | 1253 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 434 ms | 1017 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 1091 ms | 1232 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 351 ms | 1575 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 357 ms | 786 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 990 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"DevvitLeftNavBadge_ljsxvx\" src=\"concat:BGZ-nd1DBK,BQsgkJ4lDx,BvOWmaNPEJ,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,D-o5VAnjXC,DUieWgaDmM,Dwt9Fx1AQ-,Dyg3q1gB6W,NuF5vvKpn_\" loading=\"eager\" data-prefix=\"en-US/\">\n    \n        <script nonce=\"7e46DnfzZBLXMGk1H1dCxSv-\">\n          (() => {\nSML.load([\"BGZ-nd1DBK\",\"BQsgkJ4lDx\",\"BvOWmaNPEJ\",\"CBwOyNjLvJ\",\"COK-wVBdxx\",\"Cp7VcC-uun\",\"D-o5VAnjXC\",\"D… (748 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 626 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"DevvitLeftNavBadge_ljsxvx\" src=\"concat:BGZ-nd1DBK,BQsgkJ4lDx,BvOWmaNPEJ,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,D-o5VAnjXC,DUieWgaDmM,Dwt9Fx1AQ-,Dyg3q1gB6W,NuF5vvKpn_\" loading=\"eager\" data-prefix=\"en-US/\">\n    \n        <script nonce=\"MZRwt_t9AORe1TSmvwZw63M5\">\n          (() => {\nSML.load([\"BGZ-nd1DBK\",\"BQsgkJ4lDx\",\"BvOWmaNPEJ\",\"CBwOyNjLvJ\",\"COK-wVBdxx\",\"Cp7VcC-uun\",\"D-o5VAnjXC\",\"D… (748 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 370 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"DevvitLeftNavBadge_ljsxvx\" src=\"concat:BGZ-nd1DBK,BQsgkJ4lDx,BvOWmaNPEJ,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,D-o5VAnjXC,DUieWgaDmM,Dwt9Fx1AQ-,Dyg3q1gB6W,NuF5vvKpn_\" loading=\"eager\" data-prefix=\"en-US/\">\n    \n        <script nonce=\"ay4tJcDCXiI2nfgociUtYjVK\">\n          (() => {\nSML.load([\"BGZ-nd1DBK\",\"BQsgkJ4lDx\",\"BvOWmaNPEJ\",\"CBwOyNjLvJ\",\"COK-wVBdxx\",\"Cp7VcC-uun\",\"D-o5VAnjXC\",\"D… (748 chars)"
```

<!-- facts:end -->

## What it does

This partial is the badge on the left navigation for Devvit, Reddit's developer platform. Its code wasn't found in the bundles we read (no call site and no slice): it is loaded from the page's HTML, and its answer is a `faceplate-loader` named `DevvitLeftNavBadge` with its scripts plus a `data-feature="devvit-left-nav-badge"` element, about 750 bytes (rea `ev_f322b36d…`). It fired on every page we opened, a second or so after the step began.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. Nothing log-cli would do on Reddit depends on it; it is part of the left navigation's furniture.

## What can go wrong

All seven recorded calls answered 200 in 351-1091 ms. With no code found, all we can say is that a failure would leave the badge out of the navigation; nothing in a run depends on it.
