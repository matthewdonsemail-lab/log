# ui

Generative UI in the chat: the report tool, where you write a small React view against log's kit (in the spirit of Lynx workspaces) and log draws it with data from log.db, or send just data for a starter view; text everywhere else.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `report` | Show a view |  |
| `reportData` | The numbers behind a report, from log.db only | `log report data --source <twitterDmsBySender\|dmsBySender\|identityProfile> [--platform <p>] [--account <accountName>] [--since <7d\|4w\|12h\|2026-11-01>] [--limit <n>] [--userId <id>] [--handle <handle>] [--json]` |

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

### The data sources

Each entry in `data` names one `source`. Every source reads log.db only, with no platform call.

| `source` | Inputs | What it hands the view |
| --- | --- | --- |
| `twitterDmsBySender` | `account?`, `since?`, `limit?` | Who messaged the X account in one-to-one DMs: people, counts, activity, latest message |
| `dmsBySender` | `platform`, `account?`, `since?`, `limit?` | The same, for any platform with chats in log.db. A platform with none is refused with `reportSourceNoData` |
| `identityProfile` | `platform`, and `userId` or `handle` | One person: name, handle, bio, follower count, verified, `extra` (location, following, posts, premium and so on) and the avatar as a data URI. Drawn as a person card with no code. A person with no stored profile is refused with `identityProfileMissing` |

```json
{ "title": "Who is this", "data": { "person": { "source": "identityProfile", "platform": "twitter", "handle": "fakeBird" } } }
```

Profiles are kept when a session check or `twitterFollowers` sees them; nothing fetches a profile just to draw it.

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

- **Imports:** only from `"log"` and `"react"`, at the top. `import()` is refused with `viewImportRefused`. End with `export default function App({ data, title, subtitle })`.
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
  - `Avatar { name, size, src }`, `src` a `data:image/` URI such as a profile's `avatar`
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

- Interaction, from Lynx:
  - Pages: `Routes` with `Link` and `BackLink` (`useRoute` gives the path), so a table can open a page per person.
  - Asking: `AskButton { prompt }` and `FollowUps { prompts }` put a question into the chat, and `askAgent(text)` does it from code. End an overview with 2 or 3 follow-ups.
  - Pointing: `Pointable { about }` and `tellAgent(text)` tell the agent what the person is looking at without sending a message.
  - Forms: `Button`, `Input`, `Select`, `Textarea`, `Field`, `Modal` and `useAction(fn)`.
  - Also `Markdown`, `FullscreenButton`, `downloadCsv(name, rows)` and `openExternal(url)`. `ErrorNote` offers "Ask the agent to fix it".
  - A view never sends anything itself: an ask goes through the chat, where every send gate still applies.

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
- **Data:** the sources are one registry, `REPORT_SOURCES` in `src/mcp/apps/report/helpers/sources.ts`. A new source is one entry there: its input schema, its reader, its starter and its text.
- **What the page loads:** the page is self-contained, with React, the kit and Geist inlined, so it loads nothing from the internet.

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 134.** Existing workspace log.db is the native private record/coordination foundation.
- **Rule 154.** Show people/chats by meaningful names and handles; keep routing ids internal unless needed for the specific technical artifact.
- **Rule 160.** Answer eligible chat reads from log.db when the owner is live, caught up and the needed history is present/backfilled.
