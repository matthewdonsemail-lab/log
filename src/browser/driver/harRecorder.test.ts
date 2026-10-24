import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const python = join(import.meta.dir, "..", "..", "..", "python");

const SCRIPT = String.raw`
import asyncio, json, sys
sys.path.insert(0, ".")
from browser.harRecorder import Recorder

calls = []

class Response:
    def __init__(self, body, mime, fail):
        self.body_bytes, self.mime, self.fail = body, mime, fail
        self.status, self.status_text = 200, "OK"
    async def body(self):
        calls.append("body")
        if self.fail:
            raise RuntimeError("Protocol error (Network.getResponseBody): No resource with given identifier found")
        return self.body_bytes
    async def all_headers(self):
        calls.append("responseHeaders")
        return {"content-type": self.mime}

class Request:
    def __init__(self, url, body, mime, fail=False):
        self.url, self.method, self.post_data = url, "GET", None
        self.timing = {"startTime": 1792876806426, "responseEnd": 120}
        self._response = Response(body, mime, fail)
    async def response(self):
        calls.append("response")
        return self._response
    async def all_headers(self):
        calls.append("requestHeaders")
        return {}

async def main():
    out = {}
    cases = {
        "bigScript": Request("https://static.xx.fbcdn.net/rsrc.php/v4/yN/r/a.js", b"x" * 2_300_000, "application/x-javascript; charset=utf-8"),
        "lostScript": Request("https://static.xx.fbcdn.net/rsrc.php/v4/yS/r/b.js", b"", "application/x-javascript", fail=True),
        "bigJson": Request("https://www.facebook.com/api/graphql/", b"{" + b"1" * 3_000_000 + b"}", "application/json"),
    }
    for name, request in cases.items():
        calls.clear()
        recorder = Recorder()
        await recorder._entry(request, None)
        content = recorder.entries[0]["response"]["content"]
        out[name] = {"order": list(calls), "size": content["size"], "kept": len(content.get("text", "")), "bodyError": content.get("_bodyError")}
    print(json.dumps(out))

asyncio.run(main())
`;

describe("every run's recording keeps Facebook's bundles (the docs' code comes from them)", () => {
  const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", SCRIPT], { cwd: python, encoding: "utf8" });
  const out = JSON.parse(run.stdout || "{}") as Record<string, { order: string[]; size: number; kept: number; bodyError: string | null }>;

  test("the body is read first, before any header round trip, so a page that moves on can't drop it", () => {
    expect(run.status).toBe(0);
    expect(out.bigScript.order.slice(0, 2)).toEqual(["response", "body"]);
  });

  test("a 2.3 MB script is kept whole: Hazleton's run lost one at the old 2 MB limit", () => {
    expect(out.bigScript).toMatchObject({ size: 2_300_000, kept: 2_300_000, bodyError: null });
  });

  test("a body that can't be read, or is over its limit, says why instead of vanishing", () => {
    expect(out.lostScript.kept).toBe(0);
    expect(out.lostScript.bodyError).toContain("No resource with given identifier");
    expect(out.bigJson).toMatchObject({ kept: 0, bodyError: "over 2000000 bytes" });
  });
});
