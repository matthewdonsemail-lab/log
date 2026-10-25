# svcShredditUserDrawerButtonLoggedIn

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | account |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/user-drawer-button-logged-in` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:9 anonymous` |
| rea | `ev_4fd054c78047e8b7fbb4b5c4a6f91280f44d90e4a4a2215e78067135123077cc` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 1057 ms | 2716 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 691 ms | 4541 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 343 ms | 1196 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 848 ms | 985 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 359 ms | 1181 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 341 ms | 1555 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 402 ms | 759 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 1057 ms

Sent:

```json
null
```

Answered:

```json
"<span class=\"inline-flex items-center justify-center w-xl h-xl relative \" rpl avatar flip>\n    \n    <span rpl class=\"inline-block rounded-full  relative [&>:first-child]:h-full [&>:first-child]:w-full [&>:first-child]:mb-0 [&>:first-child]:rounded-[inherit] h-full w-full\n    [&>:first-child]:overflow-hidden [&>:first-child]:max-h-full\">\n    <img src=\"https://www.redditstatic.com/avatars/defaults/v… (867 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 691 ms

Sent:

```json
null
```

Answered:

```json
"<span class=\"inline-flex items-center justify-center w-xl h-xl relative \" rpl avatar flip>\n    \n    <span rpl class=\"inline-block rounded-full  relative [&>:first-child]:h-full [&>:first-child]:w-full [&>:first-child]:mb-0 [&>:first-child]:rounded-[inherit] h-full w-full\n    [&>:first-child]:overflow-hidden [&>:first-child]:max-h-full\">\n    <img src=\"https://www.redditstatic.com/avatars/defaults/v… (867 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 343 ms

Sent:

```json
null
```

Answered:

```json
"<span class=\"inline-flex items-center justify-center w-xl h-xl relative \" rpl avatar flip>\n    \n    <span rpl class=\"inline-block rounded-full  relative [&>:first-child]:h-full [&>:first-child]:w-full [&>:first-child]:mb-0 [&>:first-child]:rounded-[inherit] h-full w-full\n    [&>:first-child]:overflow-hidden [&>:first-child]:max-h-full\">\n    <img src=\"https://www.redditstatic.com/avatars/defaults/v… (867 chars)"
```

<!-- facts:end -->

## What it does

A GET of the `user-drawer-button-logged-in` partial, the avatar button in the header for a signed-in account; it answers the button's HTML with the account's avatar image (the default avatar here). The slice (`script1.js`, rea `ev_196ae950…`) is only the list of partial names it belongs to (rea couldn't parse it on its own), so the fetch itself is the page's partial loader. It fired on every page load of our run, about 1-3 seconds after the goto.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, its answer is a quiet sign that the page was rendered for a signed-in account, beside what `log reddit session check` decides from Reddit's own answer.

## What can go wrong

All seven calls were 200 with the avatar HTML. No failure has been recorded; a page that doesn't request it, or an answer without the avatar, would point at a signed-out page, and should be checked with the session check rather than read from this alone.
