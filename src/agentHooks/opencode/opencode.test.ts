import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installOpenCode, mergeConfig, stripJsonc } from "./index.ts";

const command = ["bun", "--cwd", "/home/me/log-cli", "bin", "logMcp.ts"];

function parse(text: string): Record<string, unknown> {
  return JSON.parse(stripJsonc(text)) as Record<string, unknown>;
}

describe("the OpenCode config merge", () => {
  test("a legacy mcp.<server> entry moves under mcp.servers, with log native", () => {
    const got = mergeConfig(
      `{
  // the model stays
  "model": "x/y",
  "mcp": { "log": { "type": "local", "command": ["bun"], "enabled": true }, "other": { "type": "local", "command": ["a"], "enabled": false } }
}`,
      command,
    );
    const parsed = parse(got.text);
    const mcp = parsed.mcp as { servers: Record<string, { codemode?: boolean; disabled?: boolean; enabled?: unknown }>; log?: unknown; other?: unknown };
    expect(mcp.log).toBeUndefined();
    expect(mcp.other).toBeUndefined();
    expect(mcp.servers.log).toMatchObject({ type: "local", codemode: false });
    expect(mcp.servers.other).toMatchObject({ type: "local", disabled: true });
    expect(parsed.model).toBe("x/y");
    expect(got.changed).toBe(true);
  });

  test("a url with // in it survives the comment stripper", () => {
    const parsed = parse(stripJsonc(`{ "provider": { "a": { "options": { "baseURL": "https://api.example.com/v1" } } } }`));
    expect((parsed.provider as { a: { options: { baseURL: string } } }).a.options.baseURL).toBe("https://api.example.com/v1");
  });

  test("running it twice changes nothing the second time", () => {
    const once = mergeConfig(`{ "mcp": { "servers": { "log": { "type": "local", "command": ${JSON.stringify(command)}, "codemode": false } } } }`, command);
    const twice = mergeConfig(once.text, command);
    expect(once.changed).toBe(false);
    expect(twice.changed).toBe(false);
    expect(twice.text).toBe(once.text);
  });

  test("it writes the config and copies the hooks into the harness", () => {
    const dir = mkdtempSync(join(tmpdir(), "opencode-"));
    try {
      const got = installOpenCode(dir);
      expect(got.changed).toBe(true);
      const parsed = parse(readFileSync(got.configPath, "utf8"));
      const mcp = parsed.mcp as { servers: Record<string, { codemode?: boolean }> };
      expect(mcp.servers.log?.codemode).toBe(false);
      expect(got.pluginFiles.some((file) => file.replaceAll("\\", "/").endsWith("logHooks/index.ts"))).toBe(true);
      expect(installOpenCode(dir).changed).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("a config with no mcp section at all gets one", () => {
    const got = mergeConfig(`{ "$schema": "https://opencode.ai/config.json", "model": "a/b" }`, command);
    const mcp = parse(got.text).mcp as { servers: Record<string, unknown> };
    expect(mcp.servers.log).toBeDefined();
  });

  test("a broken config is left alone rather than overwritten with nothing", () => {
    const dir = mkdtempSync(join(tmpdir(), "opencode-bad-"));
    try {
      writeFileSync(join(dir, "opencode.jsonc"), `{ "mcp": { "log": `);
      expect(() => installOpenCode(dir)).toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
