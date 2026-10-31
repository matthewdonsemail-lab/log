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
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_9648b0d4a67d10262e1cab398c2eefdedefa150e3fd443a11c6f6064f4e5c8b1` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 51 ms | 61939 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 51 ms

Sent:

```json
{
  "query": {
    "revision": "3223",
    "targetRevision": "3226"
  },
  "body": null
}
```

Answered:

```json
{
  "ADDED": [
    "4d137ce1b5f3cf91b20b17e9e8c1c605240f6dff4573460389aba7769b0c5e65",
    "51c948404c819186f62d0abe2d9713d9d902ec9818851a0536cbf0b85c33743f",
    "66c9933182546aa3d05063822f28c9d00f909b4fabeb03d02e272c78e39e3330",
    "71fd6063817590b753001475b0ea19906eecf1eea9d6ab2c91fb8bc57eb89ef3",
    "912625c4bc1775111934e4c532cb08022ba659cb5f70a82b9845c440cec1dce2",
    "91ff9905a57a0dc904e854954bbd55280e97e720604ecaff803d32de341a7cff",
    "… 5 more"
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
