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
| rea | `ev_35622837eca4a4aa15a7b0e66fa7a38ebe62da38674d0ade9b0e0a090e931fca` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | upload: grievous.jpg handed to the file chooser | 1 | 200 | 2098 ms | 355 ms | — |
| inspect | upload: paulie.jpg handed to the file chooser | 1 | 200 | 1747 ms | 255 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T185330_mattinferencesaver**, upload: paulie.jpg handed to the file chooser: 200, 1747 ms

Sent:

```json
{
  "query": {
    "__d": "www",
    "qpl_active_flow_ids": "521485957"
  },
  "body": null
}
```

Answered:

```json
{
  "media_id": <id:1>,
  "media_id_str": "<id:1>"
}
```

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
  "media_id": <id:2>,
  "media_id_str": "<id:2>"
}
```

<!-- facts:end -->

## What it does

Instagram's upload host for a Direct message photo: when the web page handed a file to the file chooser it uploaded the image and answered `media_id` and `media_id_str` (for example `<id:1>`). It fired twice, once per run, on the `upload: paulie.jpg` and `upload: grievous.jpg handed to the file chooser` steps, taking 1747 and 2098 ms with status 200.

## What our machine does with it

Not this host, but its twin: `log instagram send --photo` calls instagrapi's `direct_send_photo` (`python/instagramApi/engine.py`), which uploads the same kind of Direct photo to `rupload.facebook.com/messenger_image/` (`_photo_rupload`, `vendor/instagrapi/instagrapi/mixins/direct.py`) and sends the message with the `media_id` it gets back. No step waits on this web upload; only the two inspect uploads recorded here used Instagram's own host.

## What can go wrong

Both uploads answered 200 with a media id. If it failed or returned no `media_id`, the page's following send would have nothing to attach; in an inspect run that would show as the send step not confirming.
