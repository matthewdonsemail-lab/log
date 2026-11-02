---
title: "Marketplace copy versions"
---

# Marketplace copy versions

An ad that goes out on more than one listing in a city says the same thing several ways: it carries copy versions (`agencyListings.copyVersions`, title and description pairs written by `skills/listingCopy`), and each copy takes the version least like what is already live in its city. Rule 71.

## Versions

### REQ-LISTING-10: Enough versions for the city, never fewer than 3

When an ad will have more than one listing live in its city, it needs at least as many copy versions as listings it will have live there, and never fewer than 3. An ad with one listing in its city needs none.

### REQ-LISTING-11: Every two titles differ by at least half their words

Every two versions' titles must differ by at least half their words, the city's and the place's words not counted. Two versions with the same title, or the same version id twice, are refused.

### REQ-LISTING-12: Each version keeps the checkable copy rules

Each version is refused when its id is not camelCase, its title is empty, longer than 70 characters, does not name the city, has an emoji or decorative symbol, a word in capitals, a "!" or a banned phrase ("cheap", "best price", "limited time" and the like), or its description is empty, has a "!", an emoji or a banned phrase, has no price with a number, no list of lines starting with a bullet or dash, or never asks for a photo.

## Picking

### REQ-LISTING-13: Each copy takes the version least like what is live in its city

When a listing is made from an ad (`campaign fill`, `heal`), it takes the version whose nearest distance to the copies live in the same city is largest (the title weighing two thirds, the description one third), fewer uses breaking a tie, and records that version in `copyVersionId`.

### REQ-LISTING-14: A replacement skips the lost copy's version

A replacement for a lost listing never takes the version the lost listing had, when there is another.

## Refusals

### REQ-LISTING-15: Lint, create and fill refuse a version that breaks a rule

`log facebook listing lint` and `listing create` refuse a listing whose copy versions break a checkable rule, and `campaign fill` refuses the same, and refuses too few versions with `notEnoughCopyVersions`.
