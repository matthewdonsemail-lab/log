# REA and the Facebook client

Written 2026-10-18. Documentation only, plus a global install of `rea-agents`
6.7.0. No Marketplace code was changed.

The folder is `docs/rea` (camelCase, rule 1). The project under study is REA.

## What this is for

REA is not a search command for log-cli, and it is not pointed at this
repository. It is pointed at the Facebook web client that Camoufox already
loads: the Marketplace create page and the scripts and responses that page
itself fetches.

The job is to compare three things we already have:

- how log-cli, facebook-camofox-client and Listaro drive that page
- the avoidance work in `docs/identityLeaks/` (what a page can observe about
  the machine, the proxy and the account)
- what the client actually does, once REA can read a saved copy of it

The programmatic path stays the one we already run: a headed Camoufox window,
the account's proxy, one device, the pinned locale, and `log publish`. REA
does not open Facebook, and it does not replace that path.

## Read these first

| Doc | What it decides |
| --- | --- |
| [spec.md](spec.md) | The ask: REA on this Playwright Camoufox session, humanize, the 22 vectors |
| [facebookClient.md](facebookClient.md) | The three drivers, and the only way REA can see the client |
| [comparison.md](comparison.md) | What is already built, what REA adds, what it must not do |
| [publicExamples.md](publicExamples.md) | Public REA investigations since 14 April 2026 |
| [parallel/](parallel/meta.md) | The three Task reports, stored as returned |
| [matrix/README.md](matrix/README.md) | SubQ's ranking. Winner: HAR plus scripts, REA offline |
| [roadmap.md](roadmap.md) | The order of work, and what is blocked |
| [sources.md](sources.md) | The GitHub, local, Parallel and SubQ evidence |

Existing studies stay where they are. This folder does not copy them.

- How a listing is posted: `docs/listingPublish/`
- What can leak the machine or link accounts: `docs/identityLeaks/`
- Proxy, device, hours: `docs/proxies.md`, `docs/accountsAndListings.md`
- Which host to move to later: `docs/deviceIsolation/`, `docs/scaleArchitecture/`

`docs/listingPublish/README.md` still says log-cli has no publish code. That
sentence is stale. The machine is `src/marketplace/publish/machine.ts` and
`python/publishSession.py` on this branch.

## Where the work sits

| Piece | State on 2026-10-18 |
| --- | --- |
| GitHub `matthewdonsemail-lab/log-cli` | Private. `main` is `b008a58` (PR #4 merged). No open issues. |
| PR #6 | Open, mergeable, no reviews, no checks. Head `feat/publishMachine` at `b607b33`. Base is PR #5, not `main`. |
| This checkout | That branch, plus uncommitted provider-research results under `docs/providerResearch/`. |
| `rea-agents` | 6.7.0 on `PATH` (`C:\Users\0\AppData\Roaming\npm\rea.ps1`). `rea --version` printed `6.7.0`. Not a dependency of this package. `rea setup` was not run. npm skipped `frida`'s install script (`allow-scripts`). HAR and static JavaScript inspection do not need Frida. |
| Parallel deep research | Run `trun_6f9557d890fe4c5ba675c7ad9c0199e6`, processor `pro-fast`, completed. Survey is [publicExamples.md](publicExamples.md). |

`lgo-cli` is not a repository. The personal project with PR #6 is this one.

## The decision

The spec is [spec.md](spec.md). Parallel found no verified public REA
investigation of a Meta product. SubQ, over those reports, ranked eight
ways to connect REA to this session. The winner is a HAR plus the page's
scripts, read offline by the stock CLI. Forking REA, exposing CDP from
Camoufox, and switching the Facebook window to Chrome all lost. Numbers:
[matrix/README.md](matrix/README.md).

## Do this next

1. Do not attach REA to the live Camoufox window.
2. Keep `humanize` at `1.5` in `python/visibleBrowser.py`. Upstream also
   allows `True`. This build's client comment says a boolean hangs
   `mouse.move`. The matrix did not justify a change.
3. When a capture is added, strip cookies before the HAR is written, and
   prove one fixture HAR with `rea inspect-web-network-capture` before a
   real account. That compatibility claim was the weak one (p 0.62).
4. Diff any saved scripts against `docs/listingPublish/formFill.md`. Change
   a selector only when the saved client shows the current one is wrong.
5. Merge PR #5, then PR #6, only after `bun run check` is run again on
   `b607b33` and the stale sentences in the PR body and
   `docs/listingPublish/README.md` are fixed. This session did not re-run
   that suite.
