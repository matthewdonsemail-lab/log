# platformLitmsAllowlistVoyagerWebMynetwork

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `platform.linkedin.com/litms/allowlist/voyager-web-mynetwork` |
| Sends | — |
| Reads | `pageKey`, `controlUrn` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script72.js:1 statement`, `runs/inspect/20261106T014139_<name:1>/script26.js:1 statement`, `runs/chrome/20261114T213510_<name:1>/script52.js:1 statement`, `runs/chrome/20261114T213510_<name:1>/script23.js:1 statement` |
| rea | `ev_20e22674f7dea99287df8301d13b94bb2bfde00f91caf66fb2061773d49ca888` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 8: comment on a post, by hand | 2 | 200 | 3–171 ms | 9459–10155 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 8: comment on a post, by hand: 200, 171 ms

Sent:

```json
null
```

Answered:

```json
{
  "pageKey": [
    "d_flagship3_discover_hub",
    "d_flagship3_people",
    "d_UNKNOWN_ROUTE_mynetwork.discover-hub.index"
  ],
  "controlUrn": [
    "urn:li:control:voyager_web_app-m2m_invite"
  ]
}
```

<!-- facts:end -->

## What it does

A GET to `platform.linkedin.com` that sends nothing and answers with two lists, `pageKey` (the My Network page keys) and `controlUrn` (the invite control). The by-hand recording fetches it twice while the comment step moves through My Network, in 3 to 171 ms; what the client does with the lists isn't shown by our sources.

## What our machine does with it

Our engine never sends it: nothing in `python/linkedinApi` or openLinkedinApi calls this path, so no engine action waits for it or reads it.

## What can go wrong

Only 200 is in our recording, so its other statuses aren't shown, and since our engine doesn't send it, none can reach our runs.
