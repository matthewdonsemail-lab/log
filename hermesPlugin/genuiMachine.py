import json
from pathlib import Path

SPEC_FILE = Path(__file__).with_name("genuiMachine.json")
BY = ("you", "them")
LINKS = ("linked", "suggested")
FLAGS = ("current", "visited", "initial", "final", "taken", "next", "dashed")
TEXT_LIMIT = 3500


def load_spec(path=SPEC_FILE):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _line(value, limit):
    return isinstance(value, str) and 0 < len(value.strip()) <= limit


def _problems_of(item, path, keys, texts, spec):
    problems = []
    if not isinstance(item, dict):
        return [(path, "not an object")]
    for key in item:
        if key not in keys:
            problems.append((f"{path}.{key}", "not a field of this block"))
    for key, limit, required in texts:
        value = item.get(key)
        if value is None and not required:
            continue
        if not _line(value, limit):
            problems.append((f"{path}.{key}", f"needs text of at most {limit} characters"))
    for key in FLAGS:
        if key in item and not isinstance(item[key], bool):
            problems.append((f"{path}.{key}", "true or false"))
    for key in ("count", "at"):
        value = item.get(key)
        if value is not None and (isinstance(value, bool) or not isinstance(value, (int, float)) or value < 0):
            problems.append((f"{path}.{key}", "a number of 0 or more"))
    return problems


def check_machine(block, path, spec=None):
    spec = spec or load_spec()
    limits = spec["limits"]
    keys = spec["keys"]
    problems = []
    for key in block:
        if key not in keys["block"]:
            problems.append((f"{path}.{key}", "not a field of a stateMachine block"))
    for key, values in (("view", spec["views"]), ("direction", spec["directions"]), ("platform", spec["platforms"])):
        if key in block and block[key] not in values:
            problems.append((f"{path}.{key}", " | ".join(values)))
    states = block.get("states")
    if not isinstance(states, list) or not states or len(states) > limits["states"]:
        return problems + [(f"{path}.states", f"needs 1 to {limits['states']} states")]
    transitions = block.get("transitions", [])
    if not isinstance(transitions, list) or len(transitions) > limits["transitions"]:
        return problems + [(f"{path}.transitions", f"at most {limits['transitions']} transitions")]
    ids = set()
    state_texts = (("id", limits["id"], True), ("label", limits["label"], True), ("note", limits["note"], False), ("explain", limits["explain"], False))
    for i, state in enumerate(states):
        here = f"{path}.states.{i}"
        problems += _problems_of(state, here, keys["state"], state_texts, spec)
        if not isinstance(state, dict):
            continue
        if state.get("tone") is not None and state["tone"] not in spec["tones"]:
            problems.append((f"{here}.tone", " | ".join(spec["tones"])))
        chips = state.get("chips")
        if chips is not None and (not isinstance(chips, list) or len(chips) > limits["chips"] or not all(_line(c, limits["label"]) for c in chips)):
            problems.append((f"{here}.chips", f"at most {limits['chips']} short texts"))
        details = state.get("details")
        if details is not None and (not isinstance(details, list) or len(details) > limits["details"] or not all(isinstance(d, dict) and _line(d.get("label"), limits["detailLabel"]) and _line(d.get("value"), limits["note"]) for d in details)):
            problems.append((f"{here}.details", f"at most {limits['details']} {{label, value}} pairs"))
        if state.get("id") in ids:
            problems.append((f"{here}.id", "state ids repeat"))
        ids.add(state.get("id"))
    transition_texts = (("id", limits["id"], True), ("from", limits["id"], True), ("to", limits["id"], True), ("event", limits["event"], True), ("tool", limits["tool"], False), ("note", limits["note"], False), ("platform", limits["platform"], False))
    for i, transition in enumerate(transitions):
        here = f"{path}.transitions.{i}"
        problems += _problems_of(transition, here, keys["transition"], transition_texts, spec)
        if not isinstance(transition, dict):
            continue
        if transition.get("by") is not None and transition["by"] not in BY:
            problems.append((f"{here}.by", " | ".join(BY)))
        for end in ("from", "to"):
            if isinstance(transition.get(end), str) and transition[end] not in ids:
                problems.append((f"{here}.{end}", f'no state has id "{transition[end]}"'))
    accounts = block.get("accounts")
    if accounts is not None and (not isinstance(accounts, list) or len(accounts) > limits["accounts"] or not all(isinstance(a, dict) and a.get("link") in LINKS and _line(a.get("handle"), limits["label"]) and _line(a.get("platform"), limits["platform"]) for a in accounts)):
        problems.append((f"{path}.accounts", f"at most {limits['accounts']} {{platform, handle, link: linked | suggested}}"))
    return problems


def text_machine(block):
    states = [s for s in block.get("states", []) if isinstance(s, dict)]
    names = {s.get("id"): str(s.get("label", "")) for s in states}
    lines = []
    if block.get("title"):
        lines.append(f"**{block['title']}**")
    if block.get("summary"):
        lines.append(str(block["summary"]))
    for state in states:
        mark = "**now** " if state.get("current") else ""
        explain = f": {state['explain']}" if state.get("explain") else ""
        lines.append(f"- {mark}{state.get('label', '')}{explain}")
    for transition in block.get("transitions", []):
        if isinstance(transition, dict) and transition.get("next"):
            tool = f" with {transition['tool']}" if transition.get("tool") else ""
            lines.append(f"Next move: {transition.get('event', '')}{tool} ({names.get(transition.get('from'), '')} to {names.get(transition.get('to'), '')})")
    return "\n".join(lines)[:TEXT_LIMIT]


def register_machine(genui, path=SPEC_FILE):
    spec = load_spec(path)
    return genui.register_block(spec["kind"], lambda block, where: check_machine(block, where, spec), text_machine, spec["catalog"])
