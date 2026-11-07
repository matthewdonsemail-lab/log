import { describe, expect, test } from "bun:test";
import { ReloadProxy } from "./index.ts";
import type { ChildEvents, ReloadChild, ReloadState } from "./index.ts";

interface FakeChild extends ReloadChild {
  lines: string[];
  events: ChildEvents;
  dead: boolean;
}

function rig() {
  const children: FakeChild[] = [];
  const client: string[] = [];
  const logs: string[] = [];
  const states: ReloadState[] = [];
  let stamp = 100;
  let jobs: string[] = [];
  const proxy = new ReloadProxy({
    startChild: (events) => {
      const child: FakeChild = { pid: 1000 + children.length, lines: [], events, dead: false, write: (line) => child.lines.push(line), kill: () => (child.dead = true) };
      children.push(child);
      return child;
    },
    stamp: () => stamp,
    jobsRunning: () => jobs,
    toClient: (line) => client.push(line),
    log: (line) => logs.push(line),
    record: (state) => states.push({ ...state }),
    now: () => 0,
  });
  proxy.start();
  return {
    proxy,
    children,
    client,
    logs,
    states,
    setStamp: (n: number) => (stamp = n),
    setJobs: (j: string[]) => (jobs = j),
    init: () => {
      proxy.fromClient(JSON.stringify({ jsonrpc: "2.0", id: 0, method: "initialize", params: { protocolVersion: "2025-06-18", clientInfo: { name: "claude-code" } } }));
      children[0].events.onLine(JSON.stringify({ jsonrpc: "2.0", id: 0, result: { serverInfo: { name: "log" } } }));
      proxy.fromClient(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }));
    },
  };
}

const call = (id: number) => JSON.stringify({ jsonrpc: "2.0", id, method: "tools/call", params: { name: "timing", arguments: {} } });
const answer = (id: number | string) => JSON.stringify({ jsonrpc: "2.0", id, result: { content: [] } });

describe("reload proxy", () => {
  test("passes every message both ways while the code hasn't changed", () => {
    const r = rig();
    r.init();
    r.proxy.fromClient(call(1));
    r.children[0].events.onLine(answer(1));
    expect(r.children).toHaveLength(1);
    expect(r.children[0].lines.at(-1)).toBe(call(1));
    expect(r.client.at(-1)).toBe(answer(1));
  });

  test("a code change starts a new server, replays initialize, swaps and says the tools changed", () => {
    const r = rig();
    r.init();
    r.setStamp(200);
    r.proxy.fromClient(call(2));
    expect(r.children).toHaveLength(2);
    const replay = JSON.parse(r.children[1].lines[0]);
    expect(replay.method).toBe("initialize");
    expect(replay.params.clientInfo.name).toBe("claude-code");
    expect(r.children[1].lines).not.toContain(call(2));
    r.children[1].events.onLine(answer(replay.id));
    expect(r.children[0].dead).toBe(true);
    expect(r.children[1].lines).toContain(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }));
    expect(r.children[1].lines.at(-1)).toBe(call(2));
    expect(r.client).toContain(JSON.stringify({ jsonrpc: "2.0", method: "notifications/tools/list_changed" }));
    expect(r.client.some((l) => l.includes(String(replay.id)))).toBe(false);
    expect(r.states.at(-1)).toMatchObject({ childPid: r.children[1].pid, childStamp: 200, reloads: 1, waitingOn: null });
  });

  test("a reload waits for a call in flight and for a running job", () => {
    const r = rig();
    r.init();
    r.proxy.fromClient(call(3));
    r.setStamp(200);
    r.proxy.tick();
    expect(r.children).toHaveLength(1);
    expect(r.states.at(-1)?.waitingOn).toContain("1 call(s) in flight");
    r.children[0].events.onLine(answer(3));
    r.setJobs(["job job1 (twitterQueueRunLive)"]);
    r.proxy.tick();
    expect(r.children).toHaveLength(1);
    expect(r.states.at(-1)?.waitingOn).toBe("job job1 (twitterQueueRunLive)");
    r.setJobs([]);
    r.proxy.tick();
    expect(r.children).toHaveLength(2);
  });

  test("a crash mid-call answers the call with an error and starts the server again", () => {
    const r = rig();
    r.init();
    r.proxy.fromClient(call(4));
    r.children[0].events.onExit(1);
    const error = JSON.parse(r.client.at(-1)!);
    expect(error).toMatchObject({ id: 4, error: { code: -32603 } });
    expect(error.error.message).toContain("logMcpRestarted");
    expect(r.children).toHaveLength(2);
    expect(JSON.parse(r.children[1].lines[0]).method).toBe("initialize");
  });

  test("new code that fails to start keeps the old server and says why", () => {
    const r = rig();
    r.init();
    r.setStamp(200);
    r.proxy.tick();
    r.children[1].events.onExit(1);
    expect(r.children[0].dead).toBe(false);
    expect(r.states.at(-1)?.lastError).toContain("didn't start");
    r.proxy.fromClient(call(5));
    expect(r.children[0].lines.at(-1)).toBe(call(5));
    r.children[0].events.onLine(answer(5));
    r.proxy.tick();
    expect(r.children).toHaveLength(2);
    r.setStamp(300);
    r.proxy.tick();
    expect(r.children).toHaveLength(3);
  });

  test("an intended kill of the old server is not taken for a crash", () => {
    const r = rig();
    r.init();
    r.setStamp(200);
    r.proxy.tick();
    const replay = JSON.parse(r.children[1].lines[0]);
    r.children[1].events.onLine(answer(replay.id));
    r.children[0].events.onExit(null);
    expect(r.children).toHaveLength(2);
    expect(r.logs.some((l) => l.includes("starting it again"))).toBe(false);
  });
});
