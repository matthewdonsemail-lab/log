# litmsApiEventsTmsLoad

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/litms/api/events/tms-load` |
| Sends | `profileName`, `version`, `eventSource`, `referrer` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:3>/script20.js:1 anonymous`, `runs/inspect/20261107T170649_<name:3>/script31.js:460 anonymous` |
| rea | `ev_58484ddf774e72495c809f53697f7f3f99b9fc3d9e0b361a3e3163fec68a59cb` |

Seen 10 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: click e2157 | 1 | 200 | 63 ms | 769 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 61 ms | 208529 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 68 ms | 2555 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 176 ms | 2740 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/pagination (759 ms) | 1 | 200 | 61 ms | 189 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 243 ms | 2667 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 62 ms | 3585 ms | — |
| inspect | clearSession: linkedin cookies cleared on 1 domain(s): .linkedin.com | 1 | 200 | 78 ms | 4357 ms | — |
| chrome | step 2: send a message, by hand | 1 | 200 | 57 ms | 10421 ms | — |
| chrome | step 9: open My Network's invitations, by hand | 1 | 200 | 185 ms | 1554 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:3>**, step 6: click e2157: 200, 63 ms

Sent:

```json
{
  "profileName": "<name:1>",
  "version": "ut4.51.202506110022",
  "eventSource": "ember",
  "referrer": "https://www.linkedin.com/"
}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:3>**, step 2: snapshot: 200, 61 ms

Sent:

```json
{
  "profileName": "<name:2>",
  "version": "ut4.54.202610062342",
  "eventSource": "nile",
  "referrer": "https://www.linkedin.com/login/?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F"
}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:3>**, step 4: goto /feed/: 200, 68 ms

Sent:

```json
{
  "profileName": "<name:2>",
  "version": "ut4.54.202610062342",
  "eventSource": "nile",
  "referrer": ""
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

LinkedIn's tag manager announcing that it loaded on the page, with its profile name, its build version, the client framework that loaded it (`eventSource`) and the referrer. It fires on each page load, alongside the tag manager's `ext-tag-load` report.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. It is tag-manager telemetry the browser sends on its own.

## What can go wrong

Every recorded call answered 200 with no body in under 250 ms. A failure would only lose LinkedIn this report; it can't affect our runs.
