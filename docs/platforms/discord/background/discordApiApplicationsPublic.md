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
| Called from | `runs/inspect/20261113T141543_<name:10>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:10>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:10>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:10>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 14 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 2 | 200 | 328–519 ms | 10619–11963 ms | — |
| inspect | step 9: goto /channels/@me | 2 | 200 | 336–568 ms | 5245–6447 ms | — |
| inspect | step 25: goto /channels/@me | 2 | 200 | 351–2376 ms | 4843–5938 ms | — |
| inspect | step 1: goto /login | 6 | 200 | 360–11499 ms | 15797–1050595 ms | — |
| inspect | step 2: snapshot | 2 | 200 | 486–510 ms | 49606–49728 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:10>**, step 1: goto /login: 200, 495 ms

Sent:

```json
{
  "query": {
    "application_ids": "1461154307171811401"
  },
  "body": null
}
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "name": "<name:1>",
    "icon": "e55fc8259df1548328f977d302779ab7",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "843079ce9ee0b8f67c198747cdbcb96a",
    "third_party_skus": "(7 items)",
    "linked_games": "(1 items)",
    "content_classification": "(1 fields)",
    "flags": 0,
    "flags_new": "0",
    "overlay": true,
    "hook": true,
    "aliases": "(1 items)",
    "guild_id": "679875946597056683",
    "executables": "(1 items)",
    "storefront_available": false,
    "integration_types_config": "(1 fields)",
    "verify_key": "<token>",
    "embedded_surfaces": "(0 items)"
  },
  {
    "id": "<id:2>",
    "name": "<name:2>",
    "icon": "444d067889922e42b0af99b13e5d5c72",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "19701471f3f68a36919a567e396f12e2",
    "third_party_skus": "(7 items)",
    "bot": "(15 fields)",
    "linked_games": "(1 items)",
    "content_classification": "(1 fields)",
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "aliases": "(1 items)",
    "executables": "(1 items)",
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": "(1 fields)",
    "verify_key": "<token>",
    "embedded_surfaces": "(0 items)"
  },
  {
    "id": "<id:3>",
    "name": "<name:3>",
    "icon": "5ef6801f10b038424d2541b89463df2f",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "657cfd5510255845f681d55c764c592e",
    "third_party_skus": "(7 items)",
    "bot": "(15 fields)",
    "content_classification": "(1 fields)",
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": "(1 items)",
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": "(1 fields)",
    "verify_key": "<token>",
    "embedded_surfaces": "(0 items)"
  },
  {
    "id": "<id:4>",
    "name": "<name:4>",
    "icon": "111484148fdb007d7df74024f1cd35ac",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "6c125cd6a468afb56cdea31bb72cbb13",
    "third_party_skus": "(7 items)",
    "bot": "(15 fields)",
    "content_classification": "(1 fields)",
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": "(1 items)",
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": "(1 fields)",
    "verify_key": "<token>",
    "embedded_surfaces": "(0 items)"
  },
  {
    "id": "<id:5>",
    "name": "<name:5>",
    "icon": "ec8a566bcaad1d21e45e728e1307ab1a",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "18535f5756286c51c7ba28b12d70fb13",
    "third_party_skus": "(7 items)",
    "bot": "(15 fields)",
    "linked_games": "(1 items)",
    "content_classification": "(1 fields)",
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "executables": "(1 items)",
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": "(1 fields)",
    "verify_key": "<token>",
    "embedded_surfaces": "(0 items)"
  },
  {
    "id": "<id:6>",
    "name": "<name:6>",
    "icon": "b838c4c744b9cb9f8dd4c8afb82b085f",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "f963106d204a9fd7a14bbba8140c5ed2",
    "third_party_skus": "(7 items)",
    "bot": "(15 fields)",
    "linked_games": "(1 items)",
    "content_classification": "(1 fields)",
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "aliases": "(1 items)",
    "executables": "(2 items)",
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": "(1 fields)",
    "verify_key": "<token>",
    "embedded_surfaces": "(0 items)"
  },
  "… 5 more"
]
```

**runs/inspect/20261030T222341_<name:10>**, step 2: snapshot: 200, 510 ms

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
    "id": "<id:7>",
    "name": "<name:7>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:8>",
    "name": "<name:8>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:1>",
    "name": "<name:1>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:4>",
    "name": "<name:4>",
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
      "id": "<id:4>",
      "username": "<username:1>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:5>",
    "name": "<name:5>",
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
      "id": "<id:5>",
      "username": "<username:2>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:6>",
    "name": "<name:6>",
    "icon": "b838c4c744b9cb9f8dd4c8afb82b085f",
    "description": "",
    "summary": "",
    "type": 5,
    "is_monetized": false,
    "is_verified": false,
    "is_discoverable": false,
    "cover_image": "f963106d204a9fd7a14bbba8140c5ed2",
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
      "id": "<id:6>",
      "username": "<username:3>",
      "global_name": null,
      "avatar": "b838c4c744b9cb9f8dd4c8afb82b085f",
      "avatar_decoration_data": null,
      "collectibles": null,
      "discriminator": "5275",
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
      "agency_ratings": "(2 fields)"
    },
    "flags": 0,
    "flags_new": "0",
    "hook": true,
    "aliases": [
      "<name:6>"
    ],
    "executables": [
      "(3 fields)",
      "(3 fields)"
    ],
    "storefront_available": false,
    "bot_public": true,
    "bot_require_code_grant": false,
    "integration_types_config": {
      "0": "(0 fields)"
    },
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  "… 7 more"
]
```

**runs/inspect/20261028T062914_<name:10>**, step 5: click e40: 200, 519 ms

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
    "id": "<id:7>",
    "name": "<name:7>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:9>",
    "name": "<name:9>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:8>",
    "name": "<name:8>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:1>",
    "name": "<name:1>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:4>",
    "name": "<name:4>",
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
      "id": "<id:4>",
      "username": "<username:1>",
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
    "verify_key": "<token>",
    "embedded_surfaces": []
  },
  {
    "id": "<id:5>",
    "name": "<name:5>",
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
      "id": "<id:5>",
      "username": "<username:2>",
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
    "verify_key": "<token>",
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
