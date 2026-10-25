# svcShredditPartialModContentActions

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | community |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/partial/mod-content-actions` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:692 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:692 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:1561 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script67.js:240 render` |
| rea | `ev_4c1dfe147153046e53653b9c88981be6a5d45a79138c0524afd2c003f8f79b8b` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 2 | 200 | 990–1239 ms | 2742–5824 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 2 | 200 | 317–455 ms | 5058–7835 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 350 ms | 2061 ms | — |
| inspect | step 12: goto /r/popular/ | 2 | 200 | 310–408 ms | 908–3855 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 990 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"ModContentActions_kvBblQ\" src=\"concat:Ao1SgzdS5N,B1kflJ29kB,B4azaGpu-D,B8BMInGTad,Bbd9_SrVQ9,BGZ-nd1DBK,BQhx_ZioV5,BQsgkJ4lDx,BsQWn6nhd-,BupcDWTiIS,BVoUIY8SeX,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,C3gLBVJiFI,C9dKNNa8AN,CbjxY8gDr4,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CVp6x741dg,CylLPexIpe,CzEUb6IYML,DCOj0oSMGE,Dhr6CAaB1r,Dwt9Fx1AQ-,Dyg3q1gB6W,IxxeVlpudr,KoaCEQoNDS,NuF5vvKp… (1064 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 455 ms

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
"<faceplate-loader name=\"ModContentActions_kvBblQ\" src=\"concat:Ao1SgzdS5N,B1kflJ29kB,B4azaGpu-D,B8BMInGTad,Bbd9_SrVQ9,BGZ-nd1DBK,BQhx_ZioV5,BQsgkJ4lDx,BsQWn6nhd-,BupcDWTiIS,BVoUIY8SeX,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,C3gLBVJiFI,C9dKNNa8AN,CbjxY8gDr4,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CVp6x741dg,CylLPexIpe,CzEUb6IYML,DCOj0oSMGE,Dhr6CAaB1r,Dwt9Fx1AQ-,Dyg3q1gB6W,IxxeVlpudr,KoaCEQoNDS,NuF5vvKp… (1064 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 10: goto /user/Maleficent-Try-8338/: 200, 350 ms

Sent:

```json
{
  "query": {
    "params": "username=Maleficent-Try-8338",
    "sig": "v1.si_hiXohWZ68udNem4SF_qBQXvGhCMKVUr5nr-gCjPA"
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"ModContentActions_kvBblQ\" src=\"concat:Ao1SgzdS5N,B1kflJ29kB,B4azaGpu-D,B8BMInGTad,Bbd9_SrVQ9,BGZ-nd1DBK,BQhx_ZioV5,BQsgkJ4lDx,BsQWn6nhd-,BupcDWTiIS,BVoUIY8SeX,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,C3gLBVJiFI,C9dKNNa8AN,CbjxY8gDr4,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CVp6x741dg,CylLPexIpe,CzEUb6IYML,DCOj0oSMGE,Dhr6CAaB1r,Dwt9Fx1AQ-,Dyg3q1gB6W,IxxeVlpudr,KoaCEQoNDS,NuF5vvKp… (1064 chars)"
```

<!-- facts:end -->

## What it does

This partial holds the moderator content actions shown on a post or comment. It is fetched as page HTML by a `<faceplate-partial>` (with the page's signed `params`, such as `subredditName=AskReddit` or `username=Maleficent-Try-8338`), and its answer is a small `faceplate-loader` named `ModContentActions`, about 1 KB. The slices only show where it lands, the `mod-content-actions` slot in the post and comment action bars (`hasCardModContentActions`, `hasCompactModContentActions` and the comment action row's `render()`), not the code that fetches it (rea `ev_4c1dfe14…`). It fired on home, r/AskReddit, the profile and r/popular.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. Our account moderates nothing, so this partial loads its script but shows no actions; it would only matter if a log-cli account were a moderator.

## What can go wrong

All seven recorded calls answered 200 in 310-1239 ms. The action bars only check whether the slot has content, so an empty or failed partial just leaves the slot empty and the page carries on; nothing in a read-only run depends on it.
