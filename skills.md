# skills

How work is done in log-cli. Each skill is `skills/<camelCaseName>/SKILL.md`,
in the same layout as the workspace's twitter-controller skill (frontmatter,
hard boundaries, environment, commands). When a routine changes, update its
skill in the same commit.

| Skill | Use it to |
| --- | --- |
| [`logCli`](skills/logCli/SKILL.md) | Run the CLI: seed data, live Camoufox checks, the XState monitor |
| [`commitLog`](skills/commitLog/SKILL.md) | Write the `log.md` entry every commit needs, from the AST summary the hook generates |
| [`captureRule`](skills/captureRule/SKILL.md) | Turn a rule from matt into a hard line in `AGENTS.md`, plus its check |
| [`reaCapture`](skills/reaCapture/SKILL.md) | Capture live publish runs as a raw HAR, read them with `rea`, and score client design changes with SubQ |
| [`accountToDryRun`](skills/accountToDryRun/SKILL.md) | Take one account from NEEDSLOGIN to ACTIVE and run a full publish dry run, all through the `log` MCP tools |
| [`conversations`](skills/conversations/SKILL.md) | Buyers' Marketplace conversations in Twenty (rule 34): list, show, record a scanned thread, mark read, set the lead, link the listing |
| [`humanMouse`](skills/humanMouse/SKILL.md) | Make the cursor move like matt's hand (rule 32): record his mouse, fit `humanMouse.py`, measure ours with the same analyser |
| [`inspect`](skills/inspect/SKILL.md) | Look at a Facebook page step by step in one gated Camoufox before writing code for it (rule 29): snapshot refs, screenshot, HAR and rea per step |
| [`flow`](skills/flow/SKILL.md) | Turn an inspect recording into a flow: docs, an XState machine, a `log flow run` command and an MCP tool, then run it on any account (rule 31) |
| [`profileSetup`](skills/profileSetup/SKILL.md) | Give an account its profile picture and cover photo (`log profile setup`, rule 28): dry run, read the page's controls, then `--live` |

These three files stay in step:

- **`log.md`** says what happened, commit by commit, starting from an AST of the code.
- **`AGENTS.md`** holds the hard rules matt has set.
- **`skills/`** holds the routines that follow those rules.
