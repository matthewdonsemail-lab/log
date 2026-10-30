# facebookMarketplace

Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `listings` | List the Twenty listings |
| `listing` | One listing in full |
| `listingCreate` | Create a listing in Twenty from a listing.json |
| `listingRemove` | Delete a listing on Facebook from its account's Selling page, then… |
| `listingRemoveLive` | Delete a listing on Facebook from its account's…, live on Facebook |
| `listingSweep` | Mark every listing of a blocked account ACCOUNT_LOST |
| `listingLint` | Check a listing.json against the copy rules and the create form… |
| `publish` | Post one Twenty listing |
| `publishLive` | Post one Twenty listing, live on Facebook |
| `campaign` | Put one ad on N accounts in one place, replace lost accounts, publish… |
| `campaignLive` | Put one ad on N accounts in one place, replace lost…, live on Facebook |
| `conversations` | List the buyers' conversations |
| `conversationShow` | A conversation and its messages |
| `conversationRead` | Mark its messages read |
| `conversationLead` | Set its lead status |
| `conversationLink` | Link it to its listing |
| `conversationRecord` | Store scanned threads |

## The work, step by step: accountToDryRun

From `skills/accountToDryRun/SKILL.md`.

## accountToDryRun

Every step is an `mcp__log__*` tool (the `log` MCP server, `bun run mcp`).
The same thing works in a terminal as `bun bin/log.ts <command> <args>`.
Nothing here posts to Facebook. Going live is the last step, and only when
matt says so.

### Hard boundaries

1. **Waking hours (rule 18).** Steps 3 to 6 open the browser, so they only run
   between 08:00 and 22:00 in the account's home timezone. For Pennsylvania
   that's 12:00-02:00 GMT (EDT, until 1 Nov) or 19:00-09:00 in Vietnam. Outside
   that, every step returns `outsideActiveHours`. When matt asks for a run
   outside those hours, add `"--bypass"` to the args (rule 20). It skips only
   the hours; the proxy gate and self-check still run.
2. **No browser without the proxy (rule 12).** Step 1 must pass first.
3. **Someone watches the window (rule 11).** Camoufox is always visible. If
   the cookies don't hold, matt signs in in that window during step 3.
4. **`checkpointed` or `suspended`: stop.** Tell matt and don't retry.
5. **Dry run only.** `publish` without `--live` stops before the Publish
   button. Live is its own tool, `publishLive`, with `confirmLive: true` and matt's go (rule 10).

### The steps

`<a>` is the account's name (the Facebook id, e.g. `61594387282311`).

#### 1. Proxy (no browser)

```text
mcp__log__accountShow   { account: "<a>" }                  Proxy set? Exit checked?
mcp__log__proxy     args ["check", "--account", "<a>"]    exit IP in the home country
```

If no proxy: `["assign", "--account", "<a>", "--region", "<state>"]`. It
retries until the exit is within 100 km of the home city, or says
`proxyTooFar` and saves nothing.

#### 2. Setup (no Facebook)

```text
mcp__log__doctor    args ["--json"]    Python, Camoufox and Twenty OK
```

#### 3. Sign in: NEEDSLOGIN → ACTIVE

```text
mcp__log__connect   args ["--account", "<a>"]
```

The tool always runs `--noPrompt`. Camoufox opens through the proxy on the
account's device. If the vendor cookies are still logged in, it saves them
and ends within seconds. If not, it **signs in by itself** (rule 21): it types
the Twenty email and password, then on the two-step page the current code
from `totpSecret` (switching to "Authentication app" if Facebook offers
another method first), and trusts the device. This is the connect machine
(`marketplace/connect/machine.ts`): each page is printed as its kind and
state; nothing secret is. Every page takes Listaro's path (rule 23): the
cookie banner is accepted, "We suspect automated behaviour" dismissed, login
captchas solved (CaptchaKraken, then 2Captcha). Only an identity, photo, video
or SMS checkpoint is never clicked: it waits for matt in the window. It reads for up to 600 s
(`--wait <s>` to change it). Signed in: the session is saved to Twenty and
the account set **ACTIVE**. It can also end `checkpointed` (status
CHECKPOINT), `wrongPassword`, `disabled` (BANNED) or `signInNotFinished`
(NEEDSLOGIN), each naming the last page.

Before the first connect, the account needs `email`, `password` and
`totpSecret` in Twenty: `node scripts/twenty/importVendorAccounts.mjs` (dry run, each
field `<set>`/`<empty>`), then `--apply`. It reads every `docs/vendors/*.txt`.

Check it:

```text
mcp__log__accountShow   { account: "<a>" }    Status ACTIVE, May run yes
```

`signInNotFinished` or `checkpointed` means the wait ran out on the page it
names. Run step 3 again with someone at the window.

#### 4. Read the account (read-only)

```text
mcp__log__scan      args ["--account", "<a>"]    Marketplace > Selling loads
```

