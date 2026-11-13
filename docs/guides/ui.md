# ui

Reports in the chat: the report tool and its block catalog (KPI tiles, bar and line charts, tables, people, callouts), drawn inline by MCP Apps hosts and as markdown everywhere else, with reportData for the numbers from log.db.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## The tools in this guide

| Tool | What it does |
|---|---|
| `report` | Show a report |
| `reportData` | The numbers behind a report, from log.db only |

## The work, step by step: report

From `skills/report/SKILL.md`.

## report

`report` turns numbers into something the person looks at. You send data and layout, never code: a title and a list of blocks from one small catalog. The same call works in every host. An MCP Apps host (Claude, ChatGPT, Cursor) draws it inline in log's look, light or dark, with a full-screen button. Any other host (Claude Code, Codex) gets the same report back as markdown: headings, tables and unicode bars such as `████████▌ 42`. Show that text to the person as it is.

### The loop

1. **Get the numbers first.** Read them from log, never from memory. For who messaged an X account, `reportData` { source: "twitterDmsBySender", account?, since?, limit?, json: true } counts one-to-one DMs per person from log.db only (no platform call, no governor use). It holds only what log.db has, so if the inbox may be behind, read it with `twitterDms` first (rule 160). For anything else, use the log read that has it (`twitterDms`, `inboxWaiting`, `search`, `governorShow`…).
2. **Lay the report out** with the rules below. Pick the blocks the question needs and nothing more.
3. **Call `report` once** with the finished spec. A spec that breaks the catalog is refused with a code and the exact paths to fix (`blocks[2].data[0].value: …`). Fix those and call again.
4. **Then answer in a sentence or two.** In an MCP Apps host the person already sees the report, so say what it means, not the numbers again. Without one, the answer's text is the report: show it.

### The block catalog

A report is `{ title, subtitle?, blocks }`, 1 to 40 blocks. Every field is plain text or a number. HTML, markdown and URLs are shown as text, never run.

| Block | Fields | Use it for |
|---|---|---|
| `heading` | `text`, `level?` (2, or 3 for a smaller one) | Starting a section |
| `text` | `text` (up to 2000 characters, line breaks kept) | One or two sentences of reading |
| `stat` | `items`: 1 to 6 of { `label`, `value` (number or short text), `unit?`, `delta?` ("+12%", "−3"), `hint?` } | The headline numbers, as tiles. The first tile is the lead, drawn in brand blue |
| `barChart` | `data`: 1 to 50 of { `label`, `value` ≥ 0, `hint?` }, `title?`, `unit?`, `orientation?` ("horizontal", the default, or "vertical") | Comparing amounts: people, accounts, categories |
| `lineChart` | `x`: 2 to 366 labels, `series`: 1 to 4 of { `name`, `values` } with one value per x label, `title?`, `unit?` | A count over time |
| `table` | `columns`: 1 to 8 of { `key`, `label`, `align?`, `format?` ("text", "number" or "date") }, `rows`: up to 200 objects keyed by column key, each cell text, a number or null, `title?` | The detail behind a chart |
| `personList` | `people`: 1 to 100 of { `name`, `handle?`, `count?`, `note?` }, `title?`, `unit?` | Ranked people, each with initials as the avatar and a meter for the count |
| `callout` | `text`, `tone?` ("info", "success" or "warning"), `title?` | One thing the person must not miss |

Refusal codes: `reportBlockUnknown` (a `type` outside the catalog), `reportFieldInvalid` (a missing or wrong field, or a field the block doesn't have), `reportTooLarge` (over a limit above), `reportSeriesMismatch` (a line series whose values don't match the x labels), `reportColumnUnknown` (a row key no column has, or a column key used twice).

### Example: who has been messaging me on X

The person asks: "generate a report with some bar charts of who has been messaging me on Twitter". Call `reportData` { source: "twitterDmsBySender", since: "30d", json: true }, then `report` with its numbers:

```json
{
  "title": "Who messaged you on X",
  "subtitle": "One-to-one DMs, last 30 days, from log.db",
  "blocks": [
    { "type": "stat", "items": [
      { "label": "Messages in", "value": 412 },
      { "label": "People", "value": 37 },
      { "label": "Top sender", "value": "@sam_example", "hint": "64 messages" }
    ] },
    { "type": "barChart", "title": "Messages by person, top 10", "unit": "msgs", "data": [
      { "label": "Sam Example", "value": 64 },
      { "label": "Jo Placeholder", "value": 41 },
      { "label": "@test_user", "value": 22 }
    ] },
    { "type": "lineChart", "title": "Messages per day", "x": ["2026-10-14", "2026-10-15", "2026-10-16"], "series": [{ "name": "Messages", "values": [12, 18, 9] }] },
    { "type": "table", "title": "Everyone", "columns": [
      { "key": "name", "label": "Person" },
      { "key": "handle", "label": "Handle" },
      { "key": "count", "label": "Messages", "format": "number" },
      { "key": "lastAt", "label": "Last message", "format": "date" }
    ], "rows": [
      { "name": "Sam Example", "handle": "@sam_example", "count": 64, "lastAt": "2026-11-12T18:04:00Z" }
    ] }
  ]
}
```

