# Where the code lives

This is a map of log's source tree: what each folder holds and which part of the system it belongs to. Use it to find your way around before changing something. Code is organised by platform first (Facebook, X, Reddit), then by area and domain, with shared pieces (browsers, proxies, Twenty, rea) in their own folders.

```text
bin/log.ts                      the entry point
src/cli/*                       the commands, `log [<platform>] <command>`
src/cli/runner/helpers/platforms.ts  PLATFORMS and PLATFORM_SITES: every platform, its hosts, proxy and browser path
src/facebook/                   Facebook's own areas: group/ (join, read, members, answer), marketplace/ (check, copy, location), warmup/
src/twitter/                    X: account/ (session), copy/, post/send (reply, quote, like, dm), queue/
src/reddit/                     Reddit: account/session
src/platformKit/                what every platform's account session shares (find, gate, run the engine, record)
src/scaffold/platform/          `log new platform <name>`: writes and wires in a new platform
src/directApi/engine/           DIRECT_ROUTES, commandEngine, the direct-API engine runner and governors
src/twenty/graphql/             the generated Twenty client (generated/), its seam, and an in-memory Twenty for tests
src/marketplace/socialAccount/  accounts in Twenty, and the check that an account may run (checkRunnable)
src/marketplace/agencyListing/  listings in Twenty, writing run results back, dashboard sync
src/marketplace/replacement/    losing an account, replacements, campaign fill
src/marketplace/publish/        the XState publish machine
src/marketplace/monitor/        the XState listing monitor and relist rules
src/marketplace/lifecycle/      each account's lifecycle machine
src/marketplace/listing/        the listing status machine, ported from an earlier dashboard (with its seed)
src/warmup/                     what every platform's warm-up draws from: persona/, viewer/
src/browser/driver/             the browser-agnostic session machine and capability list
src/browser/camoufox/           Camoufox's driver and capability row
src/browser/adsPower/           AdsPower: Local API client, profile sync, its driver and capability row
src/browser/run/                one run's private proxy and cookie files, and the launch budget (every browser)
src/browser/proxy/              the proxy check's result types (every browser)
src/browser/inspect/            log inspect: one open browser driven a step at a time (every browser, every platform)
src/browser/flow/               recordings → flows, their XState machines, and the page states (every browser)
src/camofox/                    what only Camoufox needs: its device per account, its worker and sync sessions
src/proxyVendor/                proxy providers: twoCaptcha/, byteful/, and traffic budgets
src/rea/                        rea's readings: capture/, platformClient/ (every platform's calls and their code)
src/subq/                       SubQ's readings of steps log doesn't recognise
src/captcha/router/             captcha routing: CaptchaKraken → 2Captcha → a person
src/errors/catalog/             every error code, defined once
src/agentHooks/                 the agent hooks (Claude Code, Codex) and what each decides
src/surface/                    the catalog of commands, MCP tools and hooks; the generated README section and diagrams
vendor/fbk/                     Facebook's direct-API client
vendor/twikit/                  X's direct-API client, on curl_cffi
vendor/rdvwr/                   Reddit's direct-API client, one pinned curl_cffi session (check:rdvwrTransport)
vendor/twitterController/       the earlier X controller being ported
python/directApi/               Facebook's direct-API engine (fbk)
python/twitterApi/              X's engine (twikit)
python/redditApi/               Reddit's engine (rdvwr)
python/platformKit/             what every platform's engine shares
python/browser/                 every driver's opener (browserDriver.py), the proxy gate, the HAR recorder, headed launch
python/session/                 the processes TypeScript runs: inspect, connect, publish, profile, the worker
python/human/                   the cursor and the scroll wheel, fitted to a real person's mouse
docs/platforms/<platform>/      every platform's internal requests, by domain, read by rea
```

For how files and folders are named, see [Naming conventions](namingConventions.md). Run `bun run check` for the naming gate, typecheck and tests.
