# How a Marketplace listing gets posted

This folder is the research behind `log facebook publish`: how three earlier projects posted a Facebook Marketplace listing, what worked, and what to avoid. It covers the publish steps as a state machine, how photos are loaded, changed and attached, how the create form is filled, and how captchas are solved. Read it if you're changing how publishing works or want to know why it works the way it does.

It was written from the source code of the earlier projects, and every claim cites the `file:line` it came from. It describes those projects, not log. For how log handles photos today, see [Listing photos](../listingMedia.md); for the publish machine as built and its error codes, see the generated [error catalog](../errorCatalog.md).

## The pages

| Page | What it covers |
| --- | --- |
| [The publish state machine](stateMachine.md) | The publish flow as states and transitions: what each earlier project did, and the machine log runs |
| [Image pipeline](imagePipeline.md) | Where photos come from, how they're changed, how they're attached to the form, and how the upload is confirmed |
| [The create form](formFill.md) | The form at `facebook.com/marketplace/create/item`, field by field, with the selectors that worked |
| [CaptchaKraken](captchaKraken.md) | The captcha solver: package, keys, Camoufox notes, and what it can and can't solve on Facebook |
| [Sources](sources.md) | The three earlier projects, what was proven live in each, and the bugs not to copy |

## The earlier projects

| Short name | What it is | Language | How far it got |
| --- | --- | --- | --- |
| **Camoufox client** | A Python browser driver | Python, Camoufox | One live publish (a spike script), and a photo edit on a live listing |
| **Production poster** | A posting tool used in production | TypeScript, Playwright over AdsPower | Posted for real users; its server path is the live one |
| **Dashboard** | A listings dashboard with no browser | TypeScript | Owns the listing status machine log already ports |

A fourth experiment with vision models is out of date. Only its CaptchaKraken notes carry over, in [CaptchaKraken](captchaKraken.md).

## The short version

1. **Production posted one photo per listing.** The production poster picked 1 image from a pool and changed it with `sharp` (crop, rotate, colour, noise, re-encode), which gives the file a new hash. It attached the image with `setInputFiles` on the hidden `input[accept="image/*,…"]`, without opening a file chooser.
2. **Nobody confirmed the upload finished.** Both browser projects just waited 3–5 s. The only real check is Facebook's own `N/10 photos` counter. The spike waited for it, and log should treat it as a hard gate.
3. **Neither production path proved the listing was published.** The production poster returned success with no URL. The Camoufox client took the first `/marketplace/item/` link on the page, which could belong to another listing. The spike's steps are the ones that worked live: Next, then Publish, then a possible second audience screen, then the `you/selling` toast, then the listing card's id.
4. **Captchas:** the production poster used 2Captcha, only while signing in, never while posting. CaptchaKraken covers reCAPTCHA v2 inside Facebook's screens but **not Arkose/FunCaptcha**, the other captcha Facebook uses.
