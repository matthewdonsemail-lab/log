# How log works

log runs social accounts from the terminal or from an AI agent. Every account
lives in one place, every action goes through the platform's own API or the
account's own browser, and the platform's answers decide whether a step worked.
Read this page first if you want to know how log thinks before you read the
code.

## The big idea: the platform's answer decides

When log does something (a click, a search, a post), the platform's own client
makes internal API calls. log records them and reads them. Those answers decide
what happened, never the screen, a timer, or the fact that a step ran. What we
sent matters as much as what came back: one search sent coordinates that placed
the account in the wrong city, and only the request showed it.

## When a step lands somewhere new

log already knows most of the states a platform can be in. When a step lands
somewhere it doesn't know, it follows the same seven steps:

1. **Read the internal API.** Code pulls each step's calls out of its
   recording: what we sent, what came back, and how many seconds after our
   action (`exchanges.json`, `exchanges.md`).
2. **Put everything about that moment together.** The goal, the account (home,
   platform, browser, the proxy's exit), what we did (the action, the mouse,
   how long it took), every internal call, the page, the screenshot and the
   earlier steps.
3. **Ask SubQ what it means.** Not what to do next, but: was the goal met, does
   everything fit the account, should something never have come up, does the
   page agree with the API, did our action cause it, and what does each call
   say about the goal.
4. **Say it loudly.** The reading comes first in the step's result
   (`>>> UNKNOWN STATE`), and a hook puts it into the agent's context.
5. **Keep going until the goal is reached.** A Stop hook holds the agent's turn
   until a step's reading says the goal is met.
6. **Write down what went wrong as P.E.E.** Point (the issue, in one sentence),
   Evidence (quoted from the step's reading), Explain (why it shows that, and
   what caused it). Once the goal is reached, add how it was fixed.
7. **Name the state,** so next time it is known and nobody has to work it out
   again.

It works the same on every platform. In practice:

```bash
log inspect start --account <a> --goal "Set the Marketplace location to Galway, Ireland" --detach
log inspect do <action>                                  # reads the step; >>> UNKNOWN STATE when we don't know
log inspect finding --account <a> --step <step> --point "<the issue>" --explain "<why, and what caused it>"
log inspect finding --account <a> --fixes 1 --fix "<how it was fixed>"
log inspect goal --account <a>                           # the goal, whether it is reached, every finding
```

## Where accounts live

Accounts live in [Twenty](twenty.md) as `socialAccounts`: one row per account,
with its platform, session and proxy. Marketplace listings are
`agencyListings`. log reads the row before a run and writes the result back
after it. A single user can keep accounts in a local file instead.

## Platforms

log is **platform-agnostic**. Each platform has its own engine:

- **Facebook:** Marketplace listings (publish, check, campaigns) and groups
  (join, read, poll, members). It uses Facebook's direct API first (fbk,
  `vendor/fbk`) and the account's browser behind it, always through a proxy in
  the account's home country.
- **X:** session checks, follows, replies, quotes, likes, DMs and a reply
  queue. Direct API only (twikit, `vendor/twikit`): no proxy and no browser.
- **Reddit:** the session check on its direct API (rdvwr, `vendor/rdvwr`), and
  `log inspect` in the account's browser with no proxy.

A command that acts on one platform names it first: `log facebook publish`,
`log twitter reply`, `log reddit session check`. A new platform is one
command, `log new platform <name>`. Every platform's internal calls are read
with rea (their code as well as their network) and documented under
`docs/platforms/<platform>/`.

The current list of platforms, and which commands run where, is in
[the reference](reference.md#the-platforms), generated from the code.

## Browsers

log is **browser-agnostic** too. Each account's browser is a driver chosen in
Twenty: AdsPower first (one profile per account), Camoufox kept, and more to
come, each one more driver (`src/browser/<name>`). Every driver opens through
the same gates:

- the proxy the platform needs;
- the launch self-check;
- a raw recording (HAR) of every request;
- one human-like mouse.

Details: [Browsers](browsers.md) and
[the browser layer](reference.md#the-browser-layer).

## How the CLI is built

- A command registry that generates its own usage.
- Commands return results instead of printing them, so they are easy to test.
- A [Clack](https://github.com/bombshell-dev/clack) guided menu (`log launch`)
  on top of the scriptable commands.

The rules behind all of this are in AGENTS.md.
