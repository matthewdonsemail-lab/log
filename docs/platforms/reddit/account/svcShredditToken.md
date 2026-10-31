# svcShredditToken

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | account |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/token` |
| Sends | — |
| Reads | `token`, `expires` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:50 Mm`, `runs/inspect/20261025T124815_MaleficentTry8338/script103.js:49 statement`, `runs/inspect/20261025T124815_MaleficentTry8338/script8.js:1 s`, `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:44 Pl` |
| rea | `ev_d0bcf3bd9ec798afc82f6cb18dc4d9ad1cbc3600baab45465a5707b648682dd1` |

Seen 5 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 2973 ms | 3954 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 735 ms | 6825 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 299 ms | 2061 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 310 ms | 3044 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 299 ms | 2380 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 2973 ms

Sent:

```json
{}
```

Answered:

```json
{
  "token": "(taken out)",
  "expires": 1793017409000
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 735 ms

Sent:

```json
{}
```

Answered:

```json
{
  "token": "(taken out)",
  "expires": 1793017409000
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th: 200, 299 ms

Sent:

```json
{}
```

Answered:

```json
{
  "token": "(taken out)",
  "expires": 1793017409000
}
```

<!-- facts:end -->

## What it does

`ln()` in Reddit's bundle POSTs the `csrf_token` cookie to `/svc/shreddit/token` and keeps the `{token, expires}` answer until 5 minutes before `expires`, so it is fetched once per page load and reused. The token is a bearer: the realtime client (`un()`) opens `wss://gql-realtime.reddit.com/query` with `Authorization: Bearer <token>` from `ln()`, and the Answers module fetches it too (its error text is "Failed to fetch auth token from /svc/shreddit/token"). rea's slices for this request (`ev_e96ed19c…`) caught the neighbouring `/svc/shreddit/events` calls rather than `ln()`, which was read from the run's own script. It fired on steps 1, 3, 6, 10 and 12, the slowest in step 1 (2.97 s).

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this is the bearer every realtime subscription (and every token-based call) needs, and its `expires` says how long a session's token lasts.

## What can go wrong

All five calls were 200 with the same `expires`. In the code `return n.ok?(cn=await n.json(),cn):null`: a failed call gives no token, so the realtime connection opens with no Authorization and the Answers module reports its error. For a run, a 401 or 403 here would mean the session's cookies are no longer accepted, which is the session check's business before anything else is done.
