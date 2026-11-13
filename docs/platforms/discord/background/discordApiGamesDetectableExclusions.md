# discordApiGamesDetectableExclusions

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/games/detectable/exclusions` |
| Sends | — |
| Reads | `executables`, `patterns` |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 8 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 59 ms | 11829 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 69 ms | 12905 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 60 ms | 9547 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 71 ms | 8657 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 85–161 ms | 18488–1052580 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 52 ms | 51738 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 161 ms

Sent:

```json
null
```

Answered:

```json
{
  "executables": [
    "brocrashreporter.exe",
    "config.exe",
    "crashreportclient.exe",
    "crosshairx.exe",
    "dxsetup.exe",
    "eaanticheat.gameservicelauncher.exe",
    "… 19 more"
  ],
  "patterns": [
    "vcredist.*\\.exe$"
  ]
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 52 ms

Sent:

```json
null
```

Answered:

```json
{
  "executables": [
    "brocrashreporter.exe",
    "config.exe",
    "crashreportclient.exe",
    "crosshairx.exe",
    "dxsetup.exe",
    "eaanticheat.gameservicelauncher.exe",
    "… 19 more"
  ],
  "patterns": [
    "vcredist.*\\.exe$"
  ]
}
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 59 ms

Sent:

```json
null
```

Answered:

```json
{
  "executables": [
    "brocrashreporter.exe",
    "config.exe",
    "crashreportclient.exe",
    "crosshairx.exe",
    "dxsetup.exe",
    "eaanticheat.gameservicelauncher.exe",
    "… 19 more"
  ],
  "patterns": [
    "vcredist.*\\.exe$"
  ]
}
```

<!-- facts:end -->

## What it does

Lists games the desktop client should not detect; the web client loads it too.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