Map `reportData` straight across: `messages` and `people` to the stat tiles, `senders` (name, count) to the bars, `byDay` (day, count) to the line chart's `x` and `values`, and `senders` again to the table. Use the person's name as the bar label when there is one, else `@handle`.

### Layout rules

- **Lead with the answer.** The first block is a `stat` row with two to four numbers that answer the question. Charts come next, the detail table last.
- **One idea per chart**, titled with what it shows ("Messages by person, top 10"), not how ("Bar chart"). Put the unit in `unit`, not in every label.
- **Bars are sorted**, largest first, and stop at 10 to 15. Put the rest in the table. Horizontal bars for people and names; vertical only for a few short labels such as weekdays.
- **Time is a `lineChart`**, its days in order, with the days that had nothing filled in as 0 (`reportData`'s `byDay` already is).
- **Real numbers only**, from the tool you just called. Never round them into a different story, never invent a delta. Leave `delta` out unless you computed it from two real periods.
- **People by name and handle** (rule 154), never a bare id. Their names and messages are private: they go in the report, never in a file, a commit or a test (rule 178).
- **Short.** A report is a page, not a dump: 3 to 8 blocks is usual. Use a `callout` only for the one thing that needs action ("9 people are waiting on a reply").

## Every tool, in full

### `report`

Show data to the person as a report: KPI tiles, bar and line charts, tables, people lists and callouts, in log's own look.
Send DATA and LAYOUT only, never code or HTML: { title, subtitle?, blocks: [...] }, each block one of heading, text, stat, barChart, lineChart, table, personList, callout. Fetch the numbers first (reportData, or any log read), then call this once with the finished report.
An MCP Apps host (Claude, ChatGPT, Cursor) draws it inline with a full-screen button; any other host (Claude Code, Codex) gets the same report as markdown with unicode bar charts, so show that text to the person as it is.
Reads nothing and sends nothing; a spec that breaks the catalog is refused with reportBlockUnknown, reportFieldInvalid, reportTooLarge, reportSeriesMismatch or reportColumnUnknown and the paths to fix. The answer's structuredContent is the checked spec.
Before first using this tool in a session, load its guide: getGuide({ topic: "ui" }) (Reports in the chat: the report tool and its block catalog (KPI tiles, bar and line charts, tables, people, callouts), drawn inline by MCP Apps hosts and as markdown everywhere else, with reportData for the numbers from log.db).
AGENTS.md (log://agents): rules 134, 154, 160, 178, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `reportData`

The numbers behind a report, from log.db only: who messaged an X account in DMs and how many messages, per person and per day.
The numbers behind a report, read from log.db only (who messaged an X account and how often), for the MCP report view
log report data --source twitterDmsBySender [--account <accountName>] [--since <7d|4w|12h|2026-11-01>] [--limit <n>] [--json]
The numbers behind a report, read from log.db only: no platform call, no governor use, nothing sent. twitterDmsBySender counts who messaged the X account in its one-to-one DMs (old DM thread and X Chat thread with one person counted as one, a message mirrored into both counted once; group chats left out), most messages first, with each person's first and last message time, the totals and the count per day. It holds only what log.db has: run twitterDms first if the inbox may be behind.
--account keeps one X account (default every X account in log.db). --since keeps messages from that date or span on. --limit is how many people to list, default 20, at most 200; the totals count everyone.
Show it with the MCP tool report (getGuide({ topic: "ui" })): an MCP Apps host draws it inline, any other host gets markdown with unicode bars.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "ui" }) (Reports in the chat: the report tool and its block catalog (KPI tiles, bar and line charts, tables, people, callouts), drawn inline by MCP Apps hosts and as markdown everywhere else, with reportData for the numbers from log.db).
AGENTS.md (log://agents): rules 134, 154, 160, 178, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 134.** 2026-11-04 · Existing workspace log.db is the native private record/coordination foundation. Preserve events, stable identities, chats/messages, attachments/interactions, claims/owners/cursors, queues/jobs, media/search and records/state. Keep current WAL/migration/version semantics and transaction boundaries; unknown events retain source payload and are surfaced for analysis. Only proven projections are rebuildable.

**Rule 154.** 2026-11-05 · Show people/chats by meaningful names and handles; keep routing ids internal unless needed for the specific technical artifact. Do not show a person as a bare UUID.

**Rule 160.** 2026-11-07 · Answer eligible chat reads from log.db when the owner is live, caught up and the needed history is present/backfilled. Otherwise fill the missing scope once through the owner. A refused catch-up is a refusal, never a reason to bypass it with another live read. Report the read source.

**Rule 178.** 2026-11-13 · Real people's names, handles, DMs and money never go in tracked files: this repo is public. Anecdotes are anonymised, or marked `<!-- private -->` … `<!-- /private -->` so the site and skill sync drop them (the source stays public, so a private block still holds no real names), and `check:privacy` must pass on every commit and push.
