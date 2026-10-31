# REA roadmap

This is the order of work for reading Facebook's web client with REA, written when the plan was made. It's ordered by what blocks a true reading of the client, and no step starts by attaching REA to a live account. Read it to see what was planned, what was blocked, and how to tell a capture worked.

Since then, log records a HAR for every browser step and rea reads each one, and `log facebook capture --docs` documents every request a page makes (see [From a recording to a reusable flow](../recordToFlow.md)).

## First

1. **Install the CLI.** Node 24.18.1, `npm install --global rea-agents@6.7.0`; `rea --version` prints `6.7.0`. `rea setup` wasn't run, because it rewrites agent config and waits for a person. Frida's postinstall didn't run (`allow-scripts`), which only blocks native instrumentation; the HAR and script commands don't use it.
2. **Keep REA off the live window.** No CDP attach to Camoufox, and no attach to an AdsPower profile that's signed in to Facebook.

## Next, once a gated run is available

3. **Save files from one dry run.** The account passes `checkRunnable`, the proxy exits in its country, and the self-check passes. Use the real create page only if the owner asks for that run; otherwise stop at the local fixture and note that the scripts weren't captured. The capture only listens: it doesn't call Facebook's API and doesn't click Publish. It writes two files into the run's private folder: the script bodies, and a HAR of the responses the page made. Neither is committed.
4. **Read them with REA, offline.** `rea analyze-web-bundle` on the scripts, `rea inspect-web-network-capture` on the HAR. Keep the evidence id. The report answers: which fields the create form submits, which requests the page itself fires, and which browser surfaces those scripts read.
5. **Compare with the poster log has.** The selectors in [The create form](../listingPublish/formFill.md), the steps in `src/marketplace/publish/machine.ts`, and the earlier Camoufox client's `form_driver.py`. A mismatch becomes a failing test on `python/fixtures/createItem.html` or a new local fixture, never a live retry.

## Alongside, not blocking the capture

6. **Live proof still outstanding at the time:** a residential proxy assignment, a live captcha solve, and `--live` past review. Each needs keys and a person. A flaky click on the fixture (2 of 4 runs) was also recorded; it's a bug to fix before trusting a live click.
7. **Avoidance decisions:** canvas stability versus shared pixels, and where accounts should be hosted (`docs/deviceIsolation/`, `docs/scaleArchitecture/`). REA's script report informs the first; it doesn't pick the host.

## Not planned

- A web-search command, or any research-service client, inside log.
- Adding `rea-agents` to `package.json`.
- Using REA's Chrome scenario runner as the Facebook browser.
- Editing or deleting listings. Posting stays `log facebook publish`, and only with `--live`.

## How to tell the capture worked

- `rea` prints an evidence result for the saved scripts and for the HAR, and names its limits (missing source maps, truncated bodies).
- The report lists the create form's fields and the page's own request names next to the publish steps, each with its REA evidence id.
- A field the machine fills that the client doesn't have, or a request the page makes that no step accounts for, becomes a tracked gap.
- Nothing from the run landed in git.
- `bun run check` still passes. If the capture becomes code, its test uses an injected session and doesn't touch the network in `bun test`.
