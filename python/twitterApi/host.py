from __future__ import annotations

import asyncio
import json
import os
import secrets
import socket
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from twitterApi import engine as e

IDLE_SECONDS = 1800
START_WAIT_SECONDS = 30.0
CODE_ROOTS = (ROOT / "twitterApi", ROOT / "platformKit", ROOT.parent / "vendor" / "twikit" / "twikit")


def code_files() -> list[Path]:
    return [p for root in CODE_ROOTS if root.exists() for p in root.rglob("*.py")]


def host_path(account: str) -> Path:
    return e.state_dir(account) / "host.json"


def host_log(account: str) -> Path:
    return e.state_dir(account) / "host.log"


def code_stamp() -> float:
    return max((p.stat().st_mtime for p in code_files()), default=0.0)


def pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    if os.name == "nt":
        import ctypes
        handle = ctypes.windll.kernel32.OpenProcess(0x1000, False, pid)
        if not handle:
            return False
        code = ctypes.c_ulong()
        ctypes.windll.kernel32.GetExitCodeProcess(handle, ctypes.byref(code))
        ctypes.windll.kernel32.CloseHandle(handle)
        return code.value == 259
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def read_host(account: str) -> dict[str, Any] | None:
    try:
        return json.loads(host_path(account).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def live_host(account: str) -> dict[str, Any] | None:
    info = read_host(account)
    if not info or not info.get("port") or not pid_alive(int(info.get("pid") or 0)):
        return None
    return info


class Host:
    def __init__(self, account: str) -> None:
        self.account = account
        self.token = secrets.token_urlsafe(32)
        self.calls = 0
        self.started = time.time()
        self.last = time.time()
        self.stamp = code_stamp()
        self.active = 0
        self.watching = 0
        self.writers: set[asyncio.StreamWriter] = set()
        self.port = 0
        self.serial = asyncio.Lock()

    def record(self) -> None:
        path = host_path(self.account)
        path.write_text(json.dumps({
            "pid": os.getpid(),
            "port": self.port,
            "token": self.token,
            "startedAt": self.started,
            "calls": self.calls,
            "lastCallAt": self.last,
        }), encoding="utf-8")
        try:
            os.chmod(path, 0o600)
        except OSError:
            pass

    def stamp_of(self, out: dict[str, Any]) -> dict[str, Any]:
        out["xSession"] = {"pid": os.getpid(), "calls": self.calls, "since": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(self.started))}
        return out

    async def answer(self, spec: dict[str, Any], writer: asyncio.StreamWriter) -> dict[str, Any]:
        if spec.get("account") != self.account:
            return {"ok": False, "code": "xSessionHostRefused", "detail": f"this X session is {self.account}'s, not {spec.get('account')}'s"}
        token = e.LIVE_WRITER.set(writer)
        self.active += 1
        try:
            if spec.get("action") in e.UNLOCKED:
                self.watching += 1
                try:
                    return await e.run(spec)
                finally:
                    self.watching -= 1
            async with self.serial:
                return await e.run(spec)
        finally:
            self.active -= 1
            e.LIVE_WRITER.reset(token)

    async def handle(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
        self.writers.add(writer)
        try:
            request = json.loads(await asyncio.wait_for(reader.readline(), 30))
            if request.get("token") != self.token:
                out = {"ok": False, "code": "xSessionHostRefused", "detail": "the call didn't carry this X session's token"}
            else:
                out = await self.answer(request.get("spec") or {}, writer)
                self.calls += 1
                self.last = time.time()
                self.record()
                out = self.stamp_of(out)
        except Exception as error:
            out = {"ok": False, "code": "xSessionHostError", "detail": str(error)[:300]}
        try:
            writer.write((json.dumps({"answer": out}, default=str) + "\n").encode("utf-8"))
            await writer.drain()
        finally:
            self.writers.discard(writer)
            writer.close()

    async def serve(self) -> int:
        e.HOSTING = True
        try:
            lock = e.AccountLock(self.account, wait_seconds=1, name="host.lock")
            await lock.__aenter__()
        except e.AccountBusy:
            print(f"another X session already holds {self.account}; this one exits", flush=True)
            return 1
        server = None
        try:
            server = await asyncio.start_server(self.handle, "127.0.0.1", 0)
            self.port = server.sockets[0].getsockname()[1]
            self.record()
            print(f"X session for {self.account} up: pid {os.getpid()}, port {self.port}", flush=True)
            while True:
                await asyncio.sleep(5)
                idle = time.time() - self.last
                if self.active == 0 and idle > IDLE_SECONDS:
                    print(f"idle {int(idle)} s: closing the X session", flush=True)
                    break
                if self.active == self.watching and code_stamp() != self.stamp:
                    print("log's X engine code changed: closing so the next call starts the new code", flush=True)
                    break
        finally:
            info = read_host(self.account)
            if info and info.get("pid") == os.getpid():
                host_path(self.account).unlink(missing_ok=True)
            if server is not None:
                server.close()
            for writer in list(self.writers):
                writer.close()
            await lock.__aexit__()
        return 0


def start_host(account: str) -> None:
    options: dict[str, Any] = {}
    if os.name == "nt":
        options["creationflags"] = 0x00000008 | 0x00000200
    else:
        options["start_new_session"] = True
    log = open(host_log(account), "ab")
    subprocess.Popen([sys.executable, str(Path(__file__)), account], stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT, close_fds=True, cwd=str(ROOT), **options)


def ensure_host(account: str, wait_seconds: float = START_WAIT_SECONDS) -> dict[str, Any] | None:
    info = live_host(account)
    if info:
        return info
    start_host(account)
    deadline = time.time() + wait_seconds
    while time.time() < deadline:
        time.sleep(0.25)
        info = live_host(account)
        if info:
            return info
    return None


def connect_host(account: str) -> tuple[socket.socket | None, dict[str, Any] | None, str]:
    error_text = ""
    for attempt in range(2):
        info = ensure_host(account)
        if not info:
            return None, None, f"the one X session for {account} didn't start in {int(START_WAIT_SECONDS)} s"
        try:
            return socket.create_connection(("127.0.0.1", int(info["port"])), timeout=10), info, ""
        except OSError as error:
            error_text = f"the X session for {account} (pid {info.get('pid')}) didn't answer on its port: {error}"
            deadline = time.time() + START_WAIT_SECONDS
            while attempt == 0 and pid_alive(int(info.get("pid") or 0)) and time.time() < deadline:
                time.sleep(0.25)
    return None, None, error_text


def call(spec: dict[str, Any]) -> dict[str, Any]:
    account = spec["account"]
    sock, info, error_text = connect_host(account)
    if sock is None or info is None:
        return {"ok": False, "code": "xSessionHostDown", "detail": f"{error_text}, so nothing was sent and no second session was opened (rule 104). Its log: {host_log(account)}"}
    with sock:
        sock.settimeout(None)
        sock.sendall((json.dumps({"token": info["token"], "spec": spec}) + "\n").encode("utf-8"))
        for line in sock.makefile("r", encoding="utf-8"):
            line = line.strip()
            if not line:
                continue
            message = json.loads(line)
            if "liveEvent" in message:
                print(line, flush=True)
                continue
            if "answer" in message:
                return message["answer"]
    return {"ok": False, "code": "xSessionHostError", "detail": f"the X session for {account} closed without an answer"}


def main() -> int:
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    return asyncio.run(Host(sys.argv[1]).serve())


if __name__ == "__main__":
    raise SystemExit(main())
