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
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_fd3be36b954618245fd3182d8d0eefa76c66e317f5f14dcd4394ffab30b6dbce` |

Seen 8 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 651 ms | 4963 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 608 ms | 6502 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 583 ms | 3040 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 728 ms | 2403 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 553–656 ms | 11373–39318 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 344 ms | 9529 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 705 ms | 48663 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 200, 656 ms

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
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLNlUyZkdIbXBnYmNQZEdWN0NOOVlLL1l4MHBHYWhsSmRxRG1DT3VJUlluZGl1b0NkM2lxc1lOWWkwUWxNTlJqMkJnWWpBKzh0aEcyNmJqbmNld2k4aytBZ3pHYkRjUUExeU9pNkdRd2wzNWZVcHhJaHE5NjRzWHQ1K1Q0aGVOVGllREh6N2R6SjNRWHNMS1ZuZkpaQTFBdz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJaVBhODl3d1V3Nmx1SkcvVitIOVlHYkE3eHRwS256QjMyVGJWZTBSQzg5c1FZQ3p1MDlUa3VuMk1tYkhsWFFNeGhxRHREeHVaNTE4Z0tLM3JHY1AwZnZWajN6SU1Xb3A1WGtFUjZEa0I4eVk3M0ZJWkZuZ2REVDRJMVZST3hvK2pIREtxQ2VmcmdKN09KTWU4U3RlQXIyTzhUcUo4MXJGNFQrV1lVaUlobUtZRTNvbGtkIn0="
    },
    {
      "id": "<id:2>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLNlUyZkdIbXBnYmNQZEdWN0NOOVlLL1l4MHBHYWhsSmRxRG1DT3VJUlluZGl1b0NkM2lxc1lOWWkwUWxNTlJqMkJnWWpBKzh0aEcyNmJqbmNld2k4aytBZ3pHYkRjUUExeU9pNkdRd2wzNWZVcHhJaHE5NjRzWHQ1K1Q0aGVOVGllREh6N2R6SjNRWHNMS1ZuZkpaQTFBdz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLVUVBb0VIQkE0MzJ4aHl3NVJwWEVRQUtGUUJnM0l6T3RuTGp2MCswcld3SElDNHVBbWxtY2JHYUVtNmlHU0RQaWdtMEV2TTJwU045UUJBNERIbW9Qbk5ybXRGMlMyWnJ3RXhwZXRaajdyWkNRRVZiOHRjMms4dTVRVEtMYUNxUVdrRUJFd0xUN29Bd2ZDVnJMNDlkZTFQSnRCa1VkWVJqSWVWcmZEK1lLTlNTNGNnd29TIn0="
    },
    {
      "id": "<id:3>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLNlUyZkdIbXBnYmNQZEdWN0NOOVlLL1l4MHBHYWhsSmRxRG1DT3VJUlluZGl1b0NkM2lxc1lOWWkwUWxNTlJqMkJnWWpBKzh0aEcyNmJqbmNld2k4aytBZ3pHYkRjUUExeU9pNkdRd2wzNWZVcHhJaHE5NjRzWHQ1K1Q0aGVOVGllREh6N2R6SjNRWHNMS1ZuZkpaQTFBdz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKeEJMbUdRWm5UWDdNRlZzK2xSYTFJWVQyUWZYdXhncjVqZzJPUG1qRkVUWHo0TVA4SFZhK2NmaTBhTFNuWW9aNnU5WDBXakhySHZaSXhPeGY4SzYwM2hReW1KVnU4TnR4S2RManVodWkxdVhOOXpKSTVHVDl5SFEzbW1FQXlJZkZzNlNldnJtSlhGNDl6QnFjRWgxZzB1NExleWdwMGtnVWhTYVJqd21ZMmpuQ1N1alZqIn0="
    },
    {
      "id": "<id:4>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLNlUyZkdIbXBnYmNQZEdWN0NOOVlLL1l4MHBHYWhsSmRxRG1DT3VJUlluZGl1b0NkM2lxc1lOWWkwUWxNTlJqMkJnWWpBKzh0aEcyNmJqbmNld2k4aytBZ3pHYkRjUUExeU9pNkdRd2wzNWZVcHhJaHE5NjRzWHQ1K1Q0aGVOVGllREh6N2R6SjNRWHNMS1ZuZkpaQTFBdz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKUEZlUVI1MVJqOTdZaVlPdStROTRUMlpmNzlMWDV6T1hHdDYwK3JUb056bjFmeForMVRSTEdjR0ZnRlBmRy9CbWRQM3hZY1FkQ3Yxd3ZtMk1talJFRDE3QTRzczlaY0pGTGk1YUYyMDZ5ZDcyOC9TZHZXdTQvZ0pRUFVFbjFueXZ2Z0dFdnRXQlcxUDVFRkMxOUl3aXpMRFRhT2Fua0wrdC9SbTZ6Uk04TjhGeWdMZlZYIn0="
    },
    {
      "id": "<id:5>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLNlUyZkdIbXBnYmNQZEdWN0NOOVlLL1l4MHBHYWhsSmRxRG1DT3VJUlluZGl1b0NkM2lxc1lOWWkwUWxNTlJqMkJnWWpBKzh0aEcyNmJqbmNld2k4aytBZ3pHYkRjUUExeU9pNkdRd2wzNWZVcHhJaHE5NjRzWHQ1K1Q0aGVOVGllREh6N2R6SjNRWHNMS1ZuZkpaQTFBdz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMc2p3RkFlQnV2alhtMWlSbnJqRmZ6TjU5U0ExODd4RkVGTXZ5bnE1dzB5Y3hrNnZNdVRBclhTblRmb0FTVEd2ZmRmTE82azh4YzVOT3l3TEpMaGNxbE9wdU5xcFhuWU1jRCtnODFsZDY4M1IvREJCWFFsd2JCb1Y2SjB2bFVYTC9xdGhPaHJTcTRZaXlROTBIS2JaU1VZMEVSUStNZTA4cUtrWHJReVdYZnFFL2VzMnJDIn0="
    },
    {
      "id": "<id:6>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLNlUyZkdIbXBnYmNQZEdWN0NOOVlLL1l4MHBHYWhsSmRxRG1DT3VJUlluZGl1b0NkM2lxc1lOWWkwUWxNTlJqMkJnWWpBKzh0aEcyNmJqbmNld2k4aytBZ3pHYkRjUUExeU9pNkdRd2wzNWZVcHhJaHE5NjRzWHQ1K1Q0aGVOVGllREh6N2R6SjNRWHNMS1ZuZkpaQTFBdz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMWmFRM3NKWCtDLzV3ZVFZOVhBaFo2NGt2TURtRE9DenFwbklxSVlxZXEwSnlrRWZOL2t4aWw2ZC9QYkxpbmpPSXFHQ01jZ0w4UGtScWpFU3M5WnZTK3k4bU5tbE9KOG40UFoxYXpqaVd0TUs4TVlQRlBvZUdKRzVzcnMxRFFZb09heHNwbi8wQnhpazRRaWliVUUxRGEzWVFlRWtKaFRLVEkvNXVSMXZDTk1aYU12Vi9UIn0="
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
