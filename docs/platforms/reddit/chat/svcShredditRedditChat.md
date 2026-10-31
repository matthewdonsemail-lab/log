# svcShredditRedditChat

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | chat |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/reddit-chat` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:775 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script113.js:9 render`, `runs/inspect/20261025T124815_MaleficentTry8338/script113.js:11 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:775 anonymous` |
| rea | `ev_22cfdfe21aaaf45b90daa020b499149742e037f8be703fae2aa18cc211f098ca` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 1005 ms | 2769 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 646 ms | 4604 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 391 ms | 1255 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 427 ms | 1022 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 654 ms | 1234 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 390 ms | 1578 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 542 ms | 788 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 1005 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"RedditChat_0nn1mJ\" src=\"concat:B1ElgNGbay,B4azaGpu-D,B92lQWhBDc,Bu9Cg0lQ4s,BupcDWTiIS,BvOWmaNPEJ,BZHTPhFhv1,CbjxY8gDr4,Cc-Rhzk-Jb,CKMjOeLUYC,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwI7KavhrU,CzEUb6IYML,D8AGLhR16D,DCOj0oSMGE,Dd1BAue39f,DHvRGY_wXY,DUZrRi1pSH,Dwt9Fx1AQ-,Dyg3q1gB6W,IxxeVlpudr,QaPKHLmpC-,z8f2dESxT1\" loading=\"eager\" data-prefix=\"en-US/\">\n    \n        <script nonce=\"N1D… (5480 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 646 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"RedditChat_0nn1mJ\" src=\"concat:B1ElgNGbay,B4azaGpu-D,B92lQWhBDc,Bu9Cg0lQ4s,BupcDWTiIS,BvOWmaNPEJ,BZHTPhFhv1,CbjxY8gDr4,Cc-Rhzk-Jb,CKMjOeLUYC,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwI7KavhrU,CzEUb6IYML,D8AGLhR16D,DCOj0oSMGE,Dd1BAue39f,DHvRGY_wXY,DUZrRi1pSH,Dwt9Fx1AQ-,Dyg3q1gB6W,IxxeVlpudr,QaPKHLmpC-,z8f2dESxT1\" loading=\"eager\" data-prefix=\"en-US/\">\n    \n        <script nonce=\"_Yt… (5540 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 391 ms

Sent:

```json
null
```

Answered:

```json
"<faceplate-loader name=\"RedditChat_0nn1mJ\" src=\"concat:B1ElgNGbay,B4azaGpu-D,B92lQWhBDc,Bu9Cg0lQ4s,BupcDWTiIS,BvOWmaNPEJ,BZHTPhFhv1,CbjxY8gDr4,Cc-Rhzk-Jb,CKMjOeLUYC,COK-wVBdxx,Cp7VcC-uun,Cqu_rhtgcl,CwI7KavhrU,CzEUb6IYML,D8AGLhR16D,DCOj0oSMGE,Dd1BAue39f,DHvRGY_wXY,DUZrRi1pSH,Dwt9Fx1AQ-,Dyg3q1gB6W,IxxeVlpudr,QaPKHLmpC-,z8f2dESxT1\" loading=\"eager\" data-prefix=\"en-US/\">\n    \n        <script nonce=\"hEW… (5540 chars)"
```

<!-- facts:end -->

## What it does

A GET of the `reddit-chat` partial, which loads Reddit's chat feature (`RedditChat_0nn1mJ`) on every page. The slices (rea `ev_22cfdfe2…`) show what uses it: `activateFeature()` in `reddit-chat-header-button` and `reddit-chat-anchor` loads it before the chat opens, the anchor's click handler calls `openChatUrl()` on `reddit-chat-host`, and `render()` draws the chat window closed, minimized or maximized. It fired on every page load, 1-5 seconds after the goto, about 5.5 KB each time.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this is the feature every chat action goes through in the browser: nothing in the chat opens until it has loaded.

## What can go wrong

All seven calls were 200. `activateFeature()` ignores the error "RedditChat_0nn1mJ not found" and throws any other, so a failed load leaves the chat button doing nothing. No failure has been recorded.
