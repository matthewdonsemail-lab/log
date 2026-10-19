---
name: lifecycle
description: The account lifecycle (rule 35): one XState machine per Facebook account from import to its host, the browser opened once per local day and kept open, onboarding (proxy, sign-in, checks, profile, name, location, a day of Listaro's warm-up) and host (watching, acting, overnight). Use when matt asks where an account is, what it has left, what happens on a checkpoint or restriction, or to change the lifecycle.
---

# lifecycle

## Hard boundaries

1. **The browser stays open.** One open per account per local day (plus one
   crash reopen); every action is a step or a tab inside it; every close has a
   logged reason (top of AGENTS.md, rule 35). Never add a command that opens a
   browser of its own.
2. **The machine is the spec.** Change the lifecycle in
   `src/marketplace/lifecycle/machine.ts` and its tests, then regenerate the
   doc: `log lifecycle states --write`. Never hand-edit the generated tree.
3. **Final is final.** Restricted, banned, lost: the record stays in Twenty
   (rule 13); nothing resumes them.
4. **Live only with matt's go.** Warm-up likes, publish and replies need
   `liveActions` (rule 8).

## The routine

```bash
log lifecycle                       # where every account is, and what it has left
log lifecycle --account <name>      # one, with its standing
log lifecycle states                # the state tree from the machine itself
```

A field the lifecycle reads is added through `scripts/twentySetup.mjs` and the
client regenerated (rules 13-14). A fact it reads from a past run (a rename, a
location) is backfilled only from that run's recording (rule 25), never guessed.

Full description: `docs/lifecycle.md`.
