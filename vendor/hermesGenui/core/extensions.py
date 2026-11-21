"""Block types another plugin adds to show_blocks, next to the built-in ones in blocks.TYPES.

A plugin that loads this one (and bundles the Desktop half's registerBlock for drawing) calls register_block before
register(ctx), so the show_blocks description the model reads already lists the new type:

    register_block("stateMachine", check, text, {"kind": "stateMachine", "for": "...", "use_when": "...",
                   "fields": "...", "example": {...}})

check(block, path) -> [(path, why), ...] and text(block) -> Markdown follow the blocks/<type>.py contract. A built-in
name can't be taken, and the name must be a plain word.
"""

import re

from ..blocks import TYPES
from ..hooks import text_fallback
from ..tools import show_blocks
from . import catalog_text, check

NAME = re.compile(r"^[A-Za-z][A-Za-z0-9]{0,39}$")
CATALOG_FIELDS = ("kind", "for", "use_when", "fields", "example")
BUILT_IN = frozenset(TYPES)


def register_block(kind: str, checker, text, catalog: dict) -> bool:
    """Adds one block type; False (and nothing changed) when the name is taken, isn't a plain word, or the catalog
    entry misses a field. Registering the same type again replaces the earlier one.

    register_block("sundial", check_sundial, text_sundial, {"kind": "sundial", ...}) → True
    register_block("chart", ...) → False (built in)
    """
    if not isinstance(kind, str) or not NAME.match(kind) or kind in BUILT_IN:
        return False
    if not callable(checker) or not callable(text) or not isinstance(catalog, dict):
        return False
    if any(field not in catalog for field in CATALOG_FIELDS) or catalog["kind"] != kind:
        return False
    TYPES[kind] = (checker, text)
    check.CHECKERS[kind] = checker
    check.PAGE_CHECKERS[kind] = checker
    text_fallback.RENDERERS[kind] = text
    catalog_text.EXTRA[kind] = dict(catalog)
    show_blocks.SHOW_BLOCKS_SCHEMA["description"] = show_blocks.description()
    return True
