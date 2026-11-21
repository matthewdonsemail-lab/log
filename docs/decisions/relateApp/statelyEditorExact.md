# stately editor, exact computed CSS (signed-in live editor, 2026-11-22)

Back to [the relateApp research](research.md). Related: [the public viz measurements](stately.md), [tokens.json](tokens.json) and [tokens.css](tokens.css), which hold these values as the view uses them (`src/relate/machine/theme.ts`).

Source: getComputedStyle on `[data-component="graph-node"]`, `[data-component="graph-edge"]` (`.css-14t0yaf` wrapper) and their children, 8 machines (adStrategy, briefBuilder, Creativ Launch, Grow Twitter Following, MCP Mentor, publishAppCapitalOne, videoCreation, Would You Invest Content Pipeline), light (`chakra-ui-light`) and dark (`chakra-ui-dark`). Raw dumps: `*/light|dark/styles.json`, `tokens/light.json`, `tokens/dark.json`. Screenshots: `*/light|dark/fit.png` (whole machine) and `canvas.png` (100% close-up).

## Shared
- font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif
- base 16px/24px weight 400
- canvas grid: SVG pattern path `M 24 0 L 0 0 0 24`, 1px stroke, 24px cells

## Light
- page / canvas background: rgb(245, 246, 250)
- text: rgb(26, 28, 40)
- default border: rgb(193, 196, 215)
- grid line stroke: rgb(174, 213, 250)
- machine root header bar: bg rgb(217, 219, 232), 1px border, radius 4px, height 30px, inner padding 2px 12px, gap 12px
- machine title: 13px / 19.5px weight 600, color rgb(26, 28, 40); "Key" label 13px 500 rgb(70, 74, 98) opacity 0.4
- edge label pill (`.css-n5bk2e`): radius 20px, padding-right 4px, box-shadow `rgb(255,255,255) 0 0.5px 0 0 inset, rgba(0,0,0,0.08) 0 0 0 1px, rgba(0,0,0,0.06) 0 1px 0 0, rgba(0,0,0,0.04) 0 2px 2px 0`
- edge label header (`.edge-label-header`): radius 16px (16px 16px 0 0 when it has effects), padding 8px 0, header row padding-left 16px gap 4px
- event name: 13px / 19.5px weight 600 color rgb(45, 49, 67), uppercase as typed, padding-left 4px radius 4px
- secondary text: rgb(100, 105, 135) 13px 600
- action box (`.editable`, data-component EffectBox): bg rgb(236, 237, 244), 1px border rgba(134, 139, 167, 0.36), radius 4px, padding 4px 8px, 12px / 18px weight 500, shadow `rgba(0,0,0,0.05) 0 3px 6px -3px, rgba(0,0,0,0.05) 0 2px 4px -2px, rgba(0,0,0,0.05) 0 1px 2px -1px`
- action name italic 12px 500; action sub-line italic 12px 500 rgb(70, 74, 98), padding 4px 0 4px 24px
- effects block: padding 4px 0 12px, inner padding 0 4px 0 20px
- icon stroke rgb(70, 74, 98) 2px
- STATE NODE (measured on publishAppCapitalOne `design` 137x87 and `archDesignReview` 225x87):
  - outer: radius 4px, border color rgb(193, 196, 215), selection outline 3px
  - header: bg rgb(255, 255, 255), 1px top border, radius 4px 4px 0 0, height 42, padding 8px 12px, gap 12px
  - state name: 15px / 22.5px weight 600 rgb(26, 28, 40), padding-left 4px
  - body: radius 0 0 4px 4px, height 45, padding 12px 0, gap 12px; description box padding 12px 16px
  - description text: 13px / 19.5px weight 400 rgb(26, 28, 40); secondary meta rgba(0, 0, 0, 0.64)
  - body background tint: sample from `publishAppCapitalOne/light/canvas.png` (computed bg is on a transparent wrapper)
  - initial state: green 1px outline (screenshot) + filled black dot with short arrow into the header
  - edge stroke rgb(160,165,190)-ish grey 1.5px with right-angle routing and rounded corners, arrowhead filled (sample from screenshot)

## Dark
- page background: rgb(16, 17, 25)
- text: rgb(255, 255, 255) node / rgb(236, 237, 244) canvas
- default border: rgba(255, 255, 255, 0.16)
- grid line stroke: rgb(33, 34, 44)
- machine root header bar: bg rgb(26, 28, 40)
- machine title color rgb(236, 237, 244); "Key" label rgb(134, 139, 167) opacity 0.4
- edge label pill: same geometry, box-shadow `rgba(0,0,0,0.45) 0 0 2px 0, rgba(255,255,255,0.12) 0 0.5px 0 0 inset, rgba(0,0,0,0.08) 0 0 0 1px, rgba(0,0,0,0.1) 0 1px 0 0, rgba(0,0,0,0.06) 0 2px 2px 0`
- event name color rgb(217, 219, 232)
- icon stroke rgb(165, 169, 192)
- STATE NODE: header bg rgb(45, 49, 67), border rgba(255, 255, 255, 0.16), name 15px weight 500 (not 600) rgb(255, 255, 255), description rgb(236, 237, 244), meta rgba(255, 255, 255, 0.64)
