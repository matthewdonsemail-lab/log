# ExposeVariant

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | experiments |
| Kind | mutation |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `input` |
| Reads | `data.exposeExperiment`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:25 ai`, `runs/inspect/20261025T124815_MaleficentTry8338/script106.js:4200 statement` |
| rea | `ev_c479322079acc5e9705ab61a5e8726d5e92eaffedc0babbf6f5df7597c433dce` |

Seen 9 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 645 ms | 3131 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 2 | 200 | 402–977 ms | 4824–5809 ms | — |
| inspect | step 5: goto /search/ | 2 | 200 | 359–373 ms | 1599–1600 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 319 ms | 1334 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 336 ms | 2064 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 326 ms | 1703 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 313 ms | 1255 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 645 ms

Sent:

```json
{
  "operation": "ExposeVariant",
  "variables": {
    "input": {
      "experimentName": "shreddit_search_expanded_composer",
      "variant": "ephemeral",
      "experimentVersion": "8"
    }
  }
}
```

Answered:

```json
{
  "data": {
    "exposeExperiment": {
      "errors": null,
      "ok": true
    }
  },
  "errors": [],
  "operation": "ExposeVariant",
  "extensions": {
    "traceID": "c0cb2ac6056035935d479f3174747258"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 402 ms

Sent:

```json
{
  "operation": "ExposeVariant",
  "variables": {
    "input": {
      "experimentName": "new_community_guidance_checklists_m1",
      "variant": "enabled",
      "experimentVersion": "1",
      "targetingInputs": [
        {
          "field": "subreddit_id",
          "value": "t5_2qh1i"
        }
      ]
    }
  }
}
```

Answered:

```json
{
  "data": {
    "exposeExperiment": {
      "errors": null,
      "ok": true
    }
  },
  "errors": [],
  "operation": "ExposeVariant",
  "extensions": {
    "traceID": "81734c0ddba0d799eb72bb6374bca488"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 373 ms

Sent:

```json
{
  "operation": "ExposeVariant",
  "variables": {
    "input": {
      "experimentName": "shreddit_search_expanded_composer",
      "variant": "ephemeral",
      "experimentVersion": "8"
    }
  }
}
```

Answered:

```json
{
  "data": {
    "exposeExperiment": {
      "errors": null,
      "ok": true
    }
  },
  "errors": [],
  "operation": "ExposeVariant",
  "extensions": {
    "traceID": "4cd8eca9e11e912d69ee0d88982cce21"
  }
}
```

<!-- facts:end -->

## What it does

`ai(e)` sends the GraphQL mutation ExposeVariant with `{input}` to record that this user was shown one variant of an experiment: `experimentName`, `variant`, `experimentVersion` and sometimes `targetingInputs` (in our run, `shreddit_search_expanded_composer` `ephemeral` on home and search, and `new_community_guidance_checklists_m1` `enabled` with r/AskReddit's id). The second call site is a GraphQL client that sends it as a persisted query, `{name: "ExposeVariant", hash: "350fd154…"}` (rea `ev_c4793220…`). It fired on every page we opened, as each experiment's feature came on screen.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, these calls say which experiments our account is in, so a page that looks different between two runs can be checked against them first.

## What can go wrong

All nine recorded calls answered 200 with `ok: true` and no errors. In the persisted-query client a 401 refreshes the token and tries again, any other status or an unreadable answer throws and is logged, and the call is abandoned after 10 s; none of this changes the page, so a failed exposure never stops a run.
