import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const python = join(import.meta.dir, "..", "..", "..", "..", "python");

const SCRIPT = `
import asyncio, json, sys
sys.path.insert(0, ".")
from twitterApi import host

running = []

async def fake_run(spec):
    running.append(spec["n"])
    try:
        await asyncio.sleep(3600)
    finally:
        running.remove(spec["n"])

host.e.run = fake_run

async def main():
    h = host.Host("someone")
    out = {}
    gone = asyncio.StreamReader()
    first = asyncio.ensure_future(h.watch({"action": "xchatWatch", "n": 1}, gone))
    await asyncio.sleep(0.05)
    out["runningBefore"] = list(running)
    gone.feed_eof()
    out["callerGone"] = (await first)["code"]
    out["runningAfterGone"] = list(running)
    a = asyncio.ensure_future(h.watch({"action": "xchatWatch", "n": 2}, asyncio.StreamReader()))
    await asyncio.sleep(0.05)
    b = asyncio.ensure_future(h.watch({"action": "xchatWatch", "n": 3}, asyncio.StreamReader()))
    await asyncio.sleep(0.05)
    out["replaced"] = (await a)["code"]
    out["runningAfterReplace"] = list(running)
    b.cancel()
    print(json.dumps(out))

asyncio.run(main())
`;

describe("the X session keeps one watch per account", () => {
  test("a watch stops when its caller goes away, and a newer one replaces an older one", () => {
    const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", SCRIPT], { cwd: python, encoding: "utf8" });
    expect(run.stderr).not.toContain("Traceback");
    const out = JSON.parse(run.stdout.trim().split("\n").pop() ?? "{}");
    expect(out.runningBefore).toEqual([1]);
    expect(out.callerGone).toBe("watchCallerGone");
    expect(out.runningAfterGone).toEqual([]);
    expect(out.replaced).toBe("watchReplaced");
    expect(out.runningAfterReplace).toEqual([3]);
  });
});
