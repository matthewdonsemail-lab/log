# Roadmap

Order is by what blocks a true read of the Facebook client. Later items
do not start by attaching REA to a live account.

## Now

1. **CLI is installed.** Node 24.18.1, `npm install --global rea-agents@6.7.0`,
   `rea --version` printed `6.7.0`. `rea doctor` was not run. `rea setup`
   was not run: it rewrites agent config and waits for a person.
   Frida's postinstall did not run (`allow-scripts`). That blocks native
   instrumentation only. The HAR and script commands do not use it.
2. **Keep REA off the live window.** No CDP attach to Camoufox. No attach
   to an AdsPower profile that is logged into Facebook.
3. **Finish the docs that are already wrong.**
   `docs/listingPublish/README.md` says there is no publish code. PR #6's
   body still says connect can skip the proxy. Both are false on
   `feat/publishMachine`.

## Next, and blocked on a gated run

4. **Save artifacts from one dry run.** Account passes `checkRunnable`,
   the proxy exits in its country, the self-check passes, and the form
   URL is the real create page only if matt asks for that run. Otherwise
   stop at the fixture and record that the scripts were not captured.
   The capture listens. It does not call Facebook's API. It does not
   click Publish.
   Write two files into a private temp directory and delete them with the
   rest of the run's secrets: the script bodies, and a HAR of responses
   the page made. Do not commit either file. Cookies and the proxy stay
   out of the HAR, the same way `NativeResponseAdapter` refuses to log
   headers and raw bodies.
5. **Read them with REA, offline.**
   `rea analyze-web-bundle` on the scripts.
   `rea inspect-web-network-capture` on the HAR.
   Keep the Evidence id. The question for the report is: which fields the
   create form submits, which requests the page itself fires, and which
   browser surfaces those scripts read.
6. **Diff against the poster we have.** Selectors in
   `docs/listingPublish/formFill.md`, steps in
   `src/marketplace/publish/machine.ts`, and the DOM driver in
   `facebook-camofox-client` `form_driver.py`. A mismatch becomes a
   failing test on `python/fixtures/createItem.html` or on a new local
   fixture. It does not become a live retry.

## Parallel, not blocking the capture

7. **PR stack.** PR #5 (`feat/captchaKrakenAndPublishFlow` onto `main`)
   merges before PR #6, or #6 is retargeted. There are no reviews and
   GitHub reports no checks. Re-run `bun run check` on `b607b33` first.
   The untracked files under `docs/providerResearch/` (the result
   markdown and JSON, and the poll logs) are not in the PR. Commit them
   only if they are part of that research; do not let them ride along
   unnamed.
8. **Live proof, still outstanding from PR #6.** A residential proxy
   assign, a live captcha, and `--live` past review. Each needs the keys
   and a person. The PR also records a flaky click on the fixture (2 of
   4 runs). That flake is a product bug to fix before trusting a live
   click.
9. **Avoidance decisions for matt.** Canvas stability versus shared
   pixels, and whether accounts must leave this PC
   (`docs/deviceIsolation/`, `docs/scaleArchitecture/`). REA's script
   report informs the first of those. It does not pick the host.

## Not scheduled

- A `log search` command, or any Parallel client inside log-cli.
- Importing `rea-agents` into `package.json`.
- Using REA's Chrome scenario runner as the Facebook browser.
- Editing or deleting listings. Rule 8 still holds. Rule 10 is the only
  posting path, and only with `--live`.

## How to tell the capture worked

- `rea` prints an Evidence result for the saved scripts and for the HAR,
  and names the limits (missing source maps, truncated bodies).
- The report lists create-form fields and the page's own request names
  next to the publish steps, each with the REA evidence id.
- A field the machine fills that the client does not have, or a request
  the page makes that no step accounts for, becomes a tracked gap.
- The run's temp directory is gone, and no cookie or proxy landed in git.
- `bun run check` still passes. The capture is a new test with an injected
  session if it becomes code. It does not hit the network in `bun test`.
