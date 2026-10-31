# REA and the Facebook web client

REA (`rea-agents`) is an open-source reverse-engineering tool that reads a program and returns evidence about what it does. This folder records how log decided to use it on Facebook's web client, the Marketplace create page that log's browser already loads, without letting REA touch a live account. The answer: save the page's scripts and a network recording (HAR) from a normal gated run, and let REA read those files offline. Read this if you want to know why log reads recordings with REA rather than attaching it to a browser.

This research was written on 2026-10-18 with `rea-agents` 6.7.0 installed globally. It changed no Marketplace code.

## What REA is for here

REA isn't a search command for log, and it isn't pointed at log's own code. It's pointed at the Facebook web client: the Marketplace create page and the scripts and responses that page itself fetches.

The aim is to compare three things:

- how log and two earlier projects drive that page;
- the identity-leak study in `docs/identityLeaks/` (what a page can observe about the machine, the proxy and the account);
- what the client actually does, once REA can read a saved copy of it.

The way log posts doesn't change: a visible Camoufox window, the account's proxy, one device, the pinned locale, and `log facebook publish`. REA doesn't open Facebook and doesn't replace that path.

## The pages

| Page | What it decides |
| --- | --- |
| [The spec](spec.md) | The question: REA on log's Playwright Camoufox session, humanize, and the 22 identity-leak surfaces |
| [The Facebook client](facebookClient.md) | The three drivers, and the only way REA can see the client |
| [Comparison](comparison.md) | What's already built, what REA adds, and what it must not do |
| [Public examples](publicExamples.md) | Public REA investigations since 14 April 2026 |
| [Research reports](parallel/meta.md) | The three research reports, stored as returned |
| [The ranking](matrix/README.md) | SubQ's ranking of the options. Winner: a HAR plus the scripts, read by REA offline |
| [Roadmap](roadmap.md) | The order of work, and what's blocked |
| [Sources](sources.md) | The GitHub, local, research and SubQ evidence |

Related studies stay where they are:

- How a listing is posted: [How a Marketplace listing gets posted](../listingPublish/README.md)
- What can leak the machine or link accounts: `docs/identityLeaks/`
- Proxy, device and hours: [proxies](../proxies.md), [accounts and listings](../accountsAndListings.md)
- Where to host later: `docs/deviceIsolation/`, `docs/scaleArchitecture/`

## The decision

Research found no verified public REA investigation of a Meta product. SubQ, given those reports, ranked eight ways to connect REA to this session. The winner is **a HAR plus the page's scripts, read offline by the standard REA CLI**. Forking REA, exposing the Chrome DevTools Protocol (CDP) from Camoufox, and switching the Facebook window to Chrome all lost. The numbers are in [the ranking](matrix/README.md).

## What to do

1. **Don't attach REA to the live Camoufox window.**
2. **Keep `humanize` at `1.5`** in `python/browser/visibleBrowser.py`. Upstream also allows `True`, but a comment in this build says a boolean hangs `mouse.move`. The ranking didn't justify a change.
3. **Prove a HAR works before using a real account.** Check one fixture HAR with `rea inspect-web-network-capture` first; that compatibility claim was the weakest one (p 0.62). This study planned to strip cookies before writing a HAR. log later chose to keep HARs raw for analysis, only in the local run folder, and never commit them.
4. **Diff saved scripts against [the create form](../listingPublish/formFill.md).** Change a selector only when the saved client shows the current one is wrong.

## Setup notes

- `rea-agents` 6.7.0 is installed globally (`rea --version` prints `6.7.0`). It isn't a dependency of log, and `rea setup` wasn't run.
- npm skipped `frida`'s install script (`allow-scripts`). That only blocks native instrumentation; HAR and static JavaScript inspection don't need Frida.
