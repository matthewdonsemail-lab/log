# ajaxReactComposerAttachmentsPhotoUpload

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/react_composer/attachments/photo/upload` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_95f39d92db8680f6d825cf32ff4b82771362ce9522cc7ee4a68c07394ab73d39` |

Seen 11 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | upload: garbageRoom.jpg handed to the file chooser | 1 | 200 | 5129 ms | 3163 ms | — |
| inspect | upload: before.png handed to the file chooser | 2 | 200 | 4818–8502 ms | 1323–1358 ms | — |
| inspect | upload: after.png handed to the file chooser | 2 | 200 | 4708–5957 ms | 1313–1444 ms | — |
| flow | upload: photo1.jpg handed to the file chooser | 2 | 200 | 4455–4464 ms | 2797–4257 ms | — |
| flow | upload: photo2.jpg handed to the file chooser | 2 | 200 | 2192–3046 ms | 961–1038 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 2 | 200 | 2192–4455 ms | 683992–689824 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_<userId:1>**, upload: before.png handed to the file chooser: 200, 8502 ms

Sent:

```json
{
  "query": {
    "qpl_active_flow_ids": "138820675"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AmivCIeKUA0kHVRMprNw1zQ",
  "payload": {
    "isSpherical": false,
    "height": 1672,
    "imageSrc": "<mediaUrl> (438 chars)",
    "mediaLocation": null,
    "originalPhotoID": "",
    "photoID": "<id:1>",
    "sphericalPhotoID": "",
    "thumbSrc": "<mediaUrl> (452 chars)",
    "width": 941,
    "mediaTakenTime": null
  },
  "lid": "<id:2>"
}
```

**runs/inspect/20261022T110738_<userId:1>**, upload: after.png handed to the file chooser: 200, 5957 ms

Sent:

```json
{
  "query": {
    "qpl_active_flow_ids": "138820675"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A1C_E2roTQRGnxHKNm9QaoS",
  "payload": {
    "isSpherical": false,
    "height": 1672,
    "imageSrc": "<mediaUrl> (438 chars)",
    "mediaLocation": null,
    "originalPhotoID": "",
    "photoID": "<id:3>",
    "sphericalPhotoID": "",
    "thumbSrc": "<mediaUrl> (452 chars)",
    "width": 941,
    "mediaTakenTime": null
  },
  "lid": "<id:4>"
}
```

**runs/host/20261024T222706_<userId:2>**, setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9: 200, 4455 ms

Sent:

```json
{
  "query": {
    "qpl_active_flow_ids": "138820675"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "Am-CVJH5EbGDmUA15vkK3WL",
  "payload": {
    "isSpherical": false,
    "height": 2048,
    "imageSrc": "<mediaUrl> (442 chars)",
    "mediaLocation": null,
    "originalPhotoID": "",
    "photoID": "<id:5>",
    "sphericalPhotoID": "",
    "thumbSrc": "<mediaUrl> (456 chars)",
    "width": 962,
    "mediaTakenTime": null
  },
  "lid": "<id:6>"
}
```

<!-- facts:end -->

## What it does

Uploads one photo (`upload.facebook.com/ajax/react_composer/attachments/photo/upload`). One request per photo, 1.3-7.3 s each; they start from 0.4 s to 9.4 s into the upload step.

## What our machine does with it

The publish machine sets the files, then waits on Facebook's own `N/10` counter (never a sleep). Each counter step is one of these finishing.

## What can go wrong

A slow proxy shows here first: 7 s for one photo. A non-200 means that photo is missing from the listing and the counter stops short: the machine must not go on to Publish. Not yet seen failing.
