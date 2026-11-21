import http.client
import importlib.util
import json
import os
import sys
import re
import shutil
import socket
import sqlite3
import subprocess
import threading
import time
from pathlib import Path

HOOK_TIMEOUT_SECONDS = 20
SERVICE_HOST = "127.0.0.1"
SERVICE_CONNECT_SECONDS = 0.3
SERVICE_ANSWER_SECONDS = 10
EVENT_SCRIPT = ("scripts", "hooks", "event.ts")
PUSH_SCRIPT = ("scripts", "hooks", "push.ts")
HAND_ROLLED_SCRIPT = ("scripts", "hooks", "handRolled.ts")
HAND_ROLLED_TOOLS = re.compile(r"^(?:mcp__)?(?:terminal|execute_code|write_file|browser_exec|tool_call|patch)$")
HAND_ROLLED_HINT = re.compile(r"log\.db|\.logCli|https?://|sqlite|requests\.|urllib|httpx|fetch\(|curl|wget|\.(?:ts|py|js|mjs)\b", re.I)
PUSH_RETRY_SECONDS = 10
BUSY_LIMIT_SECONDS = 600
PACKAGE = ("@listeningkit", "log")
VIEW_TAG = re.compile(r'::logview\{id="([0-9a-f]{8})"\}')
DRAWING_PLATFORMS = frozenset({"local", "desktop"})
VIEW_TEXT_LIMIT = 3500
VIEW_ELSEWHERE = "(a view that draws only in Hermes Desktop and the Hermes Webapp)"
BROWSER_TAG = re.compile(r'::logbrowser\{account="([A-Za-z0-9_.@+-]{1,128})"\}')
BROWSER_ELSEWHERE = "({account}'s live browser, which shows only in Hermes Desktop)"
APP_TAG = re.compile(r"""::logapp\{((?:"[^"\n]*"|'[^'\n]*'|[^}'"\n]){1,4400})\}""")
APP_ATTR = re.compile(r"""([A-Za-z]+)=(?:"([^"]*)"|'([^']*)')""")
APP_ELSEWHERE = "(log's {tool} view, which shows only in Hermes Desktop)"
GENUI = ("vendor", "hermesGenui")
GENUI_PACKAGE = "log_hermes_genui"
GENUI_MACHINE = ("hermesPlugin", "genuiMachine.py")
GENUI_MACHINE_PACKAGE = "log_hermes_genui_machine"
SKILLS = ("hermesPlugin", "skills")
MCP_SERVER = "log"
MCP_SETUP = 'hermes mcp add log --command logMcp --env "LOG_ACCOUNTS=${LOG_ACCOUNTS}"'
MCP_MISSING = (
    ">>> LOG'S TOOLS ARE NOT SET UP IN HERMES: the log plugin is loaded, but config.yaml has no mcp_servers.log, so no mcp__log__* tool exists. "
    f"Tell the owner to run `{MCP_SETUP}` (or `log launch --setup`), then restart Hermes. Don't hand-roll log's reads meanwhile."
)


def has_event_script(root):
    try:
        return root.joinpath(*EVENT_SCRIPT).is_file()
    except OSError:
        return False


def named_root():
    named = os.environ.get("LOG_ROOT", "").strip()
    if named:
        return Path(named)
    meta = Path(__file__).with_name("plugin.yaml")
    if meta.exists():
        for line in meta.read_text(encoding="utf-8").splitlines():
            if line.startswith("log_root:"):
                return Path(line.split(":", 1)[1].strip().strip("'\""))
    return None


def bun_home():
    return Path(os.environ.get("BUN_INSTALL", "").strip() or Path.home() / ".bun")


def global_installs():
    home = Path.home()
    roots = [bun_home() / "install" / "global" / "node_modules"]
    appdata = os.environ.get("APPDATA", "").strip()
    if appdata:
        roots.append(Path(appdata) / "npm" / "node_modules")
    prefix = os.environ.get("NPM_CONFIG_PREFIX", "").strip()
    if prefix:
        roots += [Path(prefix) / "lib" / "node_modules", Path(prefix) / "node_modules"]
    roots += [home / ".npm-global" / "lib" / "node_modules", Path("/usr/local/lib/node_modules"), Path("/opt/homebrew/lib/node_modules"), Path("/usr/lib/node_modules")]
    return [root.joinpath(*PACKAGE) for root in roots]


