# discordApiApplicationsPublic

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/applications/public` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_5d663f85f9501c7723ed30938193a575689bcee1e23cb544f866f46b22f071ff` |

Seen 6 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 2 | 200 | 328–519 ms | 10619–11963 ms | — |
| inspect | step 9: goto /channels/@me | 2 | 200 | 336–568 ms | 5245–6447 ms | — |
| inspect | step 25: goto /channels/@me | 2 | 200 | 351–2376 ms | 4843–5938 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 519 ms

Sent:

```json
{
  "query": {
    "application_ids": "1470616226995765409"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "357607478105604096",
    "name": "War Thunder",
    "icon": "b23dfa191e3f3aa8142572110a99723f",
    "description": "War Thunder is a free-to-play air combat game set in the World War II and Korean War eras. Naval and land battles are planned additions.",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "1af9ab8fc691d17ed5d4103fdbece879",
    "splash": "04d71799c6c65c202262a7335f039264",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 21 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "overlay_compatibility_hook": true,
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "ed5af666992678458c1f7e0984ba8c42317ae667220e8332854d7b44f384cd4e",
    "embedded_surfaces": []
  },
  {
    "id": "363413310474813450",
    "name": "Wizard101",
    "icon": "dc0e50c93ea51ef3d025bc580b14dcf6",
    "description": "Wizard101 is a card-based fantasy MMO developed by KingIsle Entertainment.",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "086a87ecd7588b2d3ee0678b6f2059f8",
    "splash": "5003a939f33b47bd0fd70e2ad4c53a5a",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 1 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "hook": true,
    "executables": [
      "(3 fields)",
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "6040de7eec67f727a70695e98038dd61cbc773ba9aa3e8c203c355d1fbaa2575",
    "embedded_surfaces": []
  },
  {
    "id": "542075586886107149",
    "name": "Apex Legends",
    "icon": "91fac0600c5b6527c1aea95a93c6a8e0",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "2830612f6291d4d0d9a2acda8e8e94ee",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 18 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "aliases": [
      "Apex Legends"
    ],
    "guild_id": "541484311354933258",
    "executables": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "09ec3fea255d2f025b9b8aaa3aa39446d2428524830803d020483d628f06065c",
    "embedded_surfaces": []
  },
  {
    "id": "700136079562375258",
    "name": "VALORANT",
    "icon": "e55fc8259df1548328f977d302779ab7",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "843079ce9ee0b8f67c198747cdbcb96a",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 5 more"
    ],
    "linked_games": [
      "(3 fields)"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "hook": true,
    "aliases": [
      "VALORANT"
    ],
    "guild_id": "679875946597056683",
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "9c0c5c972af9029b85743a3d1c756ef6286058699029c63fbc22dc7d28607748",
    "embedded_surfaces": []
  },
  {
    "id": "1220537550809337856",
    "name": "Dragon's Dogma 2",
    "icon": "111484148fdb007d7df74024f1cd35ac",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "6c125cd6a468afb56cdea31bb72cbb13",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 7 more"
    ],
    "bot": {
      "id": "1220537550809337856",
      "username": "Dragon's Dogma 2",
      "global_name": null,
      "avatar": "111484148fdb007d7df74024f1cd35ac",
      "avatar_decoration_data": null,
      "collectibles": null,
      "discriminator": "6811",
      "display_name_styles": null,
      "public_flags": 0,
      "primary_guild": null,
      "clan": null,
      "bot": true,
      "banner": null,
      "banner_color": null,
      "accent_color": null
    },
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "90d3c8f26adb59eba5f8f7e9eda75179e10856b71706d897fafd9c308edbed37",
    "embedded_surfaces": []
  },
  {
    "id": "1260340082150346932",
    "name": "Once Human",
    "icon": "ec8a566bcaad1d21e45e728e1307ab1a",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "18535f5756286c51c7ba28b12d70fb13",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 9 more"
    ],
    "bot": {
      "id": "1260340082150346932",
      "username": "Once Human",
      "global_name": null,
      "avatar": "ec8a566bcaad1d21e45e728e1307ab1a",
      "avatar_decoration_data": null,
      "collectibles": null,
      "discriminator": "4988",
      "display_name_styles": null,
      "public_flags": 0,
      "primary_guild": null,
      "clan": null,
      "bot": true,
      "banner": null,
      "banner_color": null,
      "accent_color": null
    },
    "linked_games": [
      "(3 fields)"
    ],
    "content_classification": {
      "agency_ratings": "(3 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "8d63127829fdf7fab9e58719d94b2e404169d7ae9ce5550ca5c381ac7cbeefec",
    "embedded_surfaces": []
  },
  "… 9 more"
]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 568 ms

Sent:

```json
{
  "query": {
    "application_ids": "1470616226995765409"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "357607478105604096",
    "name": "War Thunder",
    "icon": "b23dfa191e3f3aa8142572110a99723f",
    "description": "War Thunder is a free-to-play air combat game set in the World War II and Korean War eras. Naval and land battles are planned additions.",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "1af9ab8fc691d17ed5d4103fdbece879",
    "splash": "04d71799c6c65c202262a7335f039264",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 21 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "overlay_compatibility_hook": true,
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "ed5af666992678458c1f7e0984ba8c42317ae667220e8332854d7b44f384cd4e",
    "embedded_surfaces": []
  },
  {
    "id": "363413310474813450",
    "name": "Wizard101",
    "icon": "dc0e50c93ea51ef3d025bc580b14dcf6",
    "description": "Wizard101 is a card-based fantasy MMO developed by KingIsle Entertainment.",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "086a87ecd7588b2d3ee0678b6f2059f8",
    "splash": "5003a939f33b47bd0fd70e2ad4c53a5a",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 1 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "hook": true,
    "executables": [
      "(3 fields)",
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "6040de7eec67f727a70695e98038dd61cbc773ba9aa3e8c203c355d1fbaa2575",
    "embedded_surfaces": []
  },
  {
    "id": "542075586886107149",
    "name": "Apex Legends",
    "icon": "91fac0600c5b6527c1aea95a93c6a8e0",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "2830612f6291d4d0d9a2acda8e8e94ee",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 18 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "aliases": [
      "Apex Legends"
    ],
    "guild_id": "541484311354933258",
    "executables": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "09ec3fea255d2f025b9b8aaa3aa39446d2428524830803d020483d628f06065c",
    "embedded_surfaces": []
  },
  {
    "id": "700136079562375258",
    "name": "VALORANT",
    "icon": "e55fc8259df1548328f977d302779ab7",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "843079ce9ee0b8f67c198747cdbcb96a",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 5 more"
    ],
    "linked_games": [
      "(3 fields)"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "hook": true,
    "aliases": [
      "VALORANT"
    ],
    "guild_id": "679875946597056683",
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "9c0c5c972af9029b85743a3d1c756ef6286058699029c63fbc22dc7d28607748",
    "embedded_surfaces": []
  },
  {
    "id": "1220537550809337856",
    "name": "Dragon's Dogma 2",
    "icon": "111484148fdb007d7df74024f1cd35ac",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "6c125cd6a468afb56cdea31bb72cbb13",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 7 more"
    ],
    "bot": {
      "id": "1220537550809337856",
      "username": "Dragon's Dogma 2",
      "global_name": null,
      "avatar": "111484148fdb007d7df74024f1cd35ac",
      "avatar_decoration_data": null,
      "collectibles": null,
      "discriminator": "6811",
      "display_name_styles": null,
      "public_flags": 0,
      "primary_guild": null,
      "clan": null,
      "bot": true,
      "banner": null,
      "banner_color": null,
      "accent_color": null
    },
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "90d3c8f26adb59eba5f8f7e9eda75179e10856b71706d897fafd9c308edbed37",
    "embedded_surfaces": []
  },
  {
    "id": "1260340082150346932",
    "name": "Once Human",
    "icon": "ec8a566bcaad1d21e45e728e1307ab1a",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "18535f5756286c51c7ba28b12d70fb13",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 9 more"
    ],
    "bot": {
      "id": "1260340082150346932",
      "username": "Once Human",
      "global_name": null,
      "avatar": "ec8a566bcaad1d21e45e728e1307ab1a",
      "avatar_decoration_data": null,
      "collectibles": null,
      "discriminator": "4988",
      "display_name_styles": null,
      "public_flags": 0,
      "primary_guild": null,
      "clan": null,
      "bot": true,
      "banner": null,
      "banner_color": null,
      "accent_color": null
    },
    "linked_games": [
      "(3 fields)"
    ],
    "content_classification": {
      "agency_ratings": "(3 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "8d63127829fdf7fab9e58719d94b2e404169d7ae9ce5550ca5c381ac7cbeefec",
    "embedded_surfaces": []
  },
  "… 9 more"
]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 25: goto /channels/@me: 200, 2376 ms

