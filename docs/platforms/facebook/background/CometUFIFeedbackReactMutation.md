# CometUFIFeedbackReactMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `27646120298312844` |
| Path | `/api/graphql/` |
| Sends | `canUseNicknameOnComet`, `input`, `scale`, `useDefaultActor`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider` |
| Reads | `feedback_react.feedback`, `feedback_react.detection_analytics_enabled` |
| Called from | `CometUFIFeedbackReactMutation` |
| rea | `ev_a524d63aa67afda368f84d97715d9e407ac62c8b9888f10a4ba1af4a0c4a24ba` |

Seen 8 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: likePost Like | 1 | 200 | 1719 ms | 1155 ms | — |
| inspect | scroll: +642px in 17 wheel steps, 985 ms | 1 | 200 | 2018 ms | 1126 ms | — |
| inspect | step 65: clickRole button "…" | 1 | 200 | 1161 ms | 1256 ms | — |
| inspect | step 10: clickRole button "…" | 1 | 200 | 960 ms | 1745 ms | — |
| inspect | step 21: clickRole button "…" | 1 | 200 | 872 ms | 1290 ms | — |
| inspect | step 45: clickRole button "…" | 1 | 200 | 1424 ms | 1325 ms | — |
| inspect | step 61: clickRole button "…" | 1 | 200 | 1009 ms | 1075 ms | — |
| inspect | step 87: clickRole button "…" | 1 | 200 | 1210 ms | 1322 ms | — |

<!-- facts:end -->

## What it does

Sets a reaction on a post or reel: it sends `input` and reads back `feedback_react.feedback` and `feedback_react.detection_analytics_enabled`. It fired 1.1-1.7 s after each of five clickRole button steps (10, 21, 45, 61, 87); in run 20261020T052708 each of those steps is a `button "Like"` click.

## What our machine does with it

The Reels warm-up's `like` step (`src/warmup/facebook/helpers/reel.ts`) clicks `button "Like"` and is what sends it. The machine does not read this response: the step passes when the snapshot shows `button "Remove Like"` (`checkStep`). The step only runs with `--live` and `--likes` (rule 8, `allowedActions`), and `planReel` keeps a like cooldown between reels.

## What can go wrong

None seen: all five answered 200 in 872-1424 ms. If the like did not take, the snapshot would still show `button "Like"` and `checkStep` reports `no button "Remove Like" after it`. If the step fails anyway, `checkStep` reports it as an issue: `log warmup facebook reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
