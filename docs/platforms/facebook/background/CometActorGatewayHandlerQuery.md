# CometActorGatewayHandlerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27762484350095071` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | `xfb_actor_gateway_open_experience.screen`, `xfb_actor_gateway_open_experience.presentation_style`, `xfb_actor_gateway_open_experience.tab_id` |
| Called from | `CometActorGatewayHandler` |
| rea | `ev_c0102a67d2d053b67129b5c971d1c93594f18142e73a08022eddd9cd8888ae0b` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 15: press Escape | 1 | 200 | 419 ms | 1299 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T211541_61593939852820**, step 15: press Escape: 200, 419 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometActorGatewayHandlerQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1
  },
  "doc_id": "27762484350095071"
}
```

Answered:

```json
{
  "data": {
    "xfb_actor_gateway_open_experience": null
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792876807713,
      "time_at_flush_ms": 1792876807805
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Asks whether there is another gateway experience to open for the viewer, right after a notice is cleared: it fired 1.3 s after the Escape that closed the "What happened" notice, sent nothing, and answered `xfb_actor_gateway_open_experience: null` (Hazleton, host 20261024T211541 step 15).

## What our machine does with it

Nothing: no machine waits on it. `null` means no follow-up screen opens, which is what lets the flow's first click go ahead after `pastNoticeDialog` is cleared.

## What can go wrong

If it ever answers with an experience instead of `null`, Facebook opens another screen over the page; the next step's page check (`pageStateOf`) or SubQ's reading then names it, and the flow's click is refused by the matcher rather than pressed through (rule 79).
