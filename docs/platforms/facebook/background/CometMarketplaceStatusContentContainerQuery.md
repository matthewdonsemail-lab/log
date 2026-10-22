# CometMarketplaceStatusContentContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `35298386203140047` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | — |
| Called from | `CometMarketplaceStatusContentContainer.react` |
| rea | `ev_eecb50d6202597bec156a7136d3b27861031a02f173fdddc659c696e06a51c8d` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/inbox | 1 | 200 | 384 ms | 22463 ms | — |

<!-- facts:end -->

## What it does

Marketplace status (`/marketplace/status`): whether the account may buy and sell (`marketplaceViolationTransparencyViewModel`: `access_state_title` "You have full access to Marketplace", `is_marketplace_access_banned`, `enforcement_instance_id`, `csat_survey.profile_status` GOOD). Sent when the page is reached from inside Marketplace (Bethlehem's inbox moved to it, step 1); opened directly, the same data comes preloaded in the page, with `marketplace_feature_access_status.sell_on_marketplace` beside it (step 6).

## What our machine does with it

It is the account-health part of the Marketplace check (`marketplaceAccessOf`; rule 69), read from this request or from the page: anything but full access (a ban, an enforcement, a profile not GOOD, selling not ELIGIBLE) is the account's `suspended` issue, which takes it out of the host's day.

## What can go wrong

None seen: one call, 200 in 384 ms. If neither this nor the page carries it, the check says "Marketplace status didn't load" and raises nothing; the next round reads it again.
