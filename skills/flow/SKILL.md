---
name: flow
description: Turn a `log inspect` recording into a flow (rule 31) - a definition built from the recording, its documentation, an XState machine, the `log flow run` command and an MCP tool of its own - and run it on any account. Use after recording a procedure with inspect, when matt says "make it a state machine", "run it on another account", "register it as an MCP", or to run a saved flow such as profileSetup.
---

# flow

Record once, then run anywhere: recording → definition → docs → machine →
command → MCP tool.

## Hard boundaries

1. **Built from a recording, never by hand** (rules 25, 29). Each step's
   element is the role and accessible name the recorded snapshot gave it;
   each step's confirming request is the mutation the recorded step sent.
   A confirming request only proves the call happened. **What it answered
   decides the step** (rule 73): a step's `answers` name the call and what its
   answer must say (a value, what we sent, present, the account's home city,
   country or id), with the error code it raises, written from the request's
   doc ("What it sent and what came back"). `marketplaceListingPublish` checks
   `buy_location`, the set-location answer's city, the create page's
   `marketplace_new_seller_can_post_item` and `sell_location` (so it stops
   before the form when the account may not post), and the listing id in the
   create answer (`noListingId`). `profileSetup`'s three saves check their
   mutations answered 2xx (no saved answers to read fields from yet). Every
   other step with a confirming request checks the field its request doc says
   it answers (`deletePost`: `move_to_trash_story.success` true; `postComment`:
   `comment_create.feedback_comment_edge`; the posts: `story_create.story_id`),
   and a test refuses a flow step that waits on a call without checking its
   answer. A streamed answer is read from its first part. The flow's doc shows
   every check, and recording the flow again keeps them.
2. **Dry run unless `--live`** (rule 8); over MCP, live is its own tool, `flow<Name>Live`, with confirmLive.
3. **Every gate** (rules 11-12, 15-18, 22, 24): a run is one launch through
   the inspect session, so every step is recorded again (snapshot,
   screenshot, HAR, rea) and mapped.
4. **No credential in a step or param** (rule 21): sign-in is `signIn`/`code`,
   which read the private login.json; typed values are redacted in snapshots.
5. Run it live (rule 26): Monitor; every machine state prints.

## The routine

```bash
# 1. record (skills/inspect)
bun bin/log.ts inspect start --account <a> --url https://www.facebook.com/me --bypass --now
bun bin/log.ts inspect do click <ref> --live ...   # one step at a time
bun bin/log.ts inspect do stop

# 2. recording → definition + docs (params renamed from text1/file1)
bun bin/log.ts flow fromInspect ~/.logCli/runs/inspect/<run> --name profileSetup \
  --rename text1=firstName --rename text2=lastName --rename file1=profilePhoto --rename file2=coverPhoto

# 3. run it on another account (dry run first: lists the filled steps, opens nothing)
bun bin/log.ts flow run profileSetup --account <a> --set firstName=Bethlehem --set lastName=Trash \
  --set profilePhoto=<path|url> --set coverPhoto=<path|url>
bun bin/log.ts flow run profileSetup --account <a> ... --live --bypass --now
```

Over MCP the same run is the tool `flowProfileSetup` with `account`, the
params by name; its live twin `flow<Name>Live` runs it on Facebook with `confirmLive: true`.

A failed step ends the run (`failedAt`): read that step's folder in the new
recording (rule 25), re-record the changed part with inspect, rebuild the flow.
Rebuild the request docs after a run (rule 27): `capture --docs`.

## Saved flows

| Flow | Recorded | Does |
| --- | --- | --- |
| `profileSetup` | Lancaster, 2026-10-19 | Profile picture, cover photo, name (13 steps) |
