# CreateCaptchaToken

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | account |
| Kind | mutation |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `input` |
| Reads | `data.createCaptchaToken`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script111.js:15 anonymous` |
| rea | `ev_1487d2203e5198e4bbf7b178ae47731d1f00e8465d1e0b6f28430abba82e8d1a` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 587 ms | 6861 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 1154 ms | 8868 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 334 ms | 3195 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 324 ms | 4625 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 461 ms | 3923 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 399 ms | 3241 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 309 ms | 3943 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 587 ms

Sent:

```json
{
  "operation": "CreateCaptchaToken",
  "variables": {
    "input": {}
  }
}
```

Answered:

```json
{
  "data": {
    "createCaptchaToken": "(taken out)"
  },
  "errors": [],
  "operation": "CreateCaptchaToken",
  "extensions": {
    "traceID": "ec1843e75a85a20111f77d4e8b96eb81"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 1154 ms

Sent:

```json
{
  "operation": "CreateCaptchaToken",
  "variables": {
    "input": {}
  }
}
```

Answered:

```json
{
  "data": {
    "createCaptchaToken": "(taken out)"
  },
  "errors": [],
  "operation": "CreateCaptchaToken",
  "extensions": {
    "traceID": "1e732f66e3d155d3558fb75059e4e1df"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 334 ms

Sent:

```json
{
  "operation": "CreateCaptchaToken",
  "variables": {
    "input": {}
  }
}
```

Answered:

```json
{
  "data": {
    "createCaptchaToken": "(taken out)"
  },
  "errors": [],
  "operation": "CreateCaptchaToken",
  "extensions": {
    "traceID": "a62f4c206ec55e0f1ad76da4a745cba6"
  }
}
```

<!-- facts:end -->

## What it does

The `reputation-recaptcha` element in Reddit's bundle (rea `ev_1487d220…`, `script111.js`) runs `execute()` when it is attached to the page and again on every `afterRoute` navigation: it loads reCAPTCHA with the element's `site-key`, makes a token for the page type (`loadAndGenerateTokenSafe`), and `sendToken()` posts it through the GraphQL client as `CreateCaptchaToken` with `input.token` (the token is taken out of the sample, which is why `input` shows empty). It is a background score token that goes with every page, not a challenge the person sees. It fired once in every page load of our run (steps 1, 3, 5, 6, 10, 11 and 12), 3-9 seconds after the goto.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this is the call that shows Reddit got a reCAPTCHA score for the session's pages before any action, so a run that never sends it looks different from the web client.

## What can go wrong

Every call in our run came back 200 with `errors` empty and a token in `data.createCaptchaToken`. In the code, no answer, a non-empty `errors`, or `createCaptchaToken.ok === false` throws "Failed to transport reputation recaptcha token", which is sent to Sentry and makes `execute()` return false; the page carries on and nothing is shown. For a run, an error here would mean Reddit has no fresh reCAPTCHA score for that page, which may matter for the next action, but the recording has never shown one.