#### 5. The listing row in Twenty

Write the ad as JSON. Photos are local paths or URLs, and the first one is
the cover:

```json
{ "title": "...", "description": "...", "price": 99, "priceCurrency": "USD",
  "category": "Miscellaneous", "condition": "new", "photos": ["C:/.../1.jpg"],
  "locationQuery": "Philadelphia, PA", "locationCity": "philadelphia", "locationCountry": "US" }
```

```text
mcp__log__listingCreate   { account: "<a>", file: "<path.json>" }
mcp__log__listing         { id: "<listingId>" }
```

`create` checks the ad the way `publish` will (price, category, photos,
location) and refuses one that can't post.

#### 6. Dry run

```text
mcp__log__publish   { listing: "<listingId>", formUrl: "file:///<repo>/python/fixtures/createItem.html" }
mcp__log__publish   { listing: "<listingId>" }
```

The first run fills the saved copy of the form and never touches Facebook. The
second goes to the real create page and runs every machine step (proxy gate,
self-check, session, photos varied and attached, title, price, category,
condition, description, location picked in the home country), then stops
before Publish. Each step is printed. Look for `dryRun` at the end. Any other
ending is a code: `mcp__log__errors { code: "<code>" }`.

Before photos go up, the open step reads the account's Marketplace location
from the page (`sell_location`). The US form has no Location field: if that
isn't the listing's city, it stops there with `locationNotSet` and names the
place ("Kearney (68847, US)"), and nothing is uploaded. The listing's
`locationQuery` is "City, State" with the state written out ("Reading,
Pennsylvania"): a `--live` run then sets the account's Marketplace location
to it first (Marketplace > Location > Change location > the place > the
suggestion Facebook names as that place > Apply,
`CometMarketplaceSetBuyLocationMutation`) and checks the form again. A dry
run never changes it. A zip, a number or an abbreviation ("Reading, PA") is
never typed: it is refused with `locationAbbreviated` before the run, because
"Bethlehem, PA" was offered only as the West Bank and a bare zip offered
Granada, Spain (rule 72). A login wall or checkpoint on the form is signed
through in the same browser (rule 24).

**Rule 24: launches cost.** Each account opens on Facebook at most 8 times
per local day, 10 minutes apart, dry runs counted (`launchTooSoon`,
`launchBudgetSpent`). The fixture-form run doesn't count. Fix what a run
reports before running it again; don't loop dry runs. On 2026-10-19 one
account opened 14 times in 90 minutes and went to a video-selfie checkpoint
(`RESEARCH/LOG_CLI_RUN_CAPTURES_2026_10_19.md`).

#### 7. Live (only on matt's go)

A new account's listing is published but **held for review**: Facebook's
Selling page carries `integrity_status_indicator: "This listing is being
reviewed."` (with `is_live: true`). It is listed, but buyers who open its
link are sent to the city's Marketplace page until the review clears, and
Facebook offers no way to hurry it (`appeal_status: appeal_not_exist`; an
appeal exists only after a rejection). The run reads the id from Facebook's
own answer to Publish (`useCometMarketplaceListingCreateMutation`), says
"Held for review", and writes the row UNDER_REVIEW, not ACTIVE. A later
`log facebook scan` moves it to ACTIVE once the badge is gone. Reading's first listing,
2026-10-19, was held this way.

```text
mcp__log__publishLive   { listing: "<listingId>", confirmLive: true }
mcp__log__scan      args ["--account", "<a>"]
```

Once Publish is clicked nothing is retried (rule 10).

## The work, step by step: listingCopy

From `skills/listingCopy/SKILL.md`.

## listingCopy

The rules for a listing's words and photos. They come from what high-response
classified and service ads do, found through TinyFish (rule 53) on 2026-10-23;
the sources and findings are in the workspace's
`RESEARCH/LISTING_COPY_RESEARCH.md` (letters A-F below). The listing's fields
and how its photos reach Facebook are in `docs/listingMedia.md`.

The test under every rule (D): **bad copy describes the seller, good copy
describes the reader's situation.**

### Before writing

Write these down first (D's method):

1. What the reader believes right now, in their words: "My garage is full and I
   don't know who'll take it all."
2. The one thing they should believe after reading: "I send a photo and get a
   price, and they take everything."
3. The objection in the way: price, hassle, trust, time. The copy answers it.

Facts the copy may claim only when matt has said they are true: same-day
pickup, licensed, insured, the towns served, each price. If one isn't known,
leave it out; never guess it (E: be honest).

### Title

| Rule | ✅ Good | ❌ Bad |
| --- | --- | --- |
| The exact service, the city, one real benefit (A, B, C) | `Junk Removal Bethlehem PA – Free Quote From a Photo` | `Junk Removal & Cleanouts: Houses, Garages, Basements` (no city, no benefit, a list of places) |
| Under about 70 characters, so it isn't cut off (A); 100 is Facebook's limit (`validateListing`) | `Garage & Basement Cleanouts Bethlehem – Same-Day Pickup` (55) | a title that runs past 70 and loses its end in search |
| The words people search with (A) | `junk removal`, `haul away`, `cleanout` | `residential debris solutions`, `decluttering services` |
| No caps, no hype words, no symbol strings (E, F, A) | `Junk Removal Bethlehem PA – Free Quote` | `JUNK REMOVAL!!! ⭐ CHEAP ⭐ WOW` |
| One service per listing (B, A, E) | `Hoarder Cleanouts Bethlehem PA – Free Quote` | `We Do Everything – Junk, Moving, Cleaning, Yard` |

### Description

It answers three questions, in this order (A): what you do, why pick you, how
to get a price.

| Rule | ✅ Good | ❌ Bad |
| --- | --- | --- |
| Open with the reader's situation, not the seller (D) | `Garage you can't park in? Basement full of boxes?` | `Junk removal and full cleanouts in Bethlehem and nearby.` |
| Services as a short list to scan (A, C) | `• Furniture, mattresses, appliances` on its own line, one group a line | one sentence listing nine things |
| Prices as numbers (A, C) | `Small load (a few items): $99` | `Great prices!` / `Call for pricing` |
| Never "cheap"; say "free quote" (B) | `Free quote from a photo` | `Cheapest junk removal in town` / `affordable` |
| Say what happens next (A) | `1. Send a photo 2. Get your price 3. We load, haul and sweep up` | nothing about how it works |
| Credentials and area only if true (A, C) | `Bethlehem, Allentown and Easton` (once matt confirms them) | `Licensed & insured` with no licence |
| The call to action in the reader's words, naming what they get (D, A) | `Send a photo of the pile here and get your price` | `Contact us` / `Inquire within` |
| Plain tone, no exclamation marks (B, D) | `We take it all and leave it swept.` | `Best service ever!!! Don't miss out!!!` |
| Real urgency only, a fact (D) | `Pickup tomorrow if you message today` (only if true) | `Limited time offer!` |
| Paragraphs of two or three lines, no walls of text (A) | short blocks with a blank line between | one 10-line paragraph |
| Spell-checked, one language (E, F) | | typos, mixed languages |

### Photos

| Rule | ✅ Good | ❌ Bad |
| --- | --- | --- |
| 4 to 6 photos of real past jobs (A) | the pile, the truck loaded, the room empty | one photo, or stock images |
| The cover is the strongest before-and-after (A, C) | a split before/after of the same room | a logo or a text card |
| Real over made-up: "homeowners can spot fake photos easily" (A) | photos from real jobs | generated images; the Bethlehem listing's two photos are generated (`images.jsonl`) |

How photos are stored, varied and uploaded: `docs/listingMedia.md`.

### Worked example: the Bethlehem listing

**❌ What went up on 2026-10-22** (listing 1425935622848350):

```
Junk Removal & Cleanouts: Houses, Garages, Basements

Junk removal and full cleanouts in Bethlehem and nearby.
Houses, apartments, garages, basements, sheds, storage units, hoarder cleanouts.
We load it, haul it and sweep up. Furniture, appliances, bags, debris.
From $99 for small loads. Message a photo of the job for a quote.
```

What's wrong with it, rule by rule:
- The title has no city and no benefit; it is a list of places.
- The description opens with the seller, not the reader's problem.
- The services are one long sentence of nouns.
- There's one price, and nothing about how it works.
- The call to action, "message a photo", is the best idea in it, but it's buried at the end.

**✅ Rewritten by the rules.** The parts in `[brackets]` need a fact from matt
first; leave a line out if it isn't true.

```
Junk Removal Bethlehem PA – Free Quote From a Photo

Garage you can't park in? Basement full of boxes? A whole house to clear after a move?
Send us a photo of the pile and we'll reply with a price. No visit needed.

What we take:
• Furniture, mattresses and appliances
• Boxes, bags and everyday clutter
• Garage, basement, shed and storage unit cleanouts
• Hoarder and estate cleanouts

Prices:
• Small load (a few items): $99
• [Half truck: $___]
• [Full truck: $___]

How it works:
1. Send a photo here
2. Get your price
3. We load it, haul it away and sweep up

[Bethlehem and the towns you cover]. [Same-day pickup when we have a slot, only if true.]
```

### Versions: one ad, several ways to say it (rule 71)

An ad that goes out on more than one listing in a city carries **copy
versions**: whole title-and-description pairs, each with its own angle (a
garage cleanout, "moving out? we take what's left", one big item, a free quote
from a photo). Write them in `listing.json` as `copyVersions`:

```json
"copyVersions": [
  { "id": "photoQuote", "title": "Junk Removal Bethlehem PA – Free Quote From a Photo", "description": "..." },
  { "id": "garageCleanout", "title": "Garage & Basement Cleanouts Bethlehem – Same-Day Pickup", "description": "..." },
  { "id": "movingOut", "title": "Moving Out of Bethlehem? We Take What You Leave Behind", "description": "..." }
]
```

- **How many:** at least as many as the listings the ad will have live in
  that city, never fewer than 3. `log facebook campaign fill` counts the ones
  already live (ready, publishing, unconfirmed, active, under review) and
  refuses with `notEnoughCopyVersions` when it is short.
- **How different:** every two titles differ by at least half their words, not
  counting the city's.
- **Each by the rules above:**
  - every title names the city, at most 70 characters, no emoji, no words in
    capitals, no "!", no banned words;
  - every description has a price with a number, a list, and the photo ask.
- **The first version is the ad's own title and description;** leave `title`
  and `description` out, or make them match it.
- **Check before saving:** `log facebook listing lint --file listing.json`
  lists every broken rule; `listing create` and `campaign fill` refuse the same.
- **Which copy gets which:** each copy of the ad (`campaign fill`, `heal`)
  takes the version least like what's live in its city, by shared words (title
  counted twice as much as the description). A replacement skips the version
  the lost copy used. Code: `src/facebook/marketplace/copy`.

### Checklist before `log facebook listing create`

- [ ] Title: service, city and one benefit, under 70 characters, no caps or symbols
- [ ] First line: the reader's situation
- [ ] Services as a list; prices as numbers; never "cheap"
- [ ] How it works, in three steps
- [ ] Only true claims (same-day, licensed, insured, towns)
- [ ] Call to action: send a photo, get a price
- [ ] 4 to 6 photos, the strongest before/after first
- [ ] Spell-checked, plain tone, no exclamation marks
- [ ] Going out on more than one listing in a city: enough copy versions, and `log facebook listing lint` passes

### After it's up (A, C)

- Reply within the hour: the check (`log facebook check`) says when a chat
  arrives, and the host checks every round.
- Watch the clicks: the check saves each listing's clicks in the last 14 days
  to `clicksCount`. Try one change at a time (title or cover photo) and compare.

## The work, step by step: listingCreative

From `skills/listingCreative/SKILL.md`.

## listingCreative

How a listing's photos are made. The words are `listingCopy`'s job; this is the
pictures. The research behind it is in the workspace's
`RESEARCH/JUNK_REMOVAL_CREATIVES/`: `creatives.jsonl` (58 winner frames, one per
line, from real Craigslist and Marketplace junk removal listings),
`CREATIVE_RUBRIC.md`, `subqReading.json` (what SubQ says a winner is) and
`spinOuts.jsonl`.

### Hard boundaries

- **matt's concept comes first.** Never judge or replace his creatives; build on
  them. Report what the winners show as data, never as a verdict on his work.
- **No text and no logos inside a generated image.** No letters, numbers, brand
  names, signs, number plates or printed paper. Every prompt says so and every
  avoid list repeats it.
- **No phone or interface words in a prompt.** "Shot on an iPhone" made the
  model draw a Photos app screen into the picture (Verizon, a clock, a date bar).
  Prompt the photo only; the phone around it is `photosViewer.html`.
- **No vehicles in any frame.** No car, truck, pickup, trailer or dumpster,
  parked in the background or part of the job (matt, 2026-10-23: every made shot
  with a car in it came out wrong). The action is the crew carrying things out,
  a dolly at most. Every prompt says "no cars, trucks or trailers anywhere in the
  frame" and every avoid list repeats it.
- **Generate each frame once, then show matt.** Never regenerate on your own
  judgement. Generation costs money (rule 41): ask before anything he didn't say.

### The rubric: scene, action, before, after

What SubQ read from the 58 winner frames (`subqReading.json`, 2026-10-23):

| | Winners |
|---|---|
| Scene | an interior room or a side yard along a fence, then a garage |
| Action | crew mid-job (99%); never a vehicle (below) |
| Before | a room's or a yard's worth of junk (95%), raw phone snapshot (95%) |
| After | the exact same spot and angle (99%), bare (88%) |
| People | a homeowner almost never in frame |

Per creative: one scene, then `before`, `action` and `after`. The action and the
after are edits of the before (it is the reference image), so the place and the
people match.

### Generating

`reapi.image-gen.gemini-3-pro-image` through treg ($0.034 an image at 2K,
`"size": "9:16"`, `"resolution": "2K"`). It answers with a task id; poll
`reapi.tasks.get` every 10 s. Reference images must be public HTTPS URLs, so
the before's own output URL is passed to its action and after (valid about 7
days). A photo only on this machine can't be a reference there.

