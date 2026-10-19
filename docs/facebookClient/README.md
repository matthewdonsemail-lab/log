# Facebook client

One doc per request Facebook's pages made in our runs, grouped by domain.
This is what we know about Facebook's side of every step our machines
(`marketplace/connect`, `marketplace/publish`) take, so a run that fails or
hangs is explained from its recording, not guessed at (AGENTS.md, "How we
fix problems"; rules 25 and 27).

## Why it is built this way

- **The recordings are the source.** Every run keeps a raw HAR and its
  `steps.jsonl` (rule 22). Cutting the HAR at our step times shows which of
  our actions each request followed, and how fast Facebook reacted.
- **Facebook's own code says what a request is.** Its client ships as
  `__d("Name", [deps], factory)` modules: about 23,000 across our runs. Each
  GraphQL request has a `<Name>.graphql` module (the variables it sends, the
  fields it reads), a `<Name>_facebookRelayOperation` module (its `doc_id`),
  and the modules that import it (the hook or component that fires it).
- **We parse, rea reads.** rea timed out after 10 minutes reading the
  bundles whole. So our own syntax-tree parse (TypeScript's compiler, the same
  one the commit hook uses on our code) cuts out each request's few modules,
  and rea reads that slice in about 4 seconds. rea's Evidence ID on each doc
  is the citable record of what it read; open it with the rea tools
  (`inspect_analysis_view`) to see what Facebook's code does with the
  response.
- **Docs are committed, captures are not.** Each doc holds names, ids,
  timings and statuses only. Variable values, cookies and tokens stay in the
  raw HAR on matt's machine (rule 19). Step lines are cleaned: exit IPs,
  account ids and URLs are removed.

## Domains

| Domain | What is in it |
| --- | --- |
| `login/` | Signing in, logging out, the session's first writes (timezone, web storage) |
| `checkpoint/` | Facebook stopping the account: checkpoints, "automated behaviour", scraping warnings, the support chat, blocked-user interstitials |
| `listingForm/` | The Marketplace create form: fields per category, shipping, price suggestion, Meta AI listing settings |
| `location/` | Where a listing is placed (none seen yet: the US form has no Location field) |
| `photos/` | Photo upload and what Facebook reads from the photos |
| `publishing/` | The Publish click (none yet: no `--live` run) |
| `background/` | Chat, notifications, feed, search and telemetry the page loads around our flow. Our machines ignore them; they are documented so a change in them is noticed |

The domain comes from `DOMAIN_PATTERNS` in
`src/rea/facebookClient/helpers/domainOf.ts`. A request that matters but
lands in `background/` is a gap in that table: move it there.

## Each doc

- **Facts block** (between `facts:start` and `facts:end`): written by the
  build, replaced every time. Domain, kind, `doc_id`, what it sends, what it
  reads, which Facebook modules fire it, rea's Evidence, and a table of every
  step it was seen in with status, duration, time after our step started and
  any errors.
- **What it does / What our machine does with it / What can go wrong**:
  written by a person or agent, from the facts and rea. Kept as written across
  builds. A new doc starts with `<!-- toWrite -->` in each; the push gate
  refuses a push while any remain.

## Commands

```bash
bun bin/log.ts firefoxCapture --docs          # rebuild from every run, rea reads new slices
bun bin/log.ts firefoxCapture --docs --noRea  # facts only, no rea
bun run check:facebookClientDocs              # the pre-push gate (lefthook.yml)
```

Run it live (AGENTS.md, "Always run it live"): each stage prints a line,
and rea reports `rea N/M <domain>/<request>: read in 4 s`. Slices rea has
read are cached by sha256 (`~/.logCli/rea/facebookClient/reaCache.json`),
so a rebuild only reads what changed.

`operations.json` is the index the gate reads.
