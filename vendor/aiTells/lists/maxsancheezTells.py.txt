#!/usr/bin/env python3
"""Flag the "AI tells" catalogued in the humanizer skill (Pass 1).

This automates the find-the-tells pass only. Rewriting stays with the model:
a regex can spot "here's the thing", but it can't say the thing for you.

Usage:
    python3 tells.py FILE [FILE ...]
    cat draft.txt | python3 tells.py -
"""
import re
import sys
from collections import Counter

# (category, label, regex). Patterns are case-insensitive.
PATTERNS = [
    # Rhetorical tics
    ("rhetorical", "not just X, but Y", r"\bnot (?:just|only|merely)\b[^.?!]{1,80}?\bbut\b"),
    ("rhetorical", "it's not X, it's Y", r"\bit'?s not\b[^.?!]{1,60}?[,;]\s*it'?s\b"),
    ("rhetorical", "here's the thing/catch/kicker", r"\bhere'?s the (?:thing|catch|kicker|twist|rub)\b"),
    ("rhetorical", "that's the whole point", r"\b(?:that'?s|is) the (?:whole|entire) (?:point|trick)\b"),
    ("rhetorical", "turns out", r"(?:^|[.!?]\s+)turns out\b"),
    ("rhetorical", "sit with that / worth naming", r"\b(?:sit with that|you already know|that'?s not nothing|worth naming)\b"),
    ("rhetorical", "don't take my word / punchline", r"\b(?:don'?t take my word for it|the punchline is)\b"),
    ("rhetorical", "X is dead", r"\b\w+ (?:is|isn'?t) dead(?:, long live\b)?"),
    # Vocabulary and filler
    ("vocabulary", "LLM-favoured word", r"\b(?:delve[sd]?|delving|tapestry|meticulous(?:ly)?|pivotal|intricate|interplay|underscores?|underscored|garner(?:s|ed)?|bolster(?:s|ed)?|vibrant|bustling|multifaceted|seamless(?:ly)?|ever-evolving|myriad|plethora|realm of|testament)\b"),
    ("vocabulary", "it's important/worth noting", r"\b(?:it'?s|it is) (?:important|worth) (?:to note|noting)\b|\bit should be noted\b"),
    ("vocabulary", "plays a crucial role", r"\bplays? an? (?:crucial|vital|pivotal|key) role\b|\bstands as a testament\b"),
    ("vocabulary", "fast-paced world", r"\bin today'?s (?:fast-paced|digital|modern) world\b|\bever-evolving landscape\b"),
    ("vocabulary", "unnamed authority", r"\b(?:experts|studies|research(?:ers)?) (?:say|argue|suggest|show)s?\b"),
    ("vocabulary", "challenges remain", r"\b(?:despite these challenges|challenges remain|remains to be seen|only time will tell)\b"),
    ("vocabulary", "promo boilerplate", r"\b(?:nestled in|in the heart of|hidden gem|boasts an?|breathtaking|stunning)\b"),
    ("vocabulary", "performative honesty", r"\b(?:let'?s be honest|I won'?t pretend|to be clear)\b|(?:^|[.!?]\s+)(?:honestly|look),"),
    ("vocabulary", "model leftovers", r"\bas an AI language model\b|\bknowledge cutoff\b|\butm_\w+=|\[\d+\]|oaicite"),
    # Punctuation
    ("punctuation", "em dash", r"—"),
]
COMPILED = [(c, l, re.compile(p, re.I | re.M)) for c, l, p in PATTERNS]

SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")


def structure_tells(text):
    """Tells that need sentence context, not a single regex."""
    hits = []
    sents = [s.strip() for s in SENT_SPLIT.split(text) if s.strip()]
    # Two or more rhetorical questions in a row
    for i in range(len(sents) - 1):
        if sents[i].endswith("?") and sents[i + 1].endswith("?"):
            hits.append(("structure", "back-to-back questions", sents[i][:60]))
    # Three or more sentences opening on the same word
    firsts = [re.match(r"\W*(\w+)", s).group(1).lower() if re.match(r"\W*(\w+)", s) else "" for s in sents]
    for i in range(len(firsts) - 2):
        if firsts[i] and firsts[i] == firsts[i + 1] == firsts[i + 2]:
            hits.append(("structure", "3 sentences, same opener", firsts[i]))
    # Colon opening onto exactly three comma-separated items
    for m in re.finditer(r":\s*[^,:.\n]{1,40},\s*[^,:.\n]{1,40},\s*(?:and\s+)?[^,:.\n]{1,40}\.", text):
        hits.append(("structure", "colon + triad", m.group(0)[:60]))
    # Participle tail: ", highlighting/underscoring/ensuring ..."
    for m in re.finditer(r",\s+(?:highlighting|underscoring|emphasizing|showcasing|reflecting|ensuring|fostering)\b[^.]*\.", text, re.I):
        hits.append(("structure", "participle tail", m.group(0)[:60]))
    # Stranded auxiliary contrast: "The tool died. The data didn't."
    for m in re.finditer(r"\.\s+(?:The|But the)\s+\w+\s+(?:didn'?t|doesn'?t|wasn'?t|isn'?t|won'?t|is|did|does|was)\.", text):
        hits.append(("structure", "stranded auxiliary", m.group(0).strip(". ")[:60]))
    return hits


def scan(text):
    hits = []
    for cat, label, rx in COMPILED:
        for m in rx.finditer(text):
            hits.append((cat, label, m.group(0).strip(" .?!\n")))
    hits += structure_tells(text)
    return hits


def report(name, text):
    words = len(re.findall(r"\b\w+\b", text))
    hits = scan(text)
    per100 = 100 * len(hits) / max(words, 1)
    print(f"== {name}: {words} words, {len(hits)} tells ({per100:.1f} per 100 words)")
    for cat, label, phrase in hits:
        print(f"  [{cat:<11}] {label:<28} \"{phrase}\"")
    by_cat = Counter(c for c, _, _ in hits)
    if by_cat:
        print("  by category:", ", ".join(f"{k} {v}" for k, v in sorted(by_cat.items())))
    print()
    return len(hits)


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    total = 0
    for path in argv[1:]:
        text = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
        total += report(path, text)
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