The media lives in this repo, `media/listings/<creative>/`, in three folders:

| Folder | What's in it |
|---|---|
| `raw/` | the generated photos as they came back: `before.jpg`, `action.jpg`, `after.jpg` |
| `ios/` | each photo inside the iPhone Photos viewer, no scribble |
| `iosScribbled/` | the same, every face scribbled out in red |

Beside them, `images.jsonl` (one line per generated frame: prompt, avoid, task,
credits) and `viewer.json` (below). A new frame goes in `raw/`; `ios/` and
`iosScribbled/` are always rendered from it, never edited by hand.

### The phone: Photos viewer, place and scribbles

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
C:\Python312\python.exe python/creative/renderViewer.py <image> <out.jpg> --faces "[...]" --place Bethlehem --when "October 21  10:12 AM"
```

`renderListings.py` renders the `raw/` frames of every folder under
`media/listings` that has a `viewer.json` into its `ios/` and `iosScribbled/`
folders (JPEG, quality 92). The filmstrip is made from the listings' own frames, never
anyone else's photos. It drives the system Edge headless through Playwright,
so nothing is downloaded.

### Checking

Show matt every frame (a sheet of all of them, plus one at full size), then
crop each scribble and look at it before saying the faces are covered. SubQ can
then score the made frames against the winners, the same way
`subqReading.json` was made.

## The work, step by step: nicheCreativeResearch

From `skills/nicheCreativeResearch/SKILL.md`.

## nicheCreativeResearch

The routine behind the junk removal creatives, written so it runs the same way
for any niche, industry or offer. Junk removal (2026-10-23) is the worked
example all the way through. The picture side of each step is `listingCreative`;
the words are `listingCopy`.

### Hard boundaries

- **Only what matt said.** The niche, the offer, the platforms and the options
  are his words (rules 39-41). Nothing he didn't name goes into a search, a
  matrix, a rubric or a write-up.
- **Every lookup is TinyFish through treg, every claim from a page fetched**
  (rule 53). Give matt links straight away when he asks for something to open.
- **Never judge matt's creatives.** What winners show is data. His concept is
  what gets spun out, never replaced.
- **Money only as asked** (rule 41): generation and SubQ calls are named with
  their cost before they run, each frame is generated once.
- **No text or logos inside generated images, no phone words in prompts.**

### The pipeline

```
1 sources ──► 2 winner listings ──► 3 creatives.jsonl ──► 4 SubQ: what wins here
                                                               │
