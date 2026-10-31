# discordApiQuestsMe

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/@me` |
| Sends | — |
| Reads | `message`, `code`, `quests`, `excluded_quests`, `quest_enrollment_blocked_until`, `quest_access_suspended_until` |
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_f63ec3ce30f1dcdf44a1080bce85b4030f3ff4162c49ca4d7939192758652a79` |

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 651 ms | 4963 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 608 ms | 6502 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 583 ms | 3040 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 728 ms | 2403 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 553 ms | 11373 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 344 ms | 9529 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 705 ms | 48663 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me: 401, 344 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "401: Unauthorized",
  "code": 0
}
```

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 705 ms

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
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMS2ErSHVhZmowNTRWZXJJRmQ3V01tZWVzMDNlZE1pL01XRHU5OFk2Yyt5MWNWZnJtZUl4THhCQVFENGU1aSs0aXEvRlhmczQyZ1YxYlZWSTVWU2tKTHZDWkQxejAwMzNnYjJGSUN3R21pY04rdEl2Tm55ZmkySzV3ZlNZM0NibGNqS1Z4aDVubWprYVlKVTRzcUlOQ1dNZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMVE1KUG1Dc3hDR1ZJU1pqWVlNWmQ1NlZKck5KKzdYTFlQMVl1NmRMWE5jcFlZRmE0N2VZUzdkZWhJdlFMNEVMTXhOd3hNY0pRRmlRancxN1RNOFdaNTlYZENxNU01RlltSXVJSkFpWGVHak1WTm1hamdDemVQYmNUVHRkMVJmRzIycVZnaE0yNVo2YjJjOGZhQzROTVFaS1hlMzNibUN0WmR3R0RvOVFoSHNkTEl6bmdqIn0="
    },
    {
      "id": "1547647018090893312",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMS2ErSHVhZmowNTRWZXJJRmQ3V01tZWVzMDNlZE1pL01XRHU5OFk2Yyt5MWNWZnJtZUl4THhCQVFENGU1aSs0aXEvRlhmczQyZ1YxYlZWSTVWU2tKTHZDWkQxejAwMzNnYjJGSUN3R21pY04rdEl2Tm55ZmkySzV3ZlNZM0NibGNqS1Z4aDVubWprYVlKVTRzcUlOQ1dNZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLS2REUkdCMjRxNkx3RnNwM3RUS2dnZ0ZRUzV0c3gyK1BxblBnZWNBWExoSFV4YVdVSDB1YkV5dWNndkY1eTRhNzJMMElRSUlxMG90czFZL2xPb2VzMkZKWUN3RnlHcy9TejN1SlBvcnhGQkM5S25ydlIyQ0FQQzQ4SE9lTkV4ZUlpU0U4ODMzWGR0QmZxc0xoTVdSSU0zTm1LbXNVd1NEdjVoblJtckZkWHA5dldweE1iIn0="
    },
    {
      "id": "1550081499628441600",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMS2ErSHVhZmowNTRWZXJJRmQ3V01tZWVzMDNlZE1pL01XRHU5OFk2Yyt5MWNWZnJtZUl4THhCQVFENGU1aSs0aXEvRlhmczQyZ1YxYlZWSTVWU2tKTHZDWkQxejAwMzNnYjJGSUN3R21pY04rdEl2Tm55ZmkySzV3ZlNZM0NibGNqS1Z4aDVubWprYVlKVTRzcUlOQ1dNZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMVEQwQ3BnZ2VUTzNZQzVtRVB5elhpaWtxQUEyc2owYnRwZFBYZ1F5Rk5yREFNc0U4T3REWSs2NHQrOUlvcUx2LzdkMk9EUklXYUZ3UzRIMXVobDhHbWlDOW9yTzJNVUhFVVErRWVIdnNRSGxwU2ZvK2dwc0JlMzNqb2djMTkvTWxKVnhRSGUxUjRJYWFGNG01NEZMVktoRHhwNU9ZbUxqeG9oR2EzeUhrS2wvSnVZUVF1In0="
    },
    {
      "id": "1553154139435835392",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMS2ErSHVhZmowNTRWZXJJRmQ3V01tZWVzMDNlZE1pL01XRHU5OFk2Yyt5MWNWZnJtZUl4THhCQVFENGU1aSs0aXEvRlhmczQyZ1YxYlZWSTVWU2tKTHZDWkQxejAwMzNnYjJGSUN3R21pY04rdEl2Tm55ZmkySzV3ZlNZM0NibGNqS1Z4aDVubWprYVlKVTRzcUlOQ1dNZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKd3QvQnd5UnpRZWIvQkZnV3FNMTUrOUFZMXFRampMc2R2azRucU1qaEVRb1NmMDJnbjFSSitpR3lIWlpWaHBmZFNydXhNczc4ZTcxZTV3WkxZK05kRk52SG81MEJyWFc3VExTUGdSNmU3SnVnUGR4aHBLcFRMc2ZPZEh1elBXQnorMEFEazdTR2ZlcFR3bklmYk1CSjlMdHlNbVh6RVRrSXoraG5ib3pYVUgxYzM3bFoxIn0="
    },
    {
      "id": "1558112706446368769",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMS2ErSHVhZmowNTRWZXJJRmQ3V01tZWVzMDNlZE1pL01XRHU5OFk2Yyt5MWNWZnJtZUl4THhCQVFENGU1aSs0aXEvRlhmczQyZ1YxYlZWSTVWU2tKTHZDWkQxejAwMzNnYjJGSUN3R21pY04rdEl2Tm55ZmkySzV3ZlNZM0NibGNqS1Z4aDVubWprYVlKVTRzcUlOQ1dNZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMZUxsN3l0cFpIaGhtVG9kb3NjSldtZnNaWWhsM2FJMld3bm9oNlEyR3RhTUpoV3NkK2d5RU1ldHR2dDVCU09ldlBVUGN1dUJ5clpxUHRQQ1BXNWhjeUsrQ2JpYWEwOEhSOUFkUU9YQ1BmMXRkTnFrTzNha2M4ZDFneGIrVkl1VENIWDBDaUdXOFhyUitDc3lLL2tSYmcwTVVjbkFhaFJobnhzZFVoS2NEcTU2VEUyOEZTIn0="
    },
    {
      "id": "1555158122522349568",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_raw": "EAIYAQ==",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMS2ErSHVhZmowNTRWZXJJRmQ3V01tZWVzMDNlZE1pL01XRHU5OFk2Yyt5MWNWZnJtZUl4THhCQVFENGU1aSs0aXEvRlhmczQyZ1YxYlZWSTVWU2tKTHZDWkQxejAwMzNnYjJGSUN3R21pY04rdEl2Tm55ZmkySzV3ZlNZM0NibGNqS1Z4aDVubWprYVlKVTRzcUlOQ1dNZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJalViTHRFdkYrVUw4ZE1sMm8vUjdzamJxSWhUVnZQMDZoYnZOeE8vaS9EVXZudW53Z3FRVHdKRmI5dkZxeDlmcUdSUEtTaFNnc3BCOVplcmxoZFFXY3NMN3VLK05wMlM0MHdicGhPY2MxNTBoWFJWQ1NoWE1kdjE1WENSZmt1V0FPRHFyWnFsbzhyRm56MTZhZWYyUTFML0l5SW94L2hVMS94QlY4NStrUlN0WnNTNmdiIn0="
    },
    "… 69 more"
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
      "id": "1565032458741612545"
    },
    {
      "id": "1541369647985594369"
    },
    "… 75 more"
  ],
  "quest_enrollment_blocked_until": null,
  "quest_access_suspended_until": null
}
```

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

<!-- facts:end -->

## What it does

Lists the account's Quests and how far along each is.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
