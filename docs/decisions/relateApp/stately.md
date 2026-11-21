# Stately's visualizer, reverse-engineered for log's Relate graph app

Back to [the relateApp research](research.md). The exact computed values from the signed-in editor are in [statelyEditorExact.md](statelyEditorExact.md).

Research for issue #267 (Relate by Neo4j hackathon, deadline 2026-12-11). Written 2026-11-21. These are design facts and the open-source libraries Stately uses. None of their proprietary code was copied, and nothing was signed into.

## What was read, and how

- **Hosted registry machines (`stately.ai/registry/editor/<id>`) now need a login.** Every public example tried returned 401 "Sign in to view this work", including `/embed/` and `/discover`. They weren't used.
- **The page that was read is the public visualizer at `https://editor.stately.ai/viz#machine=<base64 JSON>&format=digraph&theme=dark|light`.** The Stately docs embed it in an iframe, for example on `https://stately.ai/docs/editor-states-and-transitions`, and it needs no login. The full URL is in `embed_url.txt`. The page says "Read-only · Access unverified". It runs the same editor build as the app: `@statelyai/editor` **v0.55.19**, deploy id `viz-44901969068-1`.
- **`stately.ai/viz` is the old visualizer (statelyai/xstate-viz).** It's marked deprecated and wasn't analysed.
- **How:** browser_exec over CDP loaded the page and listed 81 resources. 77 JS/CSS files (13 MB) were saved to `js/` and read offline with grep and Python. The browser was used to measure computed styles and SVG markup (`dom_light.json`). log's `inspect*`/REA path wasn't used, because the browser fallback the task allowed covered everything without a login. Following REA's own rule ("save the scripts, read them offline"), nothing was attached to a live session.

The bundles, resource lists and DOM measurements stayed in the research session's scratch folder; the screenshots are kept here in [images/](images/) and listed at the end.

## 1. Libraries and versions

**Evidence:** the editor's own `package.json` is bundled verbatim inside `js/3ipc7qgmu07wn.js`, as `"name":"@statelyai/editor","version":"0.55.19"`. Licences come from the npm registry, checked 2026-11-21.

| Concern | Package (version they pin) | Licence | Notes |
|---|---|---|---|
| Canvas engine | `@statelyai/flow` ^0.14.0, `@statelyai/flow-react` ^0.12.3, `@statelyai/flow-dom` ^3.6.3 (dev) | **MIT** | Their own pan/zoom/selection/routing engine. It isn't React Flow: grep finds no `react-flow__`/`xyflow`, and the classes are `stately-flow__node/edge/edge-label/viewport/pane/background`. It's clearly descended from xyflow, though: the CSS still uses `--xy-background-color-default` and the DOM structure matches. Its deps are `immer` and `@xstate/store`. It's pre-1.0, so expect API churn. |
| Graph model | `@statelyai/graph` ^2.1.0 (latest 2.6.0) | **MIT** | Plain-JSON `{nodes, edges}` with nesting, ports and algorithms. It has adapters for ELK, dagre, Graphviz, Mermaid and React Flow. |
| Layout | `@statelyai/layout` 0.14.5, and `"elkjs":"npm:@statelyai/layout@0.6.1"` (an alias) | **EPL-2.0 OR GPL-3.0+** | A fork of elkjs. `js/2jcmqco8wkwjd.js` has `Symbol("elkjs0111ResultPolicy")` and an `elkjs0111EdgeTargetBug` workaround (elkjs 0.11.1 compatibility). There's also a `pele` ^1.5.2 engine and a `"stately"` router option. |
| State | `xstate` 6.0.0-beta.4, `@xstate/store` 5.0.0-alpha.8, `@xstate/react` 7.0.0-beta.0, `immer` ^10.2 | MIT | |
| UI kit | `shadcn` ^4.13 + `@base-ui/react` ^1.4, `class-variance-authority`, `tailwind-merge`, `clsx` | MIT | shadcn slots show in the CSS as `[data-slot=command-item]`, `tooltip-content` and similar. |
| CSS | `tailwindcss` ^4.1.18, `tw-animate-css` | MIT | Tailwind v4 output: `--color-*` tokens, `px-(--viz-entity-inset)` syntax, lightningcss. |
| Command palette | `cmdk` ^1.1.1, with fuzzy search from `fuse.js` ^7.3 (threshold .4) | MIT | |
| Hotkeys | `react-hotkeys-hook` ^5.2.4 | MIT | Examples: `useHotkeys("mod+k")`, `useHotkeys("mod+s")`. |
| Panels | `react-resizable-panels` ^4.24, `vaul` (drawer), `sonner` (toasts) | MIT | |
| Icons | `lucide-react` ^1.6, `@hugeicons/react` | MIT | |
| Font | `@fontsource-variable/inter` ^5.2.8 | OFL | |
| Code | CodeMirror 6, `@monaco-editor/react`, `sugar-high` | MIT | |
| Export | `html-to-image` ^1.11.13 | MIT | |
| Other | `@modelcontextprotocol/ext-apps` **2.0.0** and `@modelcontextprotocol/server` 2.3.0 | MIT | Stately ships an MCP App too. log pins ext-apps 1.7.5. |

