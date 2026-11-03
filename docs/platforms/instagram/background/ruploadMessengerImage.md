# ruploadMessengerImage

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `rupload.instagram.com/messenger_image` |
| Sends | — |
| Reads | `media_id`, `media_id_str` |
| Called from | — |
| rea | `ev_62a650a7606ad60da8a1616c5149fa25791250e06da900147a12b5d914c56411` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | upload: grievous.jpg handed to the file chooser | 1 | 200 | 2098 ms | 355 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T180010_mattinferencesaver**, upload: grievous.jpg handed to the file chooser: 200, 2098 ms

Sent:

```json
{
  "query": {
    "__d": "www"
  },
  "body": null
}
```

Answered:

```json
{
  "media_id": 1634557321701016,
  "media_id_str": "1634557321701016"
}
```

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
