# The create form, field by field

This page walks through Facebook's Marketplace "create item" form one field at a time, with the selectors that worked in earlier projects and the mistakes to avoid. Read it if you're changing how log fills in a listing, or a field isn't being set. Sources are the earlier Camoufox client, the production poster and its desktop agent, and the spike script (see [Sources](sources.md)).

## Before you start

- **URL:** `https://www.facebook.com/marketplace/create/item`. The production poster added `?locale=en_US`, and on a non-English page switched the account's language through `/a/intl/save_locale/?new_locale=en_US` and reloaded (`facebook-poster.ts:1048-1110`).
- **Buttons aren't real buttons.** Facebook builds the form from `div[role=button]` and `label[role=combobox]`, so Playwright's "enabled" check doesn't apply. A button is ready when `aria-disabled != "true"` (Camoufox client `form_driver.py:144-178`, `docs/okf/marketplace_create.md:36-37`).

## The fields

| # | Field | What worked | Source |
| --- | --- | --- | --- |
| 0 | Before the form | Close popups. Click "Item for sale" if the type picker shows. Stop if daily-limit text appears. | Production poster `:1113-1165` |
| 1 | Category | Open `label[role="combobox"]` filtered by "Category" (try the chevron, then the inner div/span, then the label, then ArrowDown). Pick the listbox option, exact match first then substring, with dashes normalised. Otherwise type into the dialog's search box and click the matching button. 3 tries, with Escape between. | Camoufox client `form_driver.py:49-141`, `create.py:65-82` |
| 1a | | US search variant: `[role="combobox"][aria-label="Category"]` → `fill(term)` → best `[role="option"]`. | Production poster `:419-515` |
| 1b | | **Check the value afterwards.** Facebook restores drafts, which can undo the choice. | Spike `:303-312` |
| 2 | Photos | See [Image pipeline](imagePipeline.md). | |
| 3 | Title | `label:has-text("Title") input[type="text"]` (production poster `:1293-1305`). The Camoufox client used `input[type="text"]:not([role="combobox"])` `.nth(0)` (`create.py:99-102`). The desktop agent used `//span[text()="Title"]/following-sibling::input[1]`. | |
| 4 | Price | Same label approach, then Ctrl+A, Backspace, type, **read it back**, and fill again if it doesn't match. | Production poster `:1367-1397` |
| 5 | Condition | Click the label, then the option `//span[@dir="auto"][text()="…"]`. Facebook uses an en dash: "Used – good". | Production poster `:196-222`, `:1551` |
| 6 | Description | `label:has-text("Description") textarea` → `fill`, then check the length (production poster `:1593-1617`). The Camoufox client used the first `textarea` (`create.py:105-108`). | |
| 7 | Location | `input[role="combobox"][aria-label="Location"]`, type with a 30 ms delay, then **wait for the listbox options and click the matching one**. | Spike `:357-368` (the Camoufox client's `create.py:109-121` pressed ArrowDown+Enter blind) |
| 8 | Hide from friends | Click the switch if `aria-checked="false"`. The desktop agent used `[role="switch"][aria-label*="Hide from friends"]`. | Desktop agent `:1053-1068` |
| 9 | Next | `wait_enabled_and_click(/^Next$/i)`. The production poster went through up to 3 Next pages and skipped the Boost page. | Camoufox client `:147-148`, production poster `:1982-2145` |
| 10 | Checks | Stop on limit or verify text. Read the price back and stop on a foreign currency, a price of 0 or less, or a mismatch with the template. | Production poster `:2178-2232` |
| 11 | Publish | `wait_enabled_and_click(/^(Publish|Share|Post)$/i, 15s)`. **If the page is still `create/item`, click `Publish|Share|Post|Done` again (the audience step).** | Camoufox client `:149-151`, spike `:388-397` |
| 12 | Confirm | Stop on an "Oops / Something went wrong" dialog (production poster `:2379-2412`). Success is the "Listing published" toast on `you/selling` (`marketplace_create.md:47-49`). | |
| 13 | Listing id | Open the `you/selling` card **whose title matches** and read `/marketplace/item/(\d+)`. | Spike `:232-283` |

## Don't copy these

- **Picking title and price by position** (`nth(0)` / `nth(1)`) and never reading them back (Camoufox client `create.py:101-102`).
- **Removing `aria-disabled` and clicking Next with JavaScript** (production poster `facebook-poster.ts:1994-2076`). That hides a missing required field.
- **Passing raw condition values** `new|like_new|good|fair` as label text. They never match, so every item became "Used – good" (production poster `process-posts/route.ts:707`, `constants.ts:31-36`).
- **The AI selector fallback.** `getCachedSelectors(id) || await discover…` tests a Promise, which is always truthy, so discovery never ran (`facebook-poster.ts:1345`, `ai-selector-discovery.ts:26`).
