---
title: "Marketplace location"
---

# Marketplace location

Where a Marketplace listing is and where an account sells from is typed as a place Facebook cannot mistake: "City, State" with the state written out ("Bethlehem, Pennsylvania") or "City, Country" ("Galway, Ireland"), never abbreviated, never a zip. A check refuses anything else before any action, and the suggestion picked is the one Facebook's own answer names as the place typed. Rules 68 and 72 (rule 72 repeats and widens rule 68's location part).

## The check

### REQ-LISTING-01: An abbreviated place is refused with locationAbbreviated

A place is refused with `locationAbbreviated` when it is empty, has any number in it (a zip), names no state or country after a comma, has a word of two or more capital letters (an acronym or a state code such as PA), or has a state or country part shorter than 4 letters.

Checked by: code and SubQ

### REQ-LISTING-02: The Python sessions run the same check

The browser sessions refuse a place by the same rules (empty, a number, no second part, an acronym, a region under 4 letters) before anything is typed.

Checked by: code and SubQ

### REQ-LISTING-03: A US state code is written out

Where log-cli builds a place itself, a US state code is written out from the table of state names ("PA" becomes "Pennsylvania"), and a refusal of a state code says what to write instead.

Checked by: code and SubQ

### REQ-LISTING-04: A written-out state counts as the US

For the listing's country check, a place whose last part is a US state written out (or its code) is in the US.

Checked by: code and SubQ

## Where the check runs

### REQ-LISTING-05: A listing's locationQuery is checked

A listing whose `locationQuery` is empty or fails the check is refused as invalid. This one check is what `listing create`, `listing lint`, `publish` and `campaign fill` run on a listing.

Checked by: code and SubQ

### REQ-LISTING-06: log inspect do setLocation is checked

`log inspect do setLocation <place>` is refused with `locationAbbreviated` before it reaches the browser when the place fails the check.

Checked by: code and SubQ

### REQ-LISTING-07: A flow's location is checked before it runs

`log flow run` checks the value of every `setLocation` step of the flow, and refuses the run before anything opens when one fails the check.

Checked by: code and SubQ

### REQ-LISTING-08: The host sets the location from a written-out place, never a zip

When the host finds the account's Marketplace location is not its home city, it types the home city with its state written out, or else the city's listing `locationQuery`, checks it, and sets it only with `--live`. It never types a zip.

Checked by: code and SubQ

## Picking the suggestion

### REQ-LISTING-09: The suggestion is the one Facebook's answer names as the place typed

When the location is set, the suggestion clicked is the one whose address in Facebook's own answer (`MarketplaceSearchAddressDataSourceQuery`) is the place typed, or starts with it. When none matches, nothing is set and the step fails.

Checked by: code and SubQ
