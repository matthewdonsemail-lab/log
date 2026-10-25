# svcShredditFeedsHomeFeed

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | feed |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/feeds/home-feed` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:9 anonymous` |
| rea | `ev_b9eb871b431af374cafca8aa1692ff30df562901fa370db3483f0dc3ffa887e2` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 1714 ms | 3176 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 1714 ms

Sent:

```json
{
  "query": {
    "after": "dDNfMXhlMTliOA==",
    "distance": "4",
    "adDistance": "2",
    "navigationSessionId": "5a9e03c9-ac77-4fb2-a3c0-36b44a17ff26",
    "ad_posts_served": "1",
    "cursor": "dDNfMXhlMTliOA==",
    "sort": "BEST"
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"HomeFeed_WnGPVB\" src=\"concat:_lbqF4g9AK,0bDQdb-Tbk,53EDCA0WYy,86k8aL5lVl,8N4Svh85YA,8ogLSYR__z,Ao1SgzdS5N,B-ev6fzzU1,B0p5J7ElEL,B0v1LKhzI4,B0YAIg0I9f,B1ElgNGbay,B25vm875rA,B2FMWpMutB,B4azaGpu-D,B5hSx9UCwB,B5SKDPzUZZ,B5yQcwRmxW,B6LoPCis_x,B7gFy_wzom,B7KvmUeRnV,B7oPcqNlJd,B837eqDtwN,B8BMInGTad,B8qvlnNp9V,B92lQWhBDc,BApWdi6Z38,BAxWHLFDBc,BBf_MZZko8,BCaFsOVFH0,BdvEwe6ixJ,BdWIqO… (661268 chars)"
```

<!-- facts:end -->

## What it does

Loads the next page of the signed-in account's home feed. The slice rea read (`ev_8ce4aad8b67f7e1413e1293a5ee6c7bf65499da9d2aef5fcf3c9897f85a1122c`) is the route-name table where `HOME_PAGE_LOAD_MORE` is `home-feed-load-more`; the fetch comes from Reddit's shared partial loader (`script1.js:9`), so no function of its own was found. In our run it fired 3.2 s into step 1 (goto /), with no scroll from us in that step, sending `sort: BEST`, `distance: 4` and a `cursor`/`after` that is the last post's id, and the answer was HTML wrapped in a `<faceplate-loader name="HomeFeed_…">`.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this is how the home feed's next page of posts is read, following the `cursor`.

## What can go wrong

It answered 200 in 1714 ms, the only time it was seen. The answer is an HTML partial, so a bad page would show only as missing posts; the slice holds no error handling, since the shared loader does the fetch.
