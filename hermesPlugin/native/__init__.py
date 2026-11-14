import json
import os
import subprocess
from pathlib import Path

HOOK_TIMEOUT_SECONDS = 20
EVENT_SCRIPT = ("scripts", "hooks", "event.ts")


def log_root():
    named = os.environ.get("LOG_ROOT", "").strip()
    if named:
        return Path(named)
    meta = Path(__file__).with_name("plugin.yaml")
    if meta.exists():
        for line in meta.read_text(encoding="utf-8").splitlines():
            if line.startswith("log_root:"):
                return Path(line.split(":", 1)[1].strip().strip("'\""))
    return Path(__file__).resolve().parents[2]


def ask_log(event, payload):
    root = log_root()
    script = root.joinpath(*EVENT_SCRIPT)
    if not script.exists():
        return ""
    bun = os.environ.get("LOG_BUN", "bun")
    try:
        run = subprocess.run(
            [bun, str(script), event, "--host", "hermes"],
            input=json.dumps({"hook_event_name": event, **payload}),
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=HOOK_TIMEOUT_SECONDS,
            cwd=str(root),
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    if run.returncode != 0 or not run.stdout.strip():
        return ""
    try:
        answer = json.loads(run.stdout)
    except ValueError:
        return ""
    context = answer.get("context") if isinstance(answer, dict) else None
    return context if isinstance(context, str) else ""


def pre_llm_call(session_id="", user_message="", conversation_history=None, is_first_turn=False, **kwargs):
    events = (["SessionStart"] if is_first_turn else []) + ["UserPromptSubmit"]
    payload = {"session_id": session_id or "", "prompt": user_message or "", "source": "startup"}
    texts = [ask_log(event, payload) for event in events]
    text = "\n\n".join(t for t in texts if t)
    return {"context": text} if text else None


def register(ctx):
    ctx.register_hook("pre_llm_call", pre_llm_call)
