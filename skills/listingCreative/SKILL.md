---
name: listingCreative
description: Make a listing's photos as a scene, an action, a before and an after, in the composition of winning junk removal creatives, generate each frame once, then show them inside the iPhone Photos viewer with the town in the title and faces scribbled out in red. Use when matt asks for new creatives, photos for a listing, a before/after, or to "put them in the camera roll".
---

# listingCreative

How a listing's photos are made. The words are `listingCopy`'s job; this is the
pictures. The research behind it is in the workspace's
`RESEARCH/JUNK_REMOVAL_CREATIVES/`: `creatives.jsonl` (58 winner frames, one per
line, from real Craigslist and Marketplace junk removal listings),
`CREATIVE_RUBRIC.md`, `subqReading.json` (what SubQ says a winner is) and
`spinOuts.jsonl`.

## Hard boundaries

- **matt's concept comes first.** Never judge or replace his creatives; build on
  them. Report what the winners show as data, never as a verdict on his work.
- **No text and no logos inside a generated image.** No letters, numbers, brand
  names, signs, number plates or printed paper. Every prompt says so and every
  avoid list repeats it.
- **No phone or interface words in a prompt.** "Shot on an iPhone" made the
  model draw a Photos app screen into the picture (Verizon, a clock, a date bar).
  Prompt the photo only; the phone around it is `photosViewer.html`.
- **Generate each frame once, then show matt.** Never regenerate on your own
  judgement. Generation costs money (rule 41): ask before anything he didn't say.

## The rubric: scene, action, before, after

What SubQ read from the 58 winner frames (`subqReading.json`, 2026-10-23):

| | Winners |
|---|---|
| Scene | an interior room or a side yard along a fence, then a garage |
| Action | the truck at the house and crew mid-job (99%) |
| Before | a room's or a yard's worth of junk (95%), raw phone snapshot (95%) |
| After | the exact same spot and angle (99%), bare (88%) |
| People | a homeowner almost never in frame |

Per creative: one scene, then `before`, `action` and `after`. The action and the
after are edits of the before (it is the reference image), so the place and the
people match.

## Generating

`reapi.image-gen.gemini-3-pro-image` through treg ($0.034 an image at 2K,
`"size": "9:16"`, `"resolution": "2K"`). It answers with a task id; poll
`reapi.tasks.get` every 10 s. Reference images must be public HTTPS URLs, so
the before's own output URL is passed to its action and after (valid about 7
days). A photo only on this machine can't be a reference there.

Frames go in `~/.logCli/listings/<creative>/` as `before.jpg`, `action.jpg`,
`after.jpg`, each with a line in that folder's `images.jsonl` (prompt, avoid,
task, credits).

## The phone: Photos viewer, place and scribbles

`python/creative/photosViewer.html` is the iOS 26 Photos viewer, matched to a
screenshot of matt's phone: status bar, glass back button, the title pill
(the town, then date and time), the ••• button, the photo fitted to the width
on black, the filmstrip with the current photo larger, and the share, heart,
info, edit and trash controls. It renders at 1179 × 2556, a real iPhone
screenshot.

Each listing folder gets a `viewer.json`:

```json
{
  "place": "Bethlehem",
  "frames": {
    "before": { "when": "October 21  10:12 AM", "clock": "2:21", "battery": 72,
                "faces": [{ "x": 205, "y": 1266, "w": 225, "h": 225 }] }
  }
}
```

- `place` is the account's town, shown on every frame.
- `faces` are whole heads, hair to chin, in image pixels. Measure them on a
  zoomed crop with a pixel grid, never from a whole-image grid: rough boxes
  left faces showing.
- Every face is scribbled out in red (`#ff3b30`), messy like a hand with the
  Markup pen: three overlapping passes at different angles, an uneven oval, a
  stroke or two past the edge. They must cover the whole head.

```bash
C:\Python312\python.exe python/creative/renderListings.py
C:\Python312\python.exe python/creative/renderListings.py basementWoman
C:\Python312\python.exe python/creative/renderViewer.py <image> <out.png> --faces "[...]" --place Bethlehem --when "October 21  10:12 AM"
```

`renderListings.py` renders every folder that has a `viewer.json` into its
`viewer/` folder. The filmstrip is made from the listings' own frames, never
anyone else's photos. It drives the system Edge headless through Playwright,
so nothing is downloaded.

## Checking

Show matt every frame (a sheet of all of them, plus one at full size), then
crop each scribble and look at it before saying the faces are covered. SubQ can
then score the made frames against the winners, the same way
`subqReading.json` was made.
