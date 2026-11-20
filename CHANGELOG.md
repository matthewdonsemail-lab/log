# Changelog

Every release, newest first. release-please writes each new section from the commits; `bun run docs:releases` adds its `Models:` line from `src/models/manifest` and rebuilds the Releases table in the README.

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
