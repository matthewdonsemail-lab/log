---
name: commitLog
description: Write the log.md entry every log-cli commit needs. The pre-commit hook adds a template entry, and the agent fills in its AST lines (what changed, why, how it was checked) before the commit can go through.
---

# commitLog

`log.md` is the running record of the repo, one entry per commit, newest at
the bottom. The pre-commit hook (`.githooks/pre-commit` running
`scripts/commitLog.mjs`) enforces it.

## Hard boundaries

1. **Every commit gets an entry.** No `--no-verify`, ever.
2. **Never edit old entries.** Only add.
3. **`AST:` lines are yours to write**, in plain words from what you actually
   did. Name the real files, commands and results. No `<fill in>` left.

## The routine

```bash
GIT_CONFIG_COUNT=0 git add <files>
GIT_CONFIG_COUNT=0 git commit -m "..."     # 1st try: hook appends a template to log.md and stops
# edit the new entry at the bottom of log.md: fill in the three AST: lines
GIT_CONFIG_COUNT=0 git add log.md
GIT_CONFIG_COUNT=0 git commit -m "..."     # 2nd try: hook checks the entry and lets it through
```

Or write the entry first and stage `log.md` with the change, and it goes
through in one try.

## The template

```markdown
## 2026-10-18 05:40Z · feat/branchName

Files: `src/a.ts`, `src/b.ts`

AST: What changed: <fill in>
AST: Why: <fill in>
AST: Checked: <fill in>
```

- **What changed**: the behaviour, not the diff. "`log watch` stops at
  `blocked` on a checkpoint", not "edited machine.ts".
- **Why**: the request or bug behind it. Quote matt's ask when there is one.
- **Checked**: the exact command and its result (`bun run check`: 51 pass),
  plus any real run. Say what you didn't check.

If the commit also adds a rule from matt, `skills/captureRule/SKILL.md`
applies too.
