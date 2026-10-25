# svcShredditPartialUserDrawerMenu

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | account |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/partial/user-drawer-menu` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_b2785c18b89996e1adf431e9e29388c2d2e958e468cff70e1e9803810f522ce6` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 360 ms | 27937 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 12: goto /r/popular/: 200, 360 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-alert level=\"error\" duration=\"0\" message=\"We had a server error...\" cause=\"query-bad-response\"></faceplate-alert> <faceplate-loader name=\"UserDrawer_kzVK38\" src=\"concat:8N4Svh85YA,B4azaGpu-D,BAxWHLFDBc,BEAvJs_C8b,BgGVfRnnFW,BvOWmaNPEJ,CbjxY8gDr4,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,Ctuj2Q878I,CXMFPav6cZ,CylLPexIpe,DW6erMf4Fb,Dwt9Fx1AQ-,Dyg3q1gB6W,DZ-1Q62jVR,giCBAJTUJv,jl4kr1F6L0,wDtjPXKjm5\"… (17908 chars)"
```

<!-- facts:end -->

## What it does

A GET of the `user-drawer-menu` partial, the menu behind the account's avatar in the header. Its code wasn't found in Reddit's bundles (the rea Evidence `ev_b2785c18…` has no slice); it is a partial the page loads, here once, about 28 seconds into step 12 (goto /r/popular/), while the idle mouse moved about the page, and the recording doesn't show which element set it off. The answer is the drawer's HTML (a `faceplate-loader` for `UserDrawer`, about 18 KB).

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this menu is the way to the account's own pages and settings, and its answer is where the account's menu items can be read without clicking them.

## What can go wrong

It answered 200, but the body starts with a `faceplate-alert` "We had a server error..." with cause `query-bad-response`, so part of the drawer failed on Reddit's side even though the status was fine. For a run, a 200 here is not enough: the body has to be read for that alert, and a drawer that comes back with it may be missing items.
