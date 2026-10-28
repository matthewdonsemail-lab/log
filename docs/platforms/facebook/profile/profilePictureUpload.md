# profilePictureUpload

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | endpoint |
| doc_id | — |
| Path | `/profile/picture/upload/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_3c0e039b950ea3ccd4fa079004a699ee91d09da4a883e0592a6634df910dc3f8` |

Seen 7 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 4: uploadRole button "…" | 2 | 200 | 2537–5204 ms | 766–844 ms | — |
| inspect | step 4: upload e1180 | 1 | 200 | 3399 ms | 630 ms | — |
| inspect | step 5: upload e1313 | 1 | 200 | 4784 ms | 1954 ms | — |
| host | step 20: uploadRole button "…" | 1 | 200 | 4065 ms | 2509 ms | — |
| host | step 38: uploadRole button "…" | 1 | 200 | 1924 ms | 1887 ms | — |
| host | step 10: uploadRole button "…" | 1 | 200 | 1643 ms | 1182 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 10: uploadRole button "…": 200, 1643 ms

Sent:

```json
{
  "query": {
    "photo_source": "57",
    "profile_id": "61594285317994"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AC4AlGD_QTNVdD2wMcSbQTA",
  "payload": {
    "fbid": "122127009279476177",
    "profileID": "61594285317994",
    "imageURI": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-6/861826748_122127009285476177_3116611628911920417_n.jpg (468 chars)",
    "imageHeight": 1059,
    "imageWidth": 803
  },
  "lid": "7701039855905876932"
}
```

<!-- facts:end -->

## What it does

Uploads the chosen file for the profile picture before it is cropped.

## What our machine does with it

Fired by step 4 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) (upload through "Upload Photo").

## What can go wrong

A failed upload leaves the crop dialog empty; Save never enables and step 5 fails.
