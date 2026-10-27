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
| [`listingCopy`](skills/listingCopy/SKILL.md) | Write a listing's title, description and photos by the copy rules, each with a good and a bad version, from research on high-response classified and service ads (`docs/listingMedia.md` for how photos reach Facebook) |
| [`listingCreative`](skills/listingCreative/SKILL.md) | Make a listing's photos as scene, action, before and after in the winners' composition, generate each frame once, and show them in the iPhone Photos viewer with the town and red face scribbles (`python/creative`) |
| [`personaPicture`](skills/personaPicture/SKILL.md) | Draw random adult personas from the warm-up datasets into `media/personas/personas.jsonl`, generate each one's low-angle selfie profile picture through treg, and regenerate until SubQ says it matches the persona (`src/media/persona`) |
| [`nicheCreativeResearch`](skills/nicheCreativeResearch/SKILL.md) | Take a new niche, industry or offer from operator research and winning listings to SubQ's definition of a winner, a rubric, spin-outs of matt's concept, generated frames and phone media, the way junk removal was done |
| [`conversations`](skills/conversations/SKILL.md) | Buyers' Marketplace conversations in Twenty (rule 34): list, show, record a scanned thread, mark read, set the lead, link the listing |
| [`host`](skills/host/SKILL.md) | Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); `log facebook preflight` first (rule 79) |
| [`lifecycle`](skills/lifecycle/SKILL.md) | The account lifecycle (rule 35): one machine per account, the browser kept open, onboarding with a day's warm-up, then its host |
| [`runs`](skills/runs/SKILL.md) | List the recorded runs and prune the ones rea settled and the request docs hold, keeping findings and domains; the storage hook (rule 66) |
| [`warmup`](skills/warmup/SKILL.md) | Record the five warm-up activities headed, turn them into flows, run them in one open browser with an activity feed (rule 36) |
| [`humanMouse`](skills/humanMouse/SKILL.md) | Make the cursor move like matt's hand (rule 32): record his mouse, fit `humanMouse.py`, measure ours with the same analyser |
| [`inspect`](skills/inspect/SKILL.md) | Look at a Facebook page step by step in one gated Camoufox before writing code for it (rule 29): snapshot refs, screenshot, HAR and rea per step |
| [`flow`](skills/flow/SKILL.md) | Turn an inspect recording into a flow: docs, an XState machine, a `log flow run` command and an MCP tool, then run it on any account (rule 31) |
| [`adsPower`](skills/adsPower/SKILL.md) | Give every Twenty account its AdsPower profile (`log adsPower sync`), check the Local API, add a browser driver (rule 42) |
| [`profileSetup`](skills/profileSetup/SKILL.md) | Give an account its profile picture and cover photo (`log facebook profile setup`, rule 28): dry run, read the page's controls, then `--live` |
| [`agentHooks`](skills/agentHooks/SKILL.md) | Keep the CLI, MCP tools, agent hooks (Claude Code, Codex) and the live log in step (rule 55): add a hook, a command or a page state |
| [`surfaceDocs`](skills/surfaceDocs/SKILL.md) | Keep the README command table (flags, MCP tool, hooks) and the Mermaid `.mmd` diagrams generated from the code (rule 56) |
| [`layout`](skills/layout/SKILL.md) | Where a new file goes: every file in a domain folder, never loose in `python/` or `scripts/` (rule 58) |
| [`knowledgeBase`](skills/knowledgeBase/SKILL.md) | Search the knowledge base before guessing, save what a session learned, and refresh it from every source (rule 90) |

These three files stay in step:

- **`log.md`** says what happened, commit by commit, starting from an AST of the code.
- **`AGENTS.md`** holds the hard rules matt has set.
- **`skills/`** holds the routines that follow those rules.
