# logCatalog

Finding and running any log command with three tools: logSearch by what you want done, logGet for its inputs and a call that works, logCall to run it.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## The work, step by step: logCatalog

From `skills/logCatalog/SKILL.md`.

## logCatalog

Three tools reach every log command: find it by the job, read it, run it.

### 1. Find it: `logSearch`

Say what you want done, in plain words. A platform name narrows it.

```
logSearch { "query": "send a dm on x" }
```

```
query: send a dm on x
verdict: strong
results[8]{id,summary,acts}:
  twitter.dm,"Send one approved direct message on X, …",live
  twitter.dms,"Read an X account's direct messages, …",no
  …
help[1]:
  - logGet {"id":"twitter.dm"}   (its inputs and a call that works)
```

- **verdict:** `strong` means the first result does every word. `closest` means none does all of it, and these do most of it. `none` means nothing fits: the near misses show which words they missed. Say the job differently, or with fewer words.
- **acts:**
  - `no` only reads.
  - `live` has a live run that acts on the platform.
  - `write`, `browser` or `delete` change local data, Twenty or the account's browser.
  - `terminal` is a prompt matt runs in a terminal, never over MCP.

### 2. Read it: `logGet`

```
logGet { "id": "twitter.dm" }
```

It answers:

- **inputs**, required first, each with its type and a note;
- **call**, a `logCall` line that works, and **live**, the same as a live run, when the command has one;
- **cli**, the same command in a terminal;
- **guide**, the command's guide, to load before first using it;
- **rules**, the AGENTS.md rules the command falls under.

A wrong id gets `didYouMean`.

### 3. Run it: `logCall`

```
logCall { "id": "twitter.dm", "inputs": { "account": "yourAccount", "userId": "12345", "text": "hello" } }
```

- It runs the command through its own tool, so every check still applies: the voice gate, the play, claims, the governor and jobs.
- An unknown input is refused by name, with the inputs it takes. Nothing runs.
- `live: true` runs the live form. It needs `confirmLive: true`, and only when matt asked for this live run (rules 8, 10).
- `confirmBypass: true` is only for a run outside the account's hours that matt asked for (rule 20).
- A long run comes back as a job after `waitMs`. Follow it with `jobStatus`, and watch `tail -f ~/.logCli/mcp/<day>.log` while it runs (rule 26).

### Ids

An id is `<platform>.<command>.<form words>`: `twitter.dm`, `twitter.queue.build`, `facebook.read.members`, `discord.session.check`. A command for any platform has no platform: `localAccount.add`, `search`, `inbox.claim`.

Each command's own tool, such as `twitterDm` or `twitterDmLive`, still works. `logCall` reaches the same tools.