## 2. Layout algorithm and its options

From the `toElkGraph` function in `js/2jcmqco8wkwjd.js`:

- `elk.algorithm: "layered"` (Sugiyama). Direction is `(direction ?? "down").toUpperCase()`. Machines in the docs use RIGHT.
- `elk.spacing.nodeNode: 60` (the default `nodeSpacing`).
- `elk.layered.spacing.nodeNodeBetweenLayers: 90` (the default `rankSpacing`; minimum 56 for derived groups).
- `elk.hierarchyHandling: INCLUDE_CHILDREN` whenever compound nodes or cross-hierarchy edges exist.
- Each group gets `elk.padding: [top=<header height + pad>, …]`, which reserves the header band above the children.
- Ports: `elk.portConstraints: FIXED_SIDE`, with `elk.port.side` EAST/WEST/NORTH/SOUTH.
- Live routing: `elk.edgeRouting: ORTHOGONAL`, `elk.spacing.edgeEdge: 48`, `elk.spacing.edgeNode: 24`, `elk.layered.spacing.edgeNodeBetweenLayers: 24`, `elk.layered.unnecessaryBendpoints: true`, `elk.layered.nodePlacement.favorStraightEdges: true`, `bk.edgeStraightening: IMPROVE_STRAIGHTNESS`, `cycleBreaking: MODEL_ORDER`, `considerModelOrder.components: MODEL_ORDER`, `separateConnectedComponents: false`, `feedbackEdges: true`.
- Initial states are pinned with `layerConstraint: FIRST_SEPARATE` and final states with `LAST`.
- **Edge labels are laid out as real nodes** (mode `"edge-label-grouped"`, `transitionNodes[edge.id]`). Each label pill takes up space in its layer, so a long edge becomes source → pill → target. You can see this in the screenshots: the pill sits mid-edge, and the segments before and after it are separate paths.
- Fit view: `fit({ maxZoom: 1, padding: 0.1 })` on load, and `{ maxZoom: 2, padding: 0.1 }` for zoom-to-selection. The viewport is clamped to `minZoom 0.1` and `maxZoom 10`.

## 3. Node anatomy

These are `:root` tokens, measured in the DOM (`dom_light.json`):

```
--viz-entity-border: 2px        --viz-entity-radius: 6px
--viz-entity-inset: 12px        (header padding-x)
--viz-entity-header-y: 8px      (header padding-y)
--viz-entity-description-width: 384px (max description width)
```

