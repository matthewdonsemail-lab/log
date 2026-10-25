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
| rea | `ev_77f49a499f9c045a2c0a4763fb2749925e8804774203e978a1a8c47464af4aa1` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 4: uploadRole button "…" | 2 | 200 | 2537–5204 ms | 766–844 ms | — |
| inspect | step 4: upload e1180 | 1 | 200 | 3399 ms | 630 ms | — |
| inspect | step 5: upload e1313 | 1 | 200 | 4784 ms | 1954 ms | — |
| host | step 20: uploadRole button "…" | 1 | 200 | 4065 ms | 2509 ms | — |
| host | step 38: uploadRole button "…" | 1 | 200 | 1924 ms | 1887 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T164523_61593843527201**, step 5: upload e1313: 200, 4784 ms

Sent:

```json
{
  "query": {
    "photo_source": "57",
    "profile_id": "61593843527201"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A1qhsdjdXmm7IML6dhW4wjI",
  "payload": {
    "fbid": "122123515989461450",
    "profileID": "61593843527201",
    "imageURI": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-6/863613843_122123515995461450_843471129485614990_n.jpg (441 chars)",
    "imageHeight": 1200,
    "imageWidth": 896
  },
  "lid": "7700276948195363920"
}
```

**runs/host/20261024T222706_61593981307720**, step 38: uploadRole button "…": 200, 1924 ms

Sent:

```json
{
  "query": {
    "photo_source": "57",
    "profile_id": "61593981307720"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A1EZzlb4YhcsUHjOuD5GoYV",
  "payload": {
    "fbid": "122128629399466043",
    "profileID": "61593981307720",
    "imageURI": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-6/864257525_122128629405466043_8971047615363713674_n.jpg (442 chars)",
    "imageHeight": 1110,
    "imageWidth": 815
  },
  "lid": "7700366227710634764"
}
```

**runs/host/20261024T211541_61593939852820**, step 20: uploadRole button "…": 200, 4065 ms

Sent:

```json
{
  "query": {
    "photo_source": "57",
    "profile_id": "61593939852820"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AEO8zV-F3ra8ArVdAATpOt-",
  "payload": {
    "fbid": "122127029205464661",
    "profileID": "61593939852820",
    "imageURI": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-6/863325433_122127029211464661_923216486577496458_n.jpg (467 chars)",
    "imageHeight": 1078,
    "imageWidth": 817
  },
  "lid": "7700347597428916364"
}
```

<!-- facts:end -->

## What it does

Uploads the chosen file for the profile picture before it is cropped.

## What our machine does with it

Fired by step 4 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) (upload through "Upload Photo").

## What can go wrong

A failed upload leaves the crop dialog empty; Save never enables and step 5 fails.
