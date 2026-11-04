# appBoot

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | endpoint |
| doc_id | — |
| Path | `app.slack.com/boot` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261103T065639_mattSlack/script192.js:11 children`, `runs/inspect/20261103T065639_mattSlack/script6.js:16 statement`, `runs/inspect/20261103T065639_mattSlack/script618.js:4 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:193 tlRz` |
| rea | `ev_3f950f5511e42ad6153036f13fd5395b0a2449e37d42dc8d71c817d7af0194b7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 302 ms | 13887 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 302 ms

Sent:

```json
null
```

Answered:

```json
"<!DOCTYPE html><html data-gantry=\"\" data-app=\"client-v2\" data-cdn=\"https://a.slack-edge.com/bv1-13-br/\" data-version-ts=\"1793684253\" data-version-hash=\"2c6eaecfe1c5bc5ec8c84737545fd1425e2efd1b\" data-build-version-ts=\"1793684253\" data-build-manifest-last-modified=\"1793687964\" data-build-number=\"136200\" data-build-experiment-test-id=\"0\" data-build-experiment-control-id=\"0\" data-build-experiment-assi… (194679 chars)"
```

<!-- facts:end -->

## What it does

Is the HTML document of Slack's web client (`app.slack.com/boot`, 194679 chars): it fired 13.9 s into inspect step 4 (`goto /client`), sent nothing and answered 200 in 302 ms with the page whose `data-*` attributes carry the build version and CDN. Every `/api/*` call in the neighbouring docs is made by the scripts this page loads.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. log-cli never loads Slack's page; its direct engine talks to the API itself.

## What can go wrong

If the session cookie is dead the page would be a sign-in page instead of the client, which the browser inspect step shows; the engine never sees it and reports a dead session from its own cookie check (`sessionDead`).