def log_root():
    named = named_root()
    if named is not None:
        return named
    for candidate in global_installs():
        if has_event_script(candidate):
            return candidate.resolve()
    return Path(__file__).resolve().parents[2]


def bun_command():
    named = os.environ.get("LOG_BUN", "").strip()
    if named:
        return named
    found = shutil.which("bun")
    if found:
        return found
    for name in ("bun.exe", "bun"):
        candidate = bun_home() / "bin" / name
        if candidate.is_file():
            return str(candidate)
    return "bun"


def service_port():
    try:
        return int(os.environ.get("LOG_CONTEXT_PORT", "").strip() or 47317)
    except ValueError:
        return 47317


def context_of(raw):
    try:
        answer = json.loads(raw) if raw.strip() else {}
    except ValueError:
        return ""
    context = answer.get("context") if isinstance(answer, dict) else None
    return context if isinstance(context, str) else ""


def ask_service_path(path, body):
    if os.environ.get("LOG_CONTEXT_SERVICE", "").strip() == "off":
        return None
    try:
        sock = socket.create_connection((SERVICE_HOST, service_port()), timeout=SERVICE_CONNECT_SECONDS)
    except OSError:
        return None
    conn = http.client.HTTPConnection(SERVICE_HOST, service_port(), timeout=SERVICE_ANSWER_SECONDS)
    conn.sock = sock
    sock.settimeout(SERVICE_ANSWER_SECONDS)
    try:
        conn.request("POST", path, body=body.encode("utf-8"), headers={"content-type": "application/json"})
        response = conn.getresponse()
        raw = response.read().decode("utf-8", errors="replace")
        return context_of(raw) if response.status == 200 else None
    except (OSError, http.client.HTTPException):
        return ""
    finally:
        conn.close()


def ask_service(event, body):
    return ask_service_path(f"/hooks/{event}?host=hermes", body)


def ask_log(event, payload):
    body = json.dumps({"hook_event_name": event, **payload, "log_sent_at": time.time() * 1000})
    answered = ask_service(event, body)
    if answered is not None:
        return answered
    return ask_script(EVENT_SCRIPT, [event], event, payload, body)