- **Leaf node:** a box with a 2px border in `--state-border`, a 6px radius and `overflow:hidden`. The fill is `--state-fill`. The header is `flex-col gap-0.5`, padded `8px 12px`. Below it sits an optional effects row (`flex-wrap gap-3 px-3 py-1`).
  - The title is `.text-entity-title`: 20px/25px, weight 600, tracking −0.01em, `whitespace-nowrap`.
  - The description is `.text-entity-body`: 12px/16px, weight 400, in `--fg-muted`.
  - Section headings are `.text-entity-section`: 11px/16px, weight 600.
  - Measured sizes: 221×143 with a 2-paragraph description, 223×79 with one line, 129×45 title-only. Width hugs the content, and descriptions cap at 384px.
- **Compound (parent) node:** two stacked absolutely-positioned boxes.
  - The header band is `rounded-t-md border-2 border-b-0`, filled.
  - The body is `rounded-b-md border-2 bg-transparent`.
  - Children sit in the body. The header has a chevron (collapse) in front of the title.
- **Badges and icons:** these sit in front of the title.
  - Initial state: a dot-and-arrow glyph outside the top-left corner.
  - Final state: a ⊙ icon.
  - Parallel state: a split-box icon.
  - Children of a parallel region: dashed 2px borders.
  - Effects such as actions and invokes are "chips", using `--chip`/`--chip-border`/`--chip-fg` (`--viz-effect-chip-*`).
- **Selected node:** a 2px outer ring in the selection colour, offset outside the border (`--viz-highlight-color` = selection at 70%, width 4px). A floating mini-toolbar appears about 24px above the node, with "Zoom to selection" and "Open details".
- **Dimming:** while something is selected, unrelated nodes and edges drop to `UNSELECTED_OPACITY = 0.5`. Neighbours stay at 1, and hover goes to 0.8.
- **Colour per node:** set with `data-color=gray|blue|teal|green|yellow|orange|red|pink|purple`, which swaps `--entity-fill/border/ink/edge/label-fill` (table in section 5).

## 4. Edge style

