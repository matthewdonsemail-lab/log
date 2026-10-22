---
name: inspect
description: Look at a Facebook page step by step in one gated Camoufox before writing code for it (rule 29). `log inspect start` opens the account's headed browser; `log inspect do` runs one action at a time and records each step's accessibility snapshot (refs), screenshot, HAR and rea reading as it happens. Use before writing or fixing any click/selector code, when a run hits a page nobody has looked at, or when matt says "look at the page", "introspect", "what is on there".
---

# inspect

The order is: open the page, look at it, then write the code (rules 25, 29).
This is camofox-mcp's model (https://github.com/redf0x1/camofox-mcp:
accessibility snapshots with element refs) on log-cli's own launch. camofox-mcp
itself can't be used here: its browser server is headless-only on Windows
(rule 11) and launches outside the proxy gate (rule 12).

## Hard boundaries

1. **One launch, every gate** (rules 11-12, 15-18, 22, 24): headed, proxy in
   country, the account's device and locale, the self-check, the raw HAR, the
   launch budget. `--bypass` only for matt's runs outside waking hours.
2. **Read-only unless matt asked** (rule 8): `goto`, `snapshot`, `back`,
   `wait` read; `click`, `type`, `press` act on Facebook and need `--live`
   (over MCP, `inspectDoLive` with confirmLive).
3. **Live** (rule 26): run `start` through Monitor; every step prints as it
   happens.
4. One session at a time (`~/.logCli/runs/inspect/current.json`).

## The routine

```bash
# terminal 1 (or Monitor): the browser stays open until `do stop` or 30 idle minutes
bun bin/log.ts inspect start --account <a> --url https://www.facebook.com/me 2>&1 | tee <log>

# terminal 2: one step at a time
bun bin/log.ts inspect do snapshot
bun bin/log.ts inspect do goto https://www.facebook.com/me
bun bin/log.ts inspect do click e12 --live        # only when matt asked
bun bin/log.ts inspect do stop
```

Each `do` prints where the page is, the requests the step made to Facebook
(GraphQL by name, redirects with their target), rea's Evidence ID, and the
page's elements with their refs. Everything is kept in order in
`~/.logCli/runs/inspect/<time>_<a>/steps/NN_<action>/`: `snapshot.yml`,
`screenshot.png`, `network.har`, `rea.json`.

Then write the code from it: the selectors and the order of clicks come from
`snapshot.yml`, the waits from what `network.har` shows the page asking for.
Rebuild the Facebook client docs after (rule 27): `capture --docs`.