8 measure ◄── 7 phone media ◄── 6 generate once ◄── 5 rubric + spin-outs
```

Everything for a niche lives in one workspace folder,
`RESEARCH/<NICHE>_CREATIVES/`, and its finished media in this repo,
`media/listings/<creative>/`.

#### 1. Sources: what operators say gets messages

Search where the people who sell that service talk (for junk removal:
r/sweatystartup, r/smallbusiness, r/sidehustle, the Junk Removal Winners and
Junk Removal Networking Facebook groups, YouTube, TikTok). For each source write
down the URL, who is speaking (operator, or marketer/course seller), short exact
quotes, any numbers (messages, jobs, $), and the evidence grade: **A** first-hand
with numbers, **B** first-hand anecdote, **C** vendor claim.

- Reddit loads through `www.reddit.com/...` (not `.json`, not old.reddit).
- Facebook group posts load with the post and the top 3 comments.
- Marketplace listings open only through `m.facebook.com/marketplace/item/<id>/`.
- YouTube gives descriptions and chapters, no transcript.

Junk removal: 39 searches, about 75 pages, 19 sources, in
`RESEARCH/JUNK_REMOVAL_MARKETPLACE_SOURCES.md`. Best numbers: Craigslist every
morning to "$1,000 per week" (A), a note in two local groups to "2 jobs in as
many days" (A), "30% of my business" from free-item messages (A).

#### 2. Winner listings: the real ones, with any sign they get answers

Collect live listings in the niche and fetch their images (`image_links` on the
fetch). Signs a listing works: the poster keeps paying to repost it (the same
title many times on a Craigslist hub), "Highly rated on Marketplace", seller
reviews, an operator saying so. Never competitors from matt's own cities.

Junk removal: 8 Craigslist posts (Akron, Greenville, Irvine, 5 in the Bay Area)
and 4 Marketplace listings, 63 images.

#### 3. creatives.jsonl: every winner image as one line

One line per image: `listing`, `platform`, `city`, `signal`, `order`, `role`
(cover, before, after, beforeAfterStack, action, trust, serviceArea...),
`scene`, `shows`, `action`, `people`, `overlay`, `pairWith`, `camera`, and the
`file`. Written from looking at each image, nothing guessed.

Junk removal: 58 lines, `RESEARCH/JUNK_REMOVAL_CREATIVES/creatives.jsonl`.

#### 4. SubQ: what a winner is in this niche

SubQ's Decisions API (`src/subq/decisions`) gets the whole `creatives.jsonl` as
state and the images, **at most 4 per call**, so pack them into labelled contact
sheets. Ask what the winners are, not what to do: `choice` for the main scene,
the before/after layout and the cover; `noul` for each element (same angle,
crew working, phone snapshot, overlays, people in frame);
`score` for how much mess, what the after looks like, how authentic. The
answers are the niche's definition of a winner (`subqReading.json`).

Junk removal: a flyer cover (89%), then real phone photos of a room- or
yard-sized pile, the crew working (99%), an after from the exact same spot
(99%), bare (88%), Before/After or the number on top (99%), almost never a
homeowner in frame. matt's own rules sit above what the winners show: no
vehicles in any frame, whatever the winners do (`listingCreative`).

#### 5. Rubric and spin-outs

The rubric is the winner definition laid out as slots. For a service that
clears something it is **scene, action, before, after**; another niche keeps
the same idea (where it happens, the work being done, the problem, the result)
with its own words. Then matt's concept is spun out into new creatives in that
composition (`spinOuts.jsonl`, the shape of his `images.jsonl`: prompt, avoid,
aspect, keepSameAs), and SubQ scores each plan against the winners: in the
winners' composition, raw phone snapshot, shows the job happening, what it is
most missing.

Junk removal: garage 94%, side yard 95%, basement 82%, matt's Bethlehem set 42%
(missing crew at work).

#### 6. Generate once

`reapi.image-gen.gemini-3-pro-image` through treg, 2K, 9:16, about $0.03 a
frame. The before first, then the action and after as edits of the before (its
output URL is the reference), so the place and people match. Each frame once,
then show matt every one.

Junk removal: 9 frames for $0.20 on the second run. The first run's prompt said
"iPhone" and the model drew a Photos app screen into the pictures, and every
shot with a car, truck or trailer in it came out wrong. Both are now prompt
rules: no phone words, no vehicles.

#### 7. Phone media

Render each frame into the iPhone Photos viewer with the town in the title and
faces scribbled out in red (`listingCreative`, `python/creative`), into
`media/listings/<creative>/raw|ios|iosScribbled/`.

#### 8. Measure

Run SubQ over the made frames the same way as step 4, publish (rule 10, `--live`
only when matt says), and count messages per listing. What gets messages goes
back into the niche's winner definition. Junk removal: not done yet.

### Starting a new niche

1. matt names the niche, the offer and the cities.
2. `RESEARCH/<NICHE>_CREATIVES/` and `RESEARCH/<NICHE>_MARKETPLACE_SOURCES.md`.
3. Steps 1-8 in order, each step's file before the next starts, each paid step
   named with its cost first.

## The work, step by step: conversations

From `skills/conversations/SKILL.md`.

## conversations

A buyer who writes about a listing is an `agencyConversation` on that
listing and account. Each message is an `agencyMessage` in it. The shape,
and where each field came from (Listaro, blaster), is in
`docs/conversations.md`.

### Hard boundaries

1. **Twenty only.** These commands never open a browser and never write to
   Facebook (rule 8). Replying waits for matt.
2. **Additive** (rule 13). A field is only ever added through
   `scripts/twenty/twentySetup.mjs`, then the client is regenerated
   (`bun run twenty:client`, rule 14). blaster's SMS fields are never
   renamed or retyped.
3. **Never guess the listing.** A thread is tied to a listing by the
   Facebook listing id, or by a title only one listing on the account has.
   Otherwise it stays unmatched until `log facebook conversation link`.
4. **A person's call stands.** `BOOKED`, `LOST` and `SPAM` are never moved
   by a scan.

### The routine

```bash
log facebook conversations --account <name>                  # newest first
log facebook conversation show <id>                          # every message; * marks unread
log facebook conversation record --account <name> --file threads.json
log facebook conversation read <id>
log facebook conversation lead <id> QUALIFIED
log facebook conversation link <id> --listing <agencyListingId>
```

`record` is idempotent: a second run on the same file adds nothing.

### Reading the inbox (next)

The scan that writes `threads.json` from Facebook isn't built. Record the
Marketplace inbox with `log inspect` first (rule 29: goto the inbox,
snapshot, open a thread, snapshot), read its HAR with rea for the requests
that carry thread and message ids (rule 25), then build the scan from that
recording.

## Every tool, in full

### `listings`

List the Twenty listings.
List the Twenty listings, by status, account or campaign
log facebook listings [--status <STATUS>] [--account <accountName>] [--campaign <campaignId>] [--json]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `listing`

One listing in full.
Show one Twenty listing, or create one for an account from a JSON file
log facebook listing <agencyListingId> [--json]
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 71, 72, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `listingCreate`

Create a listing in Twenty from a listing.json.
Show one Twenty listing, or create one for an account from a JSON file
log facebook listing create --account <accountName> --file <listing.json> [--json]
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 71, 72, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `listingRemove`

Delete a listing on Facebook from its account's Selling page, then set it REMOVED in Twenty (the row stays); a dry run unless live.
Show one Twenty listing, or create one for an account from a JSON file
log facebook listing remove <agencyListingId|facebookListingId> [--live] [--bypass] [--now] [--json]   (delete it on Facebook through the recorded flow marketplaceListingDelete, then REMOVED in Twenty; a dry run unless --live)
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked. What acts on Facebook is `listingRemoveLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 71, 72, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `listingRemoveLive`

