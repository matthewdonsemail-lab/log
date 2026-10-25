# w3ReportingReports

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | telemetry |
| Kind | endpoint |
| doc_id | — |
| Path | `w3-reporting.reddit.com/reports` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:50 Zh` |
| rea | `ev_a0900cc4da1ca39914046767a7b89709c1d1bec48228118e051e5982c6469e97` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 0 | 413 ms | 5883 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 0 | 430 ms | 7910 ms | — |
| inspect | step 5: goto /search/ | 1 | 0 | 490 ms | 4164 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 0 | 363 ms | 3957 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 0 | 414 ms | 4152 ms | — |
| inspect | step 11: goto /notifications | 1 | 0 | 410 ms | 4537 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 0 | 313 ms | 3913 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 0, 413 ms

Sent:

```json
"[{\"age\":2716,\"type\":\"reddit-w3reporting\",\"url\":\"\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36\",\"body\":{\"sampling_fraction\":0.99,\"type\":\"counter\",\"name\":\"shreddit_page_views\",\"value\":1,\"labels\":{\"auth_state\":\"logged_in\",\"browser\":\"chrome\",\"deployment_type\":\"main\",\"device_type\":\"desktop\",\"page_type\":\"home\",\"referrer_ty… (415 chars)"
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 0, 430 ms

Sent:

```json
"[{\"age\":2794,\"type\":\"reddit-w3reporting\",\"url\":\"\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36\",\"body\":{\"sampling_fraction\":0.99,\"type\":\"counter\",\"name\":\"shreddit_page_views\",\"value\":1,\"labels\":{\"auth_state\":\"logged_in\",\"browser\":\"chrome\",\"deployment_type\":\"main\",\"device_type\":\"desktop\",\"page_type\":\"community\",\"referr… (420 chars)"
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 0, 490 ms

Sent:

```json
"[{\"age\":2522,\"type\":\"reddit-w3reporting\",\"url\":\"\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36\",\"body\":{\"sampling_fraction\":0.99,\"type\":\"counter\",\"name\":\"shreddit_page_views\",\"value\":1,\"labels\":{\"auth_state\":\"logged_in\",\"browser\":\"chrome\",\"deployment_type\":\"main\",\"device_type\":\"desktop\",\"page_type\":\"search_results\",\"r… (425 chars)"
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Sends Reddit's W3 reports, lists of `reddit-w3reporting` counters and timings such as `shreddit_page_views`, each with a `sampling_fraction` of 0.99, to `w3-reporting.reddit.com/reports`. rea read its code (`ev_a0900cc4da1ca39914046767a7b89709c1d1bec48228118e051e5982c6469e97`): `Zh()` queues each report and flushes a batch every 3 s, waiting longer after each failure (`i*Math.exp(a.attempt)`), sends time-sensitive reports in their own queue, and flushes whatever is left when the tab is hidden (`visibilitychange`). The page-speed handler in `shreddit-app` feeds it through `handleWebVitalW3Reporting` (see `svcShredditPerfmetrics`). It fired once on every page we opened, 3.9 to 7.9 s after the goto.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). This call carries Reddit's own analytics, and our runs leave it to the browser: nothing waits on it, inspect only records it and names it in each step's `exchanges.json`, and SubQ sees it with the rest of the step.

## What can go wrong

Every recorded fetch ended with status 0, never completing (`net::ERR_ABORTED` in the step's HAR), though the same HAR holds other POSTs to this path, without the fetch's headers, that answered 200. When a send fails, `$h()` reads the answer's `invalid` list if there is one and reports "Failed to send W3 reports" with the status to Reddit's error tracker (Sentry); nothing is retried. Only Reddit's numbers are lost, and nothing changes for a run.
