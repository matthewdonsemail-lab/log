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
| [2026-11-03](log/2026-11-03.md) | 18 |
| [2026-11-02](log/2026-11-02.md) | 20 |
| [2026-11-01](log/2026-11-01.md) | 25 |
| [2026-10-31](log/2026-10-31.md) | 18 |
| [2026-10-30](log/2026-10-30.md) | 21 |
| [2026-10-29](log/2026-10-29.md) | 5 |
| [2026-10-28](log/2026-10-28.md) | 19 |
| [2026-10-27](log/2026-10-27.md) | 5 |
| [2026-10-26](log/2026-10-26.md) | 18 |
| [2026-10-25](log/2026-10-25.md) | 31 |
| [2026-10-24](log/2026-10-24.md) | 17 |
| [2026-10-23](log/2026-10-23.md) | 29 |
| [2026-10-22](log/2026-10-22.md) | 20 |
| [2026-10-20](log/2026-10-20.md) | 21 |
| [2026-10-19](log/2026-10-19.md) | 25 |
| [2026-10-18](log/2026-10-18.md) | 30 |
