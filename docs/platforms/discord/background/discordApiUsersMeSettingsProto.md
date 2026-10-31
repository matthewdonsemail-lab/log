# discordApiUsersMeSettingsProto

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/settings-proto` |
| Sends | — |
| Reads | `settings` |
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_82865bb4a82a75e0cefe18b95441659c35190864b7e290ede692a55ad9f2fd30` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 371 ms | 35608 ms | — |
| inspect | step 8: click e221 | 1 | 200 | 365 ms | 20533 ms | — |
| inspect | step 11: type e2625 | 1 | 200 | 354 ms | 20002 ms | — |
| inspect | step 27: type e2077 | 1 | 200 | 387 ms | 23 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 371 ms

Sent:

```json
null
```

Answered:

```json
{
  "settings": "CgUIChj2YxK+Agq7AgpYaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXR0YWNobWVudHMvMTEzODE5NjU1NDE4MDcyMjg0My8xNDU4NTM2MzIzMzc0Nzc2NjIyL2hxNzIwLmdpZhLeAQgBEtEBaHR0cHM6Ly9tZWRpYS5kaXNjb3JkYXBwLm5ldC9hdHRhY2htZW50cy8xMTM4MTk2NTU0MTgwNzIyODQzLzE0NTg1MzYzMjMzNzQ3NzY2MjIvaHE3MjAuZ2lmP2Zvcm1hdD13ZWJwJmFuaW1hdGVkPXRydWUmZXg9NmFlMjQ2Y2QmaXM9NmFlMGY1NGQmaG09N2EzZjljOGMwZjJhNGIwMzZkMWE0ZWJlNTRlYWQ4OGQzMzA0ZDI2ZDM3YWZk… (23216 chars)"
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 8: click e221: 200, 365 ms

Sent:

```json
null
```

Answered:

```json
{
  "settings": "CgUIChj2YxK+Agq7AgpYaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXR0YWNobWVudHMvMTEzODE5NjU1NDE4MDcyMjg0My8xNDU4NTM2MzIzMzc0Nzc2NjIyL2hxNzIwLmdpZhLeAQgBEtEBaHR0cHM6Ly9tZWRpYS5kaXNjb3JkYXBwLm5ldC9hdHRhY2htZW50cy8xMTM4MTk2NTU0MTgwNzIyODQzLzE0NTg1MzYzMjMzNzQ3NzY2MjIvaHE3MjAuZ2lmP2Zvcm1hdD13ZWJwJmFuaW1hdGVkPXRydWUmZXg9NmFlMjQ2Y2QmaXM9NmFlMGY1NGQmaG09N2EzZjljOGMwZjJhNGIwMzZkMWE0ZWJlNTRlYWQ4OGQzMzA0ZDI2ZDM3YWZk… (23216 chars)"
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 11: type e2625: 200, 354 ms

Sent:

```json
null
```

Answered:

```json
{
  "settings": "CgUIChj2YxK+Agq7AgpYaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXR0YWNobWVudHMvMTEzODE5NjU1NDE4MDcyMjg0My8xNDU4NTM2MzIzMzc0Nzc2NjIyL2hxNzIwLmdpZhLeAQgBEtEBaHR0cHM6Ly9tZWRpYS5kaXNjb3JkYXBwLm5ldC9hdHRhY2htZW50cy8xMTM4MTk2NTU0MTgwNzIyODQzLzE0NTg1MzYzMjMzNzQ3NzY2MjIvaHE3MjAuZ2lmP2Zvcm1hdD13ZWJwJmFuaW1hdGVkPXRydWUmZXg9NmFlMjQ2Y2QmaXM9NmFlMGY1NGQmaG09N2EzZjljOGMwZjJhNGIwMzZkMWE0ZWJlNTRlYWQ4OGQzMzA0ZDI2ZDM3YWZk… (23216 chars)"
}
```

<!-- facts:end -->

## What it does

Reads the account's settings as a base64 protobuf (`settings-proto/1` user settings, `/2` frecency: recently used emojis, GIFs and channels).

## What our machine does with it

Not read yet. The frecency settings would say which chats the account used last.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
