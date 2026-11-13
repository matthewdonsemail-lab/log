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
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 9 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 651 ms | 4963 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 608 ms | 6502 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 583 ms | 3040 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 728 ms | 2403 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 501–656 ms | 11373–1045694 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 344 ms | 9529 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 705 ms | 48663 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 501 ms

Sent:

```json
null
```

Answered:

```json
{
  "quests": [
    {
      "id": "<id:1>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJbGtJVzBUdXR6dWN0M3UrZHpCVjZYY3FWSzVjNVVYbTYyRjlIazlNNFdLeHRFRWVKNjBNYzZ6MGZjTzh0OHc5ZGNmMmxNdzNyQTVyRGprVmdQZEZXVzgydDNaZHRaNHZaMzFmTlIrUTR2ZG5wOThsVHkzQkUwalMvVENGVm15cXlzeUR5Yit2ZWdKVVZZT2V2NGlBZ3RHQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKOVM0TTduM05TMDZhR2JhYXlMOUFpWTY2OTZNRjNFVTlBRk8zZlU2YlRMYXVyeTVZTzdScjZIOVllYm55YXVPcVlQOXBZVEZIRzFxeTRmMFRJQmVUWFhCMTlCNHljSnM1SVZKeVBlbnBWK0QwMnJFeUpSeEV5M1B0bjZHRHhoY29Yc2NUcU01MDBrUlR5d2JmRWluZjUvcXJlbVJmd0Qwa3VWbHhQRjJOQjd0dzlWRWtFIn0="
    },
    {
      "id": "<id:2>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJbGtJVzBUdXR6dWN0M3UrZHpCVjZYY3FWSzVjNVVYbTYyRjlIazlNNFdLeHRFRWVKNjBNYzZ6MGZjTzh0OHc5ZGNmMmxNdzNyQTVyRGprVmdQZEZXVzgydDNaZHRaNHZaMzFmTlIrUTR2ZG5wOThsVHkzQkUwalMvVENGVm15cXlzeUR5Yit2ZWdKVVZZT2V2NGlBZ3RHQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKbktBNkRwd1ZlaDZPb1ErT29qRVd5RVFDbmpuQXBTOVpscWZKYXJwSTFHOVlibHVoeTF5cUJyR3JrazNTcWJMU01JSG1OWE9ERmRya0c4aHpobEZLaUcvV1U0L1VyUlltanRVZ2N1R3p0QzV5b01nRWJJd2ZHOWpaUVVrUjFMVG0xY2hrK1JLY3pkd0VPM215V3djc0txYTJGTytkaS9JUWsvQ0JIdjhrRjZuL3cyelVQIn0="
    },
    {
      "id": "<id:3>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJbGtJVzBUdXR6dWN0M3UrZHpCVjZYY3FWSzVjNVVYbTYyRjlIazlNNFdLeHRFRWVKNjBNYzZ6MGZjTzh0OHc5ZGNmMmxNdzNyQTVyRGprVmdQZEZXVzgydDNaZHRaNHZaMzFmTlIrUTR2ZG5wOThsVHkzQkUwalMvVENGVm15cXlzeUR5Yit2ZWdKVVZZT2V2NGlBZ3RHQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLSWJOUjRBOXduUGE3QUpLaWxXYzhzVHA3NGpqOGpwTDRZN3AvdGxPMm9BK2RrTC9OY2R1TzZvdnFmWWRPQVNMcCt2T21TMlhUaDIxT0drb1NlRStsNm9BZFljcnZTVmpxK05ZM1djTWJDcGVWMzFwUytPTEd2bEJVZVFPT3dXVU1GMEN5ZHZxemZTaUpuL0RFNEFaUnhaODBwUzZjT0dQSHk4UlhFSy9tdDhEdjFtRHVNIn0="
    },
    {
      "id": "<id:4>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJbGtJVzBUdXR6dWN0M3UrZHpCVjZYY3FWSzVjNVVYbTYyRjlIazlNNFdLeHRFRWVKNjBNYzZ6MGZjTzh0OHc5ZGNmMmxNdzNyQTVyRGprVmdQZEZXVzgydDNaZHRaNHZaMzFmTlIrUTR2ZG5wOThsVHkzQkUwalMvVENGVm15cXlzeUR5Yit2ZWdKVVZZT2V2NGlBZ3RHQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKYlNJaHpPUWM1QnlQciswcjdwaHNVVk5lMTlVaWkzckVYUTd1VTZBZlpCRWZVRm5SVHlxQVFRdkxqaWtWRTcySXU0UDhBbXlvdnMvaUdzUXFlS1piNzZBMkFyK3hUTG8yL1hCNHRhM0s4Rk5veXRHMCtiaU53SmlWcWdGY3kvaktaK0ZxbHdlYkJTVVJCOTN2TkNVUW1xbzVrUWpndFJ6cFJxRkthTGVRc0lucVhpYkhBIn0="
    },
    {
      "id": "<id:5>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJbGtJVzBUdXR6dWN0M3UrZHpCVjZYY3FWSzVjNVVYbTYyRjlIazlNNFdLeHRFRWVKNjBNYzZ6MGZjTzh0OHc5ZGNmMmxNdzNyQTVyRGprVmdQZEZXVzgydDNaZHRaNHZaMzFmTlIrUTR2ZG5wOThsVHkzQkUwalMvVENGVm15cXlzeUR5Yit2ZWdKVVZZT2V2NGlBZ3RHQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKbEJkZDZyYlR1TVZHMWxrR3dJMDJnZElPU1pwZk5FazdwYnN3TW9RTmp6R1BoQ1VKS3NTUDJvb1ZGc0VOaDc2blM0cG1jblFGd3E3QmJzbkxGK0pibjk1aVM5RG5kdW0vTUxZbG1WL3lCWmljeG1iUnA5QjVSeVFudGZHWmNIYjV3VEt1aTF0TW4vWXBPQW9wR2FEQ0o4SGc0UmMzSUxXcytNelY1RTd1ZU1qbGl1WXpNIn0="
    },
    {
      "id": "<id:6>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJbGtJVzBUdXR6dWN0M3UrZHpCVjZYY3FWSzVjNVVYbTYyRjlIazlNNFdLeHRFRWVKNjBNYzZ6MGZjTzh0OHc5ZGNmMmxNdzNyQTVyRGprVmdQZEZXVzgydDNaZHRaNHZaMzFmTlIrUTR2ZG5wOThsVHkzQkUwalMvVENGVm15cXlzeUR5Yit2ZWdKVVZZT2V2NGlBZ3RHQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKWk9qam53L2VCSDlFQ0dRcHhtdVo2VmNCaHdmU2RBZ1diSS9tWlVBUkVWVGdxWk1ScHpmbG1NczFuNW54M1BHMThjaWViQnNhUUhEa1VZQ1dBQ0w1ZWVJeWlFYk82K0UxWGlQd3ZFYTRIWFVsbVFTbXVNbDlKTitOdEo3UjYwaTF4dFdoaWU0ZVJTM3VvajgwaHBXNVI0L1d1eTBGTWFRbjJlSmFKWm1nbWZ5TG14cS82In0="
    },
    "… 56 more"
  ],
  "excluded_quests": [
    {
      "id": "<id:7>"
    },
    {
      "id": "<id:8>"
    },
    {
      "id": "<id:9>"
    },
    {
      "id": "<id:10>"
    },
    {
      "id": "<id:11>"
    },
    {
      "id": "<id:12>"
    },
    "… 100 more"
  ],
  "quest_enrollment_blocked_until": null,
  "quest_access_suspended_until": null
}
```

**runs/inspect/20261030T222341_<name:1>**, step 1: goto /channels/@me: 401, 344 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 0
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 705 ms

Sent:

```json
null
```

Answered:

```json
{
  "quests": [
    {
      "id": "<id:13>",
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
      "id": "<id:1>",
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
      "id": "<id:14>",
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
      "id": "<id:2>",
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
      "id": "<id:5>",
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
      "id": "<id:3>",
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
      "id": "<id:7>"
    },
    {
      "id": "<id:8>"
    },
    {
      "id": "<id:15>"
    },
    {
      "id": "<id:16>"
    },
    {
      "id": "<id:9>"
    },
    {
      "id": "<id:17>"
    },
    "… 75 more"
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
