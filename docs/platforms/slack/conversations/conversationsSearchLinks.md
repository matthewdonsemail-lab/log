# conversationsSearchLinks

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | query |
| doc_id | — |
| Path | `/api/conversations.searchLinks` |
| Sends | `------WebKitFormBoundaryrzrB6K0IYlSwUE2m
Content-Disposition: form-data; name`, `------WebKitFormBoundaryK4ZFAL0vBiANJTXA
Content-Disposition: form-data; name` |
| Reads | `ok`, `items`, `query`, `filter_suggestions`, `pagination.total_count`, `pagination.page`, `pagination.per_page`, `pagination.page_count`, `pagination.first`, `pagination.last` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:168 statement`, `runs/inspect/20261103T065639_mattSlack/script3.js:2976 statement` |
| rea | `ev_6f6e69bfefce6e514717cc40b351c99fbccbf7ca680ffc79b890c9047ea53d9f` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 14: press Enter | 2 | 200 | 376–403 ms | 36257–94379 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 403 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689416.677",
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
    "------WebKitFormBoundaryrzrB6K0IYlSwUE2m\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryrzrB6K0IYlSwUE2m\r\nContent-Disposition: form-data; name=\"channel_id\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundaryrzrB6K0IYlSwUE2m\r\nContent-Disposition: form-data; name=\"page\"\r\n\r\n1\r\n------WebKitFormBoundaryrzrB6K0IYlSwUE2m\r\nContent-Disposition: form-data;… (1080 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "items": [
    {
      "url": "https://www.claudemod.com/",
      "title": "ClaudeMod",
      "icon_url": "https://www.claudemod.com/favicon.ico?favicon.bd23ae02.ico",
      "thumb_url": null,
      "thumb_width": null,
      "thumb_height": null,
      "timestamp": "1793688218.019909"
    },
    {
      "url": "https://code.claude.com/docs/en/plugins/mods/overview",
      "title": "Mods overview - Claude Code Docs",
      "icon_url": "https://code.claude.com/docs/mintlify-assets/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon/apple-touch-icon.png",
      "thumb_url": "https://claude-code.mintlify.app/_mintlify/api/og/v2?division=Mods&title=Mods+overview&description=Add+panes%2C+commands%2C+and+tool+call+rules+to+Claude+Code+with+a+mod.+See+what+a+mod+can+do%2C+how+to+make+or+install+one%2C+and+where+mods+run.&theme=8d9812df31da293aba4e8103&signature=99ef215ffafc633652e196dbe3649e0d8ddffd420ab1c2aab05e51a9d79ee841",
      "thumb_width": 1200,
      "thumb_height": 630,
      "timestamp": "1793688196.600209"
    },
    {
      "url": "https://keenable.ai/",
      "title": "Keenable.ai — Independent Web Search API for AI",
      "icon_url": "https://framerusercontent.com/images/OnMsGFmAf0nM3frNRGKVMIjywao.png",
      "thumb_url": "https://framerusercontent.com/images/BzWtoTW95sFebOcWSEVTOtnpm4.png",
      "thumb_width": 1200,
      "thumb_height": 630,
      "timestamp": "1793542746.827279"
    },
    {
      "url": "https://x.com/edwardeachday/status/2115502035244073072?a=8jceGdeMd8ASI5erGas&s=20",
      "title": "Edward Sturm (@edwardeachday) on X",
      "icon_url": "https://x.com/apple-touch-icon.png",
      "thumb_url": "https://jf.x.com/images/media-preview/2115502035244073072",
      "thumb_width": 675,
      "thumb_height": 1200,
      "timestamp": "1793426333.426599"
    },
    {
      "url": "https://github.com/simonbalfe/adlib",
      "title": "GitHub - simonbalfe/adlib: Fast browserless Meta Ad Library scraper in Go",
      "icon_url": "https://a.slack-edge.com/80588/img/unfurl_icons/github.png",
      "thumb_url": null,
      "thumb_width": null,
      "thumb_height": null,
      "timestamp": "1793425967.013179"
    },
    {
      "url": "http://gtmcafe.com",
      "title": null,
      "icon_url": null,
      "thumb_url": null,
      "thumb_width": null,
      "thumb_height": null,
      "timestamp": "1793425938.905619"
    },
    "… 15 more"
  ],
  "query": " has:link in:<#D0C8VAE7REU>",
  "filter_suggestions": {},
  "pagination": {
    "total_count": 20,
    "page": 1,
    "per_page": 20,
    "page_count": 1,
    "first": 1,
    "last": 20
  }
}
```

<!-- facts:end -->

## What it does

Searches the links shared in conversations (`items`, `query`, `filter_suggestions`, `pagination`): it fired twice on step 14 (press Enter in the search box), 36 to 94 s in, 376 to 403 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The engine does no search; context comes from the .db and `conversations.history`.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal here would only break the web client's search results.
