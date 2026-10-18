# skills

How work is done in log-cli. Each skill is `skills/<camelCaseName>/SKILL.md`,
in the same layout as the workspace's twitter-controller skill (frontmatter,
hard boundaries, environment, commands). When a routine changes, update its
skill in the same commit.

| Skill | Use it to |
| --- | --- |
| [`logCli`](skills/logCli/SKILL.md) | Run the CLI: seed data, live Camoufox checks, the XState monitor |
| [`commitLog`](skills/commitLog/SKILL.md) | Write the `log.md` entry every commit needs (the `AST:` lines) |
| [`captureRule`](skills/captureRule/SKILL.md) | Turn a rule from matt into a hard line in `AGENTS.md`, plus its check |

These three files stay in step:

- **`log.md`** says what happened, commit by commit.
- **`AGENTS.md`** holds the hard rules matt has set.
- **`skills/`** holds the routines that follow those rules.
