# w3ReportingPolicy

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | telemetry |
| Kind | endpoint |
| doc_id | — |
| Path | `w3-reporting.reddit.com/policy` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:50 Zh` |
| rea | `ev_1ddeb397f20884912dd459f56cb60b625a63e5c7b684179cbbd83077dc74a11e` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 0 | 257 ms | 2920 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 0, 257 ms

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

A GET to `w3-reporting.reddit.com/policy`, sent once early in step 1 (goto /) with nothing in it. rea read its code (`ev_1ddeb397f20884912dd459f56cb60b625a63e5c7b684179cbbd83077dc74a11e`): `Zh()` is Reddit's W3 reporter, built with `policyUrl` defaulting to this URL, and its `c()` fetches the policy once and keeps it (`s`) before the first report is queued. The policy sets where reports go (`reportingUrls`), whether subdomains are included and the success and failure sampling fractions. It's Reddit's own reporting setup, not something about the account.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). This call carries Reddit's own analytics, and our runs leave it to the browser: nothing waits on it, inspect only records it and names it in each step's `exchanges.json`, and SubQ sees it with the rest of the step.

## What can go wrong

It ended with status 0 after 257 ms: the request never completed in the recording, and the step's HAR names it `net::ERR_ABORTED`, the same on every page in the run. The reports to `w3-reporting.reddit.com/reports` were still sent after it, so its loss changes nothing for a run.
