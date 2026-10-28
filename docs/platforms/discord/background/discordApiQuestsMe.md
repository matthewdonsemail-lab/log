# discordApiQuestsMe

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/@me` |
| Sends | — |
| Reads | `quests`, `excluded_quests`, `quest_enrollment_blocked_until`, `quest_access_suspended_until` |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_bdd4c9c280ff56b1d966a3b39f3ccbeef13b7ca43a0f4e9cc81cb3a05b6cf670` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 651 ms | 4963 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 608 ms | 6502 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 583 ms | 3040 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 728 ms | 2403 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 651 ms

Sent:

```json
null
```

Answered:

```json
{
  "quests": [
    {
      "id": "1550379237335367680",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLU010dnFXTkVETndpTXpYUit4NEFHM0FkUHhERWJNVlJKUXd3VnhkNGFhR01Jak1BWWcrR01iZCttejRrZ3lCa0toRDV0b2dZVGNxVHJncG52YmY0a20wd1hoRldNS0FvSnhSNmF5cnVRMHB6aU0vb0hYRW9hRjZrRE10TnAifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJeCtGdURuTHRXdzRyWEgrK1h2QnFLTkp2dmdqUUVXdHZvTU9haHNDV2tlc2FkVGg1YTE5TjZvM2I4Wk1NRzNmRjBZRGZ5TnFHQkd1NElUeXlINHdmVlp5ZTFVV0dUOUtHYjQ0Z1p3VEw3MENnMDhlU2dGM3FZYUNiWGVBQ1c5cFhSUUFXWmxlbVBSTCs5bkZjTTNTVHNEZFV4enFWb0YrcjZBNGg2ZmZKTEl6TVNrRkhWIn0="
    },
    {
      "id": "1547647018090893312",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLU010dnFXTkVETndpTXpYUit4NEFHM0FkUHhERWJNVlJKUXd3VnhkNGFhR01Jak1BWWcrR01iZCttejRrZ3lCa0toRDV0b2dZVGNxVHJncG52YmY0a20wd1hoRldNS0FvSnhSNmF5cnVRMHB6aU0vb0hYRW9hRjZrRE10TnAifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKZzJKakQxQXZXeUNqekhjd3NTTVdSSDlaeW9iTkJ1dTMvQldHK1U1N2Q3OGNXMmlwRitvODJLazZnenRDOGJJTndJMnJFUjJSRVpWRUczUitjTmVzbkpicGprZXlocnhVeEZ0ekpCT1ppNzlweDVPTGM2ckpFYzRIeVgzNnRVWlVWaDZsZjVhYUhCNTFEQjZ2T29qZjc2c0VJbXdSRkRhQzU1Uzg0NWw1ZkdxblRFRlQyIn0="
    },
    {
      "id": "1550081499628441600",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLU010dnFXTkVETndpTXpYUit4NEFHM0FkUHhERWJNVlJKUXd3VnhkNGFhR01Jak1BWWcrR01iZCttejRrZ3lCa0toRDV0b2dZVGNxVHJncG52YmY0a20wd1hoRldNS0FvSnhSNmF5cnVRMHB6aU0vb0hYRW9hRjZrRE10TnAifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKbk1TVXhYMXlTSDFOMmpkc1B0Uy8wVk44eUtqZ1pkNURGckNlRWgvMHpubE0rWU9jNis3dEdpSnUwSjkwYTQzUm9rOTVMYjJrYVViUnRLb1JQMjRROW5UZ1BwdjdCUHo0azRweUFYSzc5TVZWazVBeDBRVG9RWUp6U2tmWXlTbGhCV0dETjR6bUJIK0xXRTJyZncwRXp6Y0VtK3BzQm1QWklFQXhJbzBWNkl0M1VHK0F6In0="
    },
    {
      "id": "1548040517420449792",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLU010dnFXTkVETndpTXpYUit4NEFHM0FkUHhERWJNVlJKUXd3VnhkNGFhR01Jak1BWWcrR01iZCttejRrZ3lCa0toRDV0b2dZVGNxVHJncG52YmY0a20wd1hoRldNS0FvSnhSNmF5cnVRMHB6aU0vb0hYRW9hRjZrRE10TnAifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKN2pHVHJSbktVZDRSM25CTWIrcHdTQzVIZFNLUmVoQldVRllPZW9Hc1NHdlo2OFlGSjlvWWVRdGVEK3JaV0UrUU5ZRExPbEFkcXBDRVBneVJpTGhMNHJCRDZFMjAxd0F5dzE2UzRQSFJSUFpwUjhtZW41TkZ1Vk1LUzExL1RJNDJ6TEtxbCtNazJNM0V5ZmtvbkdySlBOeE4wV2dBQ3ppL2FvREpWVml5WHZzcjdCRjdyIn0="
    },
    {
      "id": "1553154139435835392",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLU010dnFXTkVETndpTXpYUit4NEFHM0FkUHhERWJNVlJKUXd3VnhkNGFhR01Jak1BWWcrR01iZCttejRrZ3lCa0toRDV0b2dZVGNxVHJncG52YmY0a20wd1hoRldNS0FvSnhSNmF5cnVRMHB6aU0vb0hYRW9hRjZrRE10TnAifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLTkJ2andkS3JKbkFOWTJGU3hTUStsUEZuVFk4UUx5Q3RPQm5nKytFWUJVWkRRcGt3UWQxWFpNVjhjVERrcEU0djc4THlya0xIU3I5ZHFGS20vbTFINEZ4N25qK280dW9naDlnNGJ6VlUwdWluRnFKNXVkSS9Pcko3VGlMUUdzVE43SHRvSWZ6SldOR1QxL1JFZGZxSnN3d0VEMjRhWG03NTdxQXF3SDJOb3gxM0JWZEFoIn0="
    },
    {
      "id": "1558112706446368769",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLU010dnFXTkVETndpTXpYUit4NEFHM0FkUHhERWJNVlJKUXd3VnhkNGFhR01Jak1BWWcrR01iZCttejRrZ3lCa0toRDV0b2dZVGNxVHJncG52YmY0a20wd1hoRldNS0FvSnhSNmF5cnVRMHB6aU0vb0hYRW9hRjZrRE10TnAifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJYi8xUHk4VGRmK0o4NVR5UmhJaHhPTVJZQnVFcDl2QjEzZzZqaFJjc0hyU1NMdjc4NmIrMkFLMW5HTS9sUjNlZEZJcUdyQUJ5MlM1YWY4VFY0V3gwWENBZzhydDZnOW1pczBPN1NyQnVRSXNEaDk4SFBJODhUMTdPaGxRUG9vTDF2bGV1QnZmeUcxRUdYcjZHUXN4NTlhV053M3FVS0xFbkNKVkh5RTAwaGd3dWU2NnRiIn0="
    },
    "… 73 more"
  ],
  "excluded_quests": [
    {
      "id": "1549087389715013632"
    },
    {
      "id": "1558176501663272961"
    },
    {
      "id": "1553392150924890112"
    },
    {
      "id": "1541371710417272834"
    },
    {
      "id": "1541369647985594369"
    },
    {
      "id": "1552026570229813258"
    },
    "… 74 more"
  ],
  "quest_enrollment_blocked_until": null,
  "quest_access_suspended_until": null
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 608 ms

Sent:

```json
null
```

Answered:

```json
{
  "quests": [
    {
      "id": "1550379237335367680",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKWkxNZDFMN0dJYnpIVWJJUHlhRHV0T1ozN2RqcDRSZVBqNENKRTY0L3p0aU5Ta21VcVdSdThXMDhKVEhhWjlFTnlheEpQcFJMNDFkdmlDSHNwdHUvc2JkcDhDcjBDYVBiWXcyUy9tTDdJQTQ0S3VRc0dScHlaNktkMHZaYngifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJWlZpTUxYMlV4VVVqN1M5b21ScUZGNit1c0lZZnloMHI1djZTYWRqOEVvNFk1QjRUTlkrdkF3S2hWOHdBa2NzTG1CdG1BYkxvQ3VLMXVYU2JUS1JiYUhXUk5RMlVJSGwzS2xxSDZpSHVNQ3dwbVc2NkNEV1RhNDFJWnppUlorMnEyZzNtbHgyR1FWcEpxSmxoVlE1VDJOTDdDWk9HZ09qT0lIYzEycCtCZk5uQnZjc0hwIn0="
    },
    {
      "id": "1547647018090893312",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKWkxNZDFMN0dJYnpIVWJJUHlhRHV0T1ozN2RqcDRSZVBqNENKRTY0L3p0aU5Ta21VcVdSdThXMDhKVEhhWjlFTnlheEpQcFJMNDFkdmlDSHNwdHUvc2JkcDhDcjBDYVBiWXcyUy9tTDdJQTQ0S3VRc0dScHlaNktkMHZaYngifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKZlZoZ1RXWkRiWWVSMHFJZWo0UENyWitCSm9tOGRjcVFCRE94YnJTWnAvZjF6aWxSOEVKU3NjRzNpb2dSWmFVTm1LcC9FNTkyK21JdTBRU2RJbEgyYzM0dFZzZ0tVWU5ReEsreURTQ3dSYlpCT1ZvMlRXZm8xeXp0eFBXRzJlOUVaemk2S3piOVdHbWVsd01obUpyV3lWeTBESy9TS2hDQ1dla2N5MDFRa2xrUFFidGlPIn0="
    },
    {
      "id": "1550081499628441600",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKWkxNZDFMN0dJYnpIVWJJUHlhRHV0T1ozN2RqcDRSZVBqNENKRTY0L3p0aU5Ta21VcVdSdThXMDhKVEhhWjlFTnlheEpQcFJMNDFkdmlDSHNwdHUvc2JkcDhDcjBDYVBiWXcyUy9tTDdJQTQ0S3VRc0dScHlaNktkMHZaYngifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJcUcraGp4ekhsaVpEMEpqNlAxMEwzSk9ia0NDT3YwTFVWU3M2TmIwdTgvWVI5em1TZEFLWDk4QVZFSkVpQW5wa0FKR2diMVhQYlpwNlhBa0NHNDQ4N1htQnlldFFBVzBtN2lVVGcrSFBNaURRQm51R0Y1OTBKcm4xQ1NQUUIzVXFORkp3eDlLSTVtVWc3MnVGd1ZWNlNGSHVrakMvb0ZEY1AyUC9Mc0V2NVJhYzQ3bjNVIn0="
    },
    {
      "id": "1548040517420449792",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKWkxNZDFMN0dJYnpIVWJJUHlhRHV0T1ozN2RqcDRSZVBqNENKRTY0L3p0aU5Ta21VcVdSdThXMDhKVEhhWjlFTnlheEpQcFJMNDFkdmlDSHNwdHUvc2JkcDhDcjBDYVBiWXcyUy9tTDdJQTQ0S3VRc0dScHlaNktkMHZaYngifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKaWlNL0VlUkdtWGJYVE5qbkNEckkzTkc0bjJ5TWZlb2luUEh5ckdjTHZDVmNGT2ljQU04MGd2ZDQvZmVOT09GYTFNakR2Wm9qUVpuZEdkTDBhNEFRUmdOVWd4bUxWbTdic3FtdUV1M1gwODRzYitjRWcyOUdsWWRobnBUNy9ONjFFOFJtb2czYm1ORk5zRC83TnBiRi9vRjd1SXVWbjBzdHQyc1hOVVRTVnRRdm5xZWFPIn0="
    },
    {
      "id": "1553154139435835392",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKWkxNZDFMN0dJYnpIVWJJUHlhRHV0T1ozN2RqcDRSZVBqNENKRTY0L3p0aU5Ta21VcVdSdThXMDhKVEhhWjlFTnlheEpQcFJMNDFkdmlDSHNwdHUvc2JkcDhDcjBDYVBiWXcyUy9tTDdJQTQ0S3VRc0dScHlaNktkMHZaYngifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJQkhvQk95Wk9Mc0EzRC9EelM2alNSNVBYOGF2eFJmcWpPZEVlRGJndUxQWVNIT2dVblNIVVMxK1VmU0NrZnlqWUZ0SFhDZ09GNUVYNTMvRytaVVhhRWlINDVIUDl2SlV2ZlhPd3V4QmRsWktjeS9RZFk4OVhLY2ZpSVBIYjVLTXlkbXJTaWlwRFMrVnJEcVR0ckZDNitUdWNscmgvSXpEc2lTY3VKdGQwcHF1SzZ3THIxIn0="
    },
    {
      "id": "1558112706446368769",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKWkxNZDFMN0dJYnpIVWJJUHlhRHV0T1ozN2RqcDRSZVBqNENKRTY0L3p0aU5Ta21VcVdSdThXMDhKVEhhWjlFTnlheEpQcFJMNDFkdmlDSHNwdHUvc2JkcDhDcjBDYVBiWXcyUy9tTDdJQTQ0S3VRc0dScHlaNktkMHZaYngifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJenhkUVdiM0c2RHJPeGFyN2NLYmcrU3Y1SEc5RXEyanVGY0Y5VVplWERzTjhUVWZJYnBaT3VxSXNvMVVHY1JhN0kvTTVVL1BqVmtTVllWeEVVTU43bG5KL1ZHSVhaaU53WlZ4dXpMT1QwdU5DcWpNUE9xdU5CdFhLeGFHOG93c3I2bE5Ycm5VbnF1QWFRL3FqVGhzcGtCMnRVWFJhVjRRMlVUYnF0ZlpQMXQ0Q0tmQ0Y1In0="
    },
    "… 73 more"
  ],
  "excluded_quests": [
    {
      "id": "1549087389715013632"
    },
    {
      "id": "1558176501663272961"
    },
    {
      "id": "1553392150924890112"
    },
    {
      "id": "1541371710417272834"
    },
    {
      "id": "1541369647985594369"
    },
    {
      "id": "1552026570229813258"
    },
    "… 74 more"
  ],
  "quest_enrollment_blocked_until": null,
  "quest_access_suspended_until": null
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 583 ms

Sent:

```json
null
```

Answered:

```json
{
  "quests": [
    {
      "id": "1550379237335367680",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMQWpZN2RTWkRqTVFQNFZwcWFybXNQNFZtN2ZqVncwSmVBK2krS1RkU3NnaGR5bGhBVkZnMmVIODkxZkRaMktTb3kyTmQwTkVFd3VKdjJudS9BYTNyazdiWE1oajBqbEMvMDNna3B6NEVBaFQ5OU1RV05CMFdwQ1dscGUzaVcifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLY01SL1lYWnVqa2RWVmN2Wmwxa2lrSEdGa0JEQ3d4WGQwQ1FQdkI1NVd1bHIvNVNoNVJHNHVteXFYREcyN0hsd1pLYk5VTG9YQTJrTnZ1WnQ2YSs5TzcrWjBsZXdRbEM3dUZiZGtHWEh6M3BicG0xTnZsV3B6MXFVSXUzZ2JCOUlJVjVUWXdyVkovNlNabFNhVkNOUkpXRDNDaU9xNUxhMURCNC9wVFhycFlXblFWT0x2In0="
    },
    {
      "id": "1547647018090893312",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMQWpZN2RTWkRqTVFQNFZwcWFybXNQNFZtN2ZqVncwSmVBK2krS1RkU3NnaGR5bGhBVkZnMmVIODkxZkRaMktTb3kyTmQwTkVFd3VKdjJudS9BYTNyazdiWE1oajBqbEMvMDNna3B6NEVBaFQ5OU1RV05CMFdwQ1dscGUzaVcifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKdFY4dytOTEtjYVdIRXI2SlFRUXdPMWZvTWw2bEZzdDUzY2g0K2h3SnNVaUpsK2ZySG1GUWpNTjZiRGk4TW9Pb21KMUszTW9lR3VKcjdNTjNzOW84ZUlMaDVWdHdIZkZHcENQN1lrN2xwWm5pTXNzWDZLd2tNRm5ubkdPTzZ0UTlwRm5MbnNNU2psellEcXpsbFZ1dVlRVE85RFVtY0UwZU0vT1BWazczU1VDdU5hRmhSIn0="
    },
    {
      "id": "1550081499628441600",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMQWpZN2RTWkRqTVFQNFZwcWFybXNQNFZtN2ZqVncwSmVBK2krS1RkU3NnaGR5bGhBVkZnMmVIODkxZkRaMktTb3kyTmQwTkVFd3VKdjJudS9BYTNyazdiWE1oajBqbEMvMDNna3B6NEVBaFQ5OU1RV05CMFdwQ1dscGUzaVcifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMSXVmd3VoM1RIZ3l3Zlc0OS9PR08rMS9FaG9ielJBdzJiVy8zcmFIUVBJTVBpWGhRQm4vc2xNMDkrQm4xbmg3RVZsaVBUaW4vd2JvNWFKdGdUMWtYNHI2Q1orSkx5cHdKTm56Vjc4UVBsYW1xZzJQQlBoOW1FL1lad21NNGVZQStpVUR5WGQ4bThwem14dzhQK1ZJTENFbTlCb1pMZ2JHU3pxTEZvQXg4d3cvMVNTZ3ZKIn0="
    },
    {
      "id": "1548040517420449792",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMQWpZN2RTWkRqTVFQNFZwcWFybXNQNFZtN2ZqVncwSmVBK2krS1RkU3NnaGR5bGhBVkZnMmVIODkxZkRaMktTb3kyTmQwTkVFd3VKdjJudS9BYTNyazdiWE1oajBqbEMvMDNna3B6NEVBaFQ5OU1RV05CMFdwQ1dscGUzaVcifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKMGFkRGowZ3ByWXArcVErelEzY3JNcGVQa1hPOGtKZTBKZ2YxaktabUorRjFUU1N1OEpheC9rUFRQOEdLVHlrdU9KN01MSXl1Y3dZZlQzTlI1S1FLM2t1UlFIY2pNN0s1akREb1ZJR0RDeG5TekZyVG9taXUwOU9DTlFBajM0dEdSOWlCeU1xSGdacytGL3FIaktCcGgvbW9zc2dMbEV6b1VVVE54VEFLbUV6SmFySXNQIn0="
    },
    {
      "id": "1553154139435835392",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMQWpZN2RTWkRqTVFQNFZwcWFybXNQNFZtN2ZqVncwSmVBK2krS1RkU3NnaGR5bGhBVkZnMmVIODkxZkRaMktTb3kyTmQwTkVFd3VKdjJudS9BYTNyazdiWE1oajBqbEMvMDNna3B6NEVBaFQ5OU1RV05CMFdwQ1dscGUzaVcifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMclZRY2h2cDVoUStlcFQzKzVoWkN6MFJWSmwzaWlMaU9COEh2bWExeDJSYm93OFdTTWZYQVdlU2l0VUJQSXcwK2dtS1VSTXlIMllTRmYrUldZdnR5OVc5QlFyWXlOc1FNeDBQNkZGOXhNRTFscnF0eWFYSGtPVk5xVFlvblZxUzJvQXN1cENnaUZSQ3plUHdJL1hQdEtCd3F5N3dvOVZETVRDd0tWd0w4Yys4QnVWdzNlIn0="
    },
    {
      "id": "1558112706446368769",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMQWpZN2RTWkRqTVFQNFZwcWFybXNQNFZtN2ZqVncwSmVBK2krS1RkU3NnaGR5bGhBVkZnMmVIODkxZkRaMktTb3kyTmQwTkVFd3VKdjJudS9BYTNyazdiWE1oajBqbEMvMDNna3B6NEVBaFQ5OU1RV05CMFdwQ1dscGUzaVcifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMU0VpUjF6K1ZTTVl2OStPcGFFYTNtNmlQb3E3U1NtMk1OQXVYNWNRZ2VOWFNQamJ2TzQram4rMnk1ZTNKOUZ1ZUwwbXY2VDV2Vzk4VGVZUU5oM2d3Y1lqenNySEROSG5ibi9JT0ViUE81bmhOdlJYLy9BVkJnbnlPQVVNVzZyQUh1U0FOdGlJL0JxeWFJVC9MZHVEU3BwcWtuRzdDckZsUEVWZHVKZjR4MXp5TzhkeUZKIn0="
    },
    "… 73 more"
  ],
  "excluded_quests": [
    {
      "id": "1549087389715013632"
    },
    {
      "id": "1558176501663272961"
    },
    {
      "id": "1553392150924890112"
    },
    {
      "id": "1541371710417272834"
    },
    {
      "id": "1541369647985594369"
    },
    {
      "id": "1552026570229813258"
    },
    "… 74 more"
  ],
  "quest_enrollment_blocked_until": null,
  "quest_access_suspended_until": null
}
```

<!-- facts:end -->

## What it does

Lists the account's Quests and how far along each is.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
