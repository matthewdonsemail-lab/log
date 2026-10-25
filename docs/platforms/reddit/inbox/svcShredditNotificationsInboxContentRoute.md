# svcShredditNotificationsInboxContentRoute

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | inbox |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/notifications-inbox-content/route` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script103.js:49 statement` |
| rea | `ev_871cf656c9e276b908e8b24ffabbf94776e9772226560746ce79ee8d90edb2da` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 11: goto /notifications | 2 | 200 | 382–406 ms | 1556–1954 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 11: goto /notifications: 200, 382 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"NotificationsInbox_tQCNpP\" src=\"concat:29NC_PbRqG,2EFjysJkh6,7c6CdErr2U,8N4Svh85YA,Ao1SgzdS5N,B1ElgNGbay,B4azaGpu-D,B7oPcqNlJd,B8BMInGTad,B92lQWhBDc,BC2YQ5k9b9,BeLwdK0x8v,BfoUXclhiK,BfX-J5Xw6d,BGZ-nd1DBK,BHyFkWaQsK,BirvPtVooh,BjLOwV27_T,BpOJq76-SY,BQsgkJ4lDx,BSjT7z2l6N,BsQWn6nhd-,BT6FxYMVyV,Bu9Cg0lQ4s,BVoUIY8SeX,BvOWmaNPEJ,BVRnlBAoql,BXgK9v6Fv1,BZHTPhFhv1,C7TFxNmd3b,C9kIpN7… (73358 chars)"
```

<!-- facts:end -->

## What it does

Loads the notifications list itself as a server-rendered partial, `<faceplate-loader name="NotificationsInbox_…">`. The slice rea read (`ev_871cf656c9e276b908e8b24ffabbf94776e9772226560746ce79ee8d90edb2da`) is only the route definition, `/svc/shreddit/notifications-inbox-content/:numNotifications/:renderType`; in our recording it was asked for as `/20/route`, so 20 notifications rendered for the route. It fired twice in step 11 (goto /notifications), 1.6 and 2.0 s after the goto, nothing sent.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli reads a Reddit account's notifications, this route is how they are read, 20 at a time.

## What can go wrong

Both answered 200, in 382 and 406 ms. The answer is HTML, so a failure would show only as an empty list; the route definition shows no error handling, and nothing in our runs depends on it yet.
