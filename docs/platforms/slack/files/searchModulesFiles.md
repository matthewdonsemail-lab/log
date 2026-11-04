# searchModulesFiles

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | files |
| Kind | query |
| doc_id | — |
| Path | `/api/search.modules.files` |
| Sends | `------WebKitFormBoundaryZgCmoZBTID5iuMIT
Content-Disposition: form-data; name`, `------WebKitFormBoundaryV8J6tzWB8RUDElTh
Content-Disposition: form-data; name`, `------WebKitFormBoundaryyqG656ALBL4Bv1Ym
Content-Disposition: form-data; name`, `------WebKitFormBoundaryg8XnnjCn2Z2MaWdq
Content-Disposition: form-data; name`, `------WebKitFormBoundaryPmbPAM2sqAXuwE5K
Content-Disposition: form-data; name` |
| Reads | `ok`, `pagination.total_count`, `pagination.per_page`, `pagination.page_count`, `pagination.first`, `pagination.last`, `pagination.page`, `query`, `filters.file_types`, `ai_filters`, `manual_filters.file_types`, `module` and 3 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:168 U070`, `runs/inspect/20261103T065639_mattSlack/script3.js:2976 U070` |
| rea | `ev_312d4cfd4b0b2db945b0030733025ba07f628a7848e92a01308d6763541539f1` |

Seen 5 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: click e1075 | 1 | 200 | 348 ms | 10452 ms | — |
| inspect | step 14: press Enter | 4 | 200 | 341–428 ms | 36240–94367 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 8: click e1075: 200, 348 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689250.458",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "b3O92r22OFk",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryZgCmoZBTID5iuMIT\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryZgCmoZBTID5iuMIT\r\nContent-Disposition: form-data; name=\"module\"\r\n\r\nfiles\r\n------WebKitFormBoundaryZgCmoZBTID5iuMIT\r\nContent-Disposition: form-data; name=\"query\"\r\n\r\ntype:lists type:quip type:documents type:spreadsheets type:presentations type:pdfs\r\n-… (2826 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "pagination": {
    "total_count": 1,
    "per_page": 50,
    "page_count": 1,
    "first": 1,
    "last": 1,
    "page": 1
  },
  "query": "type:lists type:quip type:documents type:spreadsheets type:presentations type:pdfs",
  "filters": {
    "file_types": [
      "lists",
      "quip",
      "documents",
      "spreadsheets",
      "presentations",
      "pdfs"
    ]
  },
  "ai_filters": {},
  "manual_filters": {
    "file_types": [
      "lists",
      "quip",
      "documents",
      "spreadsheets",
      "presentations",
      "pdfs"
    ]
  },
  "module": "files",
  "items": [
    {
      "id": "F0817A32Y1E",
      "created": 1731432010,
      "timestamp": 1731432010,
      "mimetype": "application/vnd.slack-docs",
      "filetype": "quip",
      "pretty_type": "Canvas",
      "user": "USLACKBOT",
      "user_team": "T0C4VCD06MR",
      "editable": true,
      "size": 656,
      "mode": "quip",
      "is_external": false,
      "external_type": "",
      "is_public": false,
      "public_url_shared": false,
      "display_as_bot": false,
      "username": "",
      "name": "Weekly_1_1",
      "title": "Weekly 1:1",
      "url_private": "https://files.slack.com/files-pri/T0C4VCD06MR-F0817A32Y1E/canvas",
      "url_private_download": "https://files.slack.com/files-pri/T0C4VCD06MR-F0817A32Y1E/download/canvas",
      "permalink": "https://matthewsteam-op91876.slack.com/docs/T0C4VCD06MR/F0817A32Y1E",
      "permalink_public": "https://slack-files.com/T0C4VCD06MR-F0817A32Y1E-85e844ed8c",
      "url_static_preview": "https://matthewsteam-op91876.slack.com/docs/T0C4VCD06MR/F0817A32Y1E/mobile",
      "quip_thread_id": "bcC9AAFLNo4",
      "updated": 1756322140,
      "update_notification": 1756314672,
      "canvas_readtime": 0.33881975110397,
      "source_team": "T0C4VCD06MR",
      "skipped_shares": true,
      "is_restricted_sharing_enabled": false,
      "has_rich_preview": false,
      "file_access": "visible",
      "access": "read",
      "org_or_workspace_access": "read",
      "title_blocks": [
        {
          "type": "rich_text",
          "block_id": "bcC9CAv875r",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "Weekly 1:1"
                }
              ]
            }
          ]
        }
      ],
      "canvas_creator_id": "USLACKBOT",
      "team_pref_version_history_enabled": true,
      "canvas_printing_enabled": true,
      "show_badge": false,
      "canvas_template_mode": "published",
      "template_conversion_ts": 1731432027,
      "template_name": "WeeklySyncExpansionPreFillDmCanvasTemplate",
      "template_title": "Weekly 1:1",
      "template_description": "",
      "template_icon": "heart",
      "is_global_template": true,
      "template_locale": "en-US",
      "is_ai_suggested": false,
      "editors": [],
      "last_read": 1792502601,
      "iid": "55431b25-cf35-4b95-b97d-d5360da9f390",
      "search_title": null,
      "search_name": "Weekly_1_1",
      "preview": null,
      "search_preview": null
    }
  ]
}
```

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 423 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689416.655",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "b3O92r22OFk",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryV8J6tzWB8RUDElTh\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryV8J6tzWB8RUDElTh\r\nContent-Disposition: form-data; name=\"module\"\r\n\r\nfiles\r\n------WebKitFormBoundaryV8J6tzWB8RUDElTh\r\nContent-Disposition: form-data; name=\"query\"\r\n\r\nin:<@U0A9JFXK21L> type:images type:videos\r\n------WebKitFormBoundaryV8J6tzWB8RUDElTh\r\n… (2885 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "pagination": {
    "total_count": 8,
    "page": 1,
    "per_page": 50,
    "page_count": 1,
    "first": 1,
    "last": 8
  },
  "query": "in:<@U0A9JFXK21L> type:images type:videos",
  "filters": {
    "in": "(1 items)",
    "file_types": "(2 items)"
  },
  "ai_filters": {},
  "manual_filters": {
    "in": "(1 items)",
    "file_types": "(2 items)"
  },
  "module": "files",
  "items": [
    "(58 fields)",
    "(51 fields)",
    "(57 fields)",
    "(58 fields)",
    "(58 fields)",
    "(54 fields)",
    "… 2 more"
  ]
}
```

<!-- facts:end -->

## What it does

Runs the Files tab of Slack's search (`pagination`, `filters.file_types`, `query`, `module`): it fired once on step 8 (click e1075, 348 ms) and four times on step 14 (press Enter, 341 to 428 ms, 36 to 94 s in), all 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The engine has no search action; file attachments reach it inside messages.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only break the web client's file search results.
