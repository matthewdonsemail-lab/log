# How log decides what happened

The number one rule of log-cli, above everything below. We already know most
of the states a platform can be in. When a step lands somewhere we don't know:

1. **Read the internal API.** Every step's internal API calls are taken out
   of its recording by code: what we sent and what came back, in seconds from
   our action (`exchanges.json`, `exchanges.md`). The answers decide, never the
   screen, a timer, or the fact that a step ran. What we sent counts as much
   as the answer (`viewer_coordinates` placed Bethlehem's search in Lima).
2. **Collate everything about that moment.** The goal, the account (home,
   platform, browser, the proxy's exit), what we did (the action, the mouse,
   how long it took), every internal API call, the page, the screenshot and
   the earlier steps, together, never in silos.
3. **Ask SubQ what it means.** Not what to do next: was the goal met, does
   everything fit the account, should something never have come up, does the
   page agree with the API, did our action cause it, and what each call says
   about the goal.
4. **Say it loudly.** The reading comes first in the step's result
   (`>>> UNKNOWN STATE`) and goes into the agent's context through the hook.
5. **Keep going until the goal is reached.** The Stop hook holds the turn
   until a step's reading says the goal is met.
6. **Write what went wrong as P.E.E.** Point (the issue, one sentence),
   Evidence (quoted from the step's reading), Explain (why it shows it, what
   caused it), and, once the goal is reached, how it was fixed
   (`log inspect finding`, `goalFindings.md`).
7. **Name the state,** so next time it is known and nobody has to find it
   out again.

The same on every platform. In practice:

```bash
log inspect start --account <a> --goal "Set the Marketplace location to Bethlehem, Pennsylvania" --detach
log inspect do <action>                                  # reads the step; >>> UNKNOWN STATE when we don't know
log inspect finding --account <a> --step <step> --point "<the issue>" --explain "<why, and what caused it>"
log inspect finding --account <a> --fixes 1 --fix "<how it was fixed>"
log inspect goal --account <a>                           # the goal, whether it is reached, every finding
```

AGENTS.md rules 73-76.

The command line for ListeningKit's social accounts, on every platform they
live on. Accounts live in Twenty as `socialAccounts` (one row per account, its
platform, session and proxy), Marketplace listings as `agencyListings`, reached
through the same generated GraphQL client blaster and the dialer use. Every
result is written back to Twenty.

log-cli is **platform-agnostic**. Three platforms so far:

- **Facebook:** Marketplace listings (publish, check, campaigns) and groups
  (join, read, poll, members), on its direct API (fbk, `vendor/fbk`) first and
  the account's browser behind it, always through a proxy in the account's
  home country (rule 12).
- **X:** session checks, follows, replies, quotes, likes, DMs and a reply
  queue, on its direct API only (twikit, `vendor/twikit`), with no proxy and no
  browser (rule 80).
- **Reddit:** the session check on its direct API (rdvwr, `vendor/rdvwr`), and
  `log inspect` in the account's browser with no proxy (rule 84).

A command that acts on one platform names it first (`log facebook publish`,
`log twitter reply`, `log reddit session check`, rule 63). A new platform is
one command, `log new platform <name>` (rule 83). Every platform's internal
calls go through rea, their code as well as their network (rule 85), into
`docs/platforms/<platform>/`.

log-cli is **browser-agnostic** too. Each account's browser is a driver picked
from Twenty: **AdsPower** first (one profile per account, Listaro's browser),
Camoufox kept, and more browser providers to come, each one more driver
(`src/browser/<name>`). Every driver opens through the same gates: the proxy
the platform needs (rules 12, 84), the launch self-check (rule 17), a raw HAR
of everything (rule 22), and one human mouse (rule 32). Which platform runs
where, and which commands run on the account's browser, is in
[The platforms](#the-platforms) and [The browser layer](#the-browser-layer)
below, generated from the code.

Built the same way as the Rank CLI from the Nebius hackathon: a command registry
that generates its own usage, commands that return results rather than
printing, and a [Clack](https://github.com/bombshell-dev/clack) guided menu
(`log launch`) on top of the scriptable commands.
