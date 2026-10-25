# svcShredditFeedsPopularFeed

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | feed |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/feeds/popular-feed` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:9 anonymous` |
| rea | `ev_b9eb871b431af374cafca8aa1692ff30df562901fa370db3483f0dc3ffa887e2` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 1601 ms | 1319 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 12: goto /r/popular/: 200, 1601 ms

Sent:

```json
{
  "query": {
    "after": "dDNfMXhlcmM2aA==",
    "distance": "4",
    "adDistance": "2",
    "navigationSessionId": "2cf4367c-4689-40c9-acaf-c20587adc09f",
    "ad_posts_served": "1",
    "cursor": "dDNfMXhlcmM2aA==",
    "sort": "BEST"
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"PopularFeed_hWXPsq\" src=\"concat:_lbqF4g9AK,0bDQdb-Tbk,53EDCA0WYy,86k8aL5lVl,8N4Svh85YA,8ogLSYR__z,Ao1SgzdS5N,B-ev6fzzU1,B0p5J7ElEL,B0v1LKhzI4,B0YAIg0I9f,B1ElgNGbay,B25vm875rA,B2FMWpMutB,B4azaGpu-D,B5hSx9UCwB,B5SKDPzUZZ,B5yQcwRmxW,B6LoPCis_x,B7gFy_wzom,B7KvmUeRnV,B7oPcqNlJd,B837eqDtwN,B8BMInGTad,B8qvlnNp9V,B92lQWhBDc,BApWdi6Z38,BAxWHLFDBc,BBf_MZZko8,BCaFsOVFH0,BdvEwe6ixJ,BdW… (772886 chars)"
```

<!-- facts:end -->

## What it does

Loads the next page of the Popular feed. The slice rea read (`ev_b9eb871b431af374cafca8aa1692ff30df562901fa370db3483f0dc3ffa887e2`) is the route-name table where `POPULAR_LOAD_MORE` is `popular-feed-load-more`; the fetch comes from Reddit's shared partial loader (`script1.js:9`), so no function of its own was found. In our run it fired 1.3 s into step 12 (goto /r/popular/), sending `sort: BEST`, `distance: 4` and a post-id `cursor`/`after`, and the answer was HTML wrapped in a `<faceplate-loader name="PopularFeed_…">`.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli reads Popular, this is how its next page of posts is read, following the `cursor`.

## What can go wrong

It answered 200 in 1601 ms, the only time it was seen. As with the home feed, the answer is an HTML partial, so a bad page shows only as missing posts, and the slice holds no error handling of its own.
