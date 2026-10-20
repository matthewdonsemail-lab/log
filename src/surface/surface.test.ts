import { describe, expect, test } from "bun:test";
import { COMMANDS } from "../cli/runner/index.ts";
import { catalog, commandEntry, flagsOf, usageLines } from "./catalog/index.ts";
import { diagrams, label, resolverStep } from "./diagrams/index.ts";
import { renderSurface, SURFACE_END, withSurface } from "./readme/index.ts";

describe("catalog", () => {
  test("usage lines lose `Usage:` and the indent under it", () => {
    expect(usageLines("Usage: log a --x\n       log a b [--json]")).toEqual(["log a --x", "log a b [--json]"]);
  });

  test("flags come from the usage, once each, with their value", () => {
    expect(flagsOf("log connect --account <accountName> [--noPrompt] [--wait <seconds>] [--account <a>]")).toEqual([
      { name: "account", value: "accountName" },
      { name: "noPrompt", value: null },
      { name: "wait", value: "seconds" },
    ]);
  });

  test("every command has its usage, flags and MCP tool or terminal-only reason", () => {
    for (const e of catalog(COMMANDS)) {
      expect(e.usage.length).toBeGreaterThan(0);
      expect(e.tool === null).toBe(e.terminalOnly !== null);
    }
    const connect = commandEntry(COMMANDS.find((c) => c.name === "connect")!);
    expect(connect).toMatchObject({ tool: "connect", longRunning: true });
    expect(connect.flags.map((f) => f.name)).toContain("noPrompt");
    expect(connect.hooks).toEqual({ cli: ["PreToolUse", "PostToolUse"], mcp: ["PostToolUse"] });
    expect(commandEntry(COMMANDS.find((c) => c.name === "launch")!)).toMatchObject({ tool: null, hooks: { mcp: [] } });
  });
});

describe("diagrams", () => {
  test("labels hold no raw quote or angle bracket", () => {
    expect(label('a "b" <c>')).toBe("a #quot;b#quot; #lt;c#gt;");
  });

  test("a resolver's edge stops at its first explanation", () => {
    expect(resolverStep("`log inspect do solve --live --account <a>` (2Captcha image solver), then a snapshot")).toBe("log inspect do solve --live --account <a>");
    expect(resolverStep("click Continue: it is plain text")).toBe("click Continue");
  });

  test("four diagrams, each Mermaid", () => {
    const all = diagrams(catalog(COMMANDS), []);
    expect(all.map((d) => d.name)).toEqual(["surface", "commands", "hooks", "pageStates"]);
    for (const d of all) expect(d.mermaid).toMatch(/^(flowchart|sequenceDiagram)/);
  });
});

describe("readme", () => {
  test("the section replaces the old one and is idempotent", () => {
    const entries = catalog(COMMANDS);
    const section = renderSurface(entries, [], diagrams(entries, []));
    expect(section).toContain("| [`log connect`](#log-connect) |");
    expect(section).toContain("```mermaid");
    const first = withSurface("# x\n\nintro\n\n## Twenty\n\nrest\n", section);
    expect(first.indexOf("<!-- surface:start")).toBeLessThan(first.indexOf("## Twenty"));
    expect(withSurface(first, section)).toBe(first);
    expect(first.split(SURFACE_END).length).toBe(2);
  });
});
