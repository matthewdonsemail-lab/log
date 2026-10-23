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
| rea | `ev_75a8b0abe7503b1457d00b428d7bb9f43970a8ac125a37b072efbfe25dfa446a` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | upload: garbageRoom.jpg handed to the file chooser | 1 | 200 | 5129 ms | 3163 ms | — |
| inspect | upload: before.png handed to the file chooser | 2 | 200 | 4818–8502 ms | 1323–1358 ms | — |
| inspect | upload: after.png handed to the file chooser | 2 | 200 | 4708–5957 ms | 1313–1444 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, upload: before.png handed to the file chooser: 200, 8502 ms

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
    "imageSrc": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/861498281_122127505029468773_7925144315177568439_n.jpg?stp=dst-jpg_tt6&cstp=mx941x1672&ctp=s941x1672&_nc_cat=104&ccb=1-7&_nc_sid=12b72b&_nc_ohc=uvpvTYMCl3gQ7kNvwHFqnHe&_nc_oc=Adpmai9o_VbJgKUis-3QfM6WZpRvwXuxnLSUaCtyeS6Qn6WKi7bOerkxw70cHcSlY8I&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=UkhWVIuNiLXKZONsbj_FRw&_nc_ss=792a8&oh=00_AQM4ZL5VzvOcvgvPe-up… (438 chars)",
    "mediaLocation": null,
    "originalPhotoID": "",
    "photoID": "122127505023468773",
    "sphericalPhotoID": "",
    "thumbSrc": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/861498281_122127505029468773_7925144315177568439_n.jpg?stp=c0.241.941.941a_dst-jpg_tt6&cstp=mx941x941&ctp=s100x100&_nc_cat=104&ccb=1-7&_nc_sid=12b72b&_nc_ohc=uvpvTYMCl3gQ7kNvwHFqnHe&_nc_oc=Adpmai9o_VbJgKUis-3QfM6WZpRvwXuxnLSUaCtyeS6Qn6WKi7bOerkxw70cHcSlY8I&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=UkhWVIuNiLXKZONsbj_FRw&_nc_ss=792a8&oh=00_AQMEvV… (452 chars)",
    "width": 941,
    "mediaTakenTime": null
  },
  "lid": "7699448895999228964"
}
```

**runs/inspect/20261022T110738_61594063207669**, upload: after.png handed to the file chooser: 200, 5957 ms

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
    "imageSrc": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/859475432_122127505179468773_5558946944240149402_n.jpg?stp=dst-jpg_tt6&cstp=mx941x1672&ctp=s941x1672&_nc_cat=109&ccb=1-7&_nc_sid=12b72b&_nc_ohc=mGvFG5jE-EcQ7kNvwEbbeSe&_nc_oc=AdrNkYWtooac-nxFEsLHRh-I82Aq2M_65_gZYdmiFLzg-x-V8xKgblBPLGNzkDn5a1c&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=c8MajNToeViRo9odQqJ_bA&_nc_ss=792a8&oh=00_AQOtnabkL3Cv61jTvnsF… (438 chars)",
    "mediaLocation": null,
    "originalPhotoID": "",
    "photoID": "122127505173468773",
    "sphericalPhotoID": "",
    "thumbSrc": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/859475432_122127505179468773_5558946944240149402_n.jpg?stp=c0.241.941.941a_dst-jpg_tt6&cstp=mx941x941&ctp=s100x100&_nc_cat=109&ccb=1-7&_nc_sid=12b72b&_nc_ohc=mGvFG5jE-EcQ7kNvwEbbeSe&_nc_oc=AdrNkYWtooac-nxFEsLHRh-I82Aq2M_65_gZYdmiFLzg-x-V8xKgblBPLGNzkDn5a1c&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=c8MajNToeViRo9odQqJ_bA&_nc_ss=792a8&oh=00_AQNRpi… (452 chars)",
    "width": 941,
    "mediaTakenTime": null
  },
  "lid": "7699448973974069619"
}
```

<!-- facts:end -->

## What it does

Uploads one photo (`upload.facebook.com/ajax/react_composer/attachments/photo/upload`). One request per photo, 1.3-7.3 s each; they start from 0.4 s to 9.4 s into the upload step.

## What our machine does with it

The publish machine sets the files, then waits on Facebook's own `N/10` counter (never a sleep). Each counter step is one of these finishing.

## What can go wrong

A slow proxy shows here first: 7 s for one photo. A non-200 means that photo is missing from the listing and the counter stops short: the machine must not go on to Publish. Not yet seen failing.
