# Layout

```text
bin/log.ts                      entrypoint
src/cli/*                       the commands, `log [<platform>] <command>` (rule 63)
src/cli/runner/helpers/platforms.ts  PLATFORMS and PLATFORM_SITES: every platform, its hosts, proxy and browser path
src/facebook/                   Facebook's own areas: group/ (join, read, members, answer), marketplace/ (check, copy, location), warmup/ (rule 64)
src/twitter/                    X: account/ (session), copy/, post/send (reply, quote, like, dm), queue/
src/reddit/                     Reddit: account/session
src/platformKit/                what every platform's account session shares (find, gate, run the engine, record)
src/scaffold/platform/          `log new platform <name>`: writes and wires a new platform (rule 83)
src/directApi/engine/           DIRECT_ROUTES, commandEngine, the direct-API engine runner and governors
src/twenty/graphql/             the generated Twenty client (generated/), its seam, an in-memory Twenty for tests
src/marketplace/socialAccount/  accounts in Twenty, the account check (checkRunnable)
src/marketplace/agencyListing/  listings in Twenty, run write-back, dashboard sync
src/marketplace/replacement/    losing an account, replacements, campaign fill
src/marketplace/publish/        the XState publish machine
src/marketplace/monitor/        the XState listing monitor + relist rules
src/marketplace/lifecycle/      each account's lifecycle machine (rule 35)
src/marketplace/listing/        the listeningkit-hackathon listing machine port (+ its seed)
src/warmup/                     what every platform's warm-up draws from: persona/, viewer/
src/browser/driver/             the browser-agnostic session machine and capability list (rules 42, 44)
src/browser/camoufox/           Camoufox's driver and capability row (kept)
src/browser/adsPower/           AdsPower: Local API client (from Listaro), profile sync, its driver and capability row
src/browser/run/                one run's private proxy/cookie files, the launch budget (every browser)
src/browser/proxy/              the proxy check's result types (every browser)
src/browser/inspect/            log inspect: one open browser driven a step at a time (every browser, every platform)
src/browser/flow/               recordings → flows, their XState machines, the page states (every browser)
src/camofox/                    what only Camoufox needs: its device per account (rule 15), its worker and sync sessions
src/proxyVendor/                proxy providers: twoCaptcha/, byteful/, traffic budgets (rules 51, 52)
src/rea/                        rea's readings: capture/, platformClient/ (every platform's calls and their code, rule 85)
src/subq/                       SubQ's readings of steps we don't know (rule 74)
src/captcha/router/             CaptchaKraken → 2Captcha → a person
src/errors/catalog/             every error code, once
src/agentHooks/                 the agent hooks (Claude Code, Codex) and what each decides (rule 55)
src/surface/                    the catalog of commands, MCP tools and hooks; the README section and diagrams (rule 56)
vendor/fbk/                     Facebook's direct-API client
vendor/twikit/                  X's direct-API client, on curl_cffi (rule 81)
vendor/rdvwr/                   Reddit's direct-API client, one pinned curl_cffi session (check:rdvwrTransport)
vendor/twitterController/       the X controller being ported
python/directApi/               Facebook's direct-API engine (fbk)
python/twitterApi/              X's engine (twikit)
python/redditApi/               Reddit's engine (rdvwr)
python/platformKit/             what every platform's engine shares
python/browser/                 every driver's opener (browserDriver.py), the proxy gate, the HAR recorder, headed launch
python/session/                 the processes TypeScript runs: inspect, connect, publish, profile, the worker
python/human/                   the cursor and the wheel, fitted to matt's hand (rule 32)
docs/platforms/<platform>/      every platform's internal requests, by domain, read by rea (rules 27, 48, 85)
```

See `docs/namingConventions.md`. Run `bun run check` for the naming gate, typecheck and tests.