Sent:

```json
{
  "query": {
    "application_ids": "1470616226995765409"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "357607478105604096",
    "name": "War Thunder",
    "icon": "b23dfa191e3f3aa8142572110a99723f",
    "description": "War Thunder is a free-to-play air combat game set in the World War II and Korean War eras. Naval and land battles are planned additions.",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "1af9ab8fc691d17ed5d4103fdbece879",
    "splash": "04d71799c6c65c202262a7335f039264",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 21 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "overlay_compatibility_hook": true,
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "ed5af666992678458c1f7e0984ba8c42317ae667220e8332854d7b44f384cd4e",
    "embedded_surfaces": []
  },
  {
    "id": "363413310474813450",
    "name": "Wizard101",
    "icon": "dc0e50c93ea51ef3d025bc580b14dcf6",
    "description": "Wizard101 is a card-based fantasy MMO developed by KingIsle Entertainment.",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "086a87ecd7588b2d3ee0678b6f2059f8",
    "splash": "5003a939f33b47bd0fd70e2ad4c53a5a",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 1 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "hook": true,
    "executables": [
      "(3 fields)",
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "6040de7eec67f727a70695e98038dd61cbc773ba9aa3e8c203c355d1fbaa2575",
    "embedded_surfaces": []
  },
  {
    "id": "542075586886107149",
    "name": "Apex Legends",
    "icon": "91fac0600c5b6527c1aea95a93c6a8e0",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "2830612f6291d4d0d9a2acda8e8e94ee",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 18 more"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "aliases": [
      "Apex Legends"
    ],
    "guild_id": "541484311354933258",
    "executables": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "09ec3fea255d2f025b9b8aaa3aa39446d2428524830803d020483d628f06065c",
    "embedded_surfaces": []
  },
  {
    "id": "700136079562375258",
    "name": "VALORANT",
    "icon": "e55fc8259df1548328f977d302779ab7",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "843079ce9ee0b8f67c198747cdbcb96a",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 5 more"
    ],
    "linked_games": [
      "(3 fields)"
    ],
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "hook": true,
    "aliases": [
      "VALORANT"
    ],
    "guild_id": "679875946597056683",
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "9c0c5c972af9029b85743a3d1c756ef6286058699029c63fbc22dc7d28607748",
    "embedded_surfaces": []
  },
  {
    "id": "1220537550809337856",
    "name": "Dragon's Dogma 2",
    "icon": "111484148fdb007d7df74024f1cd35ac",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "6c125cd6a468afb56cdea31bb72cbb13",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 7 more"
    ],
    "bot": {
      "id": "1220537550809337856",
      "username": "Dragon's Dogma 2",
      "global_name": null,
      "avatar": "111484148fdb007d7df74024f1cd35ac",
      "avatar_decoration_data": null,
      "collectibles": null,
      "discriminator": "6811",
      "display_name_styles": null,
      "public_flags": 0,
      "primary_guild": null,
      "clan": null,
      "bot": true,
      "banner": null,
      "banner_color": null,
      "accent_color": null
    },
    "content_classification": {
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "90d3c8f26adb59eba5f8f7e9eda75179e10856b71706d897fafd9c308edbed37",
    "embedded_surfaces": []
  },
  {
    "id": "1260340082150346932",
    "name": "Once Human",
    "icon": "ec8a566bcaad1d21e45e728e1307ab1a",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "18535f5756286c51c7ba28b12d70fb13",
    "third_party_skus": [
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "(3 fields)",
      "… 9 more"
    ],
    "bot": {
      "id": "1260340082150346932",
      "username": "Once Human",
      "global_name": null,
      "avatar": "ec8a566bcaad1d21e45e728e1307ab1a",
      "avatar_decoration_data": null,
      "collectibles": null,
      "discriminator": "4988",
      "display_name_styles": null,
      "public_flags": 0,
      "primary_guild": null,
      "clan": null,
      "bot": true,
      "banner": null,
      "banner_color": null,
      "accent_color": null
    },
    "linked_games": [
      "(3 fields)"
    ],
    "content_classification": {
      "agency_ratings": "(3 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": [
      "(3 fields)"
    ],
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "8d63127829fdf7fab9e58719d94b2e404169d7ae9ce5550ca5c381ac7cbeefec",
    "embedded_surfaces": []
  },
  "… 9 more"
]
```

<!-- facts:end -->

## What it does

Looks up public details of the applications (bots, games) the account sees, by id, to draw their names and icons.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
