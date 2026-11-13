# log

One entry per commit, kept in one file per day (`log/<date>.md`, the day in
UTC), newest at the bottom of each day. On every commit the pre-commit hook
parses the staged code into a syntax tree and writes the AST block of the entry
(what was added, changed or removed) into the day's file. The agent then writes
What changed, Why and Checked from it. Never edit old entries. Add a new one.

Entries before the AST hook existed were rebuilt from each commit with
`node scripts/astSummary.mjs <commit>`.

| Day | Commits |
| --- | --- |
| [2026-11-13](log/2026-11-13.md) | 2 |
