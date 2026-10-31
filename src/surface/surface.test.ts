import { describe, expect, test } from "bun:test";
import { COMMANDS } from "../cli/runner/index.ts";
import { catalog, commandEntry, flagsOf, usageLines } from "./catalog/index.ts";
import { PLATFORM_LABELS, PLATFORMS } from "../cli/runner/helpers/platforms.ts";
import { browsersDiagram, diagrams, label, platformsDiagram, resolverStep } from "./diagrams/index.ts";
import { renderSurface, SURFACE_END, withSurface } from "./readme/index.ts";

describe("catalog", () => {
  test("usage lines lose `Usage:` and the indent under it", () => {
    expect(usageLines("Usage: log a --x\n       log a b [--json]")).toEqual(["log a --x", "log a b [--json]"]);
  });

  test("flags come from the usage, once each, with their value", () => {
    expect(flagsOf("log facebook connect --account <accountName> [--noPrompt] [--wait <seconds>] [--account <a>]")).toEqual([
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
    expect(commandEntry(COMMANDS.find((c) => c.name === "launch")!)).toMatchObject({ tool: null, hooks: { mcp: [] }, browser: "none" });
    expect(commandEntry(COMMANDS.find((c) => c.name === "warmup")!).browser).toBe("accountBrowser");
    expect(commandEntry(COMMANDS.find((c) => c.name === "join")!).browser).toBe("accountBrowser");
    expect(connect.browser).toBe("camoufoxOnly");
  });
});

describe("diagrams", () => {
  test("labels hold no raw quote, angle bracket or semicolon (a `;` ends a Mermaid statement)", () => {
    expect(label('a "b" <c>')).toBe("a #quot;b#quot; #lt;c#gt;");
    expect(label("refused; run it live")).toBe("refused#59; run it live");
  });

  test("the browser layer names every driver and each command's browser", () => {
    const d = browsersDiagram(catalog(COMMANDS));
    expect(d.mermaid).toContain('d_adsPower["adsPower"]');
    expect(d.mermaid).toContain('d_camoufox["camoufox"]');
    expect(d.mermaid).toMatch(/On the account's browser: [^"]*inspect/);
    expect(d.mermaid).toMatch(/Camoufox only, not on the driver yet: [^"]*publish/);
  });

  test("a resolver's edge stops at its first explanation", () => {
    expect(resolverStep("`log inspect do solve --live --account <a>` (2Captcha image solver), then a snapshot")).toBe("log inspect do solve --live --account <a>");
    expect(resolverStep("click Continue: it is plain text")).toBe("click Continue");
  });

  test("six diagrams, each Mermaid", () => {
    const all = diagrams(catalog(COMMANDS), []);
    expect(all.map((d) => d.name)).toEqual(["platforms", "browsers", "surface", "commands", "hooks", "pageStates"]);
    for (const d of all) expect(d.mermaid).toMatch(/^(flowchart|sequenceDiagram)/);
  });

  test("the platforms diagram has every platform, its direct-API client and its browser path", () => {
    const d = platformsDiagram(catalog(COMMANDS)).mermaid;
    for (const p of PLATFORMS) expect(d).toContain(`p_${p}["${PLATFORM_LABELS[p]} (`);
    for (const lib of ["fbk", "twikit", "rdvwr"]) expect(d).toContain(`e_${lib}["${lib} (vendor/${lib})`);
    expect(d).toContain("nob_twitter");
    expect(d).toMatch(/b_reddit\["Reddit's browser path: no proxy/);
    expect(d).toMatch(/b_facebook\["Facebook's browser path: its proxy/);
  });

  test("the commands diagram gives each platform's command its own node, grouped by platform", () => {
    const d = diagrams(catalog(COMMANDS), []).find((x) => x.name === "commands")!.mermaid;
    expect(d).toContain('c_twitterSession["session"]');
    expect(d).toContain('c_redditSession["session"]');
    expect(d).toContain('subgraph g_reddit["Reddit"]');
    const ids = [...d.matchAll(/^\s+(c_\w+)\[/gm)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("the surface diagram sends commands to the direct-API engine or the browser", () => {
    const d = diagrams(catalog(COMMANDS), []).find((x) => x.name === "surface")!.mermaid;
    expect(d).toContain("engine -->|direct API| direct");
    expect(d).toContain("engine -->|browser| browser");
    expect(d).toMatch(/Direct-API engine: [^"]*rdvwr/);
  });
});

describe("readme", () => {
  test("the section replaces the old one and is idempotent", () => {
    const entries = catalog(COMMANDS);
    const section = renderSurface(entries, [], diagrams(entries, []));
    expect(section).toContain("| [`log facebook connect`](#log-facebook-connect) |");
    expect(section).toContain("```mermaid");
    expect(section).toContain("### The platforms");
    expect(section).toContain("Reddit through rdvwr (`vendor/rdvwr`)");
    expect(section).toContain("- `log reddit session`: the direct-API engine only (rdvwr, vendored in vendor/rdvwr");
    expect(section).not.toContain("is the first platform");
    const first = withSurface("# x\n\nintro\n\n## Twenty\n\nrest\n", section);
    expect(first.indexOf("<!-- surface:start")).toBeLessThan(first.indexOf("## Twenty"));
    expect(withSurface(first, section)).toBe(first);
    expect(first.split(SURFACE_END).length).toBe(2);
  });
});
