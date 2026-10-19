---
name: commitLog
description: Write the log.md entry every log-cli commit needs. On commit, the pre-commit hook parses the staged code into an abstract syntax tree (AST), writes which declarations and tests were added, changed or removed into a template entry, and feeds that back to the agent. The agent then writes What changed, Why and Checked from the AST before the commit can go through.
---

# commitLog

`log.md` is the running record of the repo, one entry per commit, newest at
the bottom. lefthook's pre-commit (`lefthook.yml`) runs `scripts/commitLog.mjs`, which uses
`scripts/astSummary.mjs`:

- `.ts` / `.mjs` files are parsed with the TypeScript compiler API.
- `.py` files are parsed with Python's own `ast` module.
- For each file it compares the syntax tree before and after the change and
  lists what was added, changed or removed: top-level functions, classes,
  interfaces, types, enums, consts, re-exports, and test titles in
  `*.test.ts`. Formatting-only edits don't count as changes.

## Hard boundaries

1. **Every commit gets an entry.** No `--no-verify`, ever.
2. **Never edit the AST block.** The tool writes it. If it looks wrong, fix
   `scripts/astSummary.mjs`, not the entry. The hook rejects a block that
   doesn't match the staged code, and rewrites it.
3. **Never edit old entries.** Only add.
4. **Write the three fields from the AST,** in plain words, naming the real
   behaviour, commands and results. No `<fill in>` left.

## The routine

```bash
GIT_CONFIG_COUNT=0 git add <files>
GIT_CONFIG_COUNT=0 git commit -m "..."
# 1st try: the hook prints the AST of the staged change, appends the entry
#          to log.md, and stops the commit
# write What changed / Why / Checked under the AST block
GIT_CONFIG_COUNT=0 git add log.md
GIT_CONFIG_COUNT=0 git commit -m "..."
# 2nd try: the hook re-parses the staged code; if it matches the block and the
#          fields are written, the commit goes through
```

If you change code after the entry was written, the hook updates the AST
block in place and stops once more. Re-read your What changed line, re-stage
log.md, commit again.

To see the AST for any commit: `node scripts/astSummary.mjs <commit>`. With
no argument it shows the staged change.

## The entry

```markdown
## 2026-10-18 05:40Z · feat/branchName

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `src/camofox/worker/helpers/fromCamofoxStatus.ts`: added function fromCamofoxStatus
- `src/cli/live/index.ts`: added const connectCommand · removed const loginCommand

What changed: <fill in>
Why: <fill in>
Checked: <fill in>
```

- **What changed**: the behaviour behind the AST lines. Example: "`log connect`
  replaces `log login` for Facebook sessions", not "edited index.ts".
- **Why**: the request or bug behind it. Quote matt's ask when there is one.
- **Checked**: the exact command and its result (`bun run check`: 62 pass),
  plus any real run. Say what you didn't check.

If the commit also adds a rule from matt, `skills/captureRule/SKILL.md`
applies too.
