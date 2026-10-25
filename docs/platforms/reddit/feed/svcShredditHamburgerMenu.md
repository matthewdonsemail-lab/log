# svcShredditHamburgerMenu

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | feed |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/hamburger-menu` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:840 anonymous` |
| rea | `ev_f3e179f6ef54fb9b22663e4e58be10f0f0c4b81d293c565998a743f4094771b7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 11: goto /notifications | 1 | 200 | 306 ms | 7768 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 11: goto /notifications: 200, 306 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"HamburgerMenu_nwYSWB\" src=\"concat:Ao1SgzdS5N,B4azaGpu-D,BGZ-nd1DBK,BpOJq76-SY,BQsgkJ4lDx,BvOWmaNPEJ,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,CwGbZ5ZxpN,DCOj0oSMGE,DCsN1jnZED,Do6GBqMtjV,Dwt9Fx1AQ-,Dyg3q1gB6W,IxxeVlpudr,NuF5vvKpn_\" loading=\"eager\" data-prefix=\"en-US/\">\n    \n        <script nonce=\"Y9J7Em0Xf2U_LAfPpJx8bpLP\">\n          (() => {\nSML.load([\"Ao1SgzdS5… (2108 chars)"
```

<!-- facts:end -->

## What it does

Loads the header's hamburger menu (the left navigation shown in a dialog on narrow windows) as a server-rendered partial, `<faceplate-loader name="HamburgerMenu_…">`. The slice rea read (`ev_f3e179f6ef54fb9b22663e4e58be10f0f0c4b81d293c565998a743f4094771b7`) is the `reddit-header-large` element: `initialize()` hooks `#navbar-menu-button`, and `handleClickHamburgerMenu` opens the `rpl-dialog#menu` slotted as `reddit-header-hamburger-menu`, closing it again once the window is 1200 px or wider. The fetch itself is the shared partial loader (`script1.js:840`). In our run it fired once, 7.8 s into step 11 (goto /notifications), with nothing sent.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. It only matters if a flow ever has to reach the left navigation through the menu button on a narrow window.

## What can go wrong

It answered 200 in 306 ms, the only time it was seen. If it failed, the menu dialog would have nothing in it; the header code shows no error handling for the partial, and nothing in our runs depends on it.
