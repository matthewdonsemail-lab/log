# Changelog

Every release, newest first. release-please writes each new section from the commits; `bun run docs:releases` adds its `Models:` line from `src/models/manifest` and rebuilds the Releases table in the README.

## [0.6.0](https://github.com/matthewdonsemail-lab/log/compare/v0.5.0...v0.6.0) (2026-11-26)


### Features

* **kb:** keep the knowledge base in log.db, searched locally ([#338](https://github.com/matthewdonsemail-lab/log/issues/338)) ([1f925b6](https://github.com/matthewdonsemail-lab/log/commit/1f925b6351eb57d2dc7d6d04ebb2c2f423a5a49b))


### Bug Fixes

* batch 1 small bugs ([#336](https://github.com/matthewdonsemail-lab/log/issues/336), [#306](https://github.com/matthewdonsemail-lab/log/issues/306)-[#311](https://github.com/matthewdonsemail-lab/log/issues/311), [#355](https://github.com/matthewdonsemail-lab/log/issues/355)) ([eced791](https://github.com/matthewdonsemail-lab/log/commit/eced791e48e9caa04cc2084b8b7125004b7a81ec))
* small bugs from the probe and the 11-26 leftovers ([#336](https://github.com/matthewdonsemail-lab/log/issues/336) [#306](https://github.com/matthewdonsemail-lab/log/issues/306) [#307](https://github.com/matthewdonsemail-lab/log/issues/307) [#308](https://github.com/matthewdonsemail-lab/log/issues/308) [#309](https://github.com/matthewdonsemail-lab/log/issues/309) [#310](https://github.com/matthewdonsemail-lab/log/issues/310) [#311](https://github.com/matthewdonsemail-lab/log/issues/311) [#355](https://github.com/matthewdonsemail-lab/log/issues/355)) ([8a0eedb](https://github.com/matthewdonsemail-lab/log/commit/8a0eedb8134112de30382c1a6367dcadf003ceb0))
* **tests:** CI's 20 s test timeout reaches every file, not just the first ([65f1aea](https://github.com/matthewdonsemail-lab/log/commit/65f1aeac044b48bcd4050306ce4a2f6438bd563b))

## [0.5.0](https://github.com/matthewdonsemail-lab/log/compare/v0.4.0...v0.5.0) (2026-11-26)

Models: patronus-studio/wolf-defender-prompt-injection-small@2484cc9a13550aa4f2c29b577ff3ef331dc6ba07, Xenova/all-MiniLM-L6-v2@751bff37182d3f1213fa05d7196b954e230abad9, SamLowe/roberta-base-go_emotions-onnx@90ee0c1c4796d370e68968687b8ba51fc11224f4, onnx-community/LFM2.5-VL-450M-ONNX@24e63007ff1aaafbde27c89eb01a0513f4f61482, myuri@5.0.0, fastino/gliner2.5-small-v1@b5d42bf7dc7d01c40304ae4ed43c2f13c325a75b


### Features

* **genui:** the relationship state machine as a Hermes GenUI block, its states explaining each point ([#287](https://github.com/matthewdonsemail-lab/log/issues/287)) ([a1f347a](https://github.com/matthewdonsemail-lab/log/commit/a1f347a3249d67ba57092a17af9d1b222507a115))
* **governor:** count each account's requests by caller, and governor show prints the split ([8e91a2d](https://github.com/matthewdonsemail-lab/log/commit/8e91a2da49c6b1d302e801c340b1e170641a8d5b))
* **harness:** add an in-harness off switch for log hooks and tools ([#318](https://github.com/matthewdonsemail-lab/log/issues/318)) ([359646c](https://github.com/matthewdonsemail-lab/log/commit/359646c388f9784c84ce5c7b88547453db2094dd))
* **index:** one CPU pass per conversation that embeds, voices and screens it ([#299](https://github.com/matthewdonsemail-lab/log/issues/299)) ([88c740b](https://github.com/matthewdonsemail-lab/log/commit/88c740bb3658d6230b26a0ba8b5931e0a141a3c2))
* **index:** the owner status line shows what the index pass is doing ([#301](https://github.com/matthewdonsemail-lab/log/issues/301)) ([def0a0e](https://github.com/matthewdonsemail-lab/log/commit/def0a0eb9aa4fbed3800a45efa48b8b4695ce033))
* **network:** live rings from every stored event, and the Relate graph updated in place ([#272](https://github.com/matthewdonsemail-lab/log/issues/272)) ([16789ec](https://github.com/matthewdonsemail-lab/log/commit/16789ec39342bb2838b7bd5977bd2532139650aa))
* **network:** your network in log.db and the Relate graph, and a who-to-talk-to play ([#268](https://github.com/matthewdonsemail-lab/log/issues/268)) ([39ea853](https://github.com/matthewdonsemail-lab/log/commit/39ea853a63528e906f4a57eee1b4c5cab9ecfdbe))
* **people:** backfill who is automated from each platform's own answer ([#293](https://github.com/matthewdonsemail-lab/log/issues/293)) ([8d1dc2a](https://github.com/matthewdonsemail-lab/log/commit/8d1dc2a2b7832202fa3e5002859f6f86c7fb55f7))
* **people:** durable person facts with their source messages, two tiers, through the graph owner ([#285](https://github.com/matthewdonsemail-lab/log/issues/285)) ([55aaf94](https://github.com/matthewdonsemail-lab/log/commit/55aaf94c7306c1bb322f7dc283c3245dbe6e58e0))
* **relate:** relationship state machine block and relateMachine tool ([#267](https://github.com/matthewdonsemail-lab/log/issues/267)) ([aab1a48](https://github.com/matthewdonsemail-lab/log/commit/aab1a4896bd1a0ec597391ee1ef1ac85a2cd88b8))
* **relate:** the network map as a live GenUI card map, MCP App and tool ([#313](https://github.com/matthewdonsemail-lab/log/issues/313)) ([978247f](https://github.com/matthewdonsemail-lab/log/commit/978247feb54e0e41c79724fef077a473bd18f843))
* **relate:** the network state machine puts its people inside each state cell ([#292](https://github.com/matthewdonsemail-lab/log/issues/292)) ([234edbc](https://github.com/matthewdonsemail-lab/log/commit/234edbc86bb1b1e5a26e822419d5cbb426bf75dc))
* **relate:** the relationship machine has each platform's own states and moves, linked people as per-platform lanes, and a layout that fits ([#289](https://github.com/matthewdonsemail-lab/log/issues/289)) ([5fa170d](https://github.com/matthewdonsemail-lab/log/commit/5fa170d71d21654522518003dc7e1dd7d9a231d7))
* **relate:** the state machine in stately's measured look, a platform filter and one person across linked accounts ([#275](https://github.com/matthewdonsemail-lab/log/issues/275)) ([27df187](https://github.com/matthewdonsemail-lab/log/commit/27df1872a605571db8324b555b42af4926ddc423))
* **relate:** the state machine view in log's own font, Satoshi ([3a9d258](https://github.com/matthewdonsemail-lab/log/commit/3a9d258a0f40c161fa3280efb4ff3a75b20d7861))
* **setup:** one-pass, agent-driveable setup command ([7b9dd62](https://github.com/matthewdonsemail-lab/log/commit/7b9dd62b005be276522436ed0ade08874fb6dbec))
* **tui:** strengthen the clack setup wizard and drop AdsPower and Twenty from setup ([7982697](https://github.com/matthewdonsemail-lab/log/commit/79826975fed85e0dc4219210c786126d5f511fd3))


### Bug Fixes

* browser line only when one is open; affected tests on pre-push, isolated test runs ([da2e3e5](https://github.com/matthewdonsemail-lab/log/commit/da2e3e55f125443ff4563fb9b21661210736d5b8))
* browser line only when one is open; affected tests on pre-push, isolated test runs ([86c2eaa](https://github.com/matthewdonsemail-lab/log/commit/86c2eaae25ed6ed6cd8e4d77daa87db4c33d0205))
* fair cold-DM gating, closed-DM skips, server-channel lookup, plays that survive reloads; docs off Twenty ([f43a4b4](https://github.com/matthewdonsemail-lab/log/commit/f43a4b4427b66e5e4ea6355413538fe4774da3e6))
* governor resets hold across processes, and six other defects from the coupling review ([5218303](https://github.com/matthewdonsemail-lab/log/commit/5218303681b2ba52c74f84abb849b2d8f05c1d22))
* governor resets hold across processes, plus 8 more fixes from the coupling review ([5faa293](https://github.com/matthewdonsemail-lab/log/commit/5faa293d5087daf98044323d31becb5798e4627f))
* **hermesPlugin:** a spilled log result is known by its exit line, not only a leading browser line ([77a5480](https://github.com/matthewdonsemail-lab/log/commit/77a54805f04bcff90fb8d11b3e7019ad5eb0f5f6))
* **hermesPlugin:** know a saved log result by its exit line ([5ba7123](https://github.com/matthewdonsemail-lab/log/commit/5ba71232ea9fccf8014d644534e43d8f4495b29d))
* house style lets a capital open a line, cold dms drop the "saw t… ([ca2c58e](https://github.com/matthewdonsemail-lab/log/commit/ca2c58e919275d22cd54051b53dab2e5b80ac5b1))
* house style lets a capital open a line, cold dms drop the "saw this" template ([#321](https://github.com/matthewdonsemail-lab/log/issues/321)) ([0f9d922](https://github.com/matthewdonsemail-lab/log/commit/0f9d922b417eaa4945bd6a627e91d310140e3d4b))
* **mcp:** relateMachine answers with the result envelope its outputSchema lists, and platform:handle resolves on that platform ([#286](https://github.com/matthewdonsemail-lab/log/issues/286)) ([06e706b](https://github.com/matthewdonsemail-lab/log/commit/06e706b122e65b9a3a4b8472d5279aeebd597dfa))
* **opencode:** make log's MCP server start and expose tools in Code Mode ([705cc4a](https://github.com/matthewdonsemail-lab/log/commit/705cc4a1d2ca2b115517eaef96d43bdc4a344c02))
* **people:** a governor block stops the sweep instead of blaming every server ([#297](https://github.com/matthewdonsemail-lab/log/issues/297)) ([fa12dcd](https://github.com/matthewdonsemail-lab/log/commit/fa12dcdf4e8f15d9e74091448e926ea2c429e352))
* **people:** ask about new people each run, not the same twenty ([#298](https://github.com/matthewdonsemail-lab/log/issues/298)) ([6666596](https://github.com/matthewdonsemail-lab/log/commit/66665961bfdaa1a76883a6c711716f51da40de56))
* **people:** link accepts the X handles suggest builds from shared links, and writes say when LOG_DB points elsewhere ([8c58680](https://github.com/matthewdonsemail-lab/log/commit/8c586804f8d018c769e925af4a4b82e5d13defe8))
* **people:** link takes the X handles suggest finds in shared links; writes say when LOG_DB points elsewhere ([f4993a7](https://github.com/matthewdonsemail-lab/log/commit/f4993a73dbdc711ce18b14d3fb1a6c1ae156f2d8))
* **people:** read every server whose member list it can, and skip the rest ([#294](https://github.com/matthewdonsemail-lab/log/issues/294)) ([ea04ada](https://github.com/matthewdonsemail-lab/log/commit/ea04adab7bb422763848686592108f026176994c))
* **profiles:** save avatar bytes and draw them in the network map ([#314](https://github.com/matthewdonsemail-lab/log/issues/314)) ([2df7205](https://github.com/matthewdonsemail-lab/log/commit/2df72052453b2f585df0059d7d2c338707826304))
* **relate:** cap a network cell's people at 6 so the view always draws ([#322](https://github.com/matthewdonsemail-lab/log/issues/322)) ([621f8d7](https://github.com/matthewdonsemail-lab/log/commit/621f8d7d142ce117755a7f338aa0f0bc820adb01))
* **relate:** the state machine view in the stately editor's exact computed look ([#284](https://github.com/matthewdonsemail-lab/log/issues/284)) ([2450a32](https://github.com/matthewdonsemail-lab/log/commit/2450a3213afe31f397537441bf76650397ccc501))
* **release:** release-please bumps the Hermes plugin version ([3dc39b9](https://github.com/matthewdonsemail-lab/log/commit/3dc39b965bdc211f4ac3e3e77d90411173a78e57))
* **release:** release-please bumps the Hermes plugin version, so check:agentHooks stays green after a release ([9796fca](https://github.com/matthewdonsemail-lab/log/commit/9796fca65a91f42f019cad13a8a967afc85e2065))
* **storage:** a chat takes its kind and name from the channel catalog, with a repair migration ([c45f572](https://github.com/matthewdonsemail-lab/log/commit/c45f572c8030e879a66f5899442287c81cfe7f30))
* the queue never holds an item for its own send, and the fact screen says why it stopped ([#323](https://github.com/matthewdonsemail-lab/log/issues/323)) ([64681e8](https://github.com/matthewdonsemail-lab/log/commit/64681e84c608d10166aa6a157967e3e64ae68d8d))
* voice gate reads cold DMs fairly, queue skips closed DMs, chat lookup finds server channels ([9a82d2e](https://github.com/matthewdonsemail-lab/log/commit/9a82d2e6f18ca991f707a44431cbd550cf1f9c08))
* **voice:** find the chat by any X conversation id and read his own sent words as his ([#224](https://github.com/matthewdonsemail-lab/log/issues/224)) ([511643f](https://github.com/matthewdonsemail-lab/log/commit/511643f79c469a4558c2a8aba65cec67cf138f6f))
* **voice:** find the chat by any X conversation id and read his own sent words as his ([#224](https://github.com/matthewdonsemail-lab/log/issues/224)) ([2ea3316](https://github.com/matthewdonsemail-lab/log/commit/2ea3316dcf7e13753a2eda82cd412778f5a634b1))
* **x:** read profile pictures from conversations and engagement ([#315](https://github.com/matthewdonsemail-lab/log/issues/315)) ([8cb97a3](https://github.com/matthewdonsemail-lab/log/commit/8cb97a36936cf29681f302bdec3b1cf584b45ebb))


### Performance Improvements

* **hooks:** parallel, path-scoped, cached commit checks; devlog from the commit message; test:affected by import distance ([#290](https://github.com/matthewdonsemail-lab/log/issues/290)) ([17b6cf5](https://github.com/matthewdonsemail-lab/log/commit/17b6cf5e41f68d0dece12be53d38e2dc990c36ec))

## [0.4.0](https://github.com/matthewdonsemail-lab/log/compare/v0.3.0...v0.4.0) (2026-11-21)

Models: patronus-studio/wolf-defender-prompt-injection-small@2484cc9a13550aa4f2c29b577ff3ef331dc6ba07, Xenova/all-MiniLM-L6-v2@751bff37182d3f1213fa05d7196b954e230abad9, SamLowe/roberta-base-go_emotions-onnx@90ee0c1c4796d370e68968687b8ba51fc11224f4, onnx-community/LFM2.5-VL-450M-ONNX@24e63007ff1aaafbde27c89eb01a0513f4f61482, myuri@5.0.0


### Features

* **checks:** agentWording keeps risk words out of what agents read; rules reworded ([#255](https://github.com/matthewdonsemail-lab/log/issues/255)) ([df5fc23](https://github.com/matthewdonsemail-lab/log/commit/df5fc2305d8406b9dbda1dc6e1fc2e37103a12ca))
* **discord:** message someone new by user id, and send friend requests ([125909e](https://github.com/matthewdonsemail-lab/log/commit/125909e4d28a8802a69f3d1fa3151e379bcb1ab4))
* **discord:** message someone new by user id, friend requests, and Discord's real refusal ([ee68ae2](https://github.com/matthewdonsemail-lab/log/commit/ee68ae2d5cd239f99f91014ebe00ef69037d42bf))
* **storage:** recovery passphrase that reopens sealed secrets on a new machine ([#258](https://github.com/matthewdonsemail-lab/log/issues/258)) ([b8ec9f4](https://github.com/matthewdonsemail-lab/log/commit/b8ec9f43b6ee739d758695916b3959620483d25b))
* **storage:** seal account sessions, login secrets and provider keys in log.db ([#258](https://github.com/matthewdonsemail-lab/log/issues/258)) ([e064a82](https://github.com/matthewdonsemail-lab/log/commit/e064a8206f23aaddc8bd5478505f52c93cb2b836))


### Bug Fixes

* **discord:** keep Discord's answer when a send fails, and name closed DMs and captchas ([83dab1f](https://github.com/matthewdonsemail-lab/log/commit/83dab1ff4dc9ffad80eaeeec971e36e52ae72d25))
* **discord:** shorter friend and send text so the agnostic check passes without a raise ([c424a01](https://github.com/matthewdonsemail-lab/log/commit/c424a014149590b3ddf5d67fa812f7883a53f34e))
* **inbox:** label tools never wait on a worker when their engine is stubbed ([1df7e45](https://github.com/matthewdonsemail-lab/log/commit/1df7e45b9929f59a7e6f97469e05f31dff54e1cd))
* **inbox:** label tools never wait on a worker when their engine is stubbed ([1915b65](https://github.com/matthewdonsemail-lab/log/commit/1915b65031666c27d2787476dc458a3700004aa1))
* **storage:** Python opens a key Bun wrapped with a passphrase, and the other way ([#258](https://github.com/matthewdonsemail-lab/log/issues/258)) ([483ced9](https://github.com/matthewdonsemail-lab/log/commit/483ced910da1d22e5d1565b0fc2c035b35c8c717))

## [0.3.0](https://github.com/matthewdonsemail-lab/log/pull/212) (2026-11-20)

Models: patronus-studio/wolf-defender-prompt-injection-small@2484cc9a13550aa4f2c29b577ff3ef331dc6ba07, Xenova/all-MiniLM-L6-v2@751bff37182d3f1213fa05d7196b954e230abad9, SamLowe/roberta-base-go_emotions-onnx@90ee0c1c4796d370e68968687b8ba51fc11224f4, onnx-community/LFM2.5-VL-450M-ONNX@24e63007ff1aaafbde27c89eb01a0513f4f61482, myuri@5.0.0


### Features

* **browser:** one live browser view for console and chat, hidden window when streamed ([e075e4f](https://github.com/matthewdonsemail-lab/log/commit/e075e4fddc639419c82e5b2582cfebefe47a3ca2))
* **browsers:** Brave as a third driver, liveView on every driver, one way to pick the driver ([4c3cd56](https://github.com/matthewdonsemail-lab/log/commit/4c3cd56019b48689ad484b3312f88a89d1488504))
* **browser:** the owner drives the browser he opened, on any page; sessionsSignIn open no longer refused by its own job ([208e7ad](https://github.com/matthewdonsemail-lab/log/commit/208e7adb444936e9e153bc134ef943ca7873ae2d))
* **browserView:** the live browser streamed inside every chat, light and dark ([de7829d](https://github.com/matthewdonsemail-lab/log/commit/de7829d98699df9622c665de60d383336bdf1a97))
* **cards:** one card registry, the card gets the data and the model a summary, check:cards, every card drawn before merge, every card reachable from the owner's words ([12a9e55](https://github.com/matthewdonsemail-lab/log/commit/12a9e55fcb0adb35563f7bd1153907fedfeaac2e))
* **console:** the account's browser streamed live into the console ([be22ec4](https://github.com/matthewdonsemail-lab/log/commit/be22ec43b0b2be5550514f2897b62d7e589e35a6))
* **console:** the account's browser streamed live into the console by page screencast ([c386bc0](https://github.com/matthewdonsemail-lab/log/commit/c386bc092fa9481f4bac30c6a508b6280701e471))
* **hermes:** ::logapp, log's MCP App views drawn in Hermes Desktop by the vendored host card ([#210](https://github.com/matthewdonsemail-lab/log/issues/210)) ([841208d](https://github.com/matthewdonsemail-lab/log/commit/841208df4879c079cd23c031ca35c888a66b2ef4))
* **inbox:** log inbox outcomes, reply rates of log's sends vs the owner's, matched by person and stage ([#246](https://github.com/matthewdonsemail-lab/log/issues/246)) ([537e572](https://github.com/matthewdonsemail-lab/log/commit/537e5724a22cb574992e32e5ec87c613ffed167e))
* **inbox:** pipeline labels, who and where per chat on the CPU ([#236](https://github.com/matthewdonsemail-lab/log/issues/236)) ([#242](https://github.com/matthewdonsemail-lab/log/issues/242)) ([4213a94](https://github.com/matthewdonsemail-lab/log/commit/4213a94243a236134351e4fa503a13acd247c435))
* log update refreshes every harness; Hermes Desktop plugin copied ([3e59702](https://github.com/matthewdonsemail-lab/log/commit/3e5970291d5fb7828403d3ff59a9bcfec189cab7)), closes [#206](https://github.com/matthewdonsemail-lab/log/issues/206)
* **models:** each loader readies its pinned model first, moving the old cached copy instead of downloading ([7a9bdb8](https://github.com/matthewdonsemail-lab/log/commit/7a9bdb8fe2b340050d4f4bb51689d9573d95672e))
* one version for everything: pinned local models, pinned installs, shared after-install, README releases table ([57a18ee](https://github.com/matthewdonsemail-lab/log/commit/57a18ee96e3994e46d9a07ce47febb65a507018d))
* **release:** nightly track on every green merge to main, log update --track, LOG_TRACK installs ([3edd197](https://github.com/matthewdonsemail-lab/log/commit/3edd1974019ea3c23ef5301cfe8ca8234b2bba29))
* **release:** nightly track on every green merge to main, log update --track, LOG_TRACK installs ([#83](https://github.com/matthewdonsemail-lab/log/issues/83)) ([ec140a7](https://github.com/matthewdonsemail-lab/log/commit/ec140a7975acc98e3cde61e8c8b4c8ba1566158c))
* **signIn:** 'sign into discord' in any chat routes to the sign-in play and the live browser card ([732edec](https://github.com/matthewdonsemail-lab/log/commit/732edec8bd86d67ec35644f9648b33bb0e366b09))
* **storage:** the engines' own stores move into log.db (migration 23), and check:oneDatabase covers Python ([6ab4aef](https://github.com/matthewdonsemail-lab/log/commit/6ab4aefd0b587998bbd6268f89063a1d3bda153f))
* versions, update notices and log update (with resume) ([8a0cb05](https://github.com/matthewdonsemail-lab/log/commit/8a0cb058800704f4849308de873b16ece79bb3a7)), closes [#206](https://github.com/matthewdonsemail-lab/log/issues/206)
* **voice:** frontier-conventions detector trained on the owner replaces the Jina AI-phrase index ([#245](https://github.com/matthewdonsemail-lab/log/issues/245)) ([70cc010](https://github.com/matthewdonsemail-lab/log/commit/70cc010e34276201e6d6333e1f37ce3e96e08230))
* **voice:** grounding pack, one calibrated score, ranked options, bounded Jina ([#232](https://github.com/matthewdonsemail-lab/log/issues/232)) ([#238](https://github.com/matthewdonsemail-lab/log/issues/238)) ([0376510](https://github.com/matthewdonsemail-lab/log/commit/03765105a4d1c402e74e76031b3eec9c1ab01786))


### Bug Fixes

* **bench:** stop the plugin API's whole process tree after hostBench, so no uvicorn is left running ([c2a752d](https://github.com/matthewdonsemail-lab/log/commit/c2a752d2eb6ecb39e6755fbd5227a92ec4bd1fd0))
* **browser:** a direct (no-proxy) account opens in Camoufox: the gate passes no proxy instead of an empty server (Invalid URL) ([0079e77](https://github.com/matthewdonsemail-lab/log/commit/0079e77d6cdb296cd03f36e39390c3d7b396f872))
* **browser:** direct accounts open in Camoufox ([2d14f6e](https://github.com/matthewdonsemail-lab/log/commit/2d14f6e05b9ae80fae530c37397d669952690da5))
* **browserView:** no raw 'unknown' in the card, Close browser for an owner-driven session, no card scrollbar (page fills the width, wheel scrolls the page, coalesced), no fully rounded pills ([b09ed5c](https://github.com/matthewdonsemail-lab/log/commit/b09ed5c78949c22212a54b8eca85a1f9d6973093))
* **browserView:** the viewer listens again after Windows drops its socket, and the card shows a failure instead of spinning on "Connecting to browser…" ([7d57409](https://github.com/matthewdonsemail-lab/log/commit/7d57409c2fa5798aaeca5dbae598b17b0c69d4aa))
* **browserView:** viewer relistens after Windows drops its socket; card shows failures instead of spinning ([bb1e9e6](https://github.com/matthewdonsemail-lab/log/commit/bb1e9e622f311a2fb77f0d7dcfc275d4017956c9))
* **checks:** check:oneDatabase lists [#225](https://github.com/matthewdonsemail-lab/log/issues/225)/[#230](https://github.com/matthewdonsemail-lab/log/issues/230)'s file writes ([8e33ea6](https://github.com/matthewdonsemail-lab/log/commit/8e33ea6cb447c3608c756e3f2a495d047accc317))
* **checks:** list the Discord identity and media writes and the open bench in check:oneDatabase ([c9b3f51](https://github.com/matthewdonsemail-lab/log/commit/c9b3f51d5fa886b753d91c976e76d320c3b59026))
* **checks:** list the local speed benches in check:identityGate ([95ed951](https://github.com/matthewdonsemail-lab/log/commit/95ed951f64ab009d254bc465607966e2e3c0bd0f))
* **checks:** the speed benches run on 127.0.0.1 with no account, listed in check:identityGate ([7f1b68f](https://github.com/matthewdonsemail-lab/log/commit/7f1b68fd4747c72e8b2009d7d61f26abdb5251e9))
* **ci:** main green again (hidden spawn, harness test) ([1b2dcec](https://github.com/matthewdonsemail-lab/log/commit/1b2dcec17f85b984f12068ccdfd4d5e96b73fe1d))
* **ci:** the browser close spawn starts hidden; the harness test expects the desktop plugin's created flag ([d39599d](https://github.com/matthewdonsemail-lab/log/commit/d39599d2ebf6fb47deee81bca9945b4b71afaa77))
* **ci:** voice train opens its embedders only when it embeds; tests no longer assume the newest migration or a fast runner ([#250](https://github.com/matthewdonsemail-lab/log/issues/250)) ([2fb3a75](https://github.com/matthewdonsemail-lab/log/commit/2fb3a75b736ddea67f745aa2198115c2f6c978d4))
* **hooks:** no name pointers from typos, no play line on typo or log-building prompts, unchanged blocks once per session ([#248](https://github.com/matthewdonsemail-lab/log/issues/248)) ([03b74e2](https://github.com/matthewdonsemail-lab/log/commit/03b74e2b806b636f09cf23aa0c6b2ea21228076d))
* **identity:** close the gate bypasses of [#47](https://github.com/matthewdonsemail-lab/log/issues/47) (engine route, sockets, downloads, check:identityGate) ([aa2f7f9](https://github.com/matthewdonsemail-lab/log/commit/aa2f7f9a4df59057a4ca2bbc29c65e65564189bc))
* **identity:** close the gate bypasses of [#47](https://github.com/matthewdonsemail-lab/log/issues/47): every engine call, socket and browser goes out on the account's route ([30eb475](https://github.com/matthewdonsemail-lab/log/commit/30eb475e97b792e76b68fb1765e5bf9030b1809b))
* **inbox:** community is the top of the sales cycle and gets a where ([#244](https://github.com/matthewdonsemail-lab/log/issues/244)) ([8130c53](https://github.com/matthewdonsemail-lab/log/commit/8130c53ac19262f29a31967adaa66a4f0255082a))
* **inbox:** the teacher knows the owner and his own labels; unsure chats are re-asked; the head learns from every teacher label weighted by how sure it was ([#243](https://github.com/matthewdonsemail-lab/log/issues/243)) ([8bbc12b](https://github.com/matthewdonsemail-lab/log/commit/8bbc12bd63411deb050d3b212fd658f995df59b3))
* **site:** put back site/packages/ui, deleted by accident in [#231](https://github.com/matthewdonsemail-lab/log/issues/231), which every Vercel build since needs ([#251](https://github.com/matthewdonsemail-lab/log/issues/251)) ([9c599bd](https://github.com/matthewdonsemail-lab/log/commit/9c599bd7e7bc814d57972618aa37fd129312c0a1))
* **storage:** migration 22 creates the typing table on databases made before it ([472c37e](https://github.com/matthewdonsemail-lab/log/commit/472c37e4b80078be84b4a3a1f6804672dda4f982))
* **update:** the vendors step skips uv when nothing changed, and names the Python holding a locked file ([d219212](https://github.com/matthewdonsemail-lab/log/commit/d219212ec940872c1b9c425126b68b864b87ab2a))
* **watchers:** landed-to-pushed measured per platform; watcher reads get deadlines and read only changed chats ([#247](https://github.com/matthewdonsemail-lab/log/issues/247)) ([405ad64](https://github.com/matthewdonsemail-lab/log/commit/405ad648ab64b7d0ef7516ea1e69684862b5779d))

## [0.2.1](https://github.com/matthewdonsemail-lab/log/pull/179) (2026-11-20)

Models: not pinned (fetched by name at run time)

### Features

* The relate graph, the live inbox push (messages during tool calls, burst batching, late copies dropped), inbox labels and ignoring a server or chat
* The voice gate judges public replies as replies, and Discord voice notes catch up only their own chat
* The Hermes report views drawn in Hermes Desktop, with a text swap on chats that can't draw

## [0.2.0](https://github.com/matthewdonsemail-lab/log/pull/166) (2026-11-15)

Models: not pinned (fetched by name at run time)

### Features

* The one-command Hermes pack, the catalog review, the README rewrite and the catch-up machine
* Published to npm as @listeningkit/log 0.2.0
