# discordApiUsersMeAffinitiesUsers

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/affinities/users` |
| Sends | — |
| Reads | `user_affinities` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_c5f5b29557358e8f6a7965b15a314a978e20b156a0e17c21d64cba4321fdb7ad` |

Seen 9 time(s) in 9 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 789 ms | 6560 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 740 ms | 48694 ms | — |
| inspect | step 1: goto /login | 6 | 200 | 200–804 ms | 25829–1045767 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 209 ms | 22346 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 209 ms

Sent:

```json
null
```

Answered:

```json
{
  "user_affinities": [
    {
      "other_user_id": "1434443116663930960",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.8649888777530657,
      "dm_rank": 1,
      "vc_probability": 0.8384374641430918,
      "vc_rank": 1,
      "server_message_probability": 0.01159895717029362,
      "server_message_rank": 3,
      "communication_probability": 0.571675099688817,
      "communication_rank": 1
    },
    {
      "other_user_id": "1568181084384919620",
      "user_segment": "HFU_MAU",
      "other_user_segment": "NON_HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.7194415675687208,
      "dm_rank": 6,
      "vc_probability": 0.46243374403706544,
      "vc_rank": 2,
      "server_message_probability": 0.004531981780448748,
      "server_message_rank": 11,
      "communication_probability": 0.3954690977954117,
      "communication_rank": 2
    },
    {
      "other_user_id": "541647035317747722",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.8317501805713895,
      "dm_rank": 3,
      "vc_probability": 0.3089209846330373,
      "vc_rank": 3,
      "server_message_probability": 0.005436193214017644,
      "server_message_rank": 4,
      "communication_probability": 0.3820357861394815,
      "communication_rank": 3
    },
    {
      "other_user_id": "1192133857198223460",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.8350497945295688,
      "dm_rank": 2,
      "vc_probability": 0.006447767541073292,
      "vc_rank": 9,
      "server_message_probability": 0.003580258386305242,
      "server_message_rank": 13,
      "communication_probability": 0.28169260681898245,
      "communication_rank": 4
    },
    {
      "other_user_id": "1327503062356590636",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": false,
      "dm_probability": 0.7800661402909699,
      "dm_rank": 4,
      "vc_probability": 0.003881907749344152,
      "vc_rank": 12,
      "server_message_probability": 0.003193042536268376,
      "server_message_rank": 17,
      "communication_probability": 0.26238036352552746,
      "communication_rank": 5
    },
    {
      "other_user_id": "949667587732680735",
      "user_segment": "HFU_MAU",
      "other_user_segment": "NON_HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.7399947462107985,
      "dm_rank": 5,
      "vc_probability": 0.0024686419526251864,
      "vc_rank": 20,
      "server_message_probability": 0.003034602623310867,
      "server_message_rank": 22,
      "communication_probability": 0.24849933026224486,
      "communication_rank": 6
    },
    "… 90 more"
  ]
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 257 ms

Sent:

```json
null
```

Answered:

```json
{
  "user_affinities": [
    {
      "other_user_id": "1434443116663930960",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.8653584930842243,
      "dm_rank": 1,
      "vc_probability": 0.8359550989805676,
      "vc_rank": 1,
      "server_message_probability": 0.00653867643290295,
      "server_message_rank": 4,
      "communication_probability": 0.5692840894992317,
      "communication_rank": 1
    },
    {
      "other_user_id": "541647035317747722",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.8607169920402292,
      "dm_rank": 2,
      "vc_probability": 0.6304665332171245,
      "vc_rank": 2,
      "server_message_probability": 0.004002721750822658,
      "server_message_rank": 12,
      "communication_probability": 0.4983954156693921,
      "communication_rank": 2
    },
    {
      "other_user_id": "1568181084384919620",
      "user_segment": "HFU_MAU",
      "other_user_segment": "NON_HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.8449604242001966,
      "dm_rank": 7,
      "vc_probability": 0.6116325946299872,
      "vc_rank": 3,
      "server_message_probability": 0.006660732204090521,
      "server_message_rank": 3,
      "communication_probability": 0.48775125034475814,
      "communication_rank": 3
    },
    {
      "other_user_id": "1173020076509773965",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.8533741832153393,
      "dm_rank": 4,
      "vc_probability": 0.12898052381474523,
      "vc_rank": 4,
      "server_message_probability": 0.0031619970584653594,
      "server_message_rank": 17,
      "communication_probability": 0.32850556802951664,
      "communication_rank": 4
    },
    {
      "other_user_id": "1177427345733324870",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": false,
      "dm_probability": 0.8471571330944685,
      "dm_rank": 5,
      "vc_probability": 0.017510653211941063,
      "vc_rank": 8,
      "server_message_probability": 0.013674508629035229,
      "server_message_rank": 2,
      "communication_probability": 0.2927807649784816,
      "communication_rank": 5
    },
    {
      "other_user_id": "1192133857198223460",
      "user_segment": "HFU_MAU",
      "other_user_segment": "HFU_MAU",
      "is_friend": true,
      "dm_probability": 0.8593038617187031,
      "dm_rank": 3,
      "vc_probability": 0.007789409007541532,
      "vc_rank": 10,
      "server_message_probability": 0.003580258386305242,
      "server_message_rank": 14,
      "communication_probability": 0.29022450970418334,
      "communication_rank": 6
    },
    "… 88 more"
  ]
}
```

<!-- facts:end -->

## What it does

Lists the people the account talks to most, used to rank the Quick Switcher and suggestions.

## What our machine does with it

Not read yet. It is the ranking behind Ctrl+K, so it would say whom the account talks to most.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
