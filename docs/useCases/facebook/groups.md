# Listening to local Facebook groups

The same accounts can join the local groups in their town and hear when someone asks for what the business sells ("anyone know someone who can take away an old sofa?"). This page shows the parts.

```mermaid
flowchart LR
  join["1. join the group<br/>log facebook join group"] --> poll["2. poll it every 5 min<br/>log facebook poll"]
  poll --> magpie["3. OpenMagpie keeps every post<br/>and picks the matches"]
  magpie --> twenty["4. matches land in<br/>Twenty socialListening"]
```

## A real example

Bethlehem asked to join Northeast Bethlehem Neighbors, and a read of a local group brought back 13 posts with their comments. Plymouth reads groups without opening a browser at all: the direct-API engine (fbk) reads the feed with its saved session.

## The commands

| Step | Command | MCP tool | What decides it |
| --- | --- | --- | --- |
| Join | `log facebook join group --account <a> --group <url or id> [--live]` | `join`, `joinLive` | the group's own join state |
| Read | `log facebook read group --account <a> --group <id>` | `readGroup` | the feed's answer; the direct API first, the browser behind it |
| Poll | `log facebook poll <group> <account> <how long>` | `poll` | each read's answer; OpenMagpie's watch picks the matches |
| Members | `log facebook read members --account <a> --group <g> --count 40 --owners` | `readMembers` | the members list's answers, about 10 more per scroll |

`read members --owners` keeps people whose bio says owner, founder, CEO or self-employed, or who run a page. One run on Junk Removal Winners kept 15 owners out of 30 members, saved under `~/.logCli/members/`.

## Not built yet

Acting on a match (a comment or a message from the same account).

Sources: `docs/groupListening.md`, `docs/groupMembers.md`, `docs/commandNaming.md`, `log.md`.
