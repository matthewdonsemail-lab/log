# Research: the Relate state machine view (#267)

Written 2026-11-22 for the Relate hackathon entry. The visual research on Stately's editor is in [stately.md](stately.md), with its screenshots in [images/](images/). Back to [Research and decisions](../README.md).

## What the owner asked for

Not a who-knows-who graph. A relationship drawn as a state machine: the states are where it stands (new, follows you, talks to your followers, engaged with you, in conversation) and the people a route passes through; the transitions are the moves that push it on, each with the log tool that makes it; the person's real history is the path taken; where it stands now is highlighted and the next move is the outgoing transition. Three views: one person, the route to someone, the whole network with counts.

## Decisions

| Question | Picked | Why |
| --- | --- | --- |
| A standalone MCP App, or a block | A `stateMachine` block in the `report` view's block list, which `relateMachine` returns | Any report can carry it, and it reaches every host the report view already reaches (MCP Apps, Hermes Desktop, text). One bundled file, no CDN. |
| Rendering engine | SVG strings from our own code (`src/relate/machine/render`), wrapped by a small React component in the report kit | `@xyflow/react` is not installed and a new dependency was out of scope; the vendored diagram skill (`vendor/diagram`) already defines the primitives: start dot, masked labels, orthogonal connectors leaving each face perpendicular, fanned ports, accessible `title`/`desc`. |
| Layout | A deterministic layered layout in `render/layout.ts`: longest-path ranks after breaking cycles in model order, edge labels placed as nodes between ranks (Stately's grouped edge labels), barycenter ordering, orthogonal routing with rounded corners, back edges on an outer lane | `node_modules` has no `@dagrejs/dagre` or `elkjs`; only `dagre-d3-es` arrives through mermaid, which is not a direct dependency. ELK's licence (EPL-2.0) was also a reason in [stately.md](stately.md). |
| Direction | Left to right when it fits the frame at 72% or more, else top to bottom; the toolbar turns it | Six states in a row are about 2,800 px wide, too small to read in a chat column. |
| Look | Stately's tokens from section 5 of [stately.md](stately.md): 2px borders, 6px radius, 14px label pills, 12px grid, a selection ring, a 360px details panel, dimming to 0.5 on selection; Inter by name, falling back to the system font | All of it lives in one file, `src/relate/machine/theme.ts`, so a later read of Stately's bundle can retune it without touching the drawing. |
| Theme | CSS variables for both palettes; dark when the host sets `data-theme="dark"` or `.dark`, or the system prefers dark | The same rule the report kit follows. |

## Progress

| Step | State |
| --- | --- |
| States and moves from the Relate graph and log.db's interactions | built |
| Person, route and network views | built |
| `stateMachine` report block, text fallback | built |
| `relateMachine` tool and `log relate machine` | built |
| Screenshots of each view in light and dark from the demo world | taken, below |
| Upstream genui blocks (show_blocks) drawing the same block | not built |
| Inter embedded as a font file | not built |

## Screenshots (demo world, `src/relate/machine/fixtures/machineWorld.ts`)

| View | Light | Dark |
| --- | --- | --- |
| One person's machine | [light](images/machine_person_light.png) | [dark](images/machine_person_dark.png) |
| The route to someone | [light](images/machine_route_light.png) | [dark](images/machine_route_dark.png) |
| The network by state | [light](images/machine_network_light.png) | [dark](images/machine_network_dark.png) |
