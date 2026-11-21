# hermes-genui, vendored

- Upstream: https://github.com/sagarmainkar/hermes-genui (MIT, see `LICENSE`), by Sagar Mainkar.
- Commit: `09d41ad` ("README: install in the default profile too when using several profiles (#14)"), version 0.3.0.

## Why it is here

hermes-genui is how blocks get drawn inside Hermes Desktop and Hermes Webapp replies: a tool stores what to draw and
returns a short `::blocks{id="..."}` line, the model puts that line in its reply, the plugin's Desktop half claims the
transcript directive and fetches the stored board through the plugin's REST route, and a `transform_llm_output` hook
swaps the line for text on chats that can't draw. log uses the same delivery for its own `report` views:

- `src/mcp/apps/report/view/hermesDesktop.tsx` is log's Desktop half (the `::logview` directive). It imports
  `composerActions` from `web/src/host/actions.ts` here, so a view's suggested questions go through the composer with
  upstream's guards (long text and slash commands are put in the box, never sent).
- `hermesPlugin/__init__.py` (`transform_llm_output`) and `hermesPlugin/dashboard/plugin_api.py` (`/views/<id>`, read from log.db)
  follow `hooks/text_fallback.py` and `dashboard/plugin_api.py` here.
- `bun run docs:build` (through `scripts/hermes/desktopBundles.ts`) builds both Desktop halves, log's into `hermesPlugin/desktop/plugin.js` and this
  one's into `desktop/plugin.js`, with Bun instead of upstream's esbuild script (`web/build.mjs`, kept for reference).

## What changed from upstream

- **The look is log's, not upstream's.** `web/src/styles/tokens.css` is rewritten with log's Lynx kit tokens
  (`src/mcp/apps/report/view/kit.css`, after https://github.com/yakkomajuri/lynx, MIT): a quiet canvas, white blocks
  with one hairline, a near-black accent, a nearly monochrome chart palette and Geist, light and dark. A new
  `web/src/styles/lynx.css`, loaded last, turns upstream's bold card titles and heavy figures into Lynx's light ones
  (32 px numbers at weight 450, 16 px card radius, weight 500 chips and buttons).
- `desktop/plugin.js` is rebuilt from the restyled source by `bun run docs:build`; upstream's built
  bundle is not shipped.
- Left out to keep the copy small: `assets/` (screenshots and videos, 9.5 MB), `tests/`, every `*.test.*` file and
  the test helpers (`web/src/core/testing.tsx`, `web/src/lib/locale.testing.ts`), `.github/`, `README.md`,
  `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `web/package-lock.json` and `web/vitest.config.ts`.
- **One extension point, for log's `stateMachine` block** (an upstream PR candidate): `registerBlock` and
  `blockEntry` in `web/src/registry.tsx` (readBlocks and Blocks look types up through it, built-in names first) and
  `register_block` in `core/extensions.py` (adds a type's checker, text fallback and catalog entry, and rewrites the
  show_blocks description, which `tools/show_blocks.py` now builds in `description()`). log registers `stateMachine`
  through both from `src/mcp/apps/report/view/genuiMachine.tsx` and `hermesPlugin/genuiMachine.py`.
- Nothing else is edited: the Python tools, hooks, blocks, recipes and templates are upstream's as of that commit.

This folder is not installed as a Hermes plugin by log. To use upstream's own blocks (show_blocks and the rest) with
log's look, install this folder as a plugin on its own (`hermes plugins install` from a checkout of it).
