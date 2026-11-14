# platformLitmsAllowlistVoyagerWebFeed

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `platform.linkedin.com/litms/allowlist/voyager-web-feed` |
| Sends | — |
| Reads | `pageKey`, `controlUrn` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script72.js:1 statement`, `runs/inspect/20261106T014139_<name:1>/script26.js:1 statement`, `runs/chrome/20261114T213510_<name:1>/script52.js:1 statement`, `runs/chrome/20261114T213510_<name:1>/script23.js:1 statement` |
| rea | `ev_20e22674f7dea99287df8301d13b94bb2bfde00f91caf66fb2061773d49ca888` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 95 ms | 203493 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 1 ms | 2083 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 1 ms | 1936 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 1 ms | 1966 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 1 ms | 2271 ms | — |
| chrome | step 2: send a message, by hand | 2 | 304, 200 | 3–111 ms | 8270–8335 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 95 ms

Sent:

```json
null
```

Answered:

```json
{
  "pageKey": [
    "d_flagship3_feed",
    "p_flagship3_feed",
    "d_flagship3_feed_share"
  ],
  "controlUrn": [
    "urn:li:control:d_flagship3_feed-comment",
    "urn:li:control:d_flagship3_feed-like_toggle",
    "urn:li:control:p_flagship3_feed-comment",
    "urn:li:control:p_flagship3_feed-like_toggle",
    "urn:li:control:d_flagship3_feed-share_post",
    "urn:li:control:d_flagship3_feed-share_sharebox_focus"
  ]
}
```

**runs/inspect/20261107T161246_<name:1>**, step 4: goto /feed/: 200, 1 ms

Sent:

```json
null
```

Answered:

```json
{
  "pageKey": [
    "d_flagship3_feed",
    "p_flagship3_feed",
    "d_flagship3_feed_share"
  ],
  "controlUrn": [
    "urn:li:control:d_flagship3_feed-comment",
    "urn:li:control:d_flagship3_feed-like_toggle",
    "urn:li:control:p_flagship3_feed-comment",
    "urn:li:control:p_flagship3_feed-like_toggle",
    "urn:li:control:d_flagship3_feed-share_post",
    "urn:li:control:d_flagship3_feed-share_sharebox_focus"
  ]
}
```

**runs/inspect/20261107T161246_<name:1>**, step 5: goto /feed/: 200, 1 ms

Sent:

```json
null
```

Answered:

```json
{
  "pageKey": [
    "d_flagship3_feed",
    "p_flagship3_feed",
    "d_flagship3_feed_share"
  ],
  "controlUrn": [
    "urn:li:control:d_flagship3_feed-comment",
    "urn:li:control:d_flagship3_feed-like_toggle",
    "urn:li:control:p_flagship3_feed-comment",
    "urn:li:control:p_flagship3_feed-like_toggle",
    "urn:li:control:d_flagship3_feed-share_post",
    "urn:li:control:d_flagship3_feed-share_sharebox_focus"
  ]
}
```

<!-- facts:end -->

## What it does

The tag manager (LiTMS) loads the feed page's allowlist from `platform.linkedin.com`: the page keys (`d_flagship3_feed`, `p_flagship3_feed`, `d_flagship3_feed_share`) and the control urns (comment, like toggle, share post, sharebox focus) on which tags may fire. It sends nothing and fires on each feed load; after the first fetch it comes from the browser's cache in about 1 ms.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it and reads no allowlist. It is background browser traffic of the feed page.

## What can go wrong

Every answer in our runs is 200. A missing allowlist only stops tags firing in the browser page; a direct-API run doesn't depend on it.
