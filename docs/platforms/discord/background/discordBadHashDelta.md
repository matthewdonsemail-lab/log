# discordBadHashDelta

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/bad-hash-delta` |
| Sends | — |
| Reads | `ADDED`, `REMOVED` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_2df446dcf6e652b06a4182683548938cac4ab357936e75335ec8577a74270adc` |

Seen 5 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 51 ms | 61939 ms | — |
| inspect | Stopping after 1 step(s). | 1 | 200 | 60 ms | 6064 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 27–71 ms | 38881–1062683 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 26 ms | 35540 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 26 ms

Sent:

```json
{
  "query": {
    "revision": "3248",
    "targetRevision": "3256"
  },
  "body": null
}
```

Answered:

```json
{
  "ADDED": [
    "08050d400fe65ce0c5d1efd23a02c1d616c0b9934d1b4a905d913189759d55ba",
    "0feacfdd1ce07272987873ced7e8f2dd476c84f2794b9ca453d579ee63debff7",
    "27eb6d1bacc17e295ef559e81f446d2d78c87a63d408f14364a7e0751969096f",
    "2c1aef53289834a37f05bf3869fb2b5ba99bc5ad844fb6f68acb623a52344c20",
    "338c83a94601281be2028d72f47367651e701be52b12c192c4a360def959dc94",
    "3a4bfcd0a7452abd9fceff5dacfb93ec4c290ba9e8c7b2cc08dbdd6d7133de05",
    "… 19 more"
  ],
  "REMOVED": []
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 27 ms

Sent:

```json
{
  "query": {
    "revision": "3241",
    "targetRevision": "3248"
  },
  "body": null
}
```

Answered:

```json
{
  "ADDED": [
    "0658700632fa2abf6215abeba1a8c1fbc51167dff6fca13d3f57e1d989e26b1f",
    "30621ce306a881a6cb6f212528595607ce32913697f8313a8fd5614ab16579ca",
    "4a7d707d5726eb02aa8fae76aba0ccf00f68439d27e6e919832fe3d2493f8c64",
    "679166c75673d5853c34bbc35c68e814e41f37552b05060a4dfd9ab765443fb2",
    "7ef0b3523160df0e16e9fd38bd9bbee59a9deb0171f488dc0b0add8df52c9d3d",
    "823cd272472423e84e76ebf5b3382a5762e1c5fdad7ec8c9fd34ee6b33902258",
    "… 7 more"
  ],
  "REMOVED": []
}
```

<!-- facts:end -->

## What it does

Fetches the changes (`ADDED`, `REMOVED`) to the list of known bad link and file hashes Discord's client checks messages against.

## What our machine does with it

Nothing in log-cli waits for it or reads it. The client loads it in the background; a read, a watch or a send never depends on it.

## What can go wrong

A failure only means the client keeps its older hash list; the run carries on.
