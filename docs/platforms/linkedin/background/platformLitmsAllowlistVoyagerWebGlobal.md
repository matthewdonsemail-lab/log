# platformLitmsAllowlistVoyagerWebGlobal

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `platform.linkedin.com/litms/allowlist/voyager-web-global` |
| Sends | — |
| Reads | `pageKey`, `controlUrn` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script72.js:1 statement`, `runs/inspect/20261106T014139_<name:1>/script26.js:1 statement`, `runs/inspect/20261107T161246_<name:1>/script148.js:1 statement`, `runs/inspect/20261107T170649_<name:1>/script20.js:1 v` |
| rea | `ev_914afe55b9058180eb9a7049a5e7d12cec99bae23753520408145b690c5c217b` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 46 ms | 3162 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 22 ms | 205613 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 1 ms | 3540 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 1 ms | 3078 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 1 ms | 3032 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 1 ms | 3547 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 1 ms | 2364 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 46 ms

Sent:

```json
null
```

Answered:

```json
{
  "pageKey": [
    "d_flagship3_premium_welcome_flow"
  ],
  "controlUrn": [
    "urn:li:control:voyager_web_app-m2m_invite"
  ]
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 46 ms

Sent:

```json
null
```

Answered:

```json
{
  "pageKey": [
    "d_flagship3_premium_welcome_flow"
  ],
  "controlUrn": [
    "urn:li:control:voyager_web_app-m2m_invite"
  ]
}
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 22 ms

Sent:

```json
null
```

Answered:

```json
{
  "pageKey": [
    "d_flagship3_premium_welcome_flow"
  ],
  "controlUrn": [
    "urn:li:control:voyager_web_app-m2m_invite"
  ]
}
```

<!-- facts:end -->

## What it does

The tag manager (LiTMS) loads the site-wide allowlist from `platform.linkedin.com`: the page keys and control urns on any page where tags may fire (in our runs, the premium welcome flow page and the invite control). It sends nothing and fires on each profile and feed load; after the first fetch it comes from the browser's cache in about 1 ms.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it and reads no allowlist. It is background browser traffic.

## What can go wrong

Every answer in our runs is 200. A failure only stops tags firing in the browser page; a direct-API run doesn't depend on it.
