# svcShredditDataProtectionConsent

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | account |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/data-protection-consent` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script11.js:5 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:9 anonymous` |
| rea | `ev_3856a20c3c6bc3c89bbc75074bee92f9a91af2d34b136bfa28b9f9f6238d4a73` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 1045 ms | 2717 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 0 | 685 ms | 4542 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 363 ms | 1197 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 353 ms | 986 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 344 ms | 1182 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 352 ms | 1556 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 391 ms | 759 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 1045 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"DataProtectionConsent_qBKqbZ\" src=\"concat:8N4Svh85YA,Ao1SgzdS5N,B4azaGpu-D,BGZ-nd1DBK,BpOJq76-SY,BQsgkJ4lDx,Bu9Cg0lQ4s,BvOWmaNPEJ,BZHTPhFhv1,CbjxY8gDr4,CbO0eYpcxt,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,Ctuj2Q878I,CwGbZ5ZxpN,CylLPexIpe,CzEUb6IYML,DabYop_mOQ,DCOj0oSMGE,DCsN1jnZED,DglZ1q9bGV,Dwt9Fx1AQ-,Dyg3q1gB6W,DZSwo9RUxs,HejvpGEapx,IxxeVlpudr,jl4kr1F6L0,NuF5vvKpn_,QaPKHLmpC-\" loa… (1207 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 0, 685 ms

Sent:

```json
null
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 363 ms

Sent:

```json
null
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

A GET of the page's data-protection-consent partial (named in the partial list in `script11.js`, rea `ev_3856a20c…`). In step 1 it answered a `faceplate-loader` for `DataProtectionConsent` plus an `ac-set-cookie` that sets the consent cookie at load; in every later step it answered an empty body, so once the cookie is there nothing more is served. The `data-protection-consent` element in the slice is the banner's side: accept, reject or hide set `stagedConsentState` and send `UpdateCookieConsentInteractionBanner` through GraphQL. No banner showed in our run's snapshots.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, it only matters as a page state: a consent banner that comes back would sit over the page and need a choice before anything is clicked.

## What can go wrong

Six of seven calls were 200; the one in step 3 has status 0 (the request ended with no answer), which made no difference to the page. The banner code catches a failed `UpdateCookieConsentInteractionBanner` and only sends it to Sentry. A non-empty answer after the first page would mean Reddit wants a consent choice again.