def ask_script(parts, argv, event, payload, body=None):
    root = log_root()
    script = root.joinpath(*parts)
    if not script.exists():
        return ""
    try:
        run = subprocess.run(
            [bun_command(), str(script), *argv, "--host", "hermes"],
            input=body if body is not None else json.dumps({"hook_event_name": event, **payload}),
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=HOOK_TIMEOUT_SECONDS,
            cwd=str(root),
            env=hook_env(),
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    if run.returncode != 0:
        return ""
    return context_of(run.stdout or "")


def reader_of(session_id):
    return re.sub(r"[^A-Za-z0-9_-]", "", session_id or "")[:80]


def push_state_path():
    return Path(os.environ.get("LOG_INBOX_STATE", "").strip() or Path.home() / ".logCli" / "inbox") / "hermesPush.json"


def put_push_state(body, db=None):
    path = db or log_db()
    if not path.is_file():
        return False
    try:
        handle = sqlite3.connect(f"{path.resolve().as_uri()}?mode=rw", uri=True, timeout=5)
        try:
            handle.execute("INSERT INTO state (scope, key, body, updatedAt) VALUES ('hermesPush', 'current', ?, ?) ON CONFLICT(scope, key) DO UPDATE SET body = excluded.body, updatedAt = excluded.updatedAt", (body, int(time.time() * 1000)))
            handle.commit()
        finally:
            handle.close()
        return True
    except (sqlite3.Error, ValueError, OSError):
        return False


def stored_push_state(db=None):
    path = db or log_db()
    if not path.is_file():
        return None
    try:
        handle = sqlite3.connect(f"{path.resolve().as_uri()}?mode=ro", uri=True, timeout=2)
        try:
            row = handle.execute("SELECT body FROM state WHERE scope = 'hermesPush' AND key = 'current'").fetchone()
        finally:
            handle.close()
        return row[0] if row else None
    except (sqlite3.Error, ValueError, OSError):
        return None


class Push:
    def __init__(self):
        self.ctx = None
        self.key = ""
        self.reader = ""
        self.proc = None
        self.runner = None
        self.lock = threading.Lock()
        self.busy_since = 0.0
        self.held = []

    def start_turn(self):
        with self.lock:
            self.busy_since = time.time()

    def busy(self):
        return self.busy_since and time.time() - self.busy_since < BUSY_LIMIT_SECONDS

    def take_held(self):
        with self.lock:
            held, self.held = self.held, []
        return "\n\n".join(held)

    def end_turn(self):
        with self.lock:
            self.busy_since = 0.0
        held = self.take_held()
        if held:
            self.deliver(held)

    def deliver(self, context):
        try:
            self.ctx.inject_message(context, role="user", session_key=self.key)
        except Exception:
            pass

    def arrived(self, context):
        with self.lock:
            if self.busy():
                self.held.append(context)
                return
        self.deliver(context)

    def remember(self, key, reader):
        body = json.dumps({"sessionKey": key, "reader": reader})
        if put_push_state(body):
            return
        try:
            path = push_state_path()
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(body, encoding="utf-8")
        except OSError:
            pass

    def recall(self):
        try:
            saved = json.loads(stored_push_state() or push_state_path().read_text(encoding="utf-8"))
            return str(saved.get("sessionKey") or ""), str(saved.get("reader") or "")
        except (OSError, ValueError):
            return "", ""

    def follow(self, key, reader):
        if not self.ctx or not key or not reader or not hasattr(self.ctx, "inject_message"):
            return
        with self.lock:
            if key == self.key and reader == self.reader and self.runner and self.runner.is_alive():
                return
            self.key, self.reader = key, reader
            self.remember(key, reader)
            self.stop()
            self.runner = threading.Thread(target=self.run, args=(key, reader), daemon=True)
            self.runner.start()

    def current(self, key, reader):
        return self.key == key and self.reader == reader and self.runner is threading.current_thread()

    def stop(self):
        proc, self.proc = self.proc, None
        if proc and proc.poll() is None:
            try:
                proc.kill()
            except OSError:
                pass

    def run(self, key, reader):
        script = log_root().joinpath(*PUSH_SCRIPT)
        while self.current(key, reader) and script.exists():
            try:
                proc = subprocess.Popen(
                    [bun_command(), str(script), "--host", "hermes", "--reader", reader],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.DEVNULL,
                    text=True,
                    encoding="utf-8",
                    cwd=str(log_root()),
                    env=hook_env(),
                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                )
            except OSError:
                time.sleep(PUSH_RETRY_SECONDS)
                continue
            with self.lock:
                if not self.current(key, reader):
                    proc.kill()
                    return
                self.proc = proc
            for line in proc.stdout:
                if not self.current(key, reader):
                    break
                try:
                    batch = json.loads(line)
                except ValueError:
                    continue
                context = batch.get("context") if isinstance(batch, dict) else None
                if isinstance(context, str) and context.strip():
                    self.arrived(context)
            if self.current(key, reader):
                time.sleep(PUSH_RETRY_SECONDS)


PUSH = Push()


def bound_key():
    try:
        from gateway.session_context import bound_session_key
        return bound_session_key() or ""
    except Exception:
        return ""


def hermes_home():
    try:
        from hermes_constants import get_hermes_home
        return Path(get_hermes_home())
    except Exception:
        named = os.environ.get("HERMES_HOME", "").strip()
        return Path(named) if named else Path.home() / ".hermes"


def mcp_configured(config_path=None):
    path = Path(config_path) if config_path else hermes_home() / "config.yaml"
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return False
    try:
        import yaml
        servers = (yaml.safe_load(text) or {}).get("mcp_servers") or {}
        return isinstance(servers, dict) and MCP_SERVER in servers
    except Exception:
        block = re.search(r"^mcp_servers:\s*\n((?:[ \t]+.*\n?|\s*\n)*)", text, re.M)
        return bool(block and re.search(rf"^[ \t]+{MCP_SERVER}:", block.group(1), re.M))


def replies_setting(config_path=None):
    path = Path(config_path) if config_path else hermes_home() / "config.yaml"
    try:
        import yaml
        config = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception:
        return ""
    entry = ((config.get("plugins") or {}).get("entries") or {}).get(MCP_SERVER) or {}
    value = entry.get("replies") if isinstance(entry, dict) else None
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        return ",".join(f"{k}={v}" for k, v in value.items() if isinstance(v, str))
    return ""


def hook_env():
    replies = replies_setting()
    return {**os.environ, "LOG_REPLIES": replies} if replies else None


def pre_llm_call(session_id="", user_message="", conversation_history=None, is_first_turn=False, **kwargs):
    PUSH.follow(bound_key(), reader_of(session_id))
    PUSH.start_turn()
    events = (["SessionStart"] if is_first_turn else []) + ["UserPromptSubmit"]
    payload = {"session_id": session_id or "", "prompt": user_message or "", "source": "startup"}
    setup = [] if mcp_configured() else [MCP_MISSING]
    asked = ["" for _ in events]

    def ask(i, event):
        asked[i] = ask_log(event, payload)

    threads = [threading.Thread(target=ask, args=(i, event), daemon=True) for i, event in enumerate(events[1:], start=1)]
    for thread in threads:
        thread.start()
    ask(0, events[0])
    for thread in threads:
        thread.join(HOOK_TIMEOUT_SECONDS)
    texts = setup + asked + [PUSH.take_held()]
    text = "\n\n".join(t for t in texts if t)
    return {"context": text} if text else None


LOG_TOOL = re.compile(r"^mcp__log__\w+$")
LIVE_MARK = "\n\n>>> LANDED WHILE THIS TOOL RAN (live, read before the next send; the draft may be stale):\n"


def log_tool_of(tool_name, args):
    if LOG_TOOL.match(tool_name or ""):
        return tool_name
    if tool_name in ("mcp__tool_call", "tool_call") and isinstance(args, dict):
        for call in args.get("calls") or []:
            name = call.get("name") if isinstance(call, dict) else ""
            if LOG_TOOL.match(name or ""):
                return name
    return ""


def hand_rolled_advice(tool_name, args, session_id=""):
    if not HAND_ROLLED_TOOLS.match(tool_name or "") or not isinstance(args, dict):
        return ""
    try:
        text = json.dumps(args)
    except (TypeError, ValueError):
        return ""
    if not HAND_ROLLED_HINT.search(text):
        return ""
    payload = {"session_id": session_id or "", "tool_name": tool_name, "tool_input": args, "cwd": os.getcwd()}
    answered = ask_service_path("/hooks/PreToolUse/handRolled?host=hermes", json.dumps({"hook_event_name": "PreToolUse", **payload}))
    if answered is not None:
        return answered
    return ask_script(HAND_ROLLED_SCRIPT, [], "PreToolUse", payload)


def transform_tool_result(tool_name="", args=None, result=None, session_id="", **kwargs):
    if not isinstance(result, str):
        return None
    subject = log_tool_of(tool_name, args)
    asked = ask_log("PostToolUse", {"session_id": session_id or "", "tool_name": subject}) if subject else ""
    landed = "\n\n".join(t for t in (PUSH.take_held(), asked) if t.strip())
    advice = hand_rolled_advice(tool_name, args, session_id)
    out = result + LIVE_MARK + landed if landed else result
    out = out + "\n\n" + advice if advice else out
    return out if out != result else None


def tool_calls_this_turn(conversation_history):
    count = 0
    for message in reversed(conversation_history or []):
        if not isinstance(message, dict):
            continue
        if message.get("role") == "user":
            break
        if message.get("role") == "assistant":
            count += len(message.get("tool_calls") or [])
    return count


def post_llm_call(session_id="", conversation_history=None, **kwargs):
    PUSH.end_turn()
    payload = {"session_id": session_id or "", "tool_calls": tool_calls_this_turn(conversation_history)}
    threading.Thread(target=ask_log, args=("Stop", payload), daemon=True).start()


SCRIPT_TOOLS = re.compile(r"(^|_)(execute_code|terminal)$")
SPILL_PATH = re.compile(r"[A-Za-z]:[\/][^\s'\"]*spillover[\/][\w.-]+|/[^\s'\"]*spillover/[\w.-]+")
LOG_PIPE = re.compile(r"(?:^|[;&|(\s])log\s+([a-z][a-zA-Z]*)\s+([a-z][a-zA-Z]*)?[^\n|]*\|\s*(?:grep|rg|findstr|python\d?|py|jq|awk|sed|Select-String|ConvertFrom-Json)\b")
LOG_ARGV = re.compile(r"\[\s*['\"]log['\"]\s*,\s*['\"]([a-z][a-zA-Z]*)['\"](?:\s*,\s*['\"]([a-z][a-zA-Z]*)['\"])?")
LOG_RESULT_HEAD = "Browsers:"
LOG_RESULT_EXIT = re.compile(r"(?m)^exit -?\d+[ \t]*$")
NARROWING = {
    "discordChats": "--kind dm,group, --name <text>",
    "inboxWaiting": "--tail <n>, --platform <p>, --limit <n>",
}


def tool_of(words):
    first, second = (words + ("",))[:2]
    return first + second[:1].upper() + second[1:] if second else first


def spilled_log_result(text):
    for path in SPILL_PATH.findall(text):
        try:
            with open(path, encoding="utf-8", errors="replace") as handle:
                body = handle.read()
            if body.startswith(LOG_RESULT_HEAD) or LOG_RESULT_EXIT.search(body):
                return True
        except OSError:
            continue
    return False


def parsed_log_tool(text):
    for pattern in (LOG_PIPE, LOG_ARGV):
        found = pattern.search(text)
        if found and (pattern is LOG_PIPE or re.search(r"json\.loads?|re\.(search|findall)|\bgrep\b|split\(", text)):
            return tool_of(tuple(g for g in found.groups() if g))
    return "a log tool" if spilled_log_result(text) else ""


def script_refusal(tool_name, args):
    if not SCRIPT_TOOLS.search(tool_name or "") or not isinstance(args, dict):
        return ""
    text = re.sub(r"\bgit\s+log\b", "git", "\n".join(str(args.get(key) or "") for key in ("code", "command")))
    tool = parsed_log_tool(text) if text.strip() else ""
    if not tool:
        return ""
    flags = NARROWING.get(tool, "the narrowing flags in its schema")
    return f"log has a flag for this: {tool} {flags}; don't parse log output with scripts. Call the log tool again with those flags (a log result over 40 KB comes back as a head that names them)."


def pre_tool_call(tool_name="", args=None, **kwargs):
    message = script_refusal(tool_name, args)
    return {"action": "block", "message": message} if message else None


def log_db():
    named = os.environ.get("LOG_DB", "").strip()
    if named:
        return Path(named)
    state = os.environ.get("LOG_INBOX_STATE", "").strip()
    return Path(state) / "log.db" if state else Path.home() / ".logCli" / "log.db"


def stored_view(view_id, db=None):
    path = db or log_db()
    if not path.is_file():
        return None
    try:
        handle = sqlite3.connect(f"{path.resolve().as_uri()}?mode=ro", uri=True, timeout=2)
        try:
            row = handle.execute("SELECT body FROM state WHERE scope = 'hermesView' AND key = ?", (view_id,)).fetchone()
        finally:
            handle.close()
        return json.loads(row[0]) if row else None
    except (sqlite3.Error, ValueError, OSError):
        return None


def view_text(view_id, db=None):
    stored = stored_view(view_id, db)
    text = stored.get("text") if isinstance(stored, dict) else None
    if not isinstance(text, str) or not text.strip():
        return VIEW_ELSEWHERE
    return text if len(text) <= VIEW_TEXT_LIMIT else text[:VIEW_TEXT_LIMIT].rstrip() + " ..."


def app_text(attrs_text):
    attrs = {m.group(1): m.group(2) if m.group(2) is not None else m.group(3) for m in APP_ATTR.finditer(attrs_text)}
    tool = attrs.get("tool") or "browserView"
    if tool == "report" and re.fullmatch(r"[0-9a-f]{8}", attrs.get("view") or ""):
        return view_text(attrs["view"])
    account = attrs.get("account")
    if not account and attrs.get("args"):
        try:
            given = json.loads(attrs["args"])
            account = given.get("account") if isinstance(given, dict) else None
        except ValueError:
            account = None
    if tool == "browserView" and isinstance(account, str) and re.fullmatch(r"[A-Za-z0-9_.@+-]{1,128}", account):
        return BROWSER_ELSEWHERE.format(account=account)
    return APP_ELSEWHERE.format(tool=tool if re.fullmatch(r"[A-Za-z][A-Za-z0-9]{0,63}", tool) else "app")


def transform_llm_output(response_text="", platform="", **kwargs):
    if not isinstance(response_text, str) or str(platform or "").strip().lower() in DRAWING_PLATFORMS:
        return None
    if not VIEW_TAG.search(response_text) and not BROWSER_TAG.search(response_text) and not APP_TAG.search(response_text):
        return None
    try:
        replaced = VIEW_TAG.sub(lambda match: view_text(match.group(1)), response_text)
        replaced = BROWSER_TAG.sub(lambda match: BROWSER_ELSEWHERE.format(account=match.group(1)), replaced)
        replaced = APP_TAG.sub(lambda match: app_text(match.group(1)), replaced)
    except Exception:
        return None
    return replaced if replaced != response_text else None


def load_genui(root):
    folder = root.joinpath(*GENUI)
    if not folder.joinpath("__init__.py").is_file():
        return None
    if GENUI_PACKAGE in sys.modules:
        return sys.modules[GENUI_PACKAGE]
    spec = importlib.util.spec_from_file_location(GENUI_PACKAGE, folder / "__init__.py", submodule_search_locations=[str(folder)])
    module = importlib.util.module_from_spec(spec)
    sys.modules[GENUI_PACKAGE] = module
    try:
        spec.loader.exec_module(module)
    except Exception:
        sys.modules.pop(GENUI_PACKAGE, None)
        raise
    return module


class GenuiContext:
    def __init__(self, ctx):
        self.ctx = ctx
        self.transforms = []

    def register_hook(self, name, callback):
        if name == "transform_llm_output":
            self.transforms.append(callback)
            return None
        return self.ctx.register_hook(name, callback)

    def __getattr__(self, name):
        return getattr(self.ctx, name)


GENUI_TRANSFORMS = []


def combined_llm_output(response_text="", platform="", **kwargs):
    text = response_text
    for transform in [*GENUI_TRANSFORMS, transform_llm_output]:
        try:
            rewrite = transform(response_text=text, platform=platform, **kwargs)
        except Exception:
            rewrite = None
        if isinstance(rewrite, str) and rewrite:
            text = rewrite
    return text if text != response_text else None


def register_genui_blocks(genui, root):
    path = root.joinpath(*GENUI_MACHINE)
    if not path.is_file() or not hasattr(genui, "register_block"):
        return False
    try:
        spec = importlib.util.spec_from_file_location(GENUI_MACHINE_PACKAGE, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return bool(module.register_machine(genui))
    except Exception:
        return False


def register_genui(ctx):
    try:
        root = log_root()
        genui = load_genui(root)
        if genui is None:
            return False
        register_genui_blocks(genui, root)
        wrapped = GenuiContext(ctx)
        genui.register(wrapped)
        GENUI_TRANSFORMS[:] = wrapped.transforms
        return True
    except Exception:
        return False


def skills_dir():
    own = Path(__file__).with_name("skills")
    if own.is_dir():
        return own
    try:
        return log_root().joinpath(*SKILLS)
    except Exception:
        return own


def register_skills(ctx):
    folder = skills_dir()
    names = []
    try:
        children = sorted(folder.iterdir())
    except OSError:
        return names
    for child in children:
        skill_md = child / "SKILL.md"
        if not (child.is_dir() and skill_md.is_file()):
            continue
        try:
            ctx.register_skill(child.name, skill_md)
            names.append(child.name)
        except Exception:
            continue
    return names


def register(ctx):
    PUSH.ctx = ctx
    register_skills(ctx)
    ctx.register_hook("pre_llm_call", pre_llm_call)
    ctx.register_hook("pre_tool_call", pre_tool_call)
    ctx.register_hook("transform_tool_result", transform_tool_result)
    ctx.register_hook("post_llm_call", post_llm_call)
    register_genui(ctx)
    ctx.register_hook("transform_llm_output", combined_llm_output)
    key, reader = PUSH.recall()
    PUSH.follow(key, reader)
