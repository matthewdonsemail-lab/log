---
name: report
description: Generative UI. Build the person a view in the chat with the MCP tool report. You write a small React view against log's kit, and log draws it with data from log.db. Plain and readable, in the spirit of Lynx workspaces. Use when the person says "make a report", "show me", "chart of", "dashboard of", "who has been messaging me", "tell me about this person", or would rather see something than read it.
---

# report

`report` is log's generative UI. You decide what the person should see and write it as a small React view. log compiles it and draws it in the chat, with the data read from log.db in the same call.

- **Where it draws:** an MCP Apps host (Claude, ChatGPT, Cursor) draws the view inline. Other hosts (Claude Code, Codex) get the same view rendered as text, which you show as it is.
- **Why it looks the way it does:** the kit follows [Lynx](https://github.com/yakkomajuri/lynx)'s workspace kit (MIT): a quiet canvas, plain blocks, big light numbers, and Geist. It gives a general starting point that informs; the content is what makes it good.

## One call, no code

```json
{ "title": "Who's been messaging you on X", "subtitle": "last 30 days", "data": { "dms": { "source": "twitterDmsBySender", "since": "30d" } } }
```

This draws the starter view, which shows:
- headline stats, each with a line of what it means (top 10 share, new this week, busiest day)
- messages per day
- who messages most
- a table of people with their 30-day activity, when they last wrote and what they said

log.db holds only what has been read. If the inbox may be behind, read it with `twitterDms` first (rule 160).

## Your own view

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

- Interaction, from Lynx:
  - Pages: `Routes` with `Link` and `BackLink` (`useRoute` gives the path), so a table can open a page per person.
  - Asking: `AskButton { prompt }` and `FollowUps { prompts }` put a question into the chat, and `askAgent(text)` does it from code. End an overview with 2 or 3 follow-ups.
  - Pointing: `Pointable { about }` and `tellAgent(text)` tell the agent what the person is looking at without sending a message.
  - Forms: `Button`, `Input`, `Select`, `Textarea`, `Field`, `Modal` and `useAction(fn)`.
  - Also `Markdown`, `FullscreenButton`, `downloadCsv(name, rows)` and `openExternal(url)`. `ErrorNote` offers "Ask the agent to fix it".
  - A view never sends anything itself: an ask goes through the chat, where every send gate still applies.

A view that doesn't compile, imports from anywhere else, or breaks while drawing is refused with `reportFieldInvalid`, with the line or error to fix.

The older `blocks` list (`heading`, `text`, `stat`, `barChart`, `lineChart`, `table`, `personList`, `callout`) still works and is drawn with the same kit.

## After it is drawn

In an MCP Apps host the person already sees the view, so say what it means in a sentence or two, not the numbers again.

## How it is built

- **Code:** `src/mcp/apps/report/view` holds:
  - the kit (`kit.tsx`, `kit.css`)
  - the widget that runs the view in the chat (`widget.tsx`)
  - the server side that compiles with sucrase and renders the text version (`server.tsx`)
  - the starter views (`starters/`)
- **What the page loads:** the page is self-contained, with React, the kit and Geist inlined, so it loads nothing from the internet.
