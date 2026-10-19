# CometMarketplaceSetBuyLocationMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | location |
| Kind | mutation |
| doc_id | `27784133851221395` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_set_buy_location.viewer` |
| Called from | `CometMarketplaceSetBuyLocationMutation` |
| rea | `ev_6c7e203c15e273a1adfc76f48a3b85d02ad11eb05eea408878d7c7ec936ce3ee` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 471 ms | 1321 ms | — |

<!-- facts:end -->

## What it does

Saves the account's Marketplace location from the Change location dialog. The create form's `sell_location` follows it: the listing is placed there.

## What our machine does with it

Sent by `set_marketplace_location` in a `--live` publish when the form would list elsewhere (Reading was in Pensacola, FL), with the listing's `locationPostalCode`; the run waits for its 200, reopens the form and checks `sell_location` again. First sent by hand on Reading, 2026-10-19 13:18.

## What can go wrong

A non-200, or `sell_location` still elsewhere afterwards: `locationNotSet`, nothing is uploaded or published.
