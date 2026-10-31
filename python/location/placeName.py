from __future__ import annotations

import re

US_STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado",
    "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts",
    "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico",
    "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
    "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
}

MIN_REGION_LETTERS = 4
EXAMPLE = '"City, State" with the state written out ("Bethlehem, Pennsylvania")'
SEEN = '"Bethlehem, PA" was offered only as the West Bank'


def written_out(part: str) -> str:
    state = US_STATES.get(part.upper())
    return f'write "{part}" out as "{state}"' if state else f'write "{part}" out in full'


def place_problem(place: str | None) -> str | None:
    text = (place or "").strip()
    if not text:
        return f"no place given: type {EXAMPLE}"
    if re.search(r"\d", text):
        return f'"{text}" has a number in it: a bare zip offered Granada, Spain first. Type {EXAMPLE}'
    parts = [p.strip() for p in text.split(",") if p.strip()]
    if len(parts) < 2:
        return f'"{text}" names no state or country: type {EXAMPLE}'
    for part in parts:
        acronym = re.search(r"\b[A-Z]{2,}\b", part)
        if acronym:
            return f'"{text}" looks abbreviated: {written_out(acronym.group(0))}. {SEEN}'
    for part in parts[1:]:
        if len(re.sub(r"[^\w]|[\d_]", "", part)) < MIN_REGION_LETTERS:
            return f'"{text}" looks abbreviated: {written_out(part)}. {SEEN}'
    return None


def pick_suggestion(place: str, addresses: list[str]) -> int | None:
    want = re.sub(r"\s+", " ", place).strip().lower()
    names = [re.sub(r"\s+", " ", a).strip().lower() for a in addresses]
    for i, name in enumerate(names):
        if name == want:
            return i
    for i, name in enumerate(names):
        if "," in want and name.startswith(want):
            return i
    return None
