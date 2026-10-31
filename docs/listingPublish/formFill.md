# The create form, field by field

URL: `https://www.facebook.com/marketplace/create/item`. Listaro adds
`?locale=en_US` and, on a non-English page, switches the account through
`/a/intl/save_locale/?new_locale=en_US` and reloads
(`facebook-poster.ts:1048-1110`).

FB builds the form from `div[role=button]` and `label[role=combobox]`, so
Playwright's "enabled" check doesn't apply. Buttons are "ready" when
`aria-disabled != "true"` (FCC `form_driver.py:144-178`,
`docs/okf/marketplace_create.md:36-37`).

| # | Field | What worked | Source |
| --- | --- | --- | --- |
| 0 | Before the form | Close popups. Click "Item for sale" if the type picker shows. Fail on daily-limit text | Listaro `:1113-1165` |
| 1 | Category | Open `label[role="combobox"]` filtered by "Category" (chevron, then inner div/span, then label, then ArrowDown). Pick the listbox option, exact then substring, with dashes normalised. Otherwise type into the dialog's search box and click the matching button. 3 tries with Escape between | FCC `form_driver.py:49-141`, `create.py:65-82` |
| 1a | | US search variant: `[role="combobox"][aria-label="Category"]` → `fill(term)` → best `[role="option"]` | Listaro `:419-515` |
| 1b | | **Check the value afterwards.** FB restores drafts, which can undo the choice | spike `:303-312` |
| 2 | Photos | See `imagePipeline.md` | |
| 3 | Title | `label:has-text("Title") input[type="text"]` (Listaro `:1293-1305`). FCC uses `input[type="text"]:not([role="combobox"])` `.nth(0)` (`create.py:99-102`). Listaro's agent: `//span[text()="Title"]/following-sibling::input[1]` | |
| 4 | Price | Same label approach, then Ctrl+A, Backspace, type, **read back** and re-fill on mismatch | Listaro `:1367-1397` |
| 5 | Condition | Label click, then option `//span[@dir="auto"][text()="…"]`. FB uses an en dash: "Used – good" | Listaro `:196-222`, `:1551` |
| 6 | Description | `label:has-text("Description") textarea` → `fill`, check length (Listaro `:1593-1617`). FCC: first `textarea` (`create.py:105-108`) | |
| 7 | Location | `input[role="combobox"][aria-label="Location"]`, type with 30 ms delay, **wait for listbox options and click the matching one** | spike `:357-368` (FCC `create.py:109-121` presses ArrowDown+Enter blind) |
| 8 | Hide from friends | Click the switch if `aria-checked="false"`. The agent uses `[role="switch"][aria-label*="Hide from friends"]` | Listaro agent `:1053-1068` |
| 9 | Next | `wait_enabled_and_click(/^Next$/i)`. Listaro loops through up to 3 Next pages and skips the Boost page | FCC `:147-148`, Listaro `:1982-2145` |
| 10 | Guards | Fail on limit/verify text. Read the price back and abort on a foreign currency, ≤0, or a mismatch with the template | Listaro `:2178-2232` |
| 11 | Publish | `wait_enabled_and_click(/^(Publish|Share|Post)$/i, 15s)`. **If the page is still `create/item`, click `Publish|Share|Post|Done` again (audience step)** | FCC `:149-151`, spike `:388-397` |
| 12 | Confirm | Fail on an "Oops / Something went wrong" dialog (Listaro `:2379-2412`). Success = "Listing published" toast on `you/selling` (`marketplace_create.md:47-49`) | |
| 13 | Listing id | Open the `you/selling` card **that matches the title** and read `/marketplace/item/(\d+)` | spike `:232-283` |

## Don't copy

- Positional `nth(0)` / `nth(1)` for title and price with nothing read back
  (FCC `create.py:101-102`).
- Removing `aria-disabled` and JS-clicking Next (Listaro
  `facebook-poster.ts:1994-2076`). That hides a missing required field.
- Raw condition values `new|like_new|good|fair` passed as label text. They
  never match, so every item became "Used – good" (Listaro
  `process-posts/route.ts:707`, `constants.ts:31-36`).
- The AI selector fallback. `getCachedSelectors(id) || await discover…`
  tests a Promise, which is always truthy, so discovery never ran
  (`facebook-poster.ts:1345`, `ai-selector-discovery.ts:26`).
