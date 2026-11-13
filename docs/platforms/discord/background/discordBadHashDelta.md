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
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 51 ms | 61939 ms | — |
| inspect | Stopping after 1 step(s). | 1 | 200 | 60 ms | 6064 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 71 ms | 1062683 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 71 ms

Sent:

```json
{
  "query": {
    "revision": "3252",
    "targetRevision": "3254"
  },
  "body": null
}
```

Answered:

```json
{
  "ADDED": [
    "570cd697b52a452b11f61c778f2a010ac53afcdd0e1498b50ed2a4615e23cad3",
    "5ebaac23c4a50be531d5486cd3fbecb7e96f98620a22d4d19ce7cfe3ff9be01f",
    "9ba28ebea6c84a36a54b7645bcdf2637c3b9e83fd8745e0daceb1c8e9226f2ea",
    "e4505095137db9da522849281a2322ee3fc121106361902402ff2998667115ef",
    "f164fff65999e8534c01c773aa349b9f9b19b9a660f53924328b5ddf0698c931"
  ],
  "REMOVED": []
}
```

**runs/inspect/20261113T044840_<name:1>**, Stopping after 1 step(s).: 200, 60 ms

Sent:

```json
{
  "query": {
    "revision": "3226",
    "targetRevision": "3252"
  },
  "body": null
}
```

Answered:

```json
{
  "ADDED": [
    "0658700632fa2abf6215abeba1a8c1fbc51167dff6fca13d3f57e1d989e26b1f",
    "07b59f0adcd2bc12338c79dadee7fafea4ce62d4b6d868ef9700b24e4832a10f",
    "08050d400fe65ce0c5d1efd23a02c1d616c0b9934d1b4a905d913189759d55ba",
    "0c096efbaed1cdc35033b12b038f6e1cc9f53e3b8b2ff5bffd954ca821b2b131",
    "0cb254cfe11a8aca3c1c3a31f31a2deea4c59749da4a0660f1d6b996b4f83fe3",
    "0f7c2ae63fa2e3f16a7fa0c5d7d19753c63766fef69cdfa5f293facf40d48137",
    "… 91 more"
  ],
  "REMOVED": []
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 51 ms

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
