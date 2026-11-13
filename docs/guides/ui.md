# ui

Generative UI in the chat: the report tool, where you write a small React view against log's kit (in the spirit of Lynx workspaces) and log draws it with data from log.db, or send just data for a starter view; text everywhere else.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## The tools in this guide

| Tool | What it does |
|---|---|
| `report` | Show a view |
| `reportData` | The numbers behind a report, from log.db only |

## The work, step by step: report

From `skills/report/SKILL.md`.

## report

`report` is log's generative UI. You decide what the person should see and write it as a small React view. log compiles it and draws it in the chat, with the data read from log.db in the same call.

- **Where it draws:** an MCP Apps host (Claude, ChatGPT, Cursor) draws the view inline. Other hosts (Claude Code, Codex) get the same view rendered as text, which you show as it is.
- **Why it looks the way it does:** the kit follows [Lynx](https://github.com/yakkomajuri/lynx)'s workspace kit (MIT): a quiet canvas, plain blocks, big light numbers, and Geist. It gives a general starting point that informs; the content is what makes it good.

### One call, no code

```json
{ "title": "Who's been messaging you on X", "subtitle": "last 30 days", "data": { "dms": { "source": "twitterDmsBySender", "since": "30d" } } }
```

This draws the starter view, which shows:
- headline stats, each with a line of what it means (top 10 share, new this week, busiest day)
- messages per day
- who messages most
- a table of people with their 30-day activity, when they last wrote and what they said

log.db holds only what has been read. If the inbox may be behind, read it with `twitterDms` first (rule 160).

### Your own view

Send `code` with the same `data`, and shape the view to the question. A question about one person gets that person; a question about the week gets the week. Start from what would help the person decide or act, and keep it short.

```jsx
import { Page, Card, Grid, Stat, Bars, Quote, Avatar, Row, Stack, Badge, Time, fmt } from "log";

export default function App({ data, title, subtitle }) {
  const r = data.dms;
  const p = r.senders[0];
  return (
    <Page title={title} subtitle={subtitle}>
      <Card>
        <Row gap={14}>
          <Avatar name={p.name} size={48} />
          <Stack gap={2} style={{ flex: 1 }}><strong>{p.name}</strong><span className="sb-stat-hint">@{p.handle}</span></Stack>
          <Badge tone="accent">{Math.round((p.count / r.messages) * 100)}% of your DMs</Badge>
        </Row>
      </Card>
      <Grid min={150}>
        <Stat label="Messages" value={fmt(p.count)} hint={`rank 1 of ${r.people}`} />
        <Stat label="Last message" value={<Time value={p.lastAt} />} />
      </Grid>
      <Card title="Latest message"><Quote>{p.lastMessage}</Quote></Card>
      <Card title="How they compare"><Bars data={r.senders.slice(0, 5).map((s) => ({ label: s.name, value: s.count }))} unit="msgs" /></Card>
    </Page>
  );
}
```

- **Imports:** only from `"log"` and `"react"`. End with `export default function App({ data, title, subtitle })`.
- **Layout:**
  - `Page { title, subtitle, actions }`
  - `Card { title, actions, pad }`; use `pad={false}` around a `Table`
  - `Grid { min }`
  - `Row` and `Stack`, each `{ gap }`
- **Numbers:**
  - `Stat { label, value, hint, tone }`
  - `Badge { tone: neutral|good|bad|warn|accent }`
  - `fmt(n)` formats a number, and `Time { value }` shows how long ago
- **Charts:**
  - `Bars { data: [{ label, value }], unit }` for ranked lists
  - `BarChart` for columns over time
  - `LineChart { series: [{ name, values }], labels }`
  - `Sparkline { values, width }`
- **People and words:**
  - `Avatar { name, size }`
  - `Quote`
  - `Icon { name }`, with Font Awesome 6 names in camelCase (`xTwitter`, `discord`, `message`, `users`, `clock`)
- **Detail:**
  - `Table { rows, columns: [{ key, title, render, align, width }], limit }`
  - `Tabs`, `Details`, `Empty`
- **Your own CSS:** plain CSS works. Use the `--sb-*` variables (`--sb-text`, `--sb-muted`, `--sb-accent`, `--sb-surface`), which follow light and dark mode.
- **Live data:**
  - `useTool(name, args)` calls a log read tool from inside the view and returns `{ data, loading, error, reload }`.
  - Wrap it in `<Query q={…}>{(data) => …}</Query>`.
  - Only call read tools.

A view that doesn't compile, imports from anywhere else, or breaks while drawing is refused with `reportFieldInvalid`, with the line or error to fix.

The older `blocks` list (`heading`, `text`, `stat`, `barChart`, `lineChart`, `table`, `personList`, `callout`) still works and is drawn with the same kit.

### After it is drawn

In an MCP Apps host the person already sees the view, so say what it means in a sentence or two, not the numbers again.

### How it is built

- **Code:** `src/mcp/apps/report/view` holds:
  - the kit (`kit.tsx`, `kit.css`)
  - the widget that runs the view in the chat (`widget.tsx`)
  - the server side that compiles with sucrase and renders the text version (`server.tsx`)
  - the starter views (`starters/`)
- **What the page loads:** the page is self-contained, with React, the kit and Geist inlined, so it loads nothing from the internet.

## Every tool, in full

### `report`

Generative UI: show the person a view you build for their question, drawn in the chat. Plain and readable by default, in the spirit of Lynx workspaces.
One call: { title, data: { dms: { source: "twitterDmsBySender", since?: "30d", account?, limit? } } } reads log.db and draws a starter view (headline stats, messages per day, who messages most, a table of people with activity and their latest message).
Your own view: add code, a React component in JSX. import { Page, Card, Grid, Row, Stack, Stat, Badge, Table, Bars, BarChart, LineChart, Sparkline, Avatar, Quote, Icon, Tabs, Details, Empty, Query, Time, fmt, rel, useTool, useData } from "log". End with export default function App({ data, title, subtitle }) { return <Page title={title}>…</Page> }.
Components: Page { title, subtitle, actions }, Card { title, actions, pad }, Grid { min }, Row/Stack { gap }, Stat { label, value, hint, tone }, Badge { tone: neutral|good|bad|warn|accent }, Table { rows, columns: [{ key, title, render, align, width }], limit }, Bars { data: [{ label, value }], unit } for ranked lists, BarChart { data: [{ label, value }] } for columns, LineChart { series: [{ name, values }], labels }, Sparkline { values, width }, Avatar { name, size }, Quote, Icon { name } (Font Awesome 6 names in camelCase: xTwitter, discord, message, users, clock, fire…), Time { value } (relative), fmt(n). Plain CSS works with the --sb-* variables (--sb-text, --sb-muted, --sb-accent, --sb-surface).
Data: data.<name> from the data field is there at once. useTool(name, args) calls a log read tool live from the view and returns { data, loading, error, reload }; wrap it in Query. Only call read tools.
Shown inline in MCP Apps hosts (Claude, ChatGPT, Cursor); other hosts (Claude Code, Codex) get the same view as text. A view that doesn't compile is refused with reportFieldInvalid and the line to fix.
Before first using this tool in a session, load its guide: getGuide({ topic: "ui" }) (Generative UI in the chat: the report tool, where you write a small React view against log's kit (in the spirit of Lynx workspaces) and log draws it with data from log.db, or send just data for a starter view; text everywhere else).
AGENTS.md (log://agents): rules 134, 154, 160, 178, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `reportData`

The numbers behind a report, from log.db only: who messaged an X account in DMs and how many messages, per person and per day.
The numbers behind a report, read from log.db only (who messaged an X account and how often), for the MCP report view
log report data --source twitterDmsBySender [--account <accountName>] [--since <7d|4w|12h|2026-11-01>] [--limit <n>] [--json]
The numbers behind a report, read from log.db only: no platform call, no governor use, nothing sent. twitterDmsBySender counts who messaged the X account in its one-to-one DMs (old DM thread and X Chat thread with one person counted as one, a message mirrored into both counted once; group chats left out), most messages first, with each person's first and last message time, the totals and the count per day. It holds only what log.db has: run twitterDms first if the inbox may be behind.
--account keeps one X account (default every X account in log.db). --since keeps messages from that date or span on. --limit is how many people to list, default 20, at most 200; the totals count everyone.
Show it with the MCP tool report (getGuide({ topic: "ui" })): an MCP Apps host draws it inline, any other host gets markdown with unicode bars.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "ui" }) (Generative UI in the chat: the report tool, where you write a small React view against log's kit (in the spirit of Lynx workspaces) and log draws it with data from log.db, or send just data for a starter view; text everywhere else).
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
