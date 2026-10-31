# CometMarketplaceInboxSetPreferredViewerRoleMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `8970537109713056` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_inbox_set_preferred_viewer_role.client_mutation_id` |
| Called from | `CometMarketplaceInboxSetPreferredViewerRoleMutation` |
| rea | `ev_c54b7db1ab4e2b315a213432b3ac2ebd88f742b422682e0372c6984632c486e1` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/inbox | 2 | 200 | 450–556 ms | 17761–20788 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T113536_61594063207669**, step 1: goto /marketplace/inbox: 200, 450 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceInboxSetPreferredViewerRoleMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "inbox_viewer_role": "BUYER",
      "actor_id": "61594063207669",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "8970537109713056"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Saves which inbox tab the account last used (`marketplace_inbox_set_preferred_viewer_role`): opening `?targetTab=SELLER` sets it to SELLER. It fired as the inbox loaded (step 1).

## What our machine does with it

A side effect of opening the seller tab, which the check does every round; nothing of ours reads it. It changes only which tab Facebook shows first.

## What can go wrong

None seen: two calls, 200 in 450-556 ms. A failure would only change the default tab.
