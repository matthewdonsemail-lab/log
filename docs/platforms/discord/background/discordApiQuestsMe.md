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
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 651 ms | 4963 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 608 ms | 6502 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 583 ms | 3040 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 728 ms | 2403 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 553 ms | 11373 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 553 ms

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
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJcVhhOUN2VkFxSkg3akJMTjFmcGIyblZHbGNKRkJaaDAzTVRJZVVDcjFDeU1JY1hxdkpBVlZOdDIrdnYrZ1J6NENXTTJnZGVWVXFNaGVrTUJGaW4ycStMcmtCNjJ1ZlJKK0poMk90azhQU2lUWmxGQ3ljbldSUDZWOFNqd24ifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKYXQyaGRJZXdrbDZOeEZwd1BjV3V2MzAvSjFncEFpdzRaTTE4VHp4UnYra3plbkJVaGtBeUYvMTJCeXpHR2NtVGVrQldYM3hGeWNUUnV1OWtqeEZBMFVjKzI5WXhlK0x4MFd6ZDM3Nzg2UGs0MlNKTS9VY0l0czVBOHZsVjVkbEhoZG1jNmN0ZUNSNi9MdjY2STJINE5pVFZzck1BblExRGZYbnNLdXI5MDFYNit6WGp1In0="
    },
    {
      "id": "1547647018090893312",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJcVhhOUN2VkFxSkg3akJMTjFmcGIyblZHbGNKRkJaaDAzTVRJZVVDcjFDeU1JY1hxdkpBVlZOdDIrdnYrZ1J6NENXTTJnZGVWVXFNaGVrTUJGaW4ycStMcmtCNjJ1ZlJKK0poMk90azhQU2lUWmxGQ3ljbldSUDZWOFNqd24ifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMZEsyMTd0N3VXVzRFbHp5NDFNRG9IOEFHbzVpajNSL0szekdzb21HMWRqa2t0Q1hpY0pHTndjTUE5aDE4TWdmNW9Yb3BiUFMyT25xMm1CZU1IMHgrQU90bnY0dDRyeHk5MFR0b3dRdmhvWTFIa3ozWTVXaFU4TWJ2WnhtL3RXZkQ0Vnc2NytlWkhlZXVXYUtveDV0UUpWbkRUb09Kd0VueDkwT3RQQ2N5ZmY2V2hsREtYIn0="
    },
    {
      "id": "1550081499628441600",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJcVhhOUN2VkFxSkg3akJMTjFmcGIyblZHbGNKRkJaaDAzTVRJZVVDcjFDeU1JY1hxdkpBVlZOdDIrdnYrZ1J6NENXTTJnZGVWVXFNaGVrTUJGaW4ycStMcmtCNjJ1ZlJKK0poMk90azhQU2lUWmxGQ3ljbldSUDZWOFNqd24ifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMdlBieERYQ0pRYThnTkh1TkVGNEptSzBzQXZpNGhxM01RS1VjaHBNaHhPazdFOG1YNTFMQndTNFlvYWc0cE1VejlTQkROcndUeXZlZmFYeU1wTjd0SW5IQS8xMzI5YWVtemprdFVPcHJZSGRuSjJhWUxGTlQwTWZxVG41L3U3SSs5azViNXl5Nno5dHVNWE14RGpJR0xWK2VCeGlyMTcxaHBqdVduTXRLL1hzSms1UGtuIn0="
    },
    {
      "id": "1548040517420449792",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJcVhhOUN2VkFxSkg3akJMTjFmcGIyblZHbGNKRkJaaDAzTVRJZVVDcjFDeU1JY1hxdkpBVlZOdDIrdnYrZ1J6NENXTTJnZGVWVXFNaGVrTUJGaW4ycStMcmtCNjJ1ZlJKK0poMk90azhQU2lUWmxGQ3ljbldSUDZWOFNqd24ifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKMzV2V2thWHVTQmw4ekhJeUhLSk5ZdzdTdnhWaEpua2F6L1JHSS91N2FqWnNsMVUxZ096TUVlaXNXR25UWkYyZ05mSlR6dFFLSzFMWDIwdFRicnZUNkxmQkhiU2pZeHZtWVowa3pacXYwcUhtK21ralZzcnpTdzFYMnVKTmYxbzk5SDhZUGFDN3RWRGlCdHVqNWREZ3BJY3pzR29zNTB3RGNTakxhV3ZiRkNPRDFELzErIn0="
    },
    {
      "id": "1553154139435835392",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJcVhhOUN2VkFxSkg3akJMTjFmcGIyblZHbGNKRkJaaDAzTVRJZVVDcjFDeU1JY1hxdkpBVlZOdDIrdnYrZ1J6NENXTTJnZGVWVXFNaGVrTUJGaW4ycStMcmtCNjJ1ZlJKK0poMk90azhQU2lUWmxGQ3ljbldSUDZWOFNqd24ifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKOWpUV2FMZmhkdWxXZ3FSRC9oUk9jZkdFTVB0Yjk1RDRGam9TQS85cStKTUdTNWxJSUJHdG85OTNRRXpHZXF6czFhZkNjanE4Q1AycGlrbWVSZUt3Szd2L3B0b1VwMERyQTZvRDlDK01tY1pNL0dtN2VHMEZtVU5OZ0Y1TDVmQklaNXZsS3FEenhGWlFLQ1BjZC84a1FEcmZqVFlvN05ia0E5QjlIT0JMeUxtNTB0SmlBIn0="
    },
    {
      "id": "1558112706446368769",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJcVhhOUN2VkFxSkg3akJMTjFmcGIyblZHbGNKRkJaaDAzTVRJZVVDcjFDeU1JY1hxdkpBVlZOdDIrdnYrZ1J6NENXTTJnZGVWVXFNaGVrTUJGaW4ycStMcmtCNjJ1ZlJKK0poMk90azhQU2lUWmxGQ3ljbldSUDZWOFNqd24ifQ==",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJdS9ubjhpVGF1cDlKVHpqUFUvaldXK01UZmJqZSsvTU9mTFZlY0N1bkxXMmQwL3JhOEpHTVBtd0NPUWRyMEtJQi9DQ0k0MGJpSUdtcThYMzh6Y2I1TXhGdlZUNVZWczV4dVpnaEduN092VHYrQWM4UjBTbHZpRVRZaEw3a1RwT3hCekpMbHk4QlB3RUNRZllJcUtDL0dHMDR1WHVMc1JEQWpmU3RoS1pzTGRETXlJWElhIn0="
    },
    "… 72 more"
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
    "… 73 more"
  ],
  "quest_enrollment_blocked_until": null,
  "quest_access_suspended_until": null
}
```

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

<!-- facts:end -->

## What it does

Lists the account's Quests and how far along each is.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