Delete a listing on Facebook from its account's Selling page, then set it REMOVED in Twenty (the row stays); a dry run unless live.
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Show one Twenty listing, or create one for an account from a JSON file
log facebook listing remove <agencyListingId|facebookListingId> [--live] [--bypass] [--now] [--json]   (delete it on Facebook through the recorded flow marketplaceListingDelete, then REMOVED in Twenty; a dry run unless --live)
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 71, 72, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `listingSweep`

Mark every listing of a blocked account ACCOUNT_LOST (a dry run unless --apply).
Show one Twenty listing, or create one for an account from a JSON file
log facebook listing sweep [--apply] [--json]   (every listing whose account is blocked (checkpoint, restricted, banned, dead, deactivated, or a wrong password) is marked ACCOUNT_LOST, and a campaign's copy goes to another account; a dry run unless --apply)
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 71, 72, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `listingLint`

Check a listing.json against the copy rules and the create form, saving nothing.
Show one Twenty listing, or create one for an account from a JSON file
log facebook listing lint --file <listing.json> [--json]   (the copy rules on the file's copy versions, and whether it would publish; nothing is saved)
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 71, 72, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `publish`

Post one Twenty listing; a dry run unless live.
Post one Twenty listing (dry run unless --live), printing every machine step
log facebook publish --listing <agencyListingId> [--live] [--json] [--formUrl <url>] [--bypass] [--now]
Dry run unless --live: fills and checks everything, never clicks Publish.
The listing, its account and the account's proxy all come from Twenty.
--bypass skips only the account's waking hours (rule 18); every other gate still runs.
--now skips only the 10-minute launch gap (rule 24); the 8 launches a day still hold.
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked. What acts on Facebook is `publishLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 8, 10, 12, 18, 22, 24, 68, 72, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `publishLive`

Post one Twenty listing; a dry run unless live.
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post one Twenty listing (dry run unless --live), printing every machine step
log facebook publish --listing <agencyListingId> [--live] [--json] [--formUrl <url>] [--bypass] [--now]
Dry run unless --live: fills and checks everything, never clicks Publish.
The listing, its account and the account's proxy all come from Twenty.
--bypass skips only the account's waking hours (rule 18); every other gate still runs.
--now skips only the 10-minute launch gap (rule 24); the 8 launches a day still hold.
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 8, 10, 12, 18, 22, 24, 68, 72, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `campaign`

log facebook campaign <fill|heal|run|show> --campaign <id> [...]
Put one ad on N accounts in one place, replace lost accounts, publish the campaign
Usage: log facebook campaign fill --campaign <agencyCampaignId> --from <agencyListingId> --accounts <n>
       log facebook campaign heal --campaign <agencyCampaignId>
       log facebook campaign run  --campaign <agencyCampaignId> [--live] [--bypass]
       log facebook campaign show --campaign <agencyCampaignId> [--json]
Pass the arguments after the command name in `args`, e.g. ["--json"]. It never takes --live: that is `campaignLive`. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 18, 71, 72, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `campaignLive`

log facebook campaign <fill|heal|run|show> --campaign <id> [...]
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Put one ad on N accounts in one place, replace lost accounts, publish the campaign
Usage: log facebook campaign fill --campaign <agencyCampaignId> --from <agencyListingId> --accounts <n>
       log facebook campaign heal --campaign <agencyCampaignId>
       log facebook campaign run  --campaign <agencyCampaignId> [--live] [--bypass]
       log facebook campaign show --campaign <agencyCampaignId> [--json]
Pass the arguments after the command name in `args`, with --live. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 13, 18, 71, 72, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `conversations`

List the buyers' conversations.
List buyers' Marketplace conversations in Twenty, newest first, by account or listing
log facebook conversations [--account <name>] [--listing <agencyListingId>] [--json]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 34, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `conversationShow`

A conversation and its messages.
One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread
log facebook conversation show <id> [--json]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 34, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `conversationRead`

Mark its messages read.
One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread
log facebook conversation read <id>
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 34, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `conversationLead`

Set its lead status.
One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread
log facebook conversation lead <id> <NEW|CONTACTED|QUALIFIED|BOOKED|LOST|SPAM>
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 34, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `conversationLink`

Link it to its listing.
One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread
log facebook conversation link <id> --listing <agencyListingId>
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 34, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `conversationRecord`

Store scanned threads.
One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread
log facebook conversation record --account <name> --file <threads.json>
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookMarketplace" }) (Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations).
AGENTS.md (log://agents): rules 34, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 10.** 2026-10-18 · matt asked for posting: `log publish` posts one listing through the publish machine. It is a dry run unless `--live`, and once Publish is clicked nothing is retried. Captchas go CaptchaKraken first, then 2Captcha, and Facebook's own challenges go to a person. Rule 8 still holds for editing and deleting.

**Rule 12.** 2026-10-18 · No browser opens for an account unless its proxy is attached and its exit IP is in the account's country (`python/browser/proxyGate.py`). There is no exception: not dry runs, not signing in (matt: "never, ever open" without one). Listings must be in the account's country, and the form's location must be picked in that country. How it works: `docs/proxies.md`.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 18.** 2026-10-18 · No run outside the account's local waking hours (08:00-22:00 in its home timezone, or `activeHoursStart`/`activeHoursEnd`): publish, scan, status, watch, campaign run and connect are refused with `outsideActiveHours`. Daily caps count the account's local day.

**Rule 22.** 2026-10-19 · Every action records a HAR, with no way to turn it off. The proxy gate puts a raw HAR recorder (rule 19) on every browser context, and refuses a context without a capture folder (`captureMissing`). That covers connect, scan, status, each watch check and publish. Each run keeps `~/.logCli/runs/<action>/<time>_<account>/firefox` (publish: its run folder): `session.har`, `steps.jsonl` (every action the run logged, timed), and `steps/NN_<action>.har`, one per step, each read by the local rea (`settleRunCapture`). Never committed.

**Rule 24.** 2026-10-19 · matt: "fix them issues now" (the launch budget from RESEARCH/LOG_CLI_RUN_CAPTURES_2026_10_19.md). One account's browser opens on Facebook at most 8 times per local day, dry runs counted, at least 10 minutes apart. A launch counts once it passed the gate ("Self-check passed" in its `steps.jsonl`). Refused before anything opens: `launchTooSoon`, `launchBudgetSpent` (`browser/run/helpers/launchBudget.ts`). `--bypass` doesn't skip it; only a publish against the saved fixture form (`--formUrl file://...`) isn't counted. A publish meets a login wall or checkpoint in its own browser (the connect steps run there), never in a second launch.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 34.** 2026-10-19 · matt: a buyer's conversation is tied to its listing, in the shape blaster and Listaro already use. Twenty's `agencyConversation` (blaster's SMS thread object) gains the Marketplace fields and relations to `agencyListing` and `socialAccount`; `agencyMessage` gains its relation to `agencyConversation` and Listaro's per-message fields (`isRead`, `sentBy`, `aiStatus`), all additive (rule 13, `scripts/twenty/twentySetup.mjs`). A conversation is keyed on the account and Facebook's thread id, never a hash of the buyer's name; a message on Facebook's message id or a stable hash, so a rescan adds nothing. The listing is matched by its Facebook id or a unique title, never guessed. `log conversations`, `log conversation show|read|lead|link|record` (`marketplace/conversation`, `docs/conversations.md`).

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 68.** 2026-10-22 · matt: the Marketplace location is typed as "City, State" with the state written out in full ("Bethlehem, Pennsylvania", never "PA"): "Bethlehem, PA" was offered only as the West Bank, and a bare zip offered Granada, Spain first (Bethlehem, inspect 20261022T105341 and 20261022T110738). `setLocation` writes a US state code out, picks the option Facebook's own answer names as the place typed, clicks it, and sets nothing when none matches. A listing is published from the account's open AdsPower browser by the recorded flow `marketplaceListingPublish` (location, Create, photos, title, price, category, condition, description, Next, Publish; never Boost, rule 41), not by a second browser. "Discover more when you shop" (partner listings, a European location) is a known page state, pressed through with Update.

**Rule 71.** 2026-10-23 · matt: an ad says the same thing several ways. An ad that goes out on more than one listing in a city carries copy versions (`agencyListings.copyVersions`, title-and-description pairs written by `skills/listingCopy`), at least as many as the listings it will have live in that city and never fewer than 3, every two titles differing by at least half their words (the city's not counted). Each copy (`campaign fill`, `heal`) takes the version least like what is live in its city and records it in `copyVersionId`; a replacement skips the lost copy's version. `log facebook listing lint`, `listing create` and `campaign fill` refuse a version that breaks a checkable copy rule, and `campaign fill` refuses too few (`notEnoughCopyVersions`). `src/facebook/marketplace/copy`.

**Rule 72.** 2026-10-23 · matt: a Marketplace location is never abbreviated. It is typed as "City, State" with the state written out ("Bethlehem, Pennsylvania") or "City, Country" ("Galway, Ireland"): "Bethlehem, PA" was offered only as the West Bank, and a bare zip offered Granada, Spain first (rule 68). A check blocks before any action: a place with an acronym, a state code, a zip or any number, or no state or country is refused with `locationAbbreviated` (`placeProblem`, `src/facebook/marketplace/location`; `python/location/placeName.py` in the sessions), in a listing's `locationQuery` (`listing create`, `lint`, `publish`, `campaign fill`), `log inspect do setLocation`, a flow's `location`, and the host's setLocation, which types the listing's `locationQuery` and never a zip. A written-out state counts as the US for the country check.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.
