# EnrollInStreaks

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | experiments |
| Kind | mutation |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `input` |
| Reads | `data.enrollInGamification`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script114.js:47 anonymous` |
| rea | `ev_5a641c4d57b5f35719fc15447c137bf3f5e5b0fbfc6acbb532f1a32c505b16ad` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 638 ms | 3132 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 638 ms

Sent:

```json
{
  "operation": "EnrollInStreaks",
  "variables": {
    "input": {
      "timezone": "Asia/Saigon",
      "gameId": "achievements"
    }
  }
}
```

Answered:

```json
{
  "data": {
    "enrollInGamification": {
      "ok": true,
      "status": "ENROLLED",
      "errors": null
    }
  },
  "errors": [],
  "operation": "EnrollInStreaks",
  "extensions": {
    "traceID": "793e89432aae385f60686c67834f5393"
  }
}
```

<!-- facts:end -->

## What it does

The `achievement-events` element's `enrollUserIntoAchievements()` sends the GraphQL mutation EnrollInStreaks with `gameId: "achievements"` and the browser's own timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`), to enrol the user in Reddit's achievements and streaks. On `ok` it saves `<userId>-<status>` under `achievements-store` in local storage, and it only runs when that entry doesn't already say Enrolled; the same element also subscribes to achievement notifications (`SubscribeSubscription`, the slice's one finding in rea `ev_5a641c4d…`). It fired on the home page (step 1).

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. It matters for how the account looks: the mutation sends the browser's timezone, and ours sent `Asia/Saigon`, so if log-cli acts on Reddit for an account whose home is elsewhere, this call is one place the profile's timezone reaches Reddit.

## What can go wrong

The one recorded call answered 200 with `ok: true` and `status: ENROLLED`. In the code an answer without `ok` just returns without saving, so it is tried again on the next page, and any thrown error is caught and only reported (`t.Cc(e)`). Nothing on the page waits for it, so it never stops a run.
