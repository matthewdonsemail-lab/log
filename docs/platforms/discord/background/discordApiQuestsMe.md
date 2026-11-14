# discordApiQuestsMe

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/@me` |
| Sends | — |
| Reads | `quests`, `excluded_quests`, `quest_enrollment_blocked_until`, `quest_access_suspended_until`, `message`, `code` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 17 time(s) in 14 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 651 ms | 4963 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 608 ms | 6502 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 583 ms | 3040 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 728 ms | 2403 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 271–656 ms | 11373–1045694 ms | — |
| inspect | step 1: goto /channels/@me | 3 | 401, 200 | 174–365 ms | 1198–9529 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 705 ms | 48663 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 412 ms | 22339 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 303 ms | 13138 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 303 ms

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
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKUjRONnlEVFh3MU4xb0dKaUdodG1uWU1LNkpsWHZEeXk4MTVYNWNDVVU1bktaVzhQbTF1TlgzMUVmQzFqcEdqbGtpTDgxZFd3aVNtWHRhRXpCWkM5R0pKVThIZnpsMCtBYTNLdmZlNkRHd2gva0tEcWtXRU5WQmFmUFN5VW9Ha213NnVaQ2xMZXl6TFlWUjI3QlFtUFlqZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKV0pqYTVoV210OSsrR29YSDdjVUJRWHUvcXo3bUVvNEM4aWRSQkFnTmYxbDEzYjBaT1NhVS9BKy9MWWRHU3pmVjBFVXJrTFUxVElIcU5NVUxBbGxLOU5LL2QwUGNuRDAvaXNaakRZSjlBVDFubkhtVmVUK1AvNElmK0phZ2hYYmlLOXhmZGJmbTBvbTBhaVVOUExjQ2tsOEFLQk1ncUdTaDllOGFpYWZmY0dSTHpveXliIn0="
    },
    {
      "id": "<id:2>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKUjRONnlEVFh3MU4xb0dKaUdodG1uWU1LNkpsWHZEeXk4MTVYNWNDVVU1bktaVzhQbTF1TlgzMUVmQzFqcEdqbGtpTDgxZFd3aVNtWHRhRXpCWkM5R0pKVThIZnpsMCtBYTNLdmZlNkRHd2gva0tEcWtXRU5WQmFmUFN5VW9Ha213NnVaQ2xMZXl6TFlWUjI3QlFtUFlqZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKYjdZT3VpREtjcTZpTTFydDc2RzZKbndmNDdHMXBYaWtXMkJIbk5UNWF5Tzk2K0xZbDNYSXVNTC9QN0lWT3RtQ29sWFE4T1BvVmc1bWN6SFIrVXM4alArT1dSUWNSeFJ6a09ER1kveTc0RjhkSkQvMDVNMG04VUZVZVhIdmtlTS9vVUFYYk5CdzZyTmRLRVNuSEUwa1ZYTHltSEtSdFZpT2NuRU52WDEzOWNWaUwvUzBjIn0="
    },
    {
      "id": "<id:3>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKUjRONnlEVFh3MU4xb0dKaUdodG1uWU1LNkpsWHZEeXk4MTVYNWNDVVU1bktaVzhQbTF1TlgzMUVmQzFqcEdqbGtpTDgxZFd3aVNtWHRhRXpCWkM5R0pKVThIZnpsMCtBYTNLdmZlNkRHd2gva0tEcWtXRU5WQmFmUFN5VW9Ha213NnVaQ2xMZXl6TFlWUjI3QlFtUFlqZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLOXljc3luaWtibW4xSEV2N3JVSGREVHZNbTVBL0o0T1dOdmhOcTRuMi9VNVA1ZTZmLzlrcXlCS0x0VUlYUWozdmJ4R2pZdkNCYmpyRS9IVld3cFRJbjlSc2lmNGZBZ0ZiajBpVTYvT09XbnRGMml0dFovdUpVaVB2bUFEdHdhUmJVaDZ2bjVEL0lBYXNGL3VEMmk0aVlPZVRWazJKYzVob3ZkTVZYaEovRmR0bk5WZnRPIn0="
    },
    {
      "id": "<id:4>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKUjRONnlEVFh3MU4xb0dKaUdodG1uWU1LNkpsWHZEeXk4MTVYNWNDVVU1bktaVzhQbTF1TlgzMUVmQzFqcEdqbGtpTDgxZFd3aVNtWHRhRXpCWkM5R0pKVThIZnpsMCtBYTNLdmZlNkRHd2gva0tEcWtXRU5WQmFmUFN5VW9Ha213NnVaQ2xMZXl6TFlWUjI3QlFtUFlqZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMdHBIQ3BHcUtVcFpKYm5JL2hhZzZRazlXdllYbTg5dFl6WVlIT3l6RzY4S2psWi8raDBJUWxqUUVYWXpUeFRBbGJHYnpkckZsU1VGajNxRFhXTFhvNGJjTTJ5VXpia01ZZHVyczNEdmNlMGMrbjdCekJTT0xGR2FONFhCREg3dnVQS0w4OThwbEZnWk9ML2hVcVd0RDAwOVk1dkdqZWd5WHRJRG1SZWFMV25TVWZOdWY4In0="
    },
    {
      "id": "<id:5>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKUjRONnlEVFh3MU4xb0dKaUdodG1uWU1LNkpsWHZEeXk4MTVYNWNDVVU1bktaVzhQbTF1TlgzMUVmQzFqcEdqbGtpTDgxZFd3aVNtWHRhRXpCWkM5R0pKVThIZnpsMCtBYTNLdmZlNkRHd2gva0tEcWtXRU5WQmFmUFN5VW9Ha213NnVaQ2xMZXl6TFlWUjI3QlFtUFlqZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKMTZ4dEJzUjJaWkJIUVJ6R1BlQit0OGRORzMwSW05WnBPU0R6RVVwc3RJN2ZHazcvT0grRFBhNFhBYTB4My9zMXkrcjR2N253dXF0dEdvZmdiZUhtd2hkNkZlRU9iV1dUN0ZrWFNHNkJDb1Rjek1JNWxhSnBDOU1Cclc1VnVBY1NwcUpPa1h6WkprRC9YUEY5a3Ftd1BHL1d0dlJmQW1Bd1lqRlcyYVcxbytieVZ2RjhXIn0="
    },
    {
      "id": "<id:6>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKUjRONnlEVFh3MU4xb0dKaUdodG1uWU1LNkpsWHZEeXk4MTVYNWNDVVU1bktaVzhQbTF1TlgzMUVmQzFqcEdqbGtpTDgxZFd3aVNtWHRhRXpCWkM5R0pKVThIZnpsMCtBYTNLdmZlNkRHd2gva0tEcWtXRU5WQmFmUFN5VW9Ha213NnVaQ2xMZXl6TFlWUjI3QlFtUFlqZz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJVkpxbkpoZ0pHSWNoTXd5M0pTOGljRUZKSkcrdXRMNXR1N29zZnlubkVuM3h5b3BPZ1c5aWVGdUVTVzdOR01WUnEvem1hN2NxSzFoL012TjZFMlNsak00dTNEZC9nV0ZVNDZlSmlFdTJHZVJaWVVRWjBwaUxzMGJoSUJHS2dXS25HeklKS0wxaXVmcFZSWFE0c1RORno5Z0laQ1FaYkZxdnVTVy9pQi91NWdhdG1LNUQzIn0="
    },
    "… 63 more"
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
    "… 95 more"
  ],
  "quest_enrollment_blocked_until": null,
  "quest_access_suspended_until": null
}
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 412 ms

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
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLb0tNTzRZVGNvTGlIUGFoTkV3SmI4ZlBndENsQVAzS0pnVHBJbDIreFBwTmVWNG95cWM5OTd2NXJMQmJHSmdtVm1nZHRkOVFsTmdmbENYT2xSVnRhaDBsdEtsZWx4NVBQak5pOTNhc2VseXRJOW13QWZQb05JZlhvQlhFRkFVQVpMR05RZFpma1p0Z092dENDSklHcEZJQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMajMwa0xuc255RXhFZmxJMUNaTDFiMnp1ckhiQXFmcEJGWDBLeVFRSnNEUDJieERjbVNPVkt4bVpJSDR5SXBRWkNQUVhac0Y2dEVQVVpmSGpQMkpaTWhlZmlFYk96bXpXOUVZK09uYVB1WDBFVUttYjF4RTdPUkhiTTk1blhPWWV4eXJsRlVPY0RzWXV5c3M2VVVPbXJjeWRESzZldGt6RWNmbE8zUUw5MGJ4UlJkckwxIn0="
    },
    {
      "id": "<id:2>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLb0tNTzRZVGNvTGlIUGFoTkV3SmI4ZlBndENsQVAzS0pnVHBJbDIreFBwTmVWNG95cWM5OTd2NXJMQmJHSmdtVm1nZHRkOVFsTmdmbENYT2xSVnRhaDBsdEtsZWx4NVBQak5pOTNhc2VseXRJOW13QWZQb05JZlhvQlhFRkFVQVpMR05RZFpma1p0Z092dENDSklHcEZJQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJejFBQnFkNm5EMThFd0hlL05ITElCMTJhaXBoci82VUFrekY0WFQrcER6SmQzVXdWUWxRYXlJMGlJWDIyZVJLd2JyRS9XSDFBL2xJQUZaaWtyMkJZcmFTZnNoS1BLdnhHSDY2YWk2QXk5U21tRi95YnJ3R1pjNkJJZFFRN3FGVHRKYnk3Q3dvNXh2dmJJQVc1YWx1cm9laWcrdjdOeDl4Um03SzJkTlFad3JVWmNXZVpJIn0="
    },
    {
      "id": "<id:3>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLb0tNTzRZVGNvTGlIUGFoTkV3SmI4ZlBndENsQVAzS0pnVHBJbDIreFBwTmVWNG95cWM5OTd2NXJMQmJHSmdtVm1nZHRkOVFsTmdmbENYT2xSVnRhaDBsdEtsZWx4NVBQak5pOTNhc2VseXRJOW13QWZQb05JZlhvQlhFRkFVQVpMR05RZFpma1p0Z092dENDSklHcEZJQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKVEpHSG4xWVNWS21kS3VHLzd4WHRIWmM2YUxpeHl2VTdxeVpNQ1puZzJPakFsUkFtUkFQVVVySUxYeEN1alV0WjU2ZDlNSXBtaU1PZjJtN3U3TjFrRFNrYm91eU4xejFUb2NORlI3LzExMUV5c0hNNms1WEF0M2tzSkp2aVI2NGk4VXAwS01vbEFrNmpuMWdSdGpCSythcVRFUlp1TGJEMHk5cVhINU8rREk1ZGRrQlZEIn0="
    },
    {
      "id": "<id:4>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLb0tNTzRZVGNvTGlIUGFoTkV3SmI4ZlBndENsQVAzS0pnVHBJbDIreFBwTmVWNG95cWM5OTd2NXJMQmJHSmdtVm1nZHRkOVFsTmdmbENYT2xSVnRhaDBsdEtsZWx4NVBQak5pOTNhc2VseXRJOW13QWZQb05JZlhvQlhFRkFVQVpMR05RZFpma1p0Z092dENDSklHcEZJQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMeEp3L282cXE1ZHJkSzZXaWYyd2pOcCtPMkd0eUpncHJwYzhLQTZzYVBWRkNxMlZEVG9VaGhzd3dGNTdEbEdhVDhaN0p3VU5TT3hxZC9hcVQ5a0JLMzRmRElkYTR6VVNLUUJsbTVaMCtYOUNRNDFUME4rRDQ0R1AvQlpPeDlhNGM0V3I1UlZxNG1nbFZ5dTB1VU5WcUZFVVNDZkpJK1luNk1ZVEZNa0paTlB5cndlQW1SIn0="
    },
    {
      "id": "<id:5>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLb0tNTzRZVGNvTGlIUGFoTkV3SmI4ZlBndENsQVAzS0pnVHBJbDIreFBwTmVWNG95cWM5OTd2NXJMQmJHSmdtVm1nZHRkOVFsTmdmbENYT2xSVnRhaDBsdEtsZWx4NVBQak5pOTNhc2VseXRJOW13QWZQb05JZlhvQlhFRkFVQVpMR05RZFpma1p0Z092dENDSklHcEZJQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKNDcrbnBDekY1Smo0K0RUTnJ6QnJTbmcxSHE0MkFpNFZMOWZCd0t4M0FndVFpSnR2YVNWeXlkUDIwOGhMblc2NGlQSzB6eDZ2NW4vMmM4aExSRmhqZjlYOWNwdUtqMEUwTEcrMzFzNGVOQmtSR3hENXovbFIvTUREWkd3aXMzVjVXUW4wZ0RtRk81VTN5aENJcUtWMk12T3FKakczeDRlZ3lZdmxNdEY1VjhHV1BYNm5JIn0="
    },
    {
      "id": "<id:6>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLb0tNTzRZVGNvTGlIUGFoTkV3SmI4ZlBndENsQVAzS0pnVHBJbDIreFBwTmVWNG95cWM5OTd2NXJMQmJHSmdtVm1nZHRkOVFsTmdmbENYT2xSVnRhaDBsdEtsZWx4NVBQak5pOTNhc2VseXRJOW13QWZQb05JZlhvQlhFRkFVQVpMR05RZFpma1p0Z092dENDSklHcEZJQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJMVZkQ2laaEpodGVMU0l1VThWYW5SN2VGQ3Q4dFlWUDRTU3ZNVXBmc1Q4NURnekRKdmVDNkovamFRdjFQdkluUHEyRkNmMzV0L3kxSjBmZFBaSGdDTlljcXp2MGJtZXFqQkhYNzR3U1dwUmhVMFg4c3RKa1ZGQnNsQnpTOWRhMXB5bVY5N3k5SmlUZmRUNXJmSkpkN0JPazBmcXpaZDVDSmgrWmd2K1hnVkJEa2x6OTVMIn0="
    },
    "… 65 more"
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
    "… 97 more"
  ],
  "quest_enrollment_blocked_until": null,
  "quest_access_suspended_until": null
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 551 ms

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
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLTWZCaFJRYUwxcW1XVzJWbU9rLzQ3WWhzNjROTGtILzIxc2dBSzhXSExYRUZsV1B5U1JCanZDRldLU1FNOGFNS2Vsd01sb0xjVXdlbkV4RUJlVUxGcmQ0dCs0U2o0MGhPRUFCOHhmRzlBa0J4MDhQblF1c2tyYnNsWHNuSmhJYlEyUFZjYVVleGVyOXNnYnVBaDZNSVRoQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLVmtVYnY5bm1IQWZ0dU95YStaelZTb0x5ZGhtdTNucklBTU0yN2dBNHljT0tJSHNJOFVKNW94UzdYVUZTNWpMU1pKZFV6QWt6aENlUU5Sc1MrSndxWjJodU5yNFZrcCtvN0luaGpNSmtPV0s4QXVIV1lWdEwzNGNQNzdOWmpJNG9GV3ZzaTczOGYxZWJhT1F1VXZFbi9wdHhxSEtyOTZKR1hMb0g2SS9TMTI3ZGgwaHJDIn0="
    },
    {
      "id": "<id:2>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLTWZCaFJRYUwxcW1XVzJWbU9rLzQ3WWhzNjROTGtILzIxc2dBSzhXSExYRUZsV1B5U1JCanZDRldLU1FNOGFNS2Vsd01sb0xjVXdlbkV4RUJlVUxGcmQ0dCs0U2o0MGhPRUFCOHhmRzlBa0J4MDhQblF1c2tyYnNsWHNuSmhJYlEyUFZjYVVleGVyOXNnYnVBaDZNSVRoQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKRkkrS215Y3RJNmkwckJMd1JUU0p4OXRZRnp1WXVyRHlJUFJqY0g4OW1aczIvWFp1S0tBN2xLUTlpUXhTMWN0enYyM2t5OFJnOThydUIzdEx3RDVNWTM4dUQ5clBxMVc2ZzVjNWlGUzhaY1A2SUFxYXhJNWc5Zm5MRndTeEd2eFAvSXdFVHdRNXkxeHZkdjNXUHBqRW5VY0FRZDhTUHNXTVgrdE5zVFZKbFBmOGtkWXRUIn0="
    },
    {
      "id": "<id:3>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLTWZCaFJRYUwxcW1XVzJWbU9rLzQ3WWhzNjROTGtILzIxc2dBSzhXSExYRUZsV1B5U1JCanZDRldLU1FNOGFNS2Vsd01sb0xjVXdlbkV4RUJlVUxGcmQ0dCs0U2o0MGhPRUFCOHhmRzlBa0J4MDhQblF1c2tyYnNsWHNuSmhJYlEyUFZjYVVleGVyOXNnYnVBaDZNSVRoQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLenU2OGZGVjBZL1NDNEdaNDd5NHppMFE0VGRzRnlNamlNakdtWHZlMjFJeXNMZWdNeC9QRUpyMDducWZEQ1VkczN2M3pXUGgxSVE0UEJtdmJ1Q0ZGdHk0T3V0Tk1FOWdyT29NL1FCRXNHTVVGdGZxWm5NUzFXa2RhRXJ2UjFHUFl2UVlza0ovTm5LeW5Jbk0vaHFCU0lYTjd5VnhDU1JEdEgzL3FuMDJQa1hzZWNOcWNhIn0="
    },
    {
      "id": "<id:4>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLTWZCaFJRYUwxcW1XVzJWbU9rLzQ3WWhzNjROTGtILzIxc2dBSzhXSExYRUZsV1B5U1JCanZDRldLU1FNOGFNS2Vsd01sb0xjVXdlbkV4RUJlVUxGcmQ0dCs0U2o0MGhPRUFCOHhmRzlBa0J4MDhQblF1c2tyYnNsWHNuSmhJYlEyUFZjYVVleGVyOXNnYnVBaDZNSVRoQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKZHJ2Mzl3QmxpRU9qbGY1dlJDR1VMdnNhN1JlMnFhNjNXd3NhTmxPUjBEMXpvYlpIZXBNY05Tb0RFVEJ4OVQwVS9sYUZ4SFduNENEQUh6WTlDbnBiRkVwMkZJZVRqSFJhcnc4VHFhckN2TU91dWNHS0NxU1RPWnV1cWZ4U2lQQXNjZmJMNkFWMXEwelNuL3ErVW1sSUEzeUlPczBJZExZQUdyaVd3TTY5K3NDOTNRWEFhIn0="
    },
    {
      "id": "<id:5>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLTWZCaFJRYUwxcW1XVzJWbU9rLzQ3WWhzNjROTGtILzIxc2dBSzhXSExYRUZsV1B5U1JCanZDRldLU1FNOGFNS2Vsd01sb0xjVXdlbkV4RUJlVUxGcmQ0dCs0U2o0MGhPRUFCOHhmRzlBa0J4MDhQblF1c2tyYnNsWHNuSmhJYlEyUFZjYVVleGVyOXNnYnVBaDZNSVRoQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKVGdiN1BEL2FRQ0JWc3IrL1lhQ3N1TVIwTmUzb2lUU3Jab2JWSHFXQ3RuWGZ0RUsxM25tODBUckhMU0xRVGZiWCtJNGs5WFl1Tm9FTUcxVjJmR3dZZUF6a2FzbS9kaGNiQzNvMTcwRnpUZUljMlZWSTZLdWk4eFVQdmo1NzFkWm1zckp4WVFEOGZaREZsYnROTE1FYkVZNW4yeFg0QWRlajBtaXpoc3pyODFBYlZTVzlsIn0="
    },
    {
      "id": "<id:6>",
      "config": "(13 fields)",
      "user_status": null,
      "targeted_content": "(0 items)",
      "ad_context": null,
      "preview": false,
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLTWZCaFJRYUwxcW1XVzJWbU9rLzQ3WWhzNjROTGtILzIxc2dBSzhXSExYRUZsV1B5U1JCanZDRldLU1FNOGFNS2Vsd01sb0xjVXdlbkV4RUJlVUxGcmQ0dCs0U2o0MGhPRUFCOHhmRzlBa0J4MDhQblF1c2tyYnNsWHNuSmhJYlEyUFZjYVVleGVyOXNnYnVBaDZNSVRoQT09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLdCszOXMyT2wzc2xhL2gzdFJzdlZUR2l3ZzJhazgvNkY3RzBOVHlBY1Axc2hLSTFrY3JZa0labDVMMTgzYk9EMGtackpZbDgvOHFkeFFGU21lM2JrVFUrTnEwaUJ0WEpvTVJWV2FCOGN6Ryt2dHdiS0VkM2xISkpLRUgzbThTeDhvaE1FVDZUNVlrTkZzVTY2alpZMWNpa09jNWdlOU5ZWm95NE1VQ2x3YzBnZUhRQUxzIn0="
    },
    "… 58 more"
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
      "id": "<id:13>"
    },
    "… 93 more"
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
