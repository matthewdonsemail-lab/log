# useAccountStatusClearEnrollmentEntryPointActionMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `28258638120444097` |
| Path | `/api/graphql/` |
| Sends | `ixt_clear_token`, `serialized_state` |
| Reads | `xfb_ixt_gateway_clear_flow` |
| Called from | `useAccountStatusClearEnrollmentEntryPointAction` |
| rea | `ev_a0062e8b8f34740088df51924ac1166d77286c18047383e4f5bedbd513b14830` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 15: press Escape | 1 | 200 | 1284 ms | 9 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T211541_61593939852820**, step 15: press Escape: 200, 1284 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useAccountStatusClearEnrollmentEntryPointActionMutation",
  "server_timestamps": "true",
  "variables": {
    "serialized_state": "(taken out)",
    "ixt_clear_token": "(taken out)"
  },
  "doc_id": "28258638120444097"
}
```

Answered:

```json
{
  "data": {
    "xfb_ixt_gateway_clear_flow": true
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792876806426,
      "time_at_flush_ms": 1792876807363
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Closes Facebook's "What happened" notice about a limit on the account that has already ended. Pressing Escape on that dialog sends it with the notice's `serialized_state` and a one-time `ixt_clear_token` (both taken out above), and Facebook answers `data.xfb_ixt_gateway_clear_flow: true` once the notice is cleared (Hazleton, host 20261024T211541 step 15, 1.28 s after the key).

## What our machine does with it

It is the check for the `pastNoticeDialog` overlay (rule 79): `clearOverlays` in `src/cli/flow/helpers/flowSession.ts` presses Escape before a flow's first click, waits for this call (`answerWait`) and passes only when `data.xfb_ixt_gateway_clear_flow` is `true` (`OVERLAY_CLEARS`, `src/browser/flow/helpers/overlays.ts`). Nothing else waits on it.

## What can go wrong

No answer, an error, or `xfb_ixt_gateway_clear_flow` other than `true` means the notice is still there: the flow stops at its first click with `overlayNotCleared` and the press step's snapshot and exchanges say why. A "What happened" with no "Ended on" date is never cleared this way: it stays an unknown state for SubQ to read (rule 74).
