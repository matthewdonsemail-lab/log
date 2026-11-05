---
title: "X lists"
---

# X lists

An X account's own lists, shown, made and added to through its one session on vendor/twikit. Rule 141.

### REQ-XLISTS-01: Lists are read, made once and added to through the engine

`log twitter list show` reads the account's lists with the engine's `lists` action (twikit's `get_lists`), sending nothing. `list create` makes a list with `listCreate` (twikit's `create_list`), but a list of that name already there is answered as it is (`already`) and never made twice, in the command's dry run as in the engine. `list add` finds the list by its id or name among the account's lists, refuses one it doesn't have with `listInvalid`, and adds the person with `listAdd` (twikit's `add_list_member`), looking a handle up first. `listCreate` and `listAdd` are in the engine's writes, so they need live and approvedBy and the governor counts them.

Checked by: code and SubQ

### REQ-XLISTS-02: Only the account's own lists are read, past X's suggestions

X's lists page (`list_management_pace_timeline`) holds more than one module of items, and one of them can be X's "discover new lists" suggestions, whose items aren't all lists. twikit's `get_lists` (`vendor/twikit/twikit/client/client.py`, ours, rule 81) reads every module's items and keeps only those whose `itemContent` has a `list`, never assuming the second module is the account's lists, so a suggestion never crashes it (it was `KeyError: 'list'`). Each `List` (`vendor/twikit/twikit/list.py`) carries `owner_id` from its `user_results`. The engine's `lists_of` (`python/twitterApi/engine.py`) keeps only the lists whose `owner_id` is the account's own `client.user_id()`, or unknown, so lists by other people never show and are never added to.

Checked by: code and SubQ
