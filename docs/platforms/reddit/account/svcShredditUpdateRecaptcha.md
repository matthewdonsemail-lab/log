# svcShredditUpdateRecaptcha

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | account |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/update-recaptcha` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:44 $p` |
| rea | `ev_357a2e409e025af5104d5cd0035e0e370ac26175c4b396f871207a5b7d516267` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 464 ms | 2680 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 674 ms | 4517 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 325 ms | 1176 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 818 ms | 966 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 317 ms | 1162 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 298 ms | 1542 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 374 ms | 748 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 464 ms

Sent:

```json
{
  "query": {
    "k": "aG9tZXxpbml0aWFsfDk4N2I3NTRjLWVmYjItNGE3YS1iN2ViLTQ5MmM2ZTBjZDRkMg"
  },
  "body": null
}
```

Answered:

```json
"OK"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 674 ms

Sent:

```json
{
  "query": {
    "k": "Y29tbXVuaXR5fGluaXRpYWx8M2FmZDYyOTktNDFhYS00NzAxLThkNjktOWIyM2ZmMzM2YjQ0"
  },
  "body": null
}
```

Answered:

```json
"OK"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 325 ms

Sent:

```json
{
  "query": {
    "k": "c2VhcmNoX3Jlc3VsdHN8aW5pdGlhbHw0MTgwMzM3My1lYTFmLTQ0ODMtOTE4OC01ZDQzZTkwZDczYzU"
  },
  "body": null
}
```

Answered:

```json
"OK"
```

<!-- facts:end -->

## What it does

`$p()` in Reddit's bundle (rea `ev_357a2e40…`, `script0.js`) makes this GET on a page view when `shouldUpdateRecaptcha` is set and the route isn't excluded (`yl()`): `k` is base64 of `pageType|triggerType|serverRenderId`, e.g. `home|initial|<id>` on step 1 and `community|initial|<id>` on step 3. It tells Reddit's server which page and render a reCAPTCHA token belongs to, and it answered "OK" every time. It fired on every page load of our run, within 1-5 seconds of the goto.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, it goes with `CreateCaptchaToken`: together they are the reCAPTCHA trail the web client leaves on each page view.

## What can go wrong

All seven calls were 200 "OK". `$p()` returns the fetch without reading it, so a failure changes nothing on the page; for a run it would only mean that page view's reCAPTCHA wasn't tied to its render. Nothing else has been seen.
