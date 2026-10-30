import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const python = join(import.meta.dir, "..", "..", "..", "..", "python");

const SCRIPT = String.raw`
import asyncio, json, os, sys, tempfile
sys.path.insert(0, os.path.join(os.getcwd(), "twitterApi"))
import engine
from twikit.xchat import decode_event

ME = "100"
calls = []

class FakeClient:
    _base_headers = {}
    def __init__(self, updates):
        self.updates = updates
        self._xchat_items = None
    async def get(self, url, params=None, headers=None):
        calls.append("legacy")
        return {"inbox_initial_state": {"conversations": {}, "users": {}, "entries": [], "inbox_timelines": {}}}, None
    async def unlock_xchat(self, pin):
        calls.append("unlock")
    async def get_xchat_messages(self):
        calls.append("inboxPages")
        self._xchat_items = [{"latest_message_events": ["e10"], "latest_conversation_key_change_events": []}]
        return {"7:100": [{"event_id": "10", "sender_id": "100", "time_ms": 1000, "text": "yo lad", "type": "Message"}]}
    async def get_xchat_conversations(self):
        return [{"conversation_id": "7:100", "participant_ids": ["7"], "handles": {"7": "seven"}, "last_sender_id": "100", "last_time_ms": 1000}]
    async def get_xchat_updates(self, since):
        calls.append(("updates", since))
        return {"events": self.updates, "max_sequence_id": "11" if self.updates else since, "pages": 1, "finished": True}
    async def open_xchat_events(self, events, ids):
        calls.append(("open", ids))
        return {"messages": {"7:100": [{"event_id": "11", "sender_id": "7", "time_ms": 2000, "text": "sounds good", "type": "Message"}]}, "conversations": {}}

def fake_decode(e):
    n = e[1:]
    return {"event_id": n, "sender_id": "7", "conversation_id": "7:100", "time_ms": 2000}

import twikit.xchat
twikit.xchat.decode_event = fake_decode

cookies = {"twid": "u%3D100"}
pin = tempfile.NamedTemporaryFile("w", delete=False, suffix=".txt"); pin.write("1234"); pin.close()
spec = {"account": "xTwo", "pinPath": pin.name}
out = {}

async def main():
    out["full"] = await engine.synced_inbox(FakeClient([]), cookies, spec, 20, True)
    out["fullCalls"] = list(calls); calls.clear()
    out["quiet"] = await engine.synced_inbox(FakeClient([]), cookies, spec, 20, False)
    out["quietCalls"] = list(calls); calls.clear()
    out["fresh"] = await engine.synced_inbox(FakeClient(["e11"]), cookies, spec, 20, True)
    out["freshCalls"] = list(calls); calls.clear()
    out["again"] = await engine.synced_inbox(FakeClient(["e11"]), cookies, spec, 20, True)
    from twitterApi import inboxSync
    path = engine.sync_path(spec)
    out["pushed"] = inboxSync.push_message(path, ME, {"event_id": "15", "sender_id": "7", "time_ms": 3000, "text": "you there", "conversation_id": "7:100"}, "seven")
    out["pushedAgain"] = inboxSync.push_message(path, ME, {"event_id": "15", "sender_id": "7", "time_ms": 3000, "text": "you there", "conversation_id": "7:100"}, "seven")
    held = inboxSync.read_state(path)
    out["afterPush"] = {"max": held["maxSequenceId"], "texts": [m["text"] for m in held["xchat"]["7:100"]["messages"]], "userId": held.get("userId")}

asyncio.run(main())
print(json.dumps(out, default=str))
`;

describe("log twitter dms syncs the inbox the way X's app does: everything once, then only what is new", () => {
  const state = mkdtempSync(join(tmpdir(), "inboxSync"));
  const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", SCRIPT], { cwd: python, encoding: "utf8", env: { ...process.env, LOG_TWITTER_STATE: state } });
  const out = JSON.parse(run.stdout.trim().split("\n").pop() || "{}");

  test("the first read pulls the whole inbox once and keeps it, with the newest sequence id", () => {
    expect(run.status).toBe(0);
    expect(out.full.sync).toMatchObject({ mode: "full", maxSequenceId: "10" });
    expect(out.fullCalls).toEqual(["unlock", "inboxPages", "legacy"]);
    expect(out.full.threads[0]).toMatchObject({ conversationId: "7:100", lastText: "yo lad", lastFromMe: true, with: [{ userId: "7", handle: "seven" }] });
  });

  test("with nothing new it is one updates call from the newest held, no PIN unlock and no inbox pages", () => {
    expect(out.quietCalls).toEqual([["updates", "10"], "legacy"]);
    expect(out.quiet.sync).toMatchObject({ mode: "delta", newEvents: 0 });
    expect(out.quiet.threads[0].lastText).toBe("yo lad");
  });

  test("a new message unlocks once, opens only its conversation, and moves the sequence id on", () => {
    expect(out.freshCalls).toEqual([["updates", "10"], "legacy", "unlock", ["open", ["7:100"]]]);
    expect(out.fresh.sync).toMatchObject({ mode: "delta", newEvents: 1, newMessages: 1, maxSequenceId: "11" });
    expect(out.fresh.threads[0]).toMatchObject({ lastText: "sounds good", lastFromMe: false, unread: true });
    expect(out.fresh.conversations[0].messages.map((m: { text: string }) => m.text)).toEqual(["yo lad", "sounds good"]);
  });

  test("the same event read again is kept once", () => {
    expect(out.again.sync.newMessages).toBe(0);
    expect(out.again.conversations[0].messages).toHaveLength(2);
  });

  test("a message the live watcher pushes is kept once in the store, without moving the sequence id the next sync reads from", () => {
    expect(out.pushed).toBe(true);
    expect(out.pushedAgain).toBe(false);
    expect(out.afterPush).toEqual({ max: "11", texts: ["yo lad", "sounds good", "you there"], userId: "100" });
  });
});
