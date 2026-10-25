# svcShredditCommunityMorePostsBest

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | feed |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/community-more-posts/best` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:9 anonymous` |
| rea | `ev_ad5d2b5ae31e67fba3eba384fefae7ac9b47736ce7461d465da411eed3fdeecd` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 1394 ms | 5127 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 1394 ms

Sent:

```json
{
  "query": {
    "after": "dDNfMXhlc25iNw==",
    "t": "DAY",
    "name": "AskReddit",
    "adDistance": "2",
    "ad_posts_served": "1",
    "navigationSessionId": "c2c141a1-cf7c-4200-885d-e34f732a3b7a",
    "feedLength": "4"
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"SubredditFeedPage_BnsDNZ\" src=\"concat:_lbqF4g9AK,-NhSeDLT5U,0bDQdb-Tbk,53EDCA0WYy,5nK37oUeNY,6mR2x7VKVs,86k8aL5lVl,8N4Svh85YA,8ogLSYR__z,Ao1SgzdS5N,B-ev6fzzU1,B0p5J7ElEL,B0v1LKhzI4,B0YAIg0I9f,B0Z36vqZKB,B1ElgNGbay,B1kflJ29kB,B25vm875rA,B2FMWpMutB,B2pMEl73Mj,B4azaGpu-D,B5hSx9UCwB,B5SKDPzUZZ,B5yQcwRmxW,B6LoPCis_x,B7gFy_wzom,B7KvmUeRnV,B7oPcqNlJd,B837eqDtwN,B8BMInGTad,B8qvlnNp… (680830 chars)"
```

<!-- facts:end -->

## What it does

Loads the next page of a community's feed, sorted Best. The slice rea read (`ev_ad5d2b5ae31e67fba3eba384fefae7ac9b47736ce7461d465da411eed3fdeecd`) is only the route-name table where `SubredditLoadMore` is `community-more-posts`; the fetch itself comes from Reddit's shared partial loader (`script1.js:9`), so no function of its own was found. In our run it fired 5.1 s into step 3 (goto /r/AskReddit/) with `name: AskReddit`, `t: DAY`, `feedLength: 4` and an `after` cursor that is the last post's id (base64 of a `t3_` id), and Reddit answered with server-rendered HTML wrapped in a `<faceplate-loader name="SubredditFeedPage_…">`.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli reads or acts on a community, this is how the community's posts after the first screen are read, page by page, through the `after` cursor.

## What can go wrong

It answered 200 in 1394 ms, the only time it was seen. The answer is HTML, not JSON, so a failed or empty page would show only as missing posts in the partial; the slice shows no error handling of its own, since the shared loader does the fetch.
