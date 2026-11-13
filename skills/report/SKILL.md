---
name: report
description: Show data to the person as a report in the chat (KPI tiles, bar and line charts, tables, people lists, callouts) with the MCP tool report, built from log's block catalog, and get its numbers from log.db with reportData. Use when the person says "make a report", "show me a chart of", "bar chart of who messaged me", "dashboard of", "graph my DMs", or asks to see numbers rather than read them.
---

# report

`report` turns numbers into something the person looks at. You send data and layout, never code: a title and a list of blocks from one small catalog. The same call works in every host. An MCP Apps host (Claude, ChatGPT, Cursor) draws it inline in log's look, light or dark, with a full-screen button. Any other host (Claude Code, Codex) gets the same report back as markdown: headings, tables and unicode bars such as `████████▌ 42`. Show that text to the person as it is.

## The loop

1. **Get the numbers first.** Read them from log, never from memory. For who messaged an X account, `reportData` { source: "twitterDmsBySender", account?, since?, limit?, json: true } counts one-to-one DMs per person from log.db only (no platform call, no governor use). It holds only what log.db has, so if the inbox may be behind, read it with `twitterDms` first (rule 160). For anything else, use the log read that has it (`twitterDms`, `inboxWaiting`, `search`, `governorShow`…).
2. **Lay the report out** with the rules below. Pick the blocks the question needs and nothing more.
3. **Call `report` once** with the finished spec. A spec that breaks the catalog is refused with a code and the exact paths to fix (`blocks[2].data[0].value: …`). Fix those and call again.
4. **Then answer in a sentence or two.** In an MCP Apps host the person already sees the report, so say what it means, not the numbers again. Without one, the answer's text is the report: show it.

## The block catalog

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

## Example: who has been messaging me on X

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

## Layout rules

- **Lead with the answer.** The first block is a `stat` row with two to four numbers that answer the question. Charts come next, the detail table last.
- **One idea per chart**, titled with what it shows ("Messages by person, top 10"), not how ("Bar chart"). Put the unit in `unit`, not in every label.
- **Bars are sorted**, largest first, and stop at 10 to 15. Put the rest in the table. Horizontal bars for people and names; vertical only for a few short labels such as weekdays.
- **Time is a `lineChart`**, its days in order, with the days that had nothing filled in as 0 (`reportData`'s `byDay` already is).
- **Real numbers only**, from the tool you just called. Never round them into a different story, never invent a delta. Leave `delta` out unless you computed it from two real periods.
- **People by name and handle** (rule 154), never a bare id. Their names and messages are private: they go in the report, never in a file, a commit or a test (rule 178).
- **Short.** A report is a page, not a dump: 3 to 8 blocks is usual. Use a `callout` only for the one thing that needs action ("9 people are waiting on a reply").