- Paths are **straight orthogonal polylines** (`M x y L x y`), with no Bézier curves. Stroke is **2px** in `--state-border` (gray-500, #72758b) in both themes. Hover changes it to `--edge-hover` (gray-700 light / gray-400 dark), with a `.15s ease-out` stroke transition. A 16px invisible interaction path catches clicks.
- **Arrowhead:** a small closed triangle, `<marker viewBox="0 0 10 10" markerWidth=5 markerHeight=5 markerUnits=strokeWidth orient=auto><path d="M0,0 L0,10 L10,5 z" fill="context-stroke"/>`. Other markers defined: an open chevron, a closed chevron (6×6, `auto-start-reverse`), and a circle (`r=4`).
- **Label pill:** `border-2 rounded-label(14px) px-2 py-1 w-max`. It measured 45×28 for "next". The border is `--entity-edge`. The fill is `--entity-label-fill`, which is the state fill (in dark mode it's mixed 65% toward black). Text is 12–13px, weight 500–600. Guards render as `IF <guard>` rows inside the pill, and actions as chips.
- Selected or hovered labels are raised to z-index 1000.
- Simulation-path edges are dashed `6 4` and animate a draw-in (`90ms var(--ease-out-expo)`).

## 5. Palette (CSS variables)

### Base scale

| Token | Hex |
|---|---|
| gray-25 | #f5f7f7 |
| gray-50 | #eff1f3 |
| gray-100 | #dfe3e7 |
| gray-200 | #ced1da |
| gray-300 | #bdc2cc |
| gray-400 | #9da1b1 |
| gray-500 | #72758b |
| gray-600 | #606478 |
| gray-700 | #4d4f5f |
| gray-800 | #2e2f3c |
| gray-850 | #1f1f29 |
| gray-875 | #1a1a23 |
| gray-900 | #15151d |
| statelyBlue-50 | #e6f2fe |
| statelyBlue-100 | #cee6fa |
| statelyBlue-200 | #aed5fa |
| statelyBlue-300 | #90c7fc |
| statelyBlue-400 | #63a3fc |
| statelyBlue-500 | #0f6ee5 (primary) |
| statelyBlue-600 | #005cde |
| statelyBlue-700 | #2949a5 |
| statelyBlue-800 | #19296e |

### Semantic tokens

| Token | Light (`:root,.light`) | Dark (`.dark`) |
|---|---|---|
| --canvas / --background / --panel | gray-50 #eff1f3 | gray-900 #15151d |
| --floating (popover/card) | #fdfdfe | gray-850 #1f1f29 |
| --raised (muted/accent) | gray-100 #dfe3e7 | gray-800 #2e2f3c |
| --border | gray-100 #dfe3e7 | #ffffff1a |
| --border-strong | gray-200 #ced1da | #ffffff26 |
| --fg | gray-900 #15151d | gray-25 #f5f7f7 |
| --fg-muted | gray-700 #4d4f5f | gray-400 #9da1b1 |
| --primary | statelyBlue-500 #0f6ee5 | statelyBlue-500 #0f6ee5 |
| --primary-text | statelyBlue-600 #005cde | statelyBlue-400 #63a3fc |
| --state-fill (node fill) | gray-100 #dfe3e7 | gray-800 #2e2f3c |
| --state-border / --edge | gray-500 #72758b | gray-500 #72758b |
| --edge-hover | gray-700 #4d4f5f | gray-400 #9da1b1 |
| --chip / --chip-border | gray-25 / gray-200 | gray-850 / gray-700 |
| --selection (ring, handles) | blue-500 #3178aa | blue-500 #3178aa |
| --runtime (simulation/active) | statelyBlue-600 #005cde | statelyBlue-400 #63a3fc |
| --scrim | #0000004d | #00000080 |
| --success / --warning / --danger | green-600 / yellow-600 / red-600 | green-400 / yellow-300 / red-400 |

### Grid background

Two 1px linear-gradients on a **12px** grid, in `color-mix(gray-100 55%, gray-50)`. You can toggle it with "Hide grid".

### Entity colours

Each colour C uses these scale steps:

| Variable | Light | Dark |
|---|---|---|
| fill | C-100 | C-800 |
| border | C-400 | C-700 |
| ink | C-900 | C-100 |
| edge | C-600 | C-500 |

Hex values for the 400 and 500 steps of each colour (Stately's own scale, not Tailwind's):

| Colour | 400 | 500 |
|---|---|---|
| blue | #43abdf | #3178aa |
| teal | #48afc2 | #227c93 |
| green | #54b559 | #29833b |
| yellow | #da931e | #a06500 |
| orange | #f18622 | #c14f0f |
| red | #f17f7b | #d4332d |
| pink | #f571d3 | #cf249b |
| purple | #b092ee | #8355e5 |

Hex values for the fill, border and edge steps:

| Colour | 100 (light fill) | 800 (dark fill) | 600 (light edge) | 700 (dark border) |
|---|---|---|---|---|
| blue | #beeaf9 | #123153 | #27699c | #20527f |
| teal | #c3eaee | #103348 | #166d8b | #1c5572 |
| green | #c9edbc | #14371c | #0f7528 | #265a2f |
| yellow | #fde283 | #432b00 | #905900 | #714700 |
| orange | #ffdeae | #561e00 | #af4108 | #8a3500 |
| red | #f8dcd8 | #5d1219 | #bd2b29 | #982020 |
| pink | #fdd7fd | #5d0843 | #bd0c8b | #95146b |
| purple | #edddfb | #341c79 | #7245dc | #5c31b9 |

## 6. Typography

- **Family:** `--font-sans: "Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`.
- **Mono:** `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`.
- **Base:** 16px/1.5, weight 400. UI text uses `--text-sm` .875rem and `--text-xs` .75rem.
- **On the canvas:** titles 20/25 at 600 (−0.01em), body 12/16 at 400, section 11/16 at 600, edge labels about 12–13px.
- **Radii:** `--radius-sm` 4px, `--radius-md` 6px, `--radius-lg` 8px, label 14px.
- **Motion:** `--ease-out-expo: cubic-bezier(.16,1,.3,1)`, `--duration-standard: .15s ease-out`.

## 7. Chrome, side panel and inspector

- **Top bar** (about 32px):
  - Centre: a command field ("Search or run a command…", `Ctrl+K`), about 286px wide.
  - Right: an amber "Read-only" badge and a "Details" toggle.
- **Top-left:** a breadcrumb pill (`root › States › Initial state`) that follows the selection and drills into compound nodes.
- **Bottom-left:** a zoom pill ("100%" and fit-to-content ⛶). It expands to −/+.
- **Bottom-centre:** a segmented mode toolbar: Select (filled primary blue), Pan (hand) and Simulate (▶).
- **Bottom-right:** "Canvas options", a sliders icon. It opens a menu with Fit to content, Switch to list view, Mode, Settings, Help and the version.
- **Right inspector:** an `<aside>` **360px** wide with `bg-panel`, a `border-l` of 1px `--border`, and the full height. It pushes the canvas over instead of covering it, and closes with ×. It holds:
  - the header "State details";
  - labelled fields stacked with about 12px gaps: Name (input), State type (select), an Initial-state toggle, Parent state (select), and Description (a bordered multi-line box);
  - a collapsible "Layout" section with an ⓘ.
  - The labels are 13px/500 and the inputs are 28–32px tall with radius 6px.
- **"Switch to list view":** an accessible outline view of the same graph.

## 8. Interactions

| Interaction | Behaviour |
|---|---|
| Select | Click a node or label: ring + mini-toolbar + breadcrumb update. Others dim to 0.5. Keyboard focus shows a 2px `--viz-highlight-color` outline at −2px offset. |
| Hover | Edge stroke goes to `--edge-hover`, the label is raised, and the node gets a 0.8 opacity cue. |
| Pan | Drag on the pane (`cursor:grab/grabbing`), or Pan mode (H). Wheel and trackpad scroll pan; Ctrl/pinch zooms. Arrow keys move or navigate (map `ArrowLeft→left` …). Auto-pans near edges while dragging. |
| Zoom | Clamped to 0.1–10. The viewport is a `transform: translate() scale()` with `--flow-zoom` and `--flow-inverse-zoom` vars, so the chrome can counter-scale. |
| Fit | `Shift+1` fits content (`maxZoom 1, padding .1`). `Shift+2` zooms to the selection (`maxZoom 2`). Auto-fits after the first auto-layout. |
| Details | `Ctrl+Enter` opens the inspector. `Ctrl+,` opens settings. `?` opens help. `Ctrl+K` opens the palette. |
| Palette | A cmdk palette grouped Suggested / View / Machine / Workspace / Help: Go to state, Go to transition, Expand/Collapse all, Switch to dark mode, Hide grid, Hide validations, Open machine code, Compare machine. |
| Collapse | A chevron on compound nodes. "Expand all states" / "Collapse all states". |
| Minimap | The engine has `getMinimapProjection` and `getMinimapViewportCenter` (in `js/2-eybig0s36bz.js`), but the read-only viz didn't show a minimap. |
| Theme | `.dark` class on `<html>` through next-themes, or the `theme=` URL param. Light is the default, and `color-scheme` is set. |
| Accessibility | "Skip to canvas" link, `aria-label` on every button, forced-colors fallbacks (`stroke: canvastext`, `outline: highlight`). |

## 9. Build ours like this (log Relate graph MCP App)

### Stack

The app must be one self-contained HTML file that runs in the MCP Apps iframe, with no CDN or network. log already has React 19.2.7 and `@modelcontextprotocol/ext-apps` 1.7.5, and its existing apps live in `src/mcp/apps/*` (browserView, report).

1. **Rendering: `@xyflow/react` 13.x (MIT).** It's the battle-tested original of Stately's engine. It gives you custom nodes and edges, `fitView`, `MiniMap`, `Controls`, `Background variant="lines" gap={12}`, keyboard access, and an `onlyRenderVisibleElements` option for large graphs.
   - The alternative is `@statelyai/flow` + `flow-react` (MIT), which reproduces Stately exactly but is at v0.x (0.14), so its API isn't stable.
   - Pick xyflow for the hackathon. `@statelyai/graph` (MIT) is optional as a plain-JSON model and converter.
2. **Layout: there's no MIT/Apache ELK.** elkjs and @statelyai/layout are EPL-2.0/GPL-3.0.
   - **Preferred: `@dagrejs/dagre` 3.x (MIT).** Use `rankdir:'LR'`, `nodesep:60`, `ranksep:90`, `edgesep:24`, `marginx/y:48`, which are Stately's numbers. Then draw edges with xyflow's `getSmoothStepPath({ borderRadius: 0 })` for Stately's square orthogonal look (or `borderRadius: 6` to soften it).
   - Insert each edge label as a small dagre node (Stately's "edge-label-grouped" trick), or use dagre's `labelpos:'c'` with `width`/`height` set on the edge.
   - If the owner accepts EPL-2.0 for an unmodified bundled dependency, `elkjs` `layered` with the exact options in section 2 gives better compound and orthogonal results. Run it via `elk.bundled.js` inline, not the worker URL, because the iframe has no separate worker file. Record that licence decision.
3. **Styling:** plain CSS variables copied as values (section 5), or Tailwind v4 compiled to one file. **Inter is OFL**, so embed it with `@fontsource-variable/inter`, base64-inlined. Otherwise fall back to the system stack so the HTML stays small.
4. **Other libraries:**
   - `cmdk` (MIT) for "Go to node…".
   - `lucide-react` (ISC) for icons.
   - `react-hotkeys-hook` (MIT).
   - Skip shadcn, liveblocks, monaco and other heavy dependencies.
5. **Bundle:** Vite + `vite-plugin-singlefile` (MIT), or Bun's bundler with the CSS and font inlined, emitted as the `text/html;profile=mcp-app` resource the way `src/mcp/apps/report` does it. Target a size under 600 KB gzipped: xyflow (about 50 KB gz) + dagre (about 30 KB gz) + React.

### Node kinds → Stately anatomy

All nodes use a 2px border, 6px radius, a `8px 12px` header, a 16–20px/600 title, a 12px muted subtitle, and chips for counts. Width hugs the content with a 384px cap.

| Relate node | Shape | `data-color` | Header icon (lucide) | Subtitle / chips |
|---|---|---|---|---|
| Person | Leaf, the anchor of the view (bigger title, 20px) | purple | `user` | Linked-accounts count, last seen |
| Identity | Leaf | pink | `fingerprint` | Confidence chip |
| Account | Leaf | blue (or the platform hue) | platform glyph (`at-sign` fallback) | `@handle` mono 12px, platform chip |
| Server | **Compound** (header band + body), the way Stately draws a parent state | teal | `server` | Member count. Its channels sit inside |
| Room: channel | Leaf inside its Server | teal | `hash` | Message count |
| Room: group | Leaf, **dashed border** (like a parallel region's child) | green | `users` | Member count |
| Room: dm | Leaf, small (title-only, 45px tall, like Stately's title-only node) | green | `message-circle` | — |
| Post | Leaf, body text clamped to 3 lines (Stately's description, 12px) | gray (`--state-fill`) | `file-text` | Platform + date chip |
| Event | Leaf, ⊙-style circular badge in front of the title (like the final state) | orange | `calendar` / `zap` | Timestamp |

### Edge types → Stately edges

All edges are 2px and orthogonal, with the 5×5 `context-stroke` triangle and a 14px-radius label pill (2px border in the edge colour, fill = state fill).

| Relate edge | Colour | Line | Label pill |
|---|---|---|---|
| SAID (Account→Post) | gray `--edge` | Solid | "said" |
| REPLIED_TO (Post→Post) | gray | Solid, open-chevron marker | "replied" |
| MEMBER_OF (Account→Room) | green-600 / 500 | Solid | "member" |
| IN_SERVER (Room→Server) | **None.** It becomes containment (Room drawn inside the Server compound), like Stately's parent/child. Show it as a dashed edge only when collapsed. | — | — |
| ENGAGED (Account→Post) | orange-600 / 500 | Solid | "liked / replied ×N" |
| FOLLOWED (Account→Account) | blue-600 / 500 | Solid | "follows" |
| LINKED_TO (Account/Identity→Person) | purple-600 / 500 | **Dashed `6 4`**, because it's inferred. Circle marker at the source. | Confidence "0.92" |

Parallel edges between the same pair collapse into one pill, "×N", as Stately groups transitions.

### Layout defaults

- Direction RIGHT.
- Initial layer: Person (the focus node), the way Stately pins `FIRST_SEPARATE`.
- Posts and Events go in the last layers (`LAST`).
- nodeNode 60, between-layers 90, edge-edge 48, group padding top = header height + 12.
- After layout, `fitView({ padding: 0.1, maxZoom: 1 })`.

### Interactions to copy

- **Selection:** a blue ring plus 0.5 dimming of non-neighbours, so the ego network stands out. A floating mini-toolbar over the selection offers "Expand neighbours", "Open details" and "Zoom to".
- **Hover** darkens the edge.
- **Inspector:** a 360px right `<aside>` with "Node details" and stacked fields (kind, platform, handle, first/last seen, counts), a "Connections" list grouped by edge type, and a "Cypher" collapsible showing the query. In a narrow host iframe, render it as a bottom sheet below 720px.
- **Chrome:** breadcrumb top-left (Person › Account › Room), zoom pill bottom-left (%, −, +, fit), mode toolbar bottom-centre (Select / Pan / ▶ "Replay timeline" instead of Simulate), canvas options bottom-right (grid, minimap toggle, light/dark, list view).
- **Hotkeys:** `Ctrl+K` palette (Go to node / edge type filter), `Shift+1` fit, `Shift+2` zoom to selection, `Ctrl+Enter` details, `Esc` clear, `H`/`V` pan/select, `?` help.
- **Zoom limits:** 0.1–4. 10 is unnecessary for a social graph.
- **Minimap:** turn on xyflow `<MiniMap>` over about 60 nodes. Stately's engine supports one even though the viz hides it.
- **Theme:** follow the host's `theme` from ext-apps `hostContext` and set `.dark` on `<html>`. Ship both token sets from section 5.
- **Large graphs:** collapse Servers by default, show a "+N more" chip on hubs, and let `onlyRenderVisibleElements` cull the rest.

### Licence checklist

| Library | Licence |
|---|---|
| @xyflow/react | MIT |
| @dagrejs/dagre | MIT |
| react / react-dom | MIT |
| @statelyai/graph | MIT (optional) |
| cmdk | MIT |
| lucide | ISC |
| react-hotkeys-hook | MIT |
| Inter | OFL-1.1 |
| vite-plugin-singlefile | MIT |
| **elkjs** | **EPL-2.0 (avoid, or record the decision)** |

## Screenshots

All are 1440×900, in [images/](images/):

| File | Shows |
|---|---|
| [01_canvas_light.png](images/01_canvas_light.png) | Canvas, light mode: leaf, compound, parallel and final nodes, pills, grid, chrome |
| [02_node_selected_light.png](images/02_node_selected_light.png) | Selection ring, mini-toolbar, dimming |
| [03_details_panel_light.png](images/03_details_panel_light.png) | The 360px State details inspector |
| [04_canvas_options.png](images/04_canvas_options.png) | The bottom-right options menu |
| [05_command_palette.png](images/05_command_palette.png) | The cmdk palette with its shortcut list |
| [06_simulate_light.png](images/06_simulate_light.png) | The Simulate click didn't switch modes in the read-only embed, so this is the same view as 03 |
| [07_canvas_dark.png](images/07_canvas_dark.png) | Canvas, dark mode |
| [08_node_selected_dark.png](images/08_node_selected_dark.png) | Selected compound node, dark mode |
