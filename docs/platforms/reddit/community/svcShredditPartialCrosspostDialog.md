# svcShredditPartialCrosspostDialog

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | community |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/partial/crosspost-dialog` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:1475 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:130 anonymous` |
| rea | `ev_a66b2f6f7c310d323a206587a0ec80388256e37f52c6091bbbf2ed991f69248c` |

Seen 6 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 976 ms | 2770 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 613 ms | 4604 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 370 ms | 1256 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 383 ms | 1026 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 625 ms | 1235 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 355 ms | 934 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 976 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"CrosspostDialogDesktop_XpstDd\" src=\"concat:Ao1SgzdS5N,B4azaGpu-D,BeLwdK0x8v,BGZ-nd1DBK,BpOJq76-SY,BQsgkJ4lDx,BvOWmaNPEJ,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,CduUKQEdoo,COK-wVBdxx,Cp7VcC-uun,CwGbZ5ZxpN,CX27rU6tdm,CylLPexIpe,DabYop_mOQ,DCOj0oSMGE,DCsN1jnZED,DN6zbZ6_Ke,DqkCfNPD_v,DsVco_yHGz,DVq0oBRqNf,Dwt9Fx1AQ-,Dyg3q1gB6W,DZ-1Q62jVR,DZcSDD0zpH,HejvpGEapx,IxxeVlpudr,jR4stjsgSR,NuF… (20733 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 613 ms

Sent:

```json
{
  "query": {
    "params": "prefix=r&subredditName=AskReddit",
    "sig": "v1.C_0yPQcLvzPgRJooCM6tg2T3omPijYP70j489_gNy1c"
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"CrosspostDialogDesktop_XpstDd\" src=\"concat:Ao1SgzdS5N,B4azaGpu-D,BeLwdK0x8v,BGZ-nd1DBK,BpOJq76-SY,BQsgkJ4lDx,BvOWmaNPEJ,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,CduUKQEdoo,COK-wVBdxx,Cp7VcC-uun,CwGbZ5ZxpN,CX27rU6tdm,CylLPexIpe,DabYop_mOQ,DCOj0oSMGE,DCsN1jnZED,DN6zbZ6_Ke,DqkCfNPD_v,DsVco_yHGz,DVq0oBRqNf,Dwt9Fx1AQ-,Dyg3q1gB6W,DZ-1Q62jVR,DZcSDD0zpH,HejvpGEapx,IxxeVlpudr,jR4stjsgSR,NuF… (20834 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 370 ms

Sent:

```json
{
  "query": {
    "query": {
      "q": "junk removal"
    }
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"CrosspostDialogDesktop_XpstDd\" src=\"concat:Ao1SgzdS5N,B4azaGpu-D,BeLwdK0x8v,BGZ-nd1DBK,BpOJq76-SY,BQsgkJ4lDx,BvOWmaNPEJ,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,CduUKQEdoo,COK-wVBdxx,Cp7VcC-uun,CwGbZ5ZxpN,CX27rU6tdm,CylLPexIpe,DabYop_mOQ,DCOj0oSMGE,DCsN1jnZED,DN6zbZ6_Ke,DqkCfNPD_v,DsVco_yHGz,DVq0oBRqNf,Dwt9Fx1AQ-,Dyg3q1gB6W,DZ-1Q62jVR,DZcSDD0zpH,HejvpGEapx,IxxeVlpudr,jR4stjsgSR,NuF… (20774 chars)"
```

<!-- facts:end -->

## What it does

This partial is the crosspost dialog, for sharing a post into another community. It is fetched as page HTML by a `<faceplate-partial>` with the page's signed `params` (for example `prefix=r&subredditName=AskReddit`) or the search query, and its answer is a `faceplate-loader` named `CrosspostDialogDesktop` plus the dialog's markup, about 20 KB. The slices show the client side: the `crosspost-dialog-opener` element, whose `open()` first checks whether human verification is needed (`maybeOpenHumanVerificationContributionDialog`), then fills the destination picker and shows `#crosspost-action-dialog`, or falls back to the plain link when the dialog isn't on the page (rea `ev_a66b2f6f…`). It fired on every page we opened (home, r/AskReddit, search, a post, the profile, r/popular), before anything was pressed.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli ever shares posts across communities, this dialog and its human-verification check are what the share would go through.

## What can go wrong

All six recorded calls answered 200 in 355-976 ms. When the dialog didn't load, the opener doesn't fail: it opens its `fallback-href` link in the same tab instead, and when human verification is needed it shows that dialog instead of the crosspost one. Neither stops a run that only reads.
