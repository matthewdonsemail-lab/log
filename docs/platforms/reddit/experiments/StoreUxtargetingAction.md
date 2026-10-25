# StoreUxtargetingAction

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | experiments |
| Kind | mutation |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `input` |
| Reads | `data.storeUxTargetingAction`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:1477 r` |
| rea | `ev_1eabc44149f598f96afa3c84f9b0dd45c695eb446f0b569a4e6207cdee710c0f` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +493px in 13 wheel steps, 953 ms | 1 | 200 | 345 ms | 3269 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, scroll: +493px in 13 wheel steps, 953 ms: 200, 345 ms

Sent:

```json
{
  "operation": "StoreUxtargetingAction",
  "variables": {
    "input": {
      "action": "VIEW",
      "eligibleExperience": {
        "experience": "STRING_ID_EXPERIENCE",
        "experienceName": "SUBREDDIT_RECOMMENDATIONS_IN_SUBREDDIT_FEED"
      }
    }
  }
}
```

Answered:

```json
{
  "data": {
    "storeUxTargetingAction": {
      "ok": true
    }
  },
  "errors": [],
  "operation": "StoreUxtargetingAction",
  "extensions": {
    "traceID": "58c000b779a965d4f7bd7fad201aa35c"
  }
}
```

<!-- facts:end -->

## What it does

The slice sends the GraphQL mutation StoreUxtargetingAction to tell Reddit what the user did with one targeted piece of the interface: an `action` (here `VIEW`) and the `eligibleExperience` it was on (here `SUBREDDIT_RECOMMENDATIONS_IN_SUBREDDIT_FEED`), with an optional variant, source and client context, and `keepalive` so it can still be sent as the page closes (rea `ev_1eabc441…`). It fired while we scrolled a feed (+493 px), when the community recommendations came into view.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this call shows that a scroll really brought a piece of the feed into view.

## What can go wrong

The one recorded call answered 200 with `ok: true`. When `ok` is missing the code only sends a Sentry message ("Uxtargeting action could not be stored") and returns; nothing waits on it, so it never stops a run.
