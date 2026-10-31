# svcShredditHeaderActionItemInbox

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | inbox |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/header-action-item-inbox` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:9 anonymous` |
| rea | `ev_4fd054c78047e8b7fbb4b5c4a6f91280f44d90e4a4a2215e78067135123077cc` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 992 ms | 2768 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 652 ms | 4601 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 403 ms | 1254 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 431 ms | 1018 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 645 ms | 1233 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 338 ms | 1577 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 371 ms | 787 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 992 ms

Sent:

```json
{
  "query": {
    "render-mode": "partial"
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"HeaderActionItemInbox_sYX5P3\" src=\"concat:-STulhAtU4,29NC_PbRqG,4wkaaZVhfb,alxsS3x_LD,Ao1SgzdS5N,B149KXnvS8,B4azaGpu-D,B7KvmUeRnV,BdfpXRmjN5,BEAvJs_C8b,BGZ-nd1DBK,BOXawDZC1L,BpOJq76-SY,BpXCv1GcGG,BQsgkJ4lDx,BUacXktYAc,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,CE3B2GTv4R,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwGbZ5ZxpN,CxdYqUVbFS,CY0XGT8ur2,CylLPexIpe,D9C_VFQ_c2,DCOj… (3067 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 652 ms

Sent:

```json
{
  "query": {
    "render-mode": "partial"
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"HeaderActionItemInbox_sYX5P3\" src=\"concat:-STulhAtU4,29NC_PbRqG,4wkaaZVhfb,alxsS3x_LD,Ao1SgzdS5N,B149KXnvS8,B4azaGpu-D,B7KvmUeRnV,BdfpXRmjN5,BEAvJs_C8b,BGZ-nd1DBK,BOXawDZC1L,BpOJq76-SY,BpXCv1GcGG,BQsgkJ4lDx,BUacXktYAc,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,CE3B2GTv4R,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwGbZ5ZxpN,CxdYqUVbFS,CY0XGT8ur2,CylLPexIpe,D9C_VFQ_c2,DCOj… (3067 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 403 ms

Sent:

```json
{
  "query": {
    "render-mode": "partial"
  },
  "body": null
}
```

Answered:

```json
"<faceplate-loader name=\"HeaderActionItemInbox_sYX5P3\" src=\"concat:-STulhAtU4,29NC_PbRqG,4wkaaZVhfb,alxsS3x_LD,Ao1SgzdS5N,B149KXnvS8,B4azaGpu-D,B7KvmUeRnV,BdfpXRmjN5,BEAvJs_C8b,BGZ-nd1DBK,BOXawDZC1L,BpOJq76-SY,BpXCv1GcGG,BQsgkJ4lDx,BUacXktYAc,BvOWmaNPEJ,BVRnlBAoql,BZHTPhFhv1,CbjxY8gDr4,CBwOyNjLvJ,CE3B2GTv4R,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwGbZ5ZxpN,CxdYqUVbFS,CY0XGT8ur2,CylLPexIpe,D9C_VFQ_c2,DCOj… (3067 chars)"
```

<!-- facts:end -->

## What it does

Loads the header's inbox button (the notifications bell and its count) as a server-rendered partial, `<faceplate-loader name="HeaderActionItemInbox_…">`, with `render-mode: partial`. The slice rea read (`ev_4fd054c78047e8b7fbb4b5c4a6f91280f44d90e4a4a2215e78067135123077cc`) is the table of header and navigation partial names, where `HEADER_ACTION_ITEM_INBOX` sits beside `HEADER_ACTION_ITEM_CHAT`; the fetch is the shared partial loader (`script1.js:9`). It fired once on every page we opened, steps 1, 3, 5, 6, 10, 11 and 12, 0.8 to 4.6 s after the goto.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli watches a Reddit account, this partial is where the unread notification count first shows on every page.

## What can go wrong

All seven answered 200, in 338 to 992 ms. The answer is HTML, so a failure would show only as a missing or empty inbox button; the slice holds no error handling, since the shared loader does the fetch.
