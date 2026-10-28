# FBScrapingWarningMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | mutation |
| doc_id | `24406519995698862` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `fb_scraping_warning_clear` |
| Called from | `FBScrapingWarningMutation` |
| rea | `ev_dc1eb4f7a79a423e31e0b8c54cbd8b6984b20ccdb4abc3de5db86a84686f4c77` |

Seen 4 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Auto-login: answered automatedBehaviour. | 1 | 200 | 1077 ms | 2 ms | — |
| host | step 3: clickRole button "…" | 1 | 200 | 2114 ms | 976 ms | — |
| host | step 28: clickRole button "…" | 1 | 200 | 1113 ms | 1192 ms | — |
| host | step 18: clickRole button "…" | 1 | 200 | 731 ms | 800 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T164654_61594285317994**, step 18: clickRole button "…": 200, 731 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBScrapingWarningMutation",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "24406519995698862"
}
```

Answered:

```json
{
  "data": {
    "fb_scraping_warning_clear": {
      "success": true
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793033458851,
      "time_at_flush_ms": 1793033459436
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Clears Facebook's scraping warning on the account (`fb_scraping_warning_clear`). It fires about 530 ms after the "We suspect automated behaviour on your account" page is dismissed: dismissing that page is this request. So Facebook had flagged the account as scraping before the page was shown.

## What our machine does with it

The connect machine's `automatedBehaviour` page kind dismisses the warning (Listaro's path, rule 23), which sends this. The machine reads the page, not this response; the next page read decides where it goes.

## What can go wrong

Seen only on Philadelphia, the account later sent to a video selfie. A scraping flag is the earliest sign in our recordings that Facebook distrusted it, so any run that meets this should be read back (rule 25) before the account runs again. No error seen yet; a non-200 would mean the warning stayed and the next page is likely a checkpoint.
