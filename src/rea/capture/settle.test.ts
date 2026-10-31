import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { captureFromHar, settleCapture } from "./index";
import { exportScripts, renderStepSummary, summarizeStep } from "./helpers/index";
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

describe("exportScripts", () => {
  test("keeps the HAR raw and copies the script out", () => {
    const capture = exportScripts(HAR);
    expect(capture.entries).toBe(2);
    expect(capture.scripts).toHaveLength(1);
    expect(capture.scripts[0].text).toBe("var loaded = true;\n");
    expect(capture.scripts[0].file).toBe("script0.js");
    expect(capture.har).toEqual(HAR);
    expect(JSON.stringify(capture.har)).toContain("c_user=1");
    expect(JSON.stringify(capture.har)).toContain("fb_dtsg=secret");
  });

  test("decodes a base64 script body", () => {
    const encoded = Buffer.from("var fromBase64 = 1;\n", "utf8").toString("base64");
    const capture = exportScripts({
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

describe("settleCapture", () => {
  test("leaves the session HAR as written and records the rea commands", async () => {
    const dir = join(tmpdir(), `logCliFirefox${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const written = JSON.stringify(HAR);
    writeFileSync(join(dir, "session.har"), written);
    const calls: string[][] = [];
    const note = await settleCapture(dir, async (args) => {
      calls.push(args);
      return { code: 0, stdout: "ok", stderr: "" };
    });
    expect(note).toContain("2 requests, 1 scripts, raw HAR kept");
    expect(note).toContain("REA network exit 0");
    expect(readFileSync(join(dir, "session.har"), "utf8")).toBe(written);
    expect(readFileSync(join(dir, "scripts", "script0.js"), "utf8")).toContain("var loaded");
    expect(calls[0].slice(0, 1).concat(calls[0].slice(2))).toEqual(["inspect-web-network-capture", "har", "--format", "json"]);
    expect(calls).toHaveLength(1);
    expect(note).toContain("1 scripts saved");
    expect(existsSync(join(dir, "scripts", "manifest.json"))).toBe(false);
    const manifest = JSON.parse(readFileSync(join(dir, "scriptsManifest.json"), "utf8")) as { scripts: Array<{ text?: string }> };
    expect(manifest.scripts[0].text).toBeUndefined();
  });

  test("keeps a HAR that is not JSON and does not run rea", async () => {
    const dir = join(tmpdir(), `logCliFirefoxBad${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "session.har"), "not json");
    const calls: string[][] = [];
    const note = await settleCapture(dir, async (args) => {
      calls.push(args);
      return { code: 0, stdout: "", stderr: "" };
    });
    expect(note).toContain("not JSON");
    expect(readFileSync(join(dir, "session.har"), "utf8")).toBe("not json");
    expect(calls).toHaveLength(0);
  });

  test("captureFromHar copies the HAR unchanged and does not need a browser", async () => {
    const dir = join(tmpdir(), `logCliFirefoxSrc${Date.now()}`);
    const out = join(tmpdir(), `logCliFirefoxOut${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const source = join(dir, "fromFirefox.har");
    writeFileSync(source, JSON.stringify(HAR));
    const note = await captureFromHar(source, out, runner);
    expect(note).toContain("1 scripts");
    expect(readFileSync(join(out, "session.har"), "utf8")).toBe(readFileSync(source, "utf8"));
  });
});

describe("publishSession records the HAR through the existing context", () => {
  test("record_har_path is a new_context argument, and Camoufox is still launched once", () => {
    const text = readFileSync(join(import.meta.dir, "..", "..", "..", "python", "session", "publishSession.py"), "utf8");
    expect(text).toContain('record_har_path');
    expect(text).toContain('record_har_content');
    expect(text).toContain('"embed"');
    expect(text).toContain('record_har_mode');
    expect(text).toContain('"full"');
    expect(text.match(/Camoufox\(/g)?.length).toBe(1);
    expect(text).toContain("Camoufox(**launch_kwargs(");
  });
});

describe("summarizeStep", () => {
  test("names Facebook's GraphQL operations, uploads and failures, never values", () => {
    const step = {
      log: {
        entries: [
          { request: { method: "POST", url: "https://www.facebook.com/api/graphql/", headers: [{ name: "X-FB-Friendly-Name", value: "useUFACSubmitActionMutation" }], postData: { text: "fb_dtsg=secretToken" } }, response: { status: 200, content: { mimeType: "application/json" } } },
          { request: { method: "POST", url: "https://www.facebook.com/api/graphql/", headers: [], postData: { text: "a=1&fb_api_req_friendly_name=useMarketplaceComposerAttributesQuery&fb_dtsg=x" } }, response: { status: 200, content: {} } },
          { request: { method: "POST", url: "https://upload.facebook.com/ajax/react_composer/attachments/photo/upload", headers: [] }, response: { status: 200, content: {} } },
          { request: { method: "GET", url: "https://www.facebook.com/ajax/bz", headers: [] }, response: { status: -1, content: {} } },
        ],
      },
    };
    const summary = summarizeStep(step);
    expect(summary).toMatchObject({ requests: 4, uploads: 1, graphql: { useUFACSubmitActionMutation: 1, useMarketplaceComposerAttributesQuery: 1 }, failed: { "-1 www.facebook.com/ajax/bz": 1 } });
    const text = renderStepSummary(3, "Text captcha: clicked Continue.", summary, "ev_1");
    expect(text).toContain("`useUFACSubmitActionMutation`");
    expect(text).toContain("rea `ev_1`");
    expect(text).not.toContain("secretToken");
  });
});
