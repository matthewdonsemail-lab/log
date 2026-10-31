# svcShredditHeaderActionItemChat

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | chat |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/header-action-item-chat` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:9 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script113.js:9 anonymous` |
| rea | `ev_f833e825dca67461f8aa08c2c541968a4e6a855f8c65037fa6bc3c368d9e5e68` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 989 ms | 2768 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 626 ms | 4600 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 370 ms | 1254 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 422 ms | 1018 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 634 ms | 1233 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 324 ms | 1576 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 369 ms | 786 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 989 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"HeaderActionItemChat_dgF3lm\" src=\"concat:-STulhAtU4,29NC_PbRqG,4wkaaZVhfb,alxsS3x_LD,Ao1SgzdS5N,B149KXnvS8,B4azaGpu-D,B7KvmUeRnV,BdfpXRmjN5,BEAvJs_C8b,BGZ-nd1DBK,BOXawDZC1L,BpOJq76-SY,BpXCv1GcGG,BQsgkJ4lDx,BUacXktYAc,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwGbZ5ZxpN,CxdYqUVbFS,CY0XGT8ur2,CylLPexIpe,D9C_VFQ_c2,DCOj0oSMGE,DCsN1… (2952 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 626 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"HeaderActionItemChat_dgF3lm\" src=\"concat:-STulhAtU4,29NC_PbRqG,4wkaaZVhfb,alxsS3x_LD,Ao1SgzdS5N,B149KXnvS8,B4azaGpu-D,B7KvmUeRnV,BdfpXRmjN5,BEAvJs_C8b,BGZ-nd1DBK,BOXawDZC1L,BpOJq76-SY,BpXCv1GcGG,BQsgkJ4lDx,BUacXktYAc,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwGbZ5ZxpN,CxdYqUVbFS,CY0XGT8ur2,CylLPexIpe,D9C_VFQ_c2,DCOj0oSMGE,DCsN1… (2974 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 370 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"HeaderActionItemChat_dgF3lm\" src=\"concat:-STulhAtU4,29NC_PbRqG,4wkaaZVhfb,alxsS3x_LD,Ao1SgzdS5N,B149KXnvS8,B4azaGpu-D,B7KvmUeRnV,BdfpXRmjN5,BEAvJs_C8b,BGZ-nd1DBK,BOXawDZC1L,BpOJq76-SY,BpXCv1GcGG,BQsgkJ4lDx,BUacXktYAc,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwGbZ5ZxpN,CxdYqUVbFS,CY0XGT8ur2,CylLPexIpe,D9C_VFQ_c2,DCOj0oSMGE,DCsN1… (2974 chars)"
```

<!-- facts:end -->

## What it does

A GET of the `header-action-item-chat` partial, the chat button in Reddit's header; it answers a `faceplate-loader` for `HeaderActionItemChat` (about 3 KB). The slices (rea `ev_f833e825…`) are the list of partial names it belongs to and the chat module in `script113.js`, where `updateNotificationCountInTheHeader()` sets the unread count on the button's badge (`header-action-item-chat-button-badge`). It fired on every page load, 1-5 seconds after the goto.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, the badge this button carries is where an unread chat count first shows.

## What can go wrong

All seven calls were 200 with the loader. A failure would leave the header without its chat button; no failure has been recorded.
