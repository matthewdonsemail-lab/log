# promoCampaignsEligibilityInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/promo.campaigns.eligibilityInfo` |
| Sends | `------WebKitFormBoundaryHsWD6Y1ZrBXrgLeY
Content-Disposition: form-data; name` |
| Reads | `ok`, `is_eligible` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script3.js:2977 GSOB` |
| rea | `ev_30d1b73f84d4a18cd2ef1b4bb78339644d7b1314b12c79a724547f1d9d21ac17` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 296 ms | 7276 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 296 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689122.358",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryHsWD6Y1ZrBXrgLeY\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryHsWD6Y1ZrBXrgLeY\r\nContent-Disposition: form-data; name=\"campaign_type\"\r\n\r\npaid_feature_trial\r\n------WebKitFormBoundaryHsWD6Y1ZrBXrgLeY\r\nContent-Disposition: form-data; name=\"campaign_sub_type\"\r\n\r\nshared_channels\r\n------WebKitFormBoundaryHsWD6Y1ZrBXr… (947 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "is_eligible": false
}
```

<!-- facts:end -->

## What it does

Asks whether the workspace is eligible for a promotional campaign: it answered `is_eligible: false`, fired 7.3 s into step 6 (`goto /client/T0C4VCD06MR/D0C8VAE7REU`), 296 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). The recorded answer was 200 with `is_eligible: false`, so no promo screen opened.
