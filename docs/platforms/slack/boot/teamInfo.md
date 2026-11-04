# teamInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/team.info` |
| Sends | `------WebKitFormBoundaryK16wbeV5GbB3VtZb
Content-Disposition: form-data; name`, `------WebKitFormBoundaryXqB9rJ6JYrCmDsOD
Content-Disposition: form-data; name` |
| Reads | `ok`, `teams` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 "Ql/u"`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 "Ql/u"`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_4f6cc81b74b9b976c4bb3eafd5b31bc09b8d38784a2e4de7a74b27eda7aca68a` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 299 ms | 9269 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 282 ms | 6862 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 299 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689066.950",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryK16wbeV5GbB3VtZb\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryK16wbeV5GbB3VtZb\r\nContent-Disposition: form-data; name=\"teams\"\r\n\r\nT0A9H4FM18V\r\n------WebKitFormBoundaryK16wbeV5GbB3VtZb\r\nContent-Disposition: form-data; name=\"include_unlisted_if_admin\"\r\n\r\nfalse\r\n------WebKitFormBoundaryK16wbeV5GbB3VtZb\r\nContent-Dis… (809 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "teams": [
    {
      "id": "T0A9H4FM18V",
      "name": "Rheos",
      "icon": {
        "image_default": false,
        "image_34": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_34.png",
        "image_44": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_44.png",
        "image_68": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_68.png",
        "image_88": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_88.png",
        "image_102": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_102.png",
        "image_230": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_230.png",
        "image_132": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_132.png"
      },
      "avatar_base_url": "https://ca.slack-edge.com/",
      "is_verified": false,
      "domain": "rheosgroup",
      "date_created": 1768831576,
      "requires_sponsorship": false
    }
  ]
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 282 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689121.948",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryXqB9rJ6JYrCmDsOD\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryXqB9rJ6JYrCmDsOD\r\nContent-Disposition: form-data; name=\"teams\"\r\n\r\nT0A9H4FM18V\r\n------WebKitFormBoundaryXqB9rJ6JYrCmDsOD\r\nContent-Disposition: form-data; name=\"include_unlisted_if_admin\"\r\n\r\nfalse\r\n------WebKitFormBoundaryXqB9rJ6JYrCmDsOD\r\nContent-Dis… (810 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "teams": [
    {
      "id": "T0A9H4FM18V",
      "name": "Rheos",
      "icon": {
        "image_default": false,
        "image_34": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_34.png",
        "image_44": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_44.png",
        "image_68": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_68.png",
        "image_88": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_88.png",
        "image_102": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_102.png",
        "image_230": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_230.png",
        "image_132": "https://avatars.slack-edge.com/2026-03-26/10790014070324_8195aace320335883a0d_132.png"
      },
      "avatar_base_url": "https://ca.slack-edge.com/",
      "is_verified": false,
      "domain": "rheosgroup",
      "date_created": 1768831576,
      "requires_sponsorship": false
    }
  ]
}
```

<!-- facts:end -->

## What it does

Reads the workspace record for the team(s) the client has open: `teams[]` with `id`, `name`, `domain`, `icon`, `date_created`. Fired 9.3 s into step 4 (`goto /client`, 299 ms) and 6.9 s into step 6 (282 ms), both 200.

## What our machine does with it

Not called as `team.info`. The engine gets the workspace list and the chosen workspace's id, name and domain from the cookie exchange (`teams_of` and `core.initialize()` in `python/slackApi/engine.py`, shown as `workspace` in each answer and in `log slack workspaces`), which is the same data from a different Slack endpoint.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 with no error.
