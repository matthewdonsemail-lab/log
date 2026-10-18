import { describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { captureFromHar, settleFirefoxCapture, writeFirefoxCapture } from "./index";
import { stripHar } from "./helpers/index";
import type { ReaRunner } from "./types";

const HAR = {
  log: {
    entries: [
      {
        request: {
          method: "GET",
          url: "https://www.facebook.com/rsrc.php/app.js?token=secret",
          headers: [
            { name: "Cookie", value: "c_user=1" },
            { name: "Accept", value: "*/*" },
          ],
          cookies: [{ name: "c_user", value: "1" }],
          queryString: [{ name: "token", value: "secret" }],
        },
        response: {
          status: 200,
          headers: [{ name: "set-cookie", value: "xs=2" }],
          cookies: [{ name: "xs", value: "2" }],
          content: { mimeType: "application/javascript", text: "var loaded = true;\n", size: 18 },
        },
      },
      {
        request: {
          method: "POST",
          url: "https://www.facebook.com/api/graphql",
          headers: [{ name: "Authorization", value: "Bearer abc" }],
          cookies: [],
          postData: { mimeType: "application/x-www-form-urlencoded", text: "fb_dtsg=secret" },
        },
        response: {
          status: 200,
          headers: [],
          cookies: [],
          content: { mimeType: "application/json", text: "{\"ok\":true}", encoding: "utf8" },
        },
      },
    ],
  },
};

const runner: ReaRunner = async (args) => ({ code: 0, stdout: args[0], stderr: "" });

describe("stripHar", () => {
  test("drops cookies, auth headers, query values and bodies, and keeps the script", () => {
    const capture = stripHar(HAR);
    expect(capture.counts).toEqual({ cookies: 2, headers: 3, bodies: 3, queryValues: 1 });
    expect(capture.scripts).toHaveLength(1);
    expect(capture.scripts[0].text).toBe("var loaded = true;\n");
    expect(capture.scripts[0].file).toBe("script0.js");
    const entry = (capture.har.log as { entries: Array<Record<string, unknown>> }).entries[0];
    const request = entry.request as { headers: Array<{ name: string }>; cookies: unknown[]; queryString: Array<{ value: string }> };
    expect(request.cookies).toEqual([]);
    expect(request.headers.map((header) => header.name)).toEqual(["Accept"]);
    expect(request.queryString[0].value).toBe("");
    const content = (entry.response as { content: Record<string, unknown> }).content;
    expect(content.text).toBeUndefined();
    const post = (capture.har.log as { entries: Array<{ request: { postData?: { text?: string } } }> }).entries[1].request.postData;
    expect(post?.text).toBeUndefined();
  });

  test("decodes a base64 script body", () => {
    const encoded = Buffer.from("var fromBase64 = 1;\n", "utf8").toString("base64");
    const capture = stripHar({
      log: {
        entries: [
          {
            request: { method: "GET", url: "https://cdn.example/pack.js", headers: [], cookies: [] },
            response: { status: 200, headers: [], cookies: [], content: { mimeType: "text/javascript", text: encoded, encoding: "base64" } },
          },
        ],
      },
    });
    expect(capture.scripts[0].text).toBe("var fromBase64 = 1;\n");
  });
});

describe("settleFirefoxCapture", () => {
  test("rewrites the session HAR and records the rea commands", async () => {
    const dir = join(tmpdir(), `logCliFirefox${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "session.har"), JSON.stringify(HAR));
    const calls: string[][] = [];
    const note = await settleFirefoxCapture(dir, async (args) => {
      calls.push(args);
      return { code: 0, stdout: "ok", stderr: "" };
    });
    expect(note).toContain("1 scripts");
    expect(note).toContain("REA network exit 0");
    const saved = JSON.parse(readFileSync(join(dir, "session.har"), "utf8")) as { log: { entries: Array<{ request: { cookies: unknown[] } }> } };
    expect(saved.log.entries[0].request.cookies).toEqual([]);
    expect(readFileSync(join(dir, "scripts", "script0.js"), "utf8")).toContain("var loaded");
    expect(calls[0][0]).toBe("inspect-web-network-capture");
    expect(calls[1][0]).toBe("analyze-javascript-application");
    const manifest = JSON.parse(readFileSync(join(dir, "scripts", "manifest.json"), "utf8")) as { scripts: Array<{ text?: string }> };
    expect(manifest.scripts[0].text).toBeUndefined();
  });

  test("deletes a HAR that is not JSON", async () => {
    const dir = join(tmpdir(), `logCliFirefoxBad${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "session.har"), "not json");
    const note = await settleFirefoxCapture(dir, runner);
    expect(note).toContain("deleted");
    expect(() => readFileSync(join(dir, "session.har"), "utf8")).toThrow();
  });

  test("captureFromHar writes a stripped copy and does not need a browser", async () => {
    const dir = join(tmpdir(), `logCliFirefoxSrc${Date.now()}`);
    const out = join(tmpdir(), `logCliFirefoxOut${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const source = join(dir, "fromFirefox.har");
    writeFileSync(source, JSON.stringify(HAR));
    const note = await captureFromHar(source, out, runner);
    expect(note).toContain("1 scripts");
    expect(readFileSync(source, "utf8")).toContain("c_user=1");
    const written = stripHar(JSON.parse(readFileSync(join(out, "session.har"), "utf8")));
    expect(written.counts.cookies).toBe(0);
    writeFirefoxCapture(out, written);
  });
});

describe("publishSession records the HAR through the existing context", () => {
  test("record_har_path is a new_context argument, and Camoufox is still launched once", () => {
    const text = readFileSync(join(import.meta.dir, "..", "..", "..", "python", "publishSession.py"), "utf8");
    expect(text).toContain('record_har_path');
    expect(text).toContain('record_har_content');
    expect(text).toContain('"embed"');
    expect(text).toContain('record_har_mode');
    expect(text).toContain('"full"');
    expect(text.match(/Camoufox\(/g)?.length).toBe(1);
    expect(text).toContain("Camoufox(**launch_kwargs(");
  });
});
